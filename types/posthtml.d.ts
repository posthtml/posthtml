type MaybeArray<T> = T | T[]

export interface PostHTMLNodeAttributes {
  [attribute: string]: string;
}

export type PostHTMLNodeContent = string | PostHTMLNode;

export type PostHTMLMatcher = string | RegExp | object;
export type PostHTMLExpression = MaybeArray<PostHTMLMatcher>;
export type PostHTMLNodeCallback = (node: PostHTMLNode) => MaybeArray<PostHTMLNode>;

// T - Tag name
// A - Attributes
export interface PostHTMLNode<T = string, A = PostHTMLNodeAttributes> {
  walk: (cb: PostHTMLNodeCallback) => PostHTMLNode;
  match: (expression: PostHTMLExpression, cb: PostHTMLNodeCallback) => PostHTMLNode[];
  tag?: T;
  attrs?: A;
  content?: PostHTMLNodeContent[];
}

export interface PostHTMLOptions {
  sync?: boolean;
  parser?: Function;
  render?: Function;
  skipParse?: boolean;
}

export type PostHTMLPlugin<T> = (tree: PostHTMLNode) => void | PostHTMLNode | ThisType<T>;

export interface Result<M> {
  html: string;
  tree: PostHTMLNode;
  messages: M[];
}

export interface PostHTML<T, M> {
  version: string;
  name: 'posthtml';
  plugins: PostHTMLPlugin<T>[];
  messages: M[];
  use<T>(plugins: MaybeArray<PostHTMLPlugin<T>>): this;
  process(html: string, options?: PostHTMLOptions): Promise<Result<M>>;
}

export default function posthtml<T, M>(plugins?: PostHTMLPlugin<T>[]): PostHTML<T, M>;

