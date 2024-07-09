const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = require('./firebaseConfig');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('styles'));

// Change PORT here if needed
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.collection('users').doc(email).set({ email, password: hashedPassword });
    res.redirect('/login');
  } catch (error) {
    res.status(500).send('Error signing up, please try again.');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userDoc = await db.collection('users').doc(email).get();
    if (!userDoc.exists) {
      return res.status(400).send('User not found.');
    }
    const user = userDoc.data();
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const response = await axios.get('http://www.omdbapi.com/?s=movie&apikey=3189ff6d');
      const movies = response.data.Search || [];
      res.render('movies', { movies });
    } else {
      res.status(400).send('Invalid password.');
    }
  } catch (error) {
    res.status(500).send('Error logging in, please try again.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
