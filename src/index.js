const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

// user dummy
const user = {
  userId: 'jungjin',
  userPw: '1234',
};

// 로그인 연결 테스트
app.post('/login', (req, res) => {
  const body = req.body;
  res.send(user);
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
