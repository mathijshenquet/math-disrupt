
import {Algebra} from "../nominal/algebra";
import {Term, Form, Bind as Binder, Atom} from "../nominal/terms";
import * as sig from "../nominal/signature";
import {Signature} from "../nominal/signature";
import {Builder, Expandable, OrdPunct, Augmented} from "../presentation";

function renderBinary<A>(builder: Builder<Expandable<A>>, head: A, leaves: Term<A>[]) {
    builder.bin(head.toString(), leaves[0].expand(), leaves[1].expand());
}

export let signature = new Signature<"string" | "number", "term">();
signature.define("num", ["number"], "term", (builder, head, leaves: [Atom]) => builder.ord(leaves[0].name, "normal"));
signature.define("var", ["string"], "term", (builder, head, leaves: [Atom]) => builder.ord(leaves[0].name));
signature.define("+", ["term", "term"], "term", renderBinary);
signature.define("sin", ["term"], "term");
signature.define("d", ["string"], "term");
signature.define("int", [new sig.Bind<"string", "term">("string", "term"), "term", "term"], "term", integralRender);

export const $ = new Algebra(signature, mathSorting);

function integralRender<A>(builder: Builder<Expandable<A>>, _head: A, leaves: [Binder, Term, Term]) {
    const binder = leaves[0];

    builder.push();
    builder.item(binder.term.expand());
    builder.op("d", binder.name.expand());
    let inner = builder.pop();

    let intOp = builder.op("∫", inner);
    intOp.sub = leaves[1].expand();
    intOp.sup = leaves[2].expand();
    intOp.size = "integral";
}

function mathSorting(atom : string | number){
    return typeof atom;
}

let y = $.atom("y");

let siny = $.op("sin", $.op("var", y));
let sum = $.op("+", $.op("var", y), siny);
export let integral = $.op("int", $.bind("y", sum), $.op("num", $.atom(1)), $.op("var", $.atom("x")));