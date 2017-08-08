
export var last_render = ''

export interface Attributes {
  [name: string]: string
}

/**
 * The base node.
 */
export class Tag {

  constructor(
    public tagname: string, 
    public attributes: Attributes | null, 
    public children: Tag[]) 
  { }

  toString(indent = ''): string {
    var a = this.attributes

    // Compute the attributes
    var attributes = a == null ? '' :
      ' ' + Object.keys(a).map(key => `${key}="${a![key]}"`).join(' ')

    var res = `${indent}<${this.tagname}${attributes}>${this.children.map(c => '\n' + c.toString(indent + '  '))}
${indent}</${this.tagname}>`

    // We need this for files that do not export the render() method.
    last_render = res
    return res
  }
}


export type FunctionComponent = (attrs: Attributes | null, children: Tag[]) => Tag

export class Component {
  render(): Tag | string {
    return null
  }
}


export function k(name: string, attrs: Attributes | null, ...children: any[]): Tag {
  return new Tag(name, attrs, children)
}
