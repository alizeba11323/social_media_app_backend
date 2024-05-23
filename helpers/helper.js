const multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + file.originalname);
  },
});

const upload = multer({ limits: 5 * 1024 * 1024, storage });

const singleUpload = upload.single("avatar");
const singlePostImageUpload = upload.single("image");

module.exports = { singleUpload, singlePostImageUpload };
