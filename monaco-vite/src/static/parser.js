import antlr4 from 'antlr4';
import CLexer from '../ANTLR/CLexer.js';
import CParser from '../ANTLR/CParser.js';

export class PositionListener extends antlr4.tree.ParseTreeListener {
    constructor(targetLine, targetColumn) {
        super();
        this.targetLine = targetLine;
        this.targetColumn = targetColumn;
        this.deepestNode = null;
    }

    enterEveryRule(ctx) {
        const startToken = ctx.start;
        const stopToken = ctx.stop;

        if (!startToken || !stopToken) return;

        const startLine = startToken.line;
        const startCol = startToken.column;
        const stopLine = stopToken.line;
        const stopCol = stopToken.column + (stopToken.stop - stopToken.start);

        if (this.isWithin(startLine, startCol, stopLine, stopCol)) {
            if (!this.deepestNode || ctx.depth() > this.deepestNode.depth()) {
                this.deepestNode = ctx;
            }
        }
    }

    isWithin(startLine, startCol, stopLine, stopCol) {
        return (
            (this.targetLine > startLine || (this.targetLine === startLine && this.targetColumn >= startCol)) &&
            (this.targetLine < stopLine || (this.targetLine === stopLine && this.targetColumn <= stopCol))
        );
    }
}

export function findDeepestNodeAtPosition(code, line, column) {
    const input = new antlr4.InputStream(code);
    const lexer = new CLexer(input);
    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new CParser(tokens);
    parser.buildParseTrees = true;
    const parseTree = parser.compilationUnit();

    const listener = new PositionListener(line, column);
    antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, parseTree);

    return listener.deepestNode;
}
