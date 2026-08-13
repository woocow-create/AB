import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sim = await prisma.simulation.findUnique({
      where: { id },
      include: {
        project: true,
        creatives: {
          include: { score: true },
        },
        result: true,
        actual: true,
      },
    });

    if (!sim) {
      return NextResponse.json({ error: "시뮬레이션을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(sim);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "서버 에러" }, { status: 500 });
  }
}
