require('dotenv').config()
const express = require('express');
const routes = require('./routes');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.use((error, req, res, next) => {
    res.status(500).send(error.message);
    console.error(error)
});

app.listen(port, () => {
    console.log(`\x1b[33mWonderQ listening at port \x1b[4m${port}\x1b[0m`);
})
