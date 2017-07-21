

import {Field} from "../presentation/general";
import {children, Hole} from "../presentation/atoms";
import {Selector} from "./navigate";
import {Term} from "./terms";

function flatten<T>(arrays: Array<Array<T>>): Array<T> {
    let seed: T[] = [];
    return seed.concat(...arrays);
}

export class Template{
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

    static computeHoles(template: Field): Array<Selector> {
        if(typeof template == "string") // its a symbol
            return [];

        if(template instanceof Array) // its a math list
            return flatten(template.map(Template.computeHoles));

        if(template.kind == "hole")
            return [template.selector];

        let holes = children(template).map(Template.computeHoles);
        return flatten(holes);
    }
}