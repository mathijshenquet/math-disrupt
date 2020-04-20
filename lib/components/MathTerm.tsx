/**
 * Epistemic status: low
 */

import * as React from "react";
import { PureComponent, ReactElement } from "react";
import { Term } from "../nominal/term";
import { Cursor } from "../navigate/cursor";
import { Atom, BaseAtom } from "../presentation/markup";
import { Hole, Template } from "../presentation/template";
import { Sort } from "../nominal/signature";
import { Name } from "../nominal/name";
import { Selector } from "../navigate/selector";

export interface MathTermProps {
  term: Term;
  caret?: Cursor;
  roles: Array<string>;
}

export class MathTerm extends PureComponent<MathTermProps, {}> {
  render(): ReactElement<any> {
    const roles = this.props.roles;
    const term = this.props.term;
    if (term instanceof Name) {
      return this.renderTemplate(roles, term.toString());
    } else {
      return this.renderTemplate(roles, term.template);
    }
  }

  renderTemplate(
    roles: Array<string>,
    template: Template,
    key?: string | number
  ): ReactElement<any> {
    if (typeof template == "string") {
      const caret = this.props.caret;
      if (caret && !caret.tail) {
        let pos: number = caret.head;
        return (
          <span key={key} className={roles.join(" ")}>
            <span key="left">{template.slice(0, pos)}</span>
            <span key="caret" className="caret" />
            <span key="right">{template.slice(pos)}</span>
          </span>
        );
      } else {
        return (
          <span key={key} className={roles.join(" ")}>
            {template}
          </span>
        );
      }
    }

    if (template instanceof Array) {
      if (template.length == 1) {
        return this.renderAtom(roles, template[0]);
      } else {
        return (
          <span key={key} className={roles.join(" ")}>
            {template.map((item, i) => this.renderAtom([], item, i))}
          </span>
        );
      }
    }

    return this.renderAtom(roles, template, key);
  }

  renderHole(selector: Selector, roles: Array<string>): ReactElement<any> {
    const term = this.props.term;
    if (term instanceof Name) throw new Error("No holes in an Identifier");

    let caret = this.props.caret;
    if (caret) caret = caret.contractAlong(term, selector);

    if (caret != undefined) roles.push("cursor");

    return (
      <MathTerm term={selector.select(term)} caret={caret} roles={roles} />
    );
  }

  renderBase(
    roles: Array<string>,
    atom: BaseAtom<Hole>,
    key?: string | number
  ): ReactElement<any> {
    roles.push(atom.kind);
    if (atom.size) roles.push(atom.size);
    if (atom.variant) roles.push("variant-" + atom.variant);

    let subsup = [];
    if (atom.sub) subsup.push(this.renderTemplate(["sub"], atom.sub, "sub"));
    if (atom.sup) subsup.push(this.renderTemplate(["sup"], atom.sup, "sup"));

    if (subsup.length == 0) {
      return this.renderTemplate(roles, atom.nucleus, key);
    } else {
      return (
        <span className={roles.join(" ")} key={key}>
          {this.renderTemplate(["nucleus"], atom.nucleus)}
          <span className="subsup">{subsup}</span>
        </span>
      );
    }
  }

  renderAtom(
    roles: Array<string>,
    atom: Atom<Hole> | Hole,
    key?: number | string
  ): ReactElement<any> {
    switch (atom.kind) {
      case "hole":
        Array.prototype.push.apply(roles, atom.roles);
        return <span key={key}>{this.renderHole(atom.selector, roles)}</span>;

      case "bin":
      case "rel":
        roles.push(`${atom.kind}-wrap`);
        return (
          <span key={key} className={roles.join(" ")}>
            {this.renderTemplate(["left"], atom.left)}
            {this.renderBase(["inner"], atom)}
            {this.renderTemplate(["right"], atom.right)}
          </span>
        );

      case "fence":
        roles.push("fenced");
        return (
          <span key={key} className={roles.join(" ")}>
            <span className="open">{atom.open}</span>
            {this.renderTemplate(["inner"], atom.inner)}
            <span className="close">{atom.close}</span>
          </span>
        );

      default:
        return this.renderBase(roles, atom, key);
    }
  }
}
