

import {Atom, children, Field} from "../presentation/markup";
import {Selector} from "./navigate";
import {Term} from "./terms";
import {Template} from "../presentation/template";

function flatten<T>(arrays: Array<Array<T>>): Array<T> {
    let seed: T[] = [];
    return seed.concat(...arrays);
}

export class TemplateHelper{
    private arity: number;
    private template: Field;

    constructor(arity: number, template: Field){
        this.arity = arity;
        this.template = template;
    }

    static intersperse<A>(as: Array<A>, delim: A): Array<A>{
        let result = [];
        for(let i = 0; i < as.length; i++) {
            if (i != 0) result.push(delim);
            result.push(as[i]);
        }
        return result;
    }

    static computeHoles(template: Template): Array<Selector> {
        if(typeof template == "string") // its a symbol
            return [];

        if(template instanceof Array) // its a math list
            return flatten(template.map(TemplateHelper.computeHoles));

        if(template.kind == "hole")
            return [template.selector];

        let holes = children(<Atom>template).map(TemplateHelper.computeHoles);
        return flatten(holes);
    }
}