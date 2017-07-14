/**
 * A small module for an important concept.
 *
 * Epistemic status: low/medium
 * @module presentation/expandable
 */

import {MathList} from "./data";

/**
 * We will expand the nominal syntax one layer at the time. This interface
 * represents this ability. It states that an expandable thing is expandable
 * into a MathList which will contain expandable holes.
 */
export interface Expandable{
    expand(): MathList<Expandable>
}