const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
  let rkey = Math.random().toString(36).slice(2, 8);
  while (urlDatabase[rkey]) {
    rkey = Math.random().toString(36).slice(2, 8);
  }
  return rkey;
}

function userLookUp(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
  return null;
}

app.get("/", (req, res) => {
  return res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  return res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  return res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  return res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    return res.send(
      "You can not shorten URLs without logging into an account first."
    );
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  return res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  return res.redirect(`/urls`);
});

app.post("/urls/:id/update", (req, res) => {
  console.log(req.body);
  urlDatabase[req.params.id] = req.body.urlChange;
  return res.redirect(`/urls`);
});

/*
 *
 *
 * Authentication Handlers
 *
 *
 */

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send("Please enter an email and a password in order to log in.");
  }

  if (!userLookUp(email)) {
    return res.status(403).send("A user with that e-mail can not be found.");
  }

  if (users[userLookUp(email)].password !== password) {
    return res.status(403).send("The password entered is invalid!");
  }

  res.cookie("user_id", users[userLookUp(email)].id);
  return res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  return res.render("login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  return res.redirect("/login");
});

app.get("/register", (req, res) => {
  if (users[req.cookies["user_id"]]) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  return res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .send("Email and password are required to complete registration.");
  }

  if (userLookUp(email)) {
    return res
      .status(400)
      .send("Email already exists. Please use a different email.");
  }

  const id = generateRandomString();
  res.cookie("user_id", id);
  users[id] = {
    id,
    email: req.body.email,
    password: req.body.password,
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
