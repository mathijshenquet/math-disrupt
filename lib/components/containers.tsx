import {Term} from "../nominal/term";
import {Cursor} from "../nominal/cursor";
import {PureComponent, ReactElement} from "react";
import {MathTerm} from "./MathTerm";
import * as React from "react";

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

export class MathBlock extends PureComponent<MathBlockProps, {}> {
    render(): ReactElement<any> {
        let term = this.props.term, caret = this.props.caret;
        return <MathTerm term={term} caret={caret} roles={["MathRoot"]} />;
    }
}

export interface TextFragmentProps  {
    fragment: string,
    caret?: Cursor
}

export class TextFragment extends PureComponent<TextFragmentProps, {}> {
    render(): ReactElement<any> {
        let fragment = this.props.fragment;
        let caret;
        if(this.props.caret) caret = this.props.caret.head;
        if(caret && 0 <= caret && caret < fragment.length){
            return <span>
                <span key="left">{fragment.slice(0, caret)}</span>
                <span key="caret" className="caret" />
                <span key="right">{fragment.slice(caret)}</span>
            </span>;
        }else{
            return <span>{fragment}</span>;
        }
    }
}