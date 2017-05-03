
import {File} from '../file'

export class JSONFile extends File {

}

File.handlers['json'] = JSONFile
File.handlers['json5'] = JSONFile
