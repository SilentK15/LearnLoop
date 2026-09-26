import { prisma } from "./prisma";
import { runSeed } from "../../prisma/seed";

export async function getDemoStudent() {
  let student = await prisma.student.findFirst({
    where: {
      OR: [
        { email: "demo@learnloop.dev" },
        { email: "demo@hackstreak.dev" },
      ],
    },
  });

  if (!student) {
    console.log("No demo student found. Automatically running seed...");
    await runSeed();
    student = await prisma.student.findFirst({
      where: {
        OR: [
          { email: "demo@learnloop.dev" },
          { email: "demo@hackstreak.dev" },
        ],
      },
    });
  }

  if (!student) {
    throw new Error("Unable to initialize demo student.");
  }

  return student;
}
