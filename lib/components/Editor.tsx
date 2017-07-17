/**
 * Epistemic status: low
 */

import * as React from "react";
import {
    KeyboardEvent, PureComponent, ReactElement, ReactFragment,
    ReactNode
} from "react";
import {Term} from "../nominal/terms";
import {MathInline} from "./Atoms";

export type Doc = Array<string | Term>;

export interface EditorProps  {
    doc: Doc,
}

export interface EditorState {
    caret: Array<number>,
}

const ARROW_LEFT = 37;
const ARROW_RIGHT = 39;

export class Editor extends PureComponent<EditorProps, EditorState> {
    constructor(props: EditorProps){
        super(props);
        this.state = {caret: [0]};
    }

    keyDown(evt: KeyboardEvent<HTMLDivElement>){
        console.log(evt);
        const doc = this.props.doc;

        switch(evt.keyCode){
            case ARROW_LEFT:
                break;

            case ARROW_RIGHT:
                break;
        }
    }

    render(): ReactElement<any> {
        const caret = this.state.caret;
        const doc = this.props.doc;

        const items: Array<ReactNode> = [];
        for(let i = 0; i < doc.length; i++){
            const item = doc[i];

            if(caret[0] == i){
                if(caret[1] != 0) {
                    if (typeof item === "string") {
                        items.push(<TextFragment fragment={item}
                                                 caret={caret[1]}/>);
                    } else {
                        items.push(<MathInline key={i} term={item}
                                               caret={caret.slice(1)}/>);
                    }
                }else{
                    items.push(<span key="caret" className="caret" />);
                }
            }else{
                if (typeof item === "string") {
                    items.push(<TextFragment fragment={item} />);
                } else {
                    items.push(<MathInline key={i} term={item} />);
                }
            }
        }

        return <div className="editor" tabIndex={0} onKeyDown={this.keyDown.bind(this)}>{items}</div>;
    }
}

export interface TextFragmentProps  {
    fragment: string,
    caret?: number
}

export class TextFragment extends PureComponent<TextFragmentProps, EditorState> {
    render(): ReactElement<any> {
        let fragment = this.props.fragment;
        let caret = this.props.caret;
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