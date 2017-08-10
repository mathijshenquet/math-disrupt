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

import {Bind, Term, Form, Composite} from "./term";
import {Binder, Signature, Sort} from "./signature";
import {N, Name} from "./name";
import {Unknown} from "./unknown";

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
        let former = this.signature.formers[head];
        return new Form(this.atom(head), new Composite(leaves, former.dom), former);
    }

    bind(name: string | Unknown, term: Term): Bind {
        let sort: string, atom: Name | Unknown;
        if(typeof name == "string") {
            atom = this.atom(name);
            sort = this.sorting(name);
        }else { // name instanceof Unknown
            atom = name;
            sort = name.sort;
        }

        return new Bind(atom, term, new Binder(sort, term.sort));
    }

    atom(name: string): Name{
        return N(name);
    }

    unknown(name: string, sort: string){
        return new Unknown(name, sort);
    }
}