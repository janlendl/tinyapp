const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


// Sample Database and User data
const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'u0001' },
  '9sm5xK': { longURL: 'http://google.com', userID: 'u0002' }
};

const users = {
  "u0001": {
    id: "u0001",
    email: "jan@hotmail.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "u0002": {
    id: "u0002",
    email: "lendl@mail.com",
    password: bcrypt.hashSync("myPasswordisStrong", 10)
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


// lookup URL for a certain user
const urlsForUser = (id) => {
  let templateVars = { };
  for (const keys in urlDatabase) {
    if (urlDatabase[keys].userID === id) {
      templateVars[keys] = urlDatabase[keys];
    }
  }
  return templateVars;
};

// Login Page
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
  const password = bcrypt.hashSync(req.body.password, 10);
  
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
    urls: urlsForUser(req.cookies['user_id'])
  };

  //check if user is logged in first
  if (!templateVars.user) {
    return res.send('You are not logged in. Please login or register');
  }
  res.render('urls_index', templateVars);
});


// create new shortURL
app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});


// generates shortURL
app.post('/urls', (req, res) => {
  const urlID = generateRandomString(),
    longURL = req.body.longURL,
    userID = req.cookies['user_id'];

  urlDatabase[urlID] = { longURL, userID };

  res.redirect(`urls/${urlID}`);
});


// shows the url details
app.get('/urls/:urlID', (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
    urlID: req.params.urlID,
    longURL: urlDatabase[req.params.urlID].longURL
  };

  if (!templateVars.user) {
    return res.status(400).send('You are not logged in. Please login or register');
  }
  if (req.cookies['user_id'] !== urlDatabase[req.params.urlID].userID) {
    return res.status(403).send('You are not authorized to view the shortened URL');
  }
  if (!urlDatabase[req.params.urlID]) {
    return res.send('Error! Please check the shortened URL');
  }
  res.render('urls_show', templateVars);
});


// Redirect to long URL
app.get('/u/:urlID', (req, res) => {
  const longURL = urlDatabase[req.params.urlID].longURL;
  if (!urlDatabase[req.params.urlID]) {
    return res.send('Error! Please check the shortened URL');
  }
  res.redirect(longURL);
});

// DELETE feature
app.post('/urls/:urlID/delete', (req, res) => {
  if(req.cookies['user_id'] !== urlDatabase[req.params.urlID].userID) {
    res.status(403).send('You are not authorized to update the URL!');
  }
  delete urlDatabase[req.params.urlID];
  res.redirect('/urls');
});

// EDIT longURL feature
app.post('/urls/:urlID/update', (req, res) => {
  if(req.cookies['user_id'] !== urlDatabase[req.params.urlID].userID) {
    res.status(403).send('You are not authorized to update the URL!');
  }
  urlDatabase[req.params.urlID].longURL = req.body.longURL;
  res.redirect('/urls');
});


// Login and Logout route
app.post('/login', (req, res) => {
  const email = req.body.email,
    password = req.body.password;
  
  if (!email || !password) {
    return res.status(403).send('Email or password cannot be blank');
  }
  
  const user = emailLookup(email);

  if (!user) {
    return res.status(403).send('Account doesn\'t exists');
  }
  // if (user.password !== password) {
  if (!bcrypt.compareSync(password,user.password)) {
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