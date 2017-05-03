
import {File} from '../file'

import * as json5 from 'json5'

export class JSONFile extends File {

  async extractData() {
    this.own_data = json5.parse(this.full_contents)
  }

}

File.handlers['json'] = JSONFile
File.handlers['json5'] = JSONFile
