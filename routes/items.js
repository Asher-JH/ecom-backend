const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const auth = require("../middleware/auth");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// NON-ADMIN REQUESTS (VIEW ALL ITEMS, VIEW SINGLE ITEM)
router.get("/", (req, res) => {
  Item.find({}, (err, items) => {
    if (err) {
      return res.status(400).json({ err });
    }
    return res.json(items);
  });
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    return res.json(item);
  } catch (e) {
    return res.status(400).json(e);
  }
});

router.put("/:id", auth, upload.single("files"), async (req, res) => {
  try {
    if (!req.user.isAdmin)
      return res
        .status(401)
        .json({ msg: "You are an unauthorized human being, stop trying" });

    const item = await Item.findById(req.params.id);
    if (!item) return res.json({ msg: "Item Doesn't exist bro" });

    if (req.file !== undefined) {
      item.image = req.file.filename;
    }

    // Save image
    const { price, name, category, description } = req.body;
    item.name = name;
    item.price = price;
    item.description = description;
    item.category = category;

    item.save();

    res.status(201).json({ msg: "Item added", item });
  } catch (e) {
    return res.status(400).json({ err });
  }
});

// ADMIN-REQUESTS ONLY (ADD, UPDATE, DELETE ITEM)
router.post("/", auth, upload.single("files"), (req, res) => {
  console.log(req.user);
  // return res.json({details: req.user})
  if (!req.user.isAdmin) {
    return res
      .status(401)
      .json({ msg: "You are an unauthorized human being, please stop trying" });
  }

  // Save image
  const { price, name, category, description } = req.body;
  const item = new Item();
  item.name = name;
  item.price = price;
  item.description = description;
  item.category = category;
  item.image = req.file.filename;

  item.save();

  res.status(201).json({ msg: "Item added", item });
});



// router.put("/:id", auth, async (req, res) => {
// 	try {
// 		if(!req.user.isAdmin) return res.status(401).json({ msg: "You are unauthorized "})
// 		const item = await Item.findById(req.params.id)
// 		if(!item) return res.json({msg: "Item Doesn't exist"})

// 		const form = new formidable.IncomingForm()
// 		form.parse(req, (e, fields, files) => {
// 			if(files.image.name !== '') { //IF THE ADMIN IS UPDATING THE IMAGE.
// 				let oldPath = files.image.path
// 				let newPath = path.join(__dirname, "../public") + "/" + files.image.name
// 				let rawData = fs.readFileSync(oldPath)
// 				fs.writeFileSync(newPath, rawData)
// 				item.image = "/public/"+files.image.name
// 			}
// 			await Item.updateOne(req.params.id, fields)
// 			await item.save()
// 			return res.json({ msg: "Item updated successfully"})
// 		})
// 	}catch(e) {
// 		return res.status(400).json({err})
// 	}
// })

router.delete("/:id", auth, (req, res) => {
  if (!req.user.isAdmin)
    return res
      .status(401)
      .json({ msg: "Who the heck are you? You unauthorized human being." });

  Item.findOneAndDelete({ _id: req.params.id }, (err, item) => {
    if (err) return res.status(400).json({ err });
    return res.json({ msg: "This item is gone forever my brother", item });
  });
});

module.exports = router;
