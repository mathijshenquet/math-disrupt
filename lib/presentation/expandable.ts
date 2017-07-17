/**
 * A small module for an important concept.
 *
 * Epistemic status: low/medium
 * @module presentation/expandable
 */

import {Augmented, MathList} from "./markup";
import {Term} from "../nominal/terms";
import {ReactElement} from "react";

/**
 * We will expand the nominal syntax one layer at the time. This interface
 * represents this ability. It states that an expandable thing is expandable
 * into a MathList which will contain expandable holes.
 */
export interface Expandable<A>{
    expand(): Augmented<Term<A>>
}

export interface RenderState<T>{
    (augmented: Augmented<T>, role?: string): ReactElement<any>;
}

export interface Renderable<T>{
    render(expander: RenderState<T>, role?: string): ReactElement<any>;
}