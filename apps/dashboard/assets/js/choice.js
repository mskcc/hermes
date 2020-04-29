/* Choice.js Start */
import Choices from "choices.js"
import debounce from "lodash/debounce"
import throttle from "lodash/throttle"
export default (elems) => {
    // const select = document.querySelectorAll(`select[data-url]`);
    elems.forEach(elem => {
        const choice = new Choices(elem);
        const url = elem.getAttribute("data-url");

        const searchCallback = function(event) {
            if(event.detail.value) {
                choice.setChoices((callback) => {
                    return fetch(`${url}?q=${event.detail.value}`)
                        .then(resp => resp.json())
                        .then(resp => resp.data.map(item => ({value: item.id, label: item.name})))
                }, 'value', 'label', true);
            }
        };
        elem.addEventListener('search', throttle(searchCallback, 1000));
    });
    /* Charge.js End */
};
