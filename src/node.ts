
export type Child = string | number | Node | (() => Child)

export interface Attributes {
  $$children?: Child | Child[]
}

export type Attrs<T> = Attributes & T

export abstract class Node {

  constructor(public children: Node[]) { }

  abstract render(indent: string): string

}

export class TextNode extends Node {
  constructor(public text: string) {
    super([])
  }

  render(indent = '') {
    return indent + this.text
  }
}

/**
 * The base node.
 */
export class TagNode extends Node {

  constructor(
    public tagname: string,
    public attributes: Attributes | null,
    children: Node[])
  { super(children) }

  render(indent = ''): string {
    var a = this.attributes

    // Compute the attributes
    var attributes = a == null ? '' :
      ' ' + Object.keys(a).map(key => `${key}="${(a as any)![key]}"`).join(' ')

    var res = `${indent}<${this.tagname}${attributes}>${this.children.map(c => '\n' + c.render(indent + '  '))}
${indent}</${this.tagname}>`

    return res
  }
}
