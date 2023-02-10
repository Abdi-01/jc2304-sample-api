const dotenv = require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 2000;
const express = require('express');
const app = express();
const cors = require('cors');
const bearerToken = require('express-bearer-token');

app.use(cors());
app.use(express.json());
app.use(bearerToken());

app.get('/', (req, res) => {
    res.status(200).send('<h1>WELCOME TO API</h1>')
});

// ROUTING
const usersRouter = require('./src/routers/usersRouter');

app.use('/users', usersRouter);

// ERROR-HANDLING
app.use((err, req, res, next) => {
    if (err) {
        return res.status(500).send(err);
    }
})

app.listen(PORT, () => console.log(`Running API ${PORT}`));