import * as monaco from "monaco-editor";
import CLexer from "../ANTLR/CLexer.js";
import CParser from "../ANTLR/CParser.js";

import {PositionListener, findDeepestNodeAtPosition} from "./parser.js";
import antlr4 from "antlr4";
import {update, getLastHighlightedWord, operators} from "./inputHandler.js";

import {setVisibilityWidget} from "./common.js";

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

export function setupMonaco()
{
    console.log("this waas calledd in monaco");

    let customDiv = null;
    let toAddHtml = document.createElement('div');

    // Clear all children
    function clearCustomDivChildren() {
        if (customDiv) {
            while (customDiv.firstChild) {
                customDiv.removeChild(customDiv.firstChild);
            }
        }
    }

    // require(["vs/editor/editor.main"], function () {

    monaco.languages.register({ id: 'custom1' });
    console.log("monaco was defined here!");

    window.editor = monaco.editor.create(document.getElementById("container"), {
        value: "// Eat\n" +
            "if (touch(Grass) == Below) { eat(Grass); }\n" +
            "\n" +
            "// Want to move?\n" +
            "if (chance(0.25)) {\n" +
            "  // Want to move, so decide a direction\n" +
            "  int r = random(0, 4);\n" +
            "  if (r == 0) {\n" +
            "    // Don't do anything\n" +
            "  } else if (r == 1) {\n" +
            "    // Is there any grass north from us?\n" +
            "   if (touch(Example) == North) { move(North, 10); }\n" +
            "  } else if (r == 2) {\n" +
            "    // Is there any grass east from us?\n" +
            "    if (touch(Grass) == East) { move(East, 10); }\n" +
            "  } else if (r == 3) {\n" +
            "    // Is there any grass south from us?\n" +
            "    if (touch(Grass) == South) { move(South, 10); }\n" +
            "  } else if (r == 4) {\n" +
            "    // Is there any grass west from us?\n" +
            "    if (touch(Grass) == West) { move(West, 10); }\n" +
            "  }\n" +
            "}",
        language: "custom1",
        wordBasedSuggestions: false,
        theme: "vs-dark",
        markdown: {
            isTrusted: true,
        },

    });

    function getTouchInstanceRange(model, position) {
        const lineContent = model.getLineContent(position.lineNumber);
        const cursorColumn = position.column - 1; // Convert to 0-based index

        // Find the start of `touch(`
        let start = cursorColumn;
        while (start >= 0 && !lineContent.substring(start, start + 6).startsWith("touch(")) {
            start--;
        }

        // If `touch(` is not found, return null
        if (start < 0 || !lineContent.substring(start, start + 6).startsWith("touch(")) {
            return null;
        }

        // Find the end of `touch(anyTextHere)`
        let end = cursorColumn;
        while (end < lineContent.length && lineContent[end] !== ")") {
            end++;
        }
        end++; // Include the closing parenthesis

        // Return the range
        return new monaco.Range(
            position.lineNumber,
            start + 1, // Convert to 1-based column
            position.lineNumber,
            end + 1 // Convert to 1-based column
        );
    }


    monaco.editor.registerCommand('replaceFunc', function(_, replacementText) {
        const model = window.editor.getModel();
        const position = window.editor.getPosition();

        // Get the range of the selected `touch(anyTextHere)` instance
        console.log("this is the position: ", position);
        const range = getTouchInstanceRange(model, position);
        if (!range) {
            console.log("No `touch(anyTextHere)` instance found at the cursor position.");
            return;
        }

        // Replace the selected instance with the suggestion
        console.log("this is the replace text: ", replacementText);
        console.log("this is the range: ", range);
        window.editor.executeEdits("replace-touch-instance", [
            {
                range: range,
                text: replacementText,
            }
        ]);
    });



    monaco.languages.registerCompletionItemProvider('custom1', {
        provideCompletionItems: function(model, position) {
            console.log("hahahahahaha");

            const code = model.getValue();
            const line = position.lineNumber;
            const column = position.column - 1; // Convert to 0-based


            const contextNode = findDeepestNodeAtPosition(code, line, column);

            console.log("This is the contextNode", contextNode);

            let suggestions = [];

            // Suggestions for the word "touch"
            console.log("The last highlighted word is: ", getLastHighlightedWord())
            if (getLastHighlightedWord() === "touch") {

                if(!customDiv){
                    //TODO make this dynamical

                    // the html to add as a child in the custom div upon creation
                    toAddHtml.style.display = "flex"; // Arrange children in a row
                    toAddHtml.style.gap = "10px"; // Add spacing between elements

                    let t = document.createElement('div');
                    t.innerText = "Touch";
                    t.style.padding = "10px";
                    t.style.border = "2px solid black";
                    t.style.backgroundColor = "#2d2d2d";
                    t.id = "touch";
                    if(touch_suggestion_type === "touch"){
                        t.style.backgroundColor = "#ff1100";
                    }

                    let f = document.createElement("div");
                    f.innerText = "Function";
                    f.style.padding = "10px";
                    f.style.border = "2px solid black";
                    f.style.backgroundColor = "#2d2d2d";
                    f.id = "function"
                    if(touch_suggestion_type === "function"){
                        f.style.backgroundColor = "#ff1100";
                    }

                    toAddHtml.appendChild(t);
                    toAddHtml.appendChild(f);

                    document.body.appendChild(toAddHtml);

                    toAddHtml.appendChild(t);
                    toAddHtml.appendChild(f);
                }else{
                    // remove the child of custom div and add what is to be added
                }

                console.log("this is the custom DIVVVV: ", customDiv);
                const filteredSuggestions = touch_suggestions.filter(
                    (suggestion) => suggestion.type === touch_suggestion_type
                );
                console.log("these are the filtered ones: ", filteredSuggestions);

                suggestions = [
                    ...filteredSuggestions.map((suggestion) => ({
                        label: suggestion.label,
                        kind: monaco.languages.CompletionItemKind.Function, // Assign different kinds based on category
                        insertText: suggestion.label,
                        filterText: getLastHighlightedWord(),
                        command: {
                            id: 'replaceFunc',
                            title: 'Replace all touch(Args...)',
                            arguments: [suggestion.label]
                        },
                    })),
                ];

                console.log("these are the suggestions: ", suggestions);

            }

            // Suggestions for operators
            else if (operators.includes(getLastHighlightedWord())) {

                if(!customDiv){

                }else{
                    clearCustomDivChildren();
                    let temp = document.createElement("div");
                    temp.innerText = "Only 1 type";
                    customDiv.appendChild(temp);
                }

                suggestions = [
                    {
                        label: '==',
                        kind: monaco.languages.CompletionItemKind.Operator,
                        insertText: '==',
                        detail: 'Equality operator',
                    },
                    {
                        label: '!=',
                        kind: monaco.languages.CompletionItemKind.Operator,
                        insertText: '!=',
                        detail: 'Inequality operator',
                    },
                    {
                        label: '&&',
                        kind: monaco.languages.CompletionItemKind.Operator,
                        insertText: '&&',
                        detail: 'Logical AND operator',
                    },
                    {
                        label: '||',
                        kind: monaco.languages.CompletionItemKind.Operator,
                        insertText: '||',
                        detail: 'Logical OR operator',
                    },
                ];
            } else{

                if(!customDiv){

                }else{
                    clearCustomDivChildren();
                    let temp = document.createElement("div");
                    temp.innerText = "No types";
                    customDiv.appendChild(temp);
                }

            }
            console.log("The final suggestions: ", suggestions);
            return { suggestions: suggestions };
        }
    });


    // // Start this after the editor has been initialized
    // requestAnimationFrame(update);


    // Track if the custom HTML has been injected
    let isCustomDivInjected = false;


// Function to create/update the custom div
    const syncCustomDivVisibility = (suggestWidget) => {
        // Check if the widget is visible
        const isWidgetVisible =
            suggestWidget.style.display !== 'none' &&
            suggestWidget.style.visibility !== 'hidden';

        // Create the custom div if it doesn't exist
        if (!customDiv && isWidgetVisible) {
            customDiv = document.createElement('div');
            customDiv.className = 'custom-injected-div';
            customDiv.style.cssText = `
          padding: 8px;
          background: #2d2d2d;
          width: 97%;
          z-index: 1000;
        `;
            customDiv.appendChild(toAddHtml);
            suggestWidget.appendChild(customDiv);
            isCustomDivInjected = true;
        }

        // Sync visibility with the widget
        if (customDiv) {
            customDiv.style.display = isWidgetVisible ? 'block' : 'none';
            customDiv.style.visibility = isWidgetVisible ? 'visible' : 'hidden';
        }
        setVisibilityWidget(isWidgetVisible);
    };

// Observe the suggest-widget for visibility changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            const suggestWidget = document.querySelector('.suggest-widget');
            if (!suggestWidget) return;

            // Case 1: Widget style changes (visibility)
            if (mutation.attributeName === 'style') {
                syncCustomDivVisibility(suggestWidget);
            }

            // Case 2: Widget is added to the DOM (initial creation)
            if (mutation.addedNodes.length > 0) {
                syncCustomDivVisibility(suggestWidget);
            }
        });
    });

// Start observing the entire document
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style'],
    });



}
