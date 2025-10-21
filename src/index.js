// 1. Import framework Express
const express = require('express');

// 2. Khởi tạo app Express
const app = express();
const port = 3000; // Cổng mà server sẽ lắng nghe

const admin = require("firebase-admin");
const credential = require("./config/service_key.json");
admin.initializeApp({
  credential: admin.credential.cert(credential),
});

app.post('/signup', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
    admin.auth().createUser({
        email: email,
        password: password
    })
    .then((userRecord) => {
        res.status(201).send(`Successfully created new user: ${userRecord.uid}`);
    })
    .catch((error) => {
        res.status(400).send(`Error creating new user: ${error}`);
    });
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 4. Lắng nghe các yêu cầu trên cổng đã định nghĩa
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});