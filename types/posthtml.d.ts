type MaybeArray<T> = T | T[];

export namespace PostHTML {
  export type Matcher = string | RegExp | object;
  export type Expression = MaybeArray<Matcher>;
  export type NodeCallback = (node: Node) => MaybeArray<Node>;
  export type NodeAttributes<TTag = string> = Record<string, string>;
  export type NodeContent = Array<string | Node>;

  export interface Node<
    TTag extends string = string,
    TAttrs extends NodeAttributes = Record<string, string>
  > {
    walk: (cb: NodeCallback) => Node;
    match: (expression: Expression, cb: NodeCallback) => Node[];
    tag?: TTag;
    attrs?: TAttrs;
    content?: NodeContent;
  }

  export interface Options {
    sync?: boolean;
    parser?: Function;
    render?: Function;
    skipParse?: boolean;
  }

  export type Plugin<TThis> = (tree: Node) => void | Node | ThisType<TThis>;

  export interface Result<TMessage> {
    html: string;
    tree: Node;
    messages: TMessage[];
  }

  export interface PostHTML<TThis, TMessage> {
    version: string;
    name: "";
    plugins: Plugin<TThis>[];
    messages: TMessage[];
    use<TThis>(plugins: MaybeArray<Plugin<TThis>>): this;
    process(html: string, options?: Options): Promise<Result<TMessage>>;
  }
}

export default function posthtml<TThis, TMessage>(
  plugins?: PostHTML.Plugin<TThis>[]
): PostHTML.PostHTML<TThis, TMessage>;
