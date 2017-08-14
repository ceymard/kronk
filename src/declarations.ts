import {Node, Attributes} from './node'

declare global {

  function F(): Node
  function Super(): Node

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