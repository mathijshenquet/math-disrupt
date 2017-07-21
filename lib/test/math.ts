
import {Algebra} from "../nominal/algebra";
import {Binder, Signature} from "../nominal/signature";
import {Builder} from "../presentation/builder";
import {Form} from "../nominal/terms";

let binary = [Builder.bin(Builder.hole([0]), Builder.hole(["head"]), Builder.hole([1]))];

export let signature = new Signature<"string" | "number", "term">();
signature.define("num", ["number"], "term", Builder.ord(Builder.hole([0]), {variant: "normal"}));
signature.define("var", ["string"], "term", Builder.ord(Builder.hole([0])));
signature.define("+", ["term", "term"], "term", binary);
signature.define("sin", ["term"], "term");
signature.define("d", ["string"], "term");
signature.define("int",
    ["term", "term", new Binder<"string", "term">("string", "term")], "term",
    Builder.op("∫", [
        Builder.hole([2,"term"]),
        Builder.op("d", Builder.hole([2,"name"]))
    ], {
        size: "integral",
        sub: Builder.hole([0]),
        sup: Builder.hole([1])
    })
);

export const $ = new Algebra(signature, mathSorting);

function mathSorting(atom : string){
    if(isNaN(+atom)) return "string";
    else return "number";
}

let y = $.atom("y");
let siny = $.op("sin", $.op("var", y));
export let sum: Form = $.op("+", $.op("var", y), siny);
export let integral: Form = $.op("int", $.op("num", $.atom("1")), $.op("var", $.atom("x")), $.bind("y", sum));