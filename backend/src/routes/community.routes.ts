import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  createCommentController,
  createPostController,
  getPostController,
  listCommentsController,
  listPostsController,
  reportPostController,
  toggleBookmarkController,
  toggleLikeController,
} from "../controllers/community.controller.js";

const router = Router();
router.use(requireAuth);
router.get("/posts", listPostsController);
router.post("/posts", createPostController);
router.get("/posts/:postId", getPostController);
router.post("/posts/:postId/like", toggleLikeController);
router.post("/posts/:postId/bookmark", toggleBookmarkController);
router.get("/posts/:postId/comments", listCommentsController);
router.post("/posts/:postId/comments", createCommentController);
router.post("/posts/:postId/report", reportPostController);
export default router;
