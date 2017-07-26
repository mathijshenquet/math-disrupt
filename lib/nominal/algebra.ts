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

import {Name, Bind, Term, Form} from "./terms";
import {Binder, Signature} from "./signature";

/**
 * A name sorting for the countably infinite set A of atomic names is given by a
 * set N and a function s: A → N.
 *
 * See [NomSets] definition 4.26
 */
export interface Sorting {
    (atom: string): string;
}

/**
 * This is supposed to implement the (analogue of the) inductive rules
 * from [NomSets] definition 8.2.
 */
export class Algebra {
    signature: Signature;
    sorting: Sorting;

    constructor(signature: Signature, sorting: Sorting) {
        this.signature = signature;
        this.sorting = sorting;
    }

    op(head: string, ...leaves: Array<Term>): Form {
        let cell = this.signature.formers[head];
        // TODO typechecking
        return new Form(this.atom(head), leaves, cell);
    }

    bind(name: string, term: Form): Bind {
        return new Bind(this.atom(name), term, new Binder(name, term.sort));
    }

    atom(name: string){
        return new Name(name, this.sorting(name));
    }
}