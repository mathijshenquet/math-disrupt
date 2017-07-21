/**
 * Epistemic status: low
 */

import * as React from "react";
import {PureComponent, ReactElement} from "react";
import {Term} from "../nominal/terms";
import {Cursor, Selector} from "../nominal/navigate";
import {Field} from "../presentation/markup";

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

            console.log("$", term.select(selector));

            return <MathTerm term={term.select(selector)} caret={newCaret} roles={roles} />
        };

        return render(this.props.roles, term.template, $);
    }
}

export interface HoleExpander{
    (selector: Selector, role: Array<string>): ReactElement<any>;
}

function renderBase(roles: Array<string>, $: HoleExpander): ReactElement<any> {
    roles.push(this.kind);
    if (this.size) roles.push(this.size);
    if (this.variant) roles.push("variant-" + this.variant);

    let subsup = [];
    if (this.sub) subsup.push(render(["sub"], this.sub, $));
    if (this.sup) subsup.push(render(["sup"], this.sup, $));

    if (subsup.length == 0) {
        return render(roles, this.nucleus, $);
    } else {
        return <span className={roles.join(" ")}>
            {render(["nucleus"], this.nucleus, $)}
            <span className="subsup">{subsup}</span>
        </span>;
    }
}

export function render(roles: Array<string>, field: Field, $: HoleExpander): ReactElement<any> {
    if(field instanceof Array) {
        if(field.length == 1){
            field = field[0];
        }else {
            return <span className={roles.join(" ")}>
                {field.map((item) => render([], item, $))}
            </span>;
        }
    }

    if(typeof field === "string")
        return <span className={roles.join(" ")}>{field}</span>;

    switch(field.kind) {
        case "ord":
            return renderBase.call(field, roles, $);

        case "hole":
            Array.prototype.push.apply(roles, field.roles);
            return $(field.selector, roles);

        case "op":
            roles.push("op-wrap");
            return <span className={roles.join(" ")}>
                {renderBase.call(field, [], $)}
                {render(["inner"], field.inner, $)}
            </span>;

        case "bin":
        case "rel":
            roles.push(`${field.kind}-wrap`);
            return <span className={roles.join(" ")}>
                {render(["left"], field.left, $)}
                {renderBase.call(field, ["inner"], $)}
                {render(["right"], field.right, $)}
            </span>;

        case "fence":
            roles.push("fenced");
            return <span className={roles.join(" ")}>
                    <span className="open">{field.open}</span>
                {render(["inner"], field.inner, $)}
                <span className="close">{field.close}</span>
            </span>;

        default:
            return <span>TODO {field.kind}</span>
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