import mongoose, { Schema, Document } from "mongoose";

export interface IBoard extends Document {
  title: string;
  columns: mongoose.Types.ObjectId[];
  user: mongoose.Types.ObjectId;
}

const boardSchema: Schema = new Schema({
  title: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  columns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Column" }],
});

export default mongoose.model<IBoard>("Board", boardSchema);
