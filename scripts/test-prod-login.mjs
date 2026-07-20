const base = process.argv[2] || "https://node-meta-careers-nine.vercel.app";
const email = process.argv[3] || "forevershiningstar299@gmail.com";
const password = process.argv[4] || "POlqaz123#@!4240";

const csrfRes = await fetch(`${base}/api/auth/csrf`);
const { csrfToken } = await csrfRes.json();
const cookies = csrfRes.headers.getSetCookie?.() ?? [];

const body = new URLSearchParams({
  csrfToken,
  email,
  password,
  callbackUrl: "/admin-nodemeta-mateoandres",
  json: "true",
});

const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: cookies.map((c) => c.split(";")[0]).join("; "),
  },
  body,
  redirect: "manual",
});

console.log("Status:", loginRes.status);
console.log("Location:", loginRes.headers.get("location"));
console.log(
  "Set-Cookie:",
  loginRes.headers.getSetCookie?.().map((c) => c.split(";")[0]) ?? [],
);
const text = await loginRes.text();
console.log("Body:", text.slice(0, 500));
