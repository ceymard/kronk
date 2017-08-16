import {File} from './file'

export type TemplateFunction<T> = (context: T) => Node


export class Block {

}


export abstract class Template {

    constructor() { }

    static render<T extends Template>(this: new () => T, ctx: Partial<T> = {}): File {
      var a = new this()
      for (var x in ctx)
        a[x] = ctx[x]
      return new File(() => a.Main())
    }

    abstract Main(): Node

}

