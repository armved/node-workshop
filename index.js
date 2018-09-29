const express = require('express');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
const adapter = new FileSync('db.json');
const db = low(adapter);

app.use(bodyParser.json())


const {NODE_ENV, PORT} = process.env;

const apiRoutes = express.Router();

apiRoutes.get('/hc', (req,res) => {
  res.json({
    status: 'OK',
  })
});

apiRoutes.get('/cars', (req,res) => {
  const cars = db.get('cars');
  res.json(cars);
});

apiRoutes.post('/cars', (req,res) => {
  const car = {
    id: uuid.v4(),
    title: req.body.title,
    number: req.body.number,
    model: req.body.model,
  };

  db.get('cars').push(car).write();
  res.json(car);
});

apiRoutes.put('/cars/:id', (req,res) => {
  const {id} = req.params;
  res.json({
    status: 'OK',
  })
});

apiRoutes.delete('/cars/:id', (req,res) => {
  const {id} = req.params;
  res.json({
    status: 'OK',
  })
});

apiRoutes.get('/cars/:id', (req,res) => {
  const {id} = req.params;
  res.json({
    status: 'OK',
  })
});

app.use('/api/v1', apiRoutes);
app.listen(PORT, () => {
  console.log(`Taxi app is listening on port ${PORT}`)
})