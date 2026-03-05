import { db } from "./db";
import { stores, positions, employees, hiringPipeline, attritionRecords, competitors } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  const existingStores = await db.select().from(stores);
  if (existingStores.length > 0) return;

  await db.insert(positions).values([
    { title: "Store Manager", department: "Management", level: "senior", trainingWeeks: 8, isLeadership: true, headcountPerStore: 1 },
    { title: "Assistant Store Manager", department: "Management", level: "mid", trainingWeeks: 6, isLeadership: true, headcountPerStore: 2 },
    { title: "Department Lead", department: "Operations", level: "mid", trainingWeeks: 4, isLeadership: true, headcountPerStore: 4 },
    { title: "Sales Associate", department: "Sales", level: "entry", trainingWeeks: 2, isLeadership: false, headcountPerStore: 8 },
    { title: "Cashier", department: "Operations", level: "entry", trainingWeeks: 1, isLeadership: false, headcountPerStore: 4 },
    { title: "Stock Associate", department: "Warehouse", level: "entry", trainingWeeks: 1, isLeadership: false, headcountPerStore: 4 },
    { title: "Customer Service Rep", department: "Customer Service", level: "entry", trainingWeeks: 2, isLeadership: false, headcountPerStore: 2 },
  ]);

  const existingStoresData = [
    { name: "Downtown Flagship", address: "100 Main St", city: "Austin", state: "TX", region: "South", status: "open", openDate: "2022-03-15", storeType: "flagship", lat: 30.2672, lng: -97.7431, targetHeadcount: 30, currentHeadcount: 28 },
    { name: "Westlake Hills", address: "3600 Bee Cave Rd", city: "Austin", state: "TX", region: "South", status: "open", openDate: "2022-09-01", storeType: "standard", lat: 30.2960, lng: -97.8286, targetHeadcount: 25, currentHeadcount: 23 },
    { name: "Round Rock Center", address: "200 University Blvd", city: "Round Rock", state: "TX", region: "South", status: "open", openDate: "2023-01-10", storeType: "standard", lat: 30.5083, lng: -97.6789, targetHeadcount: 25, currentHeadcount: 24 },
    { name: "San Marcos Outlet", address: "3939 IH-35 S", city: "San Marcos", state: "TX", region: "South", status: "open", openDate: "2023-06-20", storeType: "outlet", lat: 29.8833, lng: -97.9414, targetHeadcount: 20, currentHeadcount: 19 },
    { name: "Cedar Park Plaza", address: "1890 Ranch Rd", city: "Cedar Park", state: "TX", region: "South", status: "open", openDate: "2024-02-14", storeType: "standard", lat: 30.5052, lng: -97.8203, targetHeadcount: 25, currentHeadcount: 22 },
  ];

  const plannedStoresData = [
    { name: "McKinney Town", address: "110 N Tennessee St", city: "McKinney", state: "TX", region: "South", status: "under_construction", openDate: "2026-03-15", storeType: "standard", lat: 33.1972, lng: -96.6150, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Frisco Square", address: "8980 Preston Rd", city: "Frisco", state: "TX", region: "South", status: "planned", openDate: "2026-03-25", storeType: "standard", lat: 33.1507, lng: -96.8236, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Plano Legacy", address: "5800 Legacy Dr", city: "Plano", state: "TX", region: "South", status: "planned", openDate: "2026-04-05", storeType: "flagship", lat: 33.0762, lng: -96.8289, targetHeadcount: 30, currentHeadcount: 0 },
    { name: "The Woodlands", address: "9595 Six Pines Dr", city: "The Woodlands", state: "TX", region: "South", status: "planned", openDate: "2026-04-15", storeType: "flagship", lat: 30.1658, lng: -95.4613, targetHeadcount: 30, currentHeadcount: 0 },
    { name: "Sugar Land Crossing", address: "2711 Town Center Blvd", city: "Sugar Land", state: "TX", region: "South", status: "planned", openDate: "2026-04-25", storeType: "standard", lat: 29.5966, lng: -95.6198, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Katy Mills Area", address: "5000 Katy Mills Cir", city: "Katy", state: "TX", region: "South", status: "planned", openDate: "2026-05-05", storeType: "outlet", lat: 29.7784, lng: -95.8124, targetHeadcount: 20, currentHeadcount: 0 },
    { name: "Pearland Town Center", address: "11200 Broadway St", city: "Pearland", state: "TX", region: "South", status: "planned", openDate: "2026-05-15", storeType: "standard", lat: 29.5635, lng: -95.2860, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Denton Square", address: "100 W Hickory St", city: "Denton", state: "TX", region: "South", status: "planned", openDate: "2026-05-25", storeType: "standard", lat: 33.2148, lng: -97.1331, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Southlake Town Sq", address: "1256 Main St", city: "Southlake", state: "TX", region: "South", status: "planned", openDate: "2026-06-05", storeType: "standard", lat: 32.9412, lng: -97.1342, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Allen Premium", address: "820 W Stacy Rd", city: "Allen", state: "TX", region: "South", status: "planned", openDate: "2026-06-15", storeType: "outlet", lat: 33.1032, lng: -96.6753, targetHeadcount: 20, currentHeadcount: 0 },
    { name: "Flower Mound", address: "6101 Long Prairie Rd", city: "Flower Mound", state: "TX", region: "South", status: "planned", openDate: "2026-06-25", storeType: "standard", lat: 33.0357, lng: -97.0700, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Grapevine Mills", address: "3000 Grapevine Mills Pkwy", city: "Grapevine", state: "TX", region: "South", status: "planned", openDate: "2026-07-05", storeType: "outlet", lat: 32.9343, lng: -97.0553, targetHeadcount: 20, currentHeadcount: 0 },
    { name: "Leander Gateway", address: "1395 US-183", city: "Leander", state: "TX", region: "South", status: "planned", openDate: "2026-07-15", storeType: "standard", lat: 30.5788, lng: -97.8531, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Georgetown Square", address: "501 S Main St", city: "Georgetown", state: "TX", region: "South", status: "planned", openDate: "2026-07-25", storeType: "standard", lat: 30.6327, lng: -97.6778, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "New Braunfels Market", address: "651 N Business IH-35", city: "New Braunfels", state: "TX", region: "South", status: "planned", openDate: "2026-08-05", storeType: "standard", lat: 29.7030, lng: -98.1245, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Conroe Town Center", address: "3069 I-45 N", city: "Conroe", state: "TX", region: "South", status: "planned", openDate: "2026-08-15", storeType: "standard", lat: 30.3119, lng: -95.4561, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Mansfield Crossing", address: "987 US-287", city: "Mansfield", state: "TX", region: "South", status: "planned", openDate: "2026-08-25", storeType: "standard", lat: 32.5632, lng: -97.1417, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Pflugerville Stone Hill", address: "18901 Limestone Commercial Dr", city: "Pflugerville", state: "TX", region: "South", status: "planned", openDate: "2026-09-05", storeType: "standard", lat: 30.4394, lng: -97.6200, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Waco Marketplace", address: "2812 W Loop 340", city: "Waco", state: "TX", region: "South", status: "planned", openDate: "2026-09-15", storeType: "standard", lat: 31.5494, lng: -97.1467, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Temple Mall", address: "3111 S 31st St", city: "Temple", state: "TX", region: "South", status: "planned", openDate: "2026-09-25", storeType: "standard", lat: 31.0572, lng: -97.3428, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Killeen Fort Hood", address: "2100 S WS Young Dr", city: "Killeen", state: "TX", region: "South", status: "planned", openDate: "2026-10-05", storeType: "standard", lat: 31.1171, lng: -97.7278, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "College Station", address: "1500 Harvey Rd", city: "College Station", state: "TX", region: "South", status: "planned", openDate: "2026-10-15", storeType: "standard", lat: 30.6280, lng: -96.3344, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Corpus Christi Bay", address: "5858 S Padre Island Dr", city: "Corpus Christi", state: "TX", region: "South", status: "planned", openDate: "2026-10-25", storeType: "standard", lat: 27.7006, lng: -97.3264, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Laredo Gateway", address: "5300 San Dario Ave", city: "Laredo", state: "TX", region: "South", status: "planned", openDate: "2026-11-05", storeType: "standard", lat: 27.5306, lng: -99.4803, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "McAllen Plaza", address: "7400 N 10th St", city: "McAllen", state: "TX", region: "South", status: "planned", openDate: "2026-11-15", storeType: "standard", lat: 26.2460, lng: -98.2390, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Brownsville Gateway", address: "2370 N Expressway 77", city: "Brownsville", state: "TX", region: "South", status: "planned", openDate: "2026-11-25", storeType: "standard", lat: 25.9475, lng: -97.4919, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "El Paso Cielo Vista", address: "8401 Gateway Blvd W", city: "El Paso", state: "TX", region: "West", status: "planned", openDate: "2026-12-01", storeType: "standard", lat: 31.7783, lng: -106.3812, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Midland Loop", address: "4511 N Midkiff Rd", city: "Midland", state: "TX", region: "West", status: "planned", openDate: "2026-12-05", storeType: "standard", lat: 31.9973, lng: -102.0779, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Odessa Crossroads", address: "4101 E 42nd St", city: "Odessa", state: "TX", region: "West", status: "planned", openDate: "2026-12-10", storeType: "standard", lat: 31.8456, lng: -102.3676, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Lubbock South Plains", address: "6002 Slide Rd", city: "Lubbock", state: "TX", region: "West", status: "planned", openDate: "2026-12-14", storeType: "standard", lat: 33.5779, lng: -101.8552, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Amarillo Westgate", address: "7701 W Interstate 40", city: "Amarillo", state: "TX", region: "West", status: "planned", openDate: "2026-12-17", storeType: "standard", lat: 35.1992, lng: -101.8313, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Tyler Broadway", address: "4601 S Broadway Ave", city: "Tyler", state: "TX", region: "East", status: "planned", openDate: "2026-12-20", storeType: "standard", lat: 32.3013, lng: -95.2895, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Beaumont Gateway", address: "4155 Dowlen Rd", city: "Beaumont", state: "TX", region: "East", status: "planned", openDate: "2026-12-23", storeType: "standard", lat: 30.0802, lng: -94.1266, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "San Angelo Sunset", address: "4001 Sunset Dr", city: "San Angelo", state: "TX", region: "West", status: "planned", openDate: "2026-12-26", storeType: "standard", lat: 31.4638, lng: -100.4370, targetHeadcount: 25, currentHeadcount: 0 },
    { name: "Abilene Mall", address: "4310 Buffalo Gap Rd", city: "Abilene", state: "TX", region: "West", status: "planned", openDate: "2026-12-30", storeType: "standard", lat: 32.4117, lng: -99.7455, targetHeadcount: 25, currentHeadcount: 0 },
  ];

  await db.insert(stores).values([...existingStoresData, ...plannedStoresData]);

  const firstNames = ["James", "Maria", "Robert", "Patricia", "Michael", "Jennifer", "David", "Linda", "William", "Elizabeth", "Carlos", "Ana", "Daniel", "Sarah", "Marcus", "Emily", "Kevin", "Ashley", "Brandon", "Nicole", "Tyler", "Stephanie", "Jordan", "Rachel"];
  const lastNames = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Martinez", "Davis", "Rodriguez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White"];

  const employeesData = [];
  let empIndex = 0;
  for (let storeIdx = 0; storeIdx < 5; storeIdx++) {
    const storeId = storeIdx + 1;
    const headcount = existingStoresData[storeIdx].currentHeadcount;
    for (let e = 0; e < headcount; e++) {
      const fn = firstNames[empIndex % firstNames.length];
      const ln = lastNames[empIndex % lastNames.length];
      const posId = e === 0 ? 1 : e <= 2 ? 2 : e <= 6 ? 3 : e <= 14 ? 4 : e <= 18 ? 5 : e <= 22 ? 6 : 7;
      const benchReady = Math.random() > 0.7;
      employeesData.push({
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${empIndex}@company.com`,
        storeId,
        positionId: posId,
        hireDate: `202${Math.floor(Math.random() * 3) + 2}-0${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        status: "active",
        readyForPromotion: benchReady,
        benchStatus: benchReady ? "ready" : Math.random() > 0.5 ? "developing" : "not_ready",
        performanceRating: Math.floor(Math.random() * 3) + 3,
      });
      empIndex++;
    }
  }
  await db.insert(employees).values(employeesData);

  const stages = ["applied", "screening", "interview", "offer", "accepted"];
  const pipelineData = [];
  for (let i = 0; i < 18; i++) {
    const fn = firstNames[(i + 5) % firstNames.length];
    const ln = lastNames[(i + 3) % lastNames.length];
    pipelineData.push({
      positionId: Math.floor(Math.random() * 7) + 1,
      targetStoreId: Math.floor(Math.random() * 8) + 1,
      candidateName: `${fn} ${ln}`,
      candidateEmail: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@email.com`,
      stage: stages[Math.floor(Math.random() * stages.length)],
      source: Math.random() > 0.5 ? "external" : "internal_referral",
      applicationDate: `2026-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      expectedStartDate: `2026-0${Math.floor(Math.random() * 6) + 4}-01`,
      notes: null,
    });
  }
  await db.insert(hiringPipeline).values(pipelineData);

  const reasons = ["voluntary_resignation", "relocation", "career_change", "retirement", "termination", "better_opportunity"];
  const attritionData = [];
  for (let i = 0; i < 12; i++) {
    const fn = firstNames[(i + 10) % firstNames.length];
    const ln = lastNames[(i + 7) % lastNames.length];
    attritionData.push({
      storeId: Math.floor(Math.random() * 5) + 1,
      positionId: Math.floor(Math.random() * 7) + 1,
      employeeName: `${fn} ${ln}`,
      departureDate: `202${Math.floor(Math.random() * 2) + 4}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      backfillStatus: Math.random() > 0.4 ? "filled" : "open",
    });
  }
  await db.insert(attritionRecords).values(attritionData);

  await db.insert(competitors).values([
    { name: "Target", address: "1000 Nicollet Mall", city: "Austin", state: "TX", lat: 30.30, lng: -97.75, storeCount: 3, category: "direct" },
    { name: "Walmart", address: "702 E Ben White Blvd", city: "Austin", state: "TX", lat: 30.22, lng: -97.73, storeCount: 5, category: "direct" },
    { name: "Best Buy", address: "9607 Research Blvd", city: "Austin", state: "TX", lat: 30.39, lng: -97.75, storeCount: 2, category: "indirect" },
    { name: "Costco", address: "10401 Research Blvd", city: "Austin", state: "TX", lat: 30.40, lng: -97.76, storeCount: 2, category: "indirect" },
    { name: "Target", address: "6420 N Interstate Hwy 35", city: "Round Rock", state: "TX", lat: 30.52, lng: -97.66, storeCount: 1, category: "direct" },
    { name: "Walmart", address: "2701 S Interstate 35", city: "Round Rock", state: "TX", lat: 30.49, lng: -97.68, storeCount: 2, category: "direct" },
    { name: "Target", address: "2301 S Interstate 35", city: "San Marcos", state: "TX", lat: 29.86, lng: -97.93, storeCount: 1, category: "direct" },
    { name: "Walmart", address: "1015 Hwy 80", city: "San Marcos", state: "TX", lat: 29.90, lng: -97.94, storeCount: 1, category: "direct" },
    { name: "Target", address: "4211 S Hulen St", city: "Frisco", state: "TX", lat: 33.16, lng: -96.82, storeCount: 2, category: "direct" },
    { name: "Costco", address: "4901 Dallas Pkwy", city: "Plano", state: "TX", lat: 33.08, lng: -96.83, storeCount: 1, category: "indirect" },
  ]);
}
