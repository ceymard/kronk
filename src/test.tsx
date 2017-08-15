
import {Template} from './templating'
import './declarations'

export class BaseTemplate extends Template {

  a = 1

  title? = 'youpi !'

  head = () => <F>
    {this.a}
    <meta charset='utf-8'/>
  </F>

  __main__ = () => <html>
    <head>
      <title>{this.title}</title>
      {this.head}
    </head>
  </html>

}


export class SubTemplate extends BaseTemplate {

  head = () => <F>
    {super.head}
    <meta lang='en'/>
  </F>

}


const res = SubTemplate.render({a: 23, title: 'youpi !'})
