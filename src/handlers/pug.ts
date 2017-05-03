
import {File} from '../file'

export class PugFile extends File {

}

File.handlers['pug'] = PugFile
File.handlers['jade'] = PugFile
