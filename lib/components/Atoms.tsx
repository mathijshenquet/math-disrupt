/**
 * epistemic status: very low
 */

import * as React from "react";
import {Component, PureComponent} from "react";
import * as presentation from "../presentation";
import {Expandable} from "../presentation";
import {Builder} from "../presentation/builder";

export interface MathListProps  {
    expr: Expandable
}

export class MathList extends PureComponent<MathListProps, {}> {
    render(): JSX.Element {
        let items = this.props.expr.expand();

        let builder = new Builder();
        this.props.items.present(builder);
        console.log(builder.items);

        let items = builder.items.map((atom) => <Atom atom={atom} />);
        return <span>{items}</span>;
    }
}

export interface AtomProps  {
    atom: presentation.Atom
}

export class Atom extends Component<AtomProps, {}> {
    renderField(field: presentation.Field<string>): JSX.Element[] | string[] {
        if(field == null)
            return [];

        if(typeof field == "string")
            return [field];

        return field.map((atom) => <Atom atom={atom} />);
    }

    renderBase(atom: presentation.BaseAtom): JSX.Element {
        let className = atom.kind
        if(atom.size){
            className += " " + atom.size;
        }
        if(atom.variant){
            className += " variant-" + atom.variant;
        }

        if(!atom.sub && !atom.sup){
            return <span className={className}>{atom.nucleus}</span>;
        }else{
            return <span className={className}>
                <span className="nucleus">
                    {this.renderField(atom.nucleus)}
                </span>
                <span className="subsup">
                    <span className="sub">{this.renderField(atom.sub)}</span>
                    <span className="sup">{this.renderField(atom.sup)}</span>
                </span>
            </span>;
        }
    }

    render(): JSX.Element {
        let atom = this.props.atom;

        switch(atom.kind){
            case "ord":
            case "punct":
                return this.renderBase(atom);

            case "op":
                return <span className="op-wrap">
                    {this.renderBase(atom)}
                    {this.renderField(atom.inner)}
                </span>;


            case "fence":
                return <span className="fenced">
                    <span className="open">{atom.left}</span>
                    {this.renderField(atom.nucleus)}
                    <span className="close">{atom.right}</span>
                </span>;

            case "bin":
            case "rel":
                return <span className={atom.kind + "-wrap"}>
                    {this.renderField(atom.left)}
                    {this.renderBase(atom)}
                    {this.renderField(atom.right)}
                </span>;
        }

        console.log(atom);

        return <span>Not defined {atom.kind}</span>;
    }
}

