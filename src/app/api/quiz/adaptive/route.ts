import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudent } from "@/lib/getDemoStudent";

export const dynamic = "force-dynamic";

/**
 * GET /api/quiz/adaptive
 * Queries:
 *  - conceptId: ID of the concept to test (optional, defaults to earliest recommended gap)
 *  - subject: slug or id of the subject (optional)
 *  - studentEmail: email of the student (optional)
 *  - currentDifficulty: 1 to 5 (clamped)
 *  - excludeIds: comma-separated list of question IDs already answered in this session
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get("studentEmail");
    const student = await getStudent(studentEmail);

    let conceptId = searchParams.get("conceptId");
    const subjectParam = searchParams.get("subject")?.trim().toLowerCase();
    const diffParam = parseInt(searchParams.get("currentDifficulty") || "3", 10);
    const targetDifficulty = Math.max(1, Math.min(5, isNaN(diffParam) ? 3 : diffParam));
    const excludeIds = (searchParams.get("excludeIds") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // If no conceptId provided, find the recommended next concept (earliest < 0.60) in the subject
    if (!conceptId) {
      let subjectFilter: any = {};
      if (subjectParam) {
        const matchedSubject = await prisma.subject.findFirst({
          where: {
            OR: [{ slug: subjectParam }, { id: subjectParam }],
          },
        });
        if (matchedSubject) {
          subjectFilter = { subjectId: matchedSubject.id };
        }
      }

      const concepts = await prisma.concept.findMany({
        where: subjectFilter,
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
        subject: true,
        masteryScores: {
          where: { studentId: student.id },
        },
      },
    });

    if (!concept) {
      return NextResponse.json({ error: "Concept not found" }, { status: 404 });
    }

    // 1. Try finding an unserved question at exact targetDifficulty with randomized selection
    const exactMatches = await prisma.question.findMany({
      where: {
        conceptId: concept.id,
        difficulty: targetDifficulty,
        id: { notIn: excludeIds },
      },
    });

    let question =
      exactMatches.length > 0
        ? exactMatches[Math.floor(Math.random() * exactMatches.length)]
        : null;

    // 2. If no unserved question at exact targetDifficulty, search nearest tier with pedagogical bias:
    // If targetDifficulty <= 2 (weaker student): ONLY look in [1, 2, 3], never force hard D4/D5
    // If targetDifficulty >= 4 (advanced student): ONLY look in [4, 5, 3]
    if (!question) {
      let prioritizedDifficulties: number[] = [];
      if (targetDifficulty <= 2) {
        prioritizedDifficulties = [1, 2, 3].filter((d) => d !== targetDifficulty);
      } else if (targetDifficulty >= 4) {
        prioritizedDifficulties = [4, 5, 3].filter((d) => d !== targetDifficulty);
      } else {
        prioritizedDifficulties = [3, 2, 4, 1, 5].filter((d) => d !== targetDifficulty);
      }

      for (const d of prioritizedDifficulties) {
        const candidates = await prisma.question.findMany({
          where: {
            conceptId: concept.id,
            difficulty: d,
            id: { notIn: excludeIds },
          },
        });
        if (candidates.length > 0) {
          question = candidates[Math.floor(Math.random() * candidates.length)];
          break;
        }
      }
    }

    // 3. Fallback: If all questions in preferred tier have been answered, pick from any remaining unserved question
    if (!question) {
      const anyUnserved = await prisma.question.findMany({
        where: {
          conceptId: concept.id,
          id: { notIn: excludeIds },
        },
      });
      if (anyUnserved.length > 0) {
        question = anyUnserved[Math.floor(Math.random() * anyUnserved.length)];
      }
    }

    if (!question) {
      return NextResponse.json(
        { error: "No questions found for this concept" },
        { status: 404 }
      );
    }

    const currentMastery = concept.masteryScores[0]?.score ?? 0.0;

    return NextResponse.json({
      subject: concept.subject
        ? {
            id: concept.subject.id,
            name: concept.subject.name,
            slug: concept.subject.slug,
          }
        : undefined,
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
