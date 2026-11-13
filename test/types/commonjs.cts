import posthtml = require('posthtml');
import { parser } from 'posthtml-parser';
import { render } from 'posthtml-render';

interface Message {
  type: string;
  file: string;
}

const processor = posthtml<unknown, Message>([
  tree => {
    tree.match({ tag: 'p' }, node => node);
    return tree;
  }
]);
processor.messages.push({ type: 'dependency', file: 'input.html' });
const result: Promise<posthtml.Result<Message>> = processor.process('<p>Hello</p>', { parser, render });
result.then(value => {
  const html: string = value.html;
  const messages: Message[] = value.messages;
  void html;
  void messages;
});

// @ts-expect-error The input remains HTML text when parsing is enabled.
processor.process(123);

const sync: posthtml.Result<Message> = processor.process('<p>Hello</p>', { sync: true });
const explicitAsync: Promise<posthtml.Result<Message>> = processor.process('<p>Hello</p>', { sync: false });
const options: posthtml.Options = { sync: Math.random() > 0.5 };
// @ts-expect-error A runtime boolean can select synchronous processing.
const dynamic: Promise<posthtml.Result<Message>> = processor.process('<p>Hello</p>', options);
void sync;
void explicitAsync;
void dynamic;
