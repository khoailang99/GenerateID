const express = require('express');
const app = express();
const port = 3000;

const mongoose = require('mongoose');
const db = mongoose.connection;
mongoose.connect('mongodb://localhost/generate_id', {useNewUrlParser: true, useUnifiedTopology: true});
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Da ket noi")
});

var controller = require('./controllers/id.controller');

app.use(express.static('public'));

app.set('views', './views/ejs');
app.set('view engine', 'ejs');

app.get('/', controller.index);

app.get('/create', controller.create);

app.get("/danh-sach-id", controller.listIds);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
