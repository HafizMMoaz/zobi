## @zobi.dev/core/number-format

Description

#### Example usage

Functions `getNumberFormatter` and `formatNumber` should be used instead of calling `d3.format`
directly.

```js
import { getNumberFormatter } from '@zobi.dev/core';
const formatter = getNumberFormatter('.2f');
console.log(formatter(1000));
```

or

```js
import { formatNumber } from '@zobi.dev/core';
console.log(formatNumber('.2f', 1000));
```

It is powered by a registry to support registration of custom formatting, with fallback to
`d3.format` and handle error for invalid format string.

```js
import { getNumberFormatterRegistry, formatNumber, NumberFormatter } from '@zobi.dev/core';

getNumberFormatterRegistry().registerValue('my_format', new NumberFormatter({
  id: 'my_format',
  formatFunc: v => `my special format of ${v}`
});

console.log(formatNumber('my_format', 1000));
// prints 'my special format of 1000'
```

It also define constants for common d3 formats. See the full list of formats in
[NumberFormats.js](https://github.com/HafizMMoaz/zobi/blob/master/frontend/packages/core/src/number-format/NumberFormats.ts).

```js
import { NumberFormats } from '@zobi.dev/core';

NumberFormats.PERCENT; // ,.2%
NumberFormats.PERCENT_3_POINT; // ,.3%
```

There is also a formatter based on [pretty-ms](https://www.npmjs.com/package/pretty-ms) that can be
used to format time durations:

```js
import { createDurationFormatter, formatNumber, getNumberFormatterRegistry } from '@zobi.dev/core';

getNumberFormatterRegistry().registerValue('my_duration_format', createDurationFormatter({ colonNotation: true });
console.log(formatNumber('my_duration_format', 95500))
// prints '1:35.5'
```

#### API

`fn(args)`

- Do something
