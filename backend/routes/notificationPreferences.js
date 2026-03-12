const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

/*
GET user preferences
*/
router.get("/", auth, async (req,res)=>{
  
  let pref = await prisma.notificationPreference.findUnique({
    where:{ userId:req.user.id }
  });

  if(!pref){
    pref = await prisma.notificationPreference.create({
      data:{ userId:req.user.id }
    });
  }

  res.json(pref);
});

/*
UPDATE preferences
*/
router.put("/", auth, async (req,res)=>{

  const {
    bugAssignedEmail,
    bugAssignedInApp,
    testRunEmail,
    testRunInApp,
    quietStart,
    quietEnd
  } = req.body;

  const pref = await prisma.notificationPreference.upsert({
    where:{ userId:req.user.id },
    update:{
      bugAssignedEmail,
      bugAssignedInApp,
      testRunEmail,
      testRunInApp,
      quietStart,
      quietEnd
    },
    create:{
      userId:req.user.id,
      bugAssignedEmail,
      bugAssignedInApp,
      testRunEmail,
      testRunInApp,
      quietStart,
      quietEnd
    }
  });

  res.json(pref);
});

module.exports = router;