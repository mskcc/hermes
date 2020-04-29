import JSONEditor from 'jsoneditor';

// create the editor
const container = document.getElementById("metadata-editor")
const editor = new JSONEditor(container, {});
const content = JSON.parse(document.getElementById("metadata-info").innerHTML);

console.info(content);
editor.set(content)

// get json
const updatedJson = editor.get()
