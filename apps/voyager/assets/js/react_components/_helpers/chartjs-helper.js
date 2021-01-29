import * as palette from 'google-palette';

export function getColors(dataSize) {
    if (dataSize) {
        let chartJsColors = [];
        const colorList = palette('mpn65', dataSize);
        for (const singleColor of colorList) {
            chartJsColors.push('#' + singleColor);
        }
        return chartJsColors;
    }
}

export function convertDictToPieData({ dataDict = null, colorDict = null } = {}) {
    let chartDataObj = { data: {}, backgroundColor: [] };
    if (dataDict) {
        let dataList = [];
        let labelList = [];
        let colorList = [];
        let combinedList = [];

        for (const [key, value] of Object.entries(dataDict)) {
            if (colorDict) {
                combinedList.push({ data: value, label: key, color: colorDict[key] });
            } else {
                combinedList.push({ data: value, label: key, color: null });
            }
        }
        combinedList.sort(function (a, b) {
            if (a.data < b.data) {
                return 1;
            } else if (a.data > b.data) {
                return -1;
            } else {
                return 0;
            }
        });

        for (const { data, label, color } of combinedList) {
            dataList.push(data);
            labelList.push(label);
            if (color) {
                colorList.push(color);
            }
        }

        if (colorList.length === 0) {
            colorList = getColors(labelList.length);
        }
        chartDataObj['data'] = {
            datasets: [
                {
                    data: dataList,
                    backgroundColor: colorList,
                },
            ],
            labels: labelList,
        };
    }

    return chartDataObj;
}
