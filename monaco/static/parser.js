import antlr4 from 'antlr4';
import MyGrammarLexer from '../ANTLR/CLexer.js';
import MyGrammarParser from '../ANTLR/CParser';

function parseInput(text) {
    const chars = new antlr4.InputStream(text);
    const lexer = new MyGrammarLexer(chars);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new MyGrammarParser(tokens);
    return parser.startRule();
}

window.parseInput = parseInput;

// import antlr4 from 'https://cdn.jsdelivr.net/npm/antlr4@4.12.0/dist/antlr4.web.js';
// import CLexer from './CLexer.js';
// import CParser from './CParser.js';

// class ASTService {
//     constructor() {
//         this.parseTree = null;
//     }
//
//     parse(code) {
//         const chars = new antlr4.InputStream(code);
//         const lexer = new CLexer.CLexer(chars);
//         const tokens = new antlr4.CommonTokenStream(lexer);
//         const parser = new CParser.CParser(tokens);
//
//         // Configure error handling
//         parser.removeErrorListeners();
//         parser.addErrorListener({
//             syntaxError: () => {} // Ignore errors for this example
//         });
//
//         this.parseTree = parser.compilationUnit();
//     }
//
//     getNodeAtPosition(line, column) {
//         if (!this.parseTree) return null;
//
//         let foundNode = null;
//
//         const walker = new antlr4.tree.ParseTreeWalker();
//         walker.walk({
//             enterEveryRule: (ctx) => {
//                 const start = ctx.start;
//                 const stop = ctx.stop || start;
//
//                 // Convert to 0-based columns
//                 if (start.line === line &&
//                     start.column <= column - 1 &&
//                     stop.column >= column - 1) {
//                     if (!foundNode || ctx.depth() > foundNode.depth()) {
//                         foundNode = ctx;
//                     }
//                 }
//             }
//         }, this.parseTree);
//
//         return foundNode;
//     }
// }

// export default ASTService;

// let currentParseTree = null;
//
// // Parse code and get AST
// function parseCode(code) {
//     const input = new antlr4.InputStream(code);
//     const lexer = new CLexer(input);
//     const tokens = new antlr4.CommonTokenStream(lexer);
//     const parser = new CParser(tokens);
//     currentParseTree = parser.compilationUnit(); // Entry rule for C
//     return currentParseTree;
// }
//
// // Find AST node at cursor position
// function getNodeAtPosition(line, column) {
//     if (!currentParseTree) return null;
//
//     let foundNode = null;
//
//     // Walk the parse tree
//     const walker = new antlr4.tree.ParseTreeWalker();
//     walker.walk({
//         enterEveryRule: (ctx) => {
//             const start = ctx.start.line === line && ctx.start.column <= column;
//             const end = ctx.stop.line === line && ctx.stop.column >= column;
//             if (start && end) foundNode = ctx;
//         }
//     }, currentParseTree);
//
//     return foundNode;
// }
//
// // Update on cursor move
// window.editor.onDidChangeModelContent((e) => {
//     const code = window.editor.getValue();
//     parseCode(code); // Update parse tree
//
//     const pos = window.editor.getPosition();
//     const node = getNodeAtPosition(pos.lineNumber, pos.column);
//
//     console.log("Current AST node:", node);
// });