const localOnly = () => Response.json(
  { error: "Transactions are stored securely in this browser." },
  { status: 410 },
);

export const GET = localOnly;
export const POST = localOnly;
export const DELETE = localOnly;
