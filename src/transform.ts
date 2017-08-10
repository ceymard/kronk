
import * as ts from 'typescript'

const sy = ts.SyntaxKind

function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
  const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
    const chld = node.getChildren()[0]
    if (node.parent && node.parent.kind === sy.SourceFile
      && node.kind === sy.ExpressionStatement
      && chld && chld.kind === sy.JsxElement
      && node.parent.getChildren().indexOf(node)) 
    {
      
      const elt = ts.visitEachChild(chld, visitor, ctx) as ts.JsxElement
      // const ret = ts.createReturn(elt)
      const ret = ts.createReturn(elt)
      const block = ts.createBlock([ret], true)

      const fn = ts.createFunctionDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        undefined,
        ts.createIdentifier('render'),
        undefined,
        [],
        undefined,
        block
      )
      // node.parent = ret
      return fn
      // return ts.visitEachChild(fn, visitor, ctx)

    }
    return ts.visitEachChild(node, visitor, ctx)
  }

  return visitor
}

export const transformer = (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
  return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf))
}


/*
            return (source: ts.SourceFile) => {
              // FIXME : change toplevel TSX statements that do not
              // go into a variable to be the render() function ?1
              // console.log(source.fileName)
              const last_node = source.statements[source.statements.length - 1]
              if (last_node.kind === ts.SyntaxKind.ExpressionStatement) {
                const first = last_node.getChildren()[0]
                if (first.kind === ts.SyntaxKind.JsxElement) {
                  // const f = first as ts.JsxElement

                  const printer = ts.createPrinter({
                    newLine: ts.NewLineKind.LineFeed,
                  });


                  const fn = ts.createFunctionDeclaration(
                    undefined,
                    [ts.createToken(ts.SyntaxKind.ExportKeyword)],
                    undefined,
                    ts.createIdentifier('render'),
                    undefined,
                    [],
                    undefined,
                    ts.createBlock(
                      // [ts.createReturn(ts.createLiteral(1))],
                      // true
                      [ts.createReturn(first as ts.JsxElement)]
                    )
                  )

                  var res = ''
                  for (var stmt of source.statements.slice(-1)) {
                    res += printer.printNode(ts.EmitHint.Unspecified, stmt, source)
                  }

                  // source.statements.push(fn)
                  res += printer.printNode(ts.EmitHint.Unspecified, fn, source);
                  console.log(res)

                  // const exp = ts.createExportAssignment(undefined, undefined, true, fn)
                }
              }
              return source
            }
          }]
*/