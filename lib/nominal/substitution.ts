/**
 * @module nominal/substitution
 */


import {List, Map} from "immutable";
import {Bind, Composite, Form, Term} from "./term";
import {Unknown} from "./unknown";
import {Name} from "./name";
import {support, Support} from "./support";

export type Substitution = Map<Unknown, Term>;

export function Substitution(X: Unknown, t: Term): Substitution {
    if(!Support.isSubset(support(t), X.pmss)){
        throw new Error("Invalid substitution");
    }else{
        return Map([X, t]);
    }
}

export function Substitutions(...pairs: Array<[Unknown, Term]>): Substitution {
    return Map(pairs.map(([X, t]) => {
        if (!Support.isSubset(support(t), X.pmss)) {
            throw new Error("Invalid substitution");
        } else {
            return [X, t];
        }
    }));
}

export function compose(first: Substitution, second: Substitution){
    return Map(first.map((term: Term) => substitute(second, term)))
        .mergeWith((first: Term) => first, second);
}

export function substitute(sub: Substitution, term: Term): Term{
    if(term instanceof Unknown)
        return sub.get(term, term);

    else if(term instanceof Name)
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

