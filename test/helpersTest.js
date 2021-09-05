const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


const testDatabase = {  
  'randomShort': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  'randomShort2': { longURL: 'http://google.com', userID: 'user2RandomID' }

};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user2@example.com", testUsers);
    const expectedOutput = testUsers["user2RandomID"];
    assert.deepEqual(user, expectedOutput);
  });

  it('should return null with an invalid email address', () => {
    const user = getUserByEmail("none@example.com", testUsers);
    const expectedOutput = null;
    assert.deepEqual(user, expectedOutput);
  });
});



describe('urlsForUser', () => {
  it('should return the URL\'s associated to the user', () => {
    const user = urlsForUser("userRandomID", testDatabase);
    const expectedOutput = {'randomShort': { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' }};
    assert.deepEqual(user, expectedOutput);
  });

  it('should return { blank object } if user do not have any assigned URL', () => {
    const user = urlsForUser("NoURLAssigned", testDatabase);
    const expectedOutput = { };
    assert.deepEqual(user, expectedOutput);
  });
});