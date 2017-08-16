import {Node} from './node'
import {File} from './file'

export type TemplateFunction<T> = (context: T) => Node


export class Block {

}


export abstract class Template {

    constructor() { }

    static render<T extends Template>(this: new () => T, filename: string, ctx?: Partial<T>): File
    static render<T extends Template>(this: new () => T, ctx: Partial<T>): File
    static render<T extends Template>(this: new () => T, filename: string = '', ctx: Partial<T> = {}): File {
      if (arguments.length === 1 && typeof filename !== 'string') {
        ctx = filename as any
        filename = ''
      }

      var a = new this()
      for (var x in ctx)
        a[x] = ctx[x]
      return new File(() => a.Main(), filename)
    }

    abstract Main(): Node

}
