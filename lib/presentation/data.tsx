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
import * as React from "react";

/**
 * This is an empty type called `never' without any valid members. By default
 * the type of holes T is `never'. In that case the presentational datatypes
 * just contain ordinary members.
 */
export class Hole<T>{
    hole: T;

    constructor(hole: T){
        this.hole = hole;
    }
}

/**
 * The basic structural element of presentational math is the MathList.
 * This concept is taken from [TeXbook, page 157]. And is similar to
 * the MathML <mrow> see [MathML, 3.3.1].
 */
export type MathList<T=never> = Array<Atom<T>>;

export function renderMathList<T>(list: MathList<T>, renderer: Renderer<T>): JSX.Element[] {
    console.log(list);

    return list.map((item) => {
        if(item instanceof Hole)
            return renderer(item.hole, "");
        else
            return item.render(renderer);
    });
}

/**
 * A field is an TeX notion, an TeX atom contains a nucleus, sub- and supscript
 * Field all of which are empty, contain a symbol or a MathList. Empty will
 * be represented by the absence of a field (see below).
 */
export type Field<T=never> = Hole<T> | Atom<T> | MathList<T>;

function renderField<T>(role: string, field: Field<T>, renderer: Renderer<T>): JSX.Element {
    if(field instanceof Hole)
        return renderer(field.hole, role);

    if(field instanceof Array)
        return <span className={role}>{renderMathList(field, renderer)}</span>;

    return field.render(renderer);
}

export interface Renderer<T>{
    (item: T, role: string): JSX.Element
}

export interface Renderable<T>{
    render(expander: Renderer<T>): JSX.Element;
}

/**
 * An atom consists a priori only of a nucleus. Then there are some optional styling
 * arguments variant and color. Then there is an optional superscript an subscript.
 */
export class BaseAtom<T=never> implements Renderable<T>{
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

    render(renderer: Renderer<T>): JSX.Element {
        let className = this.kind;
        if(this.size){
            className += " " + this.size;
        }
        if(this.variant){
            className += " variant-" + this.variant;
        }

        let subsup = [];
        if(this.sub) subsup.push(renderField("sub", this.sub, renderer));
        if(this.sup) subsup.push(renderField("sup", this.sup, renderer));

        if(subsup.length == 0){
            return <span className={className}>{this.nucleus}</span>;
        }else {
            return <span className={className}>
                <span className="nucleus">{this.nucleus}</span>
                <span className="subsup">{subsup}</span>
            </span>;
        }
    }
}

export type Atom<T=never>
    = Hole<T> | OrdPunct<T> | Op<T> | BinRel<T> | Fence<T> | Dec<T>;

/**
 * Represents an ordinary atom, like an identifier.
 * Or a punctuation like . or ,.
 */
export class OrdPunct<T=never> extends BaseAtom<T>{
    kind: "ord" | "punct";
    nucleus: string;
}

/**
 * Represents a unary operator like \int, \sum or \prod.
 */
export class Op<T=never> extends BaseAtom<T>{
    kind: "op" = "op";
    nucleus: string;
    inner: Field<T>;

    constructor(kind: string, nucleus: string, inner: Field<T>){
        super(kind, nucleus);
        this.inner = inner;
    }

    render(renderer: Renderer<T>): JSX.Element{
        return <span className="op-wrap">
            {super.render(renderer)}
            {renderField("inner", this.inner, renderer)}
        </span>;
    }
}

/**
 * Represents a binary operator like + or -, or a binary relation
 * like = and <
 */
export class BinRel<T=never> extends BaseAtom<T>{
    kind: "bin" | "rel";
    nucleus: string;
    left: Field<T>;
    right: Field<T>;

    constructor(kind: "bin" | "rel", nucleus: string, left: Field<T>, right: Field<T>){
        super(kind, nucleus);
        this.left = left;
        this.right = right;
    }

    render(renderer: Renderer<T>): JSX.Element{
        return <span className={this.kind + "-wrap"}>
            {renderField("left", this.left, renderer)}
            {super.render(renderer)}
            {renderField("right", this.right, renderer)}
        </span>;
    }
}

/**
 * represents a matching pair of braces.
 */
export class Fence<T=never> implements Renderable<T>{
    kind: "fence"="fence";
    inner: Field<T>;
    open: string;
    close: string;

    sup?: Field<T>;
    sub?: Field<T>;

    constructor(open: string, close: string, inner: Field<T>){
        this.open = open;
        if(close) this.close = close;
        this.inner = inner;
    }

    render(renderer: Renderer<T>): JSX.Element{
        return <span className="fenced">
            <span className="open">{this.open}</span>
            {renderField("inner", this.inner, renderer)}
            <span className="close">{this.close}</span>
        </span>;
    }
}

/**
 * Represents a decorated item: \over \under or \rad.
 */
export class Dec<T=never> implements Renderable<T>{
    kind: "over" | "under" | "rad";
    nucleus: Field<T>;

    sup?: Field<T>;
    sub?: Field<T>;

    constructor(kind: "over" | "under" | "rad", nucleus: Field<T>){
        this.kind = kind;
        this.nucleus = nucleus;
    }

    render(renderer: Renderer<T>): JSX.Element {
        return <span>TODO Dec {this.kind}</span>
    }
}