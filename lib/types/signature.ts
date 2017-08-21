
import {Algebra} from "../nominal/algebra";
import {Binder, Signature} from "../nominal/signature";
import {Builder} from "../presentation/builder";
import {Selector} from "../nominal/selector";

export let signature = new Signature(["name", "numeral"], ["term-check", "term-synth"]);

// checkable terms (constructions)
signature.define("lambda", [new Binder("name", "term-check")], "term-check");
signature.define("pi", ["term-check", new Binder("name", "term-check")], "term-check");
signature.define("nat", [], "term-check");
signature.define("num", ["numeral"], "term-check");
signature.define("universe", [], "term-check");

// synthesiable terms (eliminations)
signature.define("annotate", ["term-check", "term-check"], "term-synth");
signature.define("apply", ["term-synth", "term-check"], "term-synth");
signature.define("var", ["name"], "term-synth");
signature.define("natrec", ["term-check", "term-check", "term-check"], "term-synth");

export default new Algebra(signature, mathSorting);
function mathSorting(atom : string){
    if(isNaN(+atom)) return "numeral";
    else return "name";
}