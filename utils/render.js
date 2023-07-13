let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null; // the last fiber tree we committed to the DOM.
let deletions = null;

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
    alternate: currentRoot, // This property is a link to the old fiber, the fiber that we committed to the DOM in the previous commit phase.
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

function updateDom(dom, prevProps, nextProps) {
  const isEvent = (key) => key.startsWith('on');
  // 删除已经没有的props
  Object.keys(prevProps)
    .filter((key) => key !== 'children' && !isEvent(key))
    // 不在nextProps中
    .filter((key) => !key in nextProps)
    .forEach((key) => {
      // 清空属性
      dom[key] = '';
    });

  // 添加新增的属性/修改变化的属性
  Object.keys(nextProps)
    .filter((key) => key !== 'children' && !isEvent(key))
    // 不再prevProps中
    .filter((key) => !key in prevProps || prevProps[key] !== nextProps[key])
    .forEach((key) => {
      dom[key] = nextProps[key];
    });

  // 删除事件处理函数
  Object.keys(prevProps)
    .filter(isEvent)
    // 新的属性没有，或者有变化
    .filter((key) => !key in nextProps || prevProps[key] !== nextProps[key])
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[key]);
    });

  // 添加新的事件处理函数
  Object.keys(nextProps)
    .filter(isEvent)
    .filter((key) => prevProps[key] !== nextProps[key])
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[key]);
    });
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    // 向下寻找最近的DOM，因为函数没有dom
    commitDeletion(fiber.child, domParent);
  }
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  // 寻找最近的父DOM节点,因为函数式组件式是没有节点的
  let domParentFiber = fiber.parent;

  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const parentDOM = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    parentDOM.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  // 记录刚提交的Root
  currentRoot = wipRoot;
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

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    const sameType = oldFiber && element && element.type == oldFiber.type;
    let newFiber = null;

    if (sameType) {
      // update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    if (element && !sameType) {
      // add this node / 新建
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }

    if (oldFiber && !sameType) {
      // delete the oldFiber's node
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      // 下一个oldFiber
      oldFiber = oldFiber.sibling;
    }

    // 如果`index === 0`，则` fiber.child = newFiber;`，跳出判断，走`prevSibling = newFiber;`，下一次循环fiber tree 进入判断的时候，` prevSibling.sibling = newFiber;`中的`prevSibling.sibling`是上一次构建好的`newfiber`，即`child.sibling = newFiber`
    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;

    index++;
  }
}

// 记住上一次的Fiber
let wipFiber = null;
let hookIndex = null;

// 处理函数式组件
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];

  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

// 处理非函数式组件
function updateHostComponent(fiber) {
  // add dom node
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
    console.log('!fiber.dom', fiber.dom);
  }

  const elements = fiber.props.children;
  // 更新/删除/新建 fiber
  reconcileChildren(fiber, elements);
}

export function useState(initial) {
  // check in the alternate of the fiber using the hook index
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  // If we have an old hook, we copy the state from the old hook to the new hook, if we don’t we initialize the state.
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [], //
  };

  // 执行action
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });

  const setState = (action) => {
    hook.queue.push(action); // 遍历queue, 执行action, 因为action可能不止一个
    // set a new work in progress root as the next unit of work so the work loop can start a new render phase.
    // 触发渲染，可以通过设置任务进行触发render
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  // Then we add the new hook to the fiber, increment the hook index by one, and return the state
  wipFiber.hooks.push(hook); // 既保留了之前的hooks，也保留了新的hooks
  hookIndex++;
  return [hook.state, setState]; // 当前hooks的state
}

// performUnitOfWork function that not only performs the work but also returns the next unit of work.
// 接受到的第一个fiber就是root节点
// 这里主要的功能内容是做一个Fiber Tree 和 处理nextunitofwork
function performUnitOfWork(fiber) {
  console.log('fiber', fiber);
  console.log('fiber.dom', fiber.dom);

  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    // 正常
    updateHostComponent(fiber);
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
