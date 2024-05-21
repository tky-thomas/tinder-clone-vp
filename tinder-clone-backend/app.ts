var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var { api_url } = require("./app-config");
var http = require("http");
var cors = require("cors");

var userProfileRecommenderRouter = require("./routes/services/UserProfileRecommender");

const allowed_origin = "http://localhost:3000";
const cors_options = {
  origin: function (origin: string, callback: any) {
    if (origin === allowed_origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // if you want to allow cookies or other credentials
};

var app = express();
app.use(cors(cors_options));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(`${api_url}/recommender`, userProfileRecommenderRouter);

var port = normalizePort(process.env.PORT || "9000");
app.set("port", port);

var server = http.createServer(app);
server.listen(port);
server.on("error", onError);

function normalizePort(val: any) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}
