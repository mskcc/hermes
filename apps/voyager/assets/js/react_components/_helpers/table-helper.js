import React from 'react';
import { Field, getIn } from 'formik';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import dompurify from 'dompurify';
import red from '@material-ui/core/colors/red';
import green from '@material-ui/core/colors/green';
import * as Yup from 'yup';
import {
    convertToTitleCase,
    convertStrToNumList,
    convertStrToStrList,
    convertStrToBool,
} from '@/_helpers';
const { DateTime } = require('luxon');
const diff = require('diff');

const useStyles = makeStyles(() => ({
    editField: {
        width: '100%',
    },
}));

const yupErrorMessage = (value, type, extra = '') => {
    const errorMessage = `${value} is not a valid ${type}`;
    if (extra) {
        return `${errorMessage}, ${extra}`;
    }
    return errorMessage;
};

const validationTypes = {
    email: Yup.string().email(({ value }) => yupErrorMessage(value, 'email')),
    number: Yup.string().test('numberTest', '', function (value) {
        const { path, createError } = this;
        if (!value) {
            return true;
        }
        if (isNaN(value)) {
            return createError({
                path,
                message: yupErrorMessage(value, 'number'),
            });
        }
        return true;
    }),
    bool: Yup.boolean().typeError(({ value }) =>
        yupErrorMessage(value, 'boolean', 'please use either true or false')
    ),
    year: Yup.string().test('yearTest', '', function (value) {
        const { path, createError } = this;
        if (!value) {
            return true;
        }
        if (!DateTime.fromFormat(value, 'yyyy').isValid) {
            return createError({
                path,
                message: yupErrorMessage(value, 'year', 'Please use the yyyy format'),
            });
        }
        return true;
    }),
    date: Yup.string().test('dateTest', '', function (value) {
        const { path, createError } = this;
        if (!value) {
            return true;
        }
        if (!DateTime.fromFormat(value, 'yyyy-mm-dd').isValid) {
            return createError({
                path,
                message: yupErrorMessage(value, 'date', 'please use the yyyy-mm-dd format'),
            });
        }
        return true;
    }),
    numberList: Yup.array()
        .transform(function (value, originalValue) {
            if (this.isType(value) && value !== null) {
                return value;
            }
            return originalValue ? originalValue.split(/[\s,]+/) : [];
        })
        .of(
            Yup.string().test('numberTest', '', function (value) {
                const { path, createError } = this;
                if (!value) {
                    return true;
                }
                if (isNaN(value)) {
                    return createError({
                        path,
                        message: yupErrorMessage(value, 'number'),
                    });
                }
                return true;
            })
        ),
    emailList: Yup.array()
        .transform(function (value, originalValue) {
            if (this.isType(value) && value !== null) {
                return value;
            }
            return originalValue ? originalValue.split(/[\s,]+/) : [];
        })
        .of(Yup.string().email(({ value }) => yupErrorMessage(value, 'email'))),
};

export function createYupValidation(keyValidationDict) {
    let yupValidationObj = {};
    for (const [singleKey, singleValue] of Object.entries(keyValidationDict)) {
        const titleCaseKey = convertToTitleCase(singleKey);
        if (singleValue in validationTypes) {
            yupValidationObj[titleCaseKey] = validationTypes[singleValue];
        }
    }

    return yupValidationObj;
}

export function deserialize(value, validation_type) {
    if (validation_type == 'number' || validation_type == 'year') {
        return parseFloat(value);
    }
    if (validation_type == 'bool') {
        return convertStrToBool(value);
    }
    if (validation_type == 'numberList') {
        return convertStrToNumList(value);
    }
    if (validation_type == 'emailList') {
        return convertStrToStrList(value);
    }

    return value;
}

export function setupTable(dictList, columnWidth, sortKey, ignoreList = [], columnSort = {}) {
    let column = [];
    let titleToField = {};

    if (dictList && dictList.length > 0) {
        for (const singleKey of Object.keys(dictList[0])) {
            const titleCase = convertToTitleCase(singleKey);
            titleToField[titleCase] = singleKey;
            let columnObj = {
                title: titleCase,
                field: singleKey,
            };
            if (ignoreList.includes(singleKey)) {
                columnObj['hidden'] = true;
            }
            if (singleKey in columnWidth) {
                columnObj['width'] = columnWidth[singleKey];
            }
            column.push(columnObj);
        }
    }

    const sortedColumn = column.sort((firstElem, secondElem) => {
        const firstElemField = firstElem['field'];
        const secondElemFiled = secondElem['field'];
        if (firstElemField in columnSort && secondElemFiled in columnSort) {
            return columnSort[firstElemField] - columnSort[secondElemFiled];
        } else if (firstElemField in columnSort) {
            return -1;
        } else if (secondElemFiled in columnSort) {
            return 1;
        } else {
            return 0;
        }
    });

    const sortedTableData = dictList.sort((a, b) => a[sortKey].localeCompare(b[sortKey]));

    return {
        tableData: sortedTableData,
        tableColumn: sortedColumn,
        tableTitleToField: titleToField,
    };
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
                    rowData[value_key] = value.toString();
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
        const diffChars = diff.diffChars(String(initial), String(currentChange));
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
                const { name } = field;
                const { errors, setFieldValue } = form;
                const showError = !!getIn(errors, name);
                let helperText = null;
                if (errors[name]) {
                    //let field_key = name.replace('value', 'field');
                    if (Array.isArray(errors[name])) {
                        const filteredErrors = errors[name].filter((x) => x);
                        helperText = filteredErrors.join(', ');
                    } else {
                        helperText = String(errors[name]);
                    }

                    //let field_value = form.values[field_key];
                    //helperText = helperText.replace(name, field_value);
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
