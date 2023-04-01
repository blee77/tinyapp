const express = require("express");
const app = express();

const PORT = 8080; // default port 8080

const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const { getUserByEmail, generateRandomString } = require('./helper');
//Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['abcdefghijkl123'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(express.urlencoded({ extended: true }));
//view engine
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

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


app.get("/", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


app.get('/login', (req, res) => {

  res.render('login', { user: null });
});


app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
  }
  const templateVars = { user: false };
  res.render("user_registration", templateVars);

});

const urlsForUser = function (id) {
  let filteredUrls = {};
  for (let shortId in urlDatabase) {
    if (urlDatabase[shortId].userID === id) {
      filteredUrls[shortId] = urlDatabase[shortId];
    }
  }
  return filteredUrls;
};

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send('Please log in or register first.');
    return;
  }
  const userUrls = urlsForUser(userId);
  const templateVars = { urls: userUrls, user: users[userId] };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  const templateVars = { user: users[userId] };

  if (!userId) {
    res.redirect("/login");
  } else {
    // render the new URL form
    res.render('urls_new', templateVars);
  }
});



app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  //this is an object no longer a string so must change to an objext const urlObj = urlDatabase[shortURL]; 
  const longURL = urlDatabase[shortURL];
  if (!longURL) {
    res.status(404).send("This short URL does not exist.");
  } else {
    // redirect to the long URL
    res.redirect(longURL.longURL);
  }
});


// GET /urls/:id- if user is not logged in or the user is not the owner of the URL, 
// it should return HTML with a relevant error message. Currently user who do not own
//  the URL or are not logged in can access this page which is a security issue.


app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[userId]
  };

  if (!userId) {
    res.redirect("/login");
    return res.status(401).send("user is not the owner of the URL");

  } else {
    // render the new URL form
    res.render('urls_new', templateVars);
  }

  // res.render("urls_show", templateVars);
});


// Define the login handler
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Look up the user by email
  const existingUser = getUserByEmail(email, users);

  // If user not found, send 403 response
  if (!existingUser) {
    res.status(403).send('Invalid User.');
    return;
  }

  req.session.userId = existingUser.id;

  const isPasswordMatch = bcrypt.compareSync(password, existingUser.password);
  if (!isPasswordMatch) {
    return res.status(401).send("Invalid credentials");
  }
  // Redirect to /urls
  res.redirect('/urls');
});


app.post('/register', (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10); // hash the password

  if (!email || !password) {
    return res.status(400).send('Email and password are required');
  }

  const existingUser = getUserByEmail(email, users);

  if (existingUser) {
    return res.status(400).send('Email already registered');
  }

  const userId = generateRandomString(); // generate random user ID

  users[userId] = {
    id: userId,
    email,
    password: hashedPassword
  };
  console.log(users);

  // Set user_id cookie with newly generated ID
  req.session.userId = userId;
  return res.redirect("/urls");

});


// Define the logout handler
app.post('/logout', (req, res) => {
  // Clear the user_id cookie
  req.session = null;

  // Redirect to /login
  res.redirect('/login');
});


app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  // Update the stored long URL based on the new value in req.body
  urlDatabase[id].longURL = longURL;
  res.redirect('/urls');
});




app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).send('Please log in or register first.');
    return;
  }
  const url = urlDatabase[req.params.id];
  if (!url) {
    res.status(404).send('URL not found.');
    return;
  }
  if (url.userID !== userId) {
    res.status(403).send('You do not have permission to delete this URL.');
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.post("/urls", (req, res) => {
  if (!req.session.userId) {
    res.status(401).send("You must be logged in to shorten URLs.");
  } else {
    // add the URL to the database and redirect to the URLs index page
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = {
      longURL,
      userID: req.session.userId
    };
    res.redirect(`/urls/${shortURL}`);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




