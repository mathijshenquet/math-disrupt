/**
 * Epistemic status: very low, really needs a rework
 * @module presentation/builder
 */

import {MathList, Atom, BinRel, Fence, Field, BaseAtom, Op, OrdPunct, Dec} from "./data";
import {Expandable} from "./expandable";

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

    pushitem(item : Atom<T>) {
        this.cursor.push(item);
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
        this.pushItem(ord);
    }

    ord(nucleus: string){
        return this.pushItem(new OrdPunct<T>("ord", nucleus));
    }

    punct(nucleus: string){
        this.pushItem(new OrdPunct<T>("punct", nucleus));
    }

    op(nucleus: string, inner: Field<T>){
        this.pushItem(new Op<T>("op", nucleus, inner));
    }

    bin(nucleus: string, left: Field<T>, right: Field<T>){
        this.pushItem(new BinRel("bin", nucleus, left, right));
    }

    rel(nucleus: string, left: Field<T>, right: Field<T>){
        this.pushItem(new BinRel("rel", nucleus, left, right));
    }

    openclose(left: string, right: string, inner: Field<T>){
        this.pushItem(new Fence(left, right, inner));
    }

    open(left: string){
        let inner: MathList<T> = [];
        this.pushItem(new Fence<T>(left, undefined, inner));
        this.push(inner);
    }

    close(right: string){
        this.pop();
        let openclose = <Fence>this.peekItem();
        openclose.close = right;
    }

    append(tail: Atom<T> | MathList<T>){
        if(tail instanceof Builder){
            for(const item of tail.items) {
                this.pushItem(item);
            }
        }else if(tail instanceof Array){
            for(const item of tail){
                this.append(item);
            }
        }else{
            this.pushItem(tail);
        }
    }
}
