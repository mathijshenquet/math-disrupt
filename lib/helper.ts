
interface StringToString{
    [index: string]: string
}

import * as latex2unicode from './latex2unicode.json';

//let latex2unicode: StringToString = import("./latex2unicode.json");

export function flatten<T>(arrays: Array<Array<T>>): Array<T> {
    return (<Array<T>>[]).concat(...arrays);
}

export function latex(name: string): string{
    let key = `\\${name}`;
    if(latex2unicode.hasOwnProperty(key)) {
        return latex2unicode[key];
    }else{
        return name;
    }
}