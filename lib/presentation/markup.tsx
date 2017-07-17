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
import {Renderable, RenderState} from "./expandable";
import {ReactElement} from "react";

/**
 * This is an empty type called `never' without any valid members. By default
 * the type of holes T is `never'. In that case the presentational datatypes
 * just contain ordinary members.
 */
export class Augmented<T> implements Renderable<T>{
    augmentation: T;
    contents: MathList<T> | Atom<T>;

    constructor(augmentation: T, content: MathList<T> | Atom<T>){
        this.augmentation = augmentation;
        this.contents = content;
    }

    render(renderer: RenderState<T>, role?: string): ReactElement<any> {
        return renderer(this, role);
    }
}

/**
 * The basic structural element of presentational math is the MathList.
 * This concept is taken from [TeXbook, page 157]. And is similar to
 * the MathML <mrow> see [MathML, 3.3.1].
 */
export type MathList<T=never> = Array<Atom<T>>;

/**
 * A field is an TeX notion, an TeX atom contains a nucleus, sub- and supscript
 * Field all of which are empty, contain a symbol or a MathList. Empty will
 * be represented by the absence of a field (see below).
 */
export type Field<T=never> = Atom<T> | MathList<T>;

export function render<T>(role: string | undefined, field: Field<T>, renderer: RenderState<T>): ReactElement<any> {
    if(field instanceof Array)
        return <span className={role}>
            {field.map((item) => item.render(renderer))}
        </span>;

    return field.render(renderer, role);
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

    render(renderer: RenderState<T>, role?: string): ReactElement<any> {
        let classes = [this.kind];
        if(this.size)    classes.push(this.size);
        if(this.variant) classes.push("variant-" + this.variant);
        if(role)         classes.push(role);

        let subsup = [];
        if(this.sub) subsup.push(render("sub", this.sub, renderer));
        if(this.sup) subsup.push(render("sup", this.sup, renderer));

        if(subsup.length == 0){
            return <span className={classes.join(" ")}>{this.nucleus}</span>;
        }else {
            return <span className={classes.join(" ")}>
                <span className="nucleus">{this.nucleus}</span>
                <span className="subsup">{subsup}</span>
            </span>;
        }
    }
}

export type Atom<T=never>
    = Augmented<T> | OrdPunct<T> | Op<T> | BinRel<T> | Fence<T> | Dec<T>;

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

    render(renderer: RenderState<T>, role?: string): JSX.Element{
        let classes = ["op-wrap"];
        if(role) classes.push(role);

        return <span className={classes.join(" ")}>
            {super.render(renderer)}
            {render("inner", this.inner, renderer)}
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

    render(renderer: RenderState<T>, role?: string): JSX.Element{
        let classes = [this.kind + "-wrap"];
        if(role) classes.push(role);

        return <span className={classes.join(" ")}>
            {render("left", this.left, renderer)}
            {super.render(renderer)}
            {render("right", this.right, renderer)}
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

    render(renderer: RenderState<T>, role?: string): JSX.Element{
        let classes = ["fenced"];
        if(role) classes.push(role);

        return <span className={classes.join(" ")}>
            <span className="open">{this.open}</span>
            {render("inner", this.inner, renderer)}
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

    render(renderer: RenderState<T>, role?: string): JSX.Element {
        return <span>TODO Dec {this.kind}</span>
    }
}