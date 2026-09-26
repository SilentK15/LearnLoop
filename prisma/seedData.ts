export interface SeedConcept {
  name: string;
  slug: string;
  description: string;
  orderIndex: number;
  initialMastery: number;
  questions: {
    text: string;
    options: string[];
    correctAnswer: string;
    difficulty: number;
    explanation: string;
  }[];
}

export const SEED_CONCEPTS: SeedConcept[] = [
  {
    name: "Variables & Primitive Types",
    slug: "variables-primitive-types",
    description: "Memory allocation, primitives vs reference types, immutability, and type coercion fundamentals.",
    orderIndex: 1,
    initialMastery: 0.85,
    questions: [
      {
        text: "In JavaScript/TypeScript, which of the following is a primitive type stored directly by value on the stack?",
        options: ["Object", "Symbol", "Array", "Function"],
        correctAnswer: "Symbol",
        difficulty: 1,
        explanation: "JavaScript primitives include Number, String, Boolean, null, undefined, Symbol, and BigInt. Objects, Arrays, and Functions are reference types."
      },
      {
        text: "What will `typeof null` evaluate to in standard JavaScript?",
        options: ["'null'", "'undefined'", "'object'", "'boolean'"],
        correctAnswer: "'object'",
        difficulty: 1,
        explanation: "Due to a historical bug in JavaScript's initial implementation where object tags were represented as 000, `typeof null` returns 'object'."
      },
      {
        text: "What does the expression `[] + {}` evaluate to in JavaScript?",
        options: ["'[object Object]'", "0", "NaN", "TypeError"],
        correctAnswer: "'[object Object]'",
        difficulty: 2,
        explanation: "The empty array `[]` is coerced into an empty string `\"\"`, and `{}` is coerced via toString() to `\"[object Object]\"`, resulting in `\"[object Object]\"`."
      },
      {
        text: "Which statement accurately describes `const` in modern JavaScript?",
        options: [
          "It makes the assigned value deeply immutable.",
          "It prevents the identifier from being reassigned to a different reference or primitive value.",
          "It allocates memory on the read-only hardware ROM.",
          "It behaves identically to `var` but with block scoping."
        ],
        correctAnswer: "It prevents the identifier from being reassigned to a different reference or primitive value.",
        difficulty: 2,
        explanation: "`const` creates an immutable binding (cannot be reassigned), but object properties or array elements referenced by it remain mutable unless frozen."
      },
      {
        text: "Consider `Object.freeze(obj)`. What is its primary limitation regarding immutability?",
        options: [
          "It only prevents deletion of keys, not modification of values.",
          "It does not work on arrays.",
          "It performs a shallow freeze; nested objects remain mutable unless recursively frozen.",
          "It drops prototype inheritance."
        ],
        correctAnswer: "It performs a shallow freeze; nested objects remain mutable unless recursively frozen.",
        difficulty: 3,
        explanation: "`Object.freeze()` is shallow. Properties that point to other objects can still have their sub-properties modified unless deep freeze is implemented."
      },
      {
        text: "What is the result of `Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2`?",
        options: ["false", "true", "TypeError", "NaN"],
        correctAnswer: "true",
        difficulty: 3,
        explanation: "IEEE 754 double-precision floats lose precision beyond 2^53 - 1 (9007199254740991), causing both expressions to round to 9007199254740992."
      },
      {
        text: "What happens when allocating a new BigInt via `BigInt(Number.MAX_SAFE_INTEGER) + 1n` compared to standard IEEE 754 Number arithmetic?",
        options: [
          "It throws a RangeError because BigInt cannot exceed 64-bit boundaries.",
          "It accurately represents arbitrary-precision integers without rounding or precision loss.",
          "It automatically coerces into a floating point decimal if divided by 2.",
          "It shares the same internal representation as JavaScript Numbers."
        ],
        correctAnswer: "It accurately represents arbitrary-precision integers without rounding or precision loss.",
        difficulty: 4,
        explanation: "BigInt provides arbitrary-precision integers, preventing IEEE 754 float rounding issues, though it requires explicit conversion when operating with standard Numbers."
      },
      {
        text: "In JavaScript engines (V8), how are small integers ('Smi') internally represented to avoid heap allocation?",
        options: [
          "They are boxed as full heap objects on every variable assignment.",
          "They are unboxed immediate values tagged with a 0 in the least significant bit inside a pointer-sized register.",
          "They are stored in a global lookup dictionary.",
          "They are encoded as UTF-8 strings."
        ],
        correctAnswer: "They are unboxed immediate values tagged with a 0 in the least significant bit inside a pointer-sized register.",
        difficulty: 4,
        explanation: "V8 uses pointer tagging: pointers have their lowest bit set to 1, while 31-bit/32-bit small integers (Smis) have their lowest bit set to 0 and reside directly within registers without pointer dereferencing."
      },
      {
        text: "Under strict IEEE 754 floating point semantics, why does `Object.is(-0, +0)` evaluate to `false` while `-0 === +0` evaluates to `true`?",
        options: [
          "`Object.is` checks memory addresses rather than values.",
          "`Object.is` implements SameValue zero algorithm.",
          "`Object.is` uses the SameValue algorithm which preserves sign bit distinction in IEEE 754 representations.",
          "`-0` is an object while `+0` is a primitive number."
        ],
        correctAnswer: "`Object.is` uses the SameValue algorithm which preserves sign bit distinction in IEEE 754 representations.",
        difficulty: 5,
        explanation: "The SameValue specification treats `-0` and `+0` as distinct entities because their IEEE 754 sign bits differ (critical in division by zero: 1/-0 = -Infinity while 1/+0 = +Infinity)."
      }
    ]
  },
  {
    name: "Control Flow & Conditionals",
    slug: "control-flow-conditionals",
    description: "Branching heuristics, short-circuit evaluation, truthy/falsy coercion, and loop optimization.",
    orderIndex: 2,
    initialMastery: 0.70,
    questions: [
      {
        text: "Which of the following values is evaluated as truthy in a conditional statement in JavaScript?",
        options: ["0", "\"\"", "[]", "null"],
        correctAnswer: "[]",
        difficulty: 1,
        explanation: "All objects, including empty arrays `[]` and empty objects `{}`, are truthy in JavaScript. `0`, `\"\"`, `null`, `undefined`, `NaN`, and `false` are falsy."
      },
      {
        text: "What will `true && 'Hello' || 'World'` evaluate to?",
        options: ["true", "'Hello'", "'World'", "false"],
        correctAnswer: "'Hello'",
        difficulty: 1,
        explanation: "Logical AND (`&&`) evaluates the right side since `true` is truthy, returning `'Hello'`. Then `'Hello' || 'World'` short-circuits on truthy `'Hello'`."
      },
      {
        text: "How does the nullish coalescing operator (`??`) differ from the logical OR operator (`||`)?",
        options: [
          "`??` only falls back for `null` or `undefined`, whereas `||` falls back for any falsy value (such as `0` or `\"\"`).",
          "`??` evaluates both sides eagerly, whereas `||` short-circuits.",
          "`??` works only with numeric operands.",
          "`??` cannot be chained."
        ],
        correctAnswer: "`??` only falls back for `null` or `undefined`, whereas `||` falls back for any falsy value (such as `0` or `\"\"`).",
        difficulty: 2,
        explanation: "Nullish coalescing (`??`) specifically tests against nullish values (`null` or `undefined`). Logical OR (`||`) treats `0`, `\"\"`, `false`, and `NaN` as triggers for fallback."
      },
      {
        text: "In a `switch (x)` statement, how does JavaScript compare expression values against `case` clauses?",
        options: [
          "Using abstract equality (`==`) with type coercion.",
          "Using strict equality (`===`) without type coercion.",
          "Using reference comparison only.",
          "Using string conversion comparison."
        ],
        correctAnswer: "Using strict equality (`===`) without type coercion.",
        difficulty: 2,
        explanation: "JavaScript switch statements evaluate cases using strict equality (`===`). Thus `switch ('5')` will not match `case 5:`."
      },
      {
        text: "What is the output of running a `for...in` loop over a standard Array with added custom properties?",
        options: [
          "It iterates strictly over numeric indices in numerical order.",
          "It iterates over all enumerable properties, including prototype properties and custom string keys.",
          "It throws a runtime TypeError.",
          "It only returns array values, not keys."
        ],
        correctAnswer: "It iterates over all enumerable properties, including prototype properties and custom string keys.",
        difficulty: 3,
        explanation: "`for...in` iterates over all enumerable string properties of an object and its prototype chain, not just indexed elements. Use `for...of` or `forEach` for arrays."
      },
      {
        text: "What is the time complexity of searching in a properly balanced binary decision tree with N potential leaf outcomes?",
        options: ["O(N)", "O(log N)", "O(N log N)", "O(1)"],
        correctAnswer: "O(log N)",
        difficulty: 3,
        explanation: "Each binary comparison splits the remaining search space by half, yielding a logarithmic traversal depth of O(log N)."
      },
      {
        text: "How does branch prediction in modern superscalar CPUs influence the performance of a conditional loop over sorted vs unsorted arrays?",
        options: [
          "No difference because modern compilers unroll all conditionals.",
          "Sorted arrays result in highly predictable branches, minimizing pipeline flush penalties.",
          "Unsorted arrays are faster because memory fetches are randomized.",
          "Branch prediction is only applicable to recursive function calls."
        ],
        correctAnswer: "Sorted arrays result in highly predictable branches, minimizing pipeline flush penalties.",
        difficulty: 4,
        explanation: "CPUs use history tables to speculate on branch outcomes. When data is sorted, branch conditions remain consistent, eliminating expensive instruction pipeline flushes."
      },
      {
        text: "Consider `do { ... } while (condition)` vs `while (condition) { ... }`. When does their behavior diverge?",
        options: [
          "Only when condition throws an exception.",
          "When the condition is initially false; `do...while` executes the body at least once.",
          "`while` executes faster because it skips initial jump instructions.",
          "There is no divergence under any circumstances."
        ],
        correctAnswer: "When the condition is initially false; `do...while` executes the body at least once.",
        difficulty: 4,
        explanation: "`do...while` is a post-test loop: the body is guaranteed to execute at least once before the test expression is evaluated."
      },
      {
        text: "In JIT compilers (like V8 Crankshaft/TurboFan), how does 'deoptimization' occur in polymorphic switch statements or dynamic branches?",
        options: [
          "When memory runs out in the nursery space.",
          "When inline caches encounter hidden class (shape) feedback that contradicts previously generated optimized machine code.",
          "When garbage collection triggers mark-sweep.",
          "When the call stack depth exceeds 10,000 frames."
        ],
        correctAnswer: "When inline caches encounter hidden class (shape) feedback that contradicts previously generated optimized machine code.",
        difficulty: 5,
        explanation: "TurboFan generates speculative machine code assuming monomorphic call sites or consistent types. When unseen shapes or unexpected types occur, it bails out to the unoptimized baseline interpreter."
      }
    ]
  },
  {
    name: "Functions & Scope",
    slug: "functions-scope",
    description: "Lexical scoping, closure mechanics, execution contexts, hoisting, and the `this` binding.",
    orderIndex: 3,
    initialMastery: 0.52,
    questions: [
      {
        text: "What is lexical scoping?",
        options: [
          "Variables are resolved based on the call stack at runtime.",
          "Variables are resolved based on their physical location in the written source code nesting.",
          "Variables are accessible only globally.",
          "Variables can only be accessed within `with` blocks."
        ],
        correctAnswer: "Variables are resolved based on their physical location in the written source code nesting.",
        difficulty: 1,
        explanation: "Lexical scope means that inner functions have access to variables declared in their outer enclosing lexical environment determined at write-time."
      },
      {
        text: "How do arrow functions handle the `this` keyword differently from standard `function` declarations?",
        options: [
          "Arrow functions bind `this` dynamically based on who called them.",
          "Arrow functions do not possess their own `this`; they capture `this` from the enclosing lexical scope.",
          "Arrow functions bind `this` strictly to `null` in strict mode.",
          "Arrow functions cannot be used as callbacks."
        ],
        correctAnswer: "Arrow functions do not possess their own `this`; they capture `this` from the enclosing lexical scope.",
        difficulty: 1,
        explanation: "Arrow functions have lexical `this`: they inherit `this` from the scope in which they were created, ignoring `call()`, `apply()`, or method invocation context."
      },
      {
        text: "What is a closure in programming?",
        options: [
          "A method to terminate an infinite loop.",
          "A function bundled together with references to its surrounding lexical state (lexical environment).",
          "A syntax for declaring private static classes.",
          "A database transaction commit mechanism."
        ],
        correctAnswer: "A function bundled together with references to its surrounding lexical state (lexical environment).",
        difficulty: 2,
        explanation: "A closure gives an inner function access to its outer function's scope even after the outer function has finished executing and returned."
      },
      {
        text: "What is the Temporal Dead Zone (TDZ) in JavaScript?",
        options: [
          "The interval during asynchronous `setTimeout` execution.",
          "The period between entering scope and variable declaration where accessing `let` or `const` throws a ReferenceError.",
          "A garbage collector pause phase.",
          "The timestamp epoch offset in UTC."
        ],
        correctAnswer: "The period between entering scope and variable declaration where accessing `let` or `const` throws a ReferenceError.",
        difficulty: 2,
        explanation: "`let` and `const` variables are hoisted to the block start but remain uninitialized. Accessing them before their declaration line triggers a TDZ ReferenceError."
      },
      {
        text: "What will `(() => { for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); } })()` print?",
        options: ["0, 1, 2", "3, 3, 3", "undefined, undefined, undefined", "TypeError"],
        correctAnswer: "3, 3, 3",
        difficulty: 3,
        explanation: "`var` is function-scoped. All three timeout callbacks share the identical reference to `i`, which evaluates to 3 once the loop completes."
      },
      {
        text: "What happens when you pass a primitive number as an argument to a function in JavaScript?",
        options: [
          "It is passed by reference; changes inside mutate the caller's variable.",
          "It is passed by value; changes inside the function do not affect the caller's variable.",
          "It creates a pointer in the global namespace.",
          "It is automatically converted to an atomic shared buffer."
        ],
        correctAnswer: "It is passed by value; changes inside the function do not affect the caller's variable.",
        difficulty: 3,
        explanation: "All primitive types in JavaScript are passed by value (copying the value). Only objects have their reference copied by value."
      },
      {
        text: "In JavaScript execution contexts, how are variable environments and lexical environments structured internally?",
        options: [
          "As flat hash arrays indexed by instruction pointer.",
          "As an environment record linked to an outer environment reference forming a linked hierarchy.",
          "As operating system thread stacks with fixed 1MB boundaries.",
          "As circular queues stored in DOM nodes."
        ],
        correctAnswer: "As an environment record linked to an outer environment reference forming a linked hierarchy.",
        difficulty: 4,
        explanation: "The ECMAScript specification defines an Execution Context as containing a LexicalEnvironment and VariableEnvironment, each holding an Environment Record and a pointer to an outer LexicalEnvironment."
      },
      {
        text: "Why can excessive retention of closures lead to accidental memory leaks?",
        options: [
          "Because closures prevent the execution stack from ever popping.",
          "Because retained inner functions keep their entire parent LexicalEnvironment alive in heap memory, preventing GC.",
          "Because closures duplicate bytecode on every invocation.",
          "Because closures corrupt CPU cache lines."
        ],
        correctAnswer: "Because retained inner functions keep their entire parent LexicalEnvironment alive in heap memory, preventing GC.",
        difficulty: 4,
        explanation: "If an inner function persists (e.g. event listener or global timer), garbage collectors cannot reclaim variables in the enclosing scope that are reachable through the closure chain."
      },
      {
        text: "How does proper tail call optimization (PTCO) affect stack frame allocation in compliant runtime engines?",
        options: [
          "It duplicates stack frames to preserve historical tracing.",
          "It reuses the current stack frame for tail-position recursive calls, guaranteeing O(1) stack space.",
          "It moves the stack frame into WebAssembly linear memory.",
          "It converts recursion into multithreaded workers."
        ],
        correctAnswer: "It reuses the current stack frame for tail-position recursive calls, guaranteeing O(1) stack space.",
        difficulty: 5,
        explanation: "When a function returns directly the result of calling another function in tail position, the engine can overwrite the current activation frame instead of pushing a new frame, avoiding stack overflows."
      }
    ]
  },
  {
    name: "Data Structures: Arrays & Hash Maps",
    slug: "data-structures-arrays-hashmaps",
    description: "Contiguous memory, hash functions, collision resolution strategies, and amortized complexity analysis.",
    orderIndex: 4,
    initialMastery: 0.40,
    questions: [
      {
        text: "What is the average time complexity for accessing an element in an array by its numeric index?",
        options: ["O(N)", "O(log N)", "O(1)", "O(N^2)"],
        correctAnswer: "O(1)",
        difficulty: 1,
        explanation: "Arrays store elements in contiguous memory blocks. The address is calculated directly via `base_address + (index * element_size)` in O(1) constant time."
      },
      {
        text: "What is the average time complexity for key lookup in a well-distributed Hash Map?",
        options: ["O(N)", "O(log N)", "O(1)", "O(N log N)"],
        correctAnswer: "O(1)",
        difficulty: 1,
        explanation: "Hash maps compute the hash code of the key and map it to a bucket index, achieving O(1) average lookup and insertion."
      },
      {
        text: "What does 'amortized O(1)' mean in the context of dynamic array insertion (e.g. `push`)?",
        options: [
          "Every single insertion takes strictly 1 CPU cycle.",
          "While resizing and copying elements takes O(N) occasionally, the average time per insertion across a sequence of operations is O(1).",
          "The array never runs out of memory.",
          "Insertions at the beginning of the array take O(1)."
        ],
        correctAnswer: "While resizing and copying elements takes O(N) occasionally, the average time per insertion across a sequence of operations is O(1).",
        difficulty: 2,
        explanation: "When a dynamic array reaches capacity, it doubles its buffer (O(N) operation). Because doubling occurs exponentially less often, the aggregated average cost per push is O(1)."
      },
      {
        text: "Which of the following is a common collision resolution technique in hash tables?",
        options: ["Separate Chaining", "Depth First Search", "Tail Call Reduction", "Quick Select"],
        correctAnswer: "Separate Chaining",
        difficulty: 2,
        explanation: "Separate chaining handles collisions by storing multiple key-value pairs that hash to the same bucket in a linked list or red-black tree."
      },
      {
        text: "What is the worst-case time complexity of lookup in a naive hash map where all keys collide into a single bucket?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N!)"],
        correctAnswer: "O(N)",
        difficulty: 3,
        explanation: "When every key hashes to the same bucket and collisions are resolved via standard linked lists, searching degenerates into linear search O(N)."
      },
      {
        text: "How does the 'Load Factor' threshold typically trigger hash table re-hashing?",
        options: [
          "When memory reaches 100% capacity.",
          "When the ratio of stored elements to total bucket count exceeds a threshold (e.g., 0.75), doubling the bucket array and re-inserting elements.",
          "When duplicate keys are detected.",
          "When garbage collection runs."
        ],
        correctAnswer: "When the ratio of stored elements to total bucket count exceeds a threshold (e.g., 0.75), doubling the bucket array and re-inserting elements.",
        difficulty: 3,
        explanation: "Load factor = entries / buckets. Exceeding 0.75 increases collision likelihood, so the hash table allocates a larger bucket array and re-hashes existing items."
      },
      {
        text: "Why do modern hash maps like Java 8+ HashMap or C++ Abseil Swiss Tables convert linked list buckets into balanced trees or SIMD control bytes?",
        options: [
          "To reduce worst-case search complexity from O(N) to O(log N) or leverage CPU vector instructions for parallel probe checking.",
          "To preserve the insertion order of elements.",
          "To eliminate the need for hash codes.",
          "To prevent memory garbage collection."
        ],
        correctAnswer: "To reduce worst-case search complexity from O(N) to O(log N) or leverage CPU vector instructions for parallel probe checking.",
        difficulty: 4,
        explanation: "Java 8 converts linked lists into red-black trees when bucket length exceeds 8 (O(log N) worst case). Swiss Tables use 16-byte SIMD lookups across control bytes to minimize cache misses."
      },
      {
        text: "In open addressing with linear probing, what is the 'primary clustering' problem?",
        options: [
          "Memory leaks caused by cyclic references.",
          "Collisions creating long contiguous occupied bucket runs, causing subsequent insertions to take increasingly long probe sequences.",
          "CPU branch prediction failures.",
          "Hash functions returning negative integers."
        ],
        correctAnswer: "Collisions creating long contiguous occupied bucket runs, causing subsequent insertions to take increasingly long probe sequences.",
        difficulty: 4,
        explanation: "Linear probing places colliding items into the next adjacent free slot. Clusters merge together, degrading probe efficiency toward O(N)."
      },
      {
        text: "How does V8 implement JavaScript `Map` vs standard plain objects regarding key ordering and hash lookup?",
        options: [
          "Objects retain deterministic insertion order across all numeric and string keys, while Map does not.",
          "Map uses a deterministic hash table with an insertion-order doubly-linked list or ordered backing store, supporting arbitrary key types including object identities.",
          "Map internally converts all keys to JSON strings.",
          "Map allocates memory directly in the GPU VRAM."
        ],
        correctAnswer: "Map uses a deterministic hash table with an insertion-order doubly-linked list or ordered backing store, supporting arbitrary key types including object identities.",
        difficulty: 5,
        explanation: "ECMAScript specification mandates that `Map` iterates keys strictly in insertion order and allows object references as keys via hash identity, whereas plain Objects categorize integer indices first and coerce keys to strings/symbols."
      }
    ]
  },
  {
    name: "Recursion & Divide-and-Conquer",
    slug: "recursion-divide-and-conquer",
    description: "Base case formulation, call stack dynamics, recurrence relations, and divide-and-conquer paradigms.",
    orderIndex: 5,
    initialMastery: 0.25,
    questions: [
      {
        text: "What is the primary role of a base case in a recursive function?",
        options: [
          "To increase computational speed.",
          "To provide a terminating condition that halts further recursive calls and prevents stack overflow.",
          "To initialize global variables.",
          "To handle asynchronous promises."
        ],
        correctAnswer: "To provide a terminating condition that halts further recursive calls and prevents stack overflow.",
        difficulty: 1,
        explanation: "Without a valid base case, a recursive function will invoke itself indefinitely until the execution environment exhausts stack space and throws a stack overflow error."
      },
      {
        text: "What error occurs in Node.js/browsers when a recursive function lacks a terminating base condition?",
        options: ["SyntaxError", "RangeError: Maximum call stack size exceeded", "ReferenceError: Stack destroyed", "OutOfMemoryError"],
        correctAnswer: "RangeError: Maximum call stack size exceeded",
        difficulty: 1,
        explanation: "Exceeding the engine's call stack limit causes a `RangeError: Maximum call stack size exceeded`."
      },
      {
        text: "What are the three fundamental steps of the Divide-and-Conquer algorithmic design paradigm?",
        options: [
          "Map, Filter, Reduce",
          "Divide the problem into subproblems, Conquer subproblems recursively, Combine solutions to form the answer.",
          "Parse, Compile, Execute",
          "Scan, Sort, Hash"
        ],
        correctAnswer: "Divide the problem into subproblems, Conquer subproblems recursively, Combine solutions to form the answer.",
        difficulty: 2,
        explanation: "Divide-and-conquer breaks a large problem into identical smaller subproblems, solves them recursively, and combines the sub-results."
      },
      {
        text: "What is the time complexity of the classic Merge Sort algorithm on an array of size N?",
        options: ["O(N^2)", "O(N log N)", "O(log N)", "O(N)"],
        correctAnswer: "O(N log N)",
        difficulty: 2,
        explanation: "Merge sort splits the array in half at each step (log N levels of recursion) and merges sub-arrays in O(N) time at each level, yielding O(N log N) consistently."
      },
      {
        text: "According to the Master Theorem, what is the time complexity of a recurrence relation T(N) = 2T(N/2) + O(N)?",
        options: ["O(N)", "O(N log N)", "O(N^2)", "O(log N)"],
        correctAnswer: "O(N log N)",
        difficulty: 3,
        explanation: "Here a=2, b=2, and f(N) = O(N^1). Since log_b(a) = log_2(2) = 1, we match Case 2 of the Master Theorem: T(N) = Theta(N^1 * log N)."
      },
      {
        text: "How does memoization transform a naive recursive Fibonacci implementation from exponential O(2^N) to linear time?",
        options: [
          "By caching previously calculated subproblem results in a lookup table to eliminate redundant recursive branches.",
          "By converting recursion into parallel thread pools.",
          "By utilizing GPU shader cores.",
          "By approximating the Fibonacci golden ratio formula."
        ],
        correctAnswer: "By caching previously calculated subproblem results in a lookup table to eliminate redundant recursive branches.",
        difficulty: 3,
        explanation: "Naive Fibonacci repeats redundant calculations exponentially. Memoization stores each `fib(k)` in a cache, computing each value exactly once in O(N) time."
      },
      {
        text: "What is the space complexity of a balanced binary tree recursive traversal with N nodes?",
        options: ["O(N) stack space", "O(log N) stack space due to tree height", "O(1) space always", "O(N log N) space"],
        correctAnswer: "O(log N) stack space due to tree height",
        difficulty: 4,
        explanation: "The call stack memory is proportional to the maximum recursion depth, which is the height of the tree. For a balanced tree, height is O(log N)."
      },
      {
        text: "Why is QuickSort preferred over MergeSort for in-memory primitive sorting in many systems, despite both having O(N log N) average complexity?",
        options: [
          "QuickSort has better cache locality and sorts in-place with O(log N) auxiliary space, whereas MergeSort requires O(N) extra buffer memory.",
          "QuickSort has guaranteed O(N) worst-case performance.",
          "QuickSort is a stable sorting algorithm.",
          "QuickSort requires zero branch comparisons."
        ],
        correctAnswer: "QuickSort has better cache locality and sorts in-place with O(log N) auxiliary space, whereas MergeSort requires O(N) extra buffer memory.",
        difficulty: 4,
        explanation: "QuickSort operates in-place with great spatial cache locality and minimal allocations. Standard MergeSort requires O(N) auxiliary array allocations."
      },
      {
        text: "How can the Ackermann function A(m, n) demonstrate the fundamental difference between primitive recursive and general mu-recursive functions?",
        options: [
          "It can be unrolled into a single for-loop.",
          "It grows faster than any primitive recursive function and cannot be computed with bounded loops, exhausting stack depth almost immediately.",
          "It executes in O(1) time.",
          "It is mathematically non-computable by a Turing machine."
        ],
        correctAnswer: "It grows faster than any primitive recursive function and cannot be computed with bounded loops, exhausting stack depth almost immediately.",
        difficulty: 5,
        explanation: "The Ackermann function is a classic example of a total computable function that is not primitive recursive; its hyperoperation growth overwhelms standard recursion limits."
      }
    ]
  },
  {
    name: "Asynchronous Architecture & Event Loop",
    slug: "async-architecture-event-loop",
    description: "Macrotasks vs microtasks, Promise lifecycle, non-blocking I/O, event loop phases, and concurrency.",
    orderIndex: 6,
    initialMastery: 0.10,
    questions: [
      {
        text: "Which queue has strict priority and drains completely before the next macrotask executes in the JavaScript event loop?",
        options: ["Macrotask queue (Timer queue)", "Microtask queue (Promises, queueMicrotask)", "I/O polling queue", "Render queue"],
        correctAnswer: "Microtask queue (Promises, queueMicrotask)",
        difficulty: 1,
        explanation: "After each task in the macrotask queue completes, the engine drains the entire microtask queue before yielding or picking the next macrotask."
      },
      {
        text: "What will `Promise.resolve().then(() => console.log('A')); console.log('B');` output?",
        options: ["'A' then 'B'", "'B' then 'A'", "Simultaneously", "Undefined"],
        correctAnswer: "'B' then 'A'",
        difficulty: 1,
        explanation: "`console.log('B')` runs synchronously in the current turn of the execution context. The `.then()` callback is queued as a microtask and executes afterward."
      },
      {
        text: "Which of the following creates a macrotask in the browser / Node.js environment?",
        options: ["`queueMicrotask()`", "`Promise.resolve().then()`", "`setTimeout()`", "`process.nextTick()`"],
        correctAnswer: "`setTimeout()`",
        difficulty: 2,
        explanation: "`setTimeout` registers a timer that queues a macrotask upon expiration. `Promise.then` and `queueMicrotask` schedule microtasks."
      },
      {
        text: "What is the difference between `Promise.all` and `Promise.allSettled`?",
        options: [
          "`Promise.all` rejects immediately upon the first rejection (fail-fast), whereas `Promise.allSettled` waits for all promises to resolve or reject.",
          "`Promise.allSettled` rejects if any promise is pending.",
          "`Promise.all` only accepts array of numbers.",
          "`Promise.allSettled` runs sequentially instead of concurrently."
        ],
        correctAnswer: "`Promise.all` rejects immediately upon the first rejection (fail-fast), whereas `Promise.allSettled` waits for all promises to resolve or reject.",
        difficulty: 2,
        explanation: "`Promise.all` short-circuits on first rejection. `Promise.allSettled` waits for all promises to settle and returns an array of status objects `{status, value|reason}`."
      },
      {
        text: "What does the `async` keyword prepend to the return value of any function it decorates?",
        options: ["An Observable", "A Promise", "A Generator function", "A Web Worker thread"],
        correctAnswer: "A Promise",
        difficulty: 3,
        explanation: "Functions marked `async` automatically wrap their return value in a resolved `Promise` (or a rejected Promise if an error is thrown)."
      },
      {
        text: "In Node.js libuv architecture, what are the primary phases of the event loop in sequence?",
        options: [
          "Timers -> Pending Callbacks -> Idle/Prepare -> Poll -> Check -> Close Callbacks",
          "Poll -> Timers -> Render -> Check",
          "Microtasks -> Macrotasks -> System -> Close",
          "Input -> Compute -> Output -> Garbage Collect"
        ],
        correctAnswer: "Timers -> Pending Callbacks -> Idle/Prepare -> Poll -> Check -> Close Callbacks",
        difficulty: 3,
        explanation: "libuv processes: (1) Timers (`setTimeout`), (2) Pending callbacks, (3) Idle/prepare, (4) Poll (I/O), (5) Check (`setImmediate`), (6) Close callbacks."
      },
      {
        text: "What will happen if a microtask recursively enqueues another microtask indefinitely (e.g. `const loop = () => Promise.resolve().then(loop); loop();`)?",
        options: [
          "It gracefully schedules on the next timer tick.",
          "It starves the event loop, freezing I/O, timers, and UI rendering because the microtask queue never drains.",
          "It throws a Maximum Call Stack Size Exceeded error immediately.",
          "It spawns additional background threads."
        ],
        correctAnswer: "It starves the event loop, freezing I/O, timers, and UI rendering because the microtask queue never drains.",
        difficulty: 4,
        explanation: "Because the event loop will not proceed to rendering, I/O, or the next macrotask until the microtask queue is empty, an infinite microtask chain starves the entire thread."
      },
      {
        text: "What is the critical semantic difference between Node.js `setImmediate()` and `process.nextTick()`?",
        options: [
          "`process.nextTick()` fires immediately after current synchronous code before the microtask queue and before the event loop continues; `setImmediate()` fires in the Check phase of the event loop.",
          "`setImmediate()` is faster than `process.nextTick()`.",
          "`process.nextTick()` uses Web Workers.",
          "`setImmediate()` only runs in browsers."
        ],
        correctAnswer: "`process.nextTick()` fires immediately after current synchronous code before the microtask queue and before the event loop continues; `setImmediate()` fires in the Check phase of the event loop.",
        difficulty: 4,
        explanation: "`process.nextTick()` is technically not part of the libuv event loop; it runs immediately after the current operation completes, prior to standard microtasks and next phases."
      },
      {
        text: "Under high concurrency, how can an unhandled Promise race condition trigger memory leaks via dangling closure references?",
        options: [
          "By exceeding the maximum TCP socket limit.",
          "If a Promise never settles (remains pending forever), its `.then()` callbacks and all variables retained in their lexical closures cannot be garbage collected.",
          "Promises allocate non-heap C++ memory that requires explicit manual `free()` calls.",
          "By corrupting the V8 hidden class shape tables."
        ],
        correctAnswer: "If a Promise never settles (remains pending forever), its `.then()` callbacks and all variables retained in their lexical closures cannot be garbage collected.",
        difficulty: 5,
        explanation: "A pending Promise maintains references to its fulfillment and rejection handlers. If an event or timeout never triggers settlement, every object and scope referenced by those callback closures remains reachable on the heap."
      }
    ]
  }
];
