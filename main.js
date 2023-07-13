import { createElement, render } from './utils/index';
import { useState } from './utils/render';

const handleChange = (e) => {
  renderer(e.target.value);
};

const container = document.querySelector('#root');

// const renderer = (value) => {
//   console.log(1);
//   const element = createElement(
//     'div',
//     null,
//     createElement('input', {
//       value: value,
//       oninput: (e) => {
//         handleChange(e);
//       },
//     }),
//     createElement('h2', null, value)
//   );

//   render(element, container);
// };

// renderer('Hello');

// 函数式
// const App = (props) => {
//   // 未引入jsx使用createElement返回
//   return createElement('h1', null, 'Hello', props.name);
// };

// const element = createElement(App, { name: ' world' }, null);

const Counter = () => {
  const [state, setState] = useState(1);
  return createElement(
    'h1',
    { onclick: () => setState((prev) => prev + 1) },
    state
  );
};

const element = createElement(Counter);

render(element, container);
