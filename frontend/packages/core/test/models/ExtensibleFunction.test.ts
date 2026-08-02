/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */

import { ExtensibleFunction } from '@zobi.dev/core';

describe('ExtensibleFunction', () => {
  interface Func1 {
    (): number;
  }

  class Func1 extends ExtensibleFunction {
    constructor(x: unknown) {
      super(() => x); // closure
    }
  }

  interface Func2 {
    (): number;
  }

  class Func2 extends ExtensibleFunction {
    x: unknown;

    constructor(x: unknown) {
      super(() => this.x); // arrow function, refer to its own field
      this.x = x;
    }

    // eslint-disable-next-line class-methods-use-this
    hi() {
      return 'hi';
    }
  }

  class Func3 extends ExtensibleFunction {
    x: unknown;

    constructor(x: unknown) {
      // @ts-expect-error
      super(function customName() {
        // @ts-expect-error
        return customName.x;
      }); // named function
      this.x = x;
    }
  }

  test('its subclass is an instance of Function', () => {
    expect(Func1).toBeInstanceOf(Function);
    expect(Func2).toBeInstanceOf(Function);
    expect(Func3).toBeInstanceOf(Function);
  });

  const func1 = new Func1(100);
  const func2 = new Func2(100);
  const func3 = new Func3(100);

  test('an instance of its subclass is executable like regular function', () => {
    expect(func1()).toEqual(100);
    expect(func2()).toEqual(100);
  });

  test('its subclass behaves like regular class with its own fields and functions', () => {
    expect(func2.x).toEqual(100);
    expect(func2.hi()).toEqual('hi');
  });

  test('its subclass can set name by passing named function to its constructor', () => {
    expect(func3.name).toEqual('customName');
  });
});
