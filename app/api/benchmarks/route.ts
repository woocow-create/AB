import { NextResponse } from "next/server";
import { getBenchmark, Media, Industry } from "@/lib/benchmarks/seed";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const media = (searchParams.get("media") || "META") as Media;
  const industry = (searchParams.get("industry") || "BEAUTY") as Industry;

  const benchmark = getBenchmark(media, industry);
  return NextResponse.json(benchmark);
}
