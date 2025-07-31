const connectToMongo = require('./db');
const express = require('express')
const app = express()
const PORT = process.env.PORT || 5555;
const dotenv = require("dotenv");
const cors = require("cors")
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.options("*", cors());
app.use(express.static("public"));

`app.set('views engine', 'ejs');`
// const passport = require('passport')
// const FacebookStrategy =  require('passport-facebook').Strategy
// const session = require('express-session')
// const cookieParser = require('cookie-parser')
// const bodyParser = require('body-parser')

dotenv.config();
connectToMongo();


// const port = 5000

app.use(express.json())
app.use
// Available Routes
app.use('/api/auth',require('./routes/auth'));
app.use('/api',require('./routes/upload'))
// app.use('/api/notes',require('./routes/notes'))



app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`)
})

