const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const users = [];
const exercises = [];
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const newUser = {
    username,
    _id: '_' + Math.random().toString(36).substring(2, 9)
  };
  users.push(newUser);
  res.json(newUser);
});
app.get('/api/users', (req, res) => {
  res.json(users);
});
app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id;
  const { description, duration, date } = req.body;
  const user = users.find(user => user._id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const exerciseDate = date ? new Date(date) : new Date();
  const exercise = {
    description,
    duration: Number(duration),
    date: exerciseDate.toDateString()
  };
  exercises.push({
    _id: id,
    ...exercise
  });
  const responseObj = {
    _id: id,
    username: user.username,
    ...exercise
  };
  res.json(responseObj);
});
app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  const { from, to, limit } = req.query;
  const user = users.find(user => user._id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  let userExercises = exercises.filter(exercise => exercise._id === id);
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(exercise => new Date(exercise.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(exercise => new Date(exercise.date) <= toDate);
  }
  if (limit && !isNaN(parseInt(limit))) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }
  const log = userExercises.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date
  }));
  const responseObj = {
    _id: id,
    username: user.username,
    count: log.length,
    log
  };
  res.json(responseObj);
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
