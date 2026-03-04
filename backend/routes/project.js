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

module.exports = router;