import {Editor} from "./components/Editor";

declare const require:any;
require("./index.less");

import {render} from "react-dom";
import * as React from "react";
import {integral, sum} from "./test/math";

console.log(integral);

/*let doc = ["Let",
          $.op("var", $.atom("x")).expand({}),
          "be",
          integral.expand({}),
         "such that"];*/
render(<Editor term={integral} />, document.getElementById("mount"));