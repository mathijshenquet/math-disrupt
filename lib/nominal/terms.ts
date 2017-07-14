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
import {MathList} from "../presentation/data";
import * as signature from "./signature";

/**
 * The sets Σ of raw terms over set of atoms A. From [NomSets] definition 8.2
 */
export type Expr<A=any> = A | Bind<A> | Term<A>;

/**
 * The bottom right rule from [NomSets] definition 8.2
 */
export class Bind<A=any> implements Expandable  {
    sort: signature.Bind;
    name: A;
    term: Term<A>;

    constructor(name: A, term: Term<A>, sort: signature.Bind){
        this.name = name;
        this.term = term;
        this.sort = sort;
    }

    expand(): MathList<Expandable>{
        let builder = new Builder<Expandable>();
        this.sort.notation(builder, this.name, this.term);
        return builder.items;
    }
}

/**
 * The top middle, top right and bottom left rules from [NomSets] definition 8.2
 */
export class Term<A=any> implements Expandable {
    sort: signature.Op;
    head: A;
    leaves: Expr<A>[];

    constructor(head: A, leaves: Expr<A>[], sort: any){
        this.head = head;
        this.leaves = leaves;
        this.sort = sort;
    }

    expand(): MathList<Expandable>{
        let builder = new Builder<Expandable>();
        this.sort.notation(builder, this.head, this.leaves);
        return builder.items;
    }
}