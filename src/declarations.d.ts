
declare module "mkdirp2" {
  export function promise(str: string): Promise<any>
}

declare module "node-eval" {
  function safeEval(contents: string, path?: string, context?: any): any
  export = safeEval
}
