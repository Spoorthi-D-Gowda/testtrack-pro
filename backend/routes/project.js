const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const prisma = new PrismaClient();
const router = express.Router();

/*
=========================================
FR-PRJ-001: CREATE PROJECT
POST /api/projects
(Admin Only)
=========================================
*/
router.post(
  "/",
  auth,
  role(["admin"]),
  async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({ msg: "Project name is required" });
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          createdById: req.user.id,
        },
      });

      res.status(201).json({
        msg: "Project created successfully",
        project,
      });

    } catch (err) {
      console.error("CREATE PROJECT ERROR:", err);
      res.status(500).json({ msg: "Failed to create project" });
    }
  }
);

// ASSIGN TESTERS TO PROJECT
router.post("/:id/assign-testers", auth, role(["admin"]), async (req, res) => {
  try {

    const projectId = Number(req.params.id);
    const { testerIds } = req.body;

    await prisma.projectTester.createMany({
      data: testerIds.map(id => ({
        projectId,
        testerId: id
      })),
      skipDuplicates: true
    });

    res.json({
      msg: "Testers assigned successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to assign testers" });
  }
});

/*
=========================================
GET ALL PROJECTS
GET /api/projects
=========================================
*/
router.get("/", auth, async (req, res) => {
  try {

    const projects = await prisma.project.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },

      include: {

        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },

        testers: {
          include: {
            tester: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }

      }

    });

    res.json(projects);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch projects" });
  }
});

router.post("/modules/:projectId", auth,
role(["admin"]), async (req, res) => {

  const { name } = req.body;

if (!name || name.trim() === "") {
  return res.status(400).json({
    msg: "Module name required"
  });
}
  const projectId = Number(req.params.projectId);

  const module = await prisma.projectModule.create({
    data: {
      name,
      projectId
    }
  });

  res.json(module);
});
// GET MODULES FOR PROJECT
router.get("/modules/:projectId", auth, async (req, res) => {
  try {

    const projectId = Number(req.params.projectId);

    const modules = await prisma.projectModule.findMany({
      where: { projectId },
      orderBy: { name: "asc" }
    });

    res.json(modules);

  } catch (err) {
    console.error("GET MODULES ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch modules" });
  }
});
// DELETE MODULE
router.delete("/modules/:id", auth, role(["admin"]), async (req, res) => {

  try {

    const id = Number(req.params.id);

    await prisma.projectModule.delete({
      where: { id }
    });

    res.json({ msg: "Module deleted" });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Failed to delete module"
    });

  }

});
router.post(
  "/environments/:projectId",
  auth,
  role(["admin"]),
  async (req, res) => {

    try {

      const { name } = req.body;
      if (!name || name.trim() === "") {
  return res.status(400).json({
    msg: "Environment name required"
  });
}

      const projectId = Number(req.params.projectId);

      const env = await prisma.projectEnvironment.create({
        data: {
          name,
          projectId
        }
      });

      res.json(env);

    } catch (err) {

      console.error("CREATE ENV ERROR:", err);

      res.status(500).json({
        msg: "Failed to create environment"
      });

    }

  }
);
router.get(
  "/environments/:projectId",
  auth,
  async (req, res) => {

    try {

      const projectId = Number(req.params.projectId);

      const envs = await prisma.projectEnvironment.findMany({
        where: { projectId },
        orderBy: { name: "asc" }
      });

      res.json(envs);

    } catch (err) {

      console.error("GET ENV ERROR:", err);

      res.status(500).json({
        msg: "Failed to fetch environments"
      });

    }

  }
);
router.delete(
  "/environments/:id",
  auth,
  role(["admin"]),
  async (req, res) => {

    try {

      const id = Number(req.params.id);

      await prisma.projectEnvironment.delete({
        where: { id }
      });

      res.json({ msg: "Environment deleted" });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        msg: "Failed to delete environment"
      });

    }

  }
);
router.post("/custom-fields/:projectId", auth,role(["admin"]), async (req, res) => {

  const { name, type, options } = req.body;

  const field = await prisma.projectCustomField.create({
    data: {
      name,
      type,
      options,
      projectId: Number(req.params.projectId)
    }
  });

  res.json(field);
});
router.delete("/custom-fields/:id", auth, role(["admin"]), async (req,res)=>{

  const id = Number(req.params.id);

  await prisma.projectCustomField.delete({
    where: { id }
  });

  res.json({ msg: "Field deleted" });

});
router.post("/workflow/:projectId", auth,role(["admin"]), async (req, res) => {

  const { entity, statuses } = req.body;

  const workflow = await prisma.projectWorkflow.create({
    data: {
      entity,
      statuses,
      projectId: Number(req.params.projectId)
    }
  });

  res.json(workflow);
});
router.put("/workflow/:id", auth, role(["admin"]), async (req,res)=>{

  const { statuses } = req.body;

  const workflow = await prisma.projectWorkflow.update({
    where: { id: Number(req.params.id) },
    data: { statuses }
  });

  res.json(workflow);

});
// GET MY ASSIGNED PROJECTS
router.get("/my", auth, async (req, res) => {

  try {

    const projects = await prisma.projectTester.findMany({
      where: {
        testerId: req.user.id
      },
      include: {
        project: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json(projects.map(p => p.project));

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Failed to fetch assigned projects"
    });

  }

});


router.get("/custom-fields/:projectId", auth, async (req, res) => {

  const projectId = Number(req.params.projectId);

  const fields = await prisma.projectCustomField.findMany({
    where: { projectId }
  });

  res.json(fields);

});
router.get("/workflow/:projectId", auth, async (req, res) => {

  const projectId = Number(req.params.projectId);

  const workflow = await prisma.projectWorkflow.findMany({
    where: { projectId }
  });

  res.json(workflow);

});
module.exports = router;