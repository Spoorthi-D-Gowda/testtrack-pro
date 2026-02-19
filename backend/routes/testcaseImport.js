const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const XLSX = require("xlsx");
const fs = require("fs");

const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();

const router = express.Router();


// upload config
const upload = multer({
  dest: "uploads/"
});



// generate TC ID
async function generateTCId() {

  const count = await prisma.testCase.count();

  const year = new Date().getFullYear();

  return `TC-${year}-${String(count + 1).padStart(5, "0")}`;
}



// ================= PREVIEW =================

router.post(
  "/import/preview",
  auth,
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          msg: "No file uploaded"
        });

      }

      const ext = req.file.originalname.split(".").pop();

      let data = [];

      // CSV
      if (ext === "csv") {

        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on("data", row => data.push(row))
          .on("end", () => {

            fs.unlinkSync(req.file.path);

            res.json({
              preview: data.slice(0, 10),
              total: data.length
            });

          });

      }

      // Excel
      else if (ext === "xlsx") {

        const workbook = XLSX.readFile(req.file.path);

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        data = XLSX.utils.sheet_to_json(sheet);

        fs.unlinkSync(req.file.path);

        res.json({
          preview: data.slice(0, 10),
          total: data.length
        });

      }

      // JSON
      else if (ext === "json") {

        const raw = fs.readFileSync(req.file.path);

        data = JSON.parse(raw);

        fs.unlinkSync(req.file.path);

        res.json({
          preview: data.slice(0, 10),
          total: data.length
        });

      }

      else {

        return res.status(400).json({
          msg: "Unsupported file format"
        });

      }

    }

    catch (err) {

      res.status(500).json({
        msg: "Preview failed"
      });

    }

  }
);



// ================= IMPORT =================

router.post(
  "/import",
  auth,
  upload.single("file"),
  async (req, res) => {

    try {

      if (!req.file) {

        return res.status(400).json({
          msg: "No file uploaded"
        });

      }

      const ext = req.file.originalname.split(".").pop();

      let rows = [];

      // CSV
      if (ext === "csv") {

        await new Promise((resolve) => {

          fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", row => rows.push(row))
            .on("end", resolve);

        });

      }

      // Excel
      else if (ext === "xlsx") {

        const workbook = XLSX.readFile(req.file.path);

        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        rows = XLSX.utils.sheet_to_json(sheet);

      }

      // JSON
      else if (ext === "json") {

        const raw = fs.readFileSync(req.file.path);

        rows = JSON.parse(raw);

      }

      else {

        return res.status(400).json({
          msg: "Unsupported file format"
        });

      }



      let created = 0;
      let failed = 0;
      const errors = [];


      for (const row of rows) {

        try {

          if (!row.title) {

            failed++;

            errors.push({
              row,
              error: "Missing title"
            });

            continue;

          }

          const testCaseId = await generateTCId();

          await prisma.testCase.create({

            data: {

              testCaseId,

              title: row.title,

              description: row.description || "",

              module: row.module || "",

              priority: row.priority || "Medium",

              severity: row.severity || "Major",

              type: row.type || "Functional",

              status: row.status || "Draft",

              preconditions: row.preconditions || "",

              testData: row.testData || "",

              environment: row.environment || "",

              expected: row.expected || "",

              automationStatus: "Not Automated",

              userId: req.user.id

            }

          });

          created++;

        }

        catch (err) {

          failed++;

          errors.push({
            row,
            error: err.message
          });

        }

      }


      fs.unlinkSync(req.file.path);


      res.json({

        msg: "Import completed",

        created,
        failed,
        errors

      });

    }

    catch (err) {

      res.status(500).json({

        msg: "Import failed"

      });

    }

  }
);



module.exports = router;