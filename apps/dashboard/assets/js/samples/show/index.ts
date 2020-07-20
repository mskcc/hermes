import JSONEditor from 'jsoneditor';
import * as JSONFormatter from 'json-formatter-js'

// create the editor
const container = document.getElementById("metadata-editor")
const editor = new JSONEditor(container, {mode: 'tree', mainMenuBar: false, statusBar: false});
const content = JSON.parse(document.getElementById("metadata-info").innerHTML);

editor.set(content)
