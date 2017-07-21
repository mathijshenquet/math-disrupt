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

import {Atom} from "./atoms";
export {Atom} from "./atoms";

/**
 * The basic structural element of presentational math is the MathList.
 * This concept is taken from [TeXbook, page 157]. And is similar to
 * the MathML <mrow> see [MathML, 3.3.1].
 */
export type MathList = Array<Atom>;

/**
 * A field is an TeX notion, an TeX atom contains a nucleus, sub- and supscript
 * Field all of which are empty, contain a symbol or a MathList. Empty will
 * be represented by the absence of a field (see below).
 */
export type Field = string | Atom | MathList;