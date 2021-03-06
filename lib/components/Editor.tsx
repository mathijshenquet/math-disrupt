/**
 * Epistemic status: low
 */

import * as React from "react";
import {KeyboardEvent, PureComponent, ReactElement} from "react";
import {Term} from "../nominal/term";
import {MathInline} from "./containers";
import {Cursor, Movement} from "../navigate/cursor";
import {move} from "../navigate/navigable";

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
        this.state = {caret: Cursor.enter(props.term, +1)};
    }

    moveCaret(delta: Movement){
        const term = this.props.term;
        let caretChange = move(term, this.state.caret, delta);
        this.setState({
            caret: caretChange instanceof Cursor
                 ? caretChange
                 : Cursor.enter(term, -caretChange)
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

        return <div className="editor" tabIndex={0} onKeyDown={this.keyDown.bind(this)}>
            <MathInline term={this.props.term} caret={this.state.caret} />
        </div>;
    }
}