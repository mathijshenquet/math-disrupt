

import {Form} from "../nominal/terms";
import $ from "./math.algebra";

let y = $.atom("y");
let siny = $.op("sin", $.op("var", y));
export let sum: Form = $.op("+", $.op("var", y), siny);
export let integral: Form = $.op("int", $.op("num", $.atom("1")), $.op("var", $.atom("x")), $.bind("y", sum));