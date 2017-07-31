
export enum Movement {
    Left=-1,
    Right=+1
}

/**
 * A selector is meant to specify a part of an term
 */
export type Selector = Cursor<number | string>;

export function Selector(...selector: Array<number | string>): Selector{
    let sel = Cursor.fromArray<number | string>(selector);
    if(sel === undefined) throw new Error("Cannot make an empty selector");
    return sel;
}

export class Cursor<T=number>{
    head: T;
    tail?: Cursor<T>;

    constructor(head: T, tail?: Cursor<T>){
        this.head = head;
        this.tail = tail;
    }

    static boundedChange(pos: number, max: number): CursorChange {
        if(pos < 0) return Movement.Left;
        if(pos > max) return Movement.Right;
        else return new Cursor(pos);
    }

    asArray(): Array<T>{
        let out = [];
        let caret: undefined | Cursor<T> = this;
        while(caret){
            out.push(caret.head);
            caret = caret.tail;
        }
        return out;
    }

    static fromArray<T>(list: Array<T>): Cursor<T> | undefined {
        let caret: Cursor<T> | undefined = undefined;
        for(let i = list.length-1; i >= 0; i--){
            caret = new Cursor<T>(list[i], caret);
        }
        return caret;
    }
}

export type CursorChange = Cursor | Movement;