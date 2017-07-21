/**
 * Epistemic status: low
 */

import * as React from "react";
import {KeyboardEvent, PureComponent, ReactElement} from "react";
import {Term} from "../nominal/terms";
import {MathInline} from "./Atoms";
import {Cursor, CursorChange, Movement} from "../nominal/navigate";

//export type Doc = Array<string | TermNode>;

export interface EditorProps  {
    term: Term,
}

export interface EditorState {
    caret: Cursor,
}

const ARROW_LEFT = 37;
const ARROW_RIGHT = 39;

export class Editor extends PureComponent<EditorProps, EditorState> {
    constructor(props: EditorProps){
        super(props);
        this.state = {caret: props.term.enter(+1)};
    }

    moveCaret(delta: Movement){
        const term = this.props.term;
        let caretChange = term.move(this.state.caret, delta);
        this.setState({
            caret: caretChange instanceof Cursor
                 ? caretChange
                 : term.enter(-caretChange)
        })
    }

    keyDown(evt: KeyboardEvent<HTMLDivElement>){
        switch(evt.keyCode){
            case ARROW_LEFT:
                this.moveCaret(-1);
                break;

            case ARROW_RIGHT:
                this.moveCaret(+1);
                break;
        }
    }

    render(): ReactElement<any> {
        const caret = this.state.caret, term = this.props.term;
        console.log(caret.asArray(), term.navigate(caret));

        return <div className="editor" tabIndex={0} onKeyDown={this.keyDown.bind(this)}>
            <MathInline term={this.props.term} caret={this.state.caret} />
        </div>;
    }
}

export interface TextFragmentProps  {
    fragment: string,
    caret?: Cursor
}

export class TextFragment extends PureComponent<TextFragmentProps, EditorState> {
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