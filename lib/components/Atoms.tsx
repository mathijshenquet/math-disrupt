/**
 * Epistemic status: low
 */

import * as React from "react";
import {PureComponent, ReactElement} from "react";
import {Term} from "../nominal/terms";
import {Cursor, Selector} from "../nominal/navigate";
import {render} from "../presentation/renderable";

export interface MathTermProps  {
    term: Term,
    caret?: Cursor,
    roles: Array<string>,
}

export class MathTerm extends PureComponent<MathTermProps, {}> {
    render(): ReactElement<any> {
        let term = this.props.term, caret = this.props.caret;

        let $ = (selector: Selector, roles: Array<string>) => {
            let newCaret = term.contractAlong(caret, selector);
            if(newCaret != undefined) roles.push("cursor");
            return <MathTerm term={term.select(selector)} caret={newCaret} roles={roles} />
        };

        return render(this.props.roles, term.template, $);
    }
}

export interface MathBlockProps  {
    term: Term,
    caret?: Cursor
}

export class MathInline extends PureComponent<MathBlockProps, {}> {
    render(): ReactElement<any> {
        let term = this.props.term, caret = this.props.caret;
        return <MathTerm term={term} caret={caret} roles={["MathRoot"]} />;
    }
}