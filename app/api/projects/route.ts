import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Industry } from "@/lib/benchmarks/seed";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, industry } = body;

    if (!name || !industry) {
      return NextResponse.json(
        { error: "프로젝트 이름과 업종 항목은 필수입니다." },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        industry: industry as Industry,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "서버 에러" }, { status: 500 });
  }
}
