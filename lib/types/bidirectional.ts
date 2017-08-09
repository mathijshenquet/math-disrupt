
import {Map} from "immutable";
import {Identifier} from "../nominal/identifier";

export type Term = any;
export type Type = Term;
export type Expr = Term;

export type Context = Map<Identifier, Term>;

export class TypeChecker {

    synthesize(ctx: Context, e: Expr): Type {
        // TODO synthesize type for expression e
    }

    check(ctx: Context, T: Type, t: Term): boolean{
        // TODO check type T contains term t
    }
}