export interface SeedQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
  explanation: string;
}

export interface SeedConcept {
  name: string;
  slug: string;
  description: string;
  orderIndex: number;
  initialMastery: number;
  questions: SeedQuestion[];
}

export interface SeedSubject {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  concepts: SeedConcept[];
}

export const SEED_SUBJECTS: SeedSubject[] = [
  // ─── SQL ──────────────────────────────────────────────────────────────────
  {
    name: "SQL",
    slug: "sql",
    description: "Structured Query Language for relational databases.",
    icon: "Database",
    color: "#2563EB",
    orderIndex: 1,
    concepts: [
      {
        name: "SELECT & Filtering",
        slug: "sql-select-filtering",
        description: "Writing SELECT queries, WHERE clauses, LIKE, IN, BETWEEN, and NULL handling.",
        orderIndex: 1,
        initialMastery: 0.0,
        questions: [
          { text: "Which SQL clause is used to filter rows returned by a SELECT statement?", options: ["ORDER BY", "GROUP BY", "WHERE", "HAVING"], correctAnswer: "WHERE", difficulty: 1, explanation: "WHERE filters individual rows before any grouping occurs." },
          { text: "What does `SELECT * FROM students WHERE grade IS NULL` return?", options: ["Rows where grade equals 0", "Rows where grade is NULL", "All rows", "An error"], correctAnswer: "Rows where grade is NULL", difficulty: 1, explanation: "IS NULL correctly tests for missing values; = NULL never matches any row." },
          { text: "Which operator checks if a value falls within a range (inclusive)?", options: ["IN", "BETWEEN", "LIKE", "EXISTS"], correctAnswer: "BETWEEN", difficulty: 2, explanation: "BETWEEN a AND b includes both endpoints a and b." },
          { text: "Which wildcard matches any single character in a LIKE pattern?", options: ["%", "_", "*", "?"], correctAnswer: "_", difficulty: 2, explanation: "The underscore _ matches exactly one character; % matches zero or more." },
          { text: "What is the result of `SELECT DISTINCT city FROM customers`?", options: ["Returns all cities including duplicates", "Returns only unique city values", "Returns city counts", "Throws an error"], correctAnswer: "Returns only unique city values", difficulty: 3, explanation: "DISTINCT eliminates duplicate values from the result set." },
        ],
      },
      {
        name: "JOINs",
        slug: "sql-joins",
        description: "INNER, LEFT, RIGHT, FULL OUTER, and CROSS JOINs explained.",
        orderIndex: 2,
        initialMastery: 0.0,
        questions: [
          { text: "Which JOIN returns only rows that have matching values in both tables?", options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL OUTER JOIN"], correctAnswer: "INNER JOIN", difficulty: 1, explanation: "INNER JOIN returns the intersection — rows with matches on both sides." },
          { text: "A LEFT JOIN between Orders and Customers returns:", options: ["Only matched orders", "All orders, with NULL for customers that have no match", "All customers, with NULL for orders that have no match", "All rows from both tables"], correctAnswer: "All orders, with NULL for customers that have no match", difficulty: 2, explanation: "LEFT JOIN keeps every row from the left (first) table, filling NULLs where the right table has no match." },
          { text: "How many rows does a CROSS JOIN of a 3-row table and a 4-row table produce?", options: ["7", "3", "12", "1"], correctAnswer: "12", difficulty: 2, explanation: "CROSS JOIN produces the Cartesian product: 3 × 4 = 12 rows." },
          { text: "Which JOIN type returns all rows from both tables, with NULLs for non-matching rows?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], correctAnswer: "FULL OUTER JOIN", difficulty: 3, explanation: "FULL OUTER JOIN is the union of LEFT and RIGHT JOINs." },
          { text: "What is a self-join used for?", options: ["Joining a table with itself to compare rows within the same table", "Creating a copy of a table", "Joining two different databases", "Removing duplicates"], correctAnswer: "Joining a table with itself to compare rows within the same table", difficulty: 3, explanation: "Self-joins use table aliases to reference the same table twice, useful for hierarchical data like employee-manager relationships." },
        ],
      },
      {
        name: "Aggregation & GROUP BY",
        slug: "sql-aggregation-groupby",
        description: "COUNT, SUM, AVG, MIN, MAX, GROUP BY, and HAVING.",
        orderIndex: 3,
        initialMastery: 0.0,
        questions: [
          { text: "Which aggregate function counts the number of non-NULL values in a column?", options: ["SUM()", "AVG()", "COUNT()", "MAX()"], correctAnswer: "COUNT()", difficulty: 1, explanation: "COUNT(column) counts non-NULL values; COUNT(*) counts all rows." },
          { text: "What is the difference between WHERE and HAVING?", options: ["WHERE filters groups; HAVING filters rows", "HAVING filters groups after GROUP BY; WHERE filters rows before grouping", "They are interchangeable", "HAVING is used without GROUP BY"], correctAnswer: "HAVING filters groups after GROUP BY; WHERE filters rows before grouping", difficulty: 2, explanation: "WHERE runs before aggregation; HAVING filters the aggregated groups." },
          { text: "Which query finds departments with more than 5 employees?", options: ["SELECT dept FROM emp WHERE COUNT(*) > 5", "SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING COUNT(*) > 5", "SELECT dept FROM emp HAVING COUNT(*) > 5", "SELECT dept FROM emp GROUP BY dept WHERE COUNT(*) > 5"], correctAnswer: "SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING COUNT(*) > 5", difficulty: 2, explanation: "GROUP BY aggregates by dept; HAVING filters the aggregate result." },
          { text: "What does AVG(salary) return if all salary values are NULL?", options: ["0", "NULL", "Error", "Infinity"], correctAnswer: "NULL", difficulty: 3, explanation: "All SQL aggregate functions (except COUNT(*)) return NULL when applied to an empty or all-NULL set." },
          { text: "What is the ORDER of execution: WHERE, GROUP BY, HAVING, SELECT?", options: ["SELECT → WHERE → GROUP BY → HAVING", "WHERE → GROUP BY → HAVING → SELECT", "GROUP BY → WHERE → SELECT → HAVING", "HAVING → WHERE → GROUP BY → SELECT"], correctAnswer: "WHERE → GROUP BY → HAVING → SELECT", difficulty: 3, explanation: "SQL logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT." },
        ],
      },
      {
        name: "Subqueries & CTEs",
        slug: "sql-subqueries-ctes",
        description: "Correlated subqueries, EXISTS, IN, and WITH (Common Table Expressions).",
        orderIndex: 4,
        initialMastery: 0.0,
        questions: [
          { text: "A subquery in the WHERE clause is called a:", options: ["CTE", "Scalar subquery", "Correlated subquery", "Nested query"], correctAnswer: "Nested query", difficulty: 1, explanation: "A query inside another query's WHERE/FROM/SELECT is a subquery or nested query." },
          { text: "What is a correlated subquery?", options: ["A subquery that runs once for the whole outer query", "A subquery that references a column from the outer query and runs once per row", "A subquery that uses a CTE", "A subquery without a WHERE clause"], correctAnswer: "A subquery that references a column from the outer query and runs once per row", difficulty: 2, explanation: "Correlated subqueries depend on the outer query row values and are re-evaluated for each row." },
          { text: "Which keyword checks whether a subquery returns at least one row?", options: ["IN", "EXISTS", "ANY", "ALL"], correctAnswer: "EXISTS", difficulty: 2, explanation: "EXISTS returns TRUE if the subquery returns one or more rows, regardless of values." },
          { text: "What is a CTE (Common Table Expression)?", options: ["A permanent table", "A named temporary result set defined with WITH, usable within the main query", "A type of index", "A stored procedure"], correctAnswer: "A named temporary result set defined with WITH, usable within the main query", difficulty: 3, explanation: "CTEs improve readability and allow recursive queries." },
          { text: "Which scenario benefits most from a recursive CTE?", options: ["Summing a column", "Traversing hierarchical data like org charts or category trees", "Joining two tables", "Filtering by date"], correctAnswer: "Traversing hierarchical data like org charts or category trees", difficulty: 3, explanation: "Recursive CTEs allow querying parent-child relationships iteratively without knowing depth." },
        ],
      },
      {
        name: "Indexes & Performance",
        slug: "sql-indexes-performance",
        description: "B-tree indexes, composite indexes, EXPLAIN plans, and query optimization.",
        orderIndex: 5,
        initialMastery: 0.0,
        questions: [
          { text: "What is the primary purpose of a database index?", options: ["To enforce data integrity", "To speed up data retrieval at the cost of additional write overhead", "To compress table data", "To store backups"], correctAnswer: "To speed up data retrieval at the cost of additional write overhead", difficulty: 1, explanation: "Indexes allow the database engine to find rows without scanning every row, but they slow down INSERT/UPDATE/DELETE operations." },
          { text: "Which index type does PostgreSQL and MySQL use by default?", options: ["Hash index", "Bitmap index", "B-tree index", "Full-text index"], correctAnswer: "B-tree index", difficulty: 2, explanation: "B-tree (balanced tree) indexes efficiently handle equality, range queries, and sorting." },
          { text: "When is a composite index (a, b) NOT used?", options: ["WHERE a = 1 AND b = 2", "WHERE a = 1", "WHERE b = 2", "ORDER BY a, b"], correctAnswer: "WHERE b = 2", difficulty: 2, explanation: "Composite indexes follow the leftmost-prefix rule. Filtering only on the second column (b) cannot use the index efficiently." },
          { text: "What does an EXPLAIN/EXPLAIN ANALYZE query show?", options: ["Actual data in the table", "The query execution plan including estimated cost, row counts, and scan types", "Foreign key relationships", "Table column types"], correctAnswer: "The query execution plan including estimated cost, row counts, and scan types", difficulty: 3, explanation: "EXPLAIN reveals whether the planner chose a sequential scan, index scan, nested loop join, etc." },
          { text: "What is a covering index?", options: ["An index that covers the whole table", "An index that includes all columns needed by a query, eliminating table heap lookups", "A partial index on NULL values", "A foreign key index"], correctAnswer: "An index that includes all columns needed by a query, eliminating table heap lookups", difficulty: 3, explanation: "When the index contains all queried columns, the engine reads only the index pages — an 'index-only scan'." },
        ],
      },
      {
        name: "Transactions & ACID",
        slug: "sql-transactions-acid",
        description: "COMMIT, ROLLBACK, SAVEPOINT, isolation levels, and ACID guarantees.",
        orderIndex: 6,
        initialMastery: 0.0,
        questions: [
          { text: "What does ACID stand for in database transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Availability, Consistency, Integrity, Durability", "Atomicity, Concurrency, Isolation, Distribution", "Access, Control, Index, Data"], correctAnswer: "Atomicity, Consistency, Isolation, Durability", difficulty: 1, explanation: "ACID guarantees that transactions are reliable even in failure scenarios." },
          { text: "Which SQL statement undoes all changes made in the current transaction?", options: ["COMMIT", "SAVEPOINT", "ROLLBACK", "TRUNCATE"], correctAnswer: "ROLLBACK", difficulty: 1, explanation: "ROLLBACK reverts all statements in the current transaction to the last COMMIT." },
          { text: "What is a 'dirty read' in database isolation?", options: ["Reading data committed by another transaction", "Reading uncommitted data from another in-progress transaction", "Reading NULL values", "Reading from a corrupted index"], correctAnswer: "Reading uncommitted data from another in-progress transaction", difficulty: 2, explanation: "Dirty reads occur at the READ UNCOMMITTED isolation level and can return inconsistent data if the other transaction rolls back." },
          { text: "Which isolation level prevents dirty reads but allows non-repeatable reads?", options: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"], correctAnswer: "READ COMMITTED", difficulty: 2, explanation: "READ COMMITTED only sees committed data but allows another transaction to change that data between two reads in the same transaction." },
          { text: "What is a phantom read?", options: ["Reading a row that was deleted", "Seeing new rows inserted by another committed transaction within the same query repeated twice", "A read that returns NULL", "A read caused by a corrupt buffer"], correctAnswer: "Seeing new rows inserted by another committed transaction within the same query repeated twice", difficulty: 3, explanation: "Phantom reads happen at REPEATABLE READ level when another transaction inserts rows matching the current WHERE clause between two identical SELECT statements." },
        ],
      },
    ],
  },

  // ─── Java ─────────────────────────────────────────────────────────────────
  {
    name: "Java",
    slug: "java",
    description: "Core Java programming: OOP, memory, concurrency and more.",
    icon: "Coffee",
    color: "#DC2626",
    orderIndex: 2,
    concepts: [
      {
        name: "OOP Fundamentals",
        slug: "java-oop-fundamentals",
        description: "Classes, objects, inheritance, encapsulation, and polymorphism in Java.",
        orderIndex: 1,
        initialMastery: 0.0,
        questions: [
          { text: "Which keyword is used to inherit a class in Java?", options: ["implements", "extends", "inherits", "super"], correctAnswer: "extends", difficulty: 1, explanation: "extends is used for class inheritance in Java; implements is used for interfaces." },
          { text: "What is encapsulation in Java?", options: ["Breaking a class into smaller classes", "Hiding internal state and requiring all interaction to go through methods", "Making all fields public", "Using multiple constructors"], correctAnswer: "Hiding internal state and requiring all interaction to go through methods", difficulty: 1, explanation: "Encapsulation uses private fields with public getters/setters to control access." },
          { text: "What is method overriding?", options: ["Defining multiple methods with the same name but different parameters", "Redefining a parent class method in a subclass with the same signature", "Making a method static", "Calling a method from the constructor"], correctAnswer: "Redefining a parent class method in a subclass with the same signature", difficulty: 2, explanation: "Overriding enables runtime polymorphism — the JVM calls the subclass version based on the actual object type." },
          { text: "What is the output if a parent class method is called with `super.method()`?", options: ["Compile error", "Calls the parent class version of the method", "Calls the child class version", "Calls the grandparent version"], correctAnswer: "Calls the parent class version of the method", difficulty: 2, explanation: "super.method() explicitly invokes the immediate parent's version of an overridden method." },
          { text: "Can a Java class extend multiple classes?", options: ["Yes, using commas", "No, Java only supports single inheritance for classes", "Yes, using the implements keyword", "Only abstract classes can"], correctAnswer: "No, Java only supports single inheritance for classes", difficulty: 3, explanation: "Java avoids the diamond problem by allowing only single class inheritance, but a class can implement multiple interfaces." },
        ],
      },
      {
        name: "Interfaces & Abstract Classes",
        slug: "java-interfaces-abstract",
        description: "Interface default methods, abstract classes, and when to use each.",
        orderIndex: 2,
        initialMastery: 0.0,
        questions: [
          { text: "Which of the following can have a constructor?", options: ["Interface", "Abstract class", "Both", "Neither"], correctAnswer: "Abstract class", difficulty: 1, explanation: "Abstract classes can have constructors (called by subclasses via super()); interfaces cannot." },
          { text: "Can an interface have a method with a body in Java 8+?", options: ["No", "Yes, using the default keyword", "Yes, only if the method is static", "Only in functional interfaces"], correctAnswer: "Yes, using the default keyword", difficulty: 2, explanation: "Java 8 introduced default methods in interfaces to add implementations without breaking existing classes." },
          { text: "What is a functional interface in Java?", options: ["An interface with no methods", "An interface with exactly one abstract method", "An interface that only has default methods", "An interface that extends Runnable"], correctAnswer: "An interface with exactly one abstract method", difficulty: 2, explanation: "Functional interfaces (e.g. Runnable, Comparator) can be used with lambda expressions." },
          { text: "What keyword marks a class that cannot be instantiated directly?", options: ["final", "static", "abstract", "private"], correctAnswer: "abstract", difficulty: 1, explanation: "Abstract classes must be subclassed; calling new AbstractClass() causes a compile error." },
          { text: "A class implements two interfaces with the same default method. What happens?", options: ["The first interface's method wins", "The class must override the conflicting method", "Compile error always", "Runtime exception"], correctAnswer: "The class must override the conflicting method", difficulty: 3, explanation: "Java requires the implementing class to explicitly override any ambiguous default methods to resolve the conflict." },
        ],
      },
      {
        name: "Collections Framework",
        slug: "java-collections-framework",
        description: "ArrayList, LinkedList, HashMap, HashSet, TreeMap, and iteration patterns.",
        orderIndex: 3,
        initialMastery: 0.0,
        questions: [
          { text: "Which Java collection maintains insertion order and allows duplicates?", options: ["HashSet", "TreeSet", "ArrayList", "HashMap"], correctAnswer: "ArrayList", difficulty: 1, explanation: "ArrayList is an ordered list backed by a dynamic array that allows duplicate elements." },
          { text: "What is the average time complexity of get(key) in a HashMap?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: "O(1)", difficulty: 1, explanation: "HashMap uses hash codes to locate buckets, giving O(1) average lookup." },
          { text: "Which collection sorts elements in their natural order automatically?", options: ["LinkedList", "ArrayList", "HashSet", "TreeSet"], correctAnswer: "TreeSet", difficulty: 2, explanation: "TreeSet uses a Red-Black tree to maintain sorted natural order (or a custom Comparator)." },
          { text: "What is the difference between Iterator and ListIterator?", options: ["They are identical", "ListIterator can traverse in both directions and supports add/set; Iterator only goes forward", "Iterator is faster", "ListIterator works only with arrays"], correctAnswer: "ListIterator can traverse in both directions and supports add/set; Iterator only goes forward", difficulty: 2, explanation: "ListIterator extends Iterator with hasPrevious(), previous(), add(), and set() methods." },
          { text: "What does ConcurrentModificationException indicate?", options: ["A null pointer in a collection", "A collection was structurally modified while being iterated without using Iterator.remove()", "A threading deadlock", "An out-of-bounds access"], correctAnswer: "A collection was structurally modified while being iterated without using Iterator.remove()", difficulty: 3, explanation: "Using a for-each loop and modifying the collection (add/remove) throws ConcurrentModificationException. Use Iterator.remove() instead." },
        ],
      },
      {
        name: "Exception Handling",
        slug: "java-exception-handling",
        description: "Checked vs unchecked exceptions, try-catch-finally, and custom exceptions.",
        orderIndex: 4,
        initialMastery: 0.0,
        questions: [
          { text: "Which block always executes whether or not an exception is thrown?", options: ["try", "catch", "finally", "throws"], correctAnswer: "finally", difficulty: 1, explanation: "The finally block always runs after try/catch, making it ideal for resource cleanup." },
          { text: "What is a checked exception in Java?", options: ["An exception that extends RuntimeException", "An exception the compiler forces you to handle or declare with throws", "Any exception thrown at runtime", "An exception in a catch block"], correctAnswer: "An exception the compiler forces you to handle or declare with throws", difficulty: 2, explanation: "Checked exceptions (e.g. IOException, SQLException) must be caught or declared; unchecked exceptions (RuntimeException subclasses) do not." },
          { text: "What is the parent class of all exceptions and errors in Java?", options: ["Exception", "RuntimeException", "Error", "Throwable"], correctAnswer: "Throwable", difficulty: 2, explanation: "Throwable is the root class. Exception and Error both extend Throwable." },
          { text: "What happens if an exception is thrown inside a finally block?", options: ["It is ignored", "It replaces any exception thrown in the try/catch block", "The program continues normally", "The JVM exits"], correctAnswer: "It replaces any exception thrown in the try/catch block", difficulty: 3, explanation: "If finally itself throws an exception, the original try/catch exception is suppressed and lost unless explicitly handled." },
          { text: "What does try-with-resources accomplish?", options: ["Ensures resources implementing AutoCloseable are closed automatically after the try block", "Catches multiple exceptions in one catch", "Runs try block multiple times", "Creates a copy of the resource"], correctAnswer: "Ensures resources implementing AutoCloseable are closed automatically after the try block", difficulty: 3, explanation: "try(Resource r = new Resource()) automatically calls r.close() at the end, even if an exception occurs." },
        ],
      },
      {
        name: "Generics & Lambdas",
        slug: "java-generics-lambdas",
        description: "Type parameters, bounded wildcards, lambda expressions, and Streams API.",
        orderIndex: 5,
        initialMastery: 0.0,
        questions: [
          { text: "What does List<? extends Number> mean?", options: ["A list of exactly Number", "A list of Number or any subclass (Integer, Double, etc.)", "A list of any type", "A list of Number superclasses"], correctAnswer: "A list of Number or any subclass (Integer, Double, etc.)", difficulty: 2, explanation: "? extends Number is an upper-bounded wildcard — you can read from it as Number but cannot add to it." },
          { text: "Which functional interface does a lambda `(x) -> x * 2` match?", options: ["Runnable", "Supplier<Integer>", "Function<Integer, Integer>", "Consumer<Integer>"], correctAnswer: "Function<Integer, Integer>", difficulty: 2, explanation: "Function<T, R> takes one argument and returns a value. (x) -> x*2 takes Integer and returns Integer." },
          { text: "What does `stream.filter(x -> x > 5).collect(Collectors.toList())` return?", options: ["All elements", "Elements greater than 5 in a new list", "The count of elements > 5", "A sorted list"], correctAnswer: "Elements greater than 5 in a new list", difficulty: 2, explanation: "filter() is an intermediate operation; collect(toList()) is a terminal operation that materialises the stream." },
          { text: "What is type erasure in Java generics?", options: ["Removal of generic type information at runtime by the compiler", "Casting at runtime", "Removing generic methods from bytecode", "Disabling generics in a class"], correctAnswer: "Removal of generic type information at runtime by the compiler", difficulty: 3, explanation: "Java generics are compile-time only; the JVM sees raw types at runtime. This allows backward compatibility but prevents generic type checks at runtime." },
          { text: "What is the difference between map() and flatMap() in Streams?", options: ["They are identical", "map() wraps each element in a new stream; flatMap() flattens nested streams into one stream", "flatMap() is only for strings", "map() flattens, flatMap() wraps"], correctAnswer: "map() wraps each element in a new stream; flatMap() flattens nested streams into one stream", difficulty: 3, explanation: "flatMap() is used when each element produces a Stream, and you want the results merged into a single stream." },
        ],
      },
      {
        name: "Multithreading & Concurrency",
        slug: "java-multithreading-concurrency",
        description: "Thread lifecycle, synchronized, volatile, Executors, and deadlock prevention.",
        orderIndex: 6,
        initialMastery: 0.0,
        questions: [
          { text: "Which method starts a new thread of execution in Java?", options: ["run()", "start()", "execute()", "launch()"], correctAnswer: "start()", difficulty: 1, explanation: "start() creates a new OS thread and invokes run() on it. Calling run() directly just executes in the current thread." },
          { text: "What does the `synchronized` keyword ensure?", options: ["A thread runs at maximum speed", "Only one thread at a time can execute the synchronized block/method on the same object lock", "All threads run in sequence", "A method cannot throw exceptions"], correctAnswer: "Only one thread at a time can execute the synchronized block/method on the same object lock", difficulty: 2, explanation: "synchronized acquires the intrinsic (monitor) lock, preventing race conditions on shared mutable state." },
          { text: "What is a deadlock?", options: ["A thread sleeping for too long", "Two or more threads each waiting for a lock held by the other, resulting in indefinite blocking", "A thread using too much CPU", "An exception thrown in a thread"], correctAnswer: "Two or more threads each waiting for a lock held by the other, resulting in indefinite blocking", difficulty: 2, explanation: "Deadlocks require four conditions: mutual exclusion, hold-and-wait, no preemption, and circular wait." },
          { text: "What does the `volatile` keyword guarantee?", options: ["Thread-safety for compound operations", "That all threads read the variable from main memory, not a cached thread-local copy", "The variable cannot be null", "Atomic increments"], correctAnswer: "That all threads read the variable from main memory, not a cached thread-local copy", difficulty: 3, explanation: "volatile prevents CPU caching of the variable per-thread but does NOT make compound operations (i++) atomic." },
          { text: "What is the advantage of ExecutorService over creating raw Threads?", options: ["It is faster than threads", "It manages a pool of reusable threads, reducing thread creation overhead and enabling task queuing and lifecycle management", "It prevents deadlocks automatically", "It works only for I/O tasks"], correctAnswer: "It manages a pool of reusable threads, reducing thread creation overhead and enabling task queuing and lifecycle management", difficulty: 3, explanation: "ExecutorService decouples task submission from execution, supports thread pooling (ThreadPoolExecutor), and provides Future-based results." },
        ],
      },
    ],
  },

  // ─── Python ───────────────────────────────────────────────────────────────
  {
    name: "Python",
    slug: "python",
    description: "Python programming: syntax, data structures, OOP, and libraries.",
    icon: "Code",
    color: "#F59E0B",
    orderIndex: 3,
    concepts: [
      {
        name: "Python Basics & Syntax",
        slug: "python-basics-syntax",
        description: "Variables, data types, indentation, basic I/O, and control flow.",
        orderIndex: 1,
        initialMastery: 0.0,
        questions: [
          { text: "Which of the following is a valid way to create a multi-line string in Python?", options: ["'Hello\\nWorld'", "\"\"\"Hello\\nWorld\"\"\"", "Hello + World", "(Hello, World)"], correctAnswer: "\"\"\"Hello\\nWorld\"\"\"", difficulty: 1, explanation: "Triple quotes (\"\"\" or ''') create multi-line string literals in Python." },
          { text: "What is the output of `type(3.14)` in Python?", options: ["<class 'int'>", "<class 'double'>", "<class 'float'>", "<class 'number'>"], correctAnswer: "<class 'float'>", difficulty: 1, explanation: "Python's floating-point type is float. There is no double type in Python." },
          { text: "What does `//` operator do in Python?", options: ["Division returning a float", "Floor division (integer division, rounds towards negative infinity)", "Comment marker", "Exponentiation"], correctAnswer: "Floor division (integer division, rounds towards negative infinity)", difficulty: 2, explanation: "// performs floor division: 7//2 = 3, -7//2 = -4 (rounded towards negative infinity)." },
          { text: "What is the result of `bool([])` in Python?", options: ["True", "False", "None", "Error"], correctAnswer: "False", difficulty: 2, explanation: "Empty containers ([], {}, (), '') and zero-like values are falsy in Python." },
          { text: "What is 'duck typing' in Python?", options: ["A type-checking library", "Python checks types strictly at compile time", "Object usability is determined by the presence of methods/attributes, not its actual type", "A pattern to convert types automatically"], correctAnswer: "Object usability is determined by the presence of methods/attributes, not its actual type", difficulty: 3, explanation: "If it walks like a duck and quacks like a duck, it's a duck. Python doesn't require explicit type declarations." },
        ],
      },
      {
        name: "Lists, Tuples & Dictionaries",
        slug: "python-lists-tuples-dicts",
        description: "Mutable vs immutable sequences, dict comprehensions, and slicing.",
        orderIndex: 2,
        initialMastery: 0.0,
        questions: [
          { text: "What is the key difference between a list and a tuple in Python?", options: ["Lists are faster", "Tuples are mutable; lists are immutable", "Lists are mutable; tuples are immutable", "They are identical"], correctAnswer: "Lists are mutable; tuples are immutable", difficulty: 1, explanation: "Lists [] are mutable (can change elements); tuples () are immutable once created." },
          { text: "What does `my_list[1:4]` return?", options: ["Elements at indices 1 and 4", "Elements at indices 1, 2, 3", "Elements from index 1 to end", "Elements at index 4 to end"], correctAnswer: "Elements at indices 1, 2, 3", difficulty: 1, explanation: "Python slicing is [start:stop] where stop is exclusive. [1:4] returns indices 1, 2, 3." },
          { text: "Which statement creates a dictionary comprehension mapping numbers to their squares?", options: ["{x: x**2 for x in range(5)}", "[x: x**2 for x in range(5)]", "{x**2 for x in range(5)}", "(x: x**2 for x in range(5))"], correctAnswer: "{x: x**2 for x in range(5)}", difficulty: 2, explanation: "Dict comprehensions use {key: value for item in iterable} syntax." },
          { text: "What is the time complexity of `in` operator for a Python dict?", options: ["O(n)", "O(log n)", "O(1) average", "O(n²)"], correctAnswer: "O(1) average", difficulty: 2, explanation: "Python dicts are hash tables; key lookup is O(1) average." },
          { text: "What does `*args` in a function definition do?", options: ["Accepts keyword arguments as a dict", "Packs extra positional arguments into a tuple", "Makes all arguments optional", "Unpacks a list"], correctAnswer: "Packs extra positional arguments into a tuple", difficulty: 3, explanation: "*args collects any extra positional arguments into a tuple named args inside the function." },
        ],
      },
      {
        name: "Functions & Decorators",
        slug: "python-functions-decorators",
        description: "First-class functions, closures, lambda, and the decorator pattern.",
        orderIndex: 3,
        initialMastery: 0.0,
        questions: [
          { text: "What is a lambda function?", options: ["A class method", "An anonymous single-expression function", "A recursive function", "A coroutine"], correctAnswer: "An anonymous single-expression function", difficulty: 1, explanation: "lambda args: expression creates an anonymous function returning the expression result." },
          { text: "What does a Python decorator do?", options: ["Adds colour to console output", "Wraps a function to extend or modify its behaviour without changing its code", "Converts a class to a function", "Removes a function's docstring"], correctAnswer: "Wraps a function to extend or modify its behaviour without changing its code", difficulty: 2, explanation: "Decorators use @syntax to wrap functions, commonly used for logging, authentication, and caching." },
          { text: "What is a closure in Python?", options: ["A way to close files", "A function that captures and retains variables from its enclosing lexical scope", "A method that returns None", "A built-in exception"], correctAnswer: "A function that captures and retains variables from its enclosing lexical scope", difficulty: 2, explanation: "Closures allow inner functions to access outer function variables even after the outer function has returned." },
          { text: "What does `functools.lru_cache` do?", options: ["Sorts a function's return value", "Memoizes function results so repeated calls with same arguments use cached results", "Limits recursion depth", "Runs a function asynchronously"], correctAnswer: "Memoizes function results so repeated calls with same arguments use cached results", difficulty: 3, explanation: "lru_cache (Least Recently Used) caches the most recent function call results, dramatically speeding up recursive algorithms like Fibonacci." },
          { text: "What happens when a decorator returns None instead of a wrapper function?", options: ["The original function runs normally", "The decorated name becomes None, causing a TypeError when called", "Python auto-generates a wrapper", "The decorator is ignored"], correctAnswer: "The decorated name becomes None, causing a TypeError when called", difficulty: 3, explanation: "A decorator must return a callable. Returning None replaces the function with None, so calling it raises TypeError." },
        ],
      },
      {
        name: "OOP in Python",
        slug: "python-oop",
        description: "Classes, dunder methods, inheritance, and Python's MRO.",
        orderIndex: 4,
        initialMastery: 0.0,
        questions: [
          { text: "What is the purpose of `__init__` in a Python class?", options: ["Destructor method", "Initialiser called when an instance is created", "Class method decorator", "Static method marker"], correctAnswer: "Initialiser called when an instance is created", difficulty: 1, explanation: "__init__ runs immediately after object creation to set up instance attributes." },
          { text: "What does `@classmethod` do?", options: ["Makes a method private", "Creates a method that receives the class (cls) as first argument instead of the instance", "Creates a method with no arguments", "Makes a method static"], correctAnswer: "Creates a method that receives the class (cls) as first argument instead of the instance", difficulty: 2, explanation: "Class methods operate on the class itself (useful for alternative constructors) rather than an instance." },
          { text: "What is Python's Method Resolution Order (MRO)?", options: ["The order Python searches base classes to find a method in multiple inheritance", "The order methods are defined in a class", "Python's import order", "The order decorators are applied"], correctAnswer: "The order Python searches base classes to find a method in multiple inheritance", difficulty: 2, explanation: "Python uses the C3 linearisation algorithm to determine MRO, accessible via ClassName.mro()." },
          { text: "What does `__str__` define?", options: ["The hash of an object", "The human-readable string representation returned by str() and print()", "The comparison method", "The copy behaviour"], correctAnswer: "The human-readable string representation returned by str() and print()", difficulty: 2, explanation: "__str__ controls what you see when you print an object. __repr__ provides the unambiguous developer representation." },
          { text: "What is the difference between @staticmethod and @classmethod?", options: ["They are identical", "@staticmethod has no access to class or instance; @classmethod receives the class as first argument", "@staticmethod is faster", "@classmethod cannot be overridden"], correctAnswer: "@staticmethod has no access to class or instance; @classmethod receives the class as first argument", difficulty: 3, explanation: "staticmethod is a plain function in the class namespace. classmethod gets cls, enabling subclass-aware behaviour." },
        ],
      },
      {
        name: "File I/O & Error Handling",
        slug: "python-file-io-errors",
        description: "Reading/writing files, context managers, and exception hierarchy.",
        orderIndex: 5,
        initialMastery: 0.0,
        questions: [
          { text: "Which is the safest way to open a file in Python?", options: ["f = open('file.txt')", "with open('file.txt') as f:", "file.open('file.txt')", "open_file('file.txt')"], correctAnswer: "with open('file.txt') as f:", difficulty: 1, explanation: "with automatically closes the file after the block, even if an exception occurs." },
          { text: "What does `open('file.txt', 'a')` mode do?", options: ["Opens for reading only", "Opens for writing, truncating the file", "Opens for appending (adding to the end without erasing)", "Opens in binary mode"], correctAnswer: "Opens for appending (adding to the end without erasing)", difficulty: 1, explanation: "Mode 'a' opens the file for appending. New data is written at the end; existing content is preserved." },
          { text: "What exception is raised when a file is not found?", options: ["IOError", "OSError", "FileNotFoundError", "ValueError"], correctAnswer: "FileNotFoundError", difficulty: 2, explanation: "FileNotFoundError (a subclass of OSError) is raised when the specified file does not exist." },
          { text: "What does `except Exception as e` capture?", options: ["Only RuntimeError", "All exceptions that inherit from BaseException", "All exceptions that inherit from Exception (most standard exceptions)", "Only ValueError and TypeError"], correctAnswer: "All exceptions that inherit from Exception (most standard exceptions)", difficulty: 2, explanation: "Exception is the base for most non-system-exiting exceptions. SystemExit and KeyboardInterrupt inherit from BaseException, not Exception." },
          { text: "What is a context manager and what protocol does it use?", options: ["A file reading helper; uses read/write protocol", "An object that defines __enter__ and __exit__ methods, used with the with statement", "A threading primitive; uses lock/unlock protocol", "A decorator that manages memory"], correctAnswer: "An object that defines __enter__ and __exit__ methods, used with the with statement", difficulty: 3, explanation: "__enter__ sets up the resource and __exit__ tears it down (even on exception), implementing the context manager protocol." },
        ],
      },
      {
        name: "Libraries: NumPy & Pandas",
        slug: "python-numpy-pandas",
        description: "Array operations with NumPy and data manipulation with Pandas DataFrames.",
        orderIndex: 6,
        initialMastery: 0.0,
        questions: [
          { text: "What is a NumPy ndarray?", options: ["A Python list with extra methods", "A homogeneous, fixed-size, n-dimensional array stored in contiguous memory", "A DataFrame with named columns", "A linked list implementation"], correctAnswer: "A homogeneous, fixed-size, n-dimensional array stored in contiguous memory", difficulty: 1, explanation: "ndarrays store elements of the same dtype in contiguous memory, enabling vectorised C-speed operations." },
          { text: "What does `np.zeros((3, 4))` create?", options: ["A 3-element array of zeros", "A 3×4 matrix of zeros", "A list with 12 zeros", "An error"], correctAnswer: "A 3×4 matrix of zeros", difficulty: 1, explanation: "np.zeros(shape) creates an array of zeros with the given shape; (3,4) means 3 rows and 4 columns." },
          { text: "What is broadcasting in NumPy?", options: ["Sending arrays over a network", "NumPy's ability to operate on arrays of different shapes by expanding smaller arrays along dimensions", "Printing array values", "A type of array serialisation"], correctAnswer: "NumPy's ability to operate on arrays of different shapes by expanding smaller arrays along dimensions", difficulty: 2, explanation: "Broadcasting allows operations like array + scalar without explicit loops, expanding the scalar conceptually to match the array shape." },
          { text: "What does `df.groupby('city').mean()` do in Pandas?", options: ["Sorts the DataFrame by city", "Groups rows by unique city values and computes the mean of all numeric columns per group", "Filters rows where city has mean value", "Removes the city column"], correctAnswer: "Groups rows by unique city values and computes the mean of all numeric columns per group", difficulty: 2, explanation: "groupby + aggregation functions (mean, sum, count) are fundamental Pandas operations for split-apply-combine analysis." },
          { text: "What is the difference between `loc` and `iloc` in Pandas?", options: ["loc uses integer positions; iloc uses labels", "loc uses labels/conditions; iloc uses integer positions", "They are identical", "loc is for rows only; iloc is for columns only"], correctAnswer: "loc uses labels/conditions; iloc uses integer positions", difficulty: 3, explanation: "loc['row_label', 'col_label'] is label-based; iloc[0, 1] is integer position-based. Mixing them causes errors." },
        ],
      },
    ],
  },

  // ─── HTML ─────────────────────────────────────────────────────────────────
  {
    name: "HTML",
    slug: "html",
    description: "HyperText Markup Language: structure, semantics, forms, and accessibility.",
    icon: "Globe",
    color: "#EA580C",
    orderIndex: 4,
    concepts: [
      {
        name: "HTML Structure & Elements",
        slug: "html-structure-elements",
        description: "DOCTYPE, head, body, block vs inline elements, and nesting rules.",
        orderIndex: 1,
        initialMastery: 0.0,
        questions: [
          { text: "What does the `<!DOCTYPE html>` declaration do?", options: ["Links a CSS stylesheet", "Tells the browser to use HTML5 standards mode", "Creates a comment", "Defines the page title"], correctAnswer: "Tells the browser to use HTML5 standards mode", difficulty: 1, explanation: "DOCTYPE prevents quirks mode, ensuring the browser renders with the modern HTML5 specification." },
          { text: "Which element is the root of an HTML document?", options: ["<body>", "<head>", "<html>", "<main>"], correctAnswer: "<html>", difficulty: 1, explanation: "The <html> element wraps all other elements and represents the root of the document." },
          { text: "What is the difference between a block-level and an inline element?", options: ["Block elements are bigger", "Block elements start on a new line and take full width; inline elements flow within text", "Inline elements cannot contain text", "They are identical in behaviour"], correctAnswer: "Block elements start on a new line and take full width; inline elements flow within text", difficulty: 2, explanation: "Examples: <div>, <p>, <h1> are block; <span>, <a>, <strong> are inline." },
          { text: "Which HTML element is used to define a navigation bar?", options: ["<menu>", "<nav>", "<header>", "<sidebar>"], correctAnswer: "<nav>", difficulty: 2, explanation: "<nav> is the semantic element for navigation links, improving accessibility and SEO." },
          { text: "What is void element in HTML?", options: ["An element with no content or closing tag (e.g. <br>, <img>, <input>)", "An empty div", "An element with display:none", "A deprecated element"], correctAnswer: "An element with no content or closing tag (e.g. <br>, <img>, <input>)", difficulty: 3, explanation: "Void elements cannot have children and do not need a closing tag in HTML5." },
        ],
      },
      {
        name: "Semantic HTML",
        slug: "html-semantic",
        description: "article, section, header, footer, figure, and why semantics matter.",
        orderIndex: 2,
        initialMastery: 0.0,
        questions: [
          { text: "What is semantic HTML?", options: ["HTML with inline styles", "Using elements that clearly describe their meaning and purpose to both browsers and developers", "HTML without JavaScript", "Minified HTML"], correctAnswer: "Using elements that clearly describe their meaning and purpose to both browsers and developers", difficulty: 1, explanation: "Semantic elements like <article>, <nav>, <footer> give meaning to structure, aiding accessibility and SEO." },
          { text: "What is the difference between <article> and <section>?", options: ["They are identical", "<article> is self-contained, independently distributable content; <section> is a thematic grouping", "<section> is for navigation; <article> is for images", "<article> can only contain text"], correctAnswer: "<article> is self-contained, independently distributable content; <section> is a thematic grouping", difficulty: 2, explanation: "An <article> could be a blog post or news story. A <section> groups related content within a page." },
          { text: "Which element should wrap an image and its caption?", options: ["<div>", "<figure>", "<section>", "<aside>"], correctAnswer: "<figure>", difficulty: 2, explanation: "<figure> with <figcaption> is the semantic wrapper for self-contained media with an optional caption." },
          { text: "What is the role of <aside>?", options: ["Main page content", "Content tangentially related to the surrounding content (e.g. sidebars, pull quotes)", "A navigation element", "A footer section"], correctAnswer: "Content tangentially related to the surrounding content (e.g. sidebars, pull quotes)", difficulty: 2, explanation: "<aside> marks content that is related but not essential to the main content, like sidebars or related articles." },
          { text: "Why is semantic HTML important for accessibility?", options: ["It makes the page load faster", "Screen readers use semantic elements to understand page structure and navigate content meaningfully", "It removes the need for CSS", "It enables JavaScript events"], correctAnswer: "Screen readers use semantic elements to understand page structure and navigate content meaningfully", difficulty: 3, explanation: "Assistive technologies rely on landmark roles (derived from semantic elements) to help users navigate pages efficiently." },
        ],
      },
      {
        name: "Forms & Input",
        slug: "html-forms-input",
        description: "Form elements, input types, validation attributes, and labels.",
        orderIndex: 3,
        initialMastery: 0.0,
        questions: [
          { text: "Which attribute associates a <label> with an <input>?", options: ["name", "id matched to for", "class", "type"], correctAnswer: "id matched to for", difficulty: 1, explanation: "label's for attribute must match the input's id, linking them for accessibility and click targeting." },
          { text: "What does `<input type='email'>` provide?", options: ["Encrypts the email value", "Browser-level email format validation and appropriate mobile keyboard", "Sends an email on submit", "Requires a password"], correctAnswer: "Browser-level email format validation and appropriate mobile keyboard", difficulty: 1, explanation: "type='email' triggers basic format validation (must contain @) and shows an email keyboard on mobile." },
          { text: "Which HTTP method should a form use when submitting sensitive data?", options: ["GET", "POST", "PUT", "PATCH"], correctAnswer: "POST", difficulty: 2, explanation: "POST sends data in the request body (not the URL), making it appropriate for passwords and sensitive information." },
          { text: "What does the `required` attribute do on an input?", options: ["Makes the field read-only", "Prevents form submission if the field is empty (browser-level validation)", "Highlights the field in red", "Sets a default value"], correctAnswer: "Prevents form submission if the field is empty (browser-level validation)", difficulty: 2, explanation: "required triggers native browser validation, blocking submission and showing an error message if the field is empty." },
          { text: "What is the difference between `<input type='submit'>` and `<button type='submit'>`?", options: ["They are identical", "<button> can contain HTML content (text, icons, images); <input> only shows plain text", "<input> submits the form; <button> does not", "<button> requires JavaScript"], correctAnswer: "<button> can contain HTML content (text, icons, images); <input> only shows plain text", difficulty: 3, explanation: "<button> is more flexible and styleable. Both submit forms by default when type='submit'." },
        ],
      },
      {
        name: "Links, Images & Media",
        slug: "html-links-images-media",
        description: "Anchor tags, href, alt text, <video>, <audio>, and responsive images.",
        orderIndex: 4,
        initialMastery: 0.0,
        questions: [
          { text: "What does the `alt` attribute on an <img> provide?", options: ["A tooltip on hover", "Alternative text for screen readers and when the image fails to load", "The image URL", "Image dimensions"], correctAnswer: "Alternative text for screen readers and when the image fails to load", difficulty: 1, explanation: "alt is critical for accessibility — screen readers read it aloud — and also shows when the image can't be displayed." },
          { text: "Which value of `target` attribute opens a link in a new browser tab?", options: ["_self", "_blank", "_parent", "_top"], correctAnswer: "_blank", difficulty: 1, explanation: "target='_blank' opens the link in a new tab. Always add rel='noopener noreferrer' for security." },
          { text: "What does `rel='noopener noreferrer'` on a link do?", options: ["Opens the link in an iframe", "Prevents the new tab from accessing the opener's window and hides the referrer header", "Forces HTTPS", "Disables the link"], correctAnswer: "Prevents the new tab from accessing the opener's window and hides the referrer header", difficulty: 2, explanation: "Without noopener, the opened page can access window.opener and potentially redirect the parent. noreferrer also hides the HTTP Referer header." },
          { text: "What is the purpose of the <picture> element?", options: ["Displaying video", "Providing multiple image sources for different screen sizes/formats (art direction)", "Embedding a canvas", "Creating an image gallery"], correctAnswer: "Providing multiple image sources for different screen sizes/formats (art direction)", difficulty: 2, explanation: "<picture> with <source media='...'> allows different images for different viewports or format support (e.g. WebP vs JPEG)." },
          { text: "What attribute makes a video start playing automatically when the page loads?", options: ["play", "autoplay", "autostart", "loop"], correctAnswer: "autoplay", difficulty: 3, explanation: "autoplay starts playback immediately, but most browsers require muted attribute too for autoplay to work without user interaction." },
        ],
      },
      {
        name: "Accessibility & ARIA",
        slug: "html-accessibility-aria",
        description: "WCAG basics, ARIA roles, keyboard navigation, and focus management.",
        orderIndex: 5,
        initialMastery: 0.0,
        questions: [
          { text: "What does ARIA stand for?", options: ["Accessible Rich Internet Applications", "Automated Render Interface API", "Adaptive Responsive Interface Architecture", "Application Runtime Integration API"], correctAnswer: "Accessible Rich Internet Applications", difficulty: 1, explanation: "ARIA attributes supplement HTML to describe dynamic content and UI widgets to assistive technologies." },
          { text: "When should you use ARIA attributes?", options: ["Always instead of semantic HTML", "Only when native HTML semantics are insufficient to describe custom widgets", "For every interactive element", "Only for images"], correctAnswer: "Only when native HTML semantics are insufficient to describe custom widgets", difficulty: 2, explanation: "Rule: prefer semantic HTML first. ARIA is a fallback for custom components like carousels, comboboxes, and tabs." },
          { text: "What does `aria-label` do?", options: ["Hides an element from screen readers", "Provides an accessible name for an element when visible text is absent", "Changes element colour", "Adds a tooltip"], correctAnswer: "Provides an accessible name for an element when visible text is absent", difficulty: 2, explanation: "Use aria-label when there's no visible text label (e.g. icon-only buttons) to give screen readers a meaningful name." },
          { text: "What does `tabindex='0'` do?", options: ["Removes element from tab order", "Adds the element to the natural tab order at its position in the DOM", "Makes the element the first focusable element", "Disables keyboard focus"], correctAnswer: "Adds the element to the natural tab order at its position in the DOM", difficulty: 2, explanation: "tabindex='0' makes a non-interactive element (like a div) focusable via Tab in document order." },
          { text: "What is the minimum contrast ratio for normal text per WCAG 2.1 AA?", options: ["2:1", "3:1", "4.5:1", "7:1"], correctAnswer: "4.5:1", difficulty: 3, explanation: "WCAG 2.1 AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold)." },
        ],
      },
      {
        name: "HTML APIs & Meta Tags",
        slug: "html-apis-meta",
        description: "Meta tags, Open Graph, viewport, data attributes, and HTML5 APIs.",
        orderIndex: 6,
        initialMastery: 0.0,
        questions: [
          { text: "What does `<meta name='viewport' content='width=device-width, initial-scale=1'>` do?", options: ["Sets the font size", "Tells mobile browsers to set the viewport width to the device width for responsive design", "Loads a responsive CSS file", "Sets the background colour"], correctAnswer: "Tells mobile browsers to set the viewport width to the device width for responsive design", difficulty: 1, explanation: "Without this tag, mobile browsers default to a desktop-sized viewport and then zoom out, breaking responsive layouts." },
          { text: "What are Open Graph meta tags used for?", options: ["SEO keyword ranking", "Controlling how pages appear when shared on social media (title, image, description)", "Defining CSS variables", "Setting browser icons"], correctAnswer: "Controlling how pages appear when shared on social media (title, image, description)", difficulty: 2, explanation: "og:title, og:image, og:description are read by Facebook, Twitter, and LinkedIn when generating link previews." },
          { text: "What is the purpose of `data-*` attributes?", options: ["Storing secret API keys", "Storing custom data private to the page or application, accessible via JavaScript's dataset API", "Defining CSS classes", "Setting ARIA roles"], correctAnswer: "Storing custom data private to the page or application, accessible via JavaScript's dataset API", difficulty: 2, explanation: "data-user-id='42' can be read as element.dataset.userId in JavaScript without storing data in non-semantic attributes." },
          { text: "Which HTML5 API allows storing data in the browser that persists after the session ends?", options: ["sessionStorage", "localStorage", "IndexedDB", "Both localStorage and IndexedDB"], correctAnswer: "Both localStorage and IndexedDB", difficulty: 3, explanation: "localStorage persists until explicitly cleared. IndexedDB is a full client-side database. sessionStorage only lasts the browser session." },
          { text: "What does the `defer` attribute on a <script> tag do?", options: ["Blocks HTML parsing while downloading", "Downloads the script in parallel and executes it after the HTML is fully parsed", "Executes the script inline", "Marks the script as a module"], correctAnswer: "Downloads the script in parallel and executes it after the HTML is fully parsed", difficulty: 3, explanation: "defer ensures scripts don't block rendering and execute in document order after DOMContentLoaded, unlike async which executes immediately after download." },
        ],
      },
    ],
  },

  // ─── Data Structures ──────────────────────────────────────────────────────
  {
    name: "Data Structures",
    slug: "data-structures",
    description: "Fundamental data structures: arrays, trees, graphs, heaps, and more.",
    icon: "GitBranch",
    color: "#7C3AED",
    orderIndex: 5,
    concepts: [
      {
        name: "Arrays & Strings",
        slug: "ds-arrays-strings",
        description: "Contiguous memory, string manipulation, two-pointer and sliding window patterns.",
        orderIndex: 1,
        initialMastery: 0.0,
        questions: [
          { text: "What is the time complexity of accessing an element by index in an array?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: "O(1)", difficulty: 1, explanation: "Array elements are stored contiguously; index-based access computes the address directly in constant time." },
          { text: "What is the time complexity of inserting at the beginning of an array?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: "O(n)", difficulty: 1, explanation: "Inserting at the beginning requires shifting all existing elements one position right, taking O(n) time." },
          { text: "What is the two-pointer technique used for?", options: ["Navigating binary trees", "Efficiently solving problems on sorted arrays or strings using two indices moving toward each other", "Implementing linked lists", "Graph traversal"], correctAnswer: "Efficiently solving problems on sorted arrays or strings using two indices moving toward each other", difficulty: 2, explanation: "Two pointers reduce O(n²) brute force solutions (nested loops) to O(n) for problems like pair-sum, palindrome checking, and container-with-most-water." },
          { text: "What is a sliding window algorithm?", options: ["A GUI technique", "A technique that maintains a subset (window) of consecutive elements, expanding/shrinking as needed", "A sorting method", "A graph traversal"], correctAnswer: "A technique that maintains a subset (window) of consecutive elements, expanding/shrinking as needed", difficulty: 2, explanation: "Sliding windows solve 'longest/shortest subarray with property' problems in O(n) instead of O(n²)." },
          { text: "Why is string concatenation in a loop inefficient in many languages?", options: ["Strings are mutable", "Each concatenation creates a new string, copying all previous characters, resulting in O(n²) total work", "Loops are slow", "Strings have a size limit"], correctAnswer: "Each concatenation creates a new string, copying all previous characters, resulting in O(n²) total work", difficulty: 3, explanation: "Use a StringBuilder (Java), list join (Python), or array join (JS) for O(n) concatenation in loops." },
        ],
      },
      {
        name: "Linked Lists",
        slug: "ds-linked-lists",
        description: "Singly, doubly linked lists, cycle detection, and reversal.",
        orderIndex: 2,
        initialMastery: 0.0,
        questions: [
          { text: "What is the main advantage of a linked list over an array?", options: ["Faster element access by index", "O(1) insertion and deletion at a known node without shifting elements", "Better cache performance", "Less memory usage"], correctAnswer: "O(1) insertion and deletion at a known node without shifting elements", difficulty: 1, explanation: "Linked list nodes only need pointer updates to insert/delete, avoiding the O(n) shift cost of arrays." },
          { text: "How does Floyd's cycle detection algorithm work?", options: ["Uses a hash set to track visited nodes", "Uses two pointers (slow and fast) that meet inside the cycle if one exists", "Reverses the list and checks equality", "Sorts the list and scans for duplicates"], correctAnswer: "Uses two pointers (slow and fast) that meet inside the cycle if one exists", difficulty: 2, explanation: "Slow moves 1 step, fast moves 2 steps. If a cycle exists they will eventually meet; if no cycle, fast reaches null." },
          { text: "What is the time complexity of finding the middle node of a linked list?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: "O(n)", difficulty: 2, explanation: "You must traverse to the middle (n/2 steps), which is O(n). With two-pointers (fast/slow) it's still O(n) but one pass." },
          { text: "How do you reverse a singly linked list in O(n) time and O(1) space?", options: ["Recursively reverse each sub-list", "Use three pointers (prev, curr, next) and iteratively re-link nodes", "Copy to array, reverse, rebuild", "Use a stack"], correctAnswer: "Use three pointers (prev, curr, next) and iteratively re-link nodes", difficulty: 2, explanation: "Iterative reversal uses prev=null, curr=head, and at each step saves next, points curr.next to prev, then advances both." },
          { text: "When would you prefer a doubly linked list over singly linked?", options: ["When memory is unlimited", "When you need O(1) backward traversal or deletion of a node given only its reference", "When the list is sorted", "When elements are fixed-size integers"], correctAnswer: "When you need O(1) backward traversal or deletion of a node given only its reference", difficulty: 3, explanation: "Doubly linked lists store both next and prev pointers. This allows backward traversal and O(1) deletion when you have the node pointer." },
        ],
      },
      {
        name: "Stacks & Queues",
        slug: "ds-stacks-queues",
        description: "LIFO, FIFO, monotonic stacks, and deque applications.",
        orderIndex: 3,
        initialMastery: 0.0,
        questions: [
          { text: "What is the order of element removal in a stack?", options: ["FIFO (First In First Out)", "LIFO (Last In First Out)", "Random", "Sorted order"], correctAnswer: "LIFO (Last In First Out)", difficulty: 1, explanation: "Stacks allow insertion and removal only at the top. The last element added is the first removed." },
          { text: "Which data structure is used to implement BFS (Breadth-First Search)?", options: ["Stack", "Queue", "Heap", "Array"], correctAnswer: "Queue", difficulty: 1, explanation: "BFS processes nodes level by level, using a queue to track the next nodes to visit." },
          { text: "What is a monotonic stack?", options: ["A stack that stores elements in sorted order, enabling O(1) queries for next greater/smaller element", "A stack limited to integers", "A stack with O(log n) push", "A recursive stack"], correctAnswer: "A stack that stores elements in sorted order, enabling O(1) queries for next greater/smaller element", difficulty: 2, explanation: "Monotonic stacks solve problems like 'next greater element', 'largest rectangle in histogram' in O(n) by maintaining a sorted invariant." },
          { text: "What is a deque and when is it useful?", options: ["A double-ended queue allowing O(1) insert/delete from both front and back", "A sorted queue", "A priority queue", "A circular buffer"], correctAnswer: "A double-ended queue allowing O(1) insert/delete from both front and back", difficulty: 2, explanation: "Deques are used in sliding window maximum problems and BFS variants requiring front removal and back insertion." },
          { text: "How can you implement a queue using two stacks?", options: ["Push to stack1; pop from stack2 (transfer all from stack1 if stack2 is empty)", "Push and pop from the same stack", "Use a circular array", "It is not possible"], correctAnswer: "Push to stack1; pop from stack2 (transfer all from stack1 if stack2 is empty)", difficulty: 3, explanation: "Enqueue pushes to stack1. Dequeue pops from stack2; if stack2 is empty, reverse stack1 into stack2. Amortized O(1) per operation." },
        ],
      },
      {
        name: "Trees & Binary Search Trees",
        slug: "ds-trees-bst",
        description: "Binary trees, BSTs, tree traversals (DFS/BFS), and balancing.",
        orderIndex: 4,
        initialMastery: 0.0,
        questions: [
          { text: "In a Binary Search Tree, where are values smaller than the root stored?", options: ["Right subtree", "Left subtree", "Root itself", "Both subtrees"], correctAnswer: "Left subtree", difficulty: 1, explanation: "BST invariant: all values in the left subtree < root < all values in the right subtree." },
          { text: "What is the time complexity of search in a balanced BST?", options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"], correctAnswer: "O(log n)", difficulty: 1, explanation: "Each comparison halves the remaining search space in a balanced BST, giving O(log n) height." },
          { text: "Which tree traversal visits nodes in Left → Root → Right order?", options: ["Pre-order", "In-order", "Post-order", "Level-order"], correctAnswer: "In-order", difficulty: 2, explanation: "In-order traversal of a BST visits nodes in ascending sorted order." },
          { text: "What is a self-balancing BST? Give an example.", options: ["A tree that stays height-balanced automatically through rotations (e.g. AVL tree, Red-Black tree)", "A BST where all nodes have two children", "A BST with no deletions", "A BST stored in an array"], correctAnswer: "A tree that stays height-balanced automatically through rotations (e.g. AVL tree, Red-Black tree)", difficulty: 2, explanation: "Self-balancing trees guarantee O(log n) operations by rebalancing after insertions and deletions through rotations." },
          { text: "What is the height of a complete binary tree with n nodes?", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: "O(log n)", difficulty: 3, explanation: "A complete binary tree fills all levels except possibly the last. Each level doubles node count, giving height = floor(log₂ n)." },
        ],
      },
      {
        name: "Heaps & Priority Queues",
        slug: "ds-heaps-priority-queues",
        description: "Min-heap, max-heap, heapify, and applications like Dijkstra's algorithm.",
        orderIndex: 5,
        initialMastery: 0.0,
        questions: [
          { text: "In a min-heap, what is always at the root?", options: ["The largest element", "The smallest element", "The median element", "A random element"], correctAnswer: "The smallest element", difficulty: 1, explanation: "Min-heap property: every parent node is ≤ its children. The root is always the minimum." },
          { text: "What is the time complexity of inserting into a heap?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswer: "O(log n)", difficulty: 1, explanation: "After inserting at the last position, the element bubbles up (sift-up) at most log n levels." },
          { text: "What is the time complexity of heapify (building a heap from n unsorted elements)?", options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correctAnswer: "O(n)", difficulty: 2, explanation: "Build-heap using sift-down from n/2 to 0 runs in O(n) because lower levels require less sifting work (amortized analysis)." },
          { text: "What algorithm uses a priority queue (min-heap) to find shortest paths?", options: ["DFS", "BFS", "Dijkstra's algorithm", "Bellman-Ford"], correctAnswer: "Dijkstra's algorithm", difficulty: 2, explanation: "Dijkstra's greedily picks the unvisited node with the shortest known distance using a min-heap, running in O((V+E) log V)." },
          { text: "How would you find the K largest elements from a stream of numbers efficiently?", options: ["Sort the entire stream", "Maintain a min-heap of size K; pop the min when a larger element arrives", "Use a max-heap of all elements", "Use a sorted array"], correctAnswer: "Maintain a min-heap of size K; pop the min when a larger element arrives", difficulty: 3, explanation: "A min-heap of size K keeps the K largest seen so far. For each new element, if it's > heap min, remove min and insert. O(n log k) total." },
        ],
      },
      {
        name: "Graphs",
        slug: "ds-graphs",
        description: "Representations, BFS, DFS, topological sort, and shortest path algorithms.",
        orderIndex: 6,
        initialMastery: 0.0,
        questions: [
          { text: "What are the two main ways to represent a graph in memory?", options: ["Matrix and Vector", "Adjacency Matrix and Adjacency List", "Array and LinkedList", "Stack and Queue"], correctAnswer: "Adjacency Matrix and Adjacency List", difficulty: 1, explanation: "Adjacency Matrix is O(V²) space, good for dense graphs. Adjacency List is O(V+E), efficient for sparse graphs." },
          { text: "What is the time complexity of BFS on a graph with V vertices and E edges?", options: ["O(V²)", "O(V + E)", "O(E log V)", "O(V log V)"], correctAnswer: "O(V + E)", difficulty: 2, explanation: "BFS visits each vertex once and processes each edge once, giving O(V+E) total time." },
          { text: "What is a topological sort and when is it applicable?", options: ["Sorting graph edges by weight", "A linear ordering of vertices such that for every directed edge u→v, u comes before v (only for DAGs)", "Sorting graph nodes alphabetically", "Finding the minimum spanning tree"], correctAnswer: "A linear ordering of vertices such that for every directed edge u→v, u comes before v (only for DAGs)", difficulty: 2, explanation: "Topological sort applies only to Directed Acyclic Graphs (DAGs). Used for task scheduling, build systems, and dependency resolution." },
          { text: "What does Union-Find (Disjoint Set Union) efficiently support?", options: ["Shortest path queries", "Checking if two nodes are in the same connected component and merging components", "Graph coloring", "Cycle detection in directed graphs"], correctAnswer: "Checking if two nodes are in the same connected component and merging components", difficulty: 3, explanation: "Union-Find with path compression and union by rank achieves nearly O(1) amortized operations (inverse Ackermann complexity)." },
          { text: "What is the difference between Dijkstra's and Bellman-Ford algorithms?", options: ["Dijkstra's handles negative weights; Bellman-Ford does not", "Bellman-Ford handles negative edge weights and detects negative cycles; Dijkstra's only works with non-negative weights", "They are identical algorithms", "Bellman-Ford is faster for all graphs"], correctAnswer: "Bellman-Ford handles negative edge weights and detects negative cycles; Dijkstra's only works with non-negative weights", difficulty: 3, explanation: "Dijkstra's is O((V+E) log V) with a heap. Bellman-Ford is O(VE) but correctly handles negative weights." },
        ],
      },
    ],
  },

  // ─── C++ ──────────────────────────────────────────────────────────────────
  {
    name: "C++",
    slug: "cpp",
    description: "Modern C++: memory management, OOP, STL, templates, and concurrency.",
    icon: "Cpu",
    color: "#059669",
    orderIndex: 6,
    concepts: [
      {
        name: "Pointers & Memory",
        slug: "cpp-pointers-memory",
        description: "Raw pointers, references, stack vs heap, new/delete, and memory leaks.",
        orderIndex: 1,
        initialMastery: 0.0,
        questions: [
          { text: "What does the `*` operator do when used on a pointer variable?", options: ["Creates a new pointer", "Dereferences the pointer to access the value at the memory address", "Multiplies the address", "Declares a pointer type"], correctAnswer: "Dereferences the pointer to access the value at the memory address", difficulty: 1, explanation: "Dereferencing (*ptr) accesses or modifies the value stored at the memory address held by ptr." },
          { text: "What is the difference between stack and heap memory in C++?", options: ["Stack is slower; heap is faster", "Stack is automatically managed (local variables, LIFO), heap requires manual new/delete", "Heap is smaller than stack", "They are identical"], correctAnswer: "Stack is automatically managed (local variables, LIFO), heap requires manual new/delete", difficulty: 1, explanation: "Stack memory is automatically reclaimed when a function returns. Heap memory persists until explicitly deleted." },
          { text: "What is a memory leak in C++?", options: ["Reading past array bounds", "Allocating heap memory with new and never calling delete, so the memory is never reclaimed", "Accessing a null pointer", "Stack overflow"], correctAnswer: "Allocating heap memory with new and never calling delete, so the memory is never reclaimed", difficulty: 2, explanation: "Memory leaks accumulate over time, eventually exhausting available memory. Use smart pointers to avoid them." },
          { text: "What is the difference between a pointer and a reference in C++?", options: ["They are identical", "A reference is an alias that cannot be null or reseated; a pointer can be null and reassigned", "References are heap-allocated", "Pointers are faster than references"], correctAnswer: "A reference is an alias that cannot be null or reseated; a pointer can be null and reassigned", difficulty: 2, explanation: "References must be initialized at declaration and always refer to the same object. Pointers are more flexible but riskier." },
          { text: "What is a dangling pointer?", options: ["A pointer to nullptr", "A pointer that still holds the address of memory that has been freed/deleted", "A pointer to a stack variable", "A pointer inside a class"], correctAnswer: "A pointer that still holds the address of memory that has been freed/deleted", difficulty: 3, explanation: "After delete ptr, ptr still holds the old address. Dereferencing it is undefined behaviour. Set ptr = nullptr after deleting." },
        ],
      },
      {
        name: "Smart Pointers & RAII",
        slug: "cpp-smart-pointers-raii",
        description: "unique_ptr, shared_ptr, weak_ptr, and the RAII idiom.",
        orderIndex: 2,
        initialMastery: 0.0,
        questions: [
          { text: "What does RAII stand for?", options: ["Resource Acquisition Is Initialization", "Runtime Allocation and Immediate Initialisation", "Reference And Interface Idiom", "Recursive And Incremental Instantiation"], correctAnswer: "Resource Acquisition Is Initialization", difficulty: 1, explanation: "RAII ties resource lifetime to object lifetime: resources are acquired in the constructor and released in the destructor." },
          { text: "Which smart pointer allows only one owner of a resource?", options: ["shared_ptr", "weak_ptr", "unique_ptr", "auto_ptr"], correctAnswer: "unique_ptr", difficulty: 1, explanation: "unique_ptr has exclusive ownership. It cannot be copied, only moved, and automatically deletes the resource when it goes out of scope." },
          { text: "What is a circular reference problem with shared_ptr?", options: ["Two objects holding shared_ptr to each other, preventing reference count from reaching 0 and causing a memory leak", "A shared_ptr pointing to itself", "A shared_ptr inside a loop", "A race condition"], correctAnswer: "Two objects holding shared_ptr to each other, preventing reference count from reaching 0 and causing a memory leak", difficulty: 2, explanation: "Break circular references using weak_ptr for one of the links. weak_ptr observes the resource without owning it." },
          { text: "What happens when the last shared_ptr owning a resource is destroyed?", options: ["The resource is leaked", "The destructor of the managed object is called and memory is freed", "The pointer becomes a weak_ptr", "The reference count increases"], correctAnswer: "The destructor of the managed object is called and memory is freed", difficulty: 2, explanation: "shared_ptr uses reference counting. When the count drops to 0, it automatically calls delete on the managed object." },
          { text: "Why should you prefer make_unique/make_shared over new with smart pointers?", options: ["They are faster at runtime", "They prevent memory leaks from exceptions between new and smart pointer construction, and are more concise", "They avoid calling constructors", "They allow null pointers"], correctAnswer: "They prevent memory leaks from exceptions between new and smart pointer construction, and are more concise", difficulty: 3, explanation: "make_unique<T>(args) allocates and constructs atomically. Passing new T directly risks a leak if another argument throws before the smart pointer is constructed." },
        ],
      },
      {
        name: "Classes & OOP",
        slug: "cpp-classes-oop",
        description: "Constructors, destructors, Rule of Five, virtual functions, and vtables.",
        orderIndex: 3,
        initialMastery: 0.0,
        questions: [
          { text: "What is a copy constructor?", options: ["A constructor that takes no arguments", "A constructor that creates a new object as a copy of an existing object", "A constructor used in inheritance", "A destructor"], correctAnswer: "A constructor that creates a new object as a copy of an existing object", difficulty: 1, explanation: "Copy constructor signature: MyClass(const MyClass& other). Called during pass-by-value and copy initialization." },
          { text: "What is the Rule of Five in modern C++?", options: ["A class should have at most five methods", "If you define any of destructor, copy constructor, copy assignment, move constructor, or move assignment, you should define all five", "A class can only inherit from five base classes", "A function can have at most five parameters"], correctAnswer: "If you define any of destructor, copy constructor, copy assignment, move constructor, or move assignment, you should define all five", difficulty: 2, explanation: "Custom resource management in one special member usually means all five need to be defined to maintain correct semantics." },
          { text: "What makes a function virtual in C++?", options: ["The virtual keyword, enabling runtime polymorphism via vtable dispatch", "Declaring it in a subclass", "Making it protected", "Using override keyword"], correctAnswer: "The virtual keyword, enabling runtime polymorphism via vtable dispatch", difficulty: 2, explanation: "virtual functions are dispatched through the vtable at runtime based on the actual object type, enabling polymorphism." },
          { text: "What is a pure virtual function?", options: ["A virtual function with no return value", "A virtual function declared with = 0, making the class abstract", "A virtual function that cannot be overridden", "A static virtual function"], correctAnswer: "A virtual function declared with = 0, making the class abstract", difficulty: 2, explanation: "virtual void draw() = 0 makes the class abstract (cannot instantiate). Subclasses must provide an implementation." },
          { text: "Why should destructors of base classes be declared virtual?", options: ["To allow the destructor to be overridden", "To ensure the correct derived class destructor is called when deleting through a base class pointer", "To improve performance", "To prevent copying"], correctAnswer: "To ensure the correct derived class destructor is called when deleting through a base class pointer", difficulty: 3, explanation: "Without virtual destructor, `delete basePtr` where basePtr points to a derived object only calls the base destructor, leaking derived resources." },
        ],
      },
      {
        name: "Templates & Generic Programming",
        slug: "cpp-templates-generics",
        description: "Function templates, class templates, template specialisation, and concepts.",
        orderIndex: 4,
        initialMastery: 0.0,
        questions: [
          { text: "What is a template in C++?", options: ["A design pattern", "A blueprint allowing functions and classes to operate on generic types determined at compile time", "A runtime type check", "An abstract class"], correctAnswer: "A blueprint allowing functions and classes to operate on generic types determined at compile time", difficulty: 1, explanation: "Templates generate type-specific code at compile time, enabling generic, type-safe, zero-overhead abstractions." },
          { text: "What is template specialisation?", options: ["Making a template abstract", "Providing a custom implementation of a template for a specific type", "Removing template parameters", "Inheriting from a template class"], correctAnswer: "Providing a custom implementation of a template for a specific type", difficulty: 2, explanation: "template<> void swap<std::string>(string& a, string& b) provides a specialised, optimised swap for strings." },
          { text: "What is SFINAE in C++ templates?", options: ["A smart pointer technique", "Substitution Failure Is Not An Error — template substitution failures are quietly ignored, enabling compile-time conditional overloading", "A sorting algorithm", "A memory allocation strategy"], correctAnswer: "Substitution Failure Is Not An Error — template substitution failures are quietly ignored, enabling compile-time conditional overloading", difficulty: 3, explanation: "SFINAE allows writing templates that only apply to types meeting certain conditions, forming the basis of type traits and enable_if." },
          { text: "What are C++20 Concepts?", options: ["Runtime type checks", "Compile-time predicates that constrain template type parameters with clearer error messages than SFINAE", "A replacement for virtual functions", "A garbage collection mechanism"], correctAnswer: "Compile-time predicates that constrain template type parameters with clearer error messages than SFINAE", difficulty: 3, explanation: "Concepts like requires Sortable<T> express constraints on template arguments, giving readable compiler errors instead of SFINAE walls." },
          { text: "What is template metaprogramming?", options: ["Generating HTML with templates", "Using C++ templates to perform computations at compile time, producing zero-runtime-cost results", "A runtime reflection system", "A debugger for templates"], correctAnswer: "Using C++ templates to perform computations at compile time, producing zero-runtime-cost results", difficulty: 3, explanation: "TMP treats template instantiation as a functional computation. Examples include compile-time Fibonacci, type lists, and static_assert validation." },
        ],
      },
      {
        name: "STL Containers & Algorithms",
        slug: "cpp-stl-containers",
        description: "vector, map, unordered_map, set, iterators, and std::algorithm.",
        orderIndex: 5,
        initialMastery: 0.0,
        questions: [
          { text: "What is the time complexity of std::vector::push_back?", options: ["O(n)", "O(log n)", "Amortized O(1)", "O(n²)"], correctAnswer: "Amortized O(1)", difficulty: 1, explanation: "push_back is O(1) amortized. Capacity doubles on reallocation, which occurs rarely relative to total pushes." },
          { text: "What is the difference between std::map and std::unordered_map?", options: ["They are identical", "std::map uses a Red-Black tree (O(log n) ops, sorted); unordered_map uses a hash table (O(1) avg, unordered)", "std::map is faster for all operations", "unordered_map is sorted"], correctAnswer: "std::map uses a Red-Black tree (O(log n) ops, sorted); unordered_map uses a hash table (O(1) avg, unordered)", difficulty: 2, explanation: "Use std::map when you need sorted iteration or range queries. Use unordered_map for fastest average lookup." },
          { text: "What does std::sort guarantee?", options: ["Stable sort maintaining equal elements' relative order", "O(n log n) worst-case using introsort (quicksort + heapsort hybrid)", "O(n) sort for any input", "Ascending order only"], correctAnswer: "O(n log n) worst-case using introsort (quicksort + heapsort hybrid)", difficulty: 2, explanation: "std::sort uses introsort which achieves O(n log n) worst case. It is NOT stable. Use std::stable_sort for stability." },
          { text: "What does std::find_if return if no element matches?", options: ["nullptr", "An iterator to end()", "-1", "An empty iterator"], correctAnswer: "An iterator to end()", difficulty: 2, explanation: "STL algorithms return end() to signal 'not found'. Always check `it != container.end()` before dereferencing." },
          { text: "What is a range-based for loop limitation with std::map?", options: ["You cannot iterate over a map", "The loop variable is a std::pair<const Key, Value>, requiring .first and .second", "It only works with sorted maps", "It does not support auto"], correctAnswer: "The loop variable is a std::pair<const Key, Value>, requiring .first and .second", difficulty: 3, explanation: "for (auto& [key, val] : myMap) uses C++17 structured bindings to unpack the pair cleanly." },
        ],
      },
      {
        name: "Concurrency in C++",
        slug: "cpp-concurrency",
        description: "std::thread, mutex, condition_variable, atomic, and async/future.",
        orderIndex: 6,
        initialMastery: 0.0,
        questions: [
          { text: "How do you start a new thread in C++11?", options: ["fork()", "std::thread t(func)", "pthread_create()", "spawn(func)"], correctAnswer: "std::thread t(func)", difficulty: 1, explanation: "std::thread t(func, args...) creates and immediately starts a new thread executing func." },
          { text: "What must you call before a std::thread object is destroyed?", options: ["stop()", "join() or detach()", "kill()", "Nothing — it stops automatically"], correctAnswer: "join() or detach()", difficulty: 1, explanation: "If a thread is joinable when its std::thread object is destroyed, std::terminate() is called. join() waits for it; detach() lets it run independently." },
          { text: "What does std::mutex protect against?", options: ["Memory leaks", "Data races — concurrent unsynchronised access to shared mutable data", "Deadlocks", "Stack overflows"], correctAnswer: "Data races — concurrent unsynchronised access to shared mutable data", difficulty: 2, explanation: "A mutex ensures only one thread at a time can execute the critical section, preventing undefined behaviour from data races." },
          { text: "What is std::lock_guard used for?", options: ["A timed lock", "RAII wrapper that acquires a mutex on construction and releases it on destruction", "A recursive mutex", "A read-write lock"], correctAnswer: "RAII wrapper that acquires a mutex on construction and releases it on destruction", difficulty: 2, explanation: "lock_guard automatically releases the mutex when it goes out of scope, even if an exception is thrown." },
          { text: "What is the difference between std::async and std::thread?", options: ["They are identical", "std::async returns a std::future for the result and may run the task lazily or in a thread pool; std::thread always creates a new thread", "std::async is faster", "std::thread returns a future"], correctAnswer: "std::async returns a std::future for the result and may run the task lazily or in a thread pool; std::thread always creates a new thread", difficulty: 3, explanation: "std::async with launch::async policy runs on a new thread or pool. The returned future.get() blocks until completion and propagates exceptions." },
        ],
      },
    ],
  },
];
