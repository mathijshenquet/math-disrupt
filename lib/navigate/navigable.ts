import {Cursor, CursorChange, Movement} from "./cursor";
import {Term} from "../nominal/term";

export interface NavigableLeaf {
    tree: "leaf";

    /**
     * Given a position (part of a cursor) step it one step. The small step
     * in the large step function `move' above.
     */
    step(pos: number, movement: Movement): CursorChange

    /**
     * Enter
     */
    enter(movement: Movement): Cursor
}

export interface NavigableNode {
    tree: "node";
    children: Array<Navigable>;
}

export type Navigable = NavigableLeaf | NavigableNode;

export function move(term: Term, caret: Cursor, movement: Movement): CursorChange {

    // if this is not the end of the cursor
    if(caret.tail != undefined){

        // we must have a tree
        if(term.tree != "node") throw new Error();

        // determine the new CursorChange relative to the child
        let tail = move(term.children[caret.head], caret.tail, movement);

        // if it's just a Cursor we are done
        if(tail instanceof Cursor)
            // append the local cursor to the tail
            return new Cursor(caret.head, tail);

        // otherwise we overflowed and we continue
        movement = <Movement>tail;
    }

    if(term.tree == "leaf") // we now do a small step, for this we use that Term is navigable
        return term.step(caret.head, movement);

    let change = Cursor.boundedChange(caret.head + movement, term.children.length-1);

    // if we overflowed, or if we are a leaf return to higher lvl
    if(typeof change == "number")
        return change;

    // since we are a tree node we will enter the child from the appropriate side
    let tail = Cursor.enter(term.children[change.head], movement);
    return new Cursor(change.head, tail);
}
