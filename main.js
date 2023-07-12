import { createElement, render } from './utils/index';

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
const App = (props) => {
  // 未引入jsx使用createElement返回
  return createElement('h1', null, 'Hello', props.name);
};

const element = createElement(App, { name: ' world' }, null);
render(element, container);
