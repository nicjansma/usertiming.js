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

    describe("now()", function() {
        it("should return a number greater than zero", function() {
            expect(usertiming.now()).to.be.above(0);
        });

        it("should return sequential numbers", function() {
            var time1 = usertiming.now();
            var time2 = usertiming.now();
            expect(time2 >= time1).to.be.ok();
        });

        it("should be offset by navigationStart, not in Unix epoch format", function() {
            // now() shouldn"t be over 1000000000000, because the test would be running for >40 years
            // to get to that point
            expect(usertiming.now()).to.be.below(1000000000000);
        });
    });
}(typeof window !== "undefined" ? window : undefined));
