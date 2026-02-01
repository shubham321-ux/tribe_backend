import mongoose from "mongoose";

export default mongoose.model("Contact", new mongoose.Schema({
  email: String,
  phone: String,
  address: String,
  social: Object
}));
