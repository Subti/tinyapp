const { assert } = require("chai");

const { getUserByEmail } = require("../helpers");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function () {
  it(`should return a user with valid email`, function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(testUsers[user].id, expectedUserID);
  });
  it(`should return undefined if the email does not exist`, function () {
    const user = getUserByEmail("notuser@example.com", testUsers);
    assert.equal(user, undefined);
  });
});
