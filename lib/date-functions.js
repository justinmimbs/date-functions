'use strict';

/**
 * isDate(value[, acceptInvalidDate]) -> Boolean
 *
 * @param {Object} value
 * @param {Boolean} acceptInvalidDate Optional, defaults to `false`
 * @return {Boolean} `true` if `value` is a valid Date or if `value` is an Invalid Date and
 *         `acceptInvalidDate` is truthy, `false` otherwise.
 */

function isDate(o, acceptInvalidDate = false) {
  return Boolean(o && o.constructor === Date && (!isNaN(o) || acceptInvalidDate));
}

/**
 * isDateString(string) -> Boolean
 *
 * Tests if `string` represents a valid date in one of the following formats: yyyy-mm-dd,
 * yyyymmdd, m/d/yyyy.
 *
 * @param {String} string
 * @return {Boolean}
 */

const isDateString = (() => {
  const mdyyyyFormat = {
    re: /^([01]?\d)\/([0123]?\d)\/(\d{4})$/,
    y:  3,
    m:  1,
    d:  2,
  };

  const yyyymmddFormat = {
    re: /^(\d{4})(-)?([012]\d)(\2)([0123]\d)$/,
    y:  1,
    m:  3,
    d:  5,
  };

  const dayNumbersByMonth = [
    [31],
    [28, 29],
    [31],
    [30],
    [31],
    [30],
    [31],
    [31],
    [30],
    [31],
    [30],
    [31],
  ];

  function isLeapYear(y) {
    return Boolean(y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0));
  }

  function extractYMD(format, s) {
    const match = format.re.exec(s);
    return match && [match[format.y], match[format.m], match[format.d]].map(Number);
  }

  function isValidYMD(y, m, d) {
    return m >= 1 && m <= 12
      && d <= (dayNumbersByMonth[m - 1][isLeapYear(y) ? 1 : 0] || dayNumbersByMonth[m - 1][0]);
  }

  function _isDateString(s) {
    const ymd = typeof s === 'string'
      && (extractYMD(yyyymmddFormat, s) || extractYMD(mdyyyyFormat, s));
    return Boolean(ymd && isValidYMD(...ymd));
  }

  return _isDateString;
})();

/**
 * dateFromString(string) -> Date
 *
 * Returns a Date from a String in an ISO-8601 date/time representation.
 *
 * @param {String} string
 * @return {Date} A valid Date if `string` can be parsed, an Invalid Date otherwise.
 */

const dateFromString = (() => {
  const iso =
    /(\d{4})\-?(\d\d)\-?(\d\d)?T?(\d\d)?:?(\d\d)?:?(\d\d)?(\.\d+)?(Z)?([+\-]\d\d)?:?(\d\d)?/;

  function fromISO(s) {
    const m = String(s).match(iso);
    const date = !m ? null : new Date(
      Date.UTC(m[1], m[2] - 1, m[3] || 1, m[4] || 0, m[5] || 0, m[6] || 0, (m[7] || 0) * 1000)
    );
    if (date && m[8] !== 'Z') {
      const o = (m[9] || m[10])
        ? ((Number(m[9]) || 0) * 60) + (Number(m[10]) || 0)
        : date.getTimezoneOffset() * -1;
      date.setTime(date.getTime() - (o * 60000));
    }

    return date;
  }

  function _dateFromString(s) {
    if (typeof s !== 'string') {
      throw new TypeError('dateFromString(string) expected String for `string`');
    }

    return fromISO(s) || new Date(s);
  }

  return _dateFromString;
})();

/**
 * dateToUTC(date) -> Date
 *
 * Returns a Date representing `date` in UTC time. Note: the new Date's timezoneOffset will still
 * reflect the local offset and not a zero offset as it should.
 *
 * @param {Date} date
 * @return {Date}
 */

function dateToUTC(date) {
  if (!isDate(date)) {
    throw new TypeError('dateToUTC(date) expected Date for `date`');
  }

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  );
}

// custom week-numbering accessors

function customWeekday(firstDayOfWeek, date) {
  // firstDayOfWeek = weekday number, where Sunday is 0
  const daysToSunday = 7 - firstDayOfWeek;
  // converts to another 0-based number
  return (date.getDay() + daysToSunday) % 7;
}

function customYear(firstDayOfWeek, week1IncludesYearsFirstWeekday, date) {
  // week1IncludesYearsFirstWeekday:
  // week 1 is defined as the first week of the calendar year that includes this weekday
  const dayAdjustment = week1IncludesYearsFirstWeekday - firstDayOfWeek;
  const firstWeekDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + dayAdjustment - customWeekday(firstDayOfWeek, date)
  );
  return firstWeekDay.getFullYear();
}

function customWeek(firstDayOfWeek, week1IncludesYearsFirstWeekday, date) {
  const dayAdjustment = week1IncludesYearsFirstWeekday - firstDayOfWeek;
  const jan1 = new Date(customYear(firstDayOfWeek, week1IncludesYearsFirstWeekday, date), 0, 1);
  const weekNumber = Math.ceil(
    (((date - jan1) / (1000 * 60 * 60 * 24)) + customWeekday(firstDayOfWeek, jan1) + 1) / 7
  );
  return customWeekday(firstDayOfWeek, jan1) > dayAdjustment ? weekNumber - 1 : weekNumber;
}

function isoWeekday(date) {
  return customWeekday(1, date) + 1;
}

function isoYear(date) {
  return customYear(1, 4, date);
}

function isoWeek(date) {
  return customWeek(1, 4, date);
}

/**
 * dateFormat(format, date) -> String
 *
 * Returns a String representation of `date` as specified by `format`.
 *
 * The following tokens are recognized in the `format` string and will be replaced accordingly.
 *
 *   date tokens:
 *
 *     yyyy year
 *     yy   year, 2-digit
 *     mmmm month name
 *     mmm  month name, 3-character abbreviation
 *     mm   month number, padded
 *     m    month number
 *     dddd weekday name
 *     ddd  weekday name, 3-character abbreviation
 *     dd   day of month, padded
 *     d    day of month
 *     S    ordinal suffix for day of month (st, nd, rd, th)
 *     q    quarter
 *     o    ISO week-numbering year
 *     ww   ISO week number (01-53), padded
 *     w    ISO week number (1-53)
 *     N    ISO weekday number (1-7)
 *
 *   time tokens:
 *
 *     HH   hours (0-23), padded
 *     H    hours (0-23)
 *     hh   hours (1-12), padded
 *     h    hours (1-12)
 *     MM   minutes, padded
 *     M    minutes
 *     ss   seconds, padded
 *     s    seconds
 *     l    milliseconds, padded
 *     AA   AM|PM
 *     A    A|P
 *     aa   am|pm
 *     a    a|p
 *     O    timezone offset, [+-]hhmm
 *     P    timezone offset, [+-]hh:mm
 *
 * Tokens can be escaped by wrapping them in square brackets.
 *
 *   escape:
 *
 *     [   start
 *     ]   end
 *
 * @param {String} format
 * @param {Date} date
 * @return {String}
 */

const dateFormat = (() => {
  function pad(n, length) {
    let s = String(n);
    while (s.length < (length || 2)) {
      s = `0${s}`;
    }

    return s;
  }

  function ordinalSuffix(n) {
    // use 2-digit number
    const nn = n % 100;
    return ['th', 'st', 'nd', 'rd'][Math.min(nn < 20 ? nn : nn % 10, 4) % 4];
  }

  function isoOffsetFromMinutesOffset(minutes, sep) {
    const hh = pad(Math.floor(Math.abs(minutes / 60)));
    const mm = pad(Math.abs(minutes % 60));
    const sign = minutes < 0 ? '-' : '+';
    return sign + hh + (sep || '') + mm;
  }

  const weekdayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const f = {
    // date
    yyyy: d => d.getFullYear(),
    yy:   d => d.getFullYear().toString().substr(2, 4),
    mmmm: d => monthNames[d.getMonth()],
    mmm:  d => monthNames[d.getMonth()].substr(0, 3),
    mm:   d => pad(d.getMonth() + 1),
    m:    d => d.getMonth() + 1,
    dddd: d => weekdayNames[d.getDay()],
    ddd:  d => weekdayNames[d.getDay()].substr(0, 3),
    dd:   d => pad(d.getDate()),
    d:    d => d.getDate(),
    S:    d => ordinalSuffix(d.getDate()),
    q:    d => Math.floor(d.getMonth() / 3) + 1,
    o:    d => isoYear(d),
    ww:   d => pad(isoWeek(d)),
    w:    d => isoWeek(d),
    N:    d => isoWeekday(d),
    // time
    HH:   d => pad(d.getHours()),
    H:    d => d.getHours(),
    hh:   d => pad(d.getHours() % 12 || 12),
    h:    d => d.getHours() % 12 || 12,
    MM:   d => pad(d.getMinutes()),
    M:    d => d.getMinutes(),
    ss:   d => pad(d.getSeconds()),
    s:    d => d.getSeconds(),
    l:    d => pad(d.getMilliseconds(), 3),
    AA:   d => d.getHours() < 12 ? 'AM' : 'PM',
    A:    d => d.getHours() < 12 ? 'A'  : 'P',
    aa:   d => d.getHours() < 12 ? 'am' : 'pm',
    a:    d => d.getHours() < 12 ? 'a'  : 'p',
    O:    d => isoOffsetFromMinutesOffset(d.getTimezoneOffset()),
    P:    d => isoOffsetFromMinutesOffset(d.getTimezoneOffset(), ':'),
  };

  const tokens = /yy(?:yy)?|m{1,4}|d{1,4}|([wHhMsAa])\1?|[SqNolOP]|\[.*?\]/g;

  function _dateFormat(s, date) {
    if (!isDate(date)) {
      throw new TypeError('dateFormat(format, date) expected Date for `date`');
    }

    return String(s).replace(tokens, token => (
      f.hasOwnProperty(token) ? f[token](date) : token.substr(1, token.length - 2)
    ));
  }

  return _dateFormat;
})();

// lookups used for date math

const units = {
  //       partsIndex partCoeff
  ms:     [0,         1],
  second: [1,         1],
  minute: [2,         1],
  hour:   [3,         1],
  day:    [4,         1],
  week:   [4,         7],
  month:  [5,         1],
  year:   [6,         1],
};

const intervals = {
  //                                                            |used only in dateRange
  //          partsIndex partCoeff   targetPart  targetValues   |unitName    unitCoeff
  week:      [4,         7,          'Day',      [1],            'week',     1],
  monday:    [4,         7,          'Day',      [1],            'week',     1],
  tuesday:   [4,         7,          'Day',      [2],            'week',     1],
  wednesday: [4,         7,          'Day',      [3],            'week',     1],
  thursday:  [4,         7,          'Day',      [4],            'week',     1],
  friday:    [4,         7,          'Day',      [5],            'week',     1],
  saturday:  [4,         7,          'Day',      [6],            'week',     1],
  sunday:    [4,         7,          'Day',      [0],            'week',     1],
  quarter:   [5,         3,          'Month',    [0, 3, 6, 9],   'month',    3],
};

const parts = [
  // name          floorValue      ms
  ['Milliseconds', 0,               1],
  ['Seconds',      0,            1000],
  ['Minutes',      0,           60000],
  ['Hours',        0,         3600000],
  ['Date',         1,            null],
  ['Month',        0,            null],
  ['FullYear',     null,         null],
];

function isUnit(s) {
  return units.hasOwnProperty(s);
}

function isInterval(s) {
  // units are intervals
  return intervals.hasOwnProperty(s) || units.hasOwnProperty(s);
}

/**
 * dateFloor(interval, date) -> Date
 *
 * Returns a new Date rounded down to the nearest `interval`.
 *
 * @param {String} interval
 * @param {Date} date
 * @return {Date}
 */

function dateFloor(intervalName, date) {
  if (!isInterval(intervalName)) {
    throw new Error('dateFloor(interval, date) received unexpected value for `interval`');
  } else if (!isDate(date)) {
    throw new TypeError('dateFloor(interval, date) expected Date for `date`');
  }

  const interval = intervals[intervalName] || units[intervalName];
  const partsIndex = interval[0];
  const partName = parts[partsIndex][0];
  const date2 = new Date(date.getTime());

  // set all smaller parts to their floorValue
  for (let i = 0; i < partsIndex; i++) {
    date2[`set${parts[i][0]}`](parts[i][1]);
  }

  // intervals: rewind targetPart to first matching targetValue
  if (intervals[intervalName]) {
    while (interval[3].indexOf(date2[`get${interval[2]}`]()) === -1) {
      date2[`set${partName}`](date2[`get${partName}`]() - 1);
    }
  }

  return date2;
}

/**
 * dateCeil(interval, date) -> Date
 *
 * Returns a new Date rounded up to the nearest `interval`.
 *
 * @param {String} interval
 * @param {Date} date
 * @return {Date}
 */

function dateCeil(intervalName, date) {
  if (!isInterval(intervalName)) {
    throw new Error('dateCeil(interval, date) received unexpected value for `interval`');
  } else if (!isDate(date)) {
    throw new TypeError('dateCeil(interval, date) expected Date for `date`');
  }

  const interval = intervals[intervalName] || units[intervalName];
  const partName = parts[interval[0]][0];
  const date2 = dateFloor(intervalName, date);

  // forward to next interval if necessary
  if (date.getTime() !== date2.getTime()) {
    date2[`set${partName}`](date2[`get${partName}`]() + interval[1]);
  }

  return date2;
}

/**
 * dateAdd(unit, n, date) -> Date
 *
 * Returns a new Date with `n` `unit`s added to `date`.
 *
 * @param {String} unit
 * @param {Number} n
 * @param {Date} date
 * @return {Date}
 */

function dateAdd(unitName, n, date) {
  if (!isUnit(unitName)) {
    throw new Error('dateAdd(unit, n, date) received unexpected value for `unit`');
  } else if (typeof n !== 'number') {
    throw new TypeError('dateAdd(unit, n, date) expected Number for `n`');
  } else if (!isDate(date)) {
    throw new TypeError('dateAdd(unit, n, date) expected Date for `date`');
  }

  const partName = parts[units[unitName][0]][0];
  const nParts = Math.round(n) * units[unitName][1];
  const date2 = new Date(date.getTime());
  date2[`set${partName}`](date2[`get${partName}`]() + nParts);
  return date2;
}

/**
 * dateDiff(unit, date1, date2) -> Number
 *
 * Returns the count of whole `unit`s between `date1` and `date2`.
 *
 * @param {String} unit
 * @param {Date} date1
 * @param {Date} date2
 * @return {Number}
 */

const dateDiff = (() => {
  function compare(a, b) {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    }

    return 0;
  }

  // compare dates, ignoring parts bigger than partsIndex
  function compareDateDetail(partsIndex, date1, date2) {
    let r = 0;
    for (let i = partsIndex; r === 0 && i >= 0; i -= 1) {
      const a = date1[`get${parts[i][0]}`]();
      const b = date2[`get${parts[i][0]}`]();
      r = compare(a, b);
    }

    return r;
  }

  // diffTime: ms, second, minute, hour
  function diffTime(unitName, date1, date2) {
    const ms = parts[units[unitName][0]][2];
    const n = (date2 - date1) / ms;
    return (date1 < date2 ? Math.floor : Math.ceil)(n);
  }

  // diffDay: day, week
  function diffDay(unitName, date1, date2) {
    // equalize the timezone offset, so that every day is 24 hours, including DST-switching days
    const msOffsetDiff = (date1.getTimezoneOffset() - date2.getTimezoneOffset()) * 60000;
    const days = ((date2 - date1) + msOffsetDiff) / 86400000;
    return (date1 < date2 ? Math.floor : Math.ceil)(days / units[unitName][1]);
  }

  // diffMonth: month, year
  function diffMonth(unitName, date1, date2) {
    const dateComparison = compareDateDetail(4, date2, date1);
    let months = (date2.getFullYear() - date1.getFullYear()) * 12
      + (date2.getMonth() - date1.getMonth());

    // if there's an incomplete month, remove it (add or subtract depending on sign)
    if (compare(0, months) === dateComparison) {
      months += dateComparison;
    }

    return (date1 < date2 ? Math.floor : Math.ceil)(months / (unitName === 'year' ? 12 : 1));
  }

  function _dateDiff(unitName, date1, date2) {
    if (!isUnit(unitName)) {
      throw new Error('dateDiff(unit, date1, date2) received unexpected value for `unit`');
    } else if (!isDate(date1) || !isDate(date2)) {
      throw new TypeError('dateDiff(unit, date1, date2) received unexpected value for `unit`');
    }

    const partsIndex = units[unitName][0];
    const args = [unitName, date1, date2];
    let n;

    if (partsIndex < 4) {
      n = diffTime(...args);
    } else if (partsIndex === 4) {
      n = diffDay(...args);
    } else {
      n = diffMonth(...args);
    }

    // convert -0 to 0
    return n === 0 ? Math.abs(n) : n;
  }

  return _dateDiff;
})();

/**
 * dateRange(interval, date1, date2[, step]) -> [Date]
 *
 * Returns an Array of Dates for every `step` number of `interval`s >= `date1` and < `date2`.
 *
 * @param {String} interval
 * @param {Date} date1 Inclusive
 * @param {Date} date2 Exclusive
 * @param {Number} step Optional, defaults to 1
 * @return {Array}
 */

function dateRange(intervalName, date1, date2, step = 1) {
  const signature = 'dateRange(interval, date1, date2, step)';

  if (!isInterval(intervalName)) {
    throw new Error(`${signature} received unexpected value for \`interval\``);
  } else if (!isDate(date1) || !isDate(date2)) {
    throw new TypeError(`${signature} expected Dates for \`date1\` and \`date2\``);
  } else if (typeof step !== 'number') {
    throw new TypeError(`${signature} expected Number for \`n\``);
  }

  // step must be an integer >= 1
  const step_ = Math.max(1, Math.round(step));
  const unitName = intervals[intervalName] ? intervals[intervalName][4] : intervalName;
  const unitCoeff = intervals[intervalName] ? intervals[intervalName][5] : 1;
  const a = [];
  let d = dateCeil(intervalName, date1);

  while (d < date2) {
    a.push(d);
    d = dateAdd(unitName, unitCoeff * step_, d);
  }

  return a;
}

// export

export {
  isDate,
  isDateString,
  dateFromString,
  dateToUTC,
  dateFormat,
  dateFloor,
  dateCeil,
  dateAdd,
  dateDiff,
  dateRange,
};
