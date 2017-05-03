
import {File} from '../file'

export class MarkdownFile extends File {

}

File.handlers['md'] = MarkdownFile
