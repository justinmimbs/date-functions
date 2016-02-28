import { isDate, isDateString, dateFromString, dateFormat, dateFloor, dateCeil, dateAdd, dateDiff, dateRange } from './date-functions';

describe('isDate(value[, acceptInvalidDate])', () => {
    it('returns `false` when `value` is not a Date', () => {
        expect(isDate()).toBe(false);
        expect(isDate(null)).toBe(false);
        expect(isDate(true)).toBe(false);
        expect(isDate(0)).toBe(false);
        expect(isDate('')).toBe(false);
        expect(isDate({})).toBe(false);
        expect(isDate(Date)).toBe(false);
    });
    it('returns `true` when `value` is a valid Date', () => {
        expect(isDate(new Date())).toBe(true);
    });
    it('by default, returns `false` when `value` is an Invalid Date', () => {
        expect(isDate(new Date(NaN))).toBe(false);
    });
    it('returns `true` when `value` is an Invalid Date and `acceptInvalidDate` is truthy', () => {
        expect(isDate(new Date(NaN), true)).toBe(true);
    });
    it('still returns `false` when `value` is not a Date and `acceptInvalidDate` is truthy', () => {
        expect(isDate({}, true)).toBe(false);
    });
});

describe('isDateString(value)', () => {
    it('returns `false` when `value` is not a String', () => {
        expect(isDateString()).toBe(false);
        expect(isDateString(null)).toBe(false);
        expect(isDateString(true)).toBe(false);
        expect(isDateString(0)).toBe(false);
        expect(isDateString(19991231)).toBe(false);
        expect(isDateString({})).toBe(false);
        expect(isDateString(new Date())).toBe(false);
    });
    it('returns `true` when `value` represents a valid date in the format \'yyyy-mm-dd\'', () => {
        expect(isDateString('1999-12-31')).toBe(true);
        expect(isDateString('2004-02-29')).toBe(true);
    });
    it('returns `true` when `value` represents a valid date in the format \'yyyymmdd\'', () => {
        expect(isDateString('19991231')).toBe(true);
        expect(isDateString('20040229')).toBe(true);
    });
    it('returns `true` when `value` represents a valid date in the format \'m/d/yyyy\'', () => {
        expect(isDateString('12/31/1999')).toBe(true);
        expect(isDateString('2/29/2004')).toBe(true);
    });
    it('returns `false` when `value` is in a valid format, but does not represent a valid date', () => {
        expect(isDateString('1999-06-31')).toBe(false);
        expect(isDateString('19990631')).toBe(false);
        expect(isDateString('6/31/1999')).toBe(false);
        expect(isDateString('1900-02-29')).toBe(false);
        expect(isDateString('19000229')).toBe(false);
        expect(isDateString('2/29/1900')).toBe(false);
        expect(isDateString('1999-00-01')).toBe(false);
        expect(isDateString('19990001')).toBe(false);
        expect(isDateString('0/1/1999')).toBe(false);
    });
});

describe('dateFromString(string)', () => {
    it('throws a TypeError when `string` is not a String', () => {
        expect(() => dateFromString()).toThrowError(TypeError);
        expect(() => dateFromString(null)).toThrowError(TypeError);
        expect(() => dateFromString(true)).toThrowError(TypeError);
        expect(() => dateFromString(0)).toThrowError(TypeError);
        expect(() => dateFromString({})).toThrowError(TypeError);
    });
    it('returns an Invalid Date when it cannot parse the string as a Date', () => {
        expect(dateFromString('')).toEqual(jasmine.any(Date));
        expect(String(dateFromString(''))).toEqual(String(new Date(NaN)));
    });
    it('parses ISO-8601 strings and returns Date objects as expected', () => {
        expect(dateFromString('2012-09-27')).toEqual(jasmine.any(Date));
        expect(dateFromString('2012-09-27')).toEqual(new Date(2012, 8, 27));
        expect(dateFromString('20120927')).toEqual(new Date(2012, 8, 27));
        expect(dateFromString('2012-09-27T22:56:00.555')).toEqual(new Date(2012, 8, 27, 22, 56, 0, 555));
        expect(dateFromString('20120927T225600.555')).toEqual(new Date(2012, 8, 27, 22, 56, 0, 555));
    });
});

describe('dateFormat(format, date)', () => {
    it('throws a TypeError when `date` is not a Date', () => {
        expect(() => dateFormat('')).toThrowError(TypeError);
        expect(() => dateFormat('', null)).toThrowError(TypeError);
        expect(() => dateFormat('', true)).toThrowError(TypeError);
        expect(() => dateFormat('', 0)).toThrowError(TypeError);
        expect(() => dateFormat('', '')).toThrowError(TypeError);
        expect(() => dateFormat('', {})).toThrowError(TypeError);
    });
    it('returns a String representing `date` by replacing tokens in `format`', () => {
        expect(dateFormat('ddd, mmm d, yyyy', new Date(2012, 8, 27))).toBe('Thu, Sep 27, 2012');
    });
    it('replaces date tokens as expected', () => {
        const dateTokens = 'yyyy yy mmmm mmm mm m dddd ddd dd d S q o ww w N';
        const date = new Date(2012, 8, 27, 22, 56, 0, 555);
        const formatted = '2012 12 September Sep 09 9 Thursday Thu 27 27 th 3 2012 39 39 4';
        expect(dateFormat(dateTokens, date)).toEqual(formatted);
    });
    it('replaces time tokens as expected', () => {
        const timeTokens = 'HH H hh h MM M ss s l AA A aa a';
        const date = new Date(2012, 8, 27, 22, 56, 0, 555);
        const formatted = '22 22 10 10 56 56 00 0 555 PM P pm p';
        expect(dateFormat(timeTokens, date)).toEqual(formatted);
    });
    it('allows tokens to be escaped between square brackets', () => {
        expect(dateFormat('[yyyy]: yyyy', new Date(1985, 0))).toEqual('yyyy: 1985');
    });
});

describe('Converting losslessly from Date to String and back', () => {
    it('is possible with `dateFormat` and `dateFromString`', () => {
        const date = new Date();
        const isoFormat = 'yyyy-mm-ddTHH:MM:ss.l';
        expect(dateFromString(dateFormat(isoFormat, date))).toEqual(date);
    });
});

describe('dateFloor(interval, date)', () => {
    it('throws an Error when given an unknown `interval`', () => {
        expect(() => dateFloor(null,        new Date())).toThrowError(Error);
        expect(() => dateFloor('something', new Date())).toThrowError(Error);
        expect(() => dateFloor('__proto__', new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `date` is not a Date', () => {
        expect(() => dateFloor('month')).toThrowError(TypeError);
        expect(() => dateFloor('month', null)).toThrowError(TypeError);
        expect(() => dateFloor('month', true)).toThrowError(TypeError);
        expect(() => dateFloor('month', 0)).toThrowError(TypeError);
        expect(() => dateFloor('month', '')).toThrowError(TypeError);
        expect(() => dateFloor('month', {})).toThrowError(TypeError);
    });
    it('returns a Date rounded down to the nearest `interval`', () => {
        expect(dateFloor('ms',        dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T16:59:55.555'));
        expect(dateFloor('second',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T16:59:55.000'));
        expect(dateFloor('minute',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T16:59:00.000'));
        expect(dateFloor('hour',      dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T16:00:00.000'));
        expect(dateFloor('day',       dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T00:00:00.000'));
        expect(dateFloor('month',     dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-01T00:00:00.000'));
        expect(dateFloor('year',      dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-01-01T00:00:00.000'));
        expect(dateFloor('week',      dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-02T00:00:00.000'));
        expect(dateFloor('monday',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-02T00:00:00.000'));
        expect(dateFloor('tuesday',   dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-03T00:00:00.000'));
        expect(dateFloor('wednesday', dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-04T00:00:00.000'));
        expect(dateFloor('thursday',  dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-05T00:00:00.000'));
        expect(dateFloor('friday',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-06T00:00:00.000'));
        expect(dateFloor('saturday',  dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-07T00:00:00.000'));
        expect(dateFloor('sunday',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T00:00:00.000'));
        expect(dateFloor('quarter',   dateFromString('2014-03-31T16:59:55.555'))).toEqual(dateFromString('2014-01-01T00:00:00.000'));
        expect(dateFloor('quarter',   dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-04-01T00:00:00.000'));
        expect(dateFloor('quarter',   dateFromString('2014-07-11T16:59:55.555'))).toEqual(dateFromString('2014-07-01T00:00:00.000'));
        expect(dateFloor('quarter',   dateFromString('2014-12-11T16:59:55.555'))).toEqual(dateFromString('2014-10-01T00:00:00.000'));
        expect(dateFloor('quarter',   dateFromString('2014-10-01T00:00:00.000'))).toEqual(dateFromString('2014-10-01T00:00:00.000'));
    });
    it('returns a new Date and does not mutate `date`', () => {
        const date1 = new Date();
        const date1Value = date1.getTime();
        const date2 = dateFloor('year', date1);
        expect(date2).not.toBe(date1);
        expect(date1.getTime()).toBe(date1Value);
    });
});

describe('dateCeil(interval, date)', () => {
    it('throws an Error when given an unknown `interval`', () => {
        expect(() => dateCeil(null,        new Date())).toThrowError(Error);
        expect(() => dateCeil('something', new Date())).toThrowError(Error);
        expect(() => dateCeil('__proto__', new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `date` is not a Date', () => {
        expect(() => dateCeil('month')).toThrowError(TypeError);
        expect(() => dateCeil('month', null)).toThrowError(TypeError);
        expect(() => dateCeil('month', true)).toThrowError(TypeError);
        expect(() => dateCeil('month', 0)).toThrowError(TypeError);
        expect(() => dateCeil('month', '')).toThrowError(TypeError);
        expect(() => dateCeil('month', {})).toThrowError(TypeError);
    });
    it('returns a Date rounded up to the nearest `interval`', () => {
        expect(dateCeil('ms',        dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T16:59:55.555'));
        expect(dateCeil('second',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T16:59:56.000'));
        expect(dateCeil('minute',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T17:00:00.000'));
        expect(dateCeil('hour',      dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-08T17:00:00.000'));
        expect(dateCeil('day',       dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-09T00:00:00.000'));
        expect(dateCeil('month',     dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-07-01T00:00:00.000'));
        expect(dateCeil('year',      dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2015-01-01T00:00:00.000'));
        expect(dateCeil('week',      dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-09T00:00:00.000'));
        expect(dateCeil('monday',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-09T00:00:00.000'));
        expect(dateCeil('tuesday',   dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-10T00:00:00.000'));
        expect(dateCeil('wednesday', dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-11T00:00:00.000'));
        expect(dateCeil('thursday',  dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-12T00:00:00.000'));
        expect(dateCeil('friday',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-13T00:00:00.000'));
        expect(dateCeil('saturday',  dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-14T00:00:00.000'));
        expect(dateCeil('sunday',    dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-06-15T00:00:00.000'));
        expect(dateCeil('quarter',   dateFromString('2014-03-31T16:59:55.555'))).toEqual(dateFromString('2014-04-01T00:00:00.000'));
        expect(dateCeil('quarter',   dateFromString('2014-06-08T16:59:55.555'))).toEqual(dateFromString('2014-07-01T00:00:00.000'));
        expect(dateCeil('quarter',   dateFromString('2014-07-11T16:59:55.555'))).toEqual(dateFromString('2014-10-01T00:00:00.000'));
        expect(dateCeil('quarter',   dateFromString('2014-12-11T16:59:55.555'))).toEqual(dateFromString('2015-01-01T00:00:00.000'));
        expect(dateCeil('quarter',   dateFromString('2014-10-01T00:00:00.000'))).toEqual(dateFromString('2014-10-01T00:00:00.000'));
    });
    it('returns a new Date and does not mutate `date`', () => {
        const date1 = new Date();
        const date1Value = date1.getTime();
        const date2 = dateCeil('year', date1);
        expect(date2).not.toBe(date1);
        expect(date1.getTime()).toBe(date1Value);
    });
});

describe('dateAdd(unit, n, date)', () => {
    it('throws an Error when given an unknown `unit`', () => {
        expect(() => dateAdd(null,        1, new Date())).toThrowError(Error);
        expect(() => dateAdd('something', 1, new Date())).toThrowError(Error);
        expect(() => dateAdd('monday',    1, new Date())).toThrowError(Error);
        expect(() => dateAdd('__proto__', 1, new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `n` is not a Number', () => {
        expect(() => dateAdd('month')).toThrowError(TypeError);
        expect(() => dateAdd('month', null, new Date())).toThrowError(TypeError);
        expect(() => dateAdd('month', true, new Date())).toThrowError(TypeError);
        expect(() => dateAdd('month', '1',  new Date())).toThrowError(TypeError);
        expect(() => dateAdd('month', '',   new Date())).toThrowError(TypeError);
        expect(() => dateAdd('month', {},   new Date())).toThrowError(TypeError);
    });
    it('throws a TypeError when `date` is not a Date', () => {
        expect(() => dateAdd('month', 1)).toThrowError(TypeError);
        expect(() => dateAdd('month', 1, null)).toThrowError(TypeError);
        expect(() => dateAdd('month', 1, true)).toThrowError(TypeError);
        expect(() => dateAdd('month', 1, 0)).toThrowError(TypeError);
        expect(() => dateAdd('month', 1, '')).toThrowError(TypeError);
        expect(() => dateAdd('month', 1, {})).toThrowError(TypeError);
    });
    it('returns a Date with `n` `unit`s added to `date`', () => {
        expect(dateAdd('ms',     3600000, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-08T17:59:00.000'));
        expect(dateAdd('ms',           6, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-08T16:59:00.006'));
        expect(dateAdd('ms',         -14, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-08T16:58:59.986'));
        expect(dateAdd('second',    3600, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-08T17:59:00.000'));
        expect(dateAdd('second',   86400, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-09T16:59:00.000'));
        expect(dateAdd('second',     -24, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-08T16:58:36.000'));
        expect(dateAdd('minute',    2160, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-10T04:59:00.000'));
        expect(dateAdd('minute',     -59, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-08T16:00:00.000'));
        expect(dateAdd('hour',        12, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-09T04:59:00.000'));
        expect(dateAdd('hour',        -6, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-08T10:59:00.000'));
        expect(dateAdd('day',          6, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-14T16:59:00.000'));
        expect(dateAdd('day',        -14, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-05-25T16:59:00.000'));
        expect(dateAdd('week',        -1, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-06-01T16:59:00.000'));
        expect(dateAdd('week',        26, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-12-07T16:59:00.000'));
        expect(dateAdd('month',       -3, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2014-03-08T16:59:00.000'));
        expect(dateAdd('month',       18, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2015-12-08T16:59:00.000'));
        expect(dateAdd('year',         5, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('2019-06-08T16:59:00.000'));
        expect(dateAdd('year',       -33, dateFromString('2014-06-08T16:59:00.000'))).toEqual(dateFromString('1981-06-08T16:59:00.000'));
    });
    it('returns a new Date and does not mutate `date`', () => {
        const date1 = new Date();
        const date1Value = date1.getTime();
        const date2 = dateAdd('year', 1, date1);
        expect(date2).not.toBe(date1);
        expect(date1.getTime()).toBe(date1Value);
    });
});

describe('dateDiff(unit, date1, date2)', () => {
    it('throws an Error when given an unknown `unit`', () => {
        expect(() => dateDiff(null,        new Date(), new Date())).toThrowError(Error);
        expect(() => dateDiff('something', new Date(), new Date())).toThrowError(Error);
        expect(() => dateDiff('monday',    new Date(), new Date())).toThrowError(Error);
        expect(() => dateDiff('__proto__', new Date(), new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `date1` is not a Date', () => {
        expect(() => dateDiff('month')).toThrowError(TypeError);
        expect(() => dateDiff('month', null, new Date())).toThrowError(TypeError);
        expect(() => dateDiff('month', true, new Date())).toThrowError(TypeError);
        expect(() => dateDiff('month', 0,    new Date())).toThrowError(TypeError);
        expect(() => dateDiff('month', '',   new Date())).toThrowError(TypeError);
        expect(() => dateDiff('month', {},   new Date())).toThrowError(TypeError);
    });
    it('throws a TypeError when `date2` is not a Date', () => {
        expect(() => dateDiff('month', new Date())).toThrowError(TypeError);
        expect(() => dateDiff('month', new Date(), null)).toThrowError(TypeError);
        expect(() => dateDiff('month', new Date(), true)).toThrowError(TypeError);
        expect(() => dateDiff('month', new Date(), 0)).toThrowError(TypeError);
        expect(() => dateDiff('month', new Date(), '')).toThrowError(TypeError);
        expect(() => dateDiff('month', new Date(), {})).toThrowError(TypeError);
    });
    it('returns a Number representing the count of whole `unit`s between `date1` and `date2`', () => {
        expect(dateDiff('ms',     dateFromString('2014-06-08T16:59:55.555'), dateFromString('2014-06-08T16:59:55.000'))).toBe(-555);
        expect(dateDiff('ms',     dateFromString('1981-06-08T16:59:55.555'), dateFromString('2014-06-08T16:59:55.555'))).toBe(1041379200000);
        expect(dateDiff('second', dateFromString('2014-06-08T16:59:55.555'), dateFromString('2014-06-08T16:59:00.000'))).toBe(-55);
        expect(dateDiff('second', dateFromString('2014-06-08T00:00:00.000'), dateFromString('2014-06-08T16:59:55.555'))).toBe(61195);
        expect(dateDiff('minute', dateFromString('2014-06-08T16:59:55.555'), dateFromString('2014-06-08T16:00:00.000'))).toBe(-59);
        expect(dateDiff('minute', dateFromString('2014-06-01T00:00:00.000'), dateFromString('2014-06-08T16:59:55.555'))).toBe(11099);
        expect(dateDiff('hour',   dateFromString('2014-06-08T16:59:55.555'), dateFromString('2014-06-01T00:00:00.000'))).toBe(-184);
        expect(dateDiff('hour',   dateFromString('1981-06-08T16:59:55.555'), dateFromString('2014-06-08T16:59:55.555'))).toBe(289272);
        expect(dateDiff('hour',   dateFromString('2014-03-09T00:00:00.000'), dateFromString('2014-03-10T00:00:00.000'))).toBe(23);
        expect(dateDiff('hour',   dateFromString('2014-11-01T06:00:00.000'), dateFromString('2014-11-02T06:00:00.000'))).toBe(25);
        expect(dateDiff('day',    dateFromString('1981-06-08T16:59:55.555'), dateFromString('2014-06-08T16:59:55.555'))).toBe(12053);
        expect(dateDiff('day',    dateFromString('2014-06-08T16:59:55.555'), dateFromString('2014-06-08T16:59:55.555'))).toBe(0);
        expect(dateDiff('day',    dateFromString('2014-06-07T16:59:55.555'), dateFromString('2014-06-08T16:59:55.555'))).toBe(1);
        expect(dateDiff('day',    dateFromString('2014-06-07T16:59:55.556'), dateFromString('2014-06-08T16:59:55.555'))).toBe(0);
        expect(dateDiff('day',    dateFromString('2014-06-01T00:00:00.000'), dateFromString('2014-06-08T16:59:55.555'))).toBe(7);
        expect(dateDiff('day',    dateFromString('2014-06-06T15:59:55.555'), dateFromString('2014-06-08T16:59:55.555'))).toBe(2);
        expect(dateDiff('day',    dateFromString('2014-03-08T16:59:55.555'), dateFromString('2014-03-09T16:59:55.555'))).toBe(1);
        expect(dateDiff('day',    dateFromString('2014-03-08T16:59:55.555'), dateFromString('2014-03-09T16:59:55.554'))).toBe(0);
        expect(dateDiff('day',    dateFromString('2014-11-01T16:59:55.555'), dateFromString('2014-11-02T16:59:55.555'))).toBe(1);
        expect(dateDiff('day',    dateFromString('2014-11-01T16:59:55.555'), dateFromString('2014-11-02T16:59:54.555'))).toBe(0);
        expect(dateDiff('day',    dateFromString('2014-06-08T16:59:55.555'), dateFromString('1981-06-08T16:59:55.555'))).toBe(-12053);
        expect(dateDiff('day',    dateFromString('2014-06-08T16:59:55.555'), dateFromString('2014-06-07T16:59:55.555'))).toBe(-1);
        expect(dateDiff('day',    dateFromString('2014-06-08T16:59:55.555'), dateFromString('2014-06-07T16:59:55.556'))).toBe(0);
        expect(dateDiff('day',    dateFromString('2014-06-08T16:59:55.555'), dateFromString('2014-06-01T00:00:00.000'))).toBe(-7);
        expect(dateDiff('day',    dateFromString('2014-06-08T16:59:55.555'), dateFromString('2014-06-06T15:59:55.555'))).toBe(-2);
        expect(dateDiff('day',    dateFromString('2014-03-09T16:59:55.555'), dateFromString('2014-03-08T16:59:55.555'))).toBe(-1);
        expect(dateDiff('day',    dateFromString('2014-03-09T16:59:55.554'), dateFromString('2014-03-08T16:59:55.555'))).toBe(0);
        expect(dateDiff('day',    dateFromString('2014-11-02T16:59:55.555'), dateFromString('2014-11-01T16:59:55.555'))).toBe(-1);
        expect(dateDiff('day',    dateFromString('2014-11-02T16:59:54.555'), dateFromString('2014-11-01T16:59:55.555'))).toBe(0);
        expect(dateDiff('day',    dateFromString('2014-11-02T00:00:00.000'), dateFromString('2014-11-02T23:59:55.555'))).toBe(0);
        expect(dateDiff('day',    dateFromString('2014-01-31T00:00:00.000'), dateFromString('2014-11-30T23:59:55.555'))).toBe(303);
        expect(dateDiff('week',   dateFromString('2014-01-31T00:00:00.000'), dateFromString('2014-11-30T23:59:55.555'))).toBe(43);
        expect(dateDiff('week',   dateFromString('2014-11-01T00:00:00.000'), dateFromString('2014-11-22T00:00:00.000'))).toBe(3);
        expect(dateDiff('week',   dateFromString('2014-11-22T00:00:00.000'), dateFromString('2014-11-01T00:00:00.000'))).toBe(-3);
        expect(dateDiff('week',   dateFromString('2014-11-22T00:00:00.000'), dateFromString('2014-11-01T00:00:00.001'))).toBe(-2);
        expect(dateDiff('month',  dateFromString('2014-02-01T00:00:00.000'), dateFromString('2014-07-01T00:00:00.000'))).toBe(5);
        expect(dateDiff('month',  dateFromString('2013-02-01T00:00:00.000'), dateFromString('2014-07-01T00:00:00.000'))).toBe(17);
        expect(dateDiff('month',  dateFromString('2013-02-01T00:00:00.001'), dateFromString('2014-07-01T00:00:00.000'))).toBe(16);
        expect(dateDiff('month',  dateFromString('2014-02-01T00:00:00.000'), dateFromString('2012-07-01T00:00:00.000'))).toBe(-19);
        expect(dateDiff('month',  dateFromString('2014-02-01T00:00:00.000'), dateFromString('2012-07-01T00:00:00.001'))).toBe(-18);
        expect(dateDiff('month',  dateFromString('2014-07-01T00:00:00.000'), dateFromString('2014-02-01T00:00:00.001'))).toBe(-4);
        expect(dateDiff('month',  dateFromString('2014-02-28T00:00:00.000'), dateFromString('2014-03-28T00:00:00.000'))).toBe(1);
        expect(dateDiff('month',  dateFromString('2014-02-28T00:00:00.000'), dateFromString('2014-03-27T23:59:59.999'))).toBe(0);
        expect(dateDiff('year',   dateFromString('2014-06-08T16:59:55.555'), dateFromString('2018-06-08T16:59:55.555'))).toBe(4);
        expect(dateDiff('year',   dateFromString('2014-06-08T16:59:55.555'), dateFromString('2018-06-08T16:59:55.554'))).toBe(3);
        expect(dateDiff('year',   dateFromString('2018-06-08T16:59:55.555'), dateFromString('2014-06-08T16:59:55.555'))).toBe(-4);
        expect(dateDiff('year',   dateFromString('2018-06-08T16:59:55.554'), dateFromString('2014-06-08T16:59:55.555'))).toBe(-3);
    });
});

describe('dateRange(interval, date1, date2[, step])', () => {
    it('throws an Error when given an unknown `interval`', () => {
        expect(() => dateRange(null,        new Date(), new Date())).toThrowError(Error);
        expect(() => dateRange('something', new Date(), new Date())).toThrowError(Error);
        expect(() => dateRange('__proto__', new Date(), new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `date1` is not a Date', () => {
        expect(() => dateRange('month')).toThrowError(TypeError);
        expect(() => dateRange('month', null, new Date())).toThrowError(TypeError);
        expect(() => dateRange('month', true, new Date())).toThrowError(TypeError);
        expect(() => dateRange('month', 0,    new Date())).toThrowError(TypeError);
        expect(() => dateRange('month', '',   new Date())).toThrowError(TypeError);
        expect(() => dateRange('month', {},   new Date())).toThrowError(TypeError);
    });
    it('throws a TypeError when `date2` is not a Date', () => {
        expect(() => dateRange('month', new Date())).toThrowError(TypeError);
        expect(() => dateRange('month', new Date(), null)).toThrowError(TypeError);
        expect(() => dateRange('month', new Date(), true)).toThrowError(TypeError);
        expect(() => dateRange('month', new Date(), 0)).toThrowError(TypeError);
        expect(() => dateRange('month', new Date(), '')).toThrowError(TypeError);
        expect(() => dateRange('month', new Date(), {})).toThrowError(TypeError);
    });
    it('throws a TypeError when `step` is not a Number', () => {
        expect(() => dateRange('month', new Date(), new Date(), null)).toThrowError(TypeError);
        expect(() => dateRange('month', new Date(), new Date(), true)).toThrowError(TypeError);
        expect(() => dateRange('month', new Date(), new Date(), '1')).toThrowError(TypeError);
        expect(() => dateRange('month', new Date(), new Date(), {})).toThrowError(TypeError);
    });
    it('returns an Array of Dates at every `step` `interval`s >= `date1` and < `date2`', () => {
        expect(dateRange('month', new Date(2000, 0, 1), new Date(2000, 2, 31)))
            .toEqual([
                new Date(2000, 0, 1),
                new Date(2000, 1, 1),
                new Date(2000, 2, 1),
            ]);
        expect(dateRange('monday', dateFromString('2014-06-01'), dateFromString('2014-07-01'), 1))
            .toEqual([
                '2014-06-02',
                '2014-06-09',
                '2014-06-16',
                '2014-06-23',
                '2014-06-30',
            ].map(dateFromString));
        expect(dateRange('monday', dateFromString('2014-06-01'), dateFromString('2014-07-01'), 2))
            .toEqual([
                '2014-06-02',
                '2014-06-16',
                '2014-06-30',
            ].map(dateFromString));
        expect(dateRange('day', dateFromString('2014-06-01'), dateFromString('2014-07-01'), 1).length).toBe(30);
        expect(dateRange('hour', dateFromString('2014-05-31T23:45'), dateFromString('2014-06-02'), 4))
            .toEqual([
                '2014-06-01T00:00:00.000',
                '2014-06-01T04:00:00.000',
                '2014-06-01T08:00:00.000',
                '2014-06-01T12:00:00.000',
                '2014-06-01T16:00:00.000',
                '2014-06-01T20:00:00.000',
            ].map(dateFromString));
    });
    it('uses a default `step` of 1', () => {
        expect(dateRange('day', dateFromString('2014-06-01'), dateFromString('2014-07-01'), 1))
            .toEqual(dateRange('day', dateFromString('2014-06-01'), dateFromString('2014-07-01')));
    });
});

describe('Using `dateRange` to verify `dateFormat`', () => {
    it('names weekdays as expected', () => {
        expect(dateRange('day', dateFromString('1981-06-08'), dateFromString('1981-06-15')).map(dateFormat.bind(null, 'dddd')))
            .toEqual([
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ]);
    });
    it('names months as expected', () => {
        expect(dateRange('month', dateFromString('1981-01-01'), dateFromString('1982-01-01')).map(dateFormat.bind(null, 'mmmm')))
            .toEqual([
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
            ]);
    });
    it('names ordinal suffixes as expected', () => {
        expect(dateRange('day', dateFromString('1981-01-01'), dateFromString('1981-02-01')).map(dateFormat.bind(null, 'dS')))
            .toEqual([
                '1st',
                '2nd',
                '3rd',
                '4th',
                '5th',
                '6th',
                '7th',
                '8th',
                '9th',
                '10th',
                '11th',
                '12th',
                '13th',
                '14th',
                '15th',
                '16th',
                '17th',
                '18th',
                '19th',
                '20th',
                '21st',
                '22nd',
                '23rd',
                '24th',
                '25th',
                '26th',
                '27th',
                '28th',
                '29th',
                '30th',
                '31st',
            ]);
    });
});
