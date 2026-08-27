import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { transactions } from "../../../db/schema";
const clean = (p: any) => ({
  externalId: p.externalId ? String(p.externalId).slice(0, 80) : null,
  date: String(p.date || "").slice(0, 10),
  merchant: String(p.merchant || "").slice(0, 160),
  amount: Number(p.amount),
  category: String(p.category || "Other").slice(0, 60),
  type: String(p.type || "Expense").slice(0, 30),
  note: String(p.note || "").slice(0, 300),
  source: String(p.source || "manual").slice(0, 30),
});
export async function GET() {
  try {
    return Response.json({
      transactions: await getDb()
        .select()
        .from(transactions)
        .orderBy(desc(transactions.date), desc(transactions.id))
        .limit(3000),
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Database error" },
      { status: 500 },
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as any,
      rows = (body.batch || [body])
        .map(clean)
        .filter((x: any) => x.date && x.merchant && x.amount > 0);
    if (!rows.length)
      return Response.json({ error: "No valid transactions" }, { status: 400 });
    return Response.json(
      {
        transactions: await getDb()
          .insert(transactions)
          .values(rows)
          .onConflictDoNothing({ target: transactions.externalId })
          .returning(),
      },
      { status: 201 },
    );
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 },
    );
  }
}
export async function DELETE(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "Invalid id" }, { status: 400 });
  await getDb().delete(transactions).where(eq(transactions.id, id));
  return Response.json({ ok: true });
}
