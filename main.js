import { createElement, render } from './utils/index';

const element = createElement(
  'h1',
  { id: 'title', style: 'background: pink' },
  'Hello, world!',
  createElement('h2')
);

const container = document.querySelector('#root');
render(element, container);

console.log('element', element);
