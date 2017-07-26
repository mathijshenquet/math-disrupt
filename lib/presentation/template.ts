
import {Atom, children, Field} from "./markup";
import {Selector} from "../nominal/navigate";
import {flatten} from "../helper";

export interface Hole {
    kind: "hole";
    selector: Selector;
    roles: Array<string>;
}

export type Template = Field<Hole>;

export function computeHoles(template: Template): Array<Selector> {
    if(typeof template == "string")
    return [];

    if(template instanceof Array)
        return flatten(template.map(computeHoles));

    if(template.kind == "hole")
        return [template.selector];

    let holes = children(<Atom>template).map(computeHoles);
    return flatten(holes);
}