const { kittenModel } = require("../db/model");

const save = (kitten) => kittenModel.save(kitten);

const listAll = () => kittenModel.find();

const detail = (id) => kittenModel.findById(id);

const getKitten = (id) => (id ? detail(id) : listAll());

const remove = (id) => kittenModel.remove();

const modify = (id, kitten) => kittenModel.modify(id, kitten);

/**
 * 捡到了一只小猫咪，记录它的颜色信息
 * @param {String} id kitten's primary key
 * @param {Object} color kitten's color info
 * @return {Promise<Document>} updated kitten's document
 */
const setColor = (id, color) =>
  kittenModel.findById(id).then((kitten) => {
    kitten.colors.push({ name: color });
    return kitten.save();
  });

const setColors = (id, colors) => {
  kittenModel.findById(id).then((kitten) => {
    kitten.colors.push(colors.map((name) => ({ name })));
  });
};

/**
 * 一个颜色是脏东西，洗干净后没有了
 * @param {String} id kitten's primary key
 * @param {String} colorId color's primary key
 * @return {Promise<Document>} updated kitten's document
 */
const removeColor = (id, colorId) =>
  kittenModel.findById(id).then((kitten) => {
    const color = kitten.colors.id(colorId);
    if (color) {
      color.remove();
    }
    return kitten.save();
  });

/**
 * 长大后毛色加深，灰色变成了黑色
 * @param {String} id kitten's primary key
 * @param {String} colorId color's primary key
 * @param {String} name new color's name
 * @return {Promise<Document>} updated kitten's document
 */
const modifyColor = (id, { id: colorId, name }) =>
  kittenModel.findById(id).then((kitten) => {
    kitten.colors.id(colorId).name = name;
    return kitten.save();
  });

const colorDetail = (colorId) =>
  kittenModel
    .findOne({ "colors.id": colorId })
    .then((kitten) => kitten.colors.id(colorId));

module.exports = {
  getKitten,
  save,
  modify,
  remove,
  setColor,
  removeColor,
  modifyColor,
  colorDetail,
};
