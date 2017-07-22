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

/**
 * The basic structural element of presentational math is the MathList.
 * This concept is taken from [TeXbook, page 157]. And is similar to
 * the MathML <mrow> see [MathML, 3.3.1].
 */
export type MathList = Array<Atom | Hole>;

/**
 * A field is an TeX notion, an TeX atom contains a nucleus, sub- and supscript
 * Field all of which are empty, contain a symbol or a MathList. Empty will
 * be represented by the absence of a field (see below).
 */
export type Field = string | Atom | Hole | MathList;

import {FontVariant} from "./misc";
import {Selector} from "../nominal/navigate";

/**
 * Atom
 */
export type Atom = OrdPunct | Op | BinRel | Fence | Dec;

export function children(atom: Atom & SubSup): Array<Field>{
    let subsup = [];
    if(atom.sub) subsup.push(atom.sub);
    if(atom.sup) subsup.push(atom.sup);

    switch(atom.kind) {
        case "ord":
        case "op":
            return [atom.nucleus, ...subsup];

        /*
        case "hole":
            return [];

        case "op":
            return [atom.nucleus, ...subsup, atom.inner];
        */

        case "bin":
        case "rel":
            return [atom.left, atom.nucleus, ...subsup, atom.right];

        case "fence":
            return [atom.open, atom.inner, atom.close, ...subsup];

        default:
            return []
    }
}

export interface SubSup {
    sub?: Field,
    sup?: Field,
}

export interface Options {
    variant?: FontVariant,
    color?: string,
    size?: string,
}

export interface Hole {
    kind: "hole";
    selector: Selector;
    roles: Array<string>;
}

export interface BaseAtom extends SubSup, Options {
    kind: string,
    nucleus: Field
}

/**
 * Represents an ordinary atom, like an identifier.
 * Or a punctuation like . or ,.
 */
export interface OrdPunct extends BaseAtom{
    kind: "ord" | "punct";
    nucleus: Field;
}

/**
 * Represents a unary operator like \int, \sum or \prod.
 */
export interface Op extends BaseAtom{
    kind: "op";
    nucleus: Field;
}

/**
 * Represents a binary operator like + or -, or a binary relation
 * like = and <
 */
export interface BinRel extends BaseAtom{
    kind: "bin" | "rel";
    left: Field;
    nucleus: Field;
    right: Field;
}

/**
 * represents a matching pair of braces.
 */
export interface Fence extends Options{
    kind: "fence";
    inner: Field;
    open: string;
    close: string;
}

/**
 * Represents a decorated item: \over \under or \rad.
 */
export interface Dec extends BaseAtom{
    kind: "over" | "under" | "rad";
    nucleus: Field;
}