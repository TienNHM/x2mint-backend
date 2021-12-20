const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = express();
const authRoute = require("./src/routers/authRoutes");
const questionRoute = require("./src/routers/questionRoutes");
const answerRoute = require("./src/routers/answerRoutes");
const userRoute = require("./src/routers/userRoutes");
const testRoute = require("./src/routers/testRoutes");
const contestRoute = require("./src/routers/contestRoutes");
const takeTestRoute = require("./src/routers/takeTestRoutes");

//Config env
dotenv.config({ path: "./.env" });

//Config CORS
const cors = require("cors");

var whitelist = ['https://x2mint.vercel.app', 'http://localhost:3000', 'https://mail.google.com']
var corsOptions = {
  origin: function (origin, callback) {
    //TODO: remove 2nd condition when deploy prodution
    // if (whitelist.indexOf(origin) !== -1 
    //   || origin.includes(process.env.DOMAIN)) {
    //   callback(null, true)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    }
    else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

app.options('*', cors())
app.use(cors());
app.use(cors(corsOptions));
app.use(express.json());

//Base url: no slash at the end
//const api = process.env.API_URL;
const api = "/app/api/v1";
//Connect DB
const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log(" Mongoose connected ");
      });
  } catch (error) {
    console.log("Connect Error :", error.message);
    process.exit(1);
  }
};

connectDB();

/* ---------------------------------- Route --------------------------------- */
app.use(`${api}/auths`, authRoute);
app.use(`${api}/questions`, questionRoute);
app.use(`${api}/answers`, answerRoute);
app.use(`${api}/users`, userRoute);
app.use(`${api}/tests`, testRoute);
app.use(`${api}/contests`, contestRoute);
app.use(`${api}/takeTest`, takeTestRoute);

app.get("/", (req, res) => res.send("X2MINT API"));

app.listen(process.env.PORT || 5001, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});