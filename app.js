// app.js

// set up ======================================================================
const express = require("express");
const exphbs = require("express-handlebars");
const axios = require("axios");
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
const path = require('path');

// configuration ===============================================================
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'/public')));

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

// routes ======================================================================
require('./routes.js')(app);

const port = 3000;
app.listen(port, () => `Server running on port ${port}`);

module.exports = router;
