
import {Map} from "immutable";
import {
    TypeChecker, Check,
    Synth, Compat, Lookup
} from "./bidirectional";
import $ from "./signature";

const typechecker = new TypeChecker();
export default typechecker;

let x = $.unknown("x", "name"), n = $.unknown("n", "numeral");

let S = $.unknown("S", "term-check"),
    T = $.unknown("T", "term-check"),
    s = $.unknown("s", "term-check"),
    t = $.unknown("t", "term-check");

let e = $.unknown("e", "term-synth"),
    f = $.unknown("f", "term-synth");

let U = $.op('universe');

let pi = $.op("pi", S, $.bind(x, T));

// universe
typechecker.addCheck(U, $.op('universe'), []);

// pi-intro
typechecker.addCheck(U, pi, [
    new Check(U, S),
    new Check(U, S, Map([x, S]))
]);

// pi-form
typechecker.addCheck(pi, $.op("lambda", $.bind(x, t)), [
    new Check(T, t, Map([x, S]))
]);

// check a synth
typechecker.addCheck(T, e, [
    new Synth(e, S),
    new Compat(S, T)
]);

/// synth types

// synth a check
typechecker.addSynth($.op("annotate", t, T), T, [
   new Check(U, T),
   new Check(T, t)
]);

// bound var
typechecker.addSynth($.op("var", x), S, [
   new Lookup(x, S)
]);

// application
typechecker.addSynth($.op("apply", f, s), $.op("sub", $.bind(x, T), $.op("annotate", s, S)), [
    new Synth(f, pi),
    new Check(S, s)
]);

/// nat

// nat zero
typechecker.addSynth($.op("z"), $.op("nat"), []);

// nat succ
typechecker.addSynth($.op("s", e), $.op("nat"), [
    new Check(e, $.op("nat"))
]);

// nat rec
typechecker.addSynth(T, $.op("natrec", e, t, s), [
    new Check(s, $.op("nat")),
    new Synth(e, T),
    new Check(t, $.op("pi", T, $.bind(x, T)))
]);