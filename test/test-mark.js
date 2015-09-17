/* eslint-env node,browser,mocha */
(function(root) {
    "use strict";

    //
    // Run in either Mocha, Karma or Browser environments
    //
    if (typeof root === "undefined") {
        root = {};
    }

    var expect = root.expect ? root.expect : require("expect.js");
    var usertiming = root.performance ? root.performance : require("../src/usertiming");

    describe("mark()", function() {
        beforeEach(function() {
            usertiming.clearMarks();
            usertiming.clearMeasures();
        });

        it("should handle a simple mark", function() {
            usertiming.mark("foo");

            var entries = usertiming.getEntriesByType("mark");

            expect(entries.length).to.equal(1);
            expect(entries[0].name).to.equal("foo");
            expect(entries[0].startTime).to.be.above(0);
        });

        it("should throw an exception when a null argument is given", function() {
            expect(usertiming.mark).to.throwException();
        });

        it("should throw an exception when passing in a NavigationTiming mark", function() {
            // NOTE we can only test this if NT exists
            if (typeof window !== "undefined" &&
                typeof window.performance !== "undefined" &&
                typeof window.performance.timing !== "undefined" &&
                window.performance.timing.navigationStart) {
                expect(function() {
                    usertiming.mark("navigationStart");
                }).to.throwException();
            }
        });

        // create a bunch of marks, then ensure all of the marks's times are
        // greater than or equal to the last mark (i.e. in chronological order)
        it("should mark timestamps that incremenet (or equal) each previous mark", function() {
            for (var i = 0; i < 100; i++) {
                usertiming.mark("foo");
            }

            // make sure we have the same amount of marks
            var marks = usertiming.getEntriesByType("mark");
            expect(marks.length).to.equal(100);

            // ensure chronological order
            var lastTime = 0;
            for (i = 0; i < marks.length; i++) {
                expect(marks[i].startTime).to.be.above(0);
                expect(marks[i].startTime >= lastTime).to.be.ok();
                lastTime = marks[i].startTime;
            }
        });
    });

    describe("clearMarks()", function() {
        beforeEach(function() {
            usertiming.clearMarks();
            usertiming.clearMeasures();
        });

        it("should work for a single mark when called without arguments", function() {
            usertiming.mark("foo");
            expect(usertiming.getEntriesByType("mark").length).to.equal(1);

            usertiming.clearMarks();
            expect(usertiming.getEntriesByType("mark").length).to.equal(0);
        });

        it("should work OK before any marks are called", function() {
            expect(usertiming.getEntriesByType("mark").length).to.equal(0);
            usertiming.clearMarks();
            expect(usertiming.getEntriesByType("mark").length).to.equal(0);
        });

        it("should work OK if there are no marks of that name", function() {
            usertiming.mark("1");
            expect(usertiming.getEntriesByType("mark").length).to.equal(1);
            usertiming.clearMarks("2");
            expect(usertiming.getEntriesByType("mark").length).to.equal(1);
        });

        it("should clear marks of a specified name", function() {
            usertiming.mark("foo1");
            usertiming.mark("foo2");
            expect(usertiming.getEntriesByType("mark").length).to.equal(2);

            // clear, shouldn't have removed foo2
            usertiming.clearMarks("foo1");
            expect(usertiming.getEntriesByType("mark").length).to.equal(1);

            usertiming.clearMarks("foo2");

            // foo2 should now be removed
            expect(usertiming.getEntriesByType("mark").length).to.equal(0);
        });

        it("should only remove marks, not measures", function() {
            usertiming.mark("foo");
            expect(usertiming.getEntriesByType("mark").length).to.equal(1);

            // measure something
            usertiming.measure("foo");
            usertiming.measure("foo");

            // clear
            usertiming.clearMarks();
            expect(usertiming.getEntriesByType("mark").length).to.equal(0);
            expect(usertiming.getEntriesByType("measure").length).to.equal(2);

        });
    });
}(typeof window !== "undefined" ? window : undefined));
