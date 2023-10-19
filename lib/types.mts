import type { parser } from 'posthtml-parser';
import type { render } from 'posthtml-render';
import type { match, walk } from './api.mjs';

export type Maybe<T> = void | T;
export type MaybeArray<T> = T | T[];

export type StringMatcher = string | RegExp;
export type AttrMatcher = Record<string, StringMatcher>;
type ContentMatcher =
  | StringMatcher[]
  | {
      tag?: StringMatcher;
      attrs?: AttrMatcher;
      content?: ContentMatcher[];
    };

export type Matcher<
  TTag extends StringMatcher,
  TAttrs extends Maybe<AttrMatcher>
> =
  | StringMatcher
  | {
      tag?: TTag;
      attrs?: TAttrs;
      content?: ContentMatcher[];
    };

export type Expression<
  TTag extends StringMatcher,
  TAttrs extends Maybe<AttrMatcher>
> = MaybeArray<Matcher<TTag, TAttrs>>;

export type NodeCallback<
  TTag extends Maybe<string> = Maybe<string>,
  TAttrs extends Maybe<NodeAttributes> = Maybe<NodeAttributes>
> = (node: Node<TTag, TAttrs>) => MaybeArray<Node | RawNode>;

export type NodeAttributes = Record<string, Maybe<string>>;

interface NodeAPI {
  walk: typeof walk;
  match: typeof match;
}

export interface RawNode<
  TTag extends Maybe<string> = Maybe<string>,
  TAttrs extends Maybe<NodeAttributes> = Maybe<NodeAttributes>
> {
  tag: TTag;
  attrs: TAttrs;
  content?: Array<string | RawNode>;
}

export interface Node<
  TTag extends Maybe<string> = Maybe<string>,
  TAttrs extends Maybe<NodeAttributes> = Maybe<NodeAttributes>,
  TMessage = string
> extends NodeAPI,
    RawNode<TTag, TAttrs> {
  content?: Array<string | Node>;
  options?: Options;
  messages?: TMessage[];
}

export type Parser = typeof parser;
export type Render = typeof render;

/** PostHTML Options */
export interface Options {
  /** enables sync mode, plugins will run synchronously, throws an error when used with async plugins */
  sync?: boolean;
  /** use custom parser, replaces default (posthtml-parser) */
  parser?: Parser;
  /**  use custom render, replaces default (posthtml-render) */
  render?: Render;
  /** disable parsing */
  skipParse?: boolean;
}

export type Plugin<TThis> = (
  tree: Node | Node[]
) => void | Node | RawNode | ThisType<TThis>;

export interface Result<TMessage> {
  html: string;
  tree: Node | Node[];
  messages: TMessage[];
}
