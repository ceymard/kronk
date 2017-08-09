#!/usr/bin/node

import * as fs from 'fs'
import * as ts from "typescript"
import * as path from 'path'
import * as col from 'colors'
import * as chokidar from 'chokidar'

import * as mr from 'mock-require'


const options: ts.CompilerOptions = { 
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS,
  jsx: ts.JsxEmit.React,
  jsxFactory: 'k'
}

var filenames = process.argv.slice(2)
filenames.push(path.join(__dirname, 'declarations.d.ts'))
filenames = filenames.map(f => path.resolve(f))


const wa = new chokidar.FSWatcher()

const files: ts.MapLike<{ version: number, stats: fs.Stats }> = {};

// Create the language service host to allow the LS to communicate with the host
const servicesHost = getServiceHostSettings()

// Create the language service files
const registry = ts.createDocumentRegistry()
const services = ts.createLanguageService(servicesHost, registry)
const program = services.getProgram()

filenames.forEach(path => wa.add(path))
wa.on('add', onFile)
wa.on('change', onFile)

//////////////////////

function onFile(path: string, stats: fs.Stats) {
  if (!files[path]) {
    files[path] = {version: 0, stats}
  } else {
    if (stats.mtime <= files[path].stats.mtime) return
    files[path].version++
  }
  emitFile(path)
}

function emitFile(fileName: string) {
  // program.getSourceFiles().forEach(s => {
  //   console.log(s.fileName)
  // })

  let output = services.getEmitOutput(fileName);

  if (!output.emitSkipped) {
    // console.log(`Emitting ${fileName}`);
    logErrors(fileName);
  }
  else {
    // console.log(`Emitting ${fileName} failed`);
    logErrors(fileName);
  }

  output.outputFiles.forEach(o => {
    console.log(`--${o.name}\n${o.text}`)
    // fs.writeFileSync(o.name, o.text, {encoding: "utf-8"});
  });

}

function logErrors(fileName: string) {
  let allDiagnostics = services.getCompilerOptionsDiagnostics()
    .concat(services.getSyntacticDiagnostics(fileName))
    .concat(services.getSemanticDiagnostics(fileName));

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

function getServiceHostSettings(): ts.LanguageServiceHost {
  return {
    getScriptFileNames: () => filenames,
    getScriptVersion: (fileName) => files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: (fileName) => {
      if (!fs.existsSync(fileName)) {
        return undefined;
      }
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
  }
}
