
import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
import * as col from 'colors'
import * as _Module from 'module'

import {k} from './k'
const gg: any = global;

gg.K = k
gg.Block = function () { return k('div', null) }

export interface Module {
  new (filename: string, parent: string): Module

  exports: any
  loaded: boolean
  paths: string[]
  require(path: string): any
  filename: string
  _compile(code: string, filename: string): any
}

const Module = _Module as new (filename: string, parent: string) => Module

export function createModule() {

}


export interface CachedModule {
  name: string
  source?: string
  module?: Module
  version: number
}

export class Cache {

  service: ts.LanguageService
  registry: ts.DocumentRegistry
  files: {[name: string]: CachedModule} = {}

  constructor(public fnames: string[], public options: ts.CompilerOptions) {
    this.createService(fnames, options)
  }

  /**
   *
   */
  createService(files: string[], options: ts.CompilerOptions) {
    this.registry = ts.createDocumentRegistry()
    this.service = ts.createLanguageService({
      getScriptFileNames: () => {
        return files
      },
      getScriptVersion: (fileName) => this.files[fileName] && this.files[fileName].version.toString(),
      getScriptSnapshot: (fileName) => {
        if (!fs.existsSync(fileName)) {
          return undefined;
        }
        return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
      },
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => this.options,
      getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
      getCustomTransformers() {
        return {
          before: [(context: ts.TransformationContext) => {
            return (source: ts.SourceFile) => {
              // FIXME : change toplevel TSX statements that do not
              // go into a variable to be the render() function ?1
              // console.log(source.fileName)
              const last_node = source.statements[source.statements.length - 1]
              if (last_node.kind === ts.SyntaxKind.ExpressionStatement) {
                const first = last_node.getChildren()[0]
                if (first.kind === ts.SyntaxKind.JsxElement) {
                  // const f = first as ts.JsxElement

                  const fn = ts.createFunctionDeclaration(
                    /* decorators */ undefined,
                    undefined, // /* modifiers */ [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    /* asterisk */ undefined,
                    ts.createIdentifier('render'),
                    /* generic */ undefined,
                    /* params */ [],
                    /* return type */ undefined,
                    ts.createBlock(
                      [ts.createReturn(ts.createLiteral(1))],
                      true
                      // [ts.createReturn(f)]
                    )
                  )
                  source.statements[source.statements.length - 1] = fn
                  // const exp = ts.createExportAssignment(undefined, undefined, true, fn)
                }
              }
              return source
            }
          }]
        }
      },
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
    }, this.registry)
  }

  /**
   *
   */
  add(source: string, o: ts.OutputFile): any {
    var m = new Module(o.name, '')

    m.filename = o.name
    // FIXME add better node_modules just like node...
    m.paths = Module._nodeModulePaths(path.dirname(o.name))
    this.files[source].source = o.text

    var old_require = m.require.bind(m)

    m.require = (name: string) => {
      // First try to use standard require over our
      // custom version.
      try {
        return old_require(name)
      } catch (e) { }

      // If the module was not found, it may most likely be because
      // we're looking for a .ts or .tsx one.
      const full_name = path.resolve(path.dirname(o.name), name).replace('.js', '')

      if (this.files[full_name + '.ts'])
        return this.files[full_name + '.ts'].module!.exports

      this.compile(full_name + '.ts')
      // console.log(this.files[trying_resolve + '.ts'])
      return this.files[full_name + '.ts'].module!.exports
    }

    m._compile(o.text, o.name)
    this.files[source].module = m
    return m.exports
  }

  get(name: string) {

  }

  _get(name: string) {

  }

  /**
   *
   */
  compile(name: string): any {
    if (!this.files[name]) {
      this.files[name] = {
        version: 0,
        name
      }
    } else {
      this.files[name].version++
    }

    // let src = this.service.getProgram().getSourceFile(name)
    // const res = this.service.getProgram().emit(src)

    let output = this.service.getEmitOutput(name)
    this.logErrors(name)
    output.outputFiles.forEach(o => {
      console.log(o.text)
      this.add(name, o)
    })
  }

  /**
   *
   */
  getModule(name: string) {

  }


  logErrors(fileName: string) {
    let allDiagnostics = this.service.getCompilerOptionsDiagnostics()
      .concat(this.service.getSyntacticDiagnostics(fileName))
      .concat(this.service.getSemanticDiagnostics(fileName));

    allDiagnostics.forEach(diagnostic => {
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      if (diagnostic.file) {
        let { line } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        console.log(`${col.yellow(diagnostic.file.fileName)}:${col.red.bold('' + line + 1)} ${col.gray(message)}`);
      }
      else {
        console.log(`${message}`);
      }
    });
  }

}