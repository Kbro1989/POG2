import { clientscript } from "../../generated/clientscript";
import { clientscriptdata } from "../../generated/clientscriptdata";
import type { ClientscriptObfuscation } from "./callibrator";
import { ClientScriptOp, StackConstants } from "./definitions";
import { ClientScriptSubtypeSolver } from "./subtypedetector";
export { AstNode, SubcallNode, ComposedOp, VarAssignNode, CodeBlockNode, BranchingStatement, WhileLoopStatementNode, ControlStatementNode, SwitchStatementNode, IfStatementNode, FunctionBindNode, RawOpcodeNode, RewriteCursor, ClientScriptFunction, getSingleChild, isNamedOp, getNodeStackOut, getNodeStackIn, varArgtype, retargetJumps } from "./ast_nodes";
import { CodeBlockNode, RawOpcodeNode, ClientScriptFunction } from "./ast_nodes";
/**
 * known issues
 * - If all branches (and default) of a switch statement return, then the last branch is emptied and its contents are placed after the end of the block (technically still correct)
 *   - has to do with the way the branching detection works (AstNode.findNext)
 * - some op arguments still not figured out
 * - none of this is tested for older builds
 *   - probably breaks at the build where pushconst ops were merged (~700?)
 */
export declare function translateAst(ast: CodeBlockNode): CodeBlockNode;
export declare function setRawOpcodeStackDiff(consts: StackConstants | null, calli: ClientscriptObfuscation, node: RawOpcodeNode): void;
export declare function generateAst(calli: ClientscriptObfuscation, script: clientscriptdata | clientscript, ops: ClientScriptOp[], scriptid: number): {
    sections: CodeBlockNode[];
    rootfunc: ClientScriptFunction;
    subfuncs: ClientScriptFunction[];
};
export declare function parseClientScriptIm(calli: ClientscriptObfuscation, script: clientscript, fileid?: number): {
    rootfunc: ClientScriptFunction;
    sections: CodeBlockNode[];
    typectx: ClientScriptSubtypeSolver;
};
