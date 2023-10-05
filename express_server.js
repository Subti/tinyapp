const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  getUserByEmail,
  urlsForUser,
} = require("./helpers");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "hehe",
    keys: [
      "sdhfiaiodshfasifs",
      "lxcfkvoacpvmqwioeudfnmsao",
      "dsafoihisodfhioasfoi",
    ],
  })
);

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
};

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

/*
 *
 *
 * URL GET Requests
 *
 *
 */

app.get("/", (req, res) => {
  return res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send(
      "Please log in to access your urls. <a href='/login'> Log In Here </a>"
    );
  }

  const urls = urlsForUser(req.session.user_id, urlDatabase);

  const templateVars = {
    user: users[req.session.user_id],
    urls,
  };

  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: users[req.session.user_id],
  };
  return res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const urls = urlsForUser(req.session.user_id, urlDatabase);

  if (!urls[req.params.id] || !req.session.user_id) {
    return res
      .status(400)
      .send(
        "You do not have permission to edit this link. <a href='/urls/'> Go Back </a>"
      );
  }

  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  return res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send(
      "The shortened link used does not exist. <a href='/urls'> Go back. </a>"
    );
  }

  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});

/*
 *
 *
 * End of URL GET Requests
 *
 *
 */

// -------------------------------------------------------

/*
 *
 *
 * URL POST Requests
 *
 *
 */

app.post("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.send(
      "You can not shorten URLs without logging into an account first."
    );
  }

  const shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  return res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!users[req.session.user_id]) {
    return res
      .status(403)
      .send("You can not delete URLs without logging into an account first.");
  }

  delete urlDatabase[req.params.id];
  return res.redirect(`/urls`);
});

app.post("/urls/:id/update", (req, res) => {
  if (!users[req.session.user_id]) {
    return res
      .status(403)
      .send("You can not edit URLs without logging into an account first.");
  }

  urlDatabase[req.params.id].longURL = req.body.urlChange;
  return res.redirect(`/urls`);
});

/*
 *
 *
 * End of URL POST Requests
 *
 *
 */

// -------------------------------------------------------

/*
 *
 *
 * Authentication Handlers
 *
 *
 */

app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.user_id],
  };

  return res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.session.user_id],
  };

  return res.render("register", templateVars);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send("Please enter an email and a password in order to log in.");
  }

  if (!getUserByEmail(email, users)) {
    return res.status(403).send("A user with that e-mail can not be found.");
  }

  const currentUser = users[getUserByEmail(email, users)];

  if (!bcrypt.compareSync(password, currentUser.password)) {
    return res.status(403).send("The password entered is invalid!");
  }

  req.session.user_id = users[getUserByEmail(email, users)].id;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send("Email and password are required to complete registration.");
  }

  if (getUserByEmail(email, users)) {
    return res
      .status(400)
      .send("Email already exists. Please use a different email.");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const id = generateRandomString(users);
  req.session.user_id = id;
  users[id] = {
    id,
    email: req.body.email,
    password: hashedPassword,
  };
  return res.redirect("/urls");
});

/*
 *
 *
 * End of Authentication Handlers
 *
 *
 */
