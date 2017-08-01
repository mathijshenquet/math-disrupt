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

import {computeHoles, Template} from "../presentation/template";
import {Binder, Former, Product, Sort} from "./signature";
import {Selectable, Selector} from "./selector";

/**
 * The sets Σ of raw terms over set of atoms A. From [NomSets] definition 8.2
 */
export type Term = Identifier | Unknown | Bind | Form | Composite;

/// Identifiers
import {Id, Identifier} from "./identifier";

// Unknown
import {Unknown} from "./unknown";
import {NavigableNode} from "./navigable";
import {Builder} from "../presentation/builder";

export abstract class DerivedTerm implements NavigableNode {
    children: Array<Term>;
    sort: Sort;
    tree: "node" = "node";
    template: Template;

    constructor(sort: Sort){
        this.sort = sort;
    }

    computeChildren(){
        this.children = computeHoles(this.template).map((sel) => sel.select(<any>this));
    }

    select(index: string | number): Term | undefined {
        return;
    }
}

export class Composite extends DerivedTerm implements Selectable {
    sort: Product;
    elements: Array<Term>;
    template: Template;

    constructor(elements: Array<Term>, sort: Product){
        super(sort);

        this.template = [];
        for(let i = 0; i < elements.length; i++) {
            if (i != 0) this.template.push(Builder.punct(","));
            this.template.push(Builder.hole(Selector(i)));
        }
        this.elements = elements;

        this.computeChildren();
    }

    select(index: string | number): Term | undefined {
        if(typeof index === "number")
            return this.elements[index];
    }
}

/**
 * The bottom right rule from [NomSets] definition 8.2
 */
export class Bind extends DerivedTerm implements Selectable {
    sort: Binder;
    name: Identifier;
    term: Term;
    template: Template = [
        Builder.hole(Selector('name'), ["variant-normal"]),
        Builder.punct(","),
        Builder.hole(Selector('term'))
    ];

    constructor(name: Identifier, term: Form, sort: Binder){
        super(sort);

        this.name = name;
        this.term = term;

        this.computeChildren();
    }

    select(index: string | number): Term | undefined {
        switch(index){
            case "name": return this.name;
            case "term": return this.term;
        }
    }
}

/**
 * The top middle, top right and bottom left rules from [NomSets] definition 8.2
 */
export class Form extends DerivedTerm implements Selectable {
    sort: Former;
    head: Identifier;
    argument: Composite;
    template: Template;

    constructor(head: Identifier, argument: Composite, sort: Former){
        super(sort);

        this.head = head;
        this.argument = argument;
        this.template = sort.template;

        this.computeChildren();
    }

    select(index: string | number): Term | undefined {
        if(typeof index === "number")
            return this.argument.select(index);
        else if(index == "head")
            return this.head;
    }
}