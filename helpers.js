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

const countUniqueVisitors = function (shortURL, visits, currentUserId) {
  const uniqueVisitors = {};
  visits.forEach((visit) => {
    if (visit.shortURL === shortURL && visit.visitor_id === currentUserId) {
      if (!visits.some((visitor) => visitor.visitor_id === visit.id)) {
        uniqueVisitors[visit.visitor_id] = true;
      }
    }
  });
  return Object.keys(uniqueVisitors).length;
};

const logVisit = function (shortURL, visitor_id, userEmail, visits) {
  const visit = {
    shortURL,
    visitor_id,
    visitor_email: userEmail,
    timestamp: new Date(),
  };
  visits.push(visit);
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
  countUniqueVisitors,
  logVisit,
};
