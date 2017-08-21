
import {is, Map} from "immutable";
import {Name} from "../nominal/name";
import {compose, substitute, Substitution} from "../nominal/substitution";
import {bind, binds} from "../nominal/unify";
import {Term} from "../nominal/term";
import {Sort} from "../nominal/signature";
import {Unknown} from "../nominal/unknown";

export type Type = Term;
export type Expr = Term;

export type Context = Map<Name, Term>;

export type Judgement = Check | Synth | Compat | Lookup;

export class TypeJudgement{
    context: Context;
    term: Term;
    type: Type;

    constructor(term: Term, type: Type, context: Context = Map()){
        this.context = context; this.term = term; this.type = type;
    }

    substitute(sub: Substitution): this{
        let substitution: (x: Term) => Term = substitute.bind(sub);
        return new (<any>this.constructor)(
            this.context.map(substitution),
            substitution(this.term),
            substitution(this.type)
        );
    }
}

export class Check extends TypeJudgement {
    solve(checker: TypeChecker, ctx: Context): Substitution {
        if(!checker.check(this.type, this.term, ctx.merge(this.context)))
            throw new Error();
        return Map();
    }
}

export class Synth extends TypeJudgement {
    solve(checker: TypeChecker, ctx: Context): Substitution  {
        let result = checker.synth(this.term, ctx.merge(this.context));
        return bind(this.type, result);
    }
}

export class Compat {
    sub: Type;
    sup: Type;

    constructor(sub: Type, sup: Type){
        this.sub = sub; this.sup = sup;
    }

    solve(checker: TypeChecker, ctx: Context): Substitution {
        if(!is(this.sub, this.sub))
            throw new Error("Types not compatible");
        return Map();
    }

    substitute(sub: Substitution): Compat{
        let substitution: (x: Term) => Term = substitute.bind(sub);
        return new Compat(
            substitution(this.sub),
            substitution(this.sup)
        );
    }
}

export class Lookup {
    name: Name | Unknown;
    type: Type;

    constructor(name: Name | Unknown, type: Type){
        this.name = name; this.type = type;
    }

    solve(checker: TypeChecker, ctx: Context): Substitution {
        if(this.name instanceof Unknown || ctx.get(this.name) === this.type)
            throw new Error("Variable not in context");

        return Map();
    }

    substitute(sub: Substitution): Compat{
        let substitution: (x: Term) => Term = substitute.bind(sub);
        return new Compat(
            substitution(this.name),
            substitution(this.type)
        );
    }
}


export interface SynthRule{
    term: Term;
    conditions: Array<Judgement>;
    type: Type;
}

export interface CheckRule{
    type: Type;
    conditions: Array<Judgement>;
    term: Term;
}

/**
 * The type checker will be syntax directed, meaning that the object under
 * scrutiny determines the rule to be used.
 */
export class TypeChecker {

    synthRules: Map<Sort, SynthRule>;
    checkRules: Map<Sort, CheckRule>;

    constructor(){
        this.synthRules = Map();
        this.checkRules = Map();
    }

    addSynth(T: Type, t: Term, conditions: Array<Judgement>){
        this.synthRules.set(T.sort, {
            type: T, term: t, conditions: conditions
        });
    }

    addCheck(t: Term, T: Type, conditions: Array<Judgement>){
        this.synthRules.set(t.sort, {
            type: T, term: t, conditions: conditions
        });
    }

    /**
     * Given a expression e, synthesize the type for that expression.
     */
    synth(e: Expr, ctx: Context = Map()): Type {
        let rule: SynthRule = this.synthRules.get(e.sort); // get the relevant rule

        // a substitution binding the unknowns in rule.subject to the parts
        // of the expression
        let solution = bind(rule.term, e);

        for(let i = 0; i < rule.conditions.length; i++){
            // run over the conditions, substituting in the current solution
            let condition = rule.conditions[i].substitute(solution);

            // then solve for the condition and blend that into the solution
            solution = compose(solution, condition.solve(this, ctx));
        }

        // return the resulting type but substitute for the good parts
        return substitute(solution, rule.type);
    }

    /**
     * Given a type T checks if the (checkable) term t belongs to that type.
     * Returns the term t is t in T otherwise, it might return a term t'
     * derived from term t which does belong to T.
     */
    check(T: Type, t: Term, ctx: Context = Map()): boolean {
        // TODO check type T contains term t
        let rule: CheckRule = this.checkRules.get(T.sort); // get the relevant rule

        let solution = binds([rule.type, T], [rule.term, t]);
        for(let i = 0; i < rule.conditions.length; i++){
            // run over the conditions, substituting in the current solution
            let condition = rule.conditions[i].substitute(solution);

            // then solve for the condition and blend that into the solution
            solution = compose(solution, condition.solve(this, ctx));
        }

        return true;
    }
}