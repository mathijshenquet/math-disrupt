/**
 * Epistemic status: low
 */

import * as React from "react";
import {PureComponent, ReactElement, ReactNode} from "react";
import {Augmented, render} from "../presentation";
import {Term} from "../nominal/terms";
import {RenderState} from "../presentation/expandable";
import {Field} from "../presentation/markup";

let termRenderer: RenderState<Term> = (term: Augmented<Term>, role?: string) =>
    <MathTerm term={term.augmentation} role={role} contents={term.contents} />;

export interface MathTermProps  {
    term: Term,
    role?: string,
    contents: Field<Term>,
}

export class MathTerm extends PureComponent<MathTermProps, {}> {
    render(): ReactElement<any> {
        return render(this.props.role, this.props.contents, termRenderer);
    }
}

export interface MathBlockProps  {
    term: Term,
    caret?: Array<number>
}

export class MathInline extends PureComponent<MathBlockProps, {}> {
    render(): ReactElement<any> {
        return termRenderer(this.props.term.expand(), "MathRoot");
    }
}