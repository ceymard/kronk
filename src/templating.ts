
import {Node} from './node'

export type TemplateFunction<T> = (context: T) => Node


export class Block {

}


export class Template<T> {

    context: T | null = null

    constructor(public _render: TemplateFunction<T>) { }

    extend<U extends Partial<T>>(context: U): Template<T & U> {
      return new Template(this._render as TemplateFunction<T & U>)
    }

    render() {
      if (!this.context)
        throw new Error('Templates need a context to be rendered')
      return this._render(this.context)
    }

}


export function template<T>(base_context: T, fn: TemplateFunction<T>): Template<T> {
  return new Template(fn)
}


export function block(def: Node): Node {

}