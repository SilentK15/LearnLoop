import { NextResponse } from "next/server";
import { runSeed } from "../../../../prisma/seed";

export const dynamic = "force-dynamic";

/**
 * POST /api/reset
 * Resets the demo student's attempt logs and restores initial baseline mastery scores
 * so the evaluator can test the entire loop from scratch repeatedly.
 */
export async function POST() {
  try {
    const result = await runSeed();
    return NextResponse.json({
      success: true,
      message: "Demo student data reset to clean baseline.",
      details: result,
    });
  } catch (error: any) {
    console.error("Error resetting demo data:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to reset demo data" },
      { status: 500 }
    );
  }
}
