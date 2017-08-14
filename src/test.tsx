
import {template, block} from './templating'
import './declarations'

export const tpl = template({
  a: 1,
  head: block(<F>
    <meta charset='utf-8'/>
  </F>)
}, ctx =>
<html>
  <head>
    {ctx.head}
  </head>
  Showing off {ctx.a}
</html>)


export const tpl2 = tpl.extend({
  a: '231'
})
