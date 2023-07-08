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
