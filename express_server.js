const express = require("express");
const app = express();

const PORT = 8080; // default port 8080

const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

//Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//-----------------------------------------------------------
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


app.get("/register", (req,res) => {
  res.render("user_registration");
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const userId = generateRandomString(); // generate random user ID

  // Create new user object and add to global users object
  const newUser = {
    id: userId,
    email,
    password
  };
  users[userId] = newUser;

  // Set user_id cookie with newly generated ID
  res.cookie('user_id', userId);

  // Redirect to /urls page
  res.redirect('/urls');

  // Debugging log to inspect users object
  console.log(users);
});
//----------------------------------------------------------


app.get("/urls", (req,res) => {
  const userId = req.cookies["user_id"];
  let userObj = null;
  for (let user of Object.values(users)) {
    if (user.id === userId) {
      userObj = user;
    }
  }
  console.log("75" ,userObj);
  const templeVars = {urls: urlDatabase, user: userObj};
  res.render("urls_index", templeVars);
});

app.get('/urls/new', (req, res) => {
  // const templateVars = {
  //   username: req.cookies['username']
  // };
  const userId = req.cookies["user_id"];
  let userObj = null;
  for (let user of Object.values(users)) {
    if (user.id === userId) {
      userObj = user;
    }
  }
  console.log("75" ,userObj);
  const templateVars = {urls: urlDatabase, user: userObj};
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req,res) => {
  const templeVars = {id: req.params.id, longURL: urlDatabase[req.params.id] ,username: req.cookies['username']};
  res.render("urls_show", templeVars);
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  const { username } = req.body;
  res.clearCookie('username', username);
  res.redirect('/urls');
});



app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  // Update the stored long URL based on the new value in req.body
  urlDatabase[id] = longURL;
  res.redirect('/urls');
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:id/delete", (req,res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
  // console.log(req.body); // Log the POST request body to the console
  // res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



let generateRandomString = () => {
  const length = 6;
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
};

generateRandomString();