const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { Parser } = require("json2csv");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/:report/:type", auth, async (req, res) => {
  try {
    const { report, type } = req.params;

    let data = [];
    let formattedData = [];

    // ===============================
    // FETCH DATA BASED ON REPORT TYPE
    // ===============================

    if (report === "execution") {
      const executions = await prisma.testExecution.findMany({
        include: { testCase: true, tester: true }
      });

      formattedData = executions.map(e => ({
        TestCase: e.testCase?.title,
        Tester: e.tester?.name,
        Status: e.status,
        CompletedAt: e.completedAt
      }));
    }

    if (report === "bugs") {
      const bugs = await prisma.bug.findMany({
        include: { reportedBy: true, assignedTo: true }
      });

      formattedData = bugs.map(b => ({
        Title: b.title,
        Severity: b.severity,
        Priority: b.priority,
        Status: b.status,
        ReportedBy: b.reportedBy?.name,
        AssignedTo: b.assignedTo?.name
      }));
    }

    if (report === "developer-performance") {
      const developers = await prisma.user.findMany({
        where: { role: "developer" }
      });

      formattedData = developers.map(d => ({
        Developer: d.name,
        Email: d.email
      }));
    }

    if (report === "tester-performance") {
      const testers = await prisma.user.findMany({
        where: { role: "tester" }
      });

      formattedData = testers.map(t => ({
        Tester: t.name,
        Email: t.email
      }));
    }

    // ===============================
    // CSV EXPORT
    // ===============================

    if (type === "csv") {
      const parser = new Parser();
      const csv = parser.parse(formattedData);

      res.header("Content-Type", "text/csv");
      res.attachment(`${report}.csv`);
      return res.send(csv);
    }

    // ===============================
    // PDF EXPORT (PROFESSIONAL FORMAT)
    // ===============================

    if (type === "pdf") {
      const doc = new PDFDocument({ margin: 40 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${report}.pdf`
      );

      doc.pipe(res);

      doc.fontSize(18).text(`${report.toUpperCase()} REPORT`, {
        align: "center"
      });

      doc.moveDown(2);

      formattedData.forEach(item => {
        Object.entries(item).forEach(([key, value]) => {
          doc.fontSize(10).text(`${key}: ${value}`);
        });
        doc.moveDown();
      });

      doc.end();
      return;
    }

    // ===============================
    // EXCEL EXPORT
    // ===============================

    if (type === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Report");

      if (formattedData.length > 0) {
        sheet.columns = Object.keys(formattedData[0]).map(key => ({
          header: key,
          key: key,
          width: 20
        }));

        sheet.addRows(formattedData);
      }

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${report}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    res.status(400).json({ msg: "Invalid export type" });

  } catch (err) {
    console.error("EXPORT ERROR:", err);
    res.status(500).json({ msg: "Export failed" });
  }
});

module.exports = router;