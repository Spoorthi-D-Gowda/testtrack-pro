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

  const runs = await prisma.testRun.findMany({
    where:{ milestoneId },
    include:{ executions:true }
  });

  const latestByCase = {};

  runs.forEach(run=>{
    run.executions.forEach(exec=>{
      if(!latestByCase[exec.testCaseId] ||
         new Date(exec.completedAt) >
         new Date(latestByCase[exec.testCaseId].completedAt)){
        latestByCase[exec.testCaseId] = exec;
      }
    });
  });

  const executions = Object.values(latestByCase);

  const total = executions.length;
  const pass = executions.filter(e=>e.status==="Pass").length;
  const fail = executions.filter(e=>e.status==="Fail").length;

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