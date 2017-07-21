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

export * from "./general";
export * from "./atoms";
export * from "./renderable";