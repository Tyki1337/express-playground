import mongoose from "mongoose";

try {
  const conn = await mongoose.connect("mongodb://127.0.0.1:27017/db", {
    serverSelectionTimeoutMS: 5000
  });
  console.log("Connected:", conn.connection.readyState); // 1 = connected
} catch (e) {
  console.error("Connect error:", e);
}
