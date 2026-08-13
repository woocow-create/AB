import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBenchmark, Media, Industry } from "@/lib/benchmarks/seed";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      projectId: providedProjectId,
      projectName = "새 시뮬레이션 프로젝트",
      title = "광고 소재 A/B 테스트",
      media = "META",
      placement = "INSTAGRAM_FEED",
      objective = "CONVERSION",
      industry = "BEAUTY",
      targetSummary = "20-30대 타겟",
      dailyBudgetKrw = 100000,
      plannedDays = 7,
      customCtr,
      customCvr,
      customCpmKrw,
      creatives = [],
    } = body;

    // 1. 프로젝트 결정 (제공된 ID 우선, 없으면 이름으로 조회/생성)
    let projectId = providedProjectId as string | undefined;
    if (!projectId) {
      let project = await prisma.project.findFirst({ where: { name: projectName } });
      if (!project) {
        project = await prisma.project.create({
          data: { name: projectName, industry: industry as Industry },
        });
      }
      projectId = project.id;
    }

    // 2. 벤치마크 결정
    const bm = getBenchmark(media as Media, industry as Industry);
    const hasCustom =
      customCtr !== undefined || customCvr !== undefined || customCpmKrw !== undefined;

    const baselineCtr = customCtr !== undefined ? Number(customCtr) : bm.ctr;
    const baselineCvr = customCvr !== undefined ? Number(customCvr) : bm.cvr;
    const baselineCpmKrw =
      customCpmKrw !== undefined ? Number(customCpmKrw) : bm.cpmKrw || 14000;
    const baselineSource = hasCustom ? "USER_ACCOUNT" : "PRESET";

    // 3. 시뮬레이션 생성
    const sim = await prisma.simulation.create({
      data: {
        projectId,
        title,
        media,
        placement,
        objective,
        targetSummary,
        dailyBudgetKrw: Number(dailyBudgetKrw),
        plannedDays: Number(plannedDays),
        baselineCtr,
        baselineCvr,
        baselineCpmKrw,
        baselineSource,
        creatives: {
          create: creatives.map((c: any) => ({
            label: c.label || "A",
            // imageDataUrl(base64)을 imageUrl 컬럼에 저장 (없으면 placeholder)
            imageUrl:
              c.imageDataUrl ||
              c.imageUrl ||
              "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
            imageMeta: c.imageMeta || { width: 1080, height: 1080, bytes: 150000 },
            headline: c.headline || "",
            bodyText: c.bodyText || "",
            ctaText: c.ctaText || "",
          })),
        },
      },
      include: { creatives: true },
    });

    return NextResponse.json({ simulation: sim, id: sim.id });
  } catch (error: any) {
    console.error("Simulation create error:", error);
    return NextResponse.json({ error: error?.message || "서버 에러" }, { status: 500 });
  }
}
