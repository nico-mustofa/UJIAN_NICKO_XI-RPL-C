const express = require('express');
const pool = require('./db');

const app = express();
app.listen(3002, () => { console.log('Coba 2 jalan'); });