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
 * @module presentation
 */

import {Name} from "../nominal/name";

/**
 * The basic structural element of presentational math is the MathList.
 * This concept is taken from [TeXbook, page 157]. And is similar to
 * the MathML <mrow> see [MathML, 3.3.1].
 */
export type MathList<H=never> = Array<Atom<H> | H>;

/**
 * A field is a TeX notion, a TeX atom contains a nucleus, sub- and supscript
 * Field all of which are empty, contain a symbol or a MathList. Empty will
 * be represented by the absence of a field (see below).
 */
export type Field<H=never> = string | Atom<H> | H | MathList<H>;

import {FontVariant} from "./misc";

/**
 * Atom
 */
export type Atom<H=never> = OrdPunct<H> | Op<H> | BinRel<H> | Fence<H> | Dec<H>;

export function children(atom: Atom & SubSup): Array<Field>{
    let subsup = [];
    if(atom.sub) subsup.push(atom.sub);
    if(atom.sup) subsup.push(atom.sup);

    switch(atom.kind) {
        case "ord":
        case "op":
            return [atom.nucleus, ...subsup];

        case "bin":
        case "rel":
            return [atom.left, atom.nucleus, ...subsup, atom.right];

        case "fence":
            return [atom.open, atom.inner, atom.close, ...subsup];

        default:
            return []
    }
}

export interface SubSup<H=never> {
    sub?: Field<H>,
    sup?: Field<H>,
}

export interface Options {
    variant?: FontVariant,
    color?: string,
    size?: string,
}

export interface BaseAtom<H=never> extends SubSup<H>, Options {
    kind: string,
    nucleus: Field<H>
}

/**
 * Represents an ordinary atom, like an identifier.
 * Or a punctuation like . or ,.
 */
export interface OrdPunct<H=never> extends BaseAtom<H>{
    kind: "ord" | "punct";
    nucleus: Field<H>;
}

/**
 * Represents a unary operator like \int, \sum or \prod.
 */
export interface Op<H=never> extends BaseAtom<H>{
    kind: "op";
    nucleus: Field<H>;
}

/**
 * Represents a binary operator like + or -, or a binary relation
 * like = and <
 */
export interface BinRel<H=never> extends BaseAtom<H>{
    kind: "bin" | "rel";
    left: Field<H>;
    nucleus: Field<H>;
    right: Field<H>;
}

/**
 * Represents a matching pair of braces.
 */
export interface Fence<H=never> extends Options, SubSup{
    kind: "fence";
    inner: Field<H>;
    open: string;
    close: string;
}

/**
 * Represents a decorated item: \over \under or \rad.
 */
export interface Dec<H=never> extends BaseAtom<H>{
    kind: "over" | "under" | "rad";
    nucleus: Field<H>;
}