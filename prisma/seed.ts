import { PrismaClient } from "@prisma/client";
import { SEED_CONCEPTS } from "./seedData";

const prisma = new PrismaClient();

export async function runSeed() {
  console.log("🌱 Starting database seed...");

  // 1. Ensure Demo Student exists
  const demoStudent = await prisma.student.upsert({
    where: { email: "demo@hackstreak.dev" },
    update: { name: "Alex Rivera (Demo Student)" },
    create: {
      name: "Alex Rivera (Demo Student)",
      email: "demo@hackstreak.dev",
    },
  });

  console.log(`👤 Demo Student verified: ${demoStudent.name} (${demoStudent.id})`);

  // Clear previous attempt logs for demo student to ensure a fresh baseline
  await prisma.attemptLog.deleteMany({
    where: { studentId: demoStudent.id },
  });

  let totalQuestionsCount = 0;

  // 2. Iterate through concepts and insert
  for (const c of SEED_CONCEPTS) {
    const concept = await prisma.concept.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        orderIndex: c.orderIndex,
      },
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description,
        orderIndex: c.orderIndex,
      },
    });

    // Delete existing questions for this concept to maintain clean calibrated set
    await prisma.question.deleteMany({
      where: { conceptId: concept.id },
    });

    // Bulk insert calibrated questions
    for (const q of c.questions) {
      await prisma.question.create({
        data: {
          conceptId: concept.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          explanation: q.explanation,
        },
      });
      totalQuestionsCount++;
    }

    // Set or reset initial baseline mastery score
    await prisma.masteryScore.upsert({
      where: {
        studentId_conceptId: {
          studentId: demoStudent.id,
          conceptId: concept.id,
        },
      },
      update: {
        score: c.initialMastery,
      },
      create: {
        studentId: demoStudent.id,
        conceptId: concept.id,
        score: c.initialMastery,
      },
    });

    console.log(`  ✓ Concept [${c.orderIndex}]: ${c.name} (Base Mastery: ${(c.initialMastery * 100).toFixed(0)}%, Questions: ${c.questions.length})`);
  }

  console.log(`\n🎉 Seed completed successfully!`);
  console.log(`📊 Total Concepts: ${SEED_CONCEPTS.length}`);
  console.log(`❓ Total Questions Seeded: ${totalQuestionsCount}`);
  console.log(`🎯 Recommended Next Concept (earliest < 0.60): Functions & Scope (52%)\n`);

  return { demoStudentId: demoStudent.id, totalQuestionsCount };
}

if (require.main === module || process.argv[1]?.includes("seed")) {
  runSeed()
    .catch((e) => {
      console.error("❌ Seed failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
