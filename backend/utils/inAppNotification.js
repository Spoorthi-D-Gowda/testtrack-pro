const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createNotification(userId, title, message, link = null) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        link
      }
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
}

module.exports = { createNotification };