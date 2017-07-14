/**
 * Defines the mathematical presentation markup. This is modelled
 * on [TeXbook, chapter 17] and [MathML, chapter 3].
 *
 * [TeXbook]: The TeXBook, Donald Knuth,
 *            http://www.ctex.org/documents/shredder/src/texbook.pdf
 * [MathML]: https://www.w3.org/TR/MathML3/chapter3.html
 *
 * All presentational data types are parameterized by a type T. The type T
 * represents additional elements that can appear in the data. These extra
 * elements of type T can be thought of as holes. These holes are used in
 * practice to lazily expand nominal syntax into presentation
 * (see expandable.ts).
 *
 * Epistemic status: medium
 * @module lib/presentation/data
 */

import {FontVariant} from "./misc";

/**
 * This is an empty type without any valid members. By default the type of holes
 * T is Empty. In that case the presentational datatypes just contain ordinary
 * members.
 */
export enum Empty {}

/**
 * The basic structural element of presentational math is the MathList.
 * This concept is taken from [TeXbook, page 157]. And is similar to
 * the MathML <mrow> see [MathML, 3.3.1].
 */
export type MathList<T=Empty> = Array<Atom<T> | T>;

/**
 * A field is an TeX notion, an TeX atom contains a nucleus, sub- and supscript
 * Field all of which are empty, contain a symbol or a MathList. Empty will
 * be represented by the absence of a field (see below).
 */
export type Field<T=Empty> = T | MathList<T>;

/**
 * An atom consists a priori only of a nucleus. Then there are some optional styling
 * arguments variant and color. Then there is an optional superscript an subscript.
 */
export class BaseAtom<T=Empty>{
    nucleus: string;
    kind: string;

    variant?: FontVariant;
    color?: string;
    size?: string;

    sup?: Field<T>;
    sub?: Field<T>;

    constructor(kind: string, nucleus: string){
        this.kind = kind;
        this.nucleus = nucleus;
    }
}

export type Atom<T=Empty> = OrdPunct<T> | Op<T> | BinRel<T> | Fence<T> | Dec<T>;

/**
 * Represents an ordinary atom, like an identifier.
 * Or a punctuation like . or ,.
 */
export class OrdPunct<T=Empty> extends BaseAtom<T>{
    kind: "ord" | "punct";
    nucleus: string;
}

/**
 * Represents a unary operator like \int, \sum or \prod.
 */
export class Op<T=Empty> extends BaseAtom<T>{
    kind: "op" = "op";
    nucleus: string;
    inner: Field<T>;

    constructor(kind: string, nucleus: string, inner: Field<T>){
        super(kind, nucleus);
        this.inner = inner;
    }
}

/**
 * Represents a binary operator like + or -, or a binary relation
 * like = and <
 */
export class BinRel<T=Empty> extends BaseAtom<T>{
    kind: "bin" | "rel";
    nucleus: string;
    left: Field<T>;
    right: Field<T>;

    constructor(kind: "bin" | "rel", nucleus: string, left: Field<T>, right: Field<T>){
        super(kind, nucleus);
        this.left = left;
        this.right = right;
    }
}

/**
 * represents a matching pair of braces.
 */
export class Fence<T=Empty>{
    kind: "fence"="fence";
    inner: Field<T>;
    open: string;
    close: string;

    sup?: Field<T>;
    sub?: Field<T>;

    constructor(open: string, close: string | undefined, inner: Field<T>){
        this.open = open;
        if(close) this.close = close;
        this.inner = inner;
    }
}

/**
 * Represents a decorated item: \over \under or \rad.
 */
export class Dec<T=Empty>{
    kind: "over" | "under" | "rad";
    nucleus: Field<T>;

    sup?: Field<T>;
    sub?: Field<T>;
}