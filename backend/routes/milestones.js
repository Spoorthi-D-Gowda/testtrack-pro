const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const prisma = new PrismaClient();
const router = express.Router();

/* CREATE MILESTONE */

router.post("/", auth, role(["admin"]), async (req,res)=>{

  const projectId = Number(req.headers["x-project-id"]);

  if (!projectId) {
 return res.status(400).json({
  msg: "Project ID required"
 });
}

  const { name, description, targetDate, targetPassRate } = req.body;

  const milestone = await prisma.milestone.create({
    data:{
      name,
      description,
      targetDate:new Date(targetDate),
      targetPassRate: Number(targetPassRate),
      projectId
    }
  });

  res.json(milestone);

});

/* GET MILESTONES */

router.get("/", auth, async (req,res)=>{

  const projectId = Number(req.headers["x-project-id"]);

  if (!projectId) {
 return res.status(400).json({
  msg: "Project ID required"
 });
}

  const milestones = await prisma.milestone.findMany({
    where:{projectId},
    include:{runs:true},
    orderBy:{targetDate:"asc"}
  });

  res.json(milestones);

});
router.get("/:id/progress", auth, async (req,res)=>{

  const milestoneId = Number(req.params.id);

  const milestone = await prisma.milestone.findUnique({
    where:{id:milestoneId}
  });

  if(!milestone){
    return res.status(404).json({
      msg:"Milestone not found"
    });
  }

  const runs = await prisma.testRun.findMany({
    where:{milestoneId},
    include:{executions:true}
  });

  let total=0;
  let pass=0;
  let fail=0;

  runs.forEach(run=>{
    run.executions.forEach(exec=>{
      total++;

      if(exec.status==="Pass") pass++;
      if(exec.status==="Fail") fail++;
    });
  });

  const passRate = total===0 ? 0 : Math.round((pass/total)*100);

  res.json({
    total,
    pass,
    fail,
    passRate
  });

});
router.delete("/:id", auth, role(["admin"]), async (req,res)=>{

 const id = Number(req.params.id);

 const runs = await prisma.testRun.count({
  where:{ milestoneId:id }
 });

 if(runs>0){
  return res.status(400).json({
   msg:"Cannot delete milestone with linked test runs"
  });
 }

 await prisma.milestone.delete({
  where:{id}
 });

 res.json({msg:"Milestone deleted"});
});
module.exports = router;