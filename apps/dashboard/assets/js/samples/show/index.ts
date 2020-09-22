import JSONEditor from 'jsoneditor';
import * as JSONFormatter from 'json-formatter-js';

// create the editor
const container = document.getElementById("metadata-editor")
const editor = new JSONEditor(container, {
    mode: 'tree',
    mainMenuBar: false,
    statusBar: false,
    onValidate: function (json) {
        const errors = []
        if (json.sex != null && !~["F", "M"].indexOf(json.sex)) {
            errors.push({path: ["sex"], message: "sex: Must be either 'F' or 'M'"});
        }
        return errors;
    }
});
const initialMetadata = document.getElementById("metadata-info");
if (initialMetadata) {
    const content = JSON.parse(initialMetadata.innerHTML);
    editor.set(content)
}

const createDownloadPrompt = (function () {
    const a = document.createElement("a");
    document.body.appendChild(a);
    return function (blob: Blob, fileName: string) {
        //const blob = new Blob([data], {type: "octet/stream"}),
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

document.getElementById('export-metadata').addEventListener('click', () => {
    // Save Dialog
    let fname = window.prompt("Export as...")

    // Check json extension in file name
    if (fname.indexOf(".") === -1) {
        fname = fname + ".json"
    } else {
        if (fname.split('.').pop().toLowerCase() === "json") {
            // Nothing to do
        } else {
            fname = fname.split('.')[0] + ".json"
        }
    }
    const blob = new Blob([editor.getText()], {type: 'application/json;charset=utf-8'})
    createDownloadPrompt(blob, fname)
});


document.getElementById('save-metadata').addEventListener('click', () => {
    const json = JSON.parse(editor.getText());

    postData("/api/v1" + window.location.pathname + "/metadata", json)
    .then(({status}) => {
        if(status == 201 || status == 200) {
            console.info("hmmmmmm");
            window.location.reload();
        }
    });
});

async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response;
}

