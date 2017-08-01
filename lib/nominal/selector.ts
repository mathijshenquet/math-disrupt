/**
 * A generic way to select parts of a javascript object.
 *
 * @module nominal/selector
 */
import {Cursor} from "./cursor";
import {Term} from "./term";

/**
 * A selector is meant to specify a part of an term
 */
export class SelectorNode {
    head: number | string;
    tail?: Selector;

    constructor(head: number | string, tail?: Selector){
        this.head = head;
        this.tail = tail;
    }

    static fromArray(list: Array<number | string>): Selector | undefined {
        let caret: Selector | undefined = undefined;
        for(let i = list.length-1; i >= 0; i--){
            caret = new SelectorNode(list[i], caret);
        }
        return caret;
    }

    select(term: Term) : Term {
        if(term.tree == "leaf") throw new Error("Cannot select on non leaf term");

        let child = term.select(this.head);
        if(!child) throw new Error("Subterm with name "+this.head+" not found");

        if(this.tail != undefined)
            return this.tail.select(child);
        else
            return child;

    }
}

export type Selector = SelectorNode;

export function Selector(...selector: Array<number | string>): Selector{
    let sel = SelectorNode.fromArray(selector);
    if(sel === undefined) throw new Error("Cannot make an empty selector");
    return sel;
}

export interface Selectable{
    select(selector: number | string): any
}
