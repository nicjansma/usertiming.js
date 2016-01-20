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

    describe("measure()", function() {
        beforeEach(function() {
            usertiming.clearMarks();
            usertiming.clearMeasures();
        });

        it("should work even when there are no existing marks", function() {
            usertiming.measure("foo");

            var entries = usertiming.getEntriesByType("measure");

            expect(entries.length).to.equal(1);
            expect(entries[0].name).to.equal("foo");
            expect(entries[0].startTime).to.equal(0);
        });

        it("should work when given a start mark as an argument", function() {
            usertiming.mark("1");

            usertiming.measure("1", "1");

            var entries = usertiming.getEntriesByType("measure");

            expect(entries.length).to.equal(1);
            expect(entries[0].name).to.equal("1");
            expect(entries[0].startTime).to.be.above("0");
            expect(entries[0].duration >= 0).to.be.ok();
        });

        it("should work when given a start and end mark", function() {
            usertiming.mark("1");
            usertiming.mark("2");

            usertiming.measure("1", "1", "2");

            var entries = usertiming.getEntriesByType("measure");

            expect(entries.length).to.equal(1);
            expect(entries[0].name).to.equal("1");
            expect(entries[0].startTime).to.be.above("0");
            expect(entries[0].duration >= 0).to.be.ok();

            // likely didn"t take 10 seconds
            expect(entries[0].duration < 10000).to.be.ok();
        });

        it("should throw an error if not given a name", function() {
            expect(usertiming.measure).to.throwException();
        });

        it("should throw an error if not given a name", function() {
            expect(usertiming.measure).to.throwException();
        });

        it("should throw an exception if the start mark name is not found", function() {
            expect(function() {
                usertiming.measure("foo", "BAD_MARK!");
            }).to.throwException(function(e) {
              expect(e).to.be.a(Error);
            });
        });

        it("should throw an exception if the end mark name is not found", function() {
            usertiming.mark("1");
            expect(function() {
                usertiming.measure("foo", "1", "BAD_MARK!");
            }).to.throwException(function(e) {
              expect(e).to.be.a(Error);
            });
        });
    });

    describe("clearMeasures()", function() {
        beforeEach(function() {
            usertiming.clearMarks();
            usertiming.clearMeasures();
        });

        it("should work when no measures had already been logged", function() {
            expect(usertiming.getEntriesByType("measure").length).to.equal(0);
            usertiming.clearMeasures();
            expect(0, usertiming.getEntriesByType("measure").length).to.equal(0);
        });

        it("should work when a single measure had already been logged", function() {
            usertiming.measure("foo");
            expect(usertiming.getEntriesByType("measure").length).to.equal(1);

            usertiming.clearMeasures();
            expect(0, usertiming.getEntriesByType("measure").length).to.equal(0);
        });

        it("should clear measures of the specified name", function() {
            usertiming.measure("foo1");
            usertiming.measure("foo2");
            expect(usertiming.getEntriesByType("measure").length).to.equal(2);

            // clear, shouldn"t have removed foo2
            usertiming.clearMeasures("foo1");
            expect(usertiming.getEntriesByType("measure").length).to.equal(1);

            usertiming.clearMeasures("foo2");

            // foo2 should now be removed
            expect(usertiming.getEntriesByType("measure").length).to.equal(0);
        });

        it("should work OK if there are no marks of that name", function() {
            usertiming.measure("foo1");
            expect(usertiming.getEntriesByType("measure").length).to.equal(1);
            usertiming.clearMeasures("foo2");
            expect(usertiming.getEntriesByType("measure").length).to.equal(1);
        });
    });
}(typeof window !== "undefined" ? window : undefined));
