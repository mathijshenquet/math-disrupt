/**
 * We follow [NomSets] chapter 8. Read 8.1 for an introduction. We also use
 * some terminology from [ProgMLTT]
 *
 * [NomSets]:  Nominal set, Names and Symmetry in Computer Science
 * [ProgMLTT]: Programming in Martin-Lof’s Type Theory
 *             http://www.cse.chalmers.se/research/group/logic/book/book.pdf
 *
 * Epistemic status: medium
 * The basis is good need some rethinking of how things are named.
 * Maybe consider following [NomSets] and [ProgMLTT] more closely and add
 * 'compound sorts' instead of rolling everything into Op.
 *
 * @module nominal/signature
 */

import {Hole} from "../presentation/atoms";
import {Atom, Field} from "../presentation/general";
import {Builder} from "../presentation/builder";
import {Template} from "./template";

/**
 * These are the Sorts's of all the expressions. In [ProgMLTT] there is
 * essentially only one data sort 0 (using [NomSets] terminology).
 * The N and the D are the name and data sorts generating the
 * possible sorts. In [NomSets] this is analogous to the inductivily
 * genderated S (eq (8.2)). However here we limit our attention to only a single
 * layer of Binding and a single layer of abstraction, i.e. only 'first order'
 * variables (In [ProgMLTT] it is remarked, in section 4.2, that only such first
 * order variables are needed for the type theory).
 */
export type Sort<N, D> = N | D | Binder<N, D> | Former<N, D>;

/**
 * Represents a bound name in a term of sort D.
 */
export class Binder<N=any, D=any, A=any> {
    name: N;
    term: D;

    constructor(name: N, term: D) {
        this.name = name;
        this.term = term;
    }
}

export class Former<N=any, D=any> {
    dom: Sort<N, D>[];
    cod: D;
    template: Field;

    constructor(dom: Array<Sort<N, D>>, cod: D, template?: Field) {
        this.dom = dom;
        this.cod = cod;

        if(template) this.template = template;
        else this.template = this.standardTemplate();
    }

    private standardTemplate(): Field {
        let args = Template.intersperse<Atom>(
            this.dom.map((_, i): Hole => Builder.hole([i])),
            Builder.punct(",")
        );
        return [Builder.hole(["head"], ["variant-normal"]), Builder.fence("(", args, ")")];
    }
}

export class Signature<N=any, D=any> {
    formers: { [s: string]: Former<N, D> };

    constructor(){
        this.formers = {};
    }

    define(head: string, dom: Sort<N, D>[], cod: D, template?: Field) {
        this.formers[head] = new Former(dom, cod, template);
        return this.formers[head];
    }
}