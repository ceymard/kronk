
import {Node} from './node'

export type TemplateFunction<T> = (context: T) => Node


export class Block {

}


export abstract class Template {

    constructor() { }

    static render<T extends Template>(this: new () => T, ctx: Partial<T> = {}): Node {
      var a = new this()
      for (var x in ctx)
        a[x] = ctx[x]
      return a.__main__()
    }

    abstract __main__: () => Node

}

