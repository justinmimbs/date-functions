(function (global) {
"use strict";

// isDate(Object) -> Boolean

function isDate(o, acceptInvalidDate) {
    return Boolean(o && o.constructor === Date && (!isNaN(o) || acceptInvalidDate));
}

// isDateString(String) -> Boolean

var isDateString = (function () {
    // tests for the following formats: m/d/yyyy, yyyy-mm-dd, yyyymmdd
    var mdyyyyFormat = {
            re: /^([01]?\d)\/([0123]?\d)\/(\d{4})$/,
            y: 3,
            m: 1,
            d: 2
        },
        yyyymmddFormat = {
            re: /^(\d{4})(-)?([012]\d)(\2)([0123]\d)$/,
            y: 1,
            m: 3,
            d: 5
        },
        dayNumbersByMonth = [
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
            [31]
        ];
    function isLeapYear(y) {
        return Boolean(y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0));
    }  
    function extractYMD(format, s) {
        var match = format.re.exec(s);
        return match && [match[format.y], match[format.m], match[format.d]].map(Number);
    }
    function isValidYMD(y, m, d) {
        return m >= 1 && m <= 12
            && d <= (dayNumbersByMonth[m - 1][isLeapYear(y) ? 1 : 0] || dayNumbersByMonth[m - 1][0]);
    }
    function isDateString(s) {
        var ymd = typeof s === "string" && (extractYMD(yyyymmddFormat, s) || extractYMD(mdyyyyFormat, s));
        return Boolean(ymd && isValidYMD.apply(null, ymd));
    }
    return isDateString;
}());

// fromString(String) -> Date

var fromString = (function () {
    var iso = /(\d\d\d\d)\-?(\d\d)\-?(\d\d)?T?(\d\d)?:?(\d\d)?:?(\d\d)?(\.\d+)?(Z)?([+\-]\d\d)?:?(\d\d)?/;   
    function fromISO(s) {
        var m = String(s).match(iso),
            date = !m ? null : new Date(Date.UTC(m[1], m[2] - 1, m[3] || 1, m[4] || 0, m[5] || 0, m[6] || 0, (m[7] || 0) * 1000)),
            o; // minutesOffset
        if (date && m[8] !== "Z") {
            o = m[9] || m[10] ? ((Number(m[9]) || 0) * 60) + (Number(m[10]) || 0) : date.getTimezoneOffset() * -1;
            date.setTime(date.getTime() - (o * 60000));
        }
        return date;
    }
    function fromString(s) {
        return fromISO(s) || new Date(String(s));
    }
    return fromString;
}());

// toUTC(Date) -> Date

function toUTC(date) {
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

function customWeekday(firstDayOfWeek, date) { // firstDayOfWeek = weekday number, where Sunday is 0; converts to another 0 based number
    var daysToSunday = 7 - firstDayOfWeek;
    return (date.getDay() + daysToSunday) % 7;
}
function customYear(firstDayOfWeek, week1IncludesYearsFirstWeekday, date) { // week1IncludesYearsFirstWeekday = the first week of the year is the first full week that includes this day
    var dayAdjustment = week1IncludesYearsFirstWeekday - firstDayOfWeek,
        firstWeekDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayAdjustment - customWeekday(firstDayOfWeek, date));
    return firstWeekDay.getFullYear();
}
function customWeek(firstDayOfWeek, week1IncludesYearsFirstWeekday, date) {
    var dayAdjustment = week1IncludesYearsFirstWeekday - firstDayOfWeek,
        jan1 = new Date(customYear(firstDayOfWeek, week1IncludesYearsFirstWeekday, date), 0, 1),
        weekNumber = Math.ceil((((date - jan1) / (1000 * 60 * 60 * 24)) + customWeekday(firstDayOfWeek, jan1) + 1) / 7);
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

// format(String, Date) -> String

/*
    date

        yyyy year
        yy   year, 2-digit
        mmmm month name
        mmm  month name, 3-char abbreviation
        mm   month number, padded
        m    month number
        dddd weekday name
        ddd  weekday name, 3-char abbreviation
        dd   day of month, padded
        d    day of month
        S    ordinal suffix for day of month (st, nd, rd, th)
        q    quarter
        o    ISO week-numbering year
        ww   ISO week number (01-53), padded
        w    ISO week number (1-53)
        N    ISO weekday number (1-7)

    time

        HH   hours (0-23), padded
        H    hours (0-23)
        hh   hours (1-12), padded
        h    hours (1-12)
        MM   minutes, padded
        M    minutes
        ss   seconds, padded
        s    seconds
        l    milliseconds, padded
        AA   AM|PM
        A    A|P
        aa   am|pm
        a    a|p
        O    timezone offset, [+-]hhmm
        P    timezone offset, [+-]hh:mm

    escape

        [   start
        ]   end
*/
var format = (function () {
    function pad(n, length) {
        var s = String(n);    
        while (s.length < (length || 2)) {
            s = "0" + s;
        }
        return s;
    }
    function ordinalSuffix(n) {
        var nn = n % 100; // use 2-digit number
        return ["th", "st", "nd", "rd"][Math.min(nn < 20 ? nn : nn % 10, 4) % 4];
    }
    function isoOffsetFromMinutesOffset(minutes, sep) {
        var hh = pad(Math.floor(Math.abs(minutes / 60))),
            mm = pad(Math.abs(minutes % 60)),
            sign = minutes < 0 ? "-" : "+";
        return sign + hh + (sep || "") + mm;
    }
    var weekdayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ],
        monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ],
        f = {
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
            AA:   d => d.getHours() < 12 ? "AM" : "PM",
            A:    d => d.getHours() < 12 ? "A"  : "P",
            aa:   d => d.getHours() < 12 ? "am" : "pm",
            a:    d => d.getHours() < 12 ? "a"  : "p",
            O:    d => isoOffsetFromMinutesOffset(d.getTimezoneOffset()),
            P:    d => isoOffsetFromMinutesOffset(d.getTimezoneOffset(), ":")
        },
        tokens = /yy(?:yy)?|m{1,4}|d{1,4}|([wHhMsAa])\1?|[SqNolOP]|\[.*?\]/g;
    function format(s, date) {
        return String(s).replace(tokens, function (token) {
            return f.hasOwnProperty(token) ? f[token](date) : token.substr(1, token.length - 2);
        });
    }
    return format;
}());

// lookups used for date math

var units = {
        //           partsIndex partCoeff
        ms:         [0,         1],
        second:     [1,         1],
        minute:     [2,         1],
        hour:       [3,         1],
        day:        [4,         1],
        week:       [4,         7],
        month:      [5,         1],
        year:       [6,         1]
    },
    intervals = {
        //                                                             |used only in date.range
        //           partsIndex partCoeff   targetPart  targetValues   |unitName    unitCoeff
        week:       [4,         7,          "Day",      [1],            "week",     1],
        monday:     [4,         7,          "Day",      [1],            "week",     1],
        tuesday:    [4,         7,          "Day",      [2],            "week",     1],
        wednesday:  [4,         7,          "Day",      [3],            "week",     1],
        thursday:   [4,         7,          "Day",      [4],            "week",     1],
        friday:     [4,         7,          "Day",      [5],            "week",     1],
        saturday:   [4,         7,          "Day",      [6],            "week",     1],
        sunday:     [4,         7,          "Day",      [0],            "week",     1],
        quarter:    [5,         3,          "Month",    [0, 3, 6, 9],   "month",    3]
    },
    parts = [
        //name                  floorValue  ms
        ["Milliseconds",        0,                 1],
        ["Seconds",             0,              1000],
        ["Minutes",             0,             60000],
        ["Hours",               0,           3600000],
        ["Date",                1,              null],
        ["Month",               0,              null],
        ["FullYear",            null,           null]
    ];

// floor(String, Date) -> Date

function floor(intervalName, date) {
    if (!isDate(date)) {
        return new Date(NaN);
    } else if (!intervals[intervalName] && !units[intervalName]) {
        throw new Error("floor(interval, date) received unexpected value for 'interval'");
    }
    var date2 = new Date(date.getTime()),
        interval = intervals[intervalName] || units[intervalName],
        partsIndex = interval[0],
        partName = parts[partsIndex][0],
        i;
    // set all smaller parts to their floorValue
    for (i = 0; i < partsIndex; i++) {
        date2["set" + parts[i][0]](parts[i][1]);
    }
    // intervals: rewind targetPart to first matching targetValue
    if (intervals[intervalName]) {
        while (interval[3].indexOf(date2["get" + interval[2]]()) === -1) {
            date2["set" + partName](date2["get" + partName]() - 1);
        }
    }
    return date2;
}

// ceil(String, Date) -> Date

function ceil(intervalName, date) {
    if (!isDate(date)) {
        return new Date(NaN);
    } else if (!intervals[intervalName] && !units[intervalName]) {
        throw new Error("ceil(interval, date) received unexpected value for 'interval'");
    }
    var date2 = floor(intervalName, date),
        interval = intervals[intervalName] || units[intervalName],
        partName = parts[interval[0]][0];
    // forward to next interval if necessary
    if (date.getTime() !== date2.getTime()) {
        date2["set" + partName](date2["get" + partName]() + interval[1]);
    }
    return date2;
}

// add(String, Number, Date) -> Date

function add(unitName, n, date) {
    if (!isDate(date)) {
        return new Date(NaN);
    } else if (!units[unitName]) {
        throw new Error("add(unit, n, date) received unexpected value for 'unit'");
    }
    var date2 = new Date(date.getTime()),
        partName = parts[units[unitName][0]][0];

    n = (Math.round(n) || 0) * units[unitName][1];
    date2["set" + partName](date2["get" + partName]() + n);
    return date2;
}

// diff(String, Date, Date) -> Number

var diff = (function () {
    function compareDateDetail(partsIndex, date1, date2) {
        // compare dates ignoring parts bigger than partsIndex
        var r = 0,
            a,
            b,
            i;
        for (i = partsIndex; r === 0 && i >= 0; i--) {
            a = date1["get" + parts[i][0]]();
            b = date2["get" + parts[i][0]]();
            r = a > b ? 1 : a < b ? -1 : 0;
        }
        return r;
    }
    function diffTime(unitName, date1, date2) { // ms, second, minute, hour
        var ms = parts[units[unitName][0]][2],
            diff = (date2 - date1) / ms;
        return Math[date1 < date2 ? "floor" : "ceil"](diff);
    }
    function diffDay(unitName, date1, date2) { // day, week
        // equalize the timezone offset, so that every day is 24 hours, including DST-switching days
        var z = (date1.getTimezoneOffset() - date2.getTimezoneOffset()) * 60000,
            days = ((date2 - date1) + z) / 86400000;
        return Math[date1 < date2 ? "floor" : "ceil"](days / units[unitName][1]);
    }
    function diffMonth(unitName, date1, date2) { // month, year
        var months = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth()),
            dateComparison = compareDateDetail(4, date2, date1);
        // if there's an incomplete month, remove it (add or subtract depending on sign)
        months += (months < 0 ? 1 : months > 0 ? -1 : 0) === dateComparison ? dateComparison : 0;
        return Math[date1 < date2 ? "floor" : "ceil"](months / (unitName === "year" ? 12 : 1));
    }
    function diff(unitName, date1, date2) {
        if (!isDate(date1) || !isDate(date2)) {
            return NaN;
        } else if (!units[unitName]) {
            throw new Error("diff(unit, date1, date2) received unexpected value for 'unit'");
        }
        var partsIndex = units[unitName][0],
            diffFunction = partsIndex < 4 ? diffTime : partsIndex === 4 ? diffDay : diffMonth;
        return diffFunction(unitName, date1, date2);
    }
    return diff;
}());

// range(String, Date, Date, Number) -> Array

function range(intervalName, date1, date2, step) { // returns an array of dates >= date1 and < date2
    if (!intervals[intervalName] && !units[intervalName]) {
        throw new Error("range(interval, date1, date2, step) received unexpected value for 'interval'");
    } else if (!isDate(date1) || !isDate(date2)) {
        throw new Error("range(interval, date1, date2, step) expected Dates for 'date1' and 'date2'");
    }
    step = Math.max(1, Math.round(step) || 1); // step must be an integer >= 1
    var unitName = intervals[intervalName] ? intervals[intervalName][4] : intervalName,
        unitCoeff = intervals[intervalName] ? intervals[intervalName][5] : 1,
        a = [],
        d = ceil(intervalName, date1);
    while (d < date2) {
        a.push(d);
        d = add(unitName, unitCoeff * step, d);
    }
    return a;
}

// export

var _date = {
        isDate: isDate,
        isDateString: isDateString,
        fromString: fromString,
        toUTC: toUTC,
        format: format,
        floor: floor,
        ceil: ceil,
        add: add,
        diff: diff,
        range: range
    };

if (typeof exports === "object") {
    module.exports = _date;
} else if (typeof define === "function" && define.amd) {
    define(function() { return _date; });
} else {
    global.DATE = _date;
}

}(this));
