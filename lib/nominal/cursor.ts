
import {Term} from "./term";
import {Selector} from "./selector";

export enum Movement {
    Left=-1,
    Right=+1
}

export class Cursor{
    head: number;
    tail?: Cursor;

    constructor(head: number, tail?: Cursor){
        this.head = head;
        this.tail = tail;
    }

    static boundedChange(pos: number, max: number): CursorChange {
        if(pos < 0) return Movement.Left;
        if(pos > max) return Movement.Right;
        else return new Cursor(pos);
    }

    /**
     * Create a Cursor by entering a term
     */
    static enter(thing: Term, movement: Movement): Cursor{
        let side: number = ((1 - movement) / 2) | 0;
        if(thing.tree == "node") {
            let head = (thing.children.length - 1) * side;
            if (head < 0)
                return new Cursor(head);
            else
                return new Cursor(head, Cursor.enter(thing.children[head], movement));
        }else{
            return thing.enter(movement);
        }
    }

    /**
     * Navigate down into a term using the current cursor.
     */
    navigate(term: Term): any {
        if(term.tree == "leaf") throw new Error();
        let child = term.children[this.head];
        return this.tail ? this.tail.navigate(child) : child;
    }

    /**
     * Returns the current cursor as an array
     */
    asArray(): Array<number>{
        let out = [];
        let caret: undefined | Cursor = this;
        while(caret){
            out.push(caret.head);
            caret = caret.tail;
        }
        return out;
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
    contractAlong(term: Term, selector: Selector): Cursor | undefined{
        if(term.tree == "leaf") return;

        // find the child specified by the selector
        let child = selector.select(term);

        // find the index of the selector among the children
        let idx = term.children.indexOf(child);

        if(this.head == idx) return this.tail;
        else return undefined;
    }
}

export type CursorChange = Cursor | Movement;