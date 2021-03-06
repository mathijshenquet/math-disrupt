import { Map, is } from "immutable";
import { Bind, Composite, Form, Term } from "../nominal/term";
import { Name } from "../nominal/name";
import { substitute, Substitution } from "./substitution";
import { Hole, unknowns } from "../nominal/hole";
import { support, Support } from "../nominal/support";

export type UnifyTask = UnifyEquality | UnifyFreshness;

export class UnifyEquality {
  unify: "equality" = "equality";
  left: Term;
  right: Term;

  constructor(left: Term, right: Term) {
    this.left = left;
    this.right = right;
  }
}

export class UnifyFreshness {
  unify: "freshness" = "freshness";
  name: Name;
  term: Term;

  constructor(name: Name, term: Term) {
    this.name = name;
    this.term = term;
  }
}

/**
 * A simple unification of a single equality problem where the
 * rhs is the only side that can contain unknowns.
 */
export function bind(pattern: Term, subject: Term): Substitution {
  let problem = new UnificationProblem();
  problem.equality(pattern, subject);
  if (problem.solve()) {
    return problem.unifier;
  } else {
    throw new Error("Cannot unify");
  }
}

/**
 * A simple unification of a single equality problem where the
 * rhs is the only side that can contain unknowns.
 */
export function binds(...bindings: Array<[Term, Term]>): Substitution {
  let problem = new UnificationProblem();

  for (let binding of bindings) {
    problem.equality(binding[0], binding[1]);
  }

  if (problem.solve()) {
    return problem.unifier;
  } else {
    throw new Error("Cannot unify");
  }
}

export class UnificationProblem {
  private stack: Array<UnifyTask>;
  unifier: Substitution;

  constructor() {
    this.stack = [];
    this.unifier = Map();
  }

  private push(task: UnifyTask) {
    this.stack.push(task);
  }

  private pop(): UnifyTask | undefined {
    return this.stack.pop();
  }

  /**
   * Add the equality constraint to the unification problem.
   */
  equality(left: Term, right: Term) {
    this.push(new UnifyEquality(left, right));
  }

  /**
   * Add the freshness constraint to the unification problem.
   */
  freshness(name: Name, term: Term) {
    this.push(new UnifyFreshness(name, term));
  }

  // helper methods for simplify

  private unify(unknown: Hole, term: Term) {
    this.unifier = this.unifier.set(unknown, term);
    let substitution = substitute.bind(Map().set(unknown, term));
    //this.stack = this.stack.map(substitution);
  }

  private freshen(term: Term, name: Name) {
    //TODO
  }

  /**
   * [NomTNL Definition 4.1.5]
   */
  private simplify(): boolean {
    let task = this.pop();
    if (task === undefined) return false;

    if (task.unify == "equality") {
      // equality rules
      const left = task.left,
        right = task.right;

      // we can assume sorts agree
      if (!is(task.left.sort, task.right.sort)) return false;

      // =Identifier
      if (left instanceof Name && right instanceof Name) return is(left, right);

      // =Form
      if (left instanceof Form && right instanceof Form) {
        this.equality(left.parts, right.parts);
        return true;
      }

      // =Composite
      if (left instanceof Composite && right instanceof Composite) {
        for (let i = 0; i < left.elements.length; i++)
          this.equality(left.elements[i], right.elements[i]);

        return true;
      }

      // =Bind
      if (left instanceof Bind && right instanceof Bind) {
        //TODO
      }

      // =Unknown
      if (left instanceof Hole && right instanceof Hole) {
        //TODO
      }

      // F
      if (left instanceof Hole || right instanceof Hole) {
        let unknown, term;
        if (left instanceof Hole) {
          unknown = left;
          term = right;
        } else {
          unknown = right;
          term = left;
        }

        // TODO
      }
    } else {
      // freshness rules
      const term = task.term,
        name = task.name;

      // if the term is already not in the support we can stop immediately
      if (!support(term).contains(name)) return true;

      if (term instanceof Form) {
        this.freshness(name, term.parts);
        return true;
      }

      if (term instanceof Composite) {
        for (let i = 0; i < term.elements.length; i++)
          this.freshness(name, term.elements[i]);

        return true;
      }

      if (term instanceof Bind) {
        this.freshness(name, term.term);
        return true;
      }
    }

    // instantiation rules
    if (task.unify == "equality") {
      // instantiate equality
      let unknown, term;
      if (task.left instanceof Hole) {
        unknown = task.left;
        term = task.right;
      } else if (task.right instanceof Hole) {
        unknown = task.right;
        term = task.left;
      } else {
        return false;
      }

      let nonRecursive = !unknowns(term).contains(unknown);
      let isSupported = Support.isSubset(support(term), support(unknown));

      if (nonRecursive && isSupported) {
        this.unify(unknown, term);
        return true;
      }
    } else {
      // instantiate freshness
      const term = task.term,
        name = task.name;

      if (term instanceof Hole) {
        this.freshen(term, name);
      }
    }

    return false;
  }

  solve(): boolean {
    while (this.simplify()) {}
    return this.stack.length == 0;
  }
}
