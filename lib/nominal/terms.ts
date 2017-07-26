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

import {Set} from "immutable";
import {$, Cursor, CursorChange, Movement, Selector} from "./navigate";
import {Builder} from "../presentation/builder";
import {computeHoles, Template} from "../presentation/template";
import {Binder, Former, Product, Sort} from "./signature";
import {flatten} from "../helper";

/**
 * The sets Σ of raw terms over set of atoms A. From [NomSets] definition 8.2
 */
export type Term = Name | Unknown | Bind | Form | Tuple;

export interface BaseTerm{
    support(): Set<string>;
}

export abstract class LeafTerm {
    sort: Sort;
    length: number;
    template: Template;

    constructor(length: number){
        this.length = length;
    }

    enter(movement: Movement): Cursor{
        return new Cursor(this.length * (1 - movement)/2);
    }

    move(caret: Cursor, movement: Movement): CursorChange {
        return Cursor.boundedChange(caret.head + movement, this.length);
    }

    /**
     * Navigate to a specific child in the Term specified by the Caret.
     */
    navigate(cursor: Cursor | undefined): Term {
        return <any>this;
    }

    /**
     * Given a selector, returns the relevant child Term.
     */
    select(selector: Selector | undefined): Term {
        if(selector !== undefined) throw new Error("Invalid index");
        return <any>this;
    }
}

export class Unknown extends LeafTerm {
    sort: Sort;
    name: string;

    constructor(name: string, sort: Sort){
        super(0);

        this.sort = sort;
        this.name = name;
    }

    support(): Set<string>{
        return Set();
    }
}

export class Name extends LeafTerm {
    sort: string;
    name: string;

    constructor(name: string, sort: string){
        super(name.length);

        this.sort = sort;
        this.name = name;
    }

    input(caret: Cursor, fragment: string){
        let name = this.name;
        this.name = name.slice(0, caret.head)
                  + fragment
                  + name.slice(caret.head);
    }

    remove(caret: Cursor, length: number = 1){
        let name = this.name;
        this.name = name.slice(0, caret.head)
                  + name.slice(caret.head + length);
    }

    support(): Set<string>{
        return Set(this.name);
    }
}

export abstract class NodeTerm {
    children: Array<Term>;
    sort: Sort;

    constructor(sort: Sort){
        this.sort = sort;
    }

    computeChildren(){
        if(typeof this.sort != "string")
            this.children = computeHoles(this.sort.template).map(this.select.bind(this));
    }

    /**
     * Navigate to a specific child in the Term specified by the Caret.
     */
    navigate(cursor: Cursor | undefined): Term {
        if(cursor === undefined)
            return <any>this;

        return this.children[cursor.head].navigate(cursor.tail);
    }

    /**
     * Given a selector, returns the relevant child Term.
     */
    select(selector: Selector | undefined): Term {
        if(selector === undefined) return <any>this;
        throw new Error("Invalid index");
    }

    /**
     * Move a cursor a specified direction.
     */
    move(caret: Cursor, movement: Movement): CursorChange {
        if(caret.tail != undefined){
            let child = this.children[caret.head];
            let tail = child.move(caret.tail, movement);
            if(tail instanceof Cursor)
                return new Cursor(caret.head, tail);
            movement = <Movement>tail;
        }

        return this.step(caret.head, movement);
    }

    /**
     * Given a position (part of a cursor) step it one step. The small step
     * in the large step function `move' above.
     */
    step(pos: number, movement: Movement): CursorChange{
        let change = Cursor.boundedChange(pos + movement, this.children.length-1);
        if(typeof change == "number") return change; // underflow or overflow

        // We type the child as BaseTerm so that typescript recognises we use
        // BaseTerm#enter.
        let child = this.children[change.head];
        let tail = child.enter(movement);
        return new Cursor(change.head, tail);
    }

    /**
     * Enter this term with a cursor form the specified direction.
     */
    enter(movement: Movement): Cursor{
        let head = (this.children.length - 1) * (1 - movement)/2;
        if(head < 0) return new Cursor(head);
        return new Cursor(head, this.children[head].enter(movement));
    }

    /**
     * Contract the given cursor along a hole specified by the selector. So
     * for example given that this is an integral node with the following
     * structure: int(variable. term, lower_bound, upper_bound). To address the
     * integrand we would use the selector [0, "term"], obtaining the following
     * `#select([0, "term") == term`. However the integral term is presented
     * using the template \int_{lower_bound}^{upper_bound} {term} d{variable}
     * so `term` is visually the 3rd child node of `int`. This function computes
     * exactly that: given the cursor (which is presentational) [3, ...rest],
     * and the selector [0, "term"] it returns [...rest], and given [2, ..rest]
     * it returned undefined. Which are the cursors relative to the child `term`.
     */
    contractAlong(caret: Cursor | undefined, selector: Selector): Cursor | undefined{
        if(caret === undefined) return;

        // find the index of the selector among the children
        let idx = this.children.indexOf(this.select(selector));

        if(caret.head == idx) return caret.tail;
        else return undefined;
    }
}

// Extra methods instances of BaseTerm should have. This is similar to adding
// virtual methods in C#
export interface NodeTerm {
    select(selector: Selector | undefined): Term;
}

export class Tuple extends NodeTerm{
    sort: Product;
    elements: Array<Term>;

    constructor(elements: Array<Term>, sort: Product){
        super(sort);

        this.elements = elements;

        this.computeChildren();
    }

    /**
     * Given a selector, returns the relevant child Term.
     *
     * @param {Selector} selector
     * @param {number} i
     * @returns {Term}
     */
    select(selector: Selector | undefined): Term {
        if(selector === undefined) return this;

        if(typeof selector.head == "number")
            return this.elements[selector.head].select(selector.tail);

        throw new Error("Invalid selector");
    }

    support(): Set<string>{
        return this.elements.reduce(
            (collection: Set<string>, item) => collection.union(item.support())
            , Set<string>()
        );
    }
}

/**
 * The bottom right rule from [NomSets] definition 8.2
 */
export class Bind extends NodeTerm  {
    sort: Binder;
    name: Name;
    term: Term;

    constructor(name: Name, term: Form, sort: Binder){
        super(sort);

        this.name = name;
        this.term = term;

        this.computeChildren();
    }

    /**
     * Given a selector, returns the relevant child Term.
     *
     * @param {Selector} selector
     * @param {number} i
     * @returns {Term}
     */
    select(selector: Selector | undefined): Term {
        if(selector === undefined) return this;

        switch(selector.head) {
            case "name":
                return this.name.select(selector.tail);
            case "term":
                return this.term.select(selector.tail);
            default:
                throw new Error("Invalid selector");
        }
    }

    support(): Set<string>{
        return this.term.support().remove(this.name.name);
    }
}

/**
 * The top middle, top right and bottom left rules from [NomSets] definition 8.2
 */
export class Form extends NodeTerm {
    sort: Former;
    head: Name;
    argument: Tuple;

    constructor(head: Name, argument: Tuple, sort: Former){
        super(sort);

        this.head = head;
        this.argument = argument;

        this.computeChildren();
    }

    /**
     * Given a selector, returns the relevant child Term.
     *
     * @param {Selector} selector
     * @returns {Term}
     */
    select(selector: Selector | undefined): Term {
        if(selector === undefined) return this;

        let idx = selector.head;
        if(typeof idx == "number")
            return this.argument.select(selector);

        if(idx == "head")
            return this.head.select(selector.tail);

        throw new Error("Invalid selector");
    }

    support(): Set<string>{
        return this.argument.support();
    }
}