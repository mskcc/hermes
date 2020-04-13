import JSONEditor from 'jsoneditor';

// create the editor
const container = document.getElementById("meta-data-editor")
const options = {}
const editor = new JSONEditor(container, options)

// set json
const initialJson = {
    "igoId": "06302_AH_9",
    "cmoSampleName": "C-VEPUT8-L001-d",
    "sampleName": "MSK-MB-0051-CF3-msk5000492c-p",
    "cmoSampleClass": "Unknown Tumor",
    "cmoPatientId": "C-VEPUT8",
    "investigatorSampleId": "MSK-MB-0051-CF3-msk5000492c-p",
    "oncoTreeCode": "BREAST",
    "tumorOrNormal": "Tumor",
    "tissueLocation": "",
    "specimenType": "cfDNA",
    "sampleOrigin": "Whole Blood",
    "preservation": "EDTA-Streck",
    "collectionYear": "",
    "sex": "F",
    "species": "Human",
    "cfDNA2dBarcode": "8038573943",
}
editor.set(initialJson)

// get json
const updatedJson = editor.get()
