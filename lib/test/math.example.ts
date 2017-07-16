
import {Algebra} from "../nominal/algebra";
import {Expr, Term, Bind as Binder} from "../nominal/terms";
import * as sig from "../nominal/signature";
import {Signature} from "../nominal/signature";
import {Builder, Expandable, Hole} from "../presentation";

function renderBinary(builder: Builder<Expandable>, head: string, leaves: Expandable[]) {
    builder.bin(head, new Hole(leaves[0]), new Hole(leaves[1]));
}

export let signature = new Signature<"string" | "number", "term">();
signature.define("num", ["number"], "term", (builder, head, leaves) => builder.ord(leaves[0]));
signature.define("var", ["string"], "term", (builder, head, leaves) => builder.ord(leaves[0]));
signature.define("+", ["term", "term"], "term", renderBinary);
signature.define("sin", ["term"], "term");
signature.define("d", ["string"], "term");
signature.define("int", [new sig.Bind<"string", "term">("string", "term"), "term", "term"], "term", integralRender);

let $ = new Algebra(signature, mathSorting);

function integralRender(builder: Builder<Expandable>, _head: string, leaves: Expr[]) {
    const binder = leaves[0];

    if(!(binder instanceof Binder)) {
        console.log(binder);
        throw new Error("not a binder");
    }

    let intOp = builder.op("∫", new Hole(binder.term));
    intOp.sub = new Hole(leaves[1]);
    intOp.sup = new Hole(leaves[2]);
    intOp.size = "integral";
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