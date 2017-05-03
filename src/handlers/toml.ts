
import {File} from '../file'


export class TomlFile extends File {

}

File.handlers['toml'] = TomlFile
File.handlers['tml'] = TomlFile
