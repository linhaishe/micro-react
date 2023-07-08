// ...children，保证你传一个的时候也会是一个数组array
// Step I: The createElement Function

// 将纯文字的数据进行节点的输出，方便处理；但是会影响性能，此项目不考虑性能，渲染成节点，而不是文本
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 方法的作用通过生成的对象里面的信息能渲染出来一一对应的DOM元素，但三个参数开始全是children参数
export default function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}
