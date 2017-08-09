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
import {is, ValueObject} from "immutable";

/**
 * The sets Σ of raw terms over set of atoms A. From [NomSets] definition 8.2
 */
export type Term = Name | Unknown | Bind | Form | Composite;

/// Identifiers
import {N, Name} from "./name";

// Unknown
import {Unknown} from "./unknown";
import {NavigableNode} from "./navigable";
import {Builder} from "../presentation/builder";
import {NominalSet, Permutation, Swap} from "./permutation";
import {support} from "./support";

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

export class Composite extends DerivedTerm implements Selectable, ValueObject, NominalSet {
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

    /// ValueObject
    equals(other: Composite): boolean {
        if(!is(this.sort, other.sort)) return false;
        for(let i = 0; i < this.elements.length; i++){
            let left = this.elements[i], right = other.elements[i];
            if(!is(left, right)) return false;
        }
        return true;
    }

    hashCode(): number {
        throw new Error("Method not implemented.");
    }

    /// NominalSet
    act(perm: Permutation): Composite {
        return new Composite(this.elements.map((i) => i.act(perm)), this.sort);
    }
}

/**
 * The bottom right rule from [NomSets] definition 8.2
 */
export class Bind extends DerivedTerm implements Selectable, ValueObject, NominalSet {
    sort: Binder;
    name: Name;
    term: Term;
    template: Template = [
        Builder.hole(Selector('name'), ["variant-normal"]),
        Builder.punct(","),
        Builder.hole(Selector('term'))
    ];

    constructor(name: Name, term: Term, sort: Binder){
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

    /// ValueObject
    equals(other: Bind): boolean {
        if(is(this.name, other.name)) {
            return is(this.term, other.term);

        }else if(!support(other.term).contains(this.name)){
            let otherR = other.act(new Swap(this.name, other.name));
            return is(this.term, otherR.term);
        }

        return false;
    }

    hashCode(): number {
        throw new Error("Method not implemented.");
    }

    /// NominalSet
    act(perm: Permutation): Bind {
        return new Bind(this.name.act(perm), this.term.act(perm), this.sort);
    }
}

/**
 * The top middle, top right and bottom left rules from [NomSets] definition 8.2
 */
export class Form extends DerivedTerm implements Selectable, ValueObject, NominalSet {
    sort: Former;
    head: Name;
    argument: Composite;
    template: Template;

    constructor(head: Name, argument: Composite, sort: Former){
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

    /// ValueObject
    equals(other: Form): boolean {
        return is(this.head, other.head) && is(this.argument, other.argument);
    }

    hashCode(): number {
        throw new Error("Method not implemented.");
    }

    /// NominalSet
    act(perm: Permutation): Form {
        return new Form(this.head.act(perm), this.argument.act(perm), this.sort);
    }
}