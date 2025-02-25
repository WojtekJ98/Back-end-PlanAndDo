import Board from "../models/Board";
import { Request, Response } from "express";
import Column from "../models/Column";
import Task from "../models/Task";
import mongoose from "mongoose";

export const getBoards = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userBoards = await Board.find({ user: userId }).populate("columns");

    res.status(200).json(userBoards);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching boards", error });
    return;
  }
};

export const getBoardById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      res.status(404).json({ message: "Board not found" });
      return;
    }
    res.status(200).json(board);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching board" });
    return;
  }
};

export const addBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, columns }: { title: string; columns: { title: string }[] } =
      req.body;

    const userId = (req as any).user.id;

    // Create columns in the database
    const createdColumns = await Column.insertMany(
      columns.map((c: { title: string }) => ({ title: c.title }))
    );

    // Create the board with referenced column ObjectIds
    const newBoard = new Board({
      title,
      columns: createdColumns.map((col) => col._id),
      user: userId,
    });

    await newBoard.save();
    res.status(201).json(newBoard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating board", error });
  }
};

export const editBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      columns,
    }: { title: string; columns: { _id?: string; title: string }[] } = req.body;

    const { id: boardId } = req.params;

    const board = await Board.findById(boardId).populate("columns");

    if (!board) {
      res.status(404).json({ message: "Board not found" });
      return;
    }
    if (title) {
      board.title = title;
    }
    if (columns && Array.isArray(columns)) {
      const updatedColumns: mongoose.Types.ObjectId[] = [];

      for (const columnData of columns) {
        if (columnData._id && mongoose.Types.ObjectId.isValid(columnData._id)) {
          const column = await Column.findByIdAndUpdate(
            columnData._id,
            { title: columnData.title },
            { new: true }
          );

          if (!column) {
            res
              .status(404)
              .json({ message: `Column with id ${columnData._id} not found` });
            return;
          }
          updatedColumns.push(column._id as mongoose.Types.ObjectId);
        } else {
          const newColumn = new Column({ title: columnData.title });
          await newColumn.save();
          updatedColumns.push(newColumn._id as mongoose.Types.ObjectId);
        }
      }
      board.columns = updatedColumns;
    }
    await board.save();
    const populatedBoard = await Board.findById(boardId).populate("columns");
    res.status(200).json(populatedBoard);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const deleteBoard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: boardId } = req.params;
    console.log("ID board", boardId);

    const board = await Board.findById(boardId);

    if (!board) {
      res.status(404).json({ error: "Board not found!" });
      return;
    }

    const columsIds = board.columns;

    for (const columsId of columsIds) {
      const column = await Column.findById(columsId);
      if (column) {
        await Task.deleteMany({ _id: { $in: column.tasks } });
        await column.deleteOne();
      }
    }
    await board.deleteOne();
    res.status(200).json({ message: "Board deleted successfully!" });
  } catch (error) {
    console.error("Error deleting board:", error);
    res.status(500).json({ error: "Error deleting board" });
  }
};
// columns
export const getColumnsByBoard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: boardId } = req.params;

    const board = await Board.findById(boardId).populate("columns");
    if (!board) {
      res.status(404).json({ error: "Board not found!" });
      return;
    }
    res.status(200).json(board.columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    res.status(500).json({ error: "Error fetching columns" });
  }
};

export const deleteColumn = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: boardId, idCol: columnId } = req.params;

    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404).json({ error: "Board not found!" });
      return;
    }

    board.columns = board.columns.filter((col) => col.toString() !== columnId);

    const column = await Column.findById(columnId);
    console.log("Task Id", column?.tasks);

    await board.save();

    await Task.findByIdAndDelete(column?.tasks.map((t) => t._id));
    await Column.findByIdAndDelete(columnId);

    res.status(200).json({ message: "Column deleted successfully!" });
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ error: "Error deleting column" });
  }
};
export const editColumnTitle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: boardId, idCol: columnId } = req.params;
    const { title } = req.body;
    console.log("title", title);

    const column = await Column.findById(columnId);

    if (!column) {
      res.status(404).json({ error: "Column not found!" });
      return;
    }

    if (title) {
      column.title = title;
    }
    await column.save();
    res.status(200).json(column);
  } catch (error) {
    console.error("Error edit column title:", error);
    res.status(500).json({ error: "Error edit column title" });
  }
};

// Task

export const addTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: boardId, idCol: columnId } = req.params;
    const { newTask } = req.body;
    console.log(newTask);

    if (!newTask.subTasks || !Array.isArray(newTask.subTasks)) {
      newTask.subTasks = [];
    }

    const task = new Task(newTask);
    await task.save();

    const updatedColumn = await Column.findByIdAndUpdate(
      columnId,
      { $push: { tasks: task._id } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedColumn) {
      res.status(404).json({ error: "Column not found" });
      return;
    }

    res.status(201).json({ task, column: updatedColumn });
  } catch (error) {
    console.error("Error adding task to column:", error);
    res.status(500).json({ error: "Error adding task to column" });
  }
};

export const getColTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: boardId, idCol: columnId } = req.params;

    const column = await Column.findById(columnId).populate("tasks");

    if (!column) {
      res.status(404).json({ error: "Column not found" });
      return;
    }

    res.status(201).json(column.tasks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching task from column" });
  }
};
export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id: boardId, idCol: columnId, idTask: taskId } = req.params;

    const column = await Column.findById(columnId);
    if (!column) {
      res.status(404).json({ error: "Board not found!" });
      return;
    }

    column.tasks = column.tasks.filter((task) => task.toString() !== taskId);

    await column.save();

    await Task.findByIdAndDelete(taskId);

    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    console.error("Error deleting Task:", error);
    res.status(500).json({ error: "Error deleting Task" });
  }
};

export const editTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: boardId, idCol: columnId, idTask: taskId } = req.params;
    const { updatedTask } = req.body;
    const board = await Board.findById(boardId);

    console.log("🔹 Received API Request to edit task:", taskId);
    console.log("🔹 Updated Task Data:", JSON.stringify(updatedTask, null, 2));

    const column = await Column.findById(columnId);

    if (!column) {
      res.status(404).json({ message: "Column not found" });
    }
    const task = await Task.findByIdAndUpdate(
      taskId,
      { $set: updatedTask },
      { new: true, lean: true }
    );

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error editing task:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};

export const updateSubTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      id: boardId,
      idCol: columnId,
      idTask: taskId,
      subTaskId,
    } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    const subtask = task.subTasks?.find((st) =>
      st._id instanceof mongoose.Types.ObjectId
        ? st._id.toString() === subTaskId
        : st._id === subTaskId
    );
    if (!subtask) {
      res.status(404).json({ message: "SubTask not found" });
      return;
    }
    subtask.done = !subtask.done;
    await task.save();

    res.status(200).json({ message: "Subtask updated successfully!", task });
  } catch (error) {
    console.error("Error updating subtask:", error);
    res.status(500).json({ message: "Error updating subtask", error });
  }
};
