import {Signature, Bind} from "../nominal/signature";
import {Algebra} from "../nominal/algebra";
import * as React from "react";

let signature = new Signature<"var", "term">();
signature.define("lambda", [new Bind<"var","term">("var", "term")], "term");
signature.define("var", ["var"], "term");
signature.define("app", ["term", "term"], "term");

let $ = new Algebra(signature, () => "var");
let id = $.op("lambda", $.bind("x", $.op("var", "x")));