import {Node, Attributes} from './k'

declare global {

  /**
   * 
   */
  function Block(attrs: {name: string}, ...children: Node[]): Node

  /**
   * Extend another module
   */
  function Extends(module: string): void

  /**
   * The DOM building function.
   */
  function K(name: string | JSX.ElementClassFn, attrs: Attributes | null, ...children: Node[]): Node;

  namespace JSX {
    type Element = Node;
    // interface ElementAttributesProperty {
    //     attrs: any;
    // }
    // interface ElementChildrenAttribute {
    //     $$children: any;
    // }
    interface ElementClassFn {
        (attrs: Attributes, children: Node[]): Element;
    }
    type ElementClass = ElementClassFn;
    interface IntrinsicElements {
        [name: string]: Attributes;
    }
  }
}