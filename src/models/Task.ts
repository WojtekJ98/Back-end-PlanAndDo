import mongoose, { Schema, Document } from "mongoose";

export interface ISubtask extends Document {
  id: string;
  title: string;
  done: boolean;
}

export interface ITask extends Document {
  title: string;
  description: string;
  deadline: Date;
  status: string;
  piority: string;
  subTasks?: ISubtask[];
}

const subtaskSchema: Schema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String },
    done: { type: Boolean, default: false },
  }
  // { _id: false }
);
const taskSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date },
  status: {
    type: String,
    enum: ["todo", "in-progress", "done"],
    default: "todo",
  },
  piority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
  subTasks: {
    type: [subtaskSchema],
    default: [],
    id: string,
  },
});

export default mongoose.model<ITask>("Task", taskSchema);
