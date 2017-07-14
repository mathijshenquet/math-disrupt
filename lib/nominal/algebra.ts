/**
 * From the signature we can build an algebra of terms. Here we again follow
 * [NomSets] chapter 8, definition 8.2.
 *
 * [NomSets]:  Nominal set, Names and Symmetry in Computer Science
 * [ProgMLTT]: Programming in Martin-Lof’s Type Theory
 *             http://www.cse.chalmers.se/research/group/logic/book/book.pdf
 *
 * Epistemic status: low/medium. Basis is good, needs a lot of work and checks.
 *
 * @module nominal/algebra
 */

import {Signature} from "./signature";
import * as signature from "./signature";
import {Bind, Expr, Term} from "./terms";

/**
 * A name sorting for the countably infinite set A of atomic names is given by a
 * set N and a function s: A → N.
 *
 * See [NomSets] definition 4.26
 */
export interface Sorting<A, N> {
    (atom: A): N;
}

/**
 * This is supposed to implement the (analogue of the) inductive rules
 * from [NomSets] definition 8.2.
 */
export class Algebra<A, N, D> {
    signature: Signature<N, D>;
    sorting: Sorting<A, N>;

    constructor(signature: Signature<N, D>, sorting: Sorting<A, N>) {
        this.signature = signature;
        this.sorting = sorting;
    }

    op(head: A & string, ...leaves: (Expr<A>)[]): Term<A> {
        let cell = this.signature.ops[head];
        // TODO typechecking
        return new Term(head, leaves, cell);
    }

    bind(name: A, term: Term<A>): Bind<A> {
        return new Bind(name, term, new signature.Bind(name, term.sort));
    }
}