import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoStudent } from "@/lib/getDemoStudent";

export const dynamic = "force-dynamic";

/**
 * GET /api/quiz/adaptive
 * Queries:
 *  - conceptId: ID of the concept to test (optional, defaults to earliest recommended gap)
 *  - currentDifficulty: 1 to 5 (clamped)
 *  - excludeIds: comma-separated list of question IDs already answered in this session
 */
export async function GET(request: Request) {
  try {
    const student = await getDemoStudent();
    const { searchParams } = new URL(request.url);

    let conceptId = searchParams.get("conceptId");
    const diffParam = parseInt(searchParams.get("currentDifficulty") || "3", 10);
    const targetDifficulty = Math.max(1, Math.min(5, isNaN(diffParam) ? 3 : diffParam));
    const excludeIds = (searchParams.get("excludeIds") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // If no conceptId provided, find the recommended next concept (earliest < 0.60)
    if (!conceptId) {
      const concepts = await prisma.concept.findMany({
        orderBy: { orderIndex: "asc" },
        include: {
          masteryScores: {
            where: { studentId: student.id },
          },
        },
      });

      const gapConcept = concepts.find(
        (c) => (c.masteryScores[0]?.score ?? 0.0) < 0.6
      );
      conceptId = gapConcept?.id || concepts[0]?.id;
    }

    if (!conceptId) {
      return NextResponse.json({ error: "No concepts available" }, { status: 404 });
    }

    const concept = await prisma.concept.findUnique({
      where: { id: conceptId },
      include: {
        masteryScores: {
          where: { studentId: student.id },
        },
      },
    });

    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 });
    }

    // Try finding a question at targetDifficulty not yet answered in this session
    let question = await prisma.question.findFirst({
      where: {
        conceptId: concept.id,
        difficulty: targetDifficulty,
        id: { notIn: excludeIds },
      },
    });

    // If no unserved question at exact difficulty, check nearest adjacent difficulties
    if (!question) {
      const difficulties = [1, 2, 3, 4, 5].sort(
        (a, b) => Math.abs(a - targetDifficulty) - Math.abs(b - targetDifficulty)
      );

      for (const d of difficulties) {
        question = await prisma.question.findFirst({
          where: {
            conceptId: concept.id,
            difficulty: d,
            id: { notIn: excludeIds },
          },
        });
        if (question) break;
      }
    }

    // If all questions have been served in this session, wrap around to any question
    if (!question) {
      question = await prisma.question.findFirst({
        where: {
          conceptId: concept.id,
          difficulty: targetDifficulty,
        },
      });
    }

    if (!question) {
      return NextResponse.json(
        { error: "No questions found for this concept" },
        { status: 404 }
      );
    }

    const currentMastery = concept.masteryScores[0]?.score ?? 0.0;

    return NextResponse.json({
      concept: {
        id: concept.id,
        name: concept.name,
        slug: concept.slug,
        orderIndex: concept.orderIndex,
        currentMastery,
      },
      question: {
        id: question.id,
        text: question.text,
        options: question.options,
        difficulty: question.difficulty,
      },
      targetDifficulty,
    });
  } catch (error: any) {
    console.error("Error fetching adaptive question:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load adaptive question" },
      { status: 500 }
    );
  }
}
