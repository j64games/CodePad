// import {touch_suggestion_type, touch_suggestions} from "./suggestions.js";
import * as monaco from "monaco-editor";
import {getWidgetVisibility} from "./common.js";

const touch_suggestions = [
    {label: "touch(Grass)", type: "touch"},
    {label: "touch(Cow)", type: "touch"},
    {label: "touch(Rock)", type: "touch"},
    {label: "touch(Human)", type: "touch"},
    {label: "sleep()", type: "function"},
    {label: "hit(Human)", type: "function"},
    {label: "hit(self)", type: "function"},
];

let touch_suggestion_type = "touch";

let option_selected = false;
let selected_option = null;

const MovementConfig = {
    initialDelay: 300,
    minDelay: 25, //currentDelay is max(minDelay, currentDelay * acceleration)
    acceleration: 0.85, //inverse relation!
    deadzone: 0.2
};

let movementState = {
    horizontal: {
        active: false,
        direction: 0,
        lastMoveTime: 0,
        currentDelay: MovementConfig.initialDelay
    },
    vertical: {
        active: false,
        direction: 0,
        lastMoveTime: 0,
        currentDelay: MovementConfig.initialDelay
    }
};

let isUndoTriggered = false;
let isRedoTriggered = false;
const TRIGGER_THRESHOLD = 0.95;

// Example: Send data to C++ backend
// function sendToCpp(data) {
//     console.log("From js, called sendToCpp");
//     window.sendToMonaco(data).then(response => {
//         console.log("Response from C++:", response);
//     });
// }

function getWordAtPosition(model, position) {
    const lineContent = model.getLineContent(position.lineNumber);

    let col = position.column - 1;

    if(lineContent[col] === " "){
        return false;
    }
    // Define delimiters (whitespace, parentheses, commas, etc.)
    const delimiters = [" ", "(", ")", "{", "}", "[", "]", ",", ";", "."];

    // Find the end of the word
    let end = col;
    while (end <= lineContent.length && !delimiters.includes(lineContent[end - 1])) {
        end++;
    }

    // Find the start of the word
    let start = col;
    while (start >= 0 && !delimiters.includes(lineContent[start - 1])) {
        start--;
    }
    // console.log("this is the return value:Q", lineContent.substring(start, end -1));
    if (delimiters.includes(lineContent.substring(start, end - 1)) ) {
        return false;
    }
    return [start, end - 1];
}

let currentDecorations = [];
let lastHighlightedWord = "";
export function getLastHighlightedWord(){
    console.log("this is the last word in func: ", lastHighlightedWord);
    return lastHighlightedWord;
}
let isSelectionBoxFocused = true;
let selectedIndex = 0;
let buttonStates = new Array(17).fill(false);


export const operators = ["==", "!=", ">", "<", ">=", "<=", "&&", "||", "+", "-", "*", "/", "%", "="];
function highlightCursorWord() {
    const model = window.editor.getModel();
    if (!model) return;

    const position = window.editor.getPosition();
    const lineContent = model.getLineContent(position.lineNumber);

    // **If the line is a comment, clear highlight and return**
    //TODO include comment after code
    if (lineContent.trimStart().startsWith("//")) {
        clearHighlight();
        return;
    }

    // Detect words
    const wordPosInfo = getWordAtPosition(model, position);
    let word = lineContent.substring(wordPosInfo[0], wordPosInfo[1]);

    if (!word) {
        clearHighlight();
        return;
    }

    if (word === lastHighlightedWord) return; // Skip redundant updates

    lastHighlightedWord = word;
    console.log("the last highlighted word is this: ", lastHighlightedWord);
    // Highlight the detected word or operator
    const startColumn = wordPosInfo[0];
    const endColumn = wordPosInfo[1];

    const newDecoration = [
        { // + 1 because monaco col starts at 1
            range: new monaco.Range(position.lineNumber, startColumn + 1, position.lineNumber, endColumn + 1),
            options: { inlineClassName: "highlighted-word" }
        }
    ];
    currentDecorations = window.editor.deltaDecorations(currentDecorations, newDecoration);
    console.log("this is the last word:", lastHighlightedWord);
    console.log("this is the last word func: ", lastHighlightedWord);
    // console.log("The last word ", lastHighlightedWord);
}

function clearHighlight() {
    if (lastHighlightedWord !== "") {
        console.log("the WORD was CLEARED");
        const newDecoration = [];
        currentDecorations = window.editor.deltaDecorations(currentDecorations, newDecoration);
        lastHighlightedWord = "";
    }
}


// Get references to the overlay and word list
const selectionBox = document.getElementById("selection-box");

function updateSelectionBox() {
    const items = selectionBox.querySelectorAll('.selection-item');
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
    });
}

// Function to show the overlay
function showOverlay() {
    selectionBox.style.display = "flex"; // Ensure it's visible
    isSelectionBoxFocused = true;
    updateSelectionBox();
}

// Function to hide the overlay
function hideOverlay() {
    selectionBox.style.display = "none";
    isSelectionBoxFocused = false;
}

function addIfStatement() {
    //TODO always add to a new line + have the correct amount of tabs
    const editor = window.editor;
    const position = editor.getPosition();
    const textToInsert = `if() {\n\t\n\t}`;

    editor.executeEdits('add-if', [{
        range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        },
        text: textToInsert,
    }]);

    // Move cursor inside the parentheses
    const newLine = position.lineNumber;
    const newColumn = 4; // Position after '('
    editor.setPosition({ lineNumber: newLine, column: newColumn });
    editor.focus();
    // Trigger suggestions
    editor.trigger('custom1', 'editor.action.triggerSuggest', {});
}

function updateInnerBox(text) {
    const innerBox = document.querySelector('.inner-box');

    if (text.trim() !== "") {
        innerBox.style.display = "flex"; // Show the box
        innerBox.textContent = text; // Insert text
    } else {
        innerBox.style.display = "none"; // Hide if empty
    }
}

function addNewLine(){
    const position = window.editor.getPosition(); // Get current cursor position

    // Define new line text and position
    const newLineText = "\n";
    const newPosition = new monaco.Position(position.lineNumber + 1, 1);

    // Insert new line at current position
    window.editor.executeEdits(null, [{
        range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
        text: newLineText,
        forceMoveMarkers: true
    }]);

    // Move cursor to the new line
    window.editor.setPosition(newPosition);
}

function handleButtonPress(buttonIndex) {

    console.log("we came here for some reason!");

    if (isSelectionBoxFocused) {
        switch (buttonIndex) {
            case 15: // right
                selectedIndex = selectedIndex !== selectionBox.children.length - 1 ? selectedIndex + 1: 0;
                updateSelectionBox();
                break;
            case 14: // left
                selectedIndex = selectedIndex !== 0 ? selectedIndex - 1: selectionBox.children.length - 1;
                updateSelectionBox();
                break;
            case 0: // A (Select)
                selected_option = selectedIndex;
                option_selected = true;
                if(selectedIndex === 0){
                    updateInnerBox("if(){}");
                }
                break;
            case 1: // B (Cancel)
                break;
            case 2:
                hideOverlay();
                break;
        }
    }else {
        switch (buttonIndex) {
            case 0:
                // console.log("Button A pressed!");
                if(!option_selected){
                    break;
                }
                if(selected_option === 0){
                    console.log("Trying to enter a if statement into the editor");
                    addIfStatement();
                    updateInnerBox("");
                    option_selected = false;
                }
                break;
            case 1:
                // console.log("Button B pressed!");
                break;
            case 2:
                // console.log("Button Y pressed!");
                showOverlay();
                break;
            case 3:
                // console.log("Button X pressed!");
                if (lastHighlightedWord) {
                    window.editor.trigger("custom1", "editor.action.triggerSuggest", {});
                }
                break;
            case 4: //L1
                // Toggle between "touch" and "function"
                let suggest = document.getElementsByClassName("suggest-widget");
                if(suggest.length === 0){
                    break;
                }
                suggest = suggest[0];
                if(suggest.style.display === "none" || suggest.style.visibility === "hidden"){
                    break;
                }


                console.log("Button L1 pressed!");
                touch_suggestion_type = touch_suggestion_type === "touch" ? "function" : "touch";
                let touch = document.getElementById("touch");
                let func = document.getElementById("function");

                if(touch_suggestion_type === "touch"){
                    touch.style.backgroundColor = "#ff1100";
                    func.style.backgroundColor = "#2d2d2d";
                }else{
                    touch.style.backgroundColor = "#2d2d2d";
                    func.style.backgroundColor = "#ff1100";
                }
                // Close and reopen the widget to refresh suggestions
                window.editor.trigger('custom1', 'hideSuggestWidget');
                window.editor.trigger('custom1', 'editor.action.triggerSuggest');
                // }
                break;
            case 5:
                // console.log("Button R1 pressed!");
                break;
            case 6:
                // console.log("Button 6 pressed!");
                break;
            case 7:
                // console.log("Button 7 pressed!");
                break;
            case 8:
                // console.log("Button ddwindow pressed!");
                break;
            case 9:
                // console.log("Button burger pressed!");
                break;
            case 10:
                // console.log("Button left stick pressed!");
                break;
            case 11:
                // console.log("Button right stick pressed!");
                break;
            case 12:
                // console.log("Button up pressed!");
                if(getWidgetVisibility()) {
                    window.editor.trigger("custom1", "selectPrevSuggestion", {});
                }else {
                    window.editor.trigger("source", "cursorUp", {});
                }
                break;
            case 13:
                // console.log("Button down pressed!");
                if(getWidgetVisibility()) {
                    window.editor.trigger("custom1", "selectNextSuggestion", {});
                }else {
                    window.editor.trigger("source", "cursorDown", {});
                }
                break;
            case 14:
                // console.log("Button left pressed!");
                window.editor.trigger("source", "cursorLeft", {});
                break;
            case 15:
                // console.log("Button right pressed!");
                window.editor.trigger("source", "cursorRight", {});
                break;
            case 16:
                // console.log("Button 16 pressed!");
                break;
            case 17:
                // console.log("Button download pressed!");
                break;
            default:
                // console.log(`Button ${buttonIndex} pressed!`);
                break;
        }
    }
}

function handleAxisMovement(axisIndex, value) {
    const deadzone = 0.1; // Ignore small movements
    if (Math.abs(value) < deadzone) {
        return;
    }

    const now = Date.now();
    let direction;
    let state;

    switch (axisIndex) {
        case 4: // Case 2 and 3 are not used
            // console.log("Right horizontal trigger value:", value);
            if(Math.abs(value) <= MovementConfig.deadzone)
                return;

            direction = value > 0 ? 1 : -1;
            state = movementState.horizontal;

            if (state.direction !== direction) {
                state.direction = direction;
                state.currentDelay = MovementConfig.initialDelay;
                state.lastMoveTime = now;
                if(direction === 1)
                    window.editor.trigger("source", "cursorRight", {});
                else
                    window.editor.trigger("source", "cursorLeft", {});

                return;
            }

            if (now - state.lastMoveTime > state.currentDelay) {

                if(direction === 1)
                    window.editor.trigger("source", "cursorRight", {});
                else
                    window.editor.trigger("source", "cursorLeft", {});

                state.currentDelay = Math.max(
                    MovementConfig.minDelay,
                    state.currentDelay * MovementConfig.acceleration
                );
                state.lastMoveTime = now;
            }

            movementState.horizontal = state;
            movementState.vertical.currentDelay = MovementConfig.initialDelay;
            break;
        case 5:
            // console.log("Right vertical trigger value:", value);
            if(Math.abs(value) <= MovementConfig.deadzone)
                return;

            direction = value > 0 ? 1 : -1;
            state = movementState.vertical;

            if (state.direction !== direction) {
                state.direction = direction;
                state.currentDelay = MovementConfig.initialDelay;
                state.lastMoveTime = now;

                if(direction !== 1)
                    window.editor.trigger("source", "cursorUp", {});
                else
                    window.editor.trigger("source", "cursorDown", {});
                return;
            }

            if (now - state.lastMoveTime > state.currentDelay) {
                if(direction !== 1)
                    window.editor.trigger("source", "cursorUp", {});
                else
                    window.editor.trigger("source", "cursorDown", {});

                state.currentDelay = Math.max(
                    MovementConfig.minDelay,
                    state.currentDelay * MovementConfig.acceleration
                );
                state.lastMoveTime = now;
            }
            movementState.vertical = state;
            movementState.horizontal.currentDelay = MovementConfig.initialDelay;
            break;
        case 6: // R2 button
            if (value > TRIGGER_THRESHOLD && !isRedoTriggered) {
                // console.log("R2 button value:", value);
                window.editor.trigger("source", "redo");
                isRedoTriggered = true;
            } else if (value <= TRIGGER_THRESHOLD) {
                isRedoTriggered = false;
                // console.log("Redo cleared");
            }
            break;
        case 7: // L2 button
            if (value > TRIGGER_THRESHOLD && !isUndoTriggered) {
                // console.log("L2 button value:", value);
                window.editor.trigger("source", "undo");
                isUndoTriggered = true;
            } else if (value <= TRIGGER_THRESHOLD) {
                isUndoTriggered = false;
                // console.log("undo cleared");
            }
            break;
        default:
            // console.log(`Axis ${axisIndex} value: ${value}`);
            break;
    }
}
// Function to update gamepad state
export function update() {
    console.log("update was called");
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
        if (gamepad) {
            // Check button presses
            gamepad.buttons.forEach((button, index) => {
                if (button.pressed) {
                    if(!buttonStates[index]){
                        handleButtonPress(index);
                        buttonStates[index] = true;
                    }
                }else{
                    buttonStates[index] = false;
                }
            });

            // Check axes (e.g., joysticks)
            gamepad.axes.forEach((axis, index) => {

                if(index === 0 || index === 1 || index === 2 || index === 3){
                    // console.log("this is the index: ", index);
                    return;
                }
                if(index === 6 || index === 7){ // Because L2 and R2 have a default value of -1 for some reason
                    handleAxisMovement(index, axis)
                    return;
                }
                // New axis handling logic for right stick
                const horizontalValue = gamepad.axes[4]; // Axis 0 = right horizontal
                const verticalValue = gamepad.axes[5];   // Axis 1 = right vertical

                // Check if either axis is active
                const horizontalActive = Math.abs(horizontalValue) > MovementConfig.deadzone;
                const verticalActive = Math.abs(verticalValue) > MovementConfig.deadzone;

                if (horizontalActive || verticalActive) {
                    // Determine dominant axis
                    if (Math.abs(horizontalValue) > Math.abs(verticalValue)) {
                        handleAxisMovement(4, horizontalValue);
                        // Reset vertical movement state
                        movementState.vertical.direction = false;
                        movementState.vertical.currentDelay = MovementConfig.initialDelay;
                    } else {
                        handleAxisMovement(5, verticalValue);
                        // Reset horizontal movement state
                        movementState.horizontal.direction = false;
                        movementState.horizontal.currentDelay = MovementConfig.initialDelay;
                    }
                    return;
                } else {
                    // Reset both directions when stick is neutral
                    movementState.horizontal.direction = false;
                    movementState.horizontal.currentDelay = MovementConfig.initialDelay;
                    movementState.vertical.currentDelay = MovementConfig.initialDelay;
                    movementState.vertical.direction = false;
                }


                if (Math.abs(axis) <= MovementConfig.deadzone) {
                    // Reset movement state when neutral
                    if (index === 4){
                        movementState.horizontal.direction = false;
                        movementState.horizontal.currentDelay = MovementConfig.initialDelay;
                    }
                    if (index === 5){
                        movementState.vertical.direction = false;
                        movementState.vertical.currentDelay = MovementConfig.initialDelay;
                    }
                    return;
                }
            });
        }
    }
    requestAnimationFrame(update); // Continue polling
}


export function setupInput()
{
    window.updateMonacoEditor = function(data) {
        if (window.editor) {
            const currentValue = window.editor.getValue();
            window.editor.setValue(currentValue + "\n" + data);
        }
    };
    window.addEventListener("gamepadconnected", (e) => {
        const gp = navigator.getGamepads()[e.gamepad.index];
        console.log(
            `Gamepad connected at index ${gp.index}: ${gp.id} with ${gp.buttons.length} buttons, ${gp.axes.length} axes.`,
        );
    });

    window.addEventListener("gamepaddisconnected", (e) => {
        console.log(
            "Gamepad disconnected from index %d: %s",
            e.gamepad.index,
            e.gamepad.id,
        );
    });

    if(!window.editor)
        console.log("the editor is still undefined in inputhandler!!!!!");

    // Start this after the editor has been initialized
    window.editor.onDidChangeCursorPosition(highlightCursorWord);
    requestAnimationFrame(update);
}
