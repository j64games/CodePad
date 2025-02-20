require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.33.0/min/vs" } });

require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.33.0/min/vs" } });
require(["vs/editor/editor.main"], function () {
    window.editor = monaco.editor.create(document.getElementById("container"), {
        value: "// Here some default text that we get from the game",
        language: "cpp"
    });

    // Register a completion item provider for the 'cpp' language
    monaco.languages.registerCompletionItemProvider('cpp', {
        provideCompletionItems: function(model, position) {
            // Get the text before the cursor
            const textUntilPosition = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            });

            const textAbove = position.lineNumber !== 0 ? model.getValueInRange({
                startLineNumber: position.lineNumber - 1,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            }) : "NULL";

            // Define custom suggestions
            const suggestions = [
                {
                    label: 'console.log', // Text displayed in the suggestion list
                    kind: monaco.languages.CompletionItemKind.Function, // Icon type
                    insertText: 'console.log(${1:message});', // Text to insert
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, // Treat as snippet
                    detail: 'Log a message to the console', // Description
                    documentation: 'Logs a message to the browser console.' // Detailed documentation
                },
                {
                    label: 'function',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'function ${1:name}(${2:params}) {\n\t${3}\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: 'Define a function',
                    documentation: 'Defines a new function with a name and parameters.'
                },
                {
                    label: 'if',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'if (${1:condition}) {\n\t${2}\n}',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: 'Define an if statement',
                    documentation: 'Defines a conditional if statement.'
                },
                {
                    label: 'Put NPC',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'Put NPC 1:\n    A:',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: 'Define some',
                    documentation: 'Later'
                },
                {
                    label: '    A: To Sleep', // Use spaces instead of \t for the label
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'To Sleep\n\t', // Use \t in the insertText
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: 'Define an if statement',
                    documentation: 'Defines a conditional if statement.'
                },
                {
                    label: '    To Walk', // Use spaces instead of \t for the label
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'To Walk\n\t', // Use \t in the insertText
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    detail: 'Define an if statement',
                    documentation: 'Defines a conditional if statement.'
                }
            ];

            // Filter suggestions based on the text before the cursor
            const filteredSuggestions = suggestions.filter(suggestion => {
                // Normalize the suggestion label and textUntilPosition for comparison
                const normalizedLabel = suggestion.label.replace(/\t/g, '    '); // Replace \t with spaces
                const normalizedText = textUntilPosition.replace(/\t/g, '    '); // Replace \t with spaces

                // Check if the suggestion label starts with the normalized text
                if (normalizedLabel.toLowerCase().startsWith(normalizedText.toLowerCase())) {
                    // Additional context check for "Put NPC"
                    if (suggestion.label.includes('A:') && textAbove.startsWith('Put NPC')) {
                        return true;
                    }
                    return true;
                }
                return false;
            });

            return {
                suggestions: filteredSuggestions
            };
        }
    });

    // Start this after the editor has been initialized
    requestAnimationFrame(update);
});