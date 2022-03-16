const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const { Schema } = mongoose;
const app = express();
const port = 4000;

// DB 연동
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log('DB connected'))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
