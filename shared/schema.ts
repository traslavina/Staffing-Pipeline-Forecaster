import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp, boolean, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  region: text("region").notNull(),
  status: text("status").notNull().default("planned"),
  openDate: text("open_date"),
  storeType: text("store_type").notNull().default("standard"),
  lat: real("lat"),
  lng: real("lng"),
  targetHeadcount: integer("target_headcount").notNull().default(25),
  currentHeadcount: integer("current_headcount").notNull().default(0),
});

export const positions = pgTable("positions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  level: text("level").notNull(),
  trainingWeeks: integer("training_weeks").notNull().default(2),
  isLeadership: boolean("is_leadership").notNull().default(false),
  headcountPerStore: integer("headcount_per_store").notNull().default(1),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  storeId: integer("store_id"),
  positionId: integer("position_id"),
  hireDate: text("hire_date").notNull(),
  status: text("status").notNull().default("active"),
  readyForPromotion: boolean("ready_for_promotion").notNull().default(false),
  benchStatus: text("bench_status").default("not_ready"),
  performanceRating: integer("performance_rating").default(3),
});

export const hiringPipeline = pgTable("hiring_pipeline", {
  id: serial("id").primaryKey(),
  positionId: integer("position_id").notNull(),
  targetStoreId: integer("target_store_id").notNull(),
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email"),
  stage: text("stage").notNull().default("applied"),
  source: text("source").notNull().default("external"),
  applicationDate: text("application_date").notNull(),
  expectedStartDate: text("expected_start_date"),
  notes: text("notes"),
});

export const attritionRecords = pgTable("attrition_records", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull(),
  positionId: integer("position_id").notNull(),
  employeeName: text("employee_name").notNull(),
  departureDate: text("departure_date").notNull(),
  reason: text("reason").notNull(),
  backfillStatus: text("backfill_status").notNull().default("open"),
  backfillEmployeeId: integer("backfill_employee_id"),
});

export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  storeCount: integer("store_count").default(1),
  category: text("category").notNull().default("direct"),
});

export const insertStoreSchema = createInsertSchema(stores).omit({ id: true });
export const insertPositionSchema = createInsertSchema(positions).omit({ id: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true });
export const insertHiringPipelineSchema = createInsertSchema(hiringPipeline).omit({ id: true });
export const insertAttritionRecordSchema = createInsertSchema(attritionRecords).omit({ id: true });
export const insertCompetitorSchema = createInsertSchema(competitors).omit({ id: true });

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Position = typeof positions.$inferSelect;
export type InsertPosition = z.infer<typeof insertPositionSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type HiringPipelineEntry = typeof hiringPipeline.$inferSelect;
export type InsertHiringPipelineEntry = z.infer<typeof insertHiringPipelineSchema>;
export type AttritionRecord = typeof attritionRecords.$inferSelect;
export type InsertAttritionRecord = z.infer<typeof insertAttritionRecordSchema>;
export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
