import type { Express } from "express";
import { createServer, type Server } from "http";
import archiver from "archiver";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import {
  insertStoreSchema, insertPositionSchema, insertEmployeeSchema,
  insertHiringPipelineSchema, insertAttritionRecordSchema, insertCompetitorSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  app.get("/api/dashboard", async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get("/api/stores", async (_req, res) => {
    const data = await storage.getStores();
    res.json(data);
  });
  app.get("/api/stores/:id", async (req, res) => {
    const store = await storage.getStore(Number(req.params.id));
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  });
  app.post("/api/stores", async (req, res) => {
    const parsed = insertStoreSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const store = await storage.createStore(parsed.data);
    res.status(201).json(store);
  });
  app.patch("/api/stores/:id", async (req, res) => {
    const store = await storage.updateStore(Number(req.params.id), req.body);
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  });
  app.delete("/api/stores/:id", async (req, res) => {
    await storage.deleteStore(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/positions", async (_req, res) => {
    const data = await storage.getPositions();
    res.json(data);
  });
  app.post("/api/positions", async (req, res) => {
    const parsed = insertPositionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const pos = await storage.createPosition(parsed.data);
    res.status(201).json(pos);
  });
  app.patch("/api/positions/:id", async (req, res) => {
    const pos = await storage.updatePosition(Number(req.params.id), req.body);
    if (!pos) return res.status(404).json({ message: "Position not found" });
    res.json(pos);
  });
  app.delete("/api/positions/:id", async (req, res) => {
    await storage.deletePosition(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/employees", async (_req, res) => {
    const data = await storage.getEmployees();
    res.json(data);
  });
  app.get("/api/employees/bench", async (_req, res) => {
    const data = await storage.getBenchEmployees();
    res.json(data);
  });
  app.get("/api/employees/store/:storeId", async (req, res) => {
    const data = await storage.getEmployeesByStore(Number(req.params.storeId));
    res.json(data);
  });
  app.post("/api/employees", async (req, res) => {
    const parsed = insertEmployeeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const emp = await storage.createEmployee(parsed.data);
    res.status(201).json(emp);
  });
  app.patch("/api/employees/:id", async (req, res) => {
    const emp = await storage.updateEmployee(Number(req.params.id), req.body);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    res.json(emp);
  });
  app.delete("/api/employees/:id", async (req, res) => {
    await storage.deleteEmployee(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/pipeline", async (_req, res) => {
    const data = await storage.getHiringPipeline();
    res.json(data);
  });
  app.get("/api/pipeline/store/:storeId", async (req, res) => {
    const data = await storage.getHiringPipelineByStore(Number(req.params.storeId));
    res.json(data);
  });
  app.post("/api/pipeline", async (req, res) => {
    const parsed = insertHiringPipelineSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const entry = await storage.createHiringPipelineEntry(parsed.data);
    res.status(201).json(entry);
  });
  app.patch("/api/pipeline/:id", async (req, res) => {
    const entry = await storage.updateHiringPipelineEntry(Number(req.params.id), req.body);
    if (!entry) return res.status(404).json({ message: "Pipeline entry not found" });
    res.json(entry);
  });
  app.delete("/api/pipeline/:id", async (req, res) => {
    await storage.deleteHiringPipelineEntry(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/attrition", async (_req, res) => {
    const data = await storage.getAttritionRecords();
    res.json(data);
  });
  app.get("/api/attrition/store/:storeId", async (req, res) => {
    const data = await storage.getAttritionByStore(Number(req.params.storeId));
    res.json(data);
  });
  app.post("/api/attrition", async (req, res) => {
    const parsed = insertAttritionRecordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const record = await storage.createAttritionRecord(parsed.data);
    res.status(201).json(record);
  });
  app.patch("/api/attrition/:id", async (req, res) => {
    const record = await storage.updateAttritionRecord(Number(req.params.id), req.body);
    if (!record) return res.status(404).json({ message: "Attrition record not found" });
    res.json(record);
  });
  app.delete("/api/attrition/:id", async (req, res) => {
    await storage.deleteAttritionRecord(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/competitors", async (_req, res) => {
    const data = await storage.getCompetitors();
    res.json(data);
  });
  app.post("/api/competitors", async (req, res) => {
    const parsed = insertCompetitorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const comp = await storage.createCompetitor(parsed.data);
    res.status(201).json(comp);
  });
  app.delete("/api/competitors/:id", async (req, res) => {
    await storage.deleteCompetitor(Number(req.params.id));
    res.status(204).send();
  });

  app.get("/api/forecast", async (_req, res) => {
    const allStores = await storage.getStores();
    const allPositions = await storage.getPositions();
    const allEmployees = await storage.getEmployees();
    const benchReady = await storage.getBenchEmployees();
    const allAttrition = await storage.getAttritionRecords();

    const plannedStores = allStores.filter(s => s.status === "planned" || s.status === "under_construction");
    const activeEmployees = allEmployees.filter(e => e.status === "active").length;
    const totalAttrition = allAttrition.length;
    const annualAttritionRate = activeEmployees > 0 ? (totalAttrition / (activeEmployees + totalAttrition)) : 0.15;

    const timeline: Record<string, any>[] = [];
    const monthsMap: Record<string, { stores: string[]; hires: number; benchNeeded: number; externalNeeded: number; trainingSlots: number }> = {};

    for (const store of plannedStores) {
      const month = store.openDate ? store.openDate.substring(0, 7) : "TBD";
      if (!monthsMap[month]) {
        monthsMap[month] = { stores: [], hires: 0, benchNeeded: 0, externalNeeded: 0, trainingSlots: 0 };
      }
      monthsMap[month].stores.push(store.name);
      const needed = store.targetHeadcount;
      monthsMap[month].hires += needed;

      const leadershipNeeded = allPositions.filter(p => p.isLeadership).reduce((s, p) => s + p.headcountPerStore, 0);
      const availableBench = Math.min(benchReady.length, Math.ceil(leadershipNeeded * 0.6));
      monthsMap[month].benchNeeded += availableBench;
      monthsMap[month].externalNeeded += (needed - availableBench);

      const totalHeadcountPerStore = allPositions.reduce((s, p) => s + p.headcountPerStore, 0);
      const avgTraining = totalHeadcountPerStore > 0
        ? allPositions.reduce((s, p) => s + p.trainingWeeks * p.headcountPerStore, 0) / totalHeadcountPerStore
        : 2;
      monthsMap[month].trainingSlots += Math.ceil(needed * avgTraining);
    }

    const sortedMonths = Object.keys(monthsMap).sort();
    let cumulativeHires = 0;
    let cumulativeStores = allStores.filter(s => s.status === "open").length;
    for (const month of sortedMonths) {
      const data = monthsMap[month];
      cumulativeHires += data.hires;
      cumulativeStores += data.stores.length;
      const projectedAttrition = Math.round(cumulativeHires * annualAttritionRate / 12);
      timeline.push({
        month,
        newStores: data.stores,
        newStoreCount: data.stores.length,
        hiresNeeded: data.hires,
        fromBench: data.benchNeeded,
        externalHires: data.externalNeeded,
        trainingWeeksNeeded: data.trainingSlots,
        projectedAttritionBackfills: projectedAttrition,
        totalHiresIncludingBackfills: data.hires + projectedAttrition,
        cumulativeStores,
        cumulativeNewHires: cumulativeHires,
      });
    }

    const totalHPC = allPositions.reduce((s, p) => s + p.headcountPerStore, 0);
    const avgTW = totalHPC > 0
      ? Math.round(allPositions.reduce((s, p) => s + p.trainingWeeks * p.headcountPerStore, 0) / totalHPC)
      : 2;

    res.json({
      summary: {
        totalNewStores: plannedStores.length,
        totalNewHiresNeeded: plannedStores.reduce((s, st) => s + st.targetHeadcount, 0),
        benchAvailable: benchReady.length,
        annualAttritionRate: Math.round(annualAttritionRate * 100),
        averageTrainingWeeks: avgTW,
      },
      timeline,
    });
  });

  app.get("/api/download/playbooks", async (_req, res) => {
    const allStores = await storage.getStores();
    const allPositions = await storage.getPositions();
    const allEmployees = await storage.getEmployees();
    const allPipeline = await storage.getHiringPipeline();
    const allAttrition = await storage.getAttritionRecords();
    const allCompetitors = await storage.getCompetitors();
    const benchReady = await storage.getBenchEmployees();

    const today = new Date();
    const plannedStores = allStores.filter(s => s.status !== "open");
    const activeEmployees = allEmployees.filter(e => e.status === "active");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=StaffCast_Playbooks.zip");

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    const summaryLines = [
      "STAFFCAST — EXPANSION SUMMARY",
      "=" .repeat(50),
      `Generated: ${today.toISOString().split("T")[0]}`,
      `Total Stores: ${allStores.length} (${allStores.filter(s => s.status === "open").length} open, ${plannedStores.length} planned/under construction)`,
      `Active Employees: ${activeEmployees.length}`,
      `Bench-Ready Employees: ${benchReady.length}`,
      `Pipeline Candidates: ${allPipeline.length}`,
      `Attrition Records: ${allAttrition.length}`,
      `Competitor Locations Tracked: ${allCompetitors.length}`,
      "",
      "OPENING SCHEDULE",
      "-".repeat(50),
    ];
    for (const store of plannedStores.sort((a, b) => (a.openDate || "").localeCompare(b.openDate || ""))) {
      summaryLines.push(`  ${store.openDate || "TBD"}  ${store.name} — ${store.city}, ${store.state} (target: ${store.targetHeadcount} staff)`);
    }
    summaryLines.push("", "POSITIONS PER STORE", "-".repeat(50));
    for (const pos of allPositions) {
      summaryLines.push(`  ${pos.title} (${pos.department}) — ${pos.headcountPerStore} per store, ${pos.trainingWeeks}wk training${pos.isLeadership ? " [Leadership]" : ""}`);
    }
    archive.append(summaryLines.join("\n"), { name: "00_Expansion_Summary.txt" });

    for (const store of plannedStores.sort((a, b) => (a.openDate || "").localeCompare(b.openDate || ""))) {
      const openDate = store.openDate ? new Date(store.openDate) : new Date(today.getTime() + 365 * 86400000);
      const daysUntilOpen = Math.ceil((openDate.getTime() - today.getTime()) / 86400000);
      const weeksUntilOpen = Math.ceil(daysUntilOpen / 7);

      const storeEmployees = allEmployees.filter(e => e.storeId === store.id && e.status === "active");
      const storePipeline = allPipeline.filter(p => p.targetStoreId === store.id && p.stage !== "rejected");

      const posBreakdown = allPositions.map(pos => {
        const filled = storeEmployees.filter(e => e.positionId === pos.id).length;
        const inPipe = storePipeline.filter(p => p.positionId === pos.id).length;
        return { title: pos.title, needed: pos.headcountPerStore, filled, inPipeline: inPipe, gap: Math.max(0, pos.headcountPerStore - filled - inPipe), trainingWeeks: pos.trainingWeeks, isLeadership: pos.isLeadership };
      });

      const totalNeeded = posBreakdown.reduce((s, p) => s + p.needed, 0);
      const totalFilled = posBreakdown.reduce((s, p) => s + p.filled, 0);
      const staffingPct = totalNeeded > 0 ? Math.round((totalFilled / totalNeeded) * 100) : 0;

      const lines: string[] = [
        `STORE OPENING PLAYBOOK: ${store.name}`,
        "=".repeat(60),
        "",
        "STORE DETAILS",
        "-".repeat(40),
        `  Name:            ${store.name}`,
        `  Type:            ${store.storeType}`,
        `  Address:         ${store.address}`,
        `  City/State:      ${store.city}, ${store.state}`,
        `  Region:          ${store.region}`,
        `  Status:          ${store.status}`,
        `  Open Date:       ${store.openDate || "TBD"}`,
        `  Days Until Open: ${daysUntilOpen <= 0 ? "PAST DUE" : daysUntilOpen}`,
        `  Weeks Until Open:${weeksUntilOpen <= 0 ? " PAST DUE" : " " + weeksUntilOpen}`,
        `  Target Headcount:${store.targetHeadcount}`,
        `  Current Staff:   ${totalFilled}`,
        `  Staffing:        ${staffingPct}%`,
        "",
        "POSITION BREAKDOWN",
        "-".repeat(40),
        `  ${"Position".padEnd(28)} Needed  Filled  Pipeline  Gap  Training`,
        `  ${"-".repeat(28)} ------  ------  --------  ---  --------`,
      ];

      for (const p of posBreakdown) {
        const label = p.isLeadership ? `${p.title} *` : p.title;
        lines.push(`  ${label.padEnd(28)} ${String(p.needed).padStart(6)}  ${String(p.filled).padStart(6)}  ${String(p.inPipeline).padStart(8)}  ${String(p.gap).padStart(3)}  ${p.trainingWeeks}wk`);
      }
      lines.push(`  (* = Leadership role)`);
      lines.push(`  ${"TOTAL".padEnd(28)} ${String(totalNeeded).padStart(6)}  ${String(totalFilled).padStart(6)}  ${String(storePipeline.length).padStart(8)}  ${String(posBreakdown.reduce((s, p) => s + p.gap, 0)).padStart(3)}`);

      lines.push("", "PREPARATION TIMELINE", "-".repeat(40));

      const phases = [
        { name: "Phase 1: Site Planning & Leadership Hiring", weeksOut: 24, duration: 8,
          tasks: ["Hire Store Manager", "Hire Assistant Store Managers", "Finalize store layout & permits", "Secure vendor contracts"] },
        { name: "Phase 2: Leadership Onboarding & Dept Lead Hiring", weeksOut: 16, duration: 6,
          tasks: ["Begin leadership training program (8 weeks)", "Hire Department Leads", "Identify bench transfer candidates", "Set up store management systems"] },
        { name: "Phase 3: Mass Hiring & Pipeline Activation", weeksOut: 10, duration: 6,
          tasks: ["Post all open positions", "Fill frontline roles (Sales, Cashiers, Stock)", "Schedule and conduct interview days", "Process background checks & onboarding paperwork"] },
        { name: "Phase 4: Team Training & Store Setup", weeksOut: 4, duration: 3,
          tasks: ["Run frontline training (1-2 weeks)", "POS & systems setup", "Inventory stocking & merchandising", "Establish shift schedules"] },
        { name: "Phase 5: Soft Launch & Grand Opening", weeksOut: 1, duration: 3,
          tasks: ["Staffing readiness check", "Soft opening (3 days, limited hours)", "Grand opening event", "Post-opening performance review (week 2)"] },
      ];

      for (const phase of phases) {
        const startDate = new Date(openDate.getTime() - phase.weeksOut * 7 * 86400000);
        const endDate = new Date(startDate.getTime() + phase.duration * 7 * 86400000);
        const status = today > endDate ? "COMPLETED" : today >= startDate ? "IN PROGRESS" : "UPCOMING";
        lines.push("");
        lines.push(`  ${phase.name}`);
        lines.push(`    Timeline: ${startDate.toISOString().split("T")[0]} → ${endDate.toISOString().split("T")[0]} (${phase.duration} weeks)`);
        lines.push(`    Status:   ${status}`);
        lines.push(`    Tasks:`);
        for (const task of phase.tasks) {
          const check = status === "COMPLETED" ? "[x]" : "[ ]";
          lines.push(`      ${check} ${task}`);
        }
      }

      lines.push("", "TRAINING SCHEDULE", "-".repeat(40));
      lines.push("  Leadership (start first — hire earliest):");
      for (const p of posBreakdown.filter(x => x.isLeadership)) {
        const startWeek = p.trainingWeeks + 2;
        lines.push(`    ${p.title}: ${p.trainingWeeks} weeks training → start ${startWeek} weeks before opening`);
      }
      lines.push("  Frontline:");
      for (const p of posBreakdown.filter(x => !x.isLeadership)) {
        const startWeek = p.trainingWeeks + 1;
        lines.push(`    ${p.title}: ${p.trainingWeeks} week(s) training → start ${startWeek} weeks before opening`);
      }

      if (storePipeline.length > 0) {
        lines.push("", "CURRENT PIPELINE CANDIDATES", "-".repeat(40));
        lines.push(`  ${"Candidate".padEnd(25)} ${"Position".padEnd(22)} ${"Stage".padEnd(12)} Source`);
        lines.push(`  ${"-".repeat(25)} ${"-".repeat(22)} ${"-".repeat(12)} ------`);
        for (const cand of storePipeline) {
          const posName = allPositions.find(p => p.id === cand.positionId)?.title || "Unknown";
          lines.push(`  ${cand.candidateName.padEnd(25)} ${posName.padEnd(22)} ${cand.stage.padEnd(12)} ${cand.source}`);
        }
      }

      if (storeEmployees.length > 0) {
        lines.push("", "CURRENT EMPLOYEES", "-".repeat(40));
        lines.push(`  ${"Name".padEnd(25)} ${"Position".padEnd(22)} ${"Bench".padEnd(12)} Rating`);
        lines.push(`  ${"-".repeat(25)} ${"-".repeat(22)} ${"-".repeat(12)} ------`);
        for (const emp of storeEmployees) {
          const posName = allPositions.find(p => p.id === emp.positionId)?.title || "Unknown";
          lines.push(`  ${(emp.firstName + " " + emp.lastName).padEnd(25)} ${posName.padEnd(22)} ${(emp.benchStatus || "n/a").padEnd(12)} ${emp.performanceRating}/5`);
        }
      }

      lines.push("", "=".repeat(60));
      lines.push(`Generated by StaffCast on ${today.toISOString().split("T")[0]}`);

      const safeFileName = store.name.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
      archive.append(lines.join("\n"), { name: `playbooks/${safeFileName}_Playbook.txt` });
    }

    const storesCsv = ["id,name,address,city,state,region,status,open_date,store_type,target_headcount,current_headcount"];
    for (const s of allStores) {
      storesCsv.push(`${s.id},"${s.name}","${s.address}","${s.city}","${s.state}","${s.region}","${s.status}","${s.openDate || ""}","${s.storeType}",${s.targetHeadcount},${s.currentHeadcount}`);
    }
    archive.append(storesCsv.join("\n"), { name: "data/stores.csv" });

    const empCsv = ["id,first_name,last_name,email,store_id,position_id,hire_date,status,bench_status,performance_rating"];
    for (const e of allEmployees) {
      empCsv.push(`${e.id},"${e.firstName}","${e.lastName}","${e.email}",${e.storeId},${e.positionId},"${e.hireDate}","${e.status}","${e.benchStatus}",${e.performanceRating}`);
    }
    archive.append(empCsv.join("\n"), { name: "data/employees.csv" });

    const pipeCsv = ["id,candidate_name,position_id,target_store_id,stage,source,application_date,expected_start_date"];
    for (const p of allPipeline) {
      pipeCsv.push(`${p.id},"${p.candidateName}",${p.positionId},${p.targetStoreId},"${p.stage}","${p.source}","${p.applicationDate}","${p.expectedStartDate || ""}"`);
    }
    archive.append(pipeCsv.join("\n"), { name: "data/pipeline.csv" });

    const attrCsv = ["id,store_id,position_id,employee_name,departure_date,reason,backfill_status"];
    for (const a of allAttrition) {
      attrCsv.push(`${a.id},${a.storeId},${a.positionId},"${a.employeeName}","${a.departureDate}","${a.reason}","${a.backfillStatus}"`);
    }
    archive.append(attrCsv.join("\n"), { name: "data/attrition.csv" });

    await archive.finalize();
  });

  return httpServer;
}
