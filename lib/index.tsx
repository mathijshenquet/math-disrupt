/*
import $ from "./types/signature";
import typeChecker from "./types/statics";

let x = $.op("var", $.atom("x"));

let add = $.op("annotate",
    $.op("lambda", $.bind("x", $.op("s", x))),
    $.op("pi", $.op("nat"), $.op("nat")));

typeChecker.synth(add);
/*/

import {Editor} from "./components/Editor";

declare const require:any;
require("./index.less");

import {render} from "react-dom";
import * as React from "react";
import {integral, sum} from "./test/math";
import {support} from "./nominal/support";

console.log(integral);
console.log(support(integral).report());

render(<Editor term={integral} />, document.getElementById("mount"));