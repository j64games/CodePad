import {PositionListener} from "../../src/static/parser.js";
import {setupMonaco} from "../../src/static/monaco.js";
import {setupInput, update} from "../../src/static/inputHandler.js";

setupMonaco();
setupInput();
requestAnimationFrame(update);
// document.addEventListener("DOMContentLoaded", function () {
//
// });
