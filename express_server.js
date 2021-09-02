const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


// Sample Database and User data
const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://google.com'
};

const users = {
  "u0001": {
    id: "u0001",
    email: "jan@hotmail.com",
    password: "purple-monkey-dinosaur"
  },
  "u0002": {
    id: "u0002",
    email: "lendl@mail.com",
    password: "myPasswordisStrong"
  }
};


// Random variables
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

// lookup user
const emailLookup = (email) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_login', templateVars);
});

// Route to register page
app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_register', templateVars);
});

// Register POST
app.post('/register', (req, res) => {
  const id = 'u' + Math.floor(Math.random() * 1000) + 1;
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(400).send('Email or password cannot be blank');
  }
  
  const user = emailLookup(email);

  if (user) {
    return res.status(400).send('Email already exists');
  }
  
  users[id] = { id, email, password };
  res.cookie('user_id', id);
  res.redirect('/urls');
});


// main tinyApp
app.get('/urls', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase };
  res.render('urls_index', templateVars);
});


// create new shortURL
app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_new', templateVars);
});


// generates shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`urls/${shortURL}`);
});


// shows the url details
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  if (!urlDatabase[req.params.shortURL]) {
    return res.send('Error! Please check the shortened URL');
  }
  res.render('urls_show', templateVars);
});


// single shortURL view
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!urlDatabase[req.params.shortURL]) {
    return res.send('Error! Please check the shortened URL');
  }
  res.redirect(longURL);
});

// DELETE feature
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// EDIT longURL feature
app.post('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});


// Login and Logout route
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(403).send('Email or password cannot be blank');
  }
  
  const user = emailLookup(email);

  if (!user) {
    return res.status(403).send('Account doesn\'t exists');
  }
  if (user.password !== password) {
    return res.status(403).send('Invalid Password!');
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id', req.body.id);
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`TinyURL app listening on port ${PORT}`);
});