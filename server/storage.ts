import {
  type Store, type InsertStore,
  type Position, type InsertPosition,
  type Employee, type InsertEmployee,
  type HiringPipelineEntry, type InsertHiringPipelineEntry,
  type AttritionRecord, type InsertAttritionRecord,
  type Competitor, type InsertCompetitor,
  type User, type InsertUser,
  stores, positions, employees, hiringPipeline, attritionRecords, competitors, users,
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: number): Promise<void>;

  getPositions(): Promise<Position[]>;
  getPosition(id: number): Promise<Position | undefined>;
  createPosition(position: InsertPosition): Promise<Position>;
  updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined>;
  deletePosition(id: number): Promise<void>;

  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeesByStore(storeId: number): Promise<Employee[]>;
  getBenchEmployees(): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<void>;

  getHiringPipeline(): Promise<HiringPipelineEntry[]>;
  getHiringPipelineByStore(storeId: number): Promise<HiringPipelineEntry[]>;
  createHiringPipelineEntry(entry: InsertHiringPipelineEntry): Promise<HiringPipelineEntry>;
  updateHiringPipelineEntry(id: number, entry: Partial<InsertHiringPipelineEntry>): Promise<HiringPipelineEntry | undefined>;
  deleteHiringPipelineEntry(id: number): Promise<void>;

  getAttritionRecords(): Promise<AttritionRecord[]>;
  getAttritionByStore(storeId: number): Promise<AttritionRecord[]>;
  createAttritionRecord(record: InsertAttritionRecord): Promise<AttritionRecord>;
  updateAttritionRecord(id: number, record: Partial<InsertAttritionRecord>): Promise<AttritionRecord | undefined>;
  deleteAttritionRecord(id: number): Promise<void>;

  getCompetitors(): Promise<Competitor[]>;
  createCompetitor(competitor: InsertCompetitor): Promise<Competitor>;
  updateCompetitor(id: number, competitor: Partial<InsertCompetitor>): Promise<Competitor | undefined>;
  deleteCompetitor(id: number): Promise<void>;

  getDashboardStats(): Promise<{
    totalStores: number;
    plannedStores: number;
    openStores: number;
    totalEmployees: number;
    openPositions: number;
    benchReady: number;
    pipelineCandidates: number;
    attritionRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getStores(): Promise<Store[]> {
    return db.select().from(stores);
  }
  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }
  async createStore(store: InsertStore): Promise<Store> {
    const [created] = await db.insert(stores).values(store).returning();
    return created;
  }
  async updateStore(id: number, store: Partial<InsertStore>): Promise<Store | undefined> {
    const [updated] = await db.update(stores).set(store).where(eq(stores.id, id)).returning();
    return updated;
  }
  async deleteStore(id: number): Promise<void> {
    await db.delete(stores).where(eq(stores.id, id));
  }

  async getPositions(): Promise<Position[]> {
    return db.select().from(positions);
  }
  async getPosition(id: number): Promise<Position | undefined> {
    const [position] = await db.select().from(positions).where(eq(positions.id, id));
    return position;
  }
  async createPosition(position: InsertPosition): Promise<Position> {
    const [created] = await db.insert(positions).values(position).returning();
    return created;
  }
  async updatePosition(id: number, position: Partial<InsertPosition>): Promise<Position | undefined> {
    const [updated] = await db.update(positions).set(position).where(eq(positions.id, id)).returning();
    return updated;
  }
  async deletePosition(id: number): Promise<void> {
    await db.delete(positions).where(eq(positions.id, id));
  }

  async getEmployees(): Promise<Employee[]> {
    return db.select().from(employees);
  }
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee;
  }
  async getEmployeesByStore(storeId: number): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.storeId, storeId));
  }
  async getBenchEmployees(): Promise<Employee[]> {
    return db.select().from(employees).where(eq(employees.readyForPromotion, true));
  }
  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(employee).returning();
    return created;
  }
  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updated] = await db.update(employees).set(employee).where(eq(employees.id, id)).returning();
    return updated;
  }
  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  async getHiringPipeline(): Promise<HiringPipelineEntry[]> {
    return db.select().from(hiringPipeline);
  }
  async getHiringPipelineByStore(storeId: number): Promise<HiringPipelineEntry[]> {
    return db.select().from(hiringPipeline).where(eq(hiringPipeline.targetStoreId, storeId));
  }
  async createHiringPipelineEntry(entry: InsertHiringPipelineEntry): Promise<HiringPipelineEntry> {
    const [created] = await db.insert(hiringPipeline).values(entry).returning();
    return created;
  }
  async updateHiringPipelineEntry(id: number, entry: Partial<InsertHiringPipelineEntry>): Promise<HiringPipelineEntry | undefined> {
    const [updated] = await db.update(hiringPipeline).set(entry).where(eq(hiringPipeline.id, id)).returning();
    return updated;
  }
  async deleteHiringPipelineEntry(id: number): Promise<void> {
    await db.delete(hiringPipeline).where(eq(hiringPipeline.id, id));
  }

  async getAttritionRecords(): Promise<AttritionRecord[]> {
    return db.select().from(attritionRecords);
  }
  async getAttritionByStore(storeId: number): Promise<AttritionRecord[]> {
    return db.select().from(attritionRecords).where(eq(attritionRecords.storeId, storeId));
  }
  async createAttritionRecord(record: InsertAttritionRecord): Promise<AttritionRecord> {
    const [created] = await db.insert(attritionRecords).values(record).returning();
    return created;
  }
  async updateAttritionRecord(id: number, record: Partial<InsertAttritionRecord>): Promise<AttritionRecord | undefined> {
    const [updated] = await db.update(attritionRecords).set(record).where(eq(attritionRecords.id, id)).returning();
    return updated;
  }
  async deleteAttritionRecord(id: number): Promise<void> {
    await db.delete(attritionRecords).where(eq(attritionRecords.id, id));
  }

  async getCompetitors(): Promise<Competitor[]> {
    return db.select().from(competitors);
  }
  async createCompetitor(competitor: InsertCompetitor): Promise<Competitor> {
    const [created] = await db.insert(competitors).values(competitor).returning();
    return created;
  }
  async updateCompetitor(id: number, competitor: Partial<InsertCompetitor>): Promise<Competitor | undefined> {
    const [updated] = await db.update(competitors).set(competitor).where(eq(competitors.id, id)).returning();
    return updated;
  }
  async deleteCompetitor(id: number): Promise<void> {
    await db.delete(competitors).where(eq(competitors.id, id));
  }

  async getDashboardStats() {
    const allStores = await this.getStores();
    const allEmployees = await this.getEmployees();
    const allPipeline = await this.getHiringPipeline();
    const allAttrition = await this.getAttritionRecords();
    const benchReady = await this.getBenchEmployees();
    const allPositions = await this.getPositions();

    const totalStores = allStores.length;
    const plannedStores = allStores.filter(s => s.status === "planned" || s.status === "under_construction").length;
    const openStores = allStores.filter(s => s.status === "open").length;
    const totalEmployees = allEmployees.filter(e => e.status === "active").length;

    const totalNeeded = allStores.reduce((sum, s) => sum + s.targetHeadcount, 0);
    const openPositions = totalNeeded - totalEmployees;

    const activeEmployees = allEmployees.filter(e => e.status === "active").length;
    const departed = allAttrition.length;
    const attritionRate = activeEmployees > 0 ? Math.round((departed / (activeEmployees + departed)) * 100) : 0;

    return {
      totalStores,
      plannedStores,
      openStores,
      totalEmployees,
      openPositions: Math.max(0, openPositions),
      benchReady: benchReady.length,
      pipelineCandidates: allPipeline.length,
      attritionRate,
    };
  }
}

export const storage = new DatabaseStorage();
