// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.scss"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative paths, for example:
// import socket from "./socket"

/* Choice.js Start */
import Choices from "choices.js"
import debounce from "lodash/debounce"
import throttle from "lodash/throttle"
const select = document.querySelectorAll(`select[data-url]`);
select.forEach(elem => {
    const choice = new Choices(elem);
    const url = elem.getAttribute("data-url");

    const searchCallback = function(event) {
        console.info(10000)
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

/* Modal Start */
document.querySelectorAll(".modal-button").forEach(m => m.addEventListener("click", (e) => {
    const modalId = e.target.dataset.modalId;
    const modal = document.getElementById(modalId);
    modal.classList.add("is-active");
})); 

document.querySelectorAll(".modal-close").forEach(m => m.addEventListener("click", (e) => {
    e.target.parentElement.classList.remove("is-active");
}));
document.querySelectorAll(".modal-background").forEach(m => m.addEventListener("click", (e) => {
    e.target.parentElement.classList.remove("is-active");
}));
/* Modal End */
