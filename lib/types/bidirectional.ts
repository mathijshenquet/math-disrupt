
import {Map} from "immutable";
import {Name} from "../nominal/name";

export type Term = any;
export type Type = Term;
export type Expr = Term;

export type Context = Map<Name, Term>;

export class TypeChecker {

    synthesize(ctx: Context, e: Expr): Type {
        // TODO synthesize type for expression e
        throw new Error("Not implemented");
    }

    check(ctx: Context, T: Type, t: Term): boolean{
        // TODO check type T contains term t
        throw new Error("Not implemented");
    }
}