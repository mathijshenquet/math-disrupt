
export enum Movement {
    Left=-1,
    Right=+1
}

/**
 * A selector is meant to specify a
 */
export type Selector = Array<number | string>;

export class Cursor{
    head: number;
    tail?: Cursor;

    constructor(head: number, tail?: Cursor){
        this.head = head; this.tail = tail;
    }

    static boundedChange(pos: number, max: number): CursorChange {
        if(pos < 0) return Movement.Left;
        if(pos >= max) return Movement.Right;
        else return new Cursor(pos);
    }

    static contractAlong(caret: Cursor | undefined, _selector: Cursor): Cursor | undefined {
        if(caret === undefined) return undefined;

        let selector: Cursor | undefined = _selector;
        while(selector){
            if(!caret || caret.head != selector.head) return undefined;

            caret = caret.tail;
            selector = selector.tail;
        }

        return caret;
    }

    asArray(): Array<number>{
        let out = [];
        let caret: undefined | Cursor = this;
        while(caret){
            out.push(caret.head);
            caret = caret.tail;
        }
        return out;
    }

    static fromArray(list: Array<number>): Cursor | undefined {
        let caret;
        for(let i = list.length-1; i >= 0; i--){
            caret = new Cursor(list[i], caret);
        }
        return caret;
    }
}

export type CursorChange = Cursor | Movement;