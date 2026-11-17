import posthtml from 'posthtml';
import { parser } from 'posthtml-parser';
import { render } from 'posthtml-render';

const processor = posthtml([
  tree => {
    tree.walk(node => node);
    return tree;
  }
]);
const output = await processor.process('<p>Hello</p>', { parser, render });
const html: string = output.html;
void html;

// @ts-expect-error Sync mode is a boolean option.
processor.process('<p>Hello</p>', { sync: 'yes' });

// Sync mode returns the result directly.
const syncResult = processor.process('<p>Hello</p>', { sync: true });
const syncHtml: string = syncResult.html;
void syncHtml;
// @ts-expect-error Sync mode does not return a Promise.
void processor.process('<p>Hello</p>', { sync: true }).then;
const asyncResult: Promise<posthtml.Result<unknown>> = processor.process('<p>Hello</p>', { sync: false });
void asyncResult;
declare const maybeSync: boolean;
const eitherResult: posthtml.Result<unknown> | Promise<posthtml.Result<unknown>> = processor.process('<p>Hello</p>', { sync: maybeSync });
void eitherResult;

// Parser and render options are accepted.
processor.process('<image/>', {
  xmlMode: true,
  recognizeSelfClosing: true,
  directives: [{ name: '?php', start: '<', end: '>' }],
  sourceLocations: true,
  singleTags: ['image', /^x-/],
  closingSingleTag: 'slash',
  quoteAllAttributes: false
});
// @ts-expect-error Unknown closing format.
processor.process('<br>', { closingSingleTag: 'self' });

// Callbacks may remove or replace nodes.
posthtml([
  tree => {
    tree.match({ tag: 'p' }, () => null);
    tree.match({ tag: 'p' }, () => false);
    tree.match({ tag: 'p' }, () => '');
    tree.match({ tag: 'p' }, () => undefined);
    tree.walk(node => (node.tag === 'script' ? 'text' : node));
    tree.walk(node => [node, { tag: 'hr', attrs: undefined }]);
    // @ts-expect-error Numbers are not nodes.
    tree.walk(() => 1);
  }
]);
