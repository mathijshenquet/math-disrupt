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

import {Builder} from "../presentation/builder"
import {Template} from "../presentation/template";
import {$} from "./navigate";

/**
 * These are the Sorts's of all the expressions. In [ProgMLTT] there is
 * essentially only one data sort 0 (using [NomSets] terminology).
 * The string and the string are the name and data sorts generating the
 * possible sorts. In [NomSets] this is analogous to the inductivily
 * genderated S (eq (8.2)). However here we limit our attention to only a single
 * layer of Binding and a single layer of abstraction, i.e. only 'first order'
 * variables (In [ProgMLTT] it is remarked, in section 4.2, that only such first
 * order variables are needed for the type theory).
 */
export type Sort = string | Binder | Former | Product;

export class Product{
    elements: Array<Sort>;
    template: Template;
    length: number;

    constructor(elements: Array<Sort>){
        this.elements = elements;
        this.length = elements.length;
        this.template = [];
        for(let i = 0; i < elements.length; i++) {
            if (i != 0) this.template.push(Builder.punct(","));
            this.template.push(Builder.hole($(i)));
        }
    }

    pi(idx: number): Sort{
        return this.elements[idx];
    }
}

/**
 * Represents a bound name in a term of sort string.
 */
export class Binder {
    name: string;
    term: Sort;
    template: Template = [
        Builder.hole($('name'), ["variant-normal"]),
        Builder.punct(","),
        Builder.hole($('term'))
    ];

    constructor(name: string, term: Sort) {
        this.name = name;
        this.term = term;
    }
}

/**
 * Represents a term former.
 */
export class Former {
    dom: Sort[];
    cod: string;
    template: Template;

    constructor(dom: Array<Sort>, cod: string, template?: Template) {
        this.dom = dom;
        this.cod = cod;

        if(template) this.template = template;
        else this.template = this.standardTemplate();
    }

    private standardTemplate(): Template {
        const args = [];
        for(let i = 0; i < this.dom.length; i++) {
            if (i != 0) args.push(Builder.punct(","));
            args.push(Builder.hole($(i)));
        }
        return [Builder.hole($("head"), ["variant-normal"]), Builder.fence("(", args, ")")];
    }
}

export class Signature {
    formers: { [s: string]: Former };

    constructor(){
        this.formers = {};
    }

    define(head: string, dom: Sort[], cod: string, template?: Template) {
        this.formers[head] = new Former(dom, cod, template);
        return this.formers[head];
    }
}