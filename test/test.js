(function(exports) {
    'use strict';

    var usertiming = require('../src/usertiming');

    //
    // test group
    //
    var testcases = exports.usertiming = {};

    //
    // .mark() tests
    //
    testcases.mark = {};
    testcases.mark.setUp = function(cb) {
        usertiming.clearMarks();
        usertiming.clearMeasures();
        cb();
    };

    // simple mark test
    testcases.mark['mark()'] = function(test) {
        usertiming.mark('foo');

        var entries = usertiming.getEntriesByType('mark');

        test.equal(1, entries.length);
        test.equal('foo', entries[0].name);
        test.ok(entries[0].startTime >= 0);

        test.done();
    };

    // mark without a name should throw
    testcases.mark['mark(null)'] = function(test) {
        test.throws(function() {
            usertiming.mark();
        });

        test.done();
    };

    // mark of a NavigationTiming timestamp
    testcases.mark['mark() of a NT timestamp'] = function(test) {

        // NOTE we can only test this if NT exists
        if (typeof(window) !== 'undefined' &&
            typeof(window.performance) !== 'undefined' &&
            typeof(window.performance.timing) !== 'undefined' &&
            window.performance.timing.navigationStart) {
            test.throws(function() {
                usertiming.mark('navigationStart');
            });
        }

        test.done();
    };

    // create a bunch of marks, then ensure all of the marks's times are
    // greater than or equal to the last mark (i.e. in chronological order)
    testcases.mark['mark() times increment'] = function(test) {
        for (var i = 0; i < 100; i++) {
            usertiming.mark('foo');
        }

        // make sure we have the same amount of marks
        var marks = usertiming.getEntriesByType('mark');
        test.equal(100, marks.length);

        // ensure chronological order
        var lastTime = 0;
        for (i = 0; i < marks.length; i++) {
            test.ok(marks[i].startTime > 0);
            test.ok(marks[i].startTime >= lastTime);
            lastTime = marks[i].startTime;
        }

        test.done();
    };

    // clear marks
    testcases.mark['clearMarks()'] = function(test) {
        usertiming.mark('foo');
        test.equal(1, usertiming.getEntriesByType('mark').length);

        usertiming.clearMarks();
        test.equal(0, usertiming.getEntriesByType('mark').length);

        test.done();
    };

    // clear marks before any marks were called
    testcases.mark['clearMarks() - no marks before called'] = function(test) {
        test.equal(0, usertiming.getEntriesByType('mark').length);
        usertiming.clearMarks();
        test.equal(0, usertiming.getEntriesByType('mark').length);

        test.done();
    };

    // clear marks of a specific name
    testcases.mark['clearMarks(name)'] = function(test) {
        usertiming.mark('foo1');
        usertiming.mark('foo2');
        test.equal(2, usertiming.getEntriesByType('mark').length);

        // clear, shouldn't have removed foo2
        usertiming.clearMarks('foo1');
        test.equal(1, usertiming.getEntriesByType('mark').length);

        usertiming.clearMarks('foo2');

        // foo2 should now be removed
        test.equal(0, usertiming.getEntriesByType('mark').length);

        test.done();
    };

    // clear marks - ensures only marks are removed, not measures
    testcases.mark['clearMarks() with measure()s'] = function(test) {
        usertiming.mark('foo');
        test.equal(1, usertiming.getEntriesByType('mark').length);

        // measure something
        usertiming.measure('foo');
        usertiming.measure('foo');

        // clear
        usertiming.clearMarks();
        test.equal(0, usertiming.getEntriesByType('mark').length);
        test.equal(2, usertiming.getEntriesByType('measure').length);

        test.done();
    };

    //
    // .measure() tests
    //
    testcases.measure = {};
    testcases.measure.setUp = function(cb) {
        usertiming.clearMarks();
        usertiming.clearMeasures();
        cb();
    };

    // simple measure test
    testcases.measure['measure() test with no marks'] = function(test) {
        usertiming.measure('foo');

        var entries = usertiming.getEntriesByType('measure');

        test.equal(1, entries.length);
        test.equal('foo', entries[0].name);
        test.equal(0, entries[0].startTime);

        test.done();
    };

    // simple measure test with one mark
    testcases.measure['measure() test with one mark'] = function(test) {
        usertiming.mark('1');

        usertiming.measure('1', '1');

        var entries = usertiming.getEntriesByType('measure');

        test.equal(1, entries.length);
        test.equal('1', entries[0].name);
        test.ok(entries[0].startTime > 0);
        test.ok(entries[0].duration >= 0);

        test.done();
    };

    // simple measure test with two marks
    testcases.measure['measure() test with two marks'] = function(test) {
        usertiming.mark('1');
        usertiming.mark('2');

        usertiming.measure('1', '1', '2');

        var entries = usertiming.getEntriesByType('measure');

        test.equal(1, entries.length);
        test.equal('1', entries[0].name);
        test.ok(entries[0].startTime > 0);
        test.ok(entries[0].duration >= 0);

        // likely didn't take 10 seconds
        test.ok(entries[0].duration < 10000);

        test.done();
    };

    // measure without a name should throw
    testcases.measure['measure(null)'] = function(test) {
        test.throws(function() {
            usertiming.measure();
        });

        test.done();
    };

    // measure start mark not found
    testcases.measure['measure() start mark not found'] = function(test) {
        test.throws(function() {
            usertiming.measure('foo', 'BAD_MARK!');
        });

        test.done();
    };

    // measure end mark not found
    testcases.measure['measure() end mark not found'] = function(test) {
        usertiming.mark('1');
        test.throws(function() {
            usertiming.measure('foo', '1', 'BAD_MARK!');
        });

        test.done();
    };

    // clear measures
    testcases.measure['clearMeasures()'] = function(test) {
        usertiming.measure('foo');
        test.equal(1, usertiming.getEntriesByType('measure').length);

        usertiming.clearMeasures();
        test.equal(0, usertiming.getEntriesByType('measure').length);

        test.done();
    };

    // clear measures before any measures were called
    testcases.measure['clearMeasures() - no measures before called'] = function(test) {
        test.equal(0, usertiming.getEntriesByType('measure').length);
        usertiming.clearMeasures();
        test.equal(0, usertiming.getEntriesByType('measure').length);

        test.done();
    };

    // clear measures of a specific name
    testcases.measure['clearMeasures(name)'] = function(test) {
        usertiming.measure('foo1');
        usertiming.measure('foo2');
        test.equal(2, usertiming.getEntriesByType('measure').length);

        // clear, shouldn't have removed foo2
        usertiming.clearMeasures('foo1');
        test.equal(1, usertiming.getEntriesByType('measure').length);

        usertiming.clearMeasures('foo2');

        // foo2 should now be removed
        test.equal(0, usertiming.getEntriesByType('measure').length);

        test.done();
    };

    //
    // window.performance.now() shim tests
    //
    testcases.now = {};

    // simple now() test
    testcases.now['now()'] = function(test) {
        test.ok(usertiming.now() > 0);

        test.done();
    };

    // ensures sequential calls to now are increasing
    testcases.now['now() sequential'] = function(test) {
        var time1 = usertiming.now();
        var time2 = usertiming.now();
        test.ok(time2 >= time1);

        test.done();
    };

    // now() shouldn't be +(new Date), it should be offset by navigationStart
    testcases.now['now() offset by load'] = function(test) {
        // now() shouldn't be over 1000000000000, because the test would be running for >40 years
        // to get to that point
        test.ok(usertiming.now() < 1000000000000);

        test.done();
    };

    //
    // PerformanceTimeline
    //
    testcases.performancetimeline = {};
    testcases.performancetimeline.setUp = function(cb) {
        usertiming.clearMarks();
        usertiming.clearMeasures();
        cb();
    };

    // simple getEntries() test
    testcases.performancetimeline['getEntries()'] = function(test) {
        usertiming.mark('1');

        var entries = usertiming.getEntries();

        // can't guarantee there aren't other entries from the PT if the PT is natively supported
        test.ok(entries.length > 0);

        test.done();
    };

    // getEntriesByType()
    testcases.performancetimeline['getEntriesByType()'] = function(test) {
        usertiming.mark('1');
        usertiming.measure('1');

        var entries = usertiming.getEntriesByType('mark');
        test.equal(1, entries.length);
        test.equal('1', entries[0].name);
        test.ok(entries[0].startTime > 0);

        test.done();
    };

    // getEntriesByName() with a name that's shared by both a and a measure
    testcases.performancetimeline['getEntriesByName(name)'] = function(test) {
        usertiming.mark('1');
        usertiming.measure('1');

        var entries = usertiming.getEntriesByName('1');
        test.equal(2, entries.length);
        test.equal('1', entries[0].name);
        test.equal('1', entries[1].name);

        test.done();
    };

    // getEntriesByName() with a name and type that's shared by both a and a measure
    testcases.performancetimeline['getEntriesByName(name, type)'] = function(test) {
        usertiming.mark('1');
        usertiming.measure('1');

        var entries = usertiming.getEntriesByName('1', 'mark');
        test.equal(1, entries.length);
        test.equal('1', entries[0].name);

        test.done();
    };

    // getEntriesByType() of a undefined type should just return an empty array
    testcases.performancetimeline['getEntriesByType() of a bad type'] = function(test) {
        // ensure the source array wasn't modified
        test.equal(0, usertiming.getEntriesByType('BAD_TYPE!!!').length);

        test.done();
    };

    // measures can be inserted out of order, because they're sorted by startTime which can be
    // specified as part of the measure
    testcases.performancetimeline['getEntries() out of order measures'] = function(test) {
        usertiming.mark('1');

        // startTime will be 'now', i.e. non-0
        usertiming.measure('1', '1');

        // measure from navStart, which will be startTime=0
        usertiming.measure('0');

        var entries = usertiming.getEntriesByType('measure');
        test.equal(0, entries[0].startTime);
        test.equal('0', entries[0].name);
        test.equal('1', entries[1].name);

        test.done();
    };
})(exports);