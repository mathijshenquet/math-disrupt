
import {Algebra} from "../nominal/algebra";
import {Binder, Signature} from "../nominal/signature";
import {Builder} from "../presentation/builder";
import {Selector} from "../nominal/navigate";

let binary = [Builder.bin(Builder.hole(Selector(0)), Builder.hole(Selector("head")), Builder.hole(Selector(1)))];

export let signature = new Signature(["number", "string"], ["term"]);

signature.define("num", ["number"], "term", Builder.ord(Builder.hole(Selector(0)), {variant: "normal"}));
signature.define("var", ["string"], "term", Builder.ord(Builder.hole(Selector(0))));
signature.define("+", ["term", "term"], "term", binary);
signature.define("sin", ["term"], "term");
signature.define("d", ["string"], "term");
signature.define("int",
    ["term", "term", new Binder("string", "term")], "term",
    [
        Builder.op("∫", {
            size: "integral",
            sub: Builder.hole(Selector(0)),
            sup: Builder.hole(Selector(1))
        }),
        Builder.hole(Selector(2,"term"), ["term"]),
        Builder.op("d"),
        Builder.ord(Builder.hole(Selector(2, "name"),["name"]))
    ]
);

export default new Algebra(signature, mathSorting);

function mathSorting(atom : string){
    if(isNaN(+atom)) return "string";
    else return "number";
}