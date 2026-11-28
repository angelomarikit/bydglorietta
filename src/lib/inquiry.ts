export async function sendInquiry(form: string, fields: Record<string, string>) {
  const response = await fetch("/api/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ form, fields }),
  });
  if (!response.ok) {
    throw new Error("This form could not be sent. Try again.");
  }
}
