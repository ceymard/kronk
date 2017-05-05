
import {File} from '../file'

import * as t from 'toml'


export async function parseToml(file: File) {
  if (!file.is('toml', 'tml')) return

  file.data = t.parse(file.original_contents)
  file.contents = ''
}

File.parsers.push(parseToml)
