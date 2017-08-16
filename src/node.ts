
export type Child = string | number | Node

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

  static voidTags: {[tagname: string]: boolean} = {
    area: true,
    base: true,
    br: true,
    col: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
  }

  public isVoid = false

  constructor(
    public tagname: string,
    public attributes: Attributes | null,
    children: Node[])
  { 
    super(children) 

    this.isVoid = !!TagNode.voidTags[tagname]
  }

  render(indent = ''): string {
    var a = this.attributes

    // Compute the attributes
    const attributes = a == null ? '' :
      ' ' + Object.keys(a).map(key => `${key}="${(a as any)![key]}"`).join(' ')

    const opening = `${indent}<${this.tagname}${attributes}>`
    const closing = `</${this.tagname}>`

    if (this.isVoid) return opening

    if (this.children.length === 0)
      return `${opening}${closing}`

    // If the first child is a text node that has no returns in it, stay on the same line.
    if (this.children.length === 1
      && this.children[0] instanceof TextNode
      && (this.children[0] as TextNode).text.indexOf('\n') === -1)
      return `${opening}${this.children[0].render('')}</${this.tagname}>`
      
    // General case
    return `${opening}${this.children.map(c => '\n' + c.render(indent + '  ')).join('')}\n${indent}</${this.tagname}>`
  }
}
