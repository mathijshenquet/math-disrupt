import {OrdPunct} from "./presentation/markup";
declare const require:any;

require("./index.less");

import {render} from "react-dom";
import * as React from "react";
import {integral, $} from "./test/math";
import {Editor} from "./components/Editor";

console.log(integral.expand());

let doc = ["Let", $.op("var", $.atom("x")), "be", integral, "such that"]
render(<Editor doc={doc} />, document.getElementById("mount"));