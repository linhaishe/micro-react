# micro-react

build your own react with vanilla js

# Step Zero: Review & Step I: The createElement Function

## replace createElement

createElement 允许您创建一个 React 元素。它可以作为编写 JSX 的替代方案。

```js
// jsx usage
const element = <h1 title='foo'>Hello</h1>;
const container = document.getElementById('root');
ReactDOM.render(element, container);
```

To create an element without JSX, call createElement with some type, props, and children:

`createElement(type, props, ...children) `
`createElement('h1', {}, child1, child2, child3)`

```js
// createElement usage
import { createElement } from 'react';

function Greeting({ name }) {
  return createElement(
    'h1',
    { className: 'greeting' },
    'Hello ',
    createElement('i', null, name),
    '. Welcome!'
  );
}
```

```js
function Greeting({ name }) {
  return (
    <h1 className='greeting'>
      Hello <i>{name}</i>. Welcome!
    </h1>
  );
}
```

## replace ReactDOM.render

**node 相关 api 请查询 DOM 资料**

```js
const element = {
  type: 'h1',
  props: {
    title: 'foo',
    children: 'Hello',
  },
};

const container = document.getElementById('root');

const node = document.createElement(element.type);
node['title'] = element.props.title;

// Using textNode instead of setting innerText will allow us to treat all elements in the same way later. Note also how we set the nodeValue like we did it with the h1 title, it’s almost as if the string had props: {nodeValue: "hello"}.
const text = document.createTextNode('');
text['nodeValue'] = element.props.children;

node.appendChild(text);
container.appendChild(node);
```

# refs

1. react createElement : https://react.dev/reference/react/createElement
2. build-your-own-react with vanilla js tutorial https://pomb.us/build-your-own-react/
