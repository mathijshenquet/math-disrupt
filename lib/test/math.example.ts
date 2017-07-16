
import {Algebra} from "../nominal/algebra";
import {Expr, Term, Bind as Binder} from "../nominal/terms";
import * as sig from "../nominal/signature";
import {Signature} from "../nominal/signature";
import {Builder, Expandable, OrdPunct, Hole} from "../presentation";

function renderBinary(builder: Builder<Expandable>, head: string, leaves: Expandable[]) {
    builder.bin(head, new Hole(leaves[0]), new Hole(leaves[1]));
}

export let signature = new Signature<"string" | "number", "term">();
signature.define("num", ["number"], "term", (builder, head, leaves) => builder.ord(leaves[0], "normal"));
signature.define("var", ["string"], "term", (builder, head, leaves) => builder.ord(leaves[0]));
signature.define("+", ["term", "term"], "term", renderBinary);
signature.define("sin", ["term"], "term");
signature.define("d", ["string"], "term");
signature.define("int", [new sig.Bind<"string", "term">("string", "term"), "term", "term"], "term", integralRender);

export const $ = new Algebra(signature, mathSorting);

function integralRender(builder: Builder<Expandable>, _head: string, leaves: Expr[]) {
    const binder = leaves[0];

    if(!(binder instanceof Binder)) {
        console.log(binder);
        throw new Error("not a binder");
    }

    builder.push();
    builder.hole(binder.term);
    builder.op("d", new OrdPunct("ord", binder.name));
    let inner = builder.pop();

    let intOp = builder.op("∫", inner);
    intOp.sub = new Hole(leaves[1]);
    intOp.sup = new Hole(leaves[2]);
    intOp.size = "integral";
}

function mathSorting(atom : string | number){
    return typeof atom;
}


let siny = $.op("sin", $.op("var", "y"));
let sum = $.op("+", $.op("var", "y"), siny);
export let integral = $.op("int", $.bind("y", sum), $.op("num", 1), $.op("var", "x"));