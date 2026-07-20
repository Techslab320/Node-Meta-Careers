const base = process.argv[2] || "https://node-meta-careers-nine.vercel.app";

async function testUpload() {
  const form = new FormData();
  const blob = new Blob(["%PDF-1.4 test resume"], { type: "application/pdf" });
  form.append("file", blob, "resume.pdf");

  const res = await fetch(`${base}/api/uploads/resume`, {
    method: "POST",
    body: form,
  });

  const text = await res.text();
  const title = text.match(/<title>([^<]*)<\/title>/i)?.[1];
  const digest = text.match(/digest":"([^"]+)"/)?.[1];
  console.log("Upload status:", res.status);
  console.log("Upload title:", title);
  console.log("Upload digest:", digest);
  console.log("Upload body:", text.slice(0, 1200));
}

await testUpload();
