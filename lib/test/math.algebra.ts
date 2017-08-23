
import {Algebra} from "../nominal/algebra";
import {Binder, Signature} from "../nominal/signature";
import {Builder as $} from "../presentation/builder";
import {Selector} from "../navigate/selector";

let binary = [$.bin($.hole(Selector(0)), $.hole(Selector("head")), $.hole(Selector(1)))];

export let signature = new Signature(["number", "string"], ["term"]);

signature.define("num", ["number"], "term", $.ord($.hole(Selector(0)), {variant: "normal"}));
signature.define("var", ["string"], "term", $.ord($.hole(Selector(0))));
signature.define("+", ["term", "term"], "term", binary);
signature.define("sin", ["term"], "term");
signature.define("d", ["string"], "term");
signature.define("int",
    ["term", "term", new Binder("string", "term")], "term",
    [
        $.op("∫", {
            size: "integral",
            sub: $.hole(Selector(0)),
            sup: $.hole(Selector(1))
        }),
        $.hole(Selector(2,"term"), ["term"]),
        $.op("d"),
        $.ord($.hole(Selector(2, "name"),["name"]))
    ]
);

export default new Algebra(signature, mathSorting);

function mathSorting(atom : string){
    if(isNaN(+atom)) return "string";
    else return "number";
}