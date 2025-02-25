import mongoose, { Schema, Document } from "mongoose";

export interface IColumn extends Document {
  title: string;
  tasks: mongoose.Types.ObjectId[];
}

const columnSchema: Schema = new Schema({
  title: { type: String },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

export default mongoose.model<IColumn>("Column", columnSchema);
