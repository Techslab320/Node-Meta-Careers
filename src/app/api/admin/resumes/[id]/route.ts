import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/database/mongodb";
import { ApplicationModel } from "@/models/Application";
import { ResumeFileModel } from "@/models/ResumeFile";
import {
  getLocalResumePath,
  getMongoResumeId,
  isLocalResumeUrl,
  isMongoResumeUrl,
} from "@/lib/uploads/resume";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const application = await ApplicationModel.findById(id).select("resumeUrl resumeFilename");
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (isMongoResumeUrl(application.resumeUrl)) {
    const resumeFile = await ResumeFileModel.findById(
      getMongoResumeId(application.resumeUrl),
    ).select("data contentType filename");

    if (!resumeFile?.data) {
      return NextResponse.json({ error: "Unable to download resume" }, { status: 502 });
    }

    return new NextResponse(new Uint8Array(resumeFile.data), {
      headers: {
        "Content-Type": resumeFile.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${application.resumeFilename || resumeFile.filename}"`,
      },
    });
  }

  if (isLocalResumeUrl(application.resumeUrl)) {
    try {
      const buffer = await readFile(getLocalResumePath(application.resumeUrl));
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${application.resumeFilename}"`,
        },
      });
    } catch {
      return NextResponse.json({ error: "Unable to download resume" }, { status: 502 });
    }
  }

  const response = await fetch(application.resumeUrl);
  if (!response.ok) {
    return NextResponse.json({ error: "Unable to download resume" }, { status: 502 });
  }

  const buffer = await response.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": response.headers.get("content-type") || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${application.resumeFilename}"`,
    },
  });
}
