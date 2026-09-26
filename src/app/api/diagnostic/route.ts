import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoStudent } from "@/lib/getDemoStudent";

export const dynamic = "force-dynamic";

/**
 * GET /api/diagnostic
 * Returns a balanced diagnostic test: 1 representative question from each of the 6 concepts
 * in linear curriculum order, calibrated around difficulty 2-3 to establish baseline.
 */
export async function GET() {
  try {
    const student = await getDemoStudent();

    const concepts = await prisma.concept.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        questions: {
          orderBy: { difficulty: "asc" },
        },
        masteryScores: {
          where: { studentId: student.id },
        },
      },
    });

    const diagnosticQuestions = concepts.map((concept) => {
      // Pick a median difficulty question (e.g., difficulty 2 or 3)
      const medianQuestion =
        concept.questions.find((q) => q.difficulty === 3) ||
        concept.questions.find((q) => q.difficulty === 2) ||
        concept.questions[0];

      return {
        conceptId: concept.id,
        conceptName: concept.name,
        conceptOrder: concept.orderIndex,
        currentMastery: concept.masteryScores[0]?.score ?? 0.0,
        question: medianQuestion
          ? {
              id: medianQuestion.id,
              text: medianQuestion.text,
              options: medianQuestion.options,
              difficulty: medianQuestion.difficulty,
            }
          : null,
      };
    });

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
      diagnosticQuestions,
    });
  } catch (error: any) {
    console.error("Error fetching diagnostic questions:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load diagnostic questions" },
      { status: 500 }
    );
  }
}
