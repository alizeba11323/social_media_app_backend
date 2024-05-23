const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, { dbName: "social_media_app" });
    console.log("DB Connected...");
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
