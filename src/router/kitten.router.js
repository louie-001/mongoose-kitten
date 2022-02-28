const express = require("express");
const router = express.Router();
const { kittenService } = require("../service");

router.use(express.json());

/**
 * 获取小猫咪
 * id: String, kitten's primary key
 * return: id ? kitten详细信息 : kittens 列表
 */
router.get("/(:id)?", (req, res) => {
  kittenService.getKitten(req.params.id).then((result) => {
    res.send(result);
  });
});

/**
 * 新增小猫咪信息
 * return：新增后的小猫咪信息
 */
router.post("", (req, res) => {
  kittenService.save(req.body).then((result) => {
    res.send(result);
  });
});

/**
 * 小猫咪被领养了
 * id: String kitten's primary key
 * return: the removed kitten
 */
router.delete("/:id", (req, res) => {
  const kittenId = req.params.id;
  kittenService.remove(kittenId).then((result) => {
    res.send(result);
  });
});

/**
 * 修改小猫咪信息
 */
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const kitten = req.body;
  kittenService.modify(id, kitten).then((result) => {
    res.send(result);
  });
});

/**
 * 给小猫咪添加颜色
 * id: String kitten's primary key
 * color: new color name
 * return: the updated kitten
 */
router.post("/color", (req, res) => {
  const { id, color } = req.body;
  kittenService.setColor(id, color).then((result) => {
    res.send(result);
  });
});

/**
 * 删除小猫咪的颜色
 * id: String kitten's primary key
 * colorId: String color's primary key
 * return: the updated kitten
 */
router.delete("/color", (req, res) => {
  const { id, colorId } = req.body;
  kittenService.removeColor(id, colorId).then((result) => {
    res.send(result);
  });
});

/**
 * 修改小猫咪颜色
 */
router.put("/color/:id", (req, res) => {
  const kittenId = req.params.id;
  const color = req.body;
  kittenService.modifyColor(kittenId, color).then((result) => {
    res.send(result);
  });
});

module.exports = router;
