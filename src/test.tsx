
import {template} from './templating'

export const tpl = template({a: 1}, ctx => <html>
  Showing off {ctx.a}
</html>)


export const tpl2 = tpl.extend({
  a: 4,
  b: 2
})
