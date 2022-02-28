require("./db");
const express = require("express");
const { port } = require("./config");
const { kittenRouter } = require("./router");
const app = express();

app.use("/api/v1/kittens", kittenRouter);

app.listen(port, () => {
  console.log("service started on port: ", port);
});
