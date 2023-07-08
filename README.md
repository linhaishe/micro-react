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

![image-20230708205904655](https://raw.githubusercontent.com/linhaishe/blogImageBackup/main/micro-react/image-20230708205927710.png)

![image-20230708211805918](https://raw.githubusercontent.com/linhaishe/blogImageBackup/main/micro-react/image-20230708211805918.png)

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

// 不通过innerHtml去创建文本节点，而是通过createTextNode去创建，如果是是纯文本则通过createTextNode去创建，如果是其他的元素则通过createElement去创建。
const text = document.createTextNode('');
text['nodeValue'] = element.props.children;

node.appendChild(text);
container.appendChild(node);
```

# Step II: The `render` Function

```
export default function render(element, container) {
  // 创建dom
  const dom =
    element.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(element.type);

  // 添加属性
  Object.keys(element.props)
    .filter((key) => key !== 'children')
    .map((key) => (dom[key] = element.props[key]));

  // 把children的节点内容追加进父节点dom中,递归渲染子元素
  element.props.children.map((child) => render(child, dom));

  // 把dom追加到父节点root中
  container.append(dom);
}

```

# Step III: Concurrent Mode

> **并发模式**（Concurrent Mode）是 React 的一项实验性功能，它允许 React 在执行更新时更好地利用浏览器的空闲时间。 在并发模式下，React 可以将长时间运行的渲染任务拆分为多个较小的任务，这些任务可以在浏览器的空闲时间内执行，从而避免阻塞主线程。 并发模式的目标是提高应用程序的响应性。

> As of November 2019, Concurrent Mode isn’t stable in React yet.

当我们的第一版 render 函数在运行的时候，函数只会在递归渲染完所有的节点后才会停止，这会中断主线程的任务进行。如果浏览器需要执行优先级更高的任务比如用户的输入或者顺滑的动画效果，那么我们也需要等到 render 函数运行完毕才可以。

react 把所有的渲染工作切碎成一个一个小的工作单元，当浏览器有更高优先级任务，会允许浏览器终端下一个要进行的工作单元。

每一个 filber 就是一个 unit of work，浏览器进程可以打断每一个 fiber，优先级高的事情处理完之后，告诉 react，react 在进行下一步的 fiber 处理。

我们通过`requestIdleCallback`进行 loop

> The **`window.requestIdleCallback()`** method queues a function to be called during a browser's idle periods.

`requestIdleCallback(callback)`

The callback function is passed an [`IdleDeadline`](https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline) object describing the amount of time available and whether or not the callback has been run because the timeout period expired.

`requestIdleCallback` also gives us a deadline parameter. We can use it to check how much time we have until the browser needs to take control again.

# refs

1. [react createElement](https://react.dev/reference/react/createElement)
2. [build-your-own-react with vanilla js tutorial](https://pomb.us/build-your-own-react/)
3. [An Introduction to React Fiber - The Algorithm Behind React](https://www.velotio.com/engineering-blog/react-fiber-algorithm)
4. [window: requestIdleCallback() method](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
