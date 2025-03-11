
window.updateMonacoEditor = function(data) {
    if (window.editor) {
        const currentValue = window.editor.getValue();
        window.editor.setValue(currentValue + "\n" + data); // Append data to the editor
    }
};

// Example: Send data to C++ backend
function sendToCpp(data) {
    console.log("From js, called sendToCpp");
    window.sendToMonaco(data).then(response => {
        console.log("Response from C++:", response);
    });
}

window.addEventListener("gamepadconnected", (e) => {
    const gp = navigator.getGamepads()[e.gamepad.index];
    console.log(
        `Gamepad connected at index ${gp.index}: ${gp.id} with ${gp.buttons.length} buttons, ${gp.axes.length} axes.`,
    );
    // // Log button states
    // gp.buttons.forEach((button, btnIndex) => {
    //     console.log(`      Button ${btnIndex}:`);
    // });
    //
    // // Log axes states
    // gp.axes.forEach((axis, axisIndex) => {
    //     console.log(`      Axis ${axisIndex}: `);
    // });
});


window.addEventListener("gamepaddisconnected", (e) => {
    console.log(
        "Gamepad disconnected from index %d: %s",
        e.gamepad.index,
        e.gamepad.id,
    );
});

// Function to check if a button is pressed
function buttonPressed(gamepad, buttonIndex) {
    if (gamepad.buttons[buttonIndex].pressed) {
        return true;
    }
    return false;
}

let isTwoColumnLayout = false;

function toggleSuggestionLayout() {
    const suggestWidget = document.querySelector('.monaco-editor .suggest-widget');

    if (isTwoColumnLayout) {
        // Reset to default layout
        suggestWidget.style.display = '';
        suggestWidget.style.flexDirection = '';
        suggestWidget.style.width = '';
    } else {
        // Apply two-column layout
        suggestWidget.style.display = 'flex';
        suggestWidget.style.flexDirection = 'row';
        suggestWidget.style.width = '500px';
    }

    isTwoColumnLayout = !isTwoColumnLayout;
}

function getWordAtPosition(model, position) {
    const lineContent = model.getLineContent(position.lineNumber);

    let col = position.column - 1;

    if(lineContent[col] === " "){
        return false;
    }
    // Define delimiters (whitespace, parentheses, commas, etc.)
    const delimiters = [" ", "(", ")", "{", "}", "[", "]", ",", ";", "."];

    // Find the start of the word
    let end = col;
    while (end <= lineContent.length && !delimiters.includes(lineContent[end - 1])) {
        end++;
    }

    // Find the end of the word
    let start = col;
    while (start < lineContent.length && !delimiters.includes(lineContent[start - 1])) {
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
let isSelectionBoxFocused = true;
let selectedIndex = 0;
let buttonStates = new Array(17).fill(false);


const operators = ["==", "!=", ">", "<", ">=", "<=", "&&", "||", "+", "-", "*", "/", "%", "="];

function highlightCursorWord() {
    const model = window.editor.getModel();
    if (!model) return;

    const position = window.editor.getPosition();
    const lineContent = model.getLineContent(position.lineNumber);

    // **If the line is a comment, clear highlight and return**
    if (lineContent.trimStart().startsWith("//")) {
        clearHighlight();
        return;
    }

    // Detect words
    const wordPosInfo = getWordAtPosition(model, position);
    let word = lineContent.substring(wordPosInfo[0], wordPosInfo[1]);
    // console.log("This is the word bro: ", word);
    if (!word) {
        clearHighlight();
        return;
    }

    if (word === lastHighlightedWord) return; // Skip redundant updates

    lastHighlightedWord = word;

    // Highlight the detected word or operator
    const startColumn = wordPosInfo[0];
    const endColumn = wordPosInfo[1];

    currentDecorations = window.editor.deltaDecorations(currentDecorations, [
        {
            range: new monaco.Range(position.lineNumber, startColumn + 1, position.lineNumber, endColumn + 1),
            options: { inlineClassName: "highlighted-word" }
        }
    ]);
    console.log("The last word ", lastHighlightedWord);
}

// **Function to clear highlights**
function clearHighlight() {
    if (lastHighlightedWord !== "") {
        currentDecorations = window.editor.deltaDecorations(currentDecorations, []);
        lastHighlightedWord = "";
    }
}



// Get references to the overlay and word list
const selectionBox = document.getElementById("selection-box");

function updateSelectionBox() {
    const items = selectionBox.querySelectorAll('.selection-item');
    console.log("these are the items: ", items);
    console.log("this is the selectedIndex: ", selectedIndex);
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
let isSuggestionWidgetVisible = false;

window.editor.onDidChangeContentWidget((event) => {
    isSuggestionWidgetVisible = event.isVisible;
});
function handleButtonPress(buttonIndex) {

    if (isSelectionBoxFocused) {
        switch (buttonIndex) {
            case 12: // Up
                selectedIndex = selectedIndex !== selectionBox.children.length - 1 ? selectedIndex + 1: selectedIndex;
                updateSelectionBox();
                break;
            case 13: // Down
                selectedIndex = selectedIndex !== 0 ? selectedIndex - 1: 0;
                updateSelectionBox();
                break;
            case 0: // A (Select)
                // selectOption(selectionBox.children[selectedIndex]);
                // hideOverlay();
                break;
            case 1: // B (Cancel)
                hideOverlay();
                break;
            case 2:
                // console.log("Button Y pressed!");
                break;
        }
    }else {
        switch (buttonIndex) {
            case 0:
                // console.log("Button A pressed!");
                break;
            case 1:
                // console.log("Button B pressed!");
                // hideOverlay();
                break;
            case 2:
                // console.log("Button Y pressed!");
                showOverlay();
                break;
            case 3:
                // console.log("Button X pressed!");
                if (lastHighlightedWord) {
                    // console.log("WEREEARR");
                    window.editor.trigger("custom1", "editor.action.triggerSuggest", {});
                    //                     // continue;
                }
                break;
            case 4:
                // Toggle between "touch" and "function"
                let test = document.getElementsByClassName("suggest-widget");
                console.log("this is test: ", test);
                if(test.length === 0){
                    break;
                }
                test = test[0];
                if(test.style.display === "none" || test.style.visibility === "hidden"){
                    console.log("it is HIDDEN");
                    break;
                }


                // if (isSuggestionWidgetVisible) {
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
                if(isSuggestionWidgetVisible) {
                    window.editor.trigger("custom1", "selectPrevSuggestion", {});
                    console.log("wer areraerjkalkwejr");
                }else {
                    window.editor.trigger("source", "cursorUp", {});
                }
                break;
            case 13:
                // console.log("Button down pressed!");
                if(isSuggestionWidgetVisible) {
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

    switch (axisIndex) {
        case 0:
            // console.log("Left joystick horizontal movement:", value);
            break;
        case 1:
            // console.log("Left joystick vertical movement:", value);
            break;
        case 2:
            // console.log("Right joystick horizontal movement:", value);
            break;
        case 3:
            // console.log("Right joystick vertical movement:", value);
            break;
        case 4:
            // console.log("Left trigger value:", value);
            break;
        case 5:
            // console.log("Right trigger value:", value);
            break;
        case 6: // L2 button (often mapped as an axis)
            // // console.log("L2 button value:", value);
            break;
        case 7: // R2 button (often mapped as an axis)
            // // console.log("R2 button value:", value);
            break;
        default:
            // // console.log(`Axis ${axisIndex} value: ${value}`);
            break;
    }
}
// Function to update gamepad state
function update() {
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
                    // console.log(`Button ${index} pressed`);
                }else{
                    buttonStates[index] = false;
                }
            });

            // Check axes (e.g., joysticks)
            gamepad.axes.forEach((axis, index) => {
                if (Math.abs(axis) > 0.1) { // Add a deadzone to ignore small movements
                    // console.log(`Axis ${index} value: ${axis}`);
                    handleAxisMovement(index, axis);
                }
            });
        }
    }
    window.editor.onDidChangeCursorPosition(highlightCursorWord);
    // console.log("here updated")
    requestAnimationFrame(update); // Continue polling
}
