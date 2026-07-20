const base = process.argv[2] || "https://node-meta-careers-nine.vercel.app";

async function testUpload() {
  const form = new FormData();
  const blob = new Blob(["%PDF-1.4 test resume"], { type: "application/pdf" });
  form.append("file", blob, "resume.pdf");

  const res = await fetch(`${base}/api/uploads/resume`, {
    method: "POST",
    body: form,
  });

  console.log("Upload status:", res.status);
  console.log("Upload content-type:", res.headers.get("content-type"));
  console.log("Upload body:", (await res.text()).slice(0, 500));
}

async function testApplication() {
  const body = {
    jobId: "test",
    jobSlug: "blockchain-smart-contract-developer",
    firstName: "Wiley",
    lastName: "Haley",
    email: "wiley.haley.2023@gmail.com",
    country: "China",
    city: "",
    linkedinUrl: "https://linkedin.com/in/test",
    githubUrl: "https://github.com/test",
    portfolioUrl: "",
    telegramUsername: "",
    discordUsername: "",
    currentJobTitle: "",
    yearsOfExperience: 6,
    professionalSummary: "Experienced blockchain developer with six years of hands-on work.",
    motivation: "I want to join Node Meta because of the strong engineering culture.",
    earliestStartDate: "Tomorrow",
    salaryExpectation: "100000",
    preferredEmploymentType: "full-time",
    preferredExperienceLevel: "mid-level",
    workAuthorization: "Authorized",
    referralSource: "",
    additionalMessage: "",
    consentAccepted: true,
    website: "",
    resumeUrl: "https://example.com/resume.pdf",
    resumeFilename: "resume.pdf",
  };

  const res = await fetch(`${base}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log("Application status:", res.status);
  console.log("Application content-type:", res.headers.get("content-type"));
  console.log("Application body:", (await res.text()).slice(0, 500));
}

await testUpload();
await testApplication();
