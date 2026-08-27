"use client";
import { useEffect, useMemo, useRef, useState } from "react";
type Tx = {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  type: string;
  note: string;
  source: string;
};
type ImportedTx = {
  date: string;
  merchant: string;
  amount: number;
  category: string;
  type: string;
  note: string;
  source: string;
  externalId?: string;
};
type Budget = { id: number; month: string; name: string; category: string; plannedAmount: number; isPaid: boolean };
const CATS = [
  "Rent",
  "School fees",
  "Household fees",
  "Fuel",
  "Groceries",
  "Dining",
  "Utilities",
  "Health",
  "Insurance",
  "Transport",
  "Loan repayment",
  "Personal support",
  "Other",
];
const COLORS: Record<string, string> = {
  Rent: "#7057c5",
  "School fees": "#df8d2f",
  "Household fees": "#41937a",
  Fuel: "#e35a37",
  Groceries: "#3487a9",
  Dining: "#c35d87",
  Utilities: "#6788c7",
  Health: "#54a25c",
  Insurance: "#8a6c55",
  Transport: "#9b7bc1",
  "Loan repayment": "#ba7550",
  "Personal support": "#7c8798",
  Other: "#899399",
};
const DEMO = [
  ["2026-06-01", "Monthly rent", 400000, "Rent"],
  ["2026-06-04", "Société Pétrolière", 30000, "Fuel"],
  ["2026-06-10", "Merez Petroleum", 40000, "Fuel"],
  ["2026-06-11", "Uno Petroleum", 50000, "Fuel"],
  ["2026-06-15", "Société Pétrolière", 70000, "Fuel"],
  ["2026-06-24", "Société Pétrolière", 70000, "Fuel"],
  ["2026-06-12", "Tina", 152000, "Groceries"],
  ["2026-06-18", "School term payment", 120000, "School fees"],
  ["2026-07-01", "Monthly rent", 400000, "Rent"],
  ["2026-07-09", "Société Pétrolière", 50000, "Fuel"],
  ["2026-07-14", "Source Oil", 30000, "Fuel"],
  ["2026-07-20", "Eagle Petrol", 70000, "Fuel"],
  ["2026-07-27", "Société Pétrolière", 100000, "Fuel"],
  ["2026-07-11", "Marianne", 138000, "Groceries"],
  ["2026-07-16", "Mokash loan", 109000, "Loan repayment"],
  ["2026-08-01", "Monthly rent", 400000, "Rent"],
  ["2026-08-02", "Hass Petroleum", 30000, "Fuel"],
  ["2026-08-08", "P & M Investment", 50000, "Fuel"],
  ["2026-08-12", "Société Pétrolière", 50000, "Fuel"],
  ["2026-08-18", "Eagle Petrol", 50000, "Fuel"],
  ["2026-08-24", "Société Pétrolière", 100000, "Fuel"],
  ["2026-08-15", "Mokash loan", 109000, "Loan repayment"],
  ["2026-08-20", "Tina", 145000, "Groceries"],
];
const rwf = (n: number) =>
  `${new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 }).format(n)} Rwf`;
function autoCat(name: string, amount: number) {
  const u = name.toUpperCase();
  if (/PETRO|FUEL|SOURCE OIL|P & M|MEREZ|HASS|EAGLE|UNO/.test(u)) return "Fuel";
  if (/TINA|MARIANNE|SUPERMARKET|GROCERY|POULTRY/.test(u)) return "Groceries";
  if (amount === 300000 || amount === 400000 || /RENT|ANDRE|ERIC/.test(u))
    return "Rent";
  if (/SCHOOL|TUITION/.test(u)) return "School fees";
  if (/WASAC|EUCL|ELECTRIC|WATER/.test(u)) return "Utilities";
  if (/MOKASH|LOAN/.test(u)) return "Loan repayment";
  if (/RESTAURANT|CAFE|COFFEE|BAKERY/.test(u)) return "Dining";
  if (/PHARM|HOSPITAL|CLINIC|HEALTH/.test(u)) return "Health";
  return "Other";
}
export default function Home() {
  const [items, setItems] = useState<Tx[]>([]),
    [loading, setLoading] = useState(true),
    [modal, setModal] = useState(false),
    [budgetOpen, setBudgetOpen] = useState(false),
    [budgets, setBudgets] = useState<Budget[]>([]),
    [importOpen, setImportOpen] = useState(false),
    [month, setMonth] = useState("All"),
    [category, setCategory] = useState("All"),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState("");
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    merchant: "",
    amount: "",
    category: "Groceries",
    type: "Expense",
    note: "",
  });
  const [budgetForm, setBudgetForm] = useState({ month: new Date().toISOString().slice(0, 7), name: "", category: "Rent", plannedAmount: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  async function refresh() {
    const [d, b] = await Promise.all([(await fetch("/api/transactions")).json(), (await fetch("/api/budgets")).json()]);
    setItems(d.transactions || []);
    setBudgets(b.budgets || []);
    setLoading(false);
  }
  async function addBudget(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/budgets", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...budgetForm, plannedAmount: Number(budgetForm.plannedAmount) }) });
    setBudgetOpen(false); setBudgetForm({ ...budgetForm, name: "", plannedAmount: "" }); refresh();
  }
  async function toggleBudget(id: number, isPaid: boolean) { await fetch("/api/budgets", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, isPaid }) }); refresh(); }
  async function removeBudget(id: number) { await fetch(`/api/budgets?id=${id}`, { method: "DELETE" }); refresh(); }
  useEffect(() => {
    refresh();
  }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
        source: "manual",
      }),
    });
    setModal(false);
    setForm({ ...form, merchant: "", amount: "", note: "" });
    refresh();
  }
  async function remove(id: number) {
    await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
    refresh();
  }
  async function loadDemo() {
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        batch: DEMO.map((x) => ({
          date: x[0],
          merchant: x[1],
          amount: x[2],
          category: x[3],
          type: "Expense",
          note: "Demo from MoMo analysis",
          source: "demo",
        })),
      }),
    });
    setStatus("Sample spending added");
    refresh();
  }
  function parseCsv(text: string) {
    const lines = text.trim().split(/\r?\n/),
      head = lines[0].split(",").map((x) => x.trim().toLowerCase());
    const get = (r: string[], names: string[]) => {
      const i = head.findIndex((h) => names.some((n) => h.includes(n)));
      return i >= 0 ? r[i]?.replace(/^"|"$/g, "").trim() : "";
    };
    return lines
      .slice(1)
      .map((line) => {
        const r = line.match(/("[^"]*"|[^,]+)/g) || [],
          merchant = get(r, [
            "merchant",
            "to",
            "recipient",
            "description",
            "name",
          ]),
          amount = Number(get(r, ["amount"]).replace(/[^0-9.-]/g, "")),
          date = get(r, ["date"]);
        return {
          date: date.slice(0, 10),
          merchant,
          amount,
          category: autoCat(merchant, amount),
          type: "Expense",
          note: "Imported from statement",
          source: "import",
        };
      })
      .filter((x) => x.date && x.merchant && x.amount > 0);
  }
  const canonicalMerchant = (raw: string) => {
    const u = raw.toUpperCase(),
      known: [RegExp, string][] = [
        [/(SOCIETE|SOCIÉTÉ) PETRO/, "Société Pétrolière"],
        [/EAGLE PETRO/, "Eagle Petroleum"],
        [/P AND M|P & M/, "P & M Investment"],
        [/HASS PETRO/, "Hass Petroleum"],
        [/SOURCE OIL/, "Source Oil"],
        [/MEREZ PETRO/, "Merez Petroleum"],
        [/UNO PETRO/, "Uno Petroleum"],
        [/SIMBA SUPERMARKET/, "Simba Supermarket"],
        [/MOKASH LOAN/, "Mokash Loan"],
        [/WASAC/, "WASAC"],
      ];
    for (const [k, v] of known) if (k.test(u)) return v;
    const words = raw
        .replace(/\b\d{5,}\b/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .split(" "),
      out: string[] = [];
    for (const w of words)
      if (out[out.length - 1]?.toUpperCase() !== w.toUpperCase()) out.push(w);
    return out.join(" ").slice(0, 120) || "Unknown recipient";
  };
  async function parsePdf(file: File): Promise<ImportedTx[]> {
    const pdfjs = await import("pdfjs-dist"),
      worker = await import("pdfjs-dist/build/pdf.worker.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const doc = await pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
      }).promise,
      rows: ImportedTx[] = [];
    for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
      const page = await doc.getPage(pageNo),
        content = await page.getTextContent(),
        items = (content.items as any[])
          .filter((x) => x.str?.trim())
          .map((x) => ({
            text: String(x.str).trim(),
            x: Number(x.transform[4]),
            y: Number(x.transform[5]),
          })),
        ids = items
          .filter((x) => /^\d{10,12}$/.test(x.text) && x.x < 90)
          .sort((a, b) => b.y - a.y);
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i],
          upper = i ? (ids[i - 1].y + id.y) / 2 : id.y + 32,
          lower = i < ids.length - 1 ? (id.y + ids[i + 1].y) / 2 : id.y - 34,
          block = items.filter((x) => x.y <= upper && x.y > lower),
          left = block
            .filter((x) => x.x >= 280 && x.x < 355)
            .map((x) => x.text)
            .join(" ");
        if (!left.includes("250781448848")) continue;
        const date =
            block
              .map((x) => x.text)
              .find((x) => /^20\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/.test(x))
              ?.slice(0, 10) || "",
          amount = Number(
            block
              .filter(
                (x) =>
                  x.x >= 430 &&
                  x.x < 490 &&
                  Math.abs(x.y - id.y) < 4 &&
                  /^\d+$/.test(x.text),
              )
              .sort((a, b) => a.x - b.x)[0]?.text || 0,
          ),
          merchant = canonicalMerchant(
            block
              .filter(
                (x) =>
                  x.x >= 355 &&
                  x.x < 435 &&
                  !/^(250781448848|N\/A)$/.test(x.text),
              )
              .sort((a, b) => b.y - a.y || a.x - b.x)
              .map((x) => x.text)
              .join(" "),
          ),
          txType =
            block.find(
              (x) => x.x >= 145 && x.x < 220 && Math.abs(x.y - id.y) < 4,
            )?.text || "PAYMENT";
        if (date && amount > 0 && txType !== "LAST_TRANSACTIONS")
          rows.push({
            date,
            merchant,
            amount,
            category: autoCat(merchant, amount),
            type: "Expense",
            note: `MoMo transaction ${id.text}`,
            source: "MoMo PDF",
            externalId: id.text,
          });
      }
    }
    return rows;
  }
  async function saveBatches(batch: ImportedTx[]) {
    let saved = 0;
    const batchSize = 10;
    for (let i = 0; i < batch.length; i += batchSize) {
      setStatus(
        `Saving transactions ${i + 1}-${Math.min(i + batchSize, batch.length)} of ${batch.length}…`,
      );
      const r = await fetch("/api/transactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ batch: batch.slice(i, i + batchSize) }),
      });
      const d = await r.json();
      if (!r.ok)
        throw new Error(d.error || "Could not save extracted transactions");
      saved += d.transactions?.length || 0;
    }
    return saved;
  }
  async function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      setStatus("Reading and categorising your statement…");
      const batch = f.name.toLowerCase().endsWith(".pdf")
        ? await parsePdf(f)
        : parseCsv(await f.text());
      if (!batch.length)
        throw new Error(
          "No outgoing transactions were found in this statement",
        );
      const saved = await saveBatches(batch);
      setStatus(
        `${saved} new outgoing transactions imported; ${batch.length - saved} duplicates skipped`,
      );
      setImportOpen(false);
      refresh();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "The statement could not be read",
      );
      setImportOpen(false);
    } finally {
      e.target.value = "";
    }
  }
  const months = useMemo(
    () =>
      Array.from(new Set([...items.map((x) => x.date.slice(0, 7)), ...budgets.map((x) => x.month)]))
        .sort()
        .reverse(),
    [items, budgets],
  );
  const filtered = useMemo(
    () =>
      items.filter(
        (x) =>
          (month === "All" || x.date.startsWith(month)) &&
          (category === "All" || x.category === category) &&
          (!query ||
            `${x.merchant} ${x.note}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [items, month, category, query],
  );
  const total = filtered.reduce((s, x) => s + x.amount, 0),
    constant = filtered
      .filter((x) =>
        [
          "Rent",
          "School fees",
          "Household fees",
          "Fuel",
          "Groceries",
          "Utilities",
          "Insurance",
          "Loan repayment",
        ].includes(x.category),
      )
      .reduce((s, x) => s + x.amount, 0);
  const budgetMonth = month === "All" ? (months[0] || new Date().toISOString().slice(0, 7)) : month;
  const monthBudgets = budgets.filter((x) => x.month === budgetMonth);
  const monthTransactions = items.filter((x) => x.date.startsWith(budgetMonth));
  const plannedTotal = monthBudgets.reduce((s, x) => s + x.plannedAmount, 0);
  const monthSpent = monthTransactions.reduce((s, x) => s + x.amount, 0);
  const categorySpent = (c: string) => monthTransactions.filter((x) => x.category === c).reduce((s, x) => s + x.amount, 0);
  const byCat = useMemo(
    () =>
      CATS.map((c) => ({
        c,
        v: filtered
          .filter((x) => x.category === c)
          .reduce((s, x) => s + x.amount, 0),
      }))
        .filter((x) => x.v)
        .sort((a, b) => b.v - a.v),
    [filtered],
  );
  const completedBudgetItems = monthBudgets.filter(
    (x) => x.isPaid || categorySpent(x.category) >= x.plannedAmount,
  ).length;
  const budgetByCategory = CATS.map((c) => ({
    c,
    planned: monthBudgets
      .filter((x) => x.category === c)
      .reduce((s, x) => s + x.plannedAmount, 0),
    spent: categorySpent(c),
  }))
    .filter((x) => x.planned || x.spent)
    .sort((a, b) => Math.max(b.planned, b.spent) - Math.max(a.planned, a.spent));
  return (
    <main>
      <header>
        <div className="brand">
          <span className="logo">C</span>
          <b className="wordmark">Counted<span>.</span></b>
        </div>
        <div className="actions">
          <button className="ghost" onClick={() => { setBudgetForm({ ...budgetForm, month: budgetMonth }); setBudgetOpen(true); }}>
            ＋ Set plan
          </button>
          <button className="ghost" onClick={() => setImportOpen(true)}>
            ↑ Import statement
          </button>
          <button className="primary" onClick={() => setModal(true)}>
            ＋ Add expense
          </button>
        </div>
      </header>
      <div className="shell">
        <aside>
          <nav>
            <a className="active">▦ Overview</a>
            <a>✓ Budget plan</a>
            <a>↗ Transactions</a>
            <a>⌁ Categories</a>
          </nav>
        </aside>
        <section className="content">
          <div className="top">
            <div className="filters">
              <select value={month} onChange={(e) => setMonth(e.target.value)}>
                <option>All</option>
                {months.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>All</option>
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          {status && (
            <div className="toast">
              ✓ {status}
              <button onClick={() => setStatus("")}>×</button>
            </div>
          )}
          {loading ? (
            <div className="empty">Loading your spending…</div>
          ) : items.length === 0 && budgets.length === 0 ? (
            <div className="welcome">
              <div>
                <span className="bigIcon">↗</span>
                <h2>Start with a statement or manual entry</h2>
                <p>
                  Import a CSV export from MoMo, or load representative data
                  from your May–August analysis to explore the dashboard.
                </p>
                <button className="primary" onClick={() => setImportOpen(true)}>
                  Import statement
                </button>
                <button className="ghost" onClick={loadDemo}>
                  Load sample data
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="kpis">
                <article>
                  <strong>{rwf(plannedTotal)}</strong>
                  <small>{monthBudgets.length} budget items</small>
                </article>
                <article>
                  <strong>{rwf(monthSpent)}</strong>
                  <small>{monthTransactions.length} transactions</small>
                </article>
                <article className={monthSpent > plannedTotal && plannedTotal > 0 ? "fuelKpi" : ""}>
                  <strong>{rwf(plannedTotal - monthSpent)}</strong>
                  <small>{plannedTotal ? Math.round((monthSpent / plannedTotal) * 100) : 0}% of plan used</small>
                </article>
                <article>
                  <strong>{completedBudgetItems} / {monthBudgets.length}</strong>
                  <small>Paid or fully covered</small>
                </article>
              </div>
              <article className="panel budgetPanel">
                <div className="panelHead">
                  <div><h2>Budget breakdown</h2><p>Planned and spent for {budgetMonth}. A checked item is fully funded or marked paid.</p></div>
                  <button className="primary" onClick={() => { setBudgetForm({ ...budgetForm, month: budgetMonth }); setBudgetOpen(true); }}>＋ Add planned spending</button>
                </div>
                {monthBudgets.length ? <>
                  <div className="budgetStrip">{monthBudgets.map((x) => <i key={x.id} style={{ width: `${x.plannedAmount / plannedTotal * 100}%`, background: COLORS[x.category] || COLORS.Other }} />)}</div>
                  <div className="budgetRows">{monthBudgets.map((x) => { const spent = categorySpent(x.category), paid = x.isPaid || spent >= x.plannedAmount; return <div className={`budgetRow ${paid ? "paid" : ""}`} key={x.id}>
                    <button className="check" aria-label={paid ? "Mark unpaid" : "Mark paid"} onClick={() => toggleBudget(x.id, !paid)}>{paid ? "✓" : ""}</button>
                    <i style={{ background: COLORS[x.category] || COLORS.Other }} /><div><b>{x.name}</b><small>{x.category}</small></div>
                    <div className="budgetAmounts"><span>{rwf(Math.min(spent, x.plannedAmount))} spent</span><b>/ {rwf(x.plannedAmount)} planned</b></div>
                    <div className="miniProgress"><i style={{ width: `${Math.min(100, spent / x.plannedAmount * 100)}%`, background: spent > x.plannedAmount ? "#e35a37" : COLORS[x.category] }} /></div>
                    <button className="removePlan" aria-label="Remove budget item" onClick={() => removeBudget(x.id)}>×</button>
                  </div>})}</div>
                </> : <div className="noBudget"><b>No plan for {budgetMonth} yet.</b><span>Add rent, school fees, fuel, groceries and other expected costs to compare planned and spent money.</span><button className="primary" onClick={() => setBudgetOpen(true)}>Create this month’s plan</button></div>}
              </article>
              <div className="grid">
                <article className="panel">
                  <div className="panelHead">
                    <div>
                      <h2>Spending by category</h2>
                      <p>Largest costs in the selected period</p>
                    </div>
                  </div>
                  <div className="bars">
                    {byCat.slice(0, 7).map((x) => (
                      <div className="barRow" key={x.c}>
                        <div>
                          <span>
                            <i style={{ background: COLORS[x.c] }} />
                            {x.c}
                          </span>
                          <b>{rwf(x.v)}</b>
                        </div>
                        <div className="track">
                          <i
                            style={{
                              width: `${(x.v / byCat[0].v) * 100}%`,
                              background: COLORS[x.c],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
                <article className="panel planPanel">
                  <div className="panelHead">
                    <div>
                      <h2>Plan vs actual</h2>
                      <p>Category progress for {budgetMonth}</p>
                    </div>
                  </div>
                  <div className="planCompare">
                    {budgetByCategory.slice(0, 7).map((x) => (
                      <div className="compareRow" key={x.c}>
                        <div>
                          <span><i style={{ background: COLORS[x.c] || COLORS.Other }} />{x.c}</span>
                          <b>{rwf(x.spent)} <em>/ {rwf(x.planned)} planned</em></b>
                        </div>
                        <div className="compareTrack">
                          <i style={{
                            width: `${Math.min(100, x.planned ? (x.spent / x.planned) * 100 : 100)}%`,
                            background: x.planned && x.spent > x.planned ? "#ff7a68" : COLORS[x.c] || COLORS.Other,
                          }} />
                        </div>
                      </div>
                    ))}
                    {!budgetByCategory.length && <div className="emptyCompare">Add a plan or transaction to see category progress.</div>}
                  </div>
                </article>
              </div>
              <article className="panel recent">
                <div className="panelHead">
                  <div>
                    <h2>Recent transactions</h2>
                    <p>Search, review or remove an entry</p>
                  </div>
                  <input
                    placeholder="Search merchant…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="table">
                  <div className="tr th">
                    <span>Date</span>
                    <span>Merchant</span>
                    <span>Category</span>
                    <span>Source</span>
                    <span>Amount</span>
                    <span />
                  </div>
                  {filtered
                    .slice()
                    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
                    .slice(0, 12)
                    .map((x) => (
                      <div className="tr" key={x.id}>
                        <span>
                          {new Date(x.date + "T00:00:00").toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </span>
                        <span>
                          <b>{x.merchant}</b>
                        </span>
                        <span>
                          <em
                            style={{
                              color: COLORS[x.category],
                              background: `${COLORS[x.category]}18`,
                            }}
                          >
                            {x.category}
                          </em>
                        </span>
                        <span>{x.source}</span>
                        <span>
                          <b>{rwf(x.amount)}</b>
                        </span>
                        <button
                          aria-label="Delete transaction"
                          onClick={() => remove(x.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </article>
            </>
          )}
        </section>
      </div>
      {(modal || importOpen || budgetOpen) && (
        <div
          className="overlay"
          onMouseDown={() => {
            setModal(false);
            setImportOpen(false);
            setBudgetOpen(false);
          }}
        >
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            {budgetOpen ? (
              <form onSubmit={addBudget}>
                <div className="modalHead"><div><p className="eyebrow">MONTHLY PLAN</p><h2>Add planned spending</h2></div><button type="button" onClick={() => setBudgetOpen(false)}>×</button></div>
                <label>Budget month<input required type="month" value={budgetForm.month} onChange={(e) => setBudgetForm({ ...budgetForm, month: e.target.value })} /></label>
                <label>Planned item<input required placeholder="e.g. Monthly rent, school term fees" value={budgetForm.name} onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })} /></label>
                <div className="two">
                  <label>Planned amount (RWF)<input required type="number" min="1" placeholder="400,000" value={budgetForm.plannedAmount} onChange={(e) => setBudgetForm({ ...budgetForm, plannedAmount: e.target.value })} /></label>
                  <label>Category<select value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
                </div>
                <p className="formHint">Counted compares this plan with transactions in the same category. It ticks the item when spending reaches the planned amount.</p>
                <button className="primary wide">Add to monthly plan</button>
              </form>
            ) : modal ? (
              <form onSubmit={add}>
                <div className="modalHead">
                  <div>
                    <p className="eyebrow">MANUAL ENTRY</p>
                    <h2>Add an expense</h2>
                  </div>
                  <button type="button" onClick={() => setModal(false)}>
                    ×
                  </button>
                </div>
                <label>
                  Date
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </label>
                <label>
                  Merchant or purpose
                  <input
                    required
                    placeholder="e.g. Société Pétrolière"
                    value={form.merchant}
                    onChange={(e) => {
                      const merchant = e.target.value;
                      setForm({
                        ...form,
                        merchant,
                        category: autoCat(merchant, Number(form.amount)),
                      });
                    }}
                  />
                </label>
                <div className="two">
                  <label>
                    Amount (RWF)
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="50,000"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                    >
                      {CATS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Note <small>optional</small>
                  <input
                    placeholder="Why or for whom?"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </label>
                <button className="primary wide">Save expense</button>
              </form>
            ) : (
              <div>
                <div className="modalHead">
                  <div>
                    <p className="eyebrow">STATEMENT IMPORT</p>
                    <h2>Bring in your MoMo history</h2>
                  </div>
                  <button onClick={() => setImportOpen(false)}>×</button>
                </div>
                <div className="drop" onClick={() => fileRef.current?.click()}>
                  <span>↑</span>
                  <b>Choose your MoMo PDF statement</b>
                  <p>
                    The app reads the same PDF format you shared, keeps outgoing
                    transactions, removes duplicates, and applies your rules.
                    CSV is also supported.
                  </p>
                  <input
                    ref={fileRef}
                    hidden
                    type="file"
                    accept=".pdf,.csv,application/pdf,text/csv"
                    onChange={importFile}
                  />
                </div>
                <div className="importRules">
                  <b>Automatic rules</b>
                  <span>Petroleum, P & M, Source Oil → Fuel</span>
                  <span>Tina, Marianne, supermarkets → Groceries</span>
                  <span>RWF 300,000 or 400,000 → Rent</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
