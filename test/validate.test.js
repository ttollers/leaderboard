"use strict";

const assert = require("chai").assert;
const validate = require("../src/validate").sync;
const { assoc } = require("ramda");


describe("Validate", () => {

  const baseObject = {
    id: "abc_1",
    score: 10,
    foo: "bar"
  };
  const updateScore = score => assoc("score", score, baseObject);
  const updateId = id => assoc("id", id, baseObject);

  it("should validate a basic leaderboard object", () => {
    const actual = validate(baseObject);
    assert.isNull(actual.error);
    assert.deepEqual(actual.value, baseObject);
  });

  it("should allow string integers", () => {
    const actual = validate(updateScore("10"));
    assert.isNull(actual.error);
    // score is coerced to integer
    assert.deepEqual(actual.value, baseObject);
  });

  it("should fail if score is not an integer", () => {
    const actual = validate(updateScore("10.1"));
    assert.equal(actual.error.details[0].message, "\"score\" must be an integer");
  });

  it("should fail if id is not string", () => {
    const actual = validate(updateId({}));
    assert.equal(actual.error.details[0].message, "\"id\" must be a string");
  });

});
