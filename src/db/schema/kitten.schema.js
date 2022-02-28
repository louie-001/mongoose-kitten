const { Schema } = require("mongoose");

const colorSchema = new Schema({ name: String }, { timestamps: true });

const kittenSchema = new Schema(
  {
    name: String,
    age: Number,
    colors: {
      type: [colorSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = kittenSchema;
