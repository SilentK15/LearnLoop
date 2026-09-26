import { prisma } from "./prisma";
import { runSeed } from "../../prisma/seed";

export async function getStudent(userEmail?: string | null) {
  const cleanEmail = userEmail?.trim().toLowerCase();

  // If a real user email is provided (not demo)
  if (
    cleanEmail &&
    cleanEmail !== "demo@hackstreak.dev" &&
    cleanEmail !== "demo@learnloop.dev" &&
    cleanEmail !== "demo"
  ) {
    let student = await prisma.student.findUnique({
      where: { email: cleanEmail },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
        },
      });
    }
    return student;
  }

  // Fallback to demo student
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

export async function getDemoStudent() {
  return getStudent(null);
}
