
import {
    TypeChecker, Check,
    Synth, Compat
} from "./bidirectional";
import {Algebra} from "../nominal/algebra";
import {Map} from "immutable";

let typechecker = new TypeChecker();

let $: Algebra = <any>undefined;

let x = $.unknown("x", "term-name");

let S = $.unknown("S", "term-check"),
    T = $.unknown("T", "term-check"),
    s = $.unknown("s", "term-check"),
    t = $.unknown("t", "term-check");

let e = $.unknown("e", "term-synth");

let U = $.op('universe');

// universe
typechecker.addCheck(U, $.op('universe'), []);

// pi-intro
typechecker.addCheck(U, $.op('pi', $.bind(x, S), T), [
    new Check(U, S),
    new Check(U, S, Map([x, S]))
]);

// pi-form
typechecker.addCheck($.op('pi', $.bind(x, S), T), $.op("lambda", $.bind(x, t)), [
    new Check(T, t, Map([x, S]))
]);

// change of direction
typechecker.addCheck(T, e, [
    new Synth(e, S),
    new Compat(S, T)
]);
