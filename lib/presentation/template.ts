
import {Field} from "./markup";
import {Selector} from "../nominal/navigate";

export interface Hole {
    kind: "hole";
    selector: Selector;
    roles: Array<string>;
}

export type Template = Field<Hole>;