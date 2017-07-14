declare const require:any;

require("./index.less");

import {render} from "react-dom";
import * as React from "react";
import {integral} from "./test/math.example";
import {MathList} from "./components/Atoms";
import {present as renderPres} from "./presentation/index";

render(<MathList items={integral} />, document.getElementById("mount"));