export interface Attributes {
  // $$children?: Child | Child[]
  [name: string]: string
}

export abstract class Node {

  constructor(children: Node[]) { }

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

    var res = `${indent}<${this.tagname}${attributes}>${this.children.map(c => '\n' + c.toString(indent + '  '))}
${indent}</${this.tagname}>`

    return res
  }
}
