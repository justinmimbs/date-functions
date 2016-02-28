import { isDate, isDateString, fromString, format, floor, ceil, add, diff, range } from './date-functions';

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

describe('fromString(string)', () => {
    it('throws a TypeError when `string` is not a String', () => {
        expect(() => fromString()).toThrowError(TypeError);
        expect(() => fromString(null)).toThrowError(TypeError);
        expect(() => fromString(true)).toThrowError(TypeError);
        expect(() => fromString(0)).toThrowError(TypeError);
        expect(() => fromString({})).toThrowError(TypeError);
    });
    it('returns an Invalid Date when it cannot parse the string as a Date', () => {
        expect(fromString('')).toEqual(jasmine.any(Date));
        expect(String(fromString(''))).toEqual(String(new Date(NaN)));
    });
    it('parses ISO-8601 strings and returns Date objects as expected', () => {
        expect(fromString('2012-09-27')).toEqual(jasmine.any(Date));
        expect(fromString('2012-09-27')).toEqual(new Date(2012, 8, 27));
        expect(fromString('20120927')).toEqual(new Date(2012, 8, 27));
        expect(fromString('2012-09-27T22:56:00.555')).toEqual(new Date(2012, 8, 27, 22, 56, 0, 555));
        expect(fromString('20120927T225600.555')).toEqual(new Date(2012, 8, 27, 22, 56, 0, 555));
    });
});

describe('format(format, date)', () => {
    it('throws a TypeError when `date` is not a Date', () => {
        expect(() => format('')).toThrowError(TypeError);
        expect(() => format('', null)).toThrowError(TypeError);
        expect(() => format('', true)).toThrowError(TypeError);
        expect(() => format('', 0)).toThrowError(TypeError);
        expect(() => format('', '')).toThrowError(TypeError);
        expect(() => format('', {})).toThrowError(TypeError);
    });
    it('returns a String representing `date` by replacing tokens in `format`', () => {
        expect(format('ddd, mmm d, yyyy', new Date(2012, 8, 27))).toBe('Thu, Sep 27, 2012');
    });
    it('replaces date tokens as expected', () => {
        const dateTokens = 'yyyy yy mmmm mmm mm m dddd ddd dd d S q o ww w N';
        const date = new Date(2012, 8, 27, 22, 56, 0, 555);
        const formatted = '2012 12 September Sep 09 9 Thursday Thu 27 27 th 3 2012 39 39 4';
        expect(format(dateTokens, date)).toEqual(formatted);
    });
    it('replaces time tokens as expected', () => {
        const timeTokens = 'HH H hh h MM M ss s l AA A aa a';
        const date = new Date(2012, 8, 27, 22, 56, 0, 555);
        const formatted = '22 22 10 10 56 56 00 0 555 PM P pm p';
        expect(format(timeTokens, date)).toEqual(formatted);
    });
    it('allows tokens to be escaped between square brackets', () => {
        expect(format('[yyyy]: yyyy', new Date(1985, 0))).toEqual('yyyy: 1985');
    });
});

describe('Converting losslessly from Date to String and back', () => {
    it('is possible with `format` and `fromString`', () => {
        const date = new Date();
        const isoFormat = 'yyyy-mm-ddTHH:MM:ss.l';
        expect(fromString(format(isoFormat, date))).toEqual(date);
    });
});

describe('floor(interval, date)', () => {
    it('throws an Error when given an unknown `interval`', () => {
        expect(() => floor(null,        new Date())).toThrowError(Error);
        expect(() => floor('something', new Date())).toThrowError(Error);
        expect(() => floor('__proto__', new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `date` is not a Date', () => {
        expect(() => floor('month')).toThrowError(TypeError);
        expect(() => floor('month', null)).toThrowError(TypeError);
        expect(() => floor('month', true)).toThrowError(TypeError);
        expect(() => floor('month', 0)).toThrowError(TypeError);
        expect(() => floor('month', '')).toThrowError(TypeError);
        expect(() => floor('month', {})).toThrowError(TypeError);
    });
    it('returns a Date rounded down to the nearest `interval`', () => {
        expect(floor('ms',        fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T16:59:55.555'));
        expect(floor('second',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T16:59:55.000'));
        expect(floor('minute',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T16:59:00.000'));
        expect(floor('hour',      fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T16:00:00.000'));
        expect(floor('day',       fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T00:00:00.000'));
        expect(floor('month',     fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-01T00:00:00.000'));
        expect(floor('year',      fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-01-01T00:00:00.000'));
        expect(floor('week',      fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-02T00:00:00.000'));
        expect(floor('monday',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-02T00:00:00.000'));
        expect(floor('tuesday',   fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-03T00:00:00.000'));
        expect(floor('wednesday', fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-04T00:00:00.000'));
        expect(floor('thursday',  fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-05T00:00:00.000'));
        expect(floor('friday',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-06T00:00:00.000'));
        expect(floor('saturday',  fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-07T00:00:00.000'));
        expect(floor('sunday',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T00:00:00.000'));
        expect(floor('quarter',   fromString('2014-03-31T16:59:55.555'))).toEqual(fromString('2014-01-01T00:00:00.000'));
        expect(floor('quarter',   fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-04-01T00:00:00.000'));
        expect(floor('quarter',   fromString('2014-07-11T16:59:55.555'))).toEqual(fromString('2014-07-01T00:00:00.000'));
        expect(floor('quarter',   fromString('2014-12-11T16:59:55.555'))).toEqual(fromString('2014-10-01T00:00:00.000'));
        expect(floor('quarter',   fromString('2014-10-01T00:00:00.000'))).toEqual(fromString('2014-10-01T00:00:00.000'));
    });
    it('returns a new Date and does not mutate `date`', () => {
        const date1 = new Date();
        const date1Value = date1.getTime();
        const date2 = floor('year', date1);
        expect(date2).not.toBe(date1);
        expect(date1.getTime()).toBe(date1Value);
    });
});

describe('ceil(interval, date)', () => {
    it('throws an Error when given an unknown `interval`', () => {
        expect(() => ceil(null,        new Date())).toThrowError(Error);
        expect(() => ceil('something', new Date())).toThrowError(Error);
        expect(() => ceil('__proto__', new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `date` is not a Date', () => {
        expect(() => ceil('month')).toThrowError(TypeError);
        expect(() => ceil('month', null)).toThrowError(TypeError);
        expect(() => ceil('month', true)).toThrowError(TypeError);
        expect(() => ceil('month', 0)).toThrowError(TypeError);
        expect(() => ceil('month', '')).toThrowError(TypeError);
        expect(() => ceil('month', {})).toThrowError(TypeError);
    });
    it('returns a Date rounded up to the nearest `interval`', () => {
        expect(ceil('ms',        fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T16:59:55.555'));
        expect(ceil('second',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T16:59:56.000'));
        expect(ceil('minute',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T17:00:00.000'));
        expect(ceil('hour',      fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-08T17:00:00.000'));
        expect(ceil('day',       fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-09T00:00:00.000'));
        expect(ceil('month',     fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-07-01T00:00:00.000'));
        expect(ceil('year',      fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2015-01-01T00:00:00.000'));
        expect(ceil('week',      fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-09T00:00:00.000'));
        expect(ceil('monday',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-09T00:00:00.000'));
        expect(ceil('tuesday',   fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-10T00:00:00.000'));
        expect(ceil('wednesday', fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-11T00:00:00.000'));
        expect(ceil('thursday',  fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-12T00:00:00.000'));
        expect(ceil('friday',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-13T00:00:00.000'));
        expect(ceil('saturday',  fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-14T00:00:00.000'));
        expect(ceil('sunday',    fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-06-15T00:00:00.000'));
        expect(ceil('quarter',   fromString('2014-03-31T16:59:55.555'))).toEqual(fromString('2014-04-01T00:00:00.000'));
        expect(ceil('quarter',   fromString('2014-06-08T16:59:55.555'))).toEqual(fromString('2014-07-01T00:00:00.000'));
        expect(ceil('quarter',   fromString('2014-07-11T16:59:55.555'))).toEqual(fromString('2014-10-01T00:00:00.000'));
        expect(ceil('quarter',   fromString('2014-12-11T16:59:55.555'))).toEqual(fromString('2015-01-01T00:00:00.000'));
        expect(ceil('quarter',   fromString('2014-10-01T00:00:00.000'))).toEqual(fromString('2014-10-01T00:00:00.000'));
    });
    it('returns a new Date and does not mutate `date`', () => {
        const date1 = new Date();
        const date1Value = date1.getTime();
        const date2 = ceil('year', date1);
        expect(date2).not.toBe(date1);
        expect(date1.getTime()).toBe(date1Value);
    });
});

describe('add(unit, n, date)', () => {
    it('throws an Error when given an unknown `unit`', () => {
        expect(() => add(null,        1, new Date())).toThrowError(Error);
        expect(() => add('something', 1, new Date())).toThrowError(Error);
        expect(() => add('monday',    1, new Date())).toThrowError(Error);
        expect(() => add('__proto__', 1, new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `n` is not a Number', () => {
        expect(() => add('month')).toThrowError(TypeError);
        expect(() => add('month', null, new Date())).toThrowError(TypeError);
        expect(() => add('month', true, new Date())).toThrowError(TypeError);
        expect(() => add('month', '1',  new Date())).toThrowError(TypeError);
        expect(() => add('month', '',   new Date())).toThrowError(TypeError);
        expect(() => add('month', {},   new Date())).toThrowError(TypeError);
    });
    it('throws a TypeError when `date` is not a Date', () => {
        expect(() => add('month', 1)).toThrowError(TypeError);
        expect(() => add('month', 1, null)).toThrowError(TypeError);
        expect(() => add('month', 1, true)).toThrowError(TypeError);
        expect(() => add('month', 1, 0)).toThrowError(TypeError);
        expect(() => add('month', 1, '')).toThrowError(TypeError);
        expect(() => add('month', 1, {})).toThrowError(TypeError);
    });
    it('returns a Date with `n` `unit`s added to `date`', () => {
        expect(add('ms',     3600000, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-08T17:59:00.000'));
        expect(add('ms',           6, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-08T16:59:00.006'));
        expect(add('ms',         -14, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-08T16:58:59.986'));
        expect(add('second',    3600, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-08T17:59:00.000'));
        expect(add('second',   86400, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-09T16:59:00.000'));
        expect(add('second',     -24, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-08T16:58:36.000'));
        expect(add('minute',    2160, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-10T04:59:00.000'));
        expect(add('minute',     -59, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-08T16:00:00.000'));
        expect(add('hour',        12, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-09T04:59:00.000'));
        expect(add('hour',        -6, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-08T10:59:00.000'));
        expect(add('day',          6, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-14T16:59:00.000'));
        expect(add('day',        -14, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-05-25T16:59:00.000'));
        expect(add('week',        -1, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-06-01T16:59:00.000'));
        expect(add('week',        26, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-12-07T16:59:00.000'));
        expect(add('month',       -3, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2014-03-08T16:59:00.000'));
        expect(add('month',       18, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2015-12-08T16:59:00.000'));
        expect(add('year',         5, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('2019-06-08T16:59:00.000'));
        expect(add('year',       -33, fromString('2014-06-08T16:59:00.000'))).toEqual(fromString('1981-06-08T16:59:00.000'));
    });
    it('returns a new Date and does not mutate `date`', () => {
        const date1 = new Date();
        const date1Value = date1.getTime();
        const date2 = add('year', 1, date1);
        expect(date2).not.toBe(date1);
        expect(date1.getTime()).toBe(date1Value);
    });
});

describe('diff(unit, date1, date2)', () => {
    it('throws an Error when given an unknown `unit`', () => {
        expect(() => diff(null,        new Date(), new Date())).toThrowError(Error);
        expect(() => diff('something', new Date(), new Date())).toThrowError(Error);
        expect(() => diff('monday',    new Date(), new Date())).toThrowError(Error);
        expect(() => diff('__proto__', new Date(), new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `date1` is not a Date', () => {
        expect(() => diff('month')).toThrowError(TypeError);
        expect(() => diff('month', null, new Date())).toThrowError(TypeError);
        expect(() => diff('month', true, new Date())).toThrowError(TypeError);
        expect(() => diff('month', 0,    new Date())).toThrowError(TypeError);
        expect(() => diff('month', '',   new Date())).toThrowError(TypeError);
        expect(() => diff('month', {},   new Date())).toThrowError(TypeError);
    });
    it('throws a TypeError when `date2` is not a Date', () => {
        expect(() => diff('month', new Date())).toThrowError(TypeError);
        expect(() => diff('month', new Date(), null)).toThrowError(TypeError);
        expect(() => diff('month', new Date(), true)).toThrowError(TypeError);
        expect(() => diff('month', new Date(), 0)).toThrowError(TypeError);
        expect(() => diff('month', new Date(), '')).toThrowError(TypeError);
        expect(() => diff('month', new Date(), {})).toThrowError(TypeError);
    });
    it('returns a Number representing the count of whole `unit`s between `date1` and `date2`', () => {
        expect(diff('ms',     fromString('2014-06-08T16:59:55.555'), fromString('2014-06-08T16:59:55.000'))).toBe(-555);
        expect(diff('ms',     fromString('1981-06-08T16:59:55.555'), fromString('2014-06-08T16:59:55.555'))).toBe(1041379200000);
        expect(diff('second', fromString('2014-06-08T16:59:55.555'), fromString('2014-06-08T16:59:00.000'))).toBe(-55);
        expect(diff('second', fromString('2014-06-08T00:00:00.000'), fromString('2014-06-08T16:59:55.555'))).toBe(61195);
        expect(diff('minute', fromString('2014-06-08T16:59:55.555'), fromString('2014-06-08T16:00:00.000'))).toBe(-59);
        expect(diff('minute', fromString('2014-06-01T00:00:00.000'), fromString('2014-06-08T16:59:55.555'))).toBe(11099);
        expect(diff('hour',   fromString('2014-06-08T16:59:55.555'), fromString('2014-06-01T00:00:00.000'))).toBe(-184);
        expect(diff('hour',   fromString('1981-06-08T16:59:55.555'), fromString('2014-06-08T16:59:55.555'))).toBe(289272);
        expect(diff('hour',   fromString('2014-03-09T00:00:00.000'), fromString('2014-03-10T00:00:00.000'))).toBe(23);
        expect(diff('hour',   fromString('2014-11-01T06:00:00.000'), fromString('2014-11-02T06:00:00.000'))).toBe(25);
        expect(diff('day',    fromString('1981-06-08T16:59:55.555'), fromString('2014-06-08T16:59:55.555'))).toBe(12053);
        expect(diff('day',    fromString('2014-06-08T16:59:55.555'), fromString('2014-06-08T16:59:55.555'))).toBe(0);
        expect(diff('day',    fromString('2014-06-07T16:59:55.555'), fromString('2014-06-08T16:59:55.555'))).toBe(1);
        expect(diff('day',    fromString('2014-06-07T16:59:55.556'), fromString('2014-06-08T16:59:55.555'))).toBe(0);
        expect(diff('day',    fromString('2014-06-01T00:00:00.000'), fromString('2014-06-08T16:59:55.555'))).toBe(7);
        expect(diff('day',    fromString('2014-06-06T15:59:55.555'), fromString('2014-06-08T16:59:55.555'))).toBe(2);
        expect(diff('day',    fromString('2014-03-08T16:59:55.555'), fromString('2014-03-09T16:59:55.555'))).toBe(1);
        expect(diff('day',    fromString('2014-03-08T16:59:55.555'), fromString('2014-03-09T16:59:55.554'))).toBe(0);
        expect(diff('day',    fromString('2014-11-01T16:59:55.555'), fromString('2014-11-02T16:59:55.555'))).toBe(1);
        expect(diff('day',    fromString('2014-11-01T16:59:55.555'), fromString('2014-11-02T16:59:54.555'))).toBe(0);
        expect(diff('day',    fromString('2014-06-08T16:59:55.555'), fromString('1981-06-08T16:59:55.555'))).toBe(-12053);
        expect(diff('day',    fromString('2014-06-08T16:59:55.555'), fromString('2014-06-07T16:59:55.555'))).toBe(-1);
        expect(diff('day',    fromString('2014-06-08T16:59:55.555'), fromString('2014-06-07T16:59:55.556'))).toBe(0);
        expect(diff('day',    fromString('2014-06-08T16:59:55.555'), fromString('2014-06-01T00:00:00.000'))).toBe(-7);
        expect(diff('day',    fromString('2014-06-08T16:59:55.555'), fromString('2014-06-06T15:59:55.555'))).toBe(-2);
        expect(diff('day',    fromString('2014-03-09T16:59:55.555'), fromString('2014-03-08T16:59:55.555'))).toBe(-1);
        expect(diff('day',    fromString('2014-03-09T16:59:55.554'), fromString('2014-03-08T16:59:55.555'))).toBe(0);
        expect(diff('day',    fromString('2014-11-02T16:59:55.555'), fromString('2014-11-01T16:59:55.555'))).toBe(-1);
        expect(diff('day',    fromString('2014-11-02T16:59:54.555'), fromString('2014-11-01T16:59:55.555'))).toBe(0);
        expect(diff('day',    fromString('2014-11-02T00:00:00.000'), fromString('2014-11-02T23:59:55.555'))).toBe(0);
        expect(diff('day',    fromString('2014-01-31T00:00:00.000'), fromString('2014-11-30T23:59:55.555'))).toBe(303);
        expect(diff('week',   fromString('2014-01-31T00:00:00.000'), fromString('2014-11-30T23:59:55.555'))).toBe(43);
        expect(diff('week',   fromString('2014-11-01T00:00:00.000'), fromString('2014-11-22T00:00:00.000'))).toBe(3);
        expect(diff('week',   fromString('2014-11-22T00:00:00.000'), fromString('2014-11-01T00:00:00.000'))).toBe(-3);
        expect(diff('week',   fromString('2014-11-22T00:00:00.000'), fromString('2014-11-01T00:00:00.001'))).toBe(-2);
        expect(diff('month',  fromString('2014-02-01T00:00:00.000'), fromString('2014-07-01T00:00:00.000'))).toBe(5);
        expect(diff('month',  fromString('2013-02-01T00:00:00.000'), fromString('2014-07-01T00:00:00.000'))).toBe(17);
        expect(diff('month',  fromString('2013-02-01T00:00:00.001'), fromString('2014-07-01T00:00:00.000'))).toBe(16);
        expect(diff('month',  fromString('2014-02-01T00:00:00.000'), fromString('2012-07-01T00:00:00.000'))).toBe(-19);
        expect(diff('month',  fromString('2014-02-01T00:00:00.000'), fromString('2012-07-01T00:00:00.001'))).toBe(-18);
        expect(diff('month',  fromString('2014-07-01T00:00:00.000'), fromString('2014-02-01T00:00:00.001'))).toBe(-4);
        expect(diff('month',  fromString('2014-02-28T00:00:00.000'), fromString('2014-03-28T00:00:00.000'))).toBe(1);
        expect(diff('month',  fromString('2014-02-28T00:00:00.000'), fromString('2014-03-27T23:59:59.999'))).toBe(0);
        expect(diff('year',   fromString('2014-06-08T16:59:55.555'), fromString('2018-06-08T16:59:55.555'))).toBe(4);
        expect(diff('year',   fromString('2014-06-08T16:59:55.555'), fromString('2018-06-08T16:59:55.554'))).toBe(3);
        expect(diff('year',   fromString('2018-06-08T16:59:55.555'), fromString('2014-06-08T16:59:55.555'))).toBe(-4);
        expect(diff('year',   fromString('2018-06-08T16:59:55.554'), fromString('2014-06-08T16:59:55.555'))).toBe(-3);
    });
});

describe('range(interval, date1, date2[, step])', () => {
    it('throws an Error when given an unknown `interval`', () => {
        expect(() => range(null,        new Date(), new Date())).toThrowError(Error);
        expect(() => range('something', new Date(), new Date())).toThrowError(Error);
        expect(() => range('__proto__', new Date(), new Date())).toThrowError(Error);
    });
    it('throws a TypeError when `date1` is not a Date', () => {
        expect(() => range('month')).toThrowError(TypeError);
        expect(() => range('month', null, new Date())).toThrowError(TypeError);
        expect(() => range('month', true, new Date())).toThrowError(TypeError);
        expect(() => range('month', 0,    new Date())).toThrowError(TypeError);
        expect(() => range('month', '',   new Date())).toThrowError(TypeError);
        expect(() => range('month', {},   new Date())).toThrowError(TypeError);
    });
    it('throws a TypeError when `date2` is not a Date', () => {
        expect(() => range('month', new Date())).toThrowError(TypeError);
        expect(() => range('month', new Date(), null)).toThrowError(TypeError);
        expect(() => range('month', new Date(), true)).toThrowError(TypeError);
        expect(() => range('month', new Date(), 0)).toThrowError(TypeError);
        expect(() => range('month', new Date(), '')).toThrowError(TypeError);
        expect(() => range('month', new Date(), {})).toThrowError(TypeError);
    });
    it('throws a TypeError when `step` is not a Number', () => {
        expect(() => range('month', new Date(), new Date(), null)).toThrowError(TypeError);
        expect(() => range('month', new Date(), new Date(), true)).toThrowError(TypeError);
        expect(() => range('month', new Date(), new Date(), '1')).toThrowError(TypeError);
        expect(() => range('month', new Date(), new Date(), {})).toThrowError(TypeError);
    });
    it('returns an Array of Dates at every `step` `interval`s >= `date1` and < `date2`', () => {
        expect(range('month', new Date(2000, 0, 1), new Date(2000, 2, 31)))
            .toEqual([
                new Date(2000, 0, 1),
                new Date(2000, 1, 1),
                new Date(2000, 2, 1),
            ]);
        expect(range('monday', fromString('2014-06-01'), fromString('2014-07-01'), 1))
            .toEqual([
                '2014-06-02',
                '2014-06-09',
                '2014-06-16',
                '2014-06-23',
                '2014-06-30',
            ].map(fromString));
        expect(range('monday', fromString('2014-06-01'), fromString('2014-07-01'), 2))
            .toEqual([
                '2014-06-02',
                '2014-06-16',
                '2014-06-30',
            ].map(fromString));
        expect(range('day', fromString('2014-06-01'), fromString('2014-07-01'), 1).length).toBe(30);
        expect(range('hour', fromString('2014-05-31T23:45'), fromString('2014-06-02'), 4))
            .toEqual([
                '2014-06-01T00:00:00.000',
                '2014-06-01T04:00:00.000',
                '2014-06-01T08:00:00.000',
                '2014-06-01T12:00:00.000',
                '2014-06-01T16:00:00.000',
                '2014-06-01T20:00:00.000',
            ].map(fromString));
    });
    it('uses a default `step` of 1', () => {
        expect(range('day', fromString('2014-06-01'), fromString('2014-07-01'), 1))
            .toEqual(range('day', fromString('2014-06-01'), fromString('2014-07-01')));
    });
});

describe('Using `range` to verify `format`', () => {
    it('names weekdays as expected', () => {
        expect(range('day', fromString('1981-06-08'), fromString('1981-06-15')).map(format.bind(null, 'dddd')))
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
        expect(range('month', fromString('1981-01-01'), fromString('1982-01-01')).map(format.bind(null, 'mmmm')))
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
        expect(range('day', fromString('1981-01-01'), fromString('1981-02-01')).map(format.bind(null, 'dS')))
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
