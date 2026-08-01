## @zobi.dev/core/time-comparison

This is a collection of methods used to support Time Comparison in charts.

#### Example usage

```js
import { getComparisonTimeRangeInfo } from '@zobi.dev/core';
const { since, until } = getComparisonTimeRangeInfo(
  adhocFilters,
  extraFormData,
);
console.log(adhocFilters, extraFormData);
```

or

```js
import { ComparisonTimeRangeType } from '@zobi.dev/core';
ComparisonTimeRangeType.Custom; // 'c'
ComparisonTimeRangeType.InheritRange; // 'r'
```

#### API

`fn(args)`

- Do something
