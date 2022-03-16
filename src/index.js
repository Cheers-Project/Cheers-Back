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

// 더미 유저 생성
app.post('/create', async (req, res) => {
  // 스키마
  const userSchema = new Schema({
    userId: String,
    userPw: String,
    nickname: String,
    profileImg: String,
  });

  // 모델
  const User = mongoose.model('User', userSchema);
  const user = new User(req.body);

  const result = await user.save();

  console.log(result);
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
