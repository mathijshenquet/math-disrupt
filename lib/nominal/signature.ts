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

import {Builder, Expandable} from "../presentation/index";
import {Term} from "./terms";
import * as terms from "./terms";

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
export type Sort<N, D> = N | D | Bind<N, D> | Op<N, D>;

/**
 * Represents a bound name in a term of sort D.
 */
export class Bind<N=any, D=any, A=any> {
    name: N;
    term: D;

    constructor(name: N, term: D) {
        this.name = name;
        this.term = term;
    }

    notation(builder: Builder<Term<A>>, name: A, term: Term<A>){
        builder.ord(name.toString());
        builder.punct(".");

        if((term instanceof terms.Form) || (term instanceof terms.Bind))
            builder.item(term.expand());
        else
            builder.ord(term.toString());
    }
}

export interface Notation<A>{
    (builder: Builder<Term<A>>, head: A, leaves: Term<A>[]): void
}

export class Op<N=any, D=any, A=any> {
    op: string;
    dom: Sort<N, D>[];
    cod: D;
    customNotation?: Notation<A>;

    constructor(op: string, dom: Sort<N, D>[], cod: D, customNotation?: Notation<A>) {
        this.op = op;
        this.dom = dom;
        this.cod = cod;
        this.customNotation = customNotation;
    }

    notation(builder: Builder<Term<A>>, head: A, leaves: Term<A>[]){
        if(this.customNotation)
            return this.customNotation(builder, head, leaves);

        builder.symbol(head.toString());
        builder.push();
        for(let i = 0; i < leaves.length; i++) {
            if (i != 0) builder.punct(",");

            let leaf = leaves[i];
            builder.item(leaf.expand());
        }
        let inner = builder.pop();
        builder.fence("(", inner, ")");
    }
}

export class Signature<N=any, D=any, A=any> {
    ops: { [s: string]: Op<N, D, A> };

    constructor(){
        this.ops = {};
    }

    define(op: string, dom: Sort<N, D>[], cod: D, customNotation?: Notation<A>) {
        this.ops[op] = new Op(op, dom, cod, customNotation);
        return this.ops[op];
    }
}