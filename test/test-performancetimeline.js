/*eslint-env node,browser,mocha*/
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

    describe("PerformanceTimeline", function() {
        beforeEach(function() {
            usertiming.clearMarks();
            usertiming.clearMeasures();
        });

        describe("getEntries()", function() {
            it("should work when called without arguments and nothing had been called before it", function() {
                var entries = usertiming.getEntries();

                // can't guarantee there aren't other entries from the PT if the PT is natively supported
                expect(entries.length >= 0).to.be.ok();
            });

            it("should work when called without arguments and at least one mark had been logged", function() {
                usertiming.mark("1");

                var entries = usertiming.getEntries();

                // can't guarantee there aren't other entries from the PT if the PT is natively supported
                expect(entries.length).to.be.above(0);
            });

            it("should sort entries", function() {
                // measures can be inserted out of order, because they're sorted by startTime which can be
                // specified as part of the measure
                usertiming.mark("1");

                // startTime will be "now", i.e. non-0
                usertiming.measure("1", "1");

                // measure from navStart, which will be startTime=0
                usertiming.measure("0");

                var entries = usertiming.getEntriesByType("measure");
                expect(entries).to.be.an("array");
                expect(entries[0].startTime).to.equal(0);
                expect(entries[0].name).to.equal("0");
                expect(entries[1].name).to.equal("1");
            });
        });

        describe("getEntriesByType()", function() {
            it("should work when nothing has been logged", function() {
                var entries = usertiming.getEntriesByType("mark");
                expect(entries.length).to.equal(0);
            });

            it("should work with marks", function() {
                usertiming.mark("mark1");
                usertiming.measure("measure1");

                var entries = usertiming.getEntriesByType("mark");
                expect(entries.length).to.equal(1);
                expect(entries[0].name).to.equal("mark1");
                expect(entries[0].startTime).to.be.above(0);
            });

            it("should work with marks when none had been logged", function() {
                usertiming.measure("measure1");

                var entries = usertiming.getEntriesByType("mark");
                expect(entries.length).to.equal(0);
            });

            it("should work with measures", function() {
                usertiming.mark("mark1");
                usertiming.measure("measure1");

                var entries = usertiming.getEntriesByType("measure");
                expect(entries.length).to.equal(1);
                expect(entries[0].name).to.equal("measure1");
                expect(entries[0].startTime >= 0).to.be.ok();
            });

            it("should work with measures when none had been logged", function() {
                usertiming.mark("mark1");

                var entries = usertiming.getEntriesByType("measure");
                expect(entries.length).to.equal(0);
            });

            it("should return an empty array if given a bad type", function() {
                // ensure the source array wasn"t modified
                var entries = usertiming.getEntriesByType("BAD_TYPE!!!");
                expect(entries).to.be.an("array");
                expect(entries.length).to.equal(0);
            });
        });

        describe("getEntriesByName()", function() {
            it("should work when nothing has been logged", function() {
                var entries = usertiming.getEntriesByName("mark");
                expect(entries.length).to.equal(0);
            });

            it("should work when a mark and measure share the same name", function() {
                usertiming.mark("1");
                usertiming.measure("1");

                var entries = usertiming.getEntriesByName("1");
                expect(entries.length).to.equal(2);
                expect(entries[0].name).to.equal("1");
                expect(entries[1].name).to.equal("1");
            });
        });
    });
}(typeof window !== "undefined" ? window : undefined));
