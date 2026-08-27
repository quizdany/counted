const localOnly = () => Response.json(
  { error: "Budgets are stored securely in this browser." },
  { status: 410 },
);

export const GET = localOnly;
export const POST = localOnly;
export const PATCH = localOnly;
export const DELETE = localOnly;
