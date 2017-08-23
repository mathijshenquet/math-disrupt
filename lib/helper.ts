
interface StringToString{
    [index: string]: string
}

let latex2unicode: StringToString = require("latex2unicode");

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