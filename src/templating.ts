
import {Node} from './node'

export type TemplateFunction<T> = (context: T) => Node


export class Template<T> {

    constructor(public context: T, public render: TemplateFunction<T>) { }

    extend<U extends T>(context: U): Template<U> {
      return new Template(context, this.render as TemplateFunction<U>)
    }

}


export function template<T>(base_context: T, fn: TemplateFunction<T>): Template<T> {
  return new Template(base_context, fn)
}