const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const { notifyMention } = require("../utils/notificationService");

const prisma = new PrismaClient();
const router = express.Router();

/*
========================================
ADD COMMENT TO BUG
POST /api/bugs/:bugId/comment
========================================
*/

router.post("/:bugId/comment", auth, async (req, res) => {

  try {

    const bugId = Number(req.params.bugId);
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ msg: "Comment text required" });
    }

    const projectId = Number(req.headers["x-project-id"]);

    if (!projectId) {
      return res.status(400).json({ msg: "Project ID required" });
    }

    const bug = await prisma.bug.findFirst({
      where: {
        id: bugId,
        projectId
      }
    });

    if (!bug) {
      return res.status(404).json({ msg: "Bug not found" });
    }

    /*
    ===============================
    SAVE COMMENT
    ===============================
    */

    const comment = await prisma.bugComment.create({
      data: {
        bugId,
        userId: req.user.id,
        text
      }
    });

    /*
    ===============================
    DETECT @MENTIONS
    ===============================
    */

    const mentionRegex = /@(\w+)/g;
    const mentionedUsernames = [];

    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentionedUsernames.push(match[1]);
    }

    /*
    ===============================
    FIND USERS
    ===============================
    */

    if (mentionedUsernames.length > 0) {

      const users = await prisma.user.findMany({
        where: {
          name: { in: mentionedUsernames }
        }
      });

      for (const user of users) {

        if (user.email) {
          try {
            await notifyMention(user.email, bug.bugId);
          } catch (err) {
            console.error("Mention notification error:", err);
          }
        }

      }

    }

    res.json({
      msg: "Comment added successfully",
      data: comment
    });

  } catch (err) {

    console.error("COMMENT ERROR:", err);

    res.status(500).json({
      msg: "Failed to add comment"
    });

  }

});

module.exports = router;