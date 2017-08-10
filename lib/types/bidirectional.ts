
import {Map} from "immutable";
import {Name} from "../nominal/name";
import {compose, substitute, Substitution} from "../nominal/substitution";
import {bind, binds} from "../nominal/unify";
import {Term} from "../nominal/term";
import {Sort} from "../nominal/signature";

export type Type = Term;
export type Expr = Term;

export type Context = Map<Name, Term>;

export type TypingJudgement = TypeCheckJudgement | TypeSynthJudgement;

export class TypeJudgement{
    context: Context;
    term: Term;
    type: Type;

    constructor(context: Context, term: Term, type: Type){
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

export class TypeCheckJudgement extends TypeJudgement {
    solve(checker: TypeChecker, ctx: Context): Substitution {
        if(!checker.check(ctx.merge(this.context), this.type, this.term))
            throw new Error();
        return Map();
    }
}

export class TypeSynthJudgement extends TypeJudgement {
    solve(checker: TypeChecker, ctx: Context): Substitution  {
        let result = checker.synthesize(ctx.merge(this.context), this.term);
        return bind(this.type, result);
    }
}

export interface SynthRule{
    term: Term;
    arguments: Array<TypingJudgement>;
    type: Type;
}

export interface CheckRule{
    type: Type;
    arguments: Array<TypingJudgement>;
    term: Term;
}

/**
 * The type checker will be syntax directed, meaning that the object under
 * scrutiny determines the rule to be used.
 */
export class TypeChecker {

    synthRules: Map<Sort, SynthRule>;
    checkRules: Map<Sort, CheckRule>;

    /**
     * Given a expression e, synthesize the type for that expression.
     */
    synthesize(ctx: Context, e: Expr): Type {
        let rule: SynthRule = this.synthRules.get(e.sort); // get the relevant rule

        // a substitution binding the unknowns in rule.subject to the parts
        // of the expression
        let solution = bind(rule.term, e);

        for(let i = 0; i < rule.arguments.length; i++){
            // run over the arguments, substituting in the current solution
            let argument = rule.arguments[i].substitute(solution);

            // then solve for the argument and blend that into the solution
            solution = compose(solution, argument.solve(this, ctx));
        }

        // return the resulting type but substitute for the good parts
        return substitute(solution, rule.type);
    }

    /**
     * Given a type T checks if the (checkable) term t belongs to that type.
     * Returns the term t is t in T otherwise, it might return a term t'
     * derived from term t which does belong to T.
     */
    check(ctx: Context, T: Type, t: Term): boolean {
        // TODO check type T contains term t
        let rule: CheckRule = this.checkRules.get(T.sort); // get the relevant rule

        let solution = binds([rule.type, T], [rule.term, t]);
        for(let i = 0; i < rule.arguments.length; i++){
            // run over the arguments, substituting in the current solution
            let argument = rule.arguments[i].substitute(solution);

            // then solve for the argument and blend that into the solution
            solution = compose(solution, argument.solve(this, ctx));
        }

        return true;
    }
}