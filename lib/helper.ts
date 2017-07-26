export function flatten<T>(arrays: Array<Array<T>>): Array<T> {
    return (<Array<T>>[]).concat(...arrays);
}