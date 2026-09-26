import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudent, getDemoStudent } from "@/lib/getDemoStudent";
import { computeNewMastery } from "@/lib/mastery";

export const dynamic = "force-dynamic";

/**
 * POST /api/attempts
 * Records student answer attempt and dynamically recomputes concept mastery:
 * newMastery = oldMastery + 0.35 * (outcome - oldMastery) * difficulty_weight
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { questionId, selectedAnswer, studentId: customStudentId, studentEmail } = body;

    if (!questionId || selectedAnswer === undefined) {
      return NextResponse.json(
        { error: "questionId and selectedAnswer are required" },
        { status: 400 }
      );
    }

    const student = customStudentId
      ? await prisma.student.findUnique({ where: { id: customStudentId } })
      : await getStudent(studentEmail);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Fetch question and its concept
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        concept: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Determine correctness
    const isCorrect =
      String(selectedAnswer).trim().toLowerCase() ===
      String(question.correctAnswer).trim().toLowerCase();

    // Fetch current mastery score for this student + concept (default 0.0)
    const existingMastery = await prisma.masteryScore.findUnique({
      where: {
        studentId_conceptId: {
          studentId: student.id,
          conceptId: question.conceptId,
        },
      },
    });

    const oldScore = existingMastery?.score ?? 0.0;

    // Recompute mastery using required formula:
    // new = old + 0.35 * (outcome - old) * difficulty_weight
    const computation = computeNewMastery(oldScore, isCorrect, question.difficulty);

    // Save AttemptLog
    const attemptLog = await prisma.attemptLog.create({
      data: {
        studentId: student.id,
        questionId: question.id,
        selectedAnswer: String(selectedAnswer),
        isCorrect,
        difficultyAtAttempt: question.difficulty,
        previousMastery: oldScore,
        newMastery: computation.newMastery,
      },
    });

    // Update MasteryScore record
    const updatedMastery = await prisma.masteryScore.upsert({
      where: {
        studentId_conceptId: {
          studentId: student.id,
          conceptId: question.conceptId,
        },
      },
      update: {
        score: computation.newMastery,
      },
      create: {
        studentId: student.id,
        conceptId: question.conceptId,
        score: computation.newMastery,
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attemptLog.id,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
      conceptId: question.conceptId,
      conceptName: question.concept.name,
      previousMastery: oldScore,
      newMastery: updatedMastery.score,
      delta: computation.delta,
      difficultyWeight: computation.difficultyWeight,
    });
  } catch (error: any) {
    console.error("Error submitting attempt:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process attempt" },
      { status: 500 }
    );
  }
}
