/**
 * Epistemic status: low
 */

import * as React from "react";
import {PureComponent} from "react";
import {Expandable} from "../presentation";
import {renderMathList} from "../presentation/data";

export interface MathTermProps  {
    term: Expandable,
    role: string
}

export class MathTerm extends PureComponent<MathTermProps, {}> {
    render(): JSX.Element {
        let items = this.props.term.expand();
        return <span className={"MathTerm "+this.props.role}>
            {renderMathList(items, (item, role) => <MathTerm term={item} role={role} />)}
        </span>;
    }
}

export interface MathBlockProps  {
    term: Expandable
}

export class MathInline extends PureComponent<MathBlockProps, {}> {
    render(): JSX.Element {
        let items = this.props.term.expand();
        return <span className="MathRoot">
            {renderMathList(items, (item, role) => <MathTerm term={item} role={role} />)}
        </span>;
    }
}