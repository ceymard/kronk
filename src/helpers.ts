
import * as toml from 'toml'

export class Prom<T> {

  promise = new Promise<T>((ac, rj) => {
    this.resolve = ac
    this.reject = rj
  })
  resolve: (v: T) => any
  reject: (a: any) => any

  constructor(public node_like: boolean = true) { }

  callback() {
    return (err: any, res: T) => {
      if (!this.node_like) return this.resolve(err)
      if (err) {
        return this.reject(err)
      }
      this.resolve(res)
    }
  }

}

export function parseData(str: string): any {
  try {
    return toml.parse(str)
  } catch (e) {
    return null
  }
}