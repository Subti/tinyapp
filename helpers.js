const generateRandomString = function (database) {
  let rkey = Math.random().toString(36).slice(2, 8);
  while (database[rkey]) {
    rkey = Math.random().toString(36).slice(2, 8);
  }
  return rkey;
};

const getUserByEmail = function (email, database) {
  for (let key in database) {
    if (database[key].email === email) {
      return key;
    }
  }
  return null;
};

const urlsForUser = function (id, database) {
  const urls = {};
  for (key in database) {
    if (database[key].userID === id) {
      urls[key] = database[key].longURL;
    }
  }
  return urls;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
};
