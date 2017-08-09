
import {Map, is} from "immutable";
import {Bind, Composite, Form, Term} from "./term";
import {Identifier} from "./identifier";
import {substitute, Substitution} from "./substitution";
import {Unknown, unknowns} from "./unknown";
import {support, Support} from "./support";

export type UnifyTask = UnifyEquality | UnifyFreshness;

export class UnifyEquality {
    unify: "equality" = "equality";
    left: Term;
    right: Term;

    constructor(left: Term, right: Term){
        this.left = left; this.right = right;
    }
}

export class UnifyFreshness {
    unify: "freshness" = "freshness";
    name: Identifier;
    term: Term;

    constructor(name: Identifier, term: Term){
        this.name = name; this.term = term;
    }
}

export class UnifyProblem{

    stack: Array<UnifyTask>;
    unifier: Substitution;

    constructor(){
        this.stack = [];
        this.unifier = Map();
    }

    push(task: UnifyTask){
        this.stack.push(task);
    }

    pushEquality(left: Term, right: Term) {
        this.push(new UnifyEquality(left, right));
    }

    pushFreshness(name: Identifier, term: Term) {
        this.push(new UnifyFreshness(name, term));
    }

    pop(): UnifyTask | undefined{
        return this.stack.pop();
    }

    unify(unknown: Unknown, term: Term){
        this.unifier = this.unifier.set(unknown, term);
        let substitution = substitute.bind(Map().set(unknown, term));
        this.stack = this.stack.map(substitution);
    }

    /**
     * [NomTNL Definition 4.1.5]
     */
    simplify(): boolean{
        let task = this.pop();
        if(task === undefined) return false;

        if(task.unify == "equality"){ // equality rules
            const left = task.left, right = task.right;

            // we can assume sorts agree
            if(!is(task.left.sort, task.right.sort))
                return false;

            // =Identifier
            if(left instanceof Identifier && right instanceof Identifier)
                return is(left, right);

            // =Form
            if(left instanceof Form && right instanceof Form){
                this.pushEquality(left.argument, right.argument);
                return true;
            }

            // =Composite
            if(left instanceof Composite && right instanceof Composite){
                for(let i = 0; i < left.elements.length; i++)
                    this.pushEquality(left.elements[i], right.elements[i]);

                return true;
            }

            // =Bind
            if(left instanceof Bind && right instanceof Bind){
                //TODO
            }

            // =Unknown
            if(left instanceof Unknown && right instanceof Unknown){
                //TODO
            }

            // F
            if(left instanceof Unknown || right instanceof Unknown){
                let unknown, term;
                if(left instanceof Unknown) {
                    unknown = left; term = right;
                }else{
                    unknown = right; term = left;
                }

                // TODO
            }

        }else{ // freshness rules
            const term = task.term, name = task.name;

            // if the term is already not in the support we can stop immediately
            if(!support(term).contains(name))
                return true;

            if(term instanceof Form){
                this.pushFreshness(name, term.argument);
                return true;
            }

            if(term instanceof Composite){
                for(let i = 0; i < term.elements.length; i++)
                    this.pushFreshness(name, term.elements[i]);

                return true;
            }

            if(term instanceof Bind){
                this.pushFreshness(name, term.term);
                return true;
            }
        }

        // instantiation rules
        if(task.unify == "equality"){  // instantiate equality
            let unknown, term;
            if(task.left instanceof Unknown) { unknown = task.left; term = task.right; }
            else if(task.right instanceof Unknown){ unknown = task.right; term = task.left; }
            else { return false; }

            let nonRecursive = !unknowns(term).contains(unknown);
            let isSupported = Support.isSubset(support(term), support(unknown));

            if(nonRecursive && isSupported){
                this.unify(unknown, term);
                return true;
            }
        }else{ // instantiate freshness
            const term = task.term, name = task.name;

            if(term instanceof Unknown){
                this.shift(term, name); // TODO
            }
        }

        return false;
    }

    solve(): boolean{
        while(this.simplify()){}
        return this.stack.length == 0;
    }
}
