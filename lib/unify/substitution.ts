/**
 * @module nominal/substitution
 */


import {List, Map} from "immutable";
import {Bind, Composite, Form, Term} from "../nominal/term";
import {Hole} from "../nominal/hole";
import {Name} from "../nominal/name";
import {support, Support} from "../nominal/support";

export type Substitution = Map<Hole, Term>;

export function Substitution(X?: Hole, t?: Term): Substitution {
    if(X === undefined || t === undefined)
        return Map();

    if(!Support.isSubset(support(t), X.pmss)){
        throw new Error("Invalid substitution");
    }else{
        return Map([X, t]);
    }
}

export function Substitutions(...pairs: Array<[Hole, Term]>): Substitution {
    return Map(pairs.map(([X, t]) => {
        if (!Support.isSubset(support(t), X.pmss)) {
            throw new Error("Invalid substitution");
        } else {
            return [X, t];
        }
    }));
}

export function compose(first: Substitution, second: Substitution): Substitution {
    return second.merge(first.map((term: Term) => substitute(second, term)));
}

export function substitute(sub: Substitution, term: Term): Term{
    if(term instanceof Hole)
        return sub.get(term, term);

    else if(term instanceof Name)
        return term;

    else if(term instanceof Form)
        return new Form(term.head, <Composite>substitute(sub, term.parts), term.sort);

    else if(term instanceof Composite)
        return new Composite(term.elements.map(substitute.bind(sub)), term.sort);

    else if(term instanceof Bind)
        return new Bind(term.name, <Form>substitute(sub, term.term), term.sort)

    else
        throw new Error("Unreachable in #substitute");
}

