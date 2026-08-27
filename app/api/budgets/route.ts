import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { budgetItems } from "../../../db/schema";

export async function GET() {
  return Response.json({
    budgets: await getDb().select().from(budgetItems).orderBy(desc(budgetItems.month), desc(budgetItems.id)),
  });
}
export async function POST(request: Request) {
  const p = (await request.json()) as { month?: string; name?: string; category?: string; plannedAmount?: number };
  if (!p.month || !p.name || !p.category || !Number(p.plannedAmount)) return Response.json({ error: "Complete every budget field" }, { status: 400 });
  const [budget] = await getDb().insert(budgetItems).values({ month: p.month.slice(0, 7), name: p.name.slice(0, 120), category: p.category.slice(0, 60), plannedAmount: Number(p.plannedAmount) }).returning();
  return Response.json({ budget }, { status: 201 });
}
export async function PATCH(request: Request) {
  const p = (await request.json()) as { id?: number; isPaid?: boolean };
  if (!p.id) return Response.json({ error: "Invalid budget item" }, { status: 400 });
  const [budget] = await getDb().update(budgetItems).set({ isPaid: Boolean(p.isPaid) }).where(eq(budgetItems.id, p.id)).returning();
  return Response.json({ budget });
}
export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Invalid budget item" }, { status: 400 });
  await getDb().delete(budgetItems).where(eq(budgetItems.id, id));
  return Response.json({ ok: true });
}
