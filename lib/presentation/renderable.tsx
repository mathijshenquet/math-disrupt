/**
 * A small module for an important concept.
 *
 * Epistemic status: low/medium
 * @module presentation/expandable
 */

import {ReactElement} from "react";
import {Field} from "./general";
import * as React from "react";
import {Selector} from "../nominal/navigate";

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
        return <span className={roles.join(" ")}>
            {field.map((item) => render([], item, $))}
        </span>;
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
                {renderBase.call(field, ["inner"], $)}
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