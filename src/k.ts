import {Node, TextNode, TagNode, Attributes, Child} from './node'


export type FunctionComponent = (attrs: Attributes | null, children: Node[]) => Node


export abstract class Component {

  constructor(public attrs: Attributes | null) { }
  abstract render(attrs: Attributes | null, children: Node[]): Node
}


export type ComponentInstanciator<T extends Component> =
  (new (attrs: Attributes | null) => T)


function _isComponentInstanciator(b: any): b is ComponentInstanciator<any> {
  if (b.prototype && typeof (b as any).prototype.render === 'function')
    return true
  return false
}



function _getNodes(children: Child[]) {
  return children.map(c => {
    if (c instanceof Node)
      return c
    if (typeof c === 'string' || typeof c === 'number')
      return new TextNode(c.toString())
    if (typeof c === 'function')
      return c()
    throw new Error('incorrect child type')
  })
}


/**
 * The main function.
 * @param base
 * @param attrs
 * @param children
 */
export function k(
  base: string
    | FunctionComponent
    | ComponentInstanciator<any>,
    attrs: Attributes | null, ..._children: Child[]): Node {

  const children = _getNodes(_children)

  if (_isComponentInstanciator(base)) {
    const cmp = new base(attrs)
    return cmp.render(attrs, children)
  }

  if (typeof base === 'function')
    return base(attrs, children)

  return new TagNode(base, attrs, children)
}

// Needed for templates.
(global as any).K = k