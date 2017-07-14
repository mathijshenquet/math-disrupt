
import {Algebra, Expr, Term, Bind as Binder} from "../nominal/algebra";
import * as sig from "../nominal/signature";
import {Signature} from "../nominal/signature";
import {Builder, Expandable} from "../presentation";

function renderBinary(builder: Builder, head: string, leaves: Expandable[]) {
    builder.bin(head, leaves[0], leaves[1]);
}

export let signature = new Signature<"string" | "number", "term">();
signature.define("num", ["number"], "term", (builder, head, leaves) => builder.ord(leaves[0]));
signature.define("var", ["string"], "term", (builder, head, leaves) => builder.ord(leaves[0]));
signature.define("+", ["term", "term"], "term", renderBinary);
signature.define("sin", ["term"], "term");
signature.define("d", ["string"], "term");
signature.define("int", [new sig.Bind<"string", "term">("string", "term"), "term", "term"], "term", integralRender);

let $ = new Algebra(signature, mathSorting);

function integralRender(builder: Builder, head: string, leaves: Expr[]) {
    var binder = leaves[0];

    if(!(binder instanceof Binder)) {
        console.log(binder);
        throw new Error("not a binder");
    }

    builder.op("∫", binder.term);
    builder.sub(leaves[1]);
    builder.sup(leaves[2]);
    builder.peekItem().size = "integral";
}

function mathSorting(atom : string | number){
    return typeof atom;
}


let y = $.op("var", "y");
let siny = $.op("sin", y);
let sum = $.op("+", y, siny);
let one = $.op("num", 1);
let x = $.op("var", "x");
export let integral = $.op("int", $.bind("y", sum), one, x);