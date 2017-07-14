/**
 * Epistemic status: garbage
 */

import * as React from "react";
import {Component, PureComponent} from "react";
import * as Nominal from "../nominal/algebra";

export interface RenderHandler{
    (...children: Nominal.Expr<any>[]): JSX.Element
}

const binary = (head: string) => (left: Nominal.Expr<string>, right: Nominal.Expr<string>) => {
    return <span className="bin">
    <Expr expression={left} />
    <span className="head">{head}</span>
    <Expr expression={right} />
        </span>
};

export let lookup: {[name: string]: RenderHandler} = {
    "var": (name: string) => <span className="var">{name}</span>,
    "num": (num: number) => <span className="numeral">{num.toString()}</span>,
    "+": binary("+"),
    "int": (integrand: Nominal.Bind<string>, low: Nominal.Term<string>, up: Nominal.Term<string>) => {
        return <span className="term">
    <span className="head">int</span>
    <sub><TermExpr term={low} /></sub>
    <sup><TermExpr term={up} /></sup>
    <span className="integrand"><TermExpr term={integrand.term} /></span>
    <span>d<NameExpr atom={integrand.name} sort="var" /></span>
        </span>;
    }
};

export interface Props  {
    expression: Nominal.Expr<any>
}

export class Expr extends Component<Props, {}> {
    render(): JSX.Element {
        let expr: Nominal.Expr<any> = this.props.expression;

        console.log(expr);

        switch(expr.expr){
            case "bind":
                return <BindExpr name={expr.name} term={expr.term} />;

            case "name":
                return <NameExpr atom={expr.name} sort="" />;

            case "term":
                return <TermExpr term={expr} />
        }

        return <span>Error</span>;
    }
}

function *intersperse(a: any[], delim: any) {
    let first = true;
    for (const x of a) {
        if (!first) yield delim;
        first = false;
        yield x;
    }
}

export interface TermProps{
    term: Nominal.Term<any>
}

export class TermExpr extends Component<TermProps, {}>{
    render(){
        let term = this.props.term;

        if(lookup[term.head]){
            return lookup[term.head].apply(this, term.leaves);
        }

        let children = term.leaves.map((leaf: Nominal.Expr<any>) => <Expr expression={leaf} />);
        return <span className="term">
            <span className="head">{term.head}</span>
            <span>(</span>
            {[...intersperse(children, <span>, </span>)]}
            <span>)</span>
        </span>;
    }
}


export interface BindProps{
    name: any,
    term: Nominal.Term<any>
}

export class BindExpr extends Component<BindProps, {}> {
    render(){
        return <span className="bind">
            <NameExpr atom={this.props.name} sort="var" />
            <span>. </span>
            <TermExpr term={this.props.term}  />
        </span>;
    }
}

export interface NameProps{
    atom: any,
    sort: string
}

export class NameExpr extends Component<NameProps, {}> {
    render(){
        return <span className={this.props.sort}>{this.props.atom.name}</span>;
    }
}
