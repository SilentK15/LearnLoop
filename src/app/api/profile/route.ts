import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDemoStudent } from "@/lib/getDemoStudent";
import { getRecommendedNextConcept } from "@/lib/mastery";

export const dynamic = "force-dynamic";

/**
 * GET /api/profile
 * Returns student profile, concept mastery breakdown in linear orderIndex,
 * and gap detection recommending the earliest concept with mastery < 0.60.
 */
export async function GET() {
  try {
    const student = await getDemoStudent();

    // Fetch all concepts in linear order
    const concepts = await prisma.concept.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        _count: {
          select: { questions: true },
        },
        masteryScores: {
          where: { studentId: student.id },
        },
      },
    });

    // Fetch student's attempt statistics per concept
    const attempts = await prisma.attemptLog.findMany({
      where: { studentId: student.id },
      include: {
        question: {
          select: { conceptId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const conceptStats = concepts.map((c) => {
      const score = c.masteryScores[0]?.score ?? 0.0;
      const conceptAttempts = attempts.filter(
        (a) => a.question.conceptId === c.id
      );
      const correctAttempts = conceptAttempts.filter((a) => a.isCorrect);
      const accuracy =
        conceptAttempts.length > 0
          ? Number((correctAttempts.length / conceptAttempts.length).toFixed(2))
          : 0;

      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        orderIndex: c.orderIndex,
        score,
        totalQuestions: c._count.questions,
        attemptsCount: conceptAttempts.length,
        accuracy,
      };
    });

    // Recommended next concept: earliest with mastery < 0.60
    const recommendedConcept = getRecommendedNextConcept(conceptStats);

    const totalAttempts = attempts.length;
    const totalCorrect = attempts.filter((a) => a.isCorrect).length;
    const averageMastery =
      conceptStats.length > 0
        ? Number(
            (
              conceptStats.reduce((sum, c) => sum + c.score, 0) /
              conceptStats.length
            ).toFixed(3)
          )
        : 0;

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
      averageMastery,
      totalAttempts,
      overallAccuracy:
        totalAttempts > 0
          ? Number((totalCorrect / totalAttempts).toFixed(2))
          : 0,
      concepts: conceptStats,
      recommendedConcept,
      recentAttempts: attempts.slice(0, 8).map((a) => ({
        id: a.id,
        isCorrect: a.isCorrect,
        difficultyAtAttempt: a.difficultyAtAttempt,
        previousMastery: a.previousMastery,
        newMastery: a.newMastery,
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching profile & gap detection:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}
