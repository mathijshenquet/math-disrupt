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

import * as signature from "./signature";
import {Cursor, CursorChange, Movement, Selector} from "./navigate";
import {Builder} from "../presentation/builder";
import {computeHoles, Template} from "../presentation/template";

/**
 * The sets Σ of raw terms over set of atoms A. From [NomSets] definition 8.2
 */
export type Term = Name | Bind | Form | BaseTerm

export abstract class BaseTerm {
    children: Array<Term>;
    template: Template;

    constructor(template: Template){
        this.template = template;
    }

    protected computeChildren(){
        this.children = computeHoles(this.template).map(this.select.bind(this));
    }

    /**
     * Navigat to a specific point in the Term specified by the Caret.
     *
     * @param {Cursor} cursor
     */
    navigate(cursor: Cursor | undefined): Term {
        if(cursor === undefined)
            return this;

        let child: Term = this.children[cursor.head];
        if(child === undefined)
            return this;

        return child.navigate(cursor.tail);
    }

    /**
     * Given a selector, returns the relevant child Term.
     *
     * @param {Selector} selector
     * @returns {Term}
     */
    select(selector: Selector): Term {
        if(selector.length == 0) return this;
        throw new Error("Invalid index");
    }

    /**
     * Move a cursor a specified direction.
     *
     * @param {Cursor} caret
     * @param {Movement} movement
     * @returns {CursorChange}
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
     *
     * @param {number} pos
     * @param {Movement} movement
     * @returns {CursorChange}
     */
    step(pos: number, movement: Movement): CursorChange{
        let change = Cursor.boundedChange(pos + movement, this.children.length);
        if(typeof change == "number") return change; // underflow or overflow

        // We type the child as BaseTerm so that typescript recognises we use
        // BaseTerm#enter.
        let child: BaseTerm = this.children[change.head];
        let tail = child.enter(movement);
        return new Cursor(change.head, tail);
    }

    /**
     * Enter this term with a cursor form the specified direction.
     *
     * @param {Movement} movement
     * @returns {Cursor}
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
     *
     * @param {Cursor} caret
     * @param {Selector} selector
     * @returns {Cursor | void}
     */
    contractAlong(caret: Cursor | undefined, selector: Selector): Cursor | undefined{
        if(caret === undefined) return;

        // find the index of the selector among the children
        let idx = this.children.indexOf(this.select(selector));

        if(caret.head == idx) return caret.tail;
        else return undefined;
    }
}

export interface BaseTerm {
    step(pos: number, movement: Movement): CursorChange;
}

export class Name extends BaseTerm {
    sort: any;
    name: string;

    constructor(name: string, sort: any){
        super(name);

        this.name = name;
        this.sort = sort;

        this.computeChildren();
    }

    enter(movement: Movement): Cursor{
        return new Cursor(this.name.length * (1 - movement)/2);
    }

    step(pos: number, movement: Movement): CursorChange {
        return Cursor.boundedChange(pos + movement, this.name.length+1);
    }
}

/**
 * The bottom right rule from [NomSets] definition 8.2
 */
export class Bind extends BaseTerm  {
    sort: signature.Binder;
    name: Name;
    term: Term;

    constructor(name: Name, term: Form, sort: signature.Binder){
        super([Builder.hole(['name'], ["variant-normal"]), Builder.punct(","), Builder.hole(['term'])]);

        this.name = name;
        this.term = term;
        this.sort = sort;

        this.computeChildren();
    }

    /**
     * Given a selector, returns the relevant child Term.
     *
     * @param {Selector} selector
     * @param {number} i
     * @returns {Term}
     */
    select(selector: Selector): Term {
        if(selector.length == 0)
            return this;

        switch(selector[0]) {
            case "name":
                return this.name.select(selector.slice(1));
            case "term":
                return this.term.select(selector.slice(1));
            default:
                throw new Error("Invalid selector");
        }
    }
}

/**
 * The top middle, top right and bottom left rules from [NomSets] definition 8.2
 */
export class Form extends BaseTerm {
    sort: signature.Former;
    head: Name;
    leaves: Array<Term>;

    constructor(head: Name, leaves: Array<Term>, sort: signature.Former){
        super(sort.template);

        this.head = head;
        this.leaves = leaves;
        this.sort = sort;

        this.computeChildren();
    }

    /**
     * Given a selector, returns the relevant child Term.
     *
     * @param {Selector} selector
     * @param {number} i
     * @returns {Term}
     */
    select(selector: Selector): Term {
        if(selector.length == 0)
            return this;

        let idx = selector[0];
        if(typeof idx == "number")
            return this.leaves[idx].select(selector.slice(1));

        if(idx == "head")
            return this.head.select(selector.slice(1));

        throw new Error("Invalid selector");
    }
}