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
