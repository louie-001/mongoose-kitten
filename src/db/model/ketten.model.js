const { model } = require("mongoose");
const { kittenSchema } = require("../schema");

const KittenModel = model("kitten", kittenSchema);

const find = (filter = {}) => KittenModel.find(filter).exec();

const findOne = (filter = {}) => KittenModel.findOne(filter).exec();

const findById = (id) => KittenModel.findById(id).exec();

const save = (kitten) => new KittenModel(kitten).save();

const remove = (id) => KittenModel.findByIdAndRemove(id).exec()

const modify = (id, kitten) => KittenModel.findByIdAndUpdate(id, kitten).exec()

module.exports = {
    find,
    findOne,
    findById,
    save,
    remove,
    modify
};
