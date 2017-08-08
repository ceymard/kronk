
import {Node} from './k'

export class Doctype extends Node {
  render(indent = '') {
    return `${indent}<!doctype html>`
  }
}
