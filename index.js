const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const md5 = require('md5');
const carValidator = require('./validators/cars');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);

passport.use(new LocalStrategy((username, password, done) => {
  const user = db.get('users').find({username}).value();
  console.log(user);

  if (!user || user.password !== password) {
    return done(null, false);
  }
  return done(null, user);

}))

app.use(bodyParser.json())

const {NODE_ENV, PORT, SECRET} = process.env;

const apiRoutes = express.Router();

const authUser = (req, res, next) => {
  const token = req.headers['x-token'];
  const session = db.get('sessions').find({token}).value();

  if (!session) {
    return res.sendStatus(401);
  }

  next()
}

apiRoutes.get('/hc', (req,res) => {
  res.json({
    status: 'OK',
  })
});

apiRoutes.post('/login', passport.authenticate('local', {session: false}), (req, res) => {
  const token = md5(`${SECRET} ${Math.random()}`);

  db.get('sessions').push({username: req.body.username, token}).write();

  res.status(200).json(token);
})

apiRoutes.get('/cars', (req,res) => {
  const cars = db.get('cars');
  res.json(cars);
});

apiRoutes.post('/cars', authUser, carValidator, (req,res) => {
  const car = {
    id: uuid.v4(),
    title: req.body.title,
    number: req.body.number,
    model: req.body.model,
  };

  db.get('cars').push(car).write();
  res.status(201).json(car);
});

apiRoutes.put('/cars/:id', (req,res) => {
  const {id} = req.params;
  const newCar = {
    title: req.body.title,
    number: req.body.number,
    model: req.body.model,
  };

  const car = db.get('cars').find({id}).assign(newCar).write();
  
  if (!car) {
    res.status(404).json({message: 'Car not found'});
  }

  res.json(car)
});

apiRoutes.delete('/cars/:id', (req,res) => {
  const {id} = req.params;

  const car = db.get('cars').find({id}).value();

  if (!car) {
    res.status(404).json({message: 'Car not found'});
  }

  db.get('cars').remove({id}).write();

  res.json(204);
});

apiRoutes.get('/cars/:id', (req,res) => {
  const {id} = req.params;
  const car = db.get('cars').find({id}).value()
  
  if (!car) {
    res.json(404, {message: 'Car not found'});
  }

  res.json(car);
});

app.use('/api/v1', apiRoutes);
app.listen(PORT, () => {
  console.log(`Taxi app is listening on port ${PORT}`)
})