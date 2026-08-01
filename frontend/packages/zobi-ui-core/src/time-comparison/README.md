## @zobi-ui/core/time-comparison

This is a collection of methods used to support Time Comparison in charts.

#### Example usage

```js
import { getComparisonTimeRangeInfo } from '@zobi-ui/core';
const { since, until } = getComparisonTimeRangeInfo(
  adhocFilters,
  extraFormData,
);
console.log(adhocFilters, extraFormData);
```

or

```js
import { ComparisonTimeRangeType } from '@zobi-ui/core';
ComparisonTimeRangeType.Custom; // 'c'
ComparisonTimeRangeType.InheritRange; // 'r'
```

#### API

`fn(args)`

- Do something
