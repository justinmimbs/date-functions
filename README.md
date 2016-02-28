# date-functions

Utility functions for working with Dates in JavaScript. All functions are side-effect free, returning new Dates, and never mutating Dates passed in.

`lib/date-functions.js` exports the following functions:

```js
isDate(value, acceptInvalidDate) // -> Boolean
isDateString(string) // -> Boolean
dateFromString(string) // -> Date
dateToUTC(date) // -> Date
dateFormat(format, date) // -> String
dateFloor(interval, date) // -> Date
dateCeil(interval, date) // -> Date
dateAdd(unit, n, date) // -> Date
dateDiff(unit, date1, date2) // -> Number
dateRange(interval, date1, date2, step) // -> [Date]
```

where `unit` is any of the following date parts:

```js
'ms'
'second'
'minute'
'hour'
'day'
'week'
'month'
'year'
```

and `interval` is any `unit` listed above and also includes:

```js
'monday'
'tuesday'
'wednesday'
'thursday'
'friday'
'saturday'
'sunday'
'quarter'
```
