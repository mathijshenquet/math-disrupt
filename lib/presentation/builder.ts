/**
 * Epistemic status: very low, really needs a rework
 * @module presentation/builder
 */

import {
    MathList, Atom, BinRel, Fence, Field, Op, OrdPunct, Dec,
    Hole
} from "./data";

/**
 * We use this class to conveniently build MathLists using the append
 * function this allows concatenation or adding null elements.
 *
 * @param S - The type of symbols
 */
export class Builder<T>{
    items: MathList<T>;

    private stack: Array<MathList<T>>;
    private cursor: MathList<T>;

    constructor(){
        this.items = [];
        this.cursor = this.items;
        this.stack = [];
    }

    item(item: Atom<T>){
        this.cursor.push(item);
    }

    hole(item: T){
        this.cursor.push(new Hole(item))
    }

    push(inner: MathList<T> = []){
        this.stack.push(this.cursor);
        this.cursor = inner;
    }

    pop(){
        let cursor = this.stack.pop();
        if(cursor === undefined){
            console.log(this);
            throw new Error("Cannot pop sublist, bottom of stack reached");
        }

        const inner = this.cursor;
        this.cursor = cursor;
        return inner;
    }

    symbol(nucleus: string){
        let ord = new OrdPunct<T>("ord", nucleus);
        ord.variant = "normal";
        this.item(ord);
    }

    ord(nucleus: string){
        return this.item(new OrdPunct<T>("ord", nucleus));
    }

    punct(nucleus: string){
        this.item(new OrdPunct<T>("punct", nucleus));
    }

    op(nucleus: string, inner: Field<T>): Op<T> {
        let op = new Op<T>("op", nucleus, inner);
        this.item(op);
        return op;
    }

    bin(nucleus: string, left: Field<T>, right: Field<T>){
        this.item(new BinRel("bin", nucleus, left, right));
    }

    rel(nucleus: string, left: Field<T>, right: Field<T>){
        this.item(new BinRel("rel", nucleus, left, right));
    }

    fence(left: string, inner: Field<T>, right: string){
        this.item(new Fence(left, right, inner));
    }

    overline(inner: Field<T>){
        this.item(new Dec("over", inner));
    }

    append(tail: Atom<T> | MathList<T>){
        if(tail instanceof Builder){
            for(const item of tail.items) {
                this.item(item);
            }
        }else if(tail instanceof Array){
            for(const item of tail){
                this.append(item);
            }
        }
    }
}
