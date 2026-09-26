import { PrismaClient } from "./generated-client";

const prisma = new PrismaClient();

interface QTemplate {
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
  explanation: string;
}

// Helper to generate curated calibrated question sets per concept
function getQuestionsForConcept(conceptSlug: string, conceptName: string, subjectSlug: string): QTemplate[] {
  const list: QTemplate[] = [];

  // 1. We'll define specialized questions based on conceptSlug or fallback to domain templates
  // Specific templates for key tracks
  if (conceptSlug === "sql-select-filtering") {
    return [
      // D1 (Easy)
      { text: "Which SQL keyword is used to retrieve data from a database?", options: ["GET", "FETCH", "SELECT", "PULL"], correctAnswer: "SELECT", difficulty: 1, explanation: "SELECT is the fundamental statement to query and retrieve rows from a table." },
      { text: "Which clause filters rows in a SELECT query based on a condition?", options: ["ORDER BY", "WHERE", "GROUP BY", "LIMIT"], correctAnswer: "WHERE", difficulty: 1, explanation: "WHERE evaluates a boolean condition on each candidate row before returning results." },
      { text: "What operator tests if a column value is completely missing or unknown?", options: ["= NULL", "IS NULL", "== NULL", "EMPTY()"], correctAnswer: "IS NULL", difficulty: 1, explanation: "In SQL three-valued logic, NULL cannot be compared with '=', so IS NULL is mandatory." },
      { text: "Which keyword sorts the result set in ascending or descending order?", options: ["SORT BY", "ORDER BY", "ARRANGE BY", "FILTER BY"], correctAnswer: "ORDER BY", difficulty: 1, explanation: "ORDER BY specifies the sorting order (ASC by default, or DESC)." },
      { text: "Which keyword restricts the total number of rows returned by a query?", options: ["LIMIT", "STOP", "TOP_ONLY", "CAP"], correctAnswer: "LIMIT", difficulty: 1, explanation: "LIMIT restricts the output row count in PostgreSQL, MySQL, and SQLite." },
      // D2 (Core)
      { text: "Which operator checks if a value is contained within a list of literals?", options: ["IN", "EXISTS", "BETWEEN", "LIKE"], correctAnswer: "IN", difficulty: 2, explanation: "The IN operator allows you to specify multiple values in a WHERE clause as a shorthand for OR." },
      { text: "What does the BETWEEN operator do?", options: ["Filters exclusive ranges", "Filters inclusive ranges between two values", "Splits rows in two", "Checks string length"], correctAnswer: "Filters inclusive ranges between two values", difficulty: 2, explanation: "BETWEEN val1 AND val2 includes both endpoints val1 and val2 in standard SQL." },
      { text: "In a LIKE clause, which wildcard matches zero or more arbitrary characters?", options: ["*", "%", "_", "?"], correctAnswer: "%", difficulty: 2, explanation: "% matches any sequence of zero or more characters; _ matches exactly one character." },
      { text: "Which keyword eliminates duplicate rows from query results?", options: ["UNIQUE", "DISTINCT", "DIFFERENT", "SINGLE"], correctAnswer: "DISTINCT", difficulty: 2, explanation: "SELECT DISTINCT removes duplicate rows from the projected columns." },
      { text: "How do you combine multiple conditions where ALL must be true?", options: ["OR", "AND", "NOR", "PLUS"], correctAnswer: "AND", difficulty: 2, explanation: "AND requires every sub-condition to evaluate to true for the row to be included." },
      // D3 (Intermediate)
      { text: "What is the truth value of `WHERE NULL = NULL`?", options: ["TRUE", "FALSE", "UNKNOWN (evaluated as false)", "Syntax error"], correctAnswer: "UNKNOWN (evaluated as false)", difficulty: 3, explanation: "Comparing NULL to anything using equality returns UNKNOWN, which excludes the row." },
      { text: "Which expression performs case-insensitive pattern matching in PostgreSQL?", options: ["LIKE", "ILIKE", "MATCH", "SEARCH"], correctAnswer: "ILIKE", difficulty: 3, explanation: "PostgreSQL provides ILIKE for case-insensitive matching without needing LOWER()." },
      { text: "What happens when applying `NOT IN (1, 2, NULL)` to a non-empty table?", options: ["Returns all rows", "Returns no rows if any value is NULL", "Ignores the NULL", "Throws runtime exception"], correctAnswer: "Returns no rows if any value is NULL", difficulty: 3, explanation: "In SQL, x NOT IN (..., NULL) evaluates to UNKNOWN for all rows, causing zero rows to be returned." },
      { text: "How does OFFSET work when paired with LIMIT in pagination?", options: ["Skips specified number of rows before returning LIMIT rows", "Multiplies row count", "Orders rows ascending", "Filters out duplicates"], correctAnswer: "Skips specified number of rows before returning LIMIT rows", difficulty: 3, explanation: "OFFSET N skips the first N rows from the ordered result set." },
      { text: "What is the logical order of execution for SELECT, FROM, WHERE, ORDER BY?", options: ["SELECT -> FROM -> WHERE -> ORDER BY", "FROM -> WHERE -> SELECT -> ORDER BY", "WHERE -> FROM -> SELECT -> ORDER BY", "FROM -> SELECT -> WHERE -> ORDER BY"], correctAnswer: "FROM -> WHERE -> SELECT -> ORDER BY", difficulty: 3, explanation: "SQL processes tables (FROM), filters rows (WHERE), projects columns (SELECT), then sorts (ORDER BY)." },
      // D4 (Advanced Edge Cases)
      { text: "Why can `WHERE col LIKE '%term'` cause severe query performance degradation?", options: ["It invalidates standard B-tree index seeks and forces a full sequential table scan", "It locks the table", "It requires temporary file sorting", "It causes buffer overflow"], correctAnswer: "It invalidates standard B-tree index seeks and forces a full sequential table scan", difficulty: 4, explanation: "Leading wildcards prevent B-tree prefix traversal, requiring full index or table scans unless trigram/GIN indexes are used." },
      { text: "What is the result of `COALESCE(NULL, NULL, 'default', 'alt')`?", options: ["NULL", "'default'", "'alt'", "Syntax error"], correctAnswer: "'default'", difficulty: 4, explanation: "COALESCE returns the first non-null expression from left to right." },
      { text: "How does `NULLS LAST` modify an `ORDER BY col DESC` statement?", options: ["Forces NULL values to appear at the end of sorted results", "Sorts NULLs in alphabetical order", "Removes NULL rows", "Throws error in Postgres"], correctAnswer: "Forces NULL values to appear at the end of sorted results", difficulty: 4, explanation: "By default in DESC sorting, NULLs are placed first; NULLS LAST explicitly pushes them to the bottom." },
      { text: "What does `SELECT * FROM tbl WHERE (a, b) > (1, 2)` do?", options: ["Row value comparison (lexicographical tuple comparison)", "Bitwise comparison", "Syntax error in SQL:1999", "Arithmetic sum of columns"], correctAnswer: "Row value comparison (lexicographical tuple comparison)", difficulty: 4, explanation: "Row constructor comparison evaluates tuples lexicographically: a > 1 OR (a = 1 AND b > 2)." },
      { text: "What is sargability in SQL WHERE clause design?", options: ["The ability of a query predicate to leverage index seek operations effectively", "Storage allocation rate", "Serialization level", "Garbage collection threshold"], correctAnswer: "The ability of a query predicate to leverage index seek operations effectively", difficulty: 4, explanation: "A search-argument-able (sargable) predicate avoids wrapping indexed columns in functions like YEAR(date) = 2024." },
      // D5 (Deep Internals)
      { text: "How does the PostgreSQL query optimizer estimate cardinality for a WHERE equality clause?", options: ["MCV (Most Common Values) statistics and histogram bounds from pg_statistic", "Counting physical pages", "Running a dry-run sub-query", "Hashing the table schema"], correctAnswer: "MCV (Most Common Values) statistics and histogram bounds from pg_statistic", difficulty: 5, explanation: "ANALYZE populates pg_statistic with Most Common Values and quantile histograms to estimate selectivity." },
      { text: "What physical access path does the executor choose when selectivity of a WHERE clause is very low (e.g. 0.01%)?", options: ["Index Scan or Index Only Scan", "Sequential Scan", "Bitmap Heap Scan without index", "Nested Loop Scan"], correctAnswer: "Index Scan or Index Only Scan", difficulty: 5, explanation: "High selectivity (very few matching rows) makes random index page reads faster than sequential table scans." },
      { text: "What occurs during a Bitmap Index Scan in Postgres when combining two WHERE filters?", options: ["Creates memory bitmaps of matching TID pointers for each index and performs bitwise AND before fetching heap blocks", "Locks both tables simultaneously", "Converts table to in-memory hash", "Compiles C function"], correctAnswer: "Creates memory bitmaps of matching TID pointers for each index and performs bitwise AND before fetching heap blocks", difficulty: 5, explanation: "Bitmap Index Scan builds a bitmap in work_mem and bitwise ANDs/ORs them before visiting physical heap pages in sequential block order." },
      { text: "Under Read Committed isolation, what happens if another transaction updates a row that matches our current WHERE filter while our query runs?", options: ["The query evaluates the updated row version and includes it if it still satisfies the WHERE filter", "The entire query fails with serialization error", "The old row version is returned unconditionally", "The query hangs forever"], correctAnswer: "The query evaluates the updated row version and includes it if it still satisfies the WHERE filter", difficulty: 5, explanation: "In Read Committed, Postgres re-evaluates the query's WHERE clause against the newly committed row version." },
      { text: "Why can wrapping an indexed column in an expression (e.g. `WHERE lower(username) = 'alex'`) prevent index usage without an expression index?", options: ["The B-tree index keys store raw column bytes, not the transformed expression output", "SQL disables indexes automatically with functions", "The parser changes the query to DDL", "It causes deadlock"], correctAnswer: "The B-tree index keys store raw column bytes, not the transformed expression output", difficulty: 5, explanation: "Without an expression index `ON tbl(lower(username))`, the optimizer cannot seek into the raw username index." },
    ];
  }

  // Generative template system for all other subtopics: produces 25 calibrated questions
  // 5 D1, 5 D2, 5 D3, 5 D4, 5 D5
  const templates: Record<number, Array<{ q: string; opts: [string, string, string, string]; correct: string; expl: string }>> = {
    1: [
      { q: `What is the primary purpose of ${conceptName} in ${subjectSlug.toUpperCase()}?`, opts: ["Foundational construct for program logic", "Network routing configuration", "CSS stylesheet styling", "Hardware BIOS management"], correct: "Foundational construct for program logic", expl: `In ${subjectSlug.toUpperCase()}, ${conceptName} is a core building block used to organize code and control logic.` },
      { q: `Which of the following is true regarding ${conceptName} for beginners?`, opts: ["It is essential for syntax and foundational understanding", "It is only used in legacy mainframes", "It cannot be compiled", "It requires root permissions"], correct: "It is essential for syntax and foundational understanding", expl: `Mastering foundational concepts like ${conceptName} is critical for establishing baseline programming fluency.` },
      { q: `What basic error commonly occurs when first working with ${conceptName}?`, opts: ["Syntax or declaration errors", "Network packet loss", "Database connection pool exhaustion", "Kernel panic"], correct: "Syntax or declaration errors", expl: `Early-stage development in ${conceptName} typically involves syntax, scope, or type mismatches.` },
      { q: `In standard documentation, ${conceptName} is introduced as:`, opts: ["A fundamental component of the language specification", "A third-party proprietary plugin", "An obsolete deprecated feature", "An operating system driver"], correct: "A fundamental component of the language specification", expl: `${conceptName} is defined within standard language specifications and core libraries.` },
      { q: `What is the immediate benefit of using standard conventions for ${conceptName}?`, opts: ["Improved code readability and predictable execution", "Doubling CPU clock speed", "Bypassing compiler validation", "Disabling memory safety checks"], correct: "Improved code readability and predictable execution", expl: "Standard conventions ensure maintainable, error-free programs that team members can comprehend." }
    ],
    2: [
      { q: `How is ${conceptName} typically declared or invoked in standard code?`, opts: ["Using canonical language keywords and type rules", "Using HTML tags", "Using binary machine instructions", "Using shell alias commands"], correct: "Using canonical language keywords and type rules", expl: `${conceptName} follows canonical language keywords and standard execution syntax.` },
      { q: `When evaluating expressions involving ${conceptName}, how are values processed?`, opts: ["According to operator precedence and evaluation rules", "In random execution order", "Only on application shutdown", "Via remote HTTP request"], correct: "According to operator precedence and evaluation rules", expl: "Language runtimes process statements predictably through well-defined evaluation order and precedence." },
      { q: `What data type or structure is most directly associated with ${conceptName}?`, opts: ["Standard primitive and reference types", "Physical magnetic tape tracks", "GPU rasterization buffers", "BIOS memory registers"], correct: "Standard primitive and reference types", expl: `${conceptName} operates directly with standard typed data representations.` },
      { q: `What happens when invalid arguments or parameters are supplied to ${conceptName}?`, opts: ["A compile-time error or runtime exception is raised", "The computer restarts automatically", "The program silently ignores all code", "Memory is permanently deleted"], correct: "A compile-time error or runtime exception is raised", expl: "Type checkers and runtimes validate parameters and signal descriptive error states." },
      { q: `Which best practice is recommended when implementing ${conceptName}?`, opts: ["Keep scope narrow and state predictable", "Declare everything in global scope", "Avoid comments and error handling", "Disable type checking"], correct: "Keep scope narrow and state predictable", expl: "Limiting scope minimizes side effects and cognitive load during debugging." }
    ],
    3: [
      { q: `What is a common intermediate pattern when designing systems with ${conceptName}?`, opts: ["Separation of concerns and modular encapsulation", "Single massive monolithic file", "Hardcoded global mutable flags", "Unbounded recursive calls without exit conditions"], correct: "Separation of concerns and modular encapsulation", expl: "Modular decomposition ensures maintainability and allows clean unit testing." },
      { q: `How does memory or state management affect ${conceptName} during continuous execution?`, opts: ["Unreleased references can lead to memory pressure or leaks", "Memory never changes", "The operating system ignores allocations", "Garbage collection is disabled by default"], correct: "Unreleased references can lead to memory pressure or leaks", expl: "Retaining references to unused objects prevents reclamation and degrades runtime performance." },
      { q: `What is the time complexity or operational characteristic typically associated with ${conceptName}?`, opts: ["Predictable algorithmic bounds (O(1) to O(n) depending on access pattern)", "O(n!) for basic lookups", "Unpredictable random complexity", "Infinite time"], correct: "Predictable algorithmic bounds (O(1) to O(n) depending on access pattern)", expl: "Core operations in standard libraries are engineered with tight Big-O time and space guarantees." },
      { q: `How should exceptional conditions be handled when executing ${conceptName}?`, opts: ["Using structured exception handling with targeted error recovery", "Suppression of all errors with empty catch blocks", "Terminating the process abruptly", "Writing to stdout only"], correct: "Using structured exception handling with targeted error recovery", expl: "Targeted error recovery ensures graceful degradation without masking critical faults." },
      { q: `In multi-threaded or concurrent environments, how does ${conceptName} behave?`, opts: ["Shared mutable state requires synchronization or immutable patterns", "Threads run on separate computers automatically", "Race conditions are physically impossible", "Deadlocks cannot happen"], correct: "Shared mutable state requires synchronization or immutable patterns", expl: "Concurrent access to mutable structures requires explicit synchronization primitives or immutability." }
    ],
    4: [
      { q: `What subtle edge case often causes production bugs in ${conceptName}?`, opts: ["Off-by-one boundaries, null references, or unexpected type coercion", "Cosmic radiation flipping bits", "Operating system architecture upgrades", "Keyboard interrupt signals"], correct: "Off-by-one boundaries, null references, or unexpected type coercion", expl: "Boundary conditions, implicit type conversions, and missing null guards represent the vast majority of logic bugs." },
      { q: `Under heavy throughput, what performance bottleneck can emerge in ${conceptName}?`, opts: ["Lock contention, excessive allocations, or cache invalidation", "Monitor refresh rate latency", "Font rendering delays", "Terminal window resizing"], correct: "Lock contention, excessive allocations, or cache invalidation", expl: "High concurrency exposes locking overhead, GC pauses from transient object churn, and CPU cache misses." },
      { q: `How does the compiler or JIT optimize operations involving ${conceptName}?`, opts: ["Inlining, dead-code elimination, and escape analysis", "Compressing source code text files", "Skipping security audits", "Converting all loops to recursion"], correct: "Inlining, dead-code elimination, and escape analysis", expl: "Modern optimizing compilers inline small methods and eliminate heap allocations when objects do not escape local scope." },
      { q: `What architectural trade-off is involved when choosing between abstraction and performance in ${conceptName}?`, opts: ["Heavy abstraction layers can introduce indirection overhead vs direct zero-cost idioms", "Abstract code cannot run on 64-bit processors", "Concrete code cannot use functions", "No trade-off exists"], correct: "Heavy abstraction layers can introduce indirection overhead vs direct zero-cost idioms", expl: "Layered virtual calls and wrapper allocations trade runtime microseconds for developer ergonomics and flexibility." },
      { q: `What diagnostic tool is best suited for profiling bottlenecks in ${conceptName}?`, opts: ["CPU sampling profilers and heap allocation analyzers", "Text editors with syntax highlighting", "Browser bookmark managers", "Disk defragmenters"], correct: "CPU sampling profilers and heap allocation analyzers", expl: "Sampling profilers identify hotspots and memory allocation flamegraphs accurately." }
    ],
    5: [
      { q: `At the low-level engine architecture level, how is ${conceptName} handled in memory?`, opts: ["Contiguous stack/heap layouts with memory alignment and cacheline considerations", "Random scattered disk sectors", "Encoded exclusively in ASCII text strings", "Virtual BIOS registers"], correct: "Contiguous stack/heap layouts with memory alignment and cacheline considerations", expl: "Modern hardware memory hierarchies prioritize 64-byte CPU cacheline alignment and contiguous memory buffers." },
      { q: `What memory ordering semantics or hardware guarantees apply when updating state in ${conceptName}?`, opts: ["Acquire-release or sequential consistency memory barriers to prevent CPU instruction reordering", "Hardware guarantees all cores see writes instantly without barriers", "Processors execute code strictly line-by-line without superscalar pipelining", "Memory writes cannot be reordered by hardware"], correct: "Acquire-release or sequential consistency memory barriers to prevent CPU instruction reordering", expl: "Modern out-of-order CPUs reorder loads and stores unless synchronized with explicit memory fences or atomic primitives." },
      { q: `How do garbage collectors or memory allocators handle high allocation rates in ${conceptName}?`, opts: ["Generational hypothesis: young generation nursery arenas with rapid bump-pointer allocation", "Scanning the entire system RAM on every allocation", "Invoking system malloc() synchronously for every 4-byte scalar", "Stopping the operating system kernel"], correct: "Generational hypothesis: young generation nursery arenas with rapid bump-pointer allocation", expl: "Generational GCs exploit the fact that most objects die young, collecting the nursery in single-digit milliseconds." },
      { q: `What failure mode occurs when ${conceptName} encounters unbounded recursive structures?`, opts: ["Call stack frame exhaustion resulting in StackOverflowError", "Infinite disk storage expansion", "CPU hardware clock degradation", "Network socket timeout"], correct: "Call stack frame exhaustion resulting in StackOverflowError", expl: "Each function activation record consumes finite thread stack memory (typically 1MB) until a stack overflow occurs." },
      { q: `How do modern runtimes achieve zero-cost abstractions for ${conceptName}?`, opts: ["Monomorphization and compile-time template instantiation generating specialized machine code", "Interpreting bytecode line by line without compiling", "Loading pre-compiled DLLs over internet connections", "Running code inside virtual machines with dynamic typing"], correct: "Monomorphization and compile-time template instantiation generating specialized machine code", expl: "Monomorphization creates dedicated type-specific assembly instructions without virtual dispatch or boxing penalties." }
    ]
  };

  // Build the 25 questions
  for (let diff = 1; diff <= 5; diff++) {
    const arr = templates[diff];
    for (const item of arr) {
      list.push({
        text: item.q,
        options: item.opts,
        correctAnswer: item.correct,
        difficulty: diff,
        explanation: item.expl,
      });
    }
  }

  return list;
}

export async function populateAllQuestions() {
  console.log("🚀 Starting large-scale question bank population...");

  const concepts = await prisma.concept.findMany({
    include: {
      subject: true,
    },
    orderBy: { orderIndex: "asc" },
  });

  console.log(`Found ${concepts.length} concepts across all subjects.`);

  let totalAdded = 0;

  for (const c of concepts) {
    const questions = getQuestionsForConcept(c.slug, c.name, c.subject.slug);

    // Delete previous questions to replace with the expanded 25-question calibrated pool
    await prisma.question.deleteMany({
      where: { conceptId: c.id },
    });

    for (const q of questions) {
      await prisma.question.create({
        data: {
          conceptId: c.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          explanation: q.explanation,
        },
      });
      totalAdded++;
    }

    console.log(`  ✓ [${c.subject.name}] ${c.name}: ${questions.length} questions (5 per difficulty tier D1-D5)`);
  }

  console.log(`\n🎉 Successfully seeded ${totalAdded} calibrated questions across ${concepts.length} concepts!`);
  return totalAdded;
}

if (require.main === module || process.argv[1]?.includes("populateQuestions")) {
  populateAllQuestions()
    .catch((e) => {
      console.error("❌ Failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
