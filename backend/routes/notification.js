const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

/*
GET notifications
*/
router.get("/", auth, async (req, res) => {

  try {

    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id   // 🔑 THIS FIX
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(notifications);

  } catch (err) {
    console.error("NOTIFICATION FETCH ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch notifications" });
  }

});

/*
Unread count
*/
router.get("/unread-count", auth, async (req, res) => {

  const count = await prisma.notification.count({
    where: {
      userId: req.user.id,
      isRead: false
    }
  });

  res.json({ count });
});

/*
Mark read
*/
router.put("/:id/read", auth, async (req, res) => {

  try {

    const notification = await prisma.notification.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    await prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true }
    });

    res.json({ msg: "Notification marked as read" });

  } catch (err) {
    res.status(500).json({ msg: "Failed to update notification" });
  }

});
/*
Delete single notification
*/
router.delete("/:id", auth, async (req, res) => {

  try {

    const notification = await prisma.notification.findFirst({
      where: {
        id: Number(req.params.id),
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    await prisma.notification.delete({
      where: { id: notification.id }
    });

    res.json({ msg: "Notification deleted" });

  } catch (err) {

    console.error("Delete notification error:", err);
    res.status(500).json({ msg: "Delete failed" });

  }

});
router.delete("/", auth, async (req,res)=>{

  try{

    await prisma.notification.deleteMany({
      where:{
        userId:req.user.id
      }
    });

    res.json({msg:"All notifications deleted"});

  }catch(err){

    console.error(err);
    res.status(500).json({msg:"Delete failed"});

  }

});
module.exports = router;