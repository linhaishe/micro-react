let nextUnitOfWork = null;
let wipRoot = null;

function createDom(fiber) {
  // 创建dom
  const dom =
    fiber.type === 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  // 添加属性
  Object.keys(fiber.props)
    .filter((key) => key !== 'children')
    .map((key) => (dom[key] = fiber.props[key]));

  return dom;
}

function render(element, container) {
  // set next unit of work
  // render的作用不再是创建节点，而是处理nextunitofwork
  // a fiber, we set nextUnitOfWork to the root of the fiber tree. 第一个任务，渲染根节点
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    sibling: null,
    child: null,
    parent: null,
  };

  nextUnitOfWork = wipRoot;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  const parentDOM = fiber.parent.dom;
  parentDOM.appendChild(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  // add nodes to dom
  commitWork(wipRoot.child);
  // 提交后清空wipRoot
  wipRoot = null;
}

// 调度函数
function workLoop(deadline) {
  // 应该退出这个工作单元，不处理这个工作单元
  let shouldYield = false;
  // 有工作 且 不应该退出
  while (nextUnitOfWork && !shouldYield) {
    // 做工作
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // 查看是否还有足够的时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  // 没有足够的时间，请求下一次浏览器空闲的时候执行
  requestIdleCallback(workLoop);
}

// 第一次请求
requestIdleCallback(workLoop);

// performUnitOfWork function that not only performs the work but also returns the next unit of work.
// 接受到的第一个fiber就是root节点
// 这里主要的功能内容是做一个Fiber Tree 和 处理nextunitofwork
function performUnitOfWork(fiber) {
  console.log('fiber', fiber);
  console.log('fiber.dom', fiber.dom);

  // add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
    console.log('!fiber.dom', fiber.dom);
  }

  // create new fibers, 给children新建fiber
  const elements = fiber.props.children;
  let prevSibling = null;

  // 建立fiber之间的联系，构建Fiber Tree
  for (let index = 0; index < elements.length; index++) {
    const element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
      child: null,
      sibling: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
  }
  // return next unit of work
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 如果没有siblings，则去寻找parent
    nextFiber = nextFiber.parent;

    // 如果什么都没有就会return null;说明已经遍历完成
  }
}

export default render;
