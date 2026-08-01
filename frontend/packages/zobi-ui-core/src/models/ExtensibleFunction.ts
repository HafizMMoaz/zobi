

/**
 * From https://stackoverflow.com/questions/36871299/how-to-extend-function-with-es6-classes
 */

export default class ExtensibleFunction extends Function {
  // @ts-expect-error - intentionally not calling super(), using setPrototypeOf pattern instead
  // eslint-disable-next-line constructor-super
  constructor(fn: Function) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, no-constructor-return
    return Object.setPrototypeOf(fn, new.target.prototype);
  }
}
