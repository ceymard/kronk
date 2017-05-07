

export class Prom<T> {

  promise = new Promise<T>((ac, rj) => {
    this.accept = ac
    this.reject = rj
  })
  accept: (v: T) => any
  reject: (a: any) => any

  callback() {
    return (err: any, res: T) => {
      if (err) {
        return this.reject(err)
      }
      this.accept(res)
    }
  }
}