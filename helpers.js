
// getUserByEmail helper
const getUserByEmail = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};


// lookup URL for a certain user
const urlsForUser = (id, urlDatabase) => {
  let templateVars = { };
  for (const keys in urlDatabase) {
    if (urlDatabase[keys].userID === id) {
      templateVars[keys] = urlDatabase[keys];
    }
  }
  return templateVars;
};

module.exports = {
  getUserByEmail,
  urlsForUser
};