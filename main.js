import { createElement } from './utils/index';

const element = createElement(
  'h1',
  { title: 'hello' },
  'Hello, world!',
  createElement('h2')
);

console.log('element', element);
