import {OrdPunct} from "./presentation/data";
declare const require:any;

require("./index.less");

import {render} from "react-dom";
import * as React from "react";
import {integral, $} from "./test/math.example";
import {MathInline} from "./components/Atoms";

console.log(integral);

let doc = <div>
    Let <MathInline term={$.op("var", "x")} /> be
    <MathInline term={integral} />
    such t<span className="caret"></span>hat
</div>;

render(doc, document.getElementById("mount"));