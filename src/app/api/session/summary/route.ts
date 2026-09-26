import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

interface SessionDelta {
  conceptName: string;
  startMastery: number;
  endMastery: number;
  delta: number;
  attemptsCount: number;
  correctCount: number;
}

function generateLocalSmartSummary(
  deltas: SessionDelta[],
  totalAttempts: number,
  accuracy: number
): string {
  const improved = deltas.filter((d) => d.delta > 0);
  const declined = deltas.filter((d) => d.delta < 0);

  const improvedText = improved
    .map(
      (d) =>
        `**${d.conceptName}** (grew +${(d.delta * 100).toFixed(0)}% from ${(d.startMastery * 100).toFixed(0)}% to ${(d.endMastery * 100).toFixed(0)}%)`
    )
    .join(", ");

  const declinedText = declined
    .map(
      (d) =>
        `**${d.conceptName}** (dipped ${(d.delta * 100).toFixed(0)}% to ${(d.endMastery * 100).toFixed(0)}%)`
    )
    .join(", ");

  let summary = `### Adaptive Session Diagnostic Analysis\n\n`;
  summary += `In this session, you completed **${totalAttempts} adaptive trials** with an overall precision accuracy of **${(accuracy * 100).toFixed(0)}%**.\n\n`;

  if (improved.length > 0) {
    summary += `#### 🚀 Key Breakthroughs\n`;
    summary += `You demonstrated clear conceptual mastery in ${improvedText}. The adaptive difficulty engine recognized your consistency and calibrated upward to reinforce higher-order reasoning.\n\n`;
  }

  if (declined.length > 0) {
    summary += `#### 🔍 Target Focus Areas\n`;
    summary += `Higher-difficulty questions exposed friction in ${declinedText}. Specifically, watch out for edge cases and runtime lifecycle nuances.\n\n`;
  }

  if (improved.length === 0 && declined.length === 0) {
    summary += `#### ⚖️ Baseline Maintained\n`;
    summary += `Your performance remained steady across existing mastery benchmarks. Additional high-difficulty trials are recommended to break into advanced tier thresholds.\n\n`;
  }

  const nextFocus =
    declined[0]?.conceptName ||
    deltas.find((d) => d.endMastery < 0.6)?.conceptName ||
    "Advanced Asynchronous Architecture";

  summary += `#### 🎯 Recommended Action\n`;
  summary += `Direct your next targeted drill on **${nextFocus}** to close the remaining gap before progressing downstream.`;

  return summary;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      startMasteries = {},
      endMasteries = {},
      conceptNames = {},
      attempts = [],
    } = body;

    // Calculate deltas
    const conceptIds = Array.from(
      new Set([...Object.keys(startMasteries), ...Object.keys(endMasteries)])
    );

    const deltas: SessionDelta[] = conceptIds.map((id) => {
      const start = Number(startMasteries[id] ?? 0.0);
      const end = Number(endMasteries[id] ?? start);
      const name = conceptNames[id] || id;

      const conceptAttempts = attempts.filter(
        (a: any) => a.conceptId === id || a.conceptName === name
      );
      const correct = conceptAttempts.filter((a: any) => a.isCorrect).length;

      return {
        conceptName: name,
        startMastery: start,
        endMastery: end,
        delta: Number((end - start).toFixed(3)),
        attemptsCount: conceptAttempts.length,
        correctCount: correct,
      };
    });

    const totalAttempts = attempts.length;
    const totalCorrect = attempts.filter((a: any) => a.isCorrect).length;
    const accuracy =
      totalAttempts > 0 ? Number((totalCorrect / totalAttempts).toFixed(2)) : 0;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== "") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
You are an expert Computer Science educator and cognitive diagnostic evaluator for "LearnLoop", an adaptive learning platform.
A student just completed an adaptive learning session with the following metrics:

Total Questions Answered: ${totalAttempts}
Overall Session Accuracy: ${(accuracy * 100).toFixed(0)}%

Concept Mastery Before vs After:
${deltas
  .map(
    (d) =>
      `- Concept: "${d.conceptName}" | Start: ${(d.startMastery * 100).toFixed(0)}% -> End: ${(d.endMastery * 100).toFixed(0)}% (Change: ${d.delta >= 0 ? "+" : ""}${(d.delta * 100).toFixed(0)}%) | Attempts: ${d.attemptsCount} (${d.correctCount} correct)`
  )
  .join("\n")}

Write a concise, plain-English summary of what changed during this session.
Structure it with:
1. "Session Snapshot" (1-2 sentences on overall trajectory)
2. "Strengths & Growth" (highlights of concepts where mastery increased)
3. "Vulnerabilities & Blindspots" (concepts where difficulty challenges caused dips or stagnation)
4. "Next Best Move" (concrete recommendation on which concept to review next based on earliest gaps < 60%)

Keep the tone encouraging, technical yet accessible, direct, and actionable. Avoid generic fluff.
`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        if (responseText && responseText.trim().length > 0) {
          return NextResponse.json({
            summary: responseText,
            provider: "gemini-1.5-flash",
            deltas,
            totalAttempts,
            accuracy,
          });
        }
      } catch (geminiError: any) {
        console.warn(
          "Gemini API call failed, falling back to smart local summary:",
          geminiError?.message
        );
      }
    }

    // Fallback: smart heuristic diagnostic summary
    const localSummary = generateLocalSmartSummary(
      deltas,
      totalAttempts,
      accuracy
    );

    return NextResponse.json({
      summary: localSummary,
      provider: "smart-diagnostic-engine",
      deltas,
      totalAttempts,
      accuracy,
    });
  } catch (error: any) {
    console.error("Error generating session summary:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate session summary" },
      { status: 500 }
    );
  }
}
