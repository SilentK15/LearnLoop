import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudent } from "@/lib/getDemoStudent";

export const dynamic = "force-dynamic";

/**
 * Utility function to shuffle an array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * GET /api/diagnostic
 * Query params:
 *   - subject: slug or id of the subject (e.g. "sql", "java", "python", "html", "data-structures", "cpp") or "all"
 *   - studentEmail: email of the student
 *   - limit: number of questions to return (default 20)
 *
 * Returns a 20-question randomized Stat Trial test sampled across all topic tests
 * to evaluate the student's ability across different concepts and difficulty tiers.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectParam = searchParams.get("subject")?.trim().toLowerCase();
    const studentEmail = searchParams.get("studentEmail");
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const targetCount = isNaN(limitParam) || limitParam <= 0 ? 20 : Math.min(limitParam, 50);

    const student = await getStudent(studentEmail);

    const isAllSubjects = !subjectParam || subjectParam === "all";
    let targetSubject = null;

    if (!isAllSubjects) {
      targetSubject = await prisma.subject.findFirst({
        where: {
          OR: [
            { slug: subjectParam },
            { id: subjectParam },
          ],
        },
      });
    }

    // Define question filter
    const whereCondition = targetSubject
      ? { concept: { subjectId: targetSubject.id } }
      : {};

    // Fetch candidate questions across all tests/concepts in the scope
    const candidateQuestions = await prisma.question.findMany({
      where: whereCondition,
      include: {
        concept: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                icon: true,
              },
            },
            masteryScores: {
              where: { studentId: student.id },
            },
          },
        },
      },
    });

    if (candidateQuestions.length === 0) {
      return NextResponse.json({
        student: { id: student.id, name: student.name, email: student.email },
        subject: targetSubject || { name: "All Realms", slug: "all" },
        diagnosticQuestions: [],
        totalQuestions: 0,
      });
    }

    // Group questions by concept so we can guarantee representation across all tests
    const questionsByConcept: Record<string, typeof candidateQuestions> = {};
    for (const q of candidateQuestions) {
      if (!questionsByConcept[q.conceptId]) {
        questionsByConcept[q.conceptId] = [];
      }
      questionsByConcept[q.conceptId].push(q);
    }

    // Shuffle questions within each concept bucket
    const conceptIds = shuffleArray(Object.keys(questionsByConcept));
    for (const cid of conceptIds) {
      questionsByConcept[cid] = shuffleArray(questionsByConcept[cid]);
    }

    // Round-robin selection across concepts to ensure broad coverage across all tests
    const selectedQuestions: typeof candidateQuestions = [];
    const usedQuestionIds = new Set<string>();

    let round = 0;
    let addedInRound = true;

    while (selectedQuestions.length < targetCount && addedInRound) {
      addedInRound = false;
      for (const cid of conceptIds) {
        if (selectedQuestions.length >= targetCount) break;
        const bucket = questionsByConcept[cid];
        if (bucket && round < bucket.length) {
          const candidate = bucket[round];
          if (!usedQuestionIds.has(candidate.id)) {
            selectedQuestions.push(candidate);
            usedQuestionIds.add(candidate.id);
            addedInRound = true;
          }
        }
      }
      round++;
    }

    // If still under targetCount, fill from remaining candidate pool with random selection
    if (selectedQuestions.length < targetCount) {
      const remaining = candidateQuestions.filter((q) => !usedQuestionIds.has(q.id));
      const shuffledRemaining = shuffleArray(remaining);
      for (const q of shuffledRemaining) {
        if (selectedQuestions.length >= targetCount) break;
        selectedQuestions.push(q);
        usedQuestionIds.add(q.id);
      }
    }

    // Final shuffle so the 20 questions present a randomized sequence across topics and difficulties
    const finalShuffled = shuffleArray(selectedQuestions);

    // Format output
    const diagnosticQuestions = finalShuffled.map((q) => ({
      conceptId: q.concept.id,
      conceptName: q.concept.name,
      conceptOrder: q.concept.orderIndex,
      subjectName: q.concept.subject.name,
      subjectSlug: q.concept.subject.slug,
      currentMastery: q.concept.masteryScores[0]?.score ?? 0.0,
      question: {
        id: q.id,
        text: q.text,
        options: q.options,
        difficulty: q.difficulty,
      },
    }));

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
      subject: isAllSubjects
        ? {
            id: "all",
            name: "Grand Realm (All Subjects)",
            slug: "all",
            description: "20-Question Stat Trial across all tests and topics",
            icon: "Sparkles",
            color: "#00ffcc",
          }
        : {
            id: targetSubject!.id,
            name: targetSubject!.name,
            slug: targetSubject!.slug,
            description: targetSubject!.description,
            icon: targetSubject!.icon,
            color: targetSubject!.color,
          },
      diagnosticQuestions,
      totalQuestions: diagnosticQuestions.length,
    });
  } catch (error: any) {
    console.error("Error fetching stat trial questions:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load stat trial" },
      { status: 500 }
    );
  }
}
