
import {File} from '../file'

export class YamlFile extends File {

  async extractData() {
    this.full_contents
  }

}


File.handlers['yml'] = YamlFile
File.handlers['yaml'] = YamlFile
