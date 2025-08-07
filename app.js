const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Poor session handling (no secure flags or proper session expiration)
app.use(session({
  secret: 'insecureSecret',
  resave: false,
  saveUninitialized: true
}));

// Middleware to set user in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Home page - list all posts
app.get('/', (req, res) => {
  db.all(`SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id`, [], (err, posts) => {
    if (err) return res.send(err.message); // Error leakage
    res.render('index', { posts });
  });
});

// Registration
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run(`INSERT INTO users (username, password) VALUES ('${username}', '${password}')`, function(err) {
    if (err) return res.send(err.message); // SQL Injection possible
    res.redirect('/login');
  });
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, (err, user) => {
    if (err) return res.send(err.message);
    if (user) {
      req.session.user = user;
      res.redirect('/');
    } else {
      res.send("Invalid credentials"); // Reflected XSS possible
    }
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Create new post
app.get('/new', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('newpost');
});

app.post('/new', (req, res) => {
  const { title, content } = req.body;
  const userId = req.session.user.id;
  db.run(`INSERT INTO posts (user_id, title, content) VALUES (${userId}, '${title}', '${content}')`, (err) => {
    if (err) return res.send(err.message);
    res.redirect('/');
  });
});

// View post and comments
app.get('/post/:id', (req, res) => {
  const postId = req.params.id;
  db.get(`SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ${postId}`, (err, post) => {
    if (err) return res.send(err.message);
    db.all(`SELECT * FROM comments WHERE post_id = ${postId}`, [], (err2, comments) => {
      if (err2) return res.send(err2.message);
      res.render('viewpost', { post, comments });
    });
  });
});

// Comment on post
app.post('/post/:id/comment', (req, res) => {
  const postId = req.params.id;
  const { comment } = req.body;
  const username = req.session.user?.username || 'Anonymous';
  db.run(`INSERT INTO comments (post_id, username, comment) VALUES (${postId}, '${username}', '${comment}')`, (err) => {
    if (err) return res.send(err.message);
    res.redirect(`/post/${postId}`);
  });
});

// Edit post (no ownership check – IDOR)
app.get('/edit/:id', (req, res) => {
  db.get(`SELECT * FROM posts WHERE id = ${req.params.id}`, (err, post) => {
    if (err) return res.send(err.message);
    res.render('editpost', { post });
  });
});

app.post('/edit/:id', (req, res) => {
  const { title, content } = req.body;
  db.run(`UPDATE posts SET title = '${title}', content = '${content}' WHERE id = ${req.params.id}`, (err) => {
    if (err) return res.send(err.message);
    res.redirect('/');
  });
});

// Delete post (no ownership check – IDOR)
app.get('/delete/:id', (req, res) => {
  db.run(`DELETE FROM posts WHERE id = ${req.params.id}`, (err) => {
    if (err) return res.send(err.message);
    res.redirect('/');
  });
});

// Start server
app.listen(3000, () => {
  console.log('InsecureBlogApp running at http://localhost:3000');
});
