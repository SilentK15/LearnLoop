import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudent } from "@/lib/getDemoStudent";

export const dynamic = "force-dynamic";

/**
 * GET /api/diagnostic
 * Query params:
 *   - subject: slug or id of the subject (e.g. "sql", "java", "python", "html", "data-structures", "cpp")
 *   - studentEmail: email of the student
 *
 * Returns a balanced diagnostic test: 1 representative question from each of the 6 concepts
 * in linear curriculum order for the selected subject.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectParam = searchParams.get("subject")?.trim().toLowerCase();
    const studentEmail = searchParams.get("studentEmail");

    const student = await getStudent(studentEmail);

    // Find target subject
    let subject = null;
    if (subjectParam) {
      subject = await prisma.subject.findFirst({
        where: {
          OR: [
            { slug: subjectParam },
            { id: subjectParam },
          ],
        },
      });
    }

    if (!subject) {
      subject = await prisma.subject.findFirst({
        orderBy: { orderIndex: "asc" },
      });
    }

    if (!subject) {
      return NextResponse.json(
        { error: "No subject found" },
        { status: 404 }
      );
    }

    const concepts = await prisma.concept.findMany({
      where: { subjectId: subject.id },
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
      subject: {
        id: subject.id,
        name: subject.name,
        slug: subject.slug,
        description: subject.description,
        icon: subject.icon,
        color: subject.color,
      },
      diagnosticQuestions,
    });
  } catch (error: any) {
    console.error("Error fetching diagnostic questions:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load diagnostic" },
      { status: 500 }
    );
  }
}
