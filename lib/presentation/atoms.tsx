
import {Field, Atom, MathList} from "./general";
import {FontVariant} from "./misc";
import {Term} from "../nominal/terms";
import {Cursor, Movement, Selector} from "../nominal/navigate";

/**
 * Atom
 */
export type Atom = Hole | OrdPunct | Op | BinRel | Fence | Dec;

export function children(atom: Atom & SubSup): Array<Field>{
    let subsup = [];
    if(atom.sub) subsup.push(atom.sub);
    if(atom.sup) subsup.push(atom.sup);

    switch(atom.kind) {
        case "ord":
            return [atom.nucleus, ...subsup];

        case "hole":
            return [];

        case "op":
            return [atom.nucleus, ...subsup, atom.inner];

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

/**
 * Represents an ordinary atom, like an identifier.
 * Or a punctuation like . or ,.
 */
export interface OrdPunct extends Options{
    kind: "ord" | "punct";
    nucleus: Field;
}

/**
 * Represents a unary operator like \int, \sum or \prod.
 */
export interface Op extends Options{
    kind: "op";
    nucleus: Field;
    inner: Field;
}

/**
 * Represents a binary operator like + or -, or a binary relation
 * like = and <
 */
export interface BinRel extends Options{
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
export interface Dec extends Options{
    kind: "over" | "under" | "rad";
    nucleus: Field;
}