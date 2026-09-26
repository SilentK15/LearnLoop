import { PrismaClient } from "./generated-client";
import { SEED_SUBJECTS } from "./seedData";

const prisma = new PrismaClient();

export async function runSeed() {
  console.log("🌱 Starting database seed with 6 Subjects...");

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

  // Clear previous attempt logs for demo student
  await prisma.attemptLog.deleteMany({
    where: { studentId: demoStudent.id },
  });

  let totalQuestionsCount = 0;
  let totalConceptsCount = 0;

  // 2. Iterate through Subjects and Concepts
  for (const s of SEED_SUBJECTS) {
    const subject = await prisma.subject.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        description: s.description,
        icon: s.icon,
        color: s.color,
        orderIndex: s.orderIndex,
      },
      create: {
        name: s.name,
        slug: s.slug,
        description: s.description,
        icon: s.icon,
        color: s.color,
        orderIndex: s.orderIndex,
      },
    });

    console.log(`\n📚 Subject [${s.orderIndex}]: ${s.name} (${s.slug})`);

    for (const c of s.concepts) {
      const concept = await prisma.concept.upsert({
        where: { slug: c.slug },
        update: {
          subjectId: subject.id,
          name: c.name,
          description: c.description,
          orderIndex: c.orderIndex,
        },
        create: {
          subjectId: subject.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          orderIndex: c.orderIndex,
        },
      });
      totalConceptsCount++;

      // Delete existing questions for this concept to maintain clean calibrated set
      await prisma.question.deleteMany({
        where: { conceptId: concept.id },
      });

      // Insert calibrated questions
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

      // Set initial baseline mastery score for demo student
      // Provide realistic demo baseline on the first subject (SQL) so demo evaluation works out-of-the-box
      let demoScore = c.initialMastery;
      if (s.slug === "sql") {
        const demoDefaults = [0.85, 0.70, 0.52, 0.40, 0.25, 0.10];
        demoScore = demoDefaults[c.orderIndex - 1] ?? 0.0;
      }

      await prisma.masteryScore.upsert({
        where: {
          studentId_conceptId: {
            studentId: demoStudent.id,
            conceptId: concept.id,
          },
        },
        update: {
          score: demoScore,
        },
        create: {
          studentId: demoStudent.id,
          conceptId: concept.id,
          score: demoScore,
        },
      });

      console.log(`  ✓ Concept [${c.orderIndex}]: ${c.name} (${c.questions.length} questions, Demo Mastery: ${(demoScore * 100).toFixed(0)}%)`);
    }
  }

  console.log(`\n🎉 Seed completed successfully!`);
  console.log(`📚 Total Subjects: ${SEED_SUBJECTS.length}`);
  console.log(`📊 Total Concepts: ${totalConceptsCount}`);
  console.log(`❓ Total Questions Seeded: ${totalQuestionsCount}\n`);

  return { demoStudentId: demoStudent.id, totalQuestionsCount, totalConceptsCount };
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
