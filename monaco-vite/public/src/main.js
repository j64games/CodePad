import {PositionListener} from "../../src/static/parser.js";
import {setupMonaco} from "../../src/static/monaco.js";
import {setupInput, update} from "../../src/static/inputHandler.js";

console.log("this was called in index!");
setupMonaco();
console.log("yea");
setupInput();
requestAnimationFrame(update);
console.log("hallo from main in domloaded");
// document.addEventListener("DOMContentLoaded", function () {
//
// });
