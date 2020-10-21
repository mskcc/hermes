import React from 'react';
import { Formik, Field, getIn } from 'formik';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import * as diff from 'diff';
import dompurify from 'dompurify';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';

const useStyles = makeStyles(() => ({
    editField: {
        width: '100%',
    },
}));

export function convertToTitleCase(lowerCamelCase) {
    let addSpaces = lowerCamelCase.replace(/([A-Z])/g, ' $1');
    let titleCase = addSpaces.charAt(0).toUpperCase() + addSpaces.slice(1);
    titleCase = titleCase.trim();
    if (titleCase === 'Cf D N A2d Barcode') {
        titleCase = 'Cf DNA 2d Barcode';
    } else if (titleCase === 'Cmo Sample Name') {
        titleCase = 'CMO Sample Name';
    } else if (titleCase === 'Pi Email') {
        titleCase = 'PI Email';
    }
    return titleCase;
}

export function setupTable(dictList, columnWidth, sortKey) {
    let column = [];
    let titleToField = {};
    if (dictList) {
        for (const singleKey of Object.keys(dictList[0])) {
            const titleCase = convertToTitleCase(singleKey);
            titleToField[titleCase] = singleKey;
            let columnObj = {
                title: titleCase,
                field: singleKey,
            };
            if (titleCase in columnWidth) {
                columnObj['width'] = columnWidth[titleCase];
            }
            column.push(columnObj);
        }
    }

    const sortedTableData = dictList.sort((a, b) => a[sortKey].localeCompare(b[sortKey]));

    return { tableData: sortedTableData, tableColumn: column, tableTitleToField: titleToField };
}

export function setupDictTable(dict, keyList, numColumn, fieldBackgroundColor, fieldColor, sort) {
    let data = [];
    let keys = [];
    let column = [];
    let titleToField = {};
    for (let i = 0; i < numColumn; i++) {
        let currentField = 'field' + i.toString();
        column.push({
            title: 'Field',
            field: currentField,
            editable: 'never',
            cellStyle: {
                backgroundColor: fieldBackgroundColor,
                color: fieldColor,
            },
        });
        column.push({
            title: 'Value',
            field: 'value' + i.toString(),
            editComponent: editComponent,
        });
    }
    if (dict) {
        let rowData = {};
        let currentCol = 0;
        let dictList = [];
        for (let [key, value] of Object.entries(dict)) {
            const titleCase = convertToTitleCase(key);
            titleToField[titleCase] = key;
            if (value === null) {
                value = '';
            }
            dictList.push({ key: key, value: value, title: titleCase });
        }
        if (sort) {
            dictList = dictList.sort((a, b) => a['title'].localeCompare(b['title']));
        }
        for (const { key, value, title } of dictList) {
            if (keyList.includes(key)) {
                if (!keys.includes(key)) {
                    let field_key = 'field' + currentCol.toString();
                    let value_key = 'value' + currentCol.toString();

                    rowData[field_key] = title;
                    rowData[value_key] = value;
                    keys.push(key);
                    currentCol++;
                    if (currentCol === numColumn) {
                        currentCol = 0;
                        data.push(rowData);
                        rowData = {};
                    }
                }
            }
        }
        if (Object.keys(rowData).length !== 0) {
            data.push(rowData);
        }
    }
    return { data: data, keys: keys, column: column, titleToField: titleToField };
}

export function addTableValidation(data, validationDict) {
    let rowSchema = {};
    if (data) {
        for (let i = 0; i < Object.keys(data).length / 2; i++) {
            let field_key = 'field' + i.toString();
            let value_key = 'value' + i.toString();
            if (field_key in data) {
                let field_value = data[field_key];
                if (field_value in validationDict) {
                    rowSchema[value_key] = validationDict[field_value];
                }
            }
        }
    }

    return rowSchema;
}

export function setupChangesTable(dict) {
    let data = [];
    const column = [
        { title: 'Field', field: 'field' },
        { title: 'Current', field: 'current', render: (rowData) => renderCol(rowData, 'current') },
        { title: 'Updated', field: 'updated', render: (rowData) => renderCol(rowData, 'updated') },
    ];

    for (const singleKey of Object.keys(dict)) {
        const currentChangeObj = dict[singleKey];
        let initial = currentChangeObj['initial'];
        let currentChange = currentChangeObj['current'];
        if (initial === null) {
            initial = '';
        }
        if (currentChange === null) {
            currentChange = '';
        }
        const diffChars = diff.diffChars(initial, currentChange);
        let initial_html = '';
        let updated_html = '';
        for (let i = 0; i < Object.keys(diffChars).length; i++) {
            if (i in diffChars) {
                const singleWord = diffChars[i];
                if (singleWord.added) {
                    updated_html +=
                        '<ins style="color: ' + green[500] + '">' + singleWord.value + '</ins>';
                } else if (singleWord.removed) {
                    initial_html +=
                        '<del style="color: ' + red[500] + '">' + singleWord.value + '</del>';
                } else {
                    updated_html += singleWord.value;
                    initial_html += singleWord.value;
                }
            }
        }

        data.push({
            field: singleKey,
            updated: updated_html,
            current: initial_html,
        });
    }
    return { data: data, column: column };
}

export function recordChanges(oldData, newData, currentChanges, titleToField) {
    if (oldData) {
        for (const singleKey of Object.keys(oldData)) {
            if (singleKey !== 'tableData') {
                if (oldData[singleKey] !== newData[singleKey]) {
                    let field_key = singleKey.replace('value', 'field');
                    let field_value = newData[field_key];
                    if (field_value in currentChanges) {
                        currentChanges[field_value]['current'] = newData[singleKey];
                    } else {
                        currentChanges[field_value] = {
                            current: newData[singleKey],
                            initial: oldData[singleKey],
                            field: titleToField[field_value],
                        };
                    }
                    if (
                        currentChanges[field_value]['current'] ===
                        currentChanges[field_value]['initial']
                    ) {
                        delete currentChanges[field_value];
                    }
                }
            }
        }
    }

    return currentChanges;
}

export function editObj(newData, dataObj, titleToField) {
    let newDataObj = { ...dataObj };
    if (newData) {
        for (const singleKey of Object.keys(newData)) {
            if (singleKey.includes('value')) {
                const title_key = singleKey.replace('value', 'field');
                const title_value = newData[title_key];
                const field_value = titleToField[title_value];
                newDataObj[field_value] = newData[singleKey];
            }
        }
    }

    return newDataObj;
}

function editComponent(props) {
    const classes = useStyles();
    return (
        <Field name={props.columnDef.field}>
            {({ field, form }) => {
                const { name, value } = field;
                const { errors, setFieldValue } = form;
                const showError = !!getIn(errors, name);
                let helperText = null;
                console.log(value);
                if (errors[name]) {
                    let field_key = name.replace('value', 'field');
                    helperText = errors[name];
                    let field_value = form.values[field_key];
                    helperText = helperText.replace(name, field_value);
                }
                return (
                    <TextField
                        {...field}
                        error={showError}
                        className={classes.editField}
                        onChange={(event) => setFieldValue(name, event.target.value)}
                        helperText={helperText}
                    />
                );
            }}
        </Field>
    );
}

function renderCol(rowData, currentField) {
    const sanitizer = dompurify.sanitize;
    return <div dangerouslySetInnerHTML={{ __html: sanitizer(rowData[currentField]) }} />;
}
