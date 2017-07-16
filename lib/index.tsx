declare const require:any;

require("./index.less");

import {render} from "react-dom";
import * as React from "react";
import {integral} from "./test/math.example";
import {MathTerm} from "./components/Atoms";

render(<MathTerm term={integral} role="" />, document.getElementById("mount"));