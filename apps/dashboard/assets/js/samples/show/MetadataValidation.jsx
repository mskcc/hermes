import * as Yup from 'yup';
export const REQUEST_VALIDATION = {
    'Investigator Email': Yup.string().email(),
    'Data Analyst Email': Yup.string().email(),
    'PI Email': Yup.string().email(),
    'Lab Head Email': Yup.string().email(),
};
