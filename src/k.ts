
export var last_render = ''

export type Child = string | number | Node

export interface Attributes {
  // $$children?: Child | Child[]
  [name: string]: string
}


/**
 * The base node.
 */
export class Node {

  constructor(
    public tagname: string, 
    public attributes: Attributes | null, 
    public children: Node[]) 
  { }

  toString(indent = ''): string {
    var a = this.attributes

    // Compute the attributes
    var attributes = a == null ? '' :
      ' ' + Object.keys(a).map(key => `${key}="${(a as any)![key]}"`).join(' ')

    var res = `${indent}<${this.tagname}${attributes}>${this.children.map(c => '\n' + c.toString(indent + '  '))}
${indent}</${this.tagname}>`

    // We need this for files that do not export the render() method.
    last_render = res
    return res
  }
}


export type FunctionComponent = (attrs: Attributes | null, children: Node[]) => Node


export function k(base: string | FunctionComponent, attrs: Attributes | null, ...children: any[]): Node {

  if (typeof base === 'function')
    return base(attrs, children)
  return new Node(base, attrs, children)
}
