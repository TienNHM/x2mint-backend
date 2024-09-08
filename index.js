const express = require("express");
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger-output.json')
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
const adminRoute = require("./src/routers/adminRoutes");
const paymentRoute = require("./src/routers/paymentRoutes")
const billRoute = require("./src/routers/billRoutes")
const fileUpload = require('express-fileupload')

//Config env
dotenv.config({ path: "./.env" });

//Config CORS
const cors = require("cors");


var whitelist = [
  'https://api-x2mint.herokuapp.com',
  'https://x2mint.vercel.app', 
  'https://ex2mint.vercel.app', 
  'http://localhost:3000',
  'https://sandbox.vnpayment.vn'
]

var corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
    // if (whitelist.indexOf(origin) !== -1) {
    //   callback(null, true)
    // }
    // else {
    //   callback(new Error('Not allowed by CORS'))
    // }
  }
}

app.options('*', cors())
app.use(cors());
app.use(cors(corsOptions));
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true
}))

//Base url: no slash at the end
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
        console.log("Mongoose connected ");
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
app.use(`${api}/statistics`, adminRoute);
app.use(`${api}/payments`, paymentRoute);
app.use(`${api}/bills`, billRoute);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

const htmlData = `<p>Hello, X2MINT API. View API documentation <a href="/doc">here</a></p>`;
app.get("/", (req, res) => res.type("text/html").send(htmlData));

app.listen(process.env.PORT || 5005, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});