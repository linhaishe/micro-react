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

  let nextUnitOfWork = null;

  // 调度函数
  function workLoop(deadline) {
    // 应该退出这个工作单元，不处理这个工作单元
    let shouldYield = false;
    // 有工作 且 不应该退出
    while (nextUnitOfWork && !shouldYield) {
      // 做工作
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
      // 查看是否还有足否的时间
      shouldYield = deadline.timeRemaining() < 1;
    }

    // 没有足够的时间，请求下一次浏览器空闲的时候执行
    requestIdleCallback(workLoop);
  }

  // 第一次请求
  requestIdleCallback(workLoop);

  // performUnitOfWork function that not only performs the work but also returns the next unit of work.
  function performUnitOfWork(nextUnitOfWork) {
    // TODO
  }
}
