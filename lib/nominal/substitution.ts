/**
 * @module nominal/substitution
 */


import {Map} from "immutable";
import {Bind, Composite, Form, Term} from "./term";
import {Unknown} from "./unknown";
import {Identifier} from "./identifier";

export type Substitution = Map<Unknown, Term>;

export function substitute(sub: Substitution, term: Term): Term{
    if(term instanceof Unknown)
        return sub.get(term, term);

    else if(term instanceof Identifier)
        return term;

    else if(term instanceof Form)
        return new Form(term.head, <Composite>substitute(sub, term.argument), term.sort);

    else if(term instanceof Composite)
        return new Composite(term.elements.map(substitute.bind(sub)), term.sort);

    else if(term instanceof Bind)
        return new Bind(term.name, <Form>substitute(sub, term.term), term.sort)

    else
        throw new Error("Unreachable in #substitute");
}

