/**
 * Epistemic status: low
 */

import * as React from "react";
import {PureComponent, ReactElement} from "react";
import {Term} from "../nominal/terms";
import {Cursor, Selector} from "../nominal/navigate";
import {
    Atom, Field, SubSup, Options, Hole,
    BaseAtom
} from "../presentation/markup";

export interface HoleExpander{
    (selector: Selector, role: Array<string>): ReactElement<any>;
}

export interface MathTermProps  {
    term: Term,
    caret?: Cursor,
    roles: Array<string>,
}

export class MathTerm extends PureComponent<MathTermProps, {}> {
    render(): ReactElement<any> {
        const term = this.props.term;
        const caret = this.props.caret;
        const roles = this.props.roles;

        let $ = (selector: Selector, roles: Array<string>) => {
            let newCaret = term.contractAlong(caret, selector);
            if(newCaret != undefined) roles.push("cursor");

            console.log("$", term.select(selector));

            return <MathTerm term={term.select(selector)} caret={newCaret} roles={roles} />
        };

        const template = term.template;

        if(typeof template == "string" && caret){
            let pos: number = caret.head;
            return <span className={roles.join(" ")}>
                <span key="left">{template.slice(0, pos)}</span>
                <span key="caret" className="caret" />
                <span key="right">{template.slice(pos)}</span>
            </span>;
        }else{
            return render(roles, template, $);
        }
    }
}

function render(roles: Array<string>, template: Field, $: HoleExpander): ReactElement<any>{
    if(template instanceof Array) {
        if(template.length == 1){
            return renderAtom(roles, template[0], $);
        }else {
            return <span className={roles.join(" ")}>
                {template.map((item) => renderAtom([], item, $))}
            </span>;
        }
    }

    if(typeof template === "string")
        return <span className={roles.join(" ")}>{template}</span>;

    return renderAtom(roles, template, $);
}

function renderBase(roles: Array<string>, atom: BaseAtom, $: HoleExpander): ReactElement<any> {
    roles.push(atom.kind);
    if (atom.size) roles.push(atom.size);
    if (atom.variant) roles.push("variant-" + atom.variant);

    let subsup = [];
    if (atom.sub) subsup.push(render(["sub"], atom.sub, $));
    if (atom.sup) subsup.push(render(["sup"], atom.sup, $));

    if (subsup.length == 0) {
        return render(roles, atom.nucleus, $);
    } else {
        return <span className={roles.join(" ")}>
            {render(["nucleus"], atom.nucleus, $)}
            <span className="subsup">{subsup}</span>
        </span>;
    }
}

function renderAtom(roles: Array<string>, atom: Atom | Hole, $: HoleExpander): ReactElement<any> {
    switch(atom.kind) {
        case "hole":
            Array.prototype.push.apply(roles, atom.roles);
            return $(atom.selector, roles);

        case "ord":
            return renderBase(roles, atom, $);

        case "op":
            roles.push("op-wrap");
            return <span className={roles.join(" ")}>
                {renderBase([], atom, $)}
                {render(["inner"], atom.inner, $)}
            </span>;

        case "bin":
        case "rel":
            roles.push(`${atom.kind}-wrap`);
            return <span className={roles.join(" ")}>
                {render(["left"], atom.left, $)}
                {renderBase(["inner"], atom, $)}
                {render(["right"], atom.right, $)}
            </span>;

        case "fence":
            roles.push("fenced");
            return <span className={roles.join(" ")}>
                    <span className="open">{atom.open}</span>
                {render(["inner"], atom.inner, $)}
                <span className="close">{atom.close}</span>
            </span>;

        default:
            return <span className="error">TODO {atom.kind}</span>
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