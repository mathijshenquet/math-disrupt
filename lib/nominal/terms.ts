/**
 * From the signature we can build an algebra of terms. Here we follow
 * [NomSets] chapter 8, definition 8.2. These are the datatypes, i.e elements
 * of the algebra. These are constructed using algebra.ts.
 *
 * [NomSets]:  Nominal set, Names and Symmetry in Computer Science
 * [ProgMLTT]: Programming in Martin-Lof’s Type Theory
 *             http://www.cse.chalmers.se/research/group/logic/book/book.pdf
 *
 * Epistemic status: medium. The basis is good but needs some consistency.
 * I used to have a special node Name<A> and now its just A. Not sure about that
 * yet.
 *
 * @module nominal/terms
 */

import {Builder, Expandable} from "../presentation";
import {Augmented, MathList, OrdPunct} from "../presentation/markup";
import * as signature from "./signature";

/**
 * The sets Σ of raw terms over set of atoms A. From [NomSets] definition 8.2
 */
export type Term<A=any> = Atom<A> | Bind<A> | Form<A>;

export class Atom<A=any> implements Expandable<A> {
    sort: string;
    name: A;

    constructor(name: A){
        this.name = name;
    }

    expand(): Augmented<Term<A>>{
        return new Augmented<Term<A>>(this, new OrdPunct<Term<A>>("ord", this.name.toString()));
    }
}

/**
 * The bottom right rule from [NomSets] definition 8.2
 */
export class Bind<A=any> implements Expandable<A>  {
    sort: signature.Bind;
    name: Atom<A>;
    term: Term<A>;

    constructor(name: Atom<A>, term: Form<A>, sort: signature.Bind){
        this.name = name;
        this.term = term;
        this.sort = sort;
    }

    expand(): Augmented<Term<A>>{
        let builder = new Builder<Term<A>>();
        this.sort.notation(builder, this.name, this.term);
        return new Augmented(this, builder.build());
    }
}

/**
 * The top middle, top right and bottom left rules from [NomSets] definition 8.2
 */
export class Form<A=any> implements Expandable<A> {
    sort: signature.Op;
    head: A;
    leaves: Term<A>[];

    constructor(head: A, leaves: Term<A>[], sort: any){
        this.head = head;
        this.leaves = leaves;
        this.sort = sort;
    }

    expand(): Augmented<Term<A>>{
        let builder = new Builder<Term<A>>();
        this.sort.notation(builder, this.head, this.leaves);
        return new Augmented(this, builder.build());
    }
}