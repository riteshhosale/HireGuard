import type { NextFunction, Request, Response } from "express";

import {
  CommunityPost,
  COMMUNITY_CATEGORIES,
  CONTACT_METHODS,
} from "../models/community-post.model.js";

import { CommunityComment } from "../models/community-comment.model.js";
import { CommunityReport } from "../models/community-report.model.js";
import { Scan } from "../models/scan.model.js";

import type { AuthenticatedRequest } from "../types/auth.types.js";

const COMMUNITY_REPORT_REASONS = [
  "SPAM",
  "HARASSMENT",
  "PERSONAL_INFORMATION",
  "MISLEADING",
  "MALICIOUS",
  "OTHER",
] as const;

type CommunityReportReason =
  (typeof COMMUNITY_REPORT_REASONS)[number];

const userId = (req: Request): string | undefined =>
  (req as AuthenticatedRequest).user?.id;

const publicUser = (user: any) =>
  user
    ? {
        id: String(user._id),
        name: user.name,
      }
    : {
        id: "",
        name: "JobGuard user",
      };

const postShape = (post: any, uid?: string) => ({
  id: String(post._id),

  title: post.title,

  description: post.description,

  category: post.category,

  contactMethod: post.contactMethod,

  suspiciousUrl: post.suspiciousUrl || null,

  scanId: post.scanId || null,

  riskLevel: post.riskLevel || null,

  scanAttached: Boolean(post.scanAttached),

  likesCount: post.likes?.length || 0,

  likedByMe: Boolean(
    uid &&
      post.likes?.some(
        (id: any) => String(id) === uid,
      ),
  ),

  savedByMe: Boolean(
    uid &&
      post.savedBy?.some(
        (id: any) => String(id) === uid,
      ),
  ),

  commentsCount: post.commentsCount || 0,

  author: publicUser(post.authorId),

  createdAt: post.createdAt,
});

/**
 * GET /community/posts
 */
export async function listPostsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const uid = userId(req);

    const { q, category } = req.query;

    const filter: any = {
      status: "PUBLISHED",
    };

    if (
      category &&
      COMMUNITY_CATEGORIES.includes(
        String(category) as any,
      )
    ) {
      filter.category = String(category);
    }

    if (q) {
      filter.$or = [
        {
          title: {
            $regex: String(q),
            $options: "i",
          },
        },
        {
          description: {
            $regex: String(q),
            $options: "i",
          },
        },
      ];
    }

    const posts = await CommunityPost.find(filter)
      .populate("authorId", "name")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: posts.map((post: any) =>
        postShape(post, uid),
      ),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /community/posts/:postId
 */
export async function getPostController(
  req: Request<{ postId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const uid = userId(req);

    const post = await CommunityPost.findOne({
      _id: req.params.postId,
      status: "PUBLISHED",
    })
      .populate("authorId", "name")
      .lean();

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Community post not found",
      });
      return;
    }

    res.json({
      success: true,
      data: postShape(post, uid),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /community/posts
 */
export async function createPostController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const uid = userId(req);

    if (!uid) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const {
      title,
      description,
      category,
      contactMethod,
      suspiciousUrl,
      scanId,
    } = req.body || {};

    if (
      !title ||
      String(title).trim().length < 8
    ) {
      res.status(400).json({
        success: false,
        message:
          "Title must contain at least 8 characters",
      });
      return;
    }

    if (
      !description ||
      String(description).trim().length < 20
    ) {
      res.status(400).json({
        success: false,
        message:
          "Please describe what happened in at least 20 characters",
      });
      return;
    }

    if (
      !COMMUNITY_CATEGORIES.includes(
        String(category) as any,
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid scam category",
      });
      return;
    }

    if (
      contactMethod &&
      !CONTACT_METHODS.includes(
        String(contactMethod) as any,
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid contact method",
      });
      return;
    }

    let attachedRisk: any = undefined;

    let scanAttached = false;

    if (scanId) {
      const scan = await Scan.findOne({
        scanId: String(scanId),
        userId: uid,
      }).lean();

      if (!scan) {
        res.status(400).json({
          success: false,
          message:
            "The selected scan was not found in your account",
        });
        return;
      }

      attachedRisk = scan.riskLevel;

      scanAttached = true;
    }

    const post = await CommunityPost.create({
      authorId: uid,

      title: String(title).trim(),

      description: String(description).trim(),

      category,

      contactMethod:
        contactMethod || "OTHER",

      suspiciousUrl: suspiciousUrl
        ? String(suspiciousUrl).trim()
        : undefined,

      scanId: scanId
        ? String(scanId)
        : undefined,

      riskLevel: attachedRisk,

      scanAttached,
    });

    const populated = await CommunityPost.findById(
      post._id,
    )
      .populate("authorId", "name")
      .lean();

    res.status(201).json({
      success: true,
      data: postShape(populated, uid),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /community/posts/:postId/like
 */
export async function toggleLikeController(
  req: Request<{ postId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const uid = userId(req);

    if (!uid) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const post = await CommunityPost.findOne({
      _id: req.params.postId,
      status: "PUBLISHED",
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Community post not found",
      });
      return;
    }

    const index = post.likes.findIndex(
      (id: any) => String(id) === uid,
    );

    if (index >= 0) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(uid as any);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        liked: index < 0,
        likesCount: post.likes.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /community/posts/:postId/bookmark
 */
export async function toggleBookmarkController(
  req: Request<{ postId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const uid = userId(req);

    if (!uid) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const post = await CommunityPost.findOne({
      _id: req.params.postId,
      status: "PUBLISHED",
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Community post not found",
      });
      return;
    }

    const index = post.savedBy.findIndex(
      (id: any) => String(id) === uid,
    );

    if (index >= 0) {
      post.savedBy.splice(index, 1);
    } else {
      post.savedBy.push(uid as any);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        saved: index < 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /community/posts/:postId/comments
 */
export async function listCommentsController(
  req: Request<{ postId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const comments = await CommunityComment.find({
      postId: req.params.postId,
    })
      .populate("authorId", "name")
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: comments.map((comment: any) => ({
        id: String(comment._id),
        text: comment.text,
        author: publicUser(comment.authorId),
        createdAt: comment.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /community/posts/:postId/comments
 */
export async function createCommentController(
  req: Request<{ postId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const uid = userId(req);

    if (!uid) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const text = String(
      req.body?.text || "",
    ).trim();

    if (
      text.length < 2 ||
      text.length > 2000
    ) {
      res.status(400).json({
        success: false,
        message:
          "Comment must be between 2 and 2000 characters",
      });
      return;
    }

    const post = await CommunityPost.findOne({
      _id: req.params.postId,
      status: "PUBLISHED",
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Community post not found",
      });
      return;
    }

    const comment =
      await CommunityComment.create({
        postId: post._id,
        authorId: uid,
        text,
      });

    post.commentsCount += 1;

    await post.save();

    const populated =
      await CommunityComment.findById(
        comment._id,
      )
        .populate("authorId", "name")
        .lean();

    res.status(201).json({
      success: true,
      data: {
        id: String(populated?._id),
        text: populated?.text,
        author: publicUser(
          populated?.authorId,
        ),
        createdAt: populated?.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /community/posts/:postId/report
 */
export async function reportPostController(
  req: Request<{ postId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const uid = userId(req);

    if (!uid) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const rawReason = String(
      req.body?.reason || "OTHER",
    );

    if (
      !COMMUNITY_REPORT_REASONS.includes(
        rawReason as CommunityReportReason,
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid report reason",
      });
      return;
    }

    const reason =
      rawReason as CommunityReportReason;

    await CommunityReport.create({
      postId: req.params.postId,
      reporterId: uid,
      reason,
    });

    res.status(201).json({
      success: true,
      message:
        "Thanks. The community report has been recorded.",
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      res.status(409).json({
        success: false,
        message:
          "You have already reported this post",
      });
      return;
    }

    next(error);
  }
}