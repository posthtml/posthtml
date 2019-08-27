export interface NodeAttributes {
  [attribute: string]: string;
}

export type NodeContent = Array<Node | PostHTMLTree | PostHTMLTree[]>;

// T - Tag name
// A - Attributes
export interface Node<T = string, A = NodeAttributes> {
  tag?: T;
  attrs?: A;
  content?: NodeContent;
}

type Matcher = string | RegExp | object;
type Expression = Matcher | Matcher[];
type CallbackNode = (node: Node) => Node | Node[];

export interface PostHTMLTree {
  walk: (cb: CallbackNode) => PostHTMLTree;
  match: (expression: Expression, cb: CallbackNode) => CallbackNode;
}

export interface PostHTMLOptions {
  sync?: boolean;
  parser?: Function;
  render?: Function;
  skipParse?: boolean;
}

type Plugin<T> = (tree: PostHTMLTree) => void | PostHTMLTree | ThisType<T>;

interface Result<M> {
  html: string;
  tree: PostHTMLTree;
  messages: M[];
}

declare class PostHTML<T, M> {
  version: string;
  name: 'posthtml';
  plugins: Plugin<T>[];
  messages: M[];
  use<T>(plugins: Plugin<T> | Plugin<T>[]): this;
  process(html: string, options?: PostHTMLOptions): Promise<Result<M>>;
}

declare function posthtml<T, M>(plugins?: Plugin<T>[]): PostHTML<T, M>;

export default posthtml;
