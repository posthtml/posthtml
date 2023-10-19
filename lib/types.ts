import type { parser } from 'posthtml-parser';
import type { render } from 'posthtml-render';

export type Maybe<T> = void | T;
export type MaybeArray<T> = T | T[];

type StringMatcher = string | RegExp;
type AttrMatcher = Record<string, StringMatcher>;
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
  walk: (cb: NodeCallback) => Node;
  match: <
    TTag extends StringMatcher,
    TAttrs extends Maybe<AttrMatcher>,
    TTagResult extends Maybe<string> = TTag extends string
      ? TTag
      : TTag extends void
      ? Maybe<string>
      : string,
    TAttrResult extends Maybe<NodeAttributes> = TAttrs extends void
      ? Maybe<NodeAttributes>
      : {
          [P in keyof TAttrs]: string;
        } & NodeAttributes
  >(
    expression: Expression<TTag, TAttrs>,
    cb: NodeCallback<TTagResult, TAttrResult>
  ) => Node<TTagResult, TAttrResult>[];
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
  /** Adds processing of custom [directives](https://github.com/posthtml/posthtml-parser#directives). */
  directives;
}

export type Plugin<TThis> = (
  tree: Node | Node[]
) => void | Node | RawNode | ThisType<TThis>;

export interface Result<TMessage> {
  html: string;
  tree: Node | Node[];
  messages: TMessage[];
}
