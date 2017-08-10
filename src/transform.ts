
import * as ts from 'typescript'

const sy = ts.SyntaxKind

function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
  const visitor: ts.Visitor = (node: ts.Node): ts.Node => {

    const chld = node.getChildren()[0]
    const sf = node.parent as ts.SourceFile

    if (sf && sf.kind === sy.SourceFile
      && node.kind === sy.ExpressionStatement
      && chld && chld.kind === sy.JsxElement
      && sf.statements[sf.statements.length - 1] === node) 
    {
      
      const elt = ts.visitEachChild(chld, visitor, ctx) as ts.JsxElement
      // const ret = ts.createReturn(elt)
      const ret = ts.createReturn(elt)
      const block = ts.createBlock([ret], true)

      return ts.createBinary(
        ts.createIdentifier('exports.render'),
        sy.EqualsToken,
        ts.createFunctionExpression(
          undefined,
          undefined,
          ts.createIdentifier('render'),
          undefined,
          [],
          undefined,
          block
        )
      )

    }
    return ts.visitEachChild(node, visitor, ctx)
  }

  return visitor
}

export const transformer = (ctx: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
  return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf))
}
