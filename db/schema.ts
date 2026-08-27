import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  externalId: text("external_id").unique(),
  date: text("date").notNull(),
  merchant: text("merchant").notNull(),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull().default("Expense"),
  note: text("note").notNull().default(""),
  source: text("source").notNull().default("manual"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
export const budgetItems = sqliteTable("budget_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  month: text("month").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  plannedAmount: real("planned_amount").notNull(),
  isPaid: integer("is_paid", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
