import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudent } from "@/lib/getDemoStudent";

export const dynamic = "force-dynamic";

/**
 * GET /api/subjects
 * Returns all available subjects (SQL, Java, Python, HTML, Data Structures, C++)
 * with concept counts and the current student's progress for each subject.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentEmail = searchParams.get("studentEmail");
    const student = await getStudent(studentEmail);

    const subjects = await prisma.subject.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        concepts: {
          orderBy: { orderIndex: "asc" },
          include: {
            _count: {
              select: { questions: true },
            },
            masteryScores: {
              where: { studentId: student.id },
            },
          },
        },
      },
    });

    const subjectSummaries = subjects.map((subj) => {
      const concepts = subj.concepts;
      let totalQuestions = 0;
      let sumMastery = 0;
      let masteredCount = 0;
      let needsReviewCount = 0;
      let criticalGapCount = 0;

      concepts.forEach((c) => {
        totalQuestions += c._count.questions;
        const score = c.masteryScores[0]?.score ?? 0.0;
        sumMastery += score;

        if (score >= 0.8) {
          masteredCount++;
        } else if (score >= 0.6) {
          needsReviewCount++;
        } else {
          criticalGapCount++;
        }
      });

      const averageMastery =
        concepts.length > 0
          ? Number((sumMastery / concepts.length).toFixed(3))
          : 0;

      return {
        id: subj.id,
        name: subj.name,
        slug: subj.slug,
        description: subj.description,
        icon: subj.icon,
        color: subj.color,
        orderIndex: subj.orderIndex,
        totalConcepts: concepts.length,
        totalQuestions,
        averageMastery,
        masteredCount,
        needsReviewCount,
        criticalGapCount,
      };
    });

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
      },
      subjects: subjectSummaries,
    });
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load subjects" },
      { status: 500 }
    );
  }
}
