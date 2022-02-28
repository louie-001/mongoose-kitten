const mongoose = require("mongoose");
const { host, port, dataBase, user, pass } = require("../config").dbConfig;

const connection = mongoose.connection;
const uri = `mongodb://${host}:${port}`;
const options = {
  dbName: dataBase,
  user,
  pass,
  autoIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

mongoose.connect(uri, options);

connection.on("connecting", () => {
  console.log("database connecting ...");
});

connection.on("connected", () => {
  console.log("database connected !");
});

connection.on("error", (error) => {
  console.error(error);
});

connection.on("close", () => {
  console.log("database closed !");
});

const close = () => {
  console.log("database connection closing ...");
  if (connection) {
    connection.close();
  }
};

process.on("exit", close);
