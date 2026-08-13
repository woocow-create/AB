import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SimulationReport } from "@/components/report/SimulationReport";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SimulationPage({ params }: Props) {
  const { id } = await params;

  const sim = await prisma.simulation.findUnique({
    where: { id },
    include: {
      project: true,
      creatives: { include: { score: true } },
      result: true,
      actual: true,
    },
  });

  if (!sim) notFound();

  return <SimulationReport sim={sim as any} />;
}
