import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const allowedOrigins = new Set([
  "https://justinoliver927-sudo.github.io",
]);

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://justinoliver927-sudo.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const services: Record<string, number> = {
  "Dye Cut": 70,
  "Plain Fade": 45,
  "Kids Dye Fade": 60,
  "Kids Plain Fade": 35,
  "Trim": 12,
  "Chiskop / Bles": 30,
};
const allowedTimes = new Set([
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
]);

function json(status: number, payload: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const result = value.trim();
  if (!result || result.length > max) return null;
  return result;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") return json(405, { error: "Method not allowed." }, origin);
  if (!origin || !allowedOrigins.has(origin)) return json(403, { error: "Origin not allowed." }, origin);

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 12_000) return json(413, { error: "Request too large." }, origin);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!supabaseUrl || !serviceRoleKey || !turnstileSecret) {
    console.error("Required function environment variable is missing.");
    return json(500, { error: "Booking service is temporarily unavailable." }, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON request." }, origin);
  }

  const customerName = cleanText(body.customer_name, 100);
  const customerPhone = cleanText(body.customer_phone, 30);
  const serviceName = cleanText(body.service, 120);
  const bookingDate = cleanText(body.booking_date, 10);
  const bookingTime = cleanText(body.booking_time, 5);
  const notes = body.notes == null || body.notes === "" ? null : cleanText(body.notes, 1000);
  const captchaToken = cleanText(body.captchaToken, 4096);

  if (!customerName || !/^[\p{L}\p{M} .'-]{1,100}$/u.test(customerName)) {
    return json(400, { error: "Enter a valid name (up to 100 characters)." }, origin);
  }
  if (!customerPhone || !/^[+0-9() .-]{3,30}$/.test(customerPhone)) {
    return json(400, { error: "Enter a valid phone number." }, origin);
  }
  if (!serviceName || !(serviceName in services)) return json(400, { error: "Choose a listed service." }, origin);
  if (!bookingDate || !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) return json(400, { error: "Choose a valid booking date." }, origin);
  const todaySA = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (bookingDate < todaySA) return json(400, { error: "Choose today or a future date." }, origin);
  if (!bookingTime || !allowedTimes.has(bookingTime)) return json(400, { error: "Choose a listed booking time." }, origin);
  if (body.notes != null && body.notes !== "" && notes === null) return json(400, { error: "Notes must be 1,000 characters or fewer." }, origin);
  if (body.terms_accepted !== true) return json(400, { error: "Please accept the booking terms." }, origin);
  if (!captchaToken) return json(400, { error: "Complete the security check first." }, origin);
  const [year, month, day] = bookingDate.split("-").map(Number);
const parsedDate = new Date(Date.UTC(year, month - 1, day));

if (
  parsedDate.getUTCFullYear() !== year ||
  parsedDate.getUTCMonth() !== month - 1 ||
  parsedDate.getUTCDate() !== day
) {
  return json(400, { error: "Choose a valid calendar date." }, origin);
}

  // Verify Turnstile on the server. Never trust a browser-supplied success flag.
  let captchaResponse: Response;
  try {
    captchaResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: turnstileSecret, response: captchaToken }),
    });
  } catch {
    return json(503, { error: "Security check could not be verified. Please try again." }, origin);
  }
  const captchaResult = await captchaResponse.json().catch(() => null);
  if (!captchaResponse.ok || !captchaResult?.success) {
    return json(400, { error: "Security check expired or failed. Please try again." }, origin);
  }
  
if (captchaResult.hostname !== "justinoliver927-sudo.github.io") {
  return json(400, { error: "Security check host did not match." }, origin);
}


  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.from("booking_requests").insert({
    user_id: null,
    customer_name: customerName,
    customer_phone: customerPhone,
    service_name: serviceName,
    service_price: services[serviceName], // Server-controlled price; never trust hidden form price.
    booking_date: bookingDate,
    booking_time: bookingTime,
    notes,
    terms_accepted: true,
    status: "pending",
    payment_status: "unpaid",
    payment_method: null,
    paid_at: null,
  }).select("id").single();

  if (error) {
    console.error("Booking insert failed:", error.code || "unknown database error");
    return json(500, { error: "We could not save your booking request. Please try again or contact the barber." }, origin);
  }
  return json(201, { ok: true, booking_id: data.id, message: "Booking request saved. The barber must confirm it." }, origin);
});

