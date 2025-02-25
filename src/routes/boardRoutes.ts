import { Router } from "express";
import {
  addBoard,
  addTask,
  deleteBoard,
  deleteColumn,
  deleteTask,
  editBoard,
  editColumnTitle,
  editTask,
  getBoardById,
  getBoards,
  getColTasks,
  getColumnsByBoard,
  updateSubTask,
} from "../controllers/boardController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, getBoards);
router.get("/:id", getBoardById);
router.post("/", authenticate, addBoard);
router.put("/:id", editBoard);
router.get("/:id/columns", getColumnsByBoard);
router.delete("/:id", deleteBoard);
router.delete("/:id/columns/:idCol", deleteColumn);
router.patch("/:id/columns/:idCol", editColumnTitle);
router.post("/:id/columns/:idCol/tasks", addTask);
router.get("/:id/columns/:idCol/tasks", getColTasks);
router.delete("/:id/columns/:idCol/tasks/:idTask", deleteTask);
router.put("/:id/columns/:idCol/tasks/:idTask", editTask);
router.patch(
  "/:id/columns/:idCol/tasks/:idTask/subTasks/:subTaskId",
  updateSubTask
);

export default router;
