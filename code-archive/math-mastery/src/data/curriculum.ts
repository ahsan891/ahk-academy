export interface Exercise {
  id: string;
  question: string;
  latex?: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'exam';
  type: 'multiple-choice' | 'short-answer' | 'true-false';
}

export interface Lesson {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'exam';
  content: string[];
  keyFormulas?: string[];
  examples?: { problem: string; solution: string }[];
  exercises: Exercise[];
}

export interface Topic {
  id: string;
  number: string;
  title: string;
  pageStart: number;
  lessons: Lesson[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  topics: Topic[];
}

export const curriculum: Chapter[] = [
  {
    id: 'ch1',
    number: 1,
    title: 'Sequences, Series & Proof',
    subtitle: 'From patterns to generalizations',
    color: '#6366f1',
    icon: '∑',
    topics: [
      {
        id: 'ch1-1',
        number: '1.1',
        title: 'Sequences, Series and Sigma Notation',
        pageStart: 4,
        lessons: [
          {
            id: 'ch1-1-beg',
            title: 'Understanding Sequences',
            difficulty: 'beginner',
            content: [
              'A **sequence** is simply a list of numbers following a pattern. Think of it like a recipe — each number is created using a specific rule.',
              'For example: 2, 4, 6, 8, 10... Each number is 2 more than the last. We call each number a **term**.',
              'We write the nth term as u_n. So u_1 = 2, u_2 = 4, u_3 = 6.',
              'A **series** is what you get when you ADD the terms: 2 + 4 + 6 + 8 + 10 = 30.',
              '**Sigma notation** (∑) is a shorthand for writing series. Instead of writing all terms, we write ∑(k=1 to 5) 2k = 2 + 4 + 6 + 8 + 10.'
            ],
            keyFormulas: [
              'u_n = \\text{formula for nth term}',
              'S_n = \\sum_{k=1}^{n} u_k',
            ],
            examples: [
              {
                problem: 'Find the first 4 terms of the sequence u_n = 3n + 1',
                solution: 'u_1 = 3(1)+1 = 4, u_2 = 3(2)+1 = 7, u_3 = 3(3)+1 = 10, u_4 = 3(4)+1 = 13. The sequence is 4, 7, 10, 13.'
              }
            ],
            exercises: [
              {
                id: 'ch1-1-beg-1',
                question: 'What is the 5th term of the sequence u_n = 2n - 1?',
                options: ['7', '9', '11', '13'],
                answer: '9',
                explanation: 'u_5 = 2(5) - 1 = 10 - 1 = 9',
                difficulty: 'beginner',
                type: 'multiple-choice'
              },
              {
                id: 'ch1-1-beg-2',
                question: 'Write the first 3 terms of u_n = n²',
                answer: '1, 4, 9',
                explanation: 'u_1 = 1² = 1, u_2 = 2² = 4, u_3 = 3² = 9',
                difficulty: 'beginner',
                type: 'short-answer'
              },
              {
                id: 'ch1-1-beg-3',
                question: 'A series is the product of all terms in a sequence.',
                answer: 'false',
                explanation: 'A series is the SUM of the terms, not the product.',
                difficulty: 'beginner',
                type: 'true-false'
              },
              {
                id: 'ch1-1-beg-4',
                question: 'What does ∑(k=1 to 3) k mean?',
                options: ['1 × 2 × 3', '1 + 2 + 3', '3', '1'],
                answer: '1 + 2 + 3',
                explanation: '∑(k=1 to 3) k = 1 + 2 + 3 = 6. Sigma notation means we sum.',
                difficulty: 'beginner',
                type: 'multiple-choice'
              }
            ]
          },
          {
            id: 'ch1-1-int',
            title: 'Working with Sigma Notation',
            difficulty: 'intermediate',
            content: [
              'Now let\'s get comfortable manipulating sigma notation. Key properties:',
              '**Linearity:** ∑(au_k + bv_k) = a∑u_k + b∑v_k — you can split sums and pull out constants.',
              '**Shifting indices:** ∑(k=1 to n) u_k = ∑(k=0 to n-1) u_{k+1} — same sum, different index.',
              '**Telescoping sums:** When consecutive terms cancel, e.g., ∑(f(k+1) - f(k)) = f(n+1) - f(1).',
              'Common results: ∑(k=1 to n) 1 = n, ∑(k=1 to n) k = n(n+1)/2, ∑(k=1 to n) k² = n(n+1)(2n+1)/6.'
            ],
            keyFormulas: [
              '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}',
              '\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}',
              '\\sum_{k=1}^{n} k^3 = \\left[\\frac{n(n+1)}{2}\\right]^2',
            ],
            examples: [
              {
                problem: 'Evaluate ∑(k=1 to 100) k',
                solution: 'Using the formula: n(n+1)/2 = 100(101)/2 = 5050'
              },
              {
                problem: 'Evaluate ∑(k=1 to 5) (3k² - 2k)',
                solution: '3∑k² - 2∑k = 3·(5·6·11/6) - 2·(5·6/2) = 3·55 - 2·15 = 165 - 30 = 135'
              }
            ],
            exercises: [
              {
                id: 'ch1-1-int-1',
                question: 'Evaluate ∑(k=1 to 50) k',
                answer: '1275',
                explanation: 'Using n(n+1)/2 = 50(51)/2 = 1275',
                difficulty: 'intermediate',
                type: 'short-answer'
              },
              {
                id: 'ch1-1-int-2',
                question: 'What is ∑(k=1 to 4) (2k + 1)?',
                options: ['20', '24', '28', '32'],
                answer: '24',
                explanation: '(2·1+1) + (2·2+1) + (2·3+1) + (2·4+1) = 3+5+7+9 = 24',
                difficulty: 'intermediate',
                type: 'multiple-choice'
              },
              {
                id: 'ch1-1-int-3',
                question: 'Evaluate ∑(k=1 to 10) k²',
                answer: '385',
                explanation: 'Using n(n+1)(2n+1)/6 = 10(11)(21)/6 = 2310/6 = 385',
                difficulty: 'intermediate',
                type: 'short-answer'
              }
            ]
          },
          {
            id: 'ch1-1-adv',
            title: 'Advanced Series Techniques',
            difficulty: 'advanced',
            content: [
              'At this level, you need to handle **telescoping series**, **partial fractions in series**, and **prove series formulas by induction**.',
              '**Telescoping:** Write ∑(f(k) - f(k+1)). Most terms cancel, leaving f(1) - f(n+1).',
              '**Partial fractions:** To sum 1/(k(k+1)), decompose: 1/(k(k+1)) = 1/k - 1/(k+1). Then telescope.',
              'You should be able to convert between recursive and explicit formulas, and use sigma notation fluently in proofs.'
            ],
            keyFormulas: [
              '\\frac{1}{k(k+1)} = \\frac{1}{k} - \\frac{1}{k+1}',
              '\\sum_{k=1}^{n}\\frac{1}{k(k+1)} = 1 - \\frac{1}{n+1} = \\frac{n}{n+1}',
            ],
            examples: [
              {
                problem: 'Find ∑(k=1 to n) 1/(k(k+1))',
                solution: 'Using partial fractions: 1/(k(k+1)) = 1/k - 1/(k+1). Sum telescopes: (1-1/2) + (1/2-1/3) + ... + (1/n-1/(n+1)) = 1 - 1/(n+1) = n/(n+1)'
              }
            ],
            exercises: [
              {
                id: 'ch1-1-adv-1',
                question: 'Find ∑(k=1 to 99) 1/(k(k+1))',
                options: ['99/100', '100/101', '49/50', '1'],
                answer: '99/100',
                explanation: 'The telescoping sum gives n/(n+1) = 99/100',
                difficulty: 'advanced',
                type: 'multiple-choice'
              },
              {
                id: 'ch1-1-adv-2',
                question: 'Express ∑(k=1 to n) (3k² + k) in closed form',
                answer: 'n(n+1)(2n+1)/2 + n(n+1)/2 = n(n+1)(2n+2)/2 = n(n+1)²',
                explanation: '3·n(n+1)(2n+1)/6 + n(n+1)/2 = n(n+1)(2n+1)/2 + n(n+1)/2 = n(n+1)(2n+2)/2 = n(n+1)²',
                difficulty: 'advanced',
                type: 'short-answer'
              }
            ]
          }
        ]
      },
      {
        id: 'ch1-2',
        number: '1.2',
        title: 'Arithmetic and Geometric Sequences and Series',
        pageStart: 10,
        lessons: [
          {
            id: 'ch1-2-beg',
            title: 'Arithmetic Sequences Basics',
            difficulty: 'beginner',
            content: [
              'An **arithmetic sequence** has a constant difference between consecutive terms. Like stairs — each step is the same height.',
              'If the first term is a and the common difference is d, then: u_1 = a, u_2 = a+d, u_3 = a+2d, ...',
              'The nth term: u_n = a + (n-1)d',
              'Example: 3, 7, 11, 15, 19... Here a = 3, d = 4. So u_n = 3 + (n-1)·4 = 4n - 1.',
              'The sum of n terms: S_n = n/2 · (2a + (n-1)d) = n/2 · (first + last)'
            ],
            keyFormulas: [
              'u_n = a + (n-1)d',
              'S_n = \\frac{n}{2}(2a + (n-1)d)',
              'S_n = \\frac{n}{2}(u_1 + u_n)',
            ],
            examples: [
              {
                problem: 'Find the 20th term and sum of first 20 terms of: 5, 8, 11, 14, ...',
                solution: 'a = 5, d = 3. u_20 = 5 + 19(3) = 62. S_20 = 20/2 · (5 + 62) = 10 · 67 = 670'
              }
            ],
            exercises: [
              {
                id: 'ch1-2-beg-1',
                question: 'Find the 10th term of the arithmetic sequence: 2, 5, 8, 11, ...',
                options: ['26', '29', '32', '35'],
                answer: '29',
                explanation: 'a = 2, d = 3. u_10 = 2 + 9(3) = 2 + 27 = 29',
                difficulty: 'beginner',
                type: 'multiple-choice'
              },
              {
                id: 'ch1-2-beg-2',
                question: 'What is the common difference of: 15, 11, 7, 3, ...?',
                answer: '-4',
                explanation: '11 - 15 = -4. The common difference is -4.',
                difficulty: 'beginner',
                type: 'short-answer'
              },
              {
                id: 'ch1-2-beg-3',
                question: 'Find S_5 for the sequence: 1, 3, 5, 7, 9',
                answer: '25',
                explanation: 'S_5 = 5/2 · (1 + 9) = 5/2 · 10 = 25',
                difficulty: 'beginner',
                type: 'short-answer'
              }
            ]
          },
          {
            id: 'ch1-2-int',
            title: 'Geometric Sequences and Series',
            difficulty: 'intermediate',
            content: [
              'A **geometric sequence** has a constant ratio between consecutive terms. Like compound interest — each term is multiplied by the same factor.',
              'If the first term is a and the common ratio is r, then: u_n = a · r^(n-1)',
              'Sum of n terms: S_n = a(1-r^n)/(1-r) when r ≠ 1',
              'When |r| < 1, the **infinite sum** converges: S_∞ = a/(1-r)',
              'This is used in finance (compound interest, annuities), population growth, and radioactive decay.'
            ],
            keyFormulas: [
              'u_n = ar^{n-1}',
              'S_n = \\frac{a(1-r^n)}{1-r}, \\quad r \\neq 1',
              'S_\\infty = \\frac{a}{1-r}, \\quad |r| < 1',
            ],
            examples: [
              {
                problem: 'Find S_∞ for the series 8 + 4 + 2 + 1 + ...',
                solution: 'a = 8, r = 1/2. Since |r| < 1, S_∞ = 8/(1-1/2) = 8/(1/2) = 16'
              }
            ],
            exercises: [
              {
                id: 'ch1-2-int-1',
                question: 'Find the 6th term of: 3, 6, 12, 24, ...',
                options: ['48', '96', '192', '384'],
                answer: '96',
                explanation: 'a = 3, r = 2. u_6 = 3 · 2^5 = 3 · 32 = 96',
                difficulty: 'intermediate',
                type: 'multiple-choice'
              },
              {
                id: 'ch1-2-int-2',
                question: 'Find the sum of the infinite geometric series: 12 + 4 + 4/3 + ...',
                answer: '18',
                explanation: 'a = 12, r = 1/3. S_∞ = 12/(1-1/3) = 12/(2/3) = 18',
                difficulty: 'intermediate',
                type: 'short-answer'
              }
            ]
          },
          {
            id: 'ch1-2-adv',
            title: 'Applications and Complex Problems',
            difficulty: 'advanced',
            content: [
              'At the advanced level, you combine arithmetic and geometric series with real-world problems and algebraic manipulation.',
              '**Loan repayments:** Monthly payment creates a geometric series of present values.',
              '**Compound interest:** A = P(1 + r/n)^(nt). This IS a geometric sequence.',
              'You may need to find terms given S_n, solve simultaneous equations from series conditions, or handle mixed series problems.'
            ],
            exercises: [
              {
                id: 'ch1-2-adv-1',
                question: 'In a geometric sequence, u_3 = 18 and u_6 = 486. Find a and r.',
                answer: 'r = 3, a = 2',
                explanation: 'u_6/u_3 = ar^5/(ar^2) = r^3 = 486/18 = 27, so r = 3. Then u_3 = ar^2 = 9a = 18, so a = 2.',
                difficulty: 'advanced',
                type: 'short-answer'
              },
              {
                id: 'ch1-2-adv-2',
                question: 'The sum of an infinite GP is 20, and the sum of the squares of its terms is 100. Find a and r.',
                answer: 'a = 10, r = 1/2',
                explanation: 'S = a/(1-r) = 20. Squares form GP with first term a², ratio r². Sum = a²/(1-r²) = 100. Dividing: a(1+r)/(1-r) · (1-r)/a = 100/20 → a(1+r) = 5a → but need to solve simultaneously.',
                difficulty: 'advanced',
                type: 'short-answer'
              }
            ]
          }
        ]
      },
      {
        id: 'ch1-3',
        number: '1.3',
        title: 'Proof',
        pageStart: 33,
        lessons: [
          {
            id: 'ch1-3-beg',
            title: 'Introduction to Mathematical Proof',
            difficulty: 'beginner',
            content: [
              'A **proof** is a logical argument that shows a statement is ALWAYS true — not just for some examples.',
              '**Direct proof:** Start with what you know, apply logical steps, arrive at what you want to show.',
              '**Proof by contradiction:** Assume the opposite is true, show this leads to an impossibility.',
              '**Proof by induction:** Like dominos — show the first one falls, then show if any one falls the next one does too.',
              'Key: A few examples don\'t prove anything! The statement "all primes are odd" seems true for 3,5,7 but fails for 2.'
            ],
            exercises: [
              {
                id: 'ch1-3-beg-1',
                question: 'What type of proof assumes the opposite and finds a contradiction?',
                options: ['Direct proof', 'Proof by contradiction', 'Proof by induction', 'Proof by exhaustion'],
                answer: 'Proof by contradiction',
                explanation: 'In proof by contradiction, we assume the negation of what we want to prove and derive a logical impossibility.',
                difficulty: 'beginner',
                type: 'multiple-choice'
              },
              {
                id: 'ch1-3-beg-2',
                question: 'Giving 5 examples where a statement holds proves it is always true.',
                answer: 'false',
                explanation: 'Examples can never prove a general statement. A single counterexample can disprove it, but no finite number of examples can prove it.',
                difficulty: 'beginner',
                type: 'true-false'
              }
            ]
          },
          {
            id: 'ch1-3-int',
            title: 'Proof by Mathematical Induction',
            difficulty: 'intermediate',
            content: [
              '**Mathematical induction** is the most important proof technique in this course. Three steps:',
              '**Step 1 (Base case):** Show the statement is true for n = 1.',
              '**Step 2 (Inductive hypothesis):** ASSUME it\'s true for n = k.',
              '**Step 3 (Inductive step):** PROVE it\'s true for n = k + 1, using the assumption from Step 2.',
              'Think of it as an infinite chain: if the first link holds, and each link supports the next, then ALL links hold.'
            ],
            examples: [
              {
                problem: 'Prove by induction: ∑(i=1 to n) i = n(n+1)/2',
                solution: 'Base case (n=1): LHS = 1, RHS = 1(2)/2 = 1. ✓\nAssume true for n=k: ∑(i=1 to k) i = k(k+1)/2\nFor n=k+1: ∑(i=1 to k+1) i = k(k+1)/2 + (k+1) = (k+1)(k+2)/2 ✓'
              }
            ],
            exercises: [
              {
                id: 'ch1-3-int-1',
                question: 'In proof by induction, what is the first step?',
                options: ['Assume for n=k', 'Prove for n=k+1', 'Show base case n=1', 'Find a pattern'],
                answer: 'Show base case n=1',
                explanation: 'The base case establishes the starting point of the induction.',
                difficulty: 'intermediate',
                type: 'multiple-choice'
              },
              {
                id: 'ch1-3-int-2',
                question: 'In the inductive step, we prove the statement for n = k+1 assuming it holds for n = ?',
                answer: 'k',
                explanation: 'We assume the statement is true for n = k (inductive hypothesis) and use this to prove n = k+1.',
                difficulty: 'intermediate',
                type: 'short-answer'
              }
            ]
          },
          {
            id: 'ch1-3-adv',
            title: 'Advanced Proof Techniques',
            difficulty: 'advanced',
            content: [
              'At this level you need to apply induction to divisibility, inequalities, and more complex series.',
              '**Divisibility proofs:** Show f(k+1) - f(k) is divisible by the required number, using the inductive hypothesis.',
              '**Inequality proofs:** Often need algebraic manipulation plus the hypothesis.',
              '**Counterexamples:** To disprove, find ONE case where the statement fails.',
              'You also need proof by contradiction (e.g., √2 is irrational).'
            ],
            exercises: [
              {
                id: 'ch1-3-adv-1',
                question: 'Prove by induction or state the result: 3^n - 1 is divisible by 2 for all n ≥ 1. What is 3^5 - 1?',
                answer: '242',
                explanation: '3^5 - 1 = 243 - 1 = 242 = 2 × 121. Indeed divisible by 2.',
                difficulty: 'advanced',
                type: 'short-answer'
              }
            ]
          }
        ]
      },
      {
        id: 'ch1-4',
        number: '1.4',
        title: 'Counting Principles and Binomial Theorem',
        pageStart: 51,
        lessons: [
          {
            id: 'ch1-4-beg',
            title: 'Counting, Permutations and Combinations',
            difficulty: 'beginner',
            content: [
              '**Counting principle:** If you have m ways to do one thing and n ways to do another, there are m × n ways to do both.',
              '**Factorial:** n! = n × (n-1) × (n-2) × ... × 1. For example, 5! = 120.',
              '**Permutations (order matters):** nPr = n!/(n-r)! — arranging r items from n.',
              '**Combinations (order doesn\'t matter):** nCr = n!/(r!(n-r)!) — choosing r items from n.',
              'Example: From 5 people, choosing 3 for a committee: 5C3 = 10. Arranging 3 in a line: 5P3 = 60.'
            ],
            keyFormulas: [
              'n! = n \\times (n-1) \\times \\cdots \\times 1',
              '^nP_r = \\frac{n!}{(n-r)!}',
              '\\binom{n}{r} = \\frac{n!}{r!(n-r)!}',
            ],
            exercises: [
              {
                id: 'ch1-4-beg-1',
                question: 'Calculate 6!',
                options: ['120', '360', '720', '5040'],
                answer: '720',
                explanation: '6! = 6 × 5 × 4 × 3 × 2 × 1 = 720',
                difficulty: 'beginner',
                type: 'multiple-choice'
              },
              {
                id: 'ch1-4-beg-2',
                question: 'How many ways can you choose 2 items from 5? (order doesn\'t matter)',
                answer: '10',
                explanation: '5C2 = 5!/(2!·3!) = 120/(2·6) = 10',
                difficulty: 'beginner',
                type: 'short-answer'
              }
            ]
          },
          {
            id: 'ch1-4-int',
            title: 'The Binomial Theorem',
            difficulty: 'intermediate',
            content: [
              'The **binomial theorem** expands (a + b)^n without multiplying n times:',
              '(a + b)^n = ∑(k=0 to n) C(n,k) · a^(n-k) · b^k',
              'The coefficients C(n,k) form **Pascal\'s triangle**: each number is the sum of the two above it.',
              'Key pattern: C(n,0) = C(n,n) = 1, and C(n,k) = C(n, n-k).',
              'The general term is T_{r+1} = C(n,r) · a^(n-r) · b^r'
            ],
            keyFormulas: [
              '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k',
              'T_{r+1} = \\binom{n}{r} a^{n-r} b^r',
            ],
            exercises: [
              {
                id: 'ch1-4-int-1',
                question: 'What is the coefficient of x³ in (1 + x)^5?',
                options: ['5', '10', '15', '20'],
                answer: '10',
                explanation: 'C(5,3) = 5!/(3!·2!) = 10',
                difficulty: 'intermediate',
                type: 'multiple-choice'
              },
              {
                id: 'ch1-4-int-2',
                question: 'Expand (1 + x)^4',
                answer: '1 + 4x + 6x² + 4x³ + x⁴',
                explanation: 'Using binomial theorem: C(4,0) + C(4,1)x + C(4,2)x² + C(4,3)x³ + C(4,4)x⁴ = 1 + 4x + 6x² + 4x³ + x⁴',
                difficulty: 'intermediate',
                type: 'short-answer'
              }
            ]
          },
          {
            id: 'ch1-4-adv',
            title: 'Advanced Binomial Applications',
            difficulty: 'advanced',
            content: [
              'Find specific terms, work with fractional/negative exponents, and connect to probability.',
              'Finding the term independent of x in expansions like (x² + 1/x)^6.',
              'Using the binomial theorem to approximate: (1.01)^10 ≈ 1 + 10(0.01) + 45(0.01)² + ...'
            ],
            exercises: [
              {
                id: 'ch1-4-adv-1',
                question: 'Find the term independent of x in (x + 1/x)^6',
                answer: '20',
                explanation: 'T_{r+1} = C(6,r) · x^(6-r) · (1/x)^r = C(6,r) · x^(6-2r). For x^0: 6-2r=0, r=3. T_4 = C(6,3) = 20',
                difficulty: 'advanced',
                type: 'short-answer'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ch2',
    number: 2,
    title: 'Functions',
    subtitle: 'Representing relationships',
    color: '#06b6d4',
    icon: 'f(x)',
    topics: [
      {
        id: 'ch2-1',
        number: '2.1',
        title: 'Functional Relationships',
        pageStart: 75,
        lessons: [
          {
            id: 'ch2-1-beg',
            title: 'What is a Function?',
            difficulty: 'beginner',
            content: [
              'A **function** is a rule that assigns EXACTLY ONE output to each input. Think of it like a machine: put in a number, get out a number.',
              '**Domain:** All possible inputs (x-values). **Range:** All possible outputs (y-values).',
              'We write f(x) = 2x + 3. If x = 4, then f(4) = 2(4) + 3 = 11.',
              'The **vertical line test:** If any vertical line crosses a graph more than once, it\'s NOT a function.',
              '**One-to-one function:** Each output comes from exactly one input. Passes the horizontal line test too.'
            ],
            exercises: [
              {
                id: 'ch2-1-beg-1',
                question: 'If f(x) = 3x - 2, what is f(5)?',
                answer: '13',
                explanation: 'f(5) = 3(5) - 2 = 15 - 2 = 13',
                difficulty: 'beginner',
                type: 'short-answer'
              },
              {
                id: 'ch2-1-beg-2',
                question: 'A circle passes the vertical line test.',
                answer: 'false',
                explanation: 'A circle fails the vertical line test because vertical lines can cross it at two points. So a circle is not a function.',
                difficulty: 'beginner',
                type: 'true-false'
              },
              {
                id: 'ch2-1-beg-3',
                question: 'What is the domain of f(x) = 1/x?',
                options: ['All real numbers', 'x > 0', 'x ≠ 0', 'x ≥ 0'],
                answer: 'x ≠ 0',
                explanation: 'Division by zero is undefined, so x cannot be 0.',
                difficulty: 'beginner',
                type: 'multiple-choice'
              }
            ]
          },
          {
            id: 'ch2-1-int',
            title: 'Domain, Range, and Inverse Functions',
            difficulty: 'intermediate',
            content: [
              'Finding domain requires checking for: division by zero, square roots of negatives, logarithms of non-positives.',
              'The **inverse function** f⁻¹ "undoes" f. If f(3) = 7, then f⁻¹(7) = 3.',
              'To find f⁻¹: swap x and y in y = f(x), then solve for y.',
              'The graph of f⁻¹ is the reflection of f in the line y = x.',
              'Only one-to-one functions have inverses (or restrict the domain).'
            ],
            keyFormulas: [
              'f(f^{-1}(x)) = x',
              'f^{-1}(f(x)) = x',
            ],
            exercises: [
              {
                id: 'ch2-1-int-1',
                question: 'Find the inverse of f(x) = 2x + 5',
                answer: 'f⁻¹(x) = (x - 5)/2',
                explanation: 'y = 2x + 5. Swap: x = 2y + 5. Solve: y = (x-5)/2',
                difficulty: 'intermediate',
                type: 'short-answer'
              },
              {
                id: 'ch2-1-int-2',
                question: 'What is the domain of f(x) = √(x - 3)?',
                options: ['x ≥ 0', 'x ≥ 3', 'x > 3', 'All real numbers'],
                answer: 'x ≥ 3',
                explanation: 'We need x - 3 ≥ 0, so x ≥ 3.',
                difficulty: 'intermediate',
                type: 'multiple-choice'
              }
            ]
          }
        ]
      },
      {
        id: 'ch2-2',
        number: '2.2',
        title: 'Special Functions and Their Graphs',
        pageStart: 81,
        lessons: [
          {
            id: 'ch2-2-beg',
            title: 'Linear, Quadratic, and Absolute Value',
            difficulty: 'beginner',
            content: [
              '**Linear:** f(x) = mx + c. Straight line with slope m and y-intercept c.',
              '**Quadratic:** f(x) = ax² + bx + c. Parabola opening up (a>0) or down (a<0). Vertex at x = -b/(2a).',
              '**Absolute value:** f(x) = |x|. V-shaped graph. |x| = x if x ≥ 0, |x| = -x if x < 0.',
              'These are the building blocks. Know their shapes, key features (intercepts, vertex, symmetry).'
            ],
            exercises: [
              {
                id: 'ch2-2-beg-1',
                question: 'What is the vertex of f(x) = x² - 6x + 8?',
                answer: '(3, -1)',
                explanation: 'x = -b/(2a) = 6/2 = 3. f(3) = 9 - 18 + 8 = -1. Vertex is (3, -1).',
                difficulty: 'beginner',
                type: 'short-answer'
              },
              {
                id: 'ch2-2-beg-2',
                question: 'What is |-7|?',
                options: ['-7', '7', '0', '49'],
                answer: '7',
                explanation: 'The absolute value of -7 is 7 (distance from 0).',
                difficulty: 'beginner',
                type: 'multiple-choice'
              }
            ]
          }
        ]
      },
      {
        id: 'ch2-3',
        number: '2.3',
        title: 'Classification of Functions',
        pageStart: 102,
        lessons: [{
          id: 'ch2-3-beg',
          title: 'Types of Functions',
          difficulty: 'beginner',
          content: [
            '**Polynomial functions:** f(x) = aₙxⁿ + ... + a₁x + a₀. The degree is the highest power.',
            '**Rational functions:** f(x) = p(x)/q(x) where p and q are polynomials.',
            '**Piecewise functions:** Different formulas for different intervals of x.',
            'Know how to identify, graph, and find domains of each type.'
          ],
          exercises: [{
            id: 'ch2-3-beg-1',
            question: 'What type of function is f(x) = (x+1)/(x-2)?',
            options: ['Polynomial', 'Rational', 'Exponential', 'Logarithmic'],
            answer: 'Rational',
            explanation: 'It is a ratio of two polynomials, so it is a rational function.',
            difficulty: 'beginner',
            type: 'multiple-choice'
          }]
        }]
      },
      {
        id: 'ch2-4',
        number: '2.4',
        title: 'Operations with Functions',
        pageStart: 108,
        lessons: [{
          id: 'ch2-4-beg',
          title: 'Composite Functions',
          difficulty: 'beginner',
          content: [
            '**Composite function:** (f ∘ g)(x) = f(g(x)). Apply g first, then f.',
            'Example: If f(x) = x² and g(x) = x+1, then f(g(x)) = (x+1)²',
            'Order matters! f(g(x)) ≠ g(f(x)) in general.',
          ],
          exercises: [{
            id: 'ch2-4-beg-1',
            question: 'If f(x) = 2x and g(x) = x + 3, what is f(g(2))?',
            answer: '10',
            explanation: 'g(2) = 5, then f(5) = 10',
            difficulty: 'beginner',
            type: 'short-answer'
          }]
        }]
      },
      {
        id: 'ch2-5',
        number: '2.5',
        title: 'Function Transformations',
        pageStart: 117,
        lessons: [{
          id: 'ch2-5-beg',
          title: 'Translations, Reflections, and Stretches',
          difficulty: 'beginner',
          content: [
            '**Vertical shift:** f(x) + k moves graph UP by k.',
            '**Horizontal shift:** f(x - h) moves graph RIGHT by h.',
            '**Reflection in x-axis:** -f(x). **Reflection in y-axis:** f(-x).',
            '**Vertical stretch:** af(x) stretches by factor a. **Horizontal stretch:** f(x/b) stretches by factor b.'
          ],
          exercises: [{
            id: 'ch2-5-beg-1',
            question: 'The graph of y = f(x) + 3 is the graph of f shifted:',
            options: ['3 units right', '3 units left', '3 units up', '3 units down'],
            answer: '3 units up',
            explanation: 'Adding a constant outside the function shifts the graph vertically upward.',
            difficulty: 'beginner',
            type: 'multiple-choice'
          }]
        }]
      }
    ]
  },
  {
    id: 'ch3',
    number: 3,
    title: 'Complex Numbers',
    subtitle: 'Expanding the number system',
    color: '#8b5cf6',
    icon: 'i',
    topics: [
      {
        id: 'ch3-1', number: '3.1', title: 'Quadratic Equations and Inequalities', pageStart: 149,
        lessons: [{
          id: 'ch3-1-beg', title: 'Solving Quadratics', difficulty: 'beginner',
          content: [
            'A **quadratic equation** has the form ax² + bx + c = 0.',
            '**Three methods:** Factoring, completing the square, quadratic formula.',
            '**Quadratic formula:** x = (-b ± √(b²-4ac))/(2a)',
            '**Discriminant** Δ = b²-4ac tells you: Δ>0 → 2 real roots, Δ=0 → 1 repeated root, Δ<0 → no real roots (complex!)'
          ],
          keyFormulas: ['x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', '\\Delta = b^2 - 4ac'],
          exercises: [
            { id: 'ch3-1-beg-1', question: 'Solve x² - 5x + 6 = 0', answer: 'x = 2 or x = 3', explanation: 'Factors as (x-2)(x-3) = 0', difficulty: 'beginner', type: 'short-answer' },
            { id: 'ch3-1-beg-2', question: 'What is the discriminant of x² + 4x + 4 = 0?', options: ['0', '4', '8', '-4'], answer: '0', explanation: 'Δ = 16 - 16 = 0, so one repeated root.', difficulty: 'beginner', type: 'multiple-choice' }
          ]
        }]
      },
      {
        id: 'ch3-2', number: '3.2', title: 'Complex Numbers', pageStart: 161,
        lessons: [{
          id: 'ch3-2-beg', title: 'Introduction to Complex Numbers', difficulty: 'beginner',
          content: [
            'When Δ < 0, we get √(negative). We define **i = √(-1)**, so i² = -1.',
            'A **complex number** z = a + bi, where a is the real part and b is the imaginary part.',
            '**Addition:** (a+bi) + (c+di) = (a+c) + (b+d)i',
            '**Multiplication:** (a+bi)(c+di) = (ac-bd) + (ad+bc)i',
            '**Conjugate:** z̄ = a - bi. Note: z · z̄ = a² + b² (always real!).'
          ],
          keyFormulas: ['i^2 = -1', 'z\\bar{z} = a^2 + b^2'],
          exercises: [
            { id: 'ch3-2-beg-1', question: 'Simplify (3 + 2i) + (1 - 5i)', answer: '4 - 3i', explanation: '(3+1) + (2-5)i = 4 - 3i', difficulty: 'beginner', type: 'short-answer' },
            { id: 'ch3-2-beg-2', question: 'What is i²?', options: ['1', '-1', 'i', '-i'], answer: '-1', explanation: 'By definition, i² = -1.', difficulty: 'beginner', type: 'multiple-choice' }
          ]
        }]
      },
      {
        id: 'ch3-3', number: '3.3', title: 'Polynomial Equations and Inequalities', pageStart: 175,
        lessons: [{ id: 'ch3-3-beg', title: 'Polynomials', difficulty: 'beginner', content: ['**Factor theorem:** (x-a) is a factor of P(x) if P(a) = 0.', '**Remainder theorem:** When P(x) is divided by (x-a), the remainder is P(a).', 'Use synthetic division or long division to factor polynomials.'], exercises: [{ id: 'ch3-3-beg-1', question: 'If P(x) = x³ - 6x² + 11x - 6, is (x-1) a factor?', options: ['Yes', 'No'], answer: 'Yes', explanation: 'P(1) = 1-6+11-6 = 0, so yes.', difficulty: 'beginner', type: 'multiple-choice' }] }]
      },
      { id: 'ch3-4', number: '3.4', title: 'The Fundamental Theorem of Algebra', pageStart: 184, lessons: [{ id: 'ch3-4-beg', title: 'FTA Basics', difficulty: 'beginner', content: ['Every polynomial of degree n has EXACTLY n roots (counting multiplicity and complex roots).', 'Complex roots always come in **conjugate pairs** for polynomials with real coefficients.', 'A degree 3 polynomial has 3 roots: either 3 real, or 1 real + 2 complex conjugates.'], exercises: [{ id: 'ch3-4-beg-1', question: 'How many roots does a degree 4 polynomial have?', answer: '4', explanation: 'By the Fundamental Theorem of Algebra, exactly 4 (counting multiplicity).', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch3-5', number: '3.5', title: 'Solving Equations and Inequalities', pageStart: 195, lessons: [{ id: 'ch3-5-beg', title: 'Methods', difficulty: 'beginner', content: ['Combine analytical and graphical methods.', 'For inequalities: find critical values, test intervals, express in interval notation.'], exercises: [{ id: 'ch3-5-beg-1', question: 'Solve x² - 4 > 0', answer: 'x < -2 or x > 2', explanation: '(x-2)(x+2) > 0. Critical values at ±2. Test intervals.', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch3-6', number: '3.6', title: 'Solving Systems of Linear Equations', pageStart: 200, lessons: [{ id: 'ch3-6-beg', title: 'Systems of Equations', difficulty: 'beginner', content: ['Solve 2×2 and 3×3 systems using substitution, elimination, or matrices.', 'A system can have: one unique solution, infinitely many solutions, or no solution.'], exercises: [{ id: 'ch3-6-beg-1', question: 'Solve: x + y = 5 and x - y = 1', answer: 'x = 3, y = 2', explanation: 'Add equations: 2x = 6, x = 3. Then y = 2.', difficulty: 'beginner', type: 'short-answer' }] }] }
    ]
  },
  {
    id: 'ch4',
    number: 4,
    title: 'Differentiation',
    subtitle: 'Measuring change',
    color: '#ec4899',
    icon: "dy/dx",
    topics: [
      { id: 'ch4-1', number: '4.1', title: 'Limits, Continuity and Convergence', pageStart: 220, lessons: [{ id: 'ch4-1-beg', title: 'Understanding Limits', difficulty: 'beginner', content: ['A **limit** describes what value a function approaches as x gets close to a value.', 'lim(x→2) x² = 4. As x gets closer to 2, x² gets closer to 4.', 'A function is **continuous** if you can draw it without lifting your pen.'], keyFormulas: ['\\lim_{x \\to a} f(x) = L'], exercises: [{ id: 'ch4-1-beg-1', question: 'What is lim(x→3) (2x + 1)?', answer: '7', explanation: 'Direct substitution: 2(3) + 1 = 7', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch4-2', number: '4.2', title: 'The Derivative of a Function', pageStart: 236, lessons: [{ id: 'ch4-2-beg', title: 'What is a Derivative?', difficulty: 'beginner', content: ['The **derivative** measures how fast a function changes — it\'s the slope of the tangent line.', 'f\'(x) = lim(h→0) [f(x+h) - f(x)]/h', '**Power rule:** If f(x) = xⁿ, then f\'(x) = nxⁿ⁻¹', 'Example: f(x) = x³ → f\'(x) = 3x²'], keyFormulas: ['\\frac{d}{dx}x^n = nx^{n-1}', '\\frac{d}{dx}[af(x)] = af\'(x)', '\\frac{d}{dx}[f(x)+g(x)] = f\'(x)+g\'(x)'], exercises: [{ id: 'ch4-2-beg-1', question: 'Find the derivative of f(x) = x⁴', answer: '4x³', explanation: 'Power rule: 4x^(4-1) = 4x³', difficulty: 'beginner', type: 'short-answer' }, { id: 'ch4-2-beg-2', question: 'The derivative of f(x) = 5 is:', options: ['5', '1', '0', '5x'], answer: '0', explanation: 'The derivative of any constant is 0.', difficulty: 'beginner', type: 'multiple-choice' }] }] },
      { id: 'ch4-3', number: '4.3', title: 'Differentiation Rules', pageStart: 260, lessons: [{ id: 'ch4-3-beg', title: 'Product, Quotient, Chain Rules', difficulty: 'beginner', content: ['**Product rule:** (fg)\' = f\'g + fg\'', '**Quotient rule:** (f/g)\' = (f\'g - fg\')/g²', '**Chain rule:** [f(g(x))]\' = f\'(g(x)) · g\'(x)'], keyFormulas: ['(fg)\' = f\'g + fg\'', '(f/g)\' = \\frac{f\'g - fg\'}{g^2}'], exercises: [{ id: 'ch4-3-beg-1', question: 'Using the chain rule, find d/dx (2x+1)³', answer: '6(2x+1)²', explanation: '3(2x+1)² · 2 = 6(2x+1)²', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch4-4', number: '4.4', title: 'Applications of Derivatives', pageStart: 290, lessons: [{ id: 'ch4-4-beg', title: 'Max, Min, and Optimization', difficulty: 'beginner', content: ['**Critical points:** Where f\'(x) = 0 or undefined.', '**Max/Min:** f\'\'(x) > 0 → minimum, f\'\'(x) < 0 → maximum.', '**Optimization:** Find the max/min of a quantity by setting its derivative to zero.'], exercises: [{ id: 'ch4-4-beg-1', question: 'Find the critical point of f(x) = x² - 4x + 3', answer: 'x = 2', explanation: 'f\'(x) = 2x - 4 = 0, so x = 2', difficulty: 'beginner', type: 'short-answer' }] }] }
    ]
  },
  {
    id: 'ch5',
    number: 5,
    title: 'Analytic Geometry',
    subtitle: 'Toolkit and rational functions',
    color: '#f97316',
    icon: '∠',
    topics: [
      { id: 'ch5-1', number: '5.1', title: 'Coordinate Geometry Toolkit', pageStart: 310, lessons: [{ id: 'ch5-1-beg', title: 'Lines and Distances', difficulty: 'beginner', content: ['**Distance formula:** d = √((x₂-x₁)² + (y₂-y₁)²)', '**Midpoint:** M = ((x₁+x₂)/2, (y₁+y₂)/2)', '**Gradient/slope:** m = (y₂-y₁)/(x₂-x₁)', '**Parallel lines:** same gradient. **Perpendicular lines:** m₁·m₂ = -1'], keyFormulas: ['d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}', 'm = \\frac{y_2-y_1}{x_2-x_1}'], exercises: [{ id: 'ch5-1-beg-1', question: 'Find the distance between (1,2) and (4,6)', answer: '5', explanation: '√((4-1)² + (6-2)²) = √(9+16) = √25 = 5', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch5-2', number: '5.2', title: 'Rational Functions', pageStart: 340, lessons: [{ id: 'ch5-2-beg', title: 'Asymptotes and Graphing', difficulty: 'beginner', content: ['**Vertical asymptote:** where denominator = 0.', '**Horizontal asymptote:** compare degrees of numerator and denominator.', 'If degree(num) < degree(den): y = 0. Equal degrees: y = leading coefficients ratio.'], exercises: [{ id: 'ch5-2-beg-1', question: 'What is the vertical asymptote of f(x) = 1/(x-3)?', answer: 'x = 3', explanation: 'The denominator is zero when x = 3.', difficulty: 'beginner', type: 'short-answer' }] }] }
    ]
  },
  {
    id: 'ch6',
    number: 6,
    title: 'Trigonometry',
    subtitle: 'Relationships in triangles',
    color: '#14b8a6',
    icon: 'sin',
    topics: [
      { id: 'ch6-1', number: '6.1', title: 'Radian Measure and Sectors', pageStart: 370, lessons: [{ id: 'ch6-1-beg', title: 'Radians', difficulty: 'beginner', content: ['**Radians** are another way to measure angles: π radians = 180°.', 'To convert: degrees × π/180 = radians. Radians × 180/π = degrees.', '**Arc length:** s = rθ. **Sector area:** A = r²θ/2 (θ in radians!)'], keyFormulas: ['s = r\\theta', 'A = \\frac{1}{2}r^2\\theta'], exercises: [{ id: 'ch6-1-beg-1', question: 'Convert 90° to radians', answer: 'π/2', explanation: '90 × π/180 = π/2', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch6-2', number: '6.2', title: 'Trigonometric Ratios', pageStart: 380, lessons: [{ id: 'ch6-2-beg', title: 'Sin, Cos, Tan', difficulty: 'beginner', content: ['**SOH-CAH-TOA:** sin = opp/hyp, cos = adj/hyp, tan = opp/adj', '**Unit circle:** sin θ = y-coordinate, cos θ = x-coordinate.', 'Key values: sin 30° = 1/2, cos 60° = 1/2, tan 45° = 1.', '**Pythagorean identity:** sin²θ + cos²θ = 1'], keyFormulas: ['\\sin^2\\theta + \\cos^2\\theta = 1'], exercises: [{ id: 'ch6-2-beg-1', question: 'What is sin 30°?', options: ['1/2', '√2/2', '√3/2', '1'], answer: '1/2', explanation: 'sin 30° = 1/2 is a standard value.', difficulty: 'beginner', type: 'multiple-choice' }] }] },
      { id: 'ch6-3', number: '6.3', title: 'Trigonometric Identities and Equations', pageStart: 395, lessons: [{ id: 'ch6-3-beg', title: 'Key Identities', difficulty: 'beginner', content: ['**Double angle:** sin 2θ = 2 sin θ cos θ, cos 2θ = cos²θ - sin²θ', '**Compound angle:** sin(A±B) = sinA cosB ± cosA sinB'], keyFormulas: ['\\sin 2\\theta = 2\\sin\\theta\\cos\\theta', '\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta'], exercises: [{ id: 'ch6-3-beg-1', question: 'sin 2θ = 2 sin θ cos θ is:', options: ['Always true', 'Sometimes true', 'Never true'], answer: 'Always true', explanation: 'This is the double angle identity — it holds for all θ.', difficulty: 'beginner', type: 'multiple-choice' }] }] },
      { id: 'ch6-4', number: '6.4', title: 'Trigonometric Functions', pageStart: 410, lessons: [{ id: 'ch6-4-beg', title: 'Graphs of Trig Functions', difficulty: 'beginner', content: ['sin x and cos x have **period 2π** and **amplitude 1**.', 'y = a sin(bx + c) + d: amplitude |a|, period 2π/b, phase shift -c/b, vertical shift d.'], exercises: [{ id: 'ch6-4-beg-1', question: 'What is the period of y = sin(2x)?', answer: 'π', explanation: 'Period = 2π/b = 2π/2 = π', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch6-5', number: '6.5', title: 'Trigonometric Equations', pageStart: 420, lessons: [{ id: 'ch6-5-beg', title: 'Solving Trig Equations', difficulty: 'beginner', content: ['To solve sin x = k, find the principal value, then use symmetry and periodicity for all solutions.', 'General solutions: sin x = k → x = arcsin(k) + 2nπ or x = π - arcsin(k) + 2nπ'], exercises: [{ id: 'ch6-5-beg-1', question: 'Solve sin x = 1/2 for 0 ≤ x ≤ 2π', answer: 'x = π/6 or x = 5π/6', explanation: 'sin x = 1/2 at π/6 and π - π/6 = 5π/6', difficulty: 'beginner', type: 'short-answer' }] }] }
    ]
  },
  {
    id: 'ch7',
    number: 7,
    title: 'Exponents, Logarithms & Integration',
    subtitle: 'Generalizing relationships',
    color: '#a855f7',
    icon: '∫',
    topics: [
      { id: 'ch7-1', number: '7.1', title: 'Integration as Antidifferentiation', pageStart: 444, lessons: [{ id: 'ch7-1-beg', title: 'What is Integration?', difficulty: 'beginner', content: ['Integration is the **reverse of differentiation**. If f\'(x) = 2x, then ∫2x dx = x² + C.', '**Power rule for integration:** ∫xⁿ dx = x^(n+1)/(n+1) + C (n ≠ -1)', 'The **+C** (constant of integration) is essential! Different functions can have the same derivative.', '**Definite integral:** ∫(a to b) f(x) dx = F(b) - F(a) gives the area under the curve.'], keyFormulas: ['\\int x^n dx = \\frac{x^{n+1}}{n+1} + C', '\\int_a^b f(x)dx = F(b) - F(a)'], exercises: [{ id: 'ch7-1-beg-1', question: 'Find ∫x³ dx', answer: 'x⁴/4 + C', explanation: 'Using power rule: x^(3+1)/(3+1) + C = x⁴/4 + C', difficulty: 'beginner', type: 'short-answer' }, { id: 'ch7-1-beg-2', question: 'Evaluate ∫(0 to 2) 3x² dx', answer: '8', explanation: 'Antiderivative is x³. F(2)-F(0) = 8-0 = 8', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch7-2', number: '7.2', title: 'Exponents and Logarithms', pageStart: 460, lessons: [{ id: 'ch7-2-beg', title: 'Laws of Exponents and Logs', difficulty: 'beginner', content: ['**Exponent laws:** a^m · a^n = a^(m+n), (a^m)^n = a^(mn), a^0 = 1', '**Logarithm:** log_a(x) = y means a^y = x. It\'s the inverse of exponentiation.', '**Log laws:** log(AB) = log A + log B, log(A/B) = log A - log B, log(A^n) = n log A', '**Natural log:** ln x = log_e(x), where e ≈ 2.718.'], keyFormulas: ['\\log_a x = y \\iff a^y = x', '\\ln e^x = x'], exercises: [{ id: 'ch7-2-beg-1', question: 'Solve 2^x = 16', answer: 'x = 4', explanation: '16 = 2⁴, so x = 4', difficulty: 'beginner', type: 'short-answer' }, { id: 'ch7-2-beg-2', question: 'Simplify log₂(8)', answer: '3', explanation: '2³ = 8, so log₂(8) = 3', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch7-3', number: '7.3', title: 'Derivatives of Exponential and Log Functions', pageStart: 483, lessons: [{ id: 'ch7-3-beg', title: 'Differentiating eˣ and ln x', difficulty: 'beginner', content: ['**d/dx(eˣ) = eˣ** — the only function that is its own derivative!', '**d/dx(ln x) = 1/x**', 'Chain rule versions: d/dx(e^(f(x))) = f\'(x)·e^(f(x)), d/dx(ln f(x)) = f\'(x)/f(x)'], keyFormulas: ['\\frac{d}{dx}e^x = e^x', '\\frac{d}{dx}\\ln x = \\frac{1}{x}'], exercises: [{ id: 'ch7-3-beg-1', question: 'What is d/dx(e^(3x))?', answer: '3e^(3x)', explanation: 'Chain rule: 3·e^(3x)', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch7-4', number: '7.4', title: 'Integration Techniques', pageStart: 488, lessons: [{ id: 'ch7-4-beg', title: 'Substitution and Parts', difficulty: 'beginner', content: ['**Integration by substitution:** Reverse chain rule. Let u = inner function.', '**Integration by parts:** ∫u dv = uv - ∫v du. Choose u using LIATE (Log, Inverse trig, Algebraic, Trig, Exponential).'], keyFormulas: ['\\int u\\,dv = uv - \\int v\\,du'], exercises: [{ id: 'ch7-4-beg-1', question: 'Find ∫2x·eˣ² dx using substitution (let u = x²)', answer: 'eˣ² + C', explanation: 'u = x², du = 2x dx. ∫eᵘ du = eᵘ + C = eˣ² + C', difficulty: 'beginner', type: 'short-answer' }] }] }
    ]
  },
  {
    id: 'ch8',
    number: 8,
    title: 'More Calculus',
    subtitle: 'Modelling change',
    color: '#e11d48',
    icon: '∬',
    topics: [
      { id: 'ch8-1', number: '8.1', title: 'Areas and Volumes', pageStart: 520, lessons: [{ id: 'ch8-1-beg', title: 'Area Between Curves and Volumes of Revolution', difficulty: 'beginner', content: ['**Area between curves:** ∫(a to b) [f(x) - g(x)] dx where f(x) ≥ g(x)', '**Volume of revolution (x-axis):** V = π∫(a to b) [f(x)]² dx', '**Volume (y-axis):** V = π∫(c to d) [g(y)]² dy'], keyFormulas: ['V = \\pi\\int_a^b [f(x)]^2 dx'], exercises: [{ id: 'ch8-1-beg-1', question: 'The area between y = x² and y = x from x=0 to x=1 is:', answer: '1/6', explanation: '∫₀¹ (x - x²) dx = [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = 1/6', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch8-2', number: '8.2', title: 'Kinematics', pageStart: 528, lessons: [{ id: 'ch8-2-beg', title: 'Motion with Calculus', difficulty: 'beginner', content: ['**Displacement** s(t), **velocity** v(t) = s\'(t), **acceleration** a(t) = v\'(t) = s\'\'(t)', 'Velocity = derivative of displacement. Displacement = integral of velocity.'], exercises: [{ id: 'ch8-2-beg-1', question: 'If s(t) = t³ - 6t, find v(t)', answer: '3t² - 6', explanation: 'v(t) = s\'(t) = 3t² - 6', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch8-3', number: '8.3', title: 'Ordinary Differential Equations', pageStart: 533, lessons: [{ id: 'ch8-3-beg', title: 'Separable ODEs', difficulty: 'beginner', content: ['An **ODE** relates a function to its derivatives: dy/dx = f(x,y)', 'For **separable** ODEs: dy/dx = g(x)h(y) → ∫(1/h(y)) dy = ∫g(x) dx'], exercises: [{ id: 'ch8-3-beg-1', question: 'Solve dy/dx = 2x with y(0) = 1', answer: 'y = x² + 1', explanation: '∫dy = ∫2x dx → y = x² + C. y(0)=1 → C=1.', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch8-4', number: '8.4', title: 'Limits Revisited', pageStart: 550, lessons: [{ id: 'ch8-4-beg', title: 'L\'Hôpital\'s Rule and Improper Integrals', difficulty: 'beginner', content: ['**L\'Hôpital\'s Rule:** If lim f(x)/g(x) gives 0/0 or ∞/∞, then lim f(x)/g(x) = lim f\'(x)/g\'(x)', '**Improper integrals:** When limits are infinite, use lim(t→∞) ∫(a to t) f(x) dx'], exercises: [{ id: 'ch8-4-beg-1', question: 'Find lim(x→0) sin(x)/x using L\'Hôpital', answer: '1', explanation: '0/0 form. lim cos(x)/1 = 1', difficulty: 'beginner', type: 'short-answer' }] }] }
    ]
  },
  {
    id: 'ch9',
    number: 9,
    title: 'Vectors',
    subtitle: 'Modelling 3D space',
    color: '#0ea5e9',
    icon: '→',
    topics: [
      { id: 'ch9-1', number: '9.1', title: 'Geometrical Representation of Vectors', pageStart: 573, lessons: [{ id: 'ch9-1-beg', title: 'What are Vectors?', difficulty: 'beginner', content: ['A **vector** has both magnitude (size) and direction. Written as **v** = (x, y, z) or xi + yj + zk.', '**Magnitude:** |v| = √(x² + y² + z²)', 'Vectors are equal if they have the same magnitude AND direction, regardless of position.'], keyFormulas: ['|\\vec{v}| = \\sqrt{x^2+y^2+z^2}'], exercises: [{ id: 'ch9-1-beg-1', question: 'Find the magnitude of v = (3, 4)', answer: '5', explanation: '|v| = √(9+16) = √25 = 5', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch9-2', number: '9.2', title: 'Vector Algebra', pageStart: 586, lessons: [{ id: 'ch9-2-beg', title: 'Operations', difficulty: 'beginner', content: ['**Addition:** (a,b) + (c,d) = (a+c, b+d)', '**Scalar multiplication:** k(a,b) = (ka, kb)', '**Unit vector:** v̂ = v/|v|'], exercises: [{ id: 'ch9-2-beg-1', question: 'Find 2(1,3) + (4,-1)', answer: '(6, 5)', explanation: '2(1,3) = (2,6). (2,6)+(4,-1) = (6,5)', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch9-3', number: '9.3', title: 'Scalar Product', pageStart: 597, lessons: [{ id: 'ch9-3-beg', title: 'Dot Product', difficulty: 'beginner', content: ['**Scalar (dot) product:** a·b = |a||b|cos θ = a₁b₁ + a₂b₂ + a₃b₃', 'If a·b = 0, the vectors are **perpendicular**.', 'cos θ = (a·b)/(|a||b|) gives the angle between vectors.'], keyFormulas: ['\\vec{a}\\cdot\\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta'], exercises: [{ id: 'ch9-3-beg-1', question: 'Find (1,2,3)·(4,5,6)', answer: '32', explanation: '1(4)+2(5)+3(6) = 4+10+18 = 32', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch9-4', number: '9.4', title: 'Vector Equation of a Line', pageStart: 605, lessons: [{ id: 'ch9-4-beg', title: 'Lines in 3D', difficulty: 'beginner', content: ['**Vector form:** r = a + λd, where a is a point on the line and d is the direction vector.', '**Parametric form:** x = a₁ + λd₁, y = a₂ + λd₂, z = a₃ + λd₃'], exercises: [{ id: 'ch9-4-beg-1', question: 'Write the vector equation of the line through (1,2,3) with direction (2,1,-1)', answer: 'r = (1,2,3) + λ(2,1,-1)', explanation: 'r = a + λd where a = (1,2,3) and d = (2,1,-1)', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch9-5', number: '9.5', title: 'Vector Product', pageStart: 614, lessons: [{ id: 'ch9-5-beg', title: 'Cross Product', difficulty: 'beginner', content: ['**Cross product** a × b gives a vector PERPENDICULAR to both a and b.', '|a × b| = |a||b|sin θ = area of parallelogram', 'a × b = (a₂b₃-a₃b₂, a₃b₁-a₁b₃, a₁b₂-a₂b₁)'], exercises: [{ id: 'ch9-5-beg-1', question: 'a × b is perpendicular to both a and b.', answer: 'true', explanation: 'This is the defining property of the cross product.', difficulty: 'beginner', type: 'true-false' }] }] },
      { id: 'ch9-6', number: '9.6', title: 'Vector Equation of a Plane', pageStart: 621, lessons: [{ id: 'ch9-6-beg', title: 'Planes in 3D', difficulty: 'beginner', content: ['**Equation of a plane:** r·n = d, or ax + by + cz = d where n = (a,b,c) is the normal vector.', 'A plane can be defined by: a point + normal, OR three points, OR a point + two direction vectors.'], exercises: [{ id: 'ch9-6-beg-1', question: 'The normal vector to the plane 2x + 3y - z = 5 is:', answer: '(2, 3, -1)', explanation: 'The coefficients of x, y, z give the normal vector.', difficulty: 'beginner', type: 'short-answer' }] }] }
    ]
  },
  {
    id: 'ch10',
    number: 10,
    title: 'More Complex Numbers',
    subtitle: 'Equivalent representations',
    color: '#7c3aed',
    icon: 'eⁱᶿ',
    topics: [
      { id: 'ch10-1', number: '10.1', title: 'Forms of a Complex Number', pageStart: 650, lessons: [{ id: 'ch10-1-beg', title: 'Polar and Euler Form', difficulty: 'beginner', content: ['**Polar form:** z = r(cos θ + i sin θ) = r cis θ, where r = |z| and θ = arg(z)', '**Euler form:** z = re^(iθ)', 'Converting: r = √(a²+b²), θ = arctan(b/a) (adjust for quadrant)'], keyFormulas: ['z = re^{i\\theta}', 'r = |z| = \\sqrt{a^2+b^2}'], exercises: [{ id: 'ch10-1-beg-1', question: 'Convert z = 1 + i to polar form. What is |z|?', answer: '√2', explanation: '|z| = √(1²+1²) = √2', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch10-2', number: '10.2', title: 'Operations in Polar Form', pageStart: 656, lessons: [{ id: 'ch10-2-beg', title: 'Multiply and Divide in Polar', difficulty: 'beginner', content: ['**Multiplication:** multiply moduli, add arguments. r₁cis θ₁ · r₂cis θ₂ = r₁r₂ cis(θ₁+θ₂)', '**Division:** divide moduli, subtract arguments.'], exercises: [{ id: 'ch10-2-beg-1', question: 'If z₁ = 2cis(π/3) and z₂ = 3cis(π/6), find |z₁z₂|', answer: '6', explanation: '|z₁z₂| = |z₁|·|z₂| = 2·3 = 6', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch10-3', number: '10.3', title: 'Powers and Roots', pageStart: 664, lessons: [{ id: 'ch10-3-beg', title: 'De Moivre\'s Theorem', difficulty: 'beginner', content: ['**De Moivre\'s Theorem:** (r cis θ)^n = r^n cis(nθ)', 'Used to find powers and nth roots of complex numbers.', '**nth roots:** z^(1/n) has n distinct values, equally spaced on a circle.'], keyFormulas: ['(r\\text{cis}\\,\\theta)^n = r^n\\text{cis}(n\\theta)'], exercises: [{ id: 'ch10-3-beg-1', question: 'How many cube roots does any complex number have?', answer: '3', explanation: 'The nth root of a complex number has n distinct values.', difficulty: 'beginner', type: 'short-answer' }] }] }
    ]
  },
  {
    id: 'ch11',
    number: 11,
    title: 'Probability Distributions',
    subtitle: 'Valid comparisons and informed decisions',
    color: '#059669',
    icon: 'P',
    topics: [
      { id: 'ch11-1', number: '11.1', title: 'Axiomatic Probability', pageStart: 683, lessons: [{ id: 'ch11-1-beg', title: 'Probability Fundamentals', difficulty: 'beginner', content: ['**Probability:** P(A) = favorable outcomes / total outcomes. Always between 0 and 1.', '**Complement:** P(A\') = 1 - P(A)', '**Addition rule:** P(A∪B) = P(A) + P(B) - P(A∩B)', '**Conditional:** P(A|B) = P(A∩B)/P(B)', '**Independent events:** P(A∩B) = P(A)·P(B)'], exercises: [{ id: 'ch11-1-beg-1', question: 'A fair die is rolled. P(even) = ?', options: ['1/6', '1/3', '1/2', '2/3'], answer: '1/2', explanation: 'Even numbers: 2,4,6 = 3 out of 6 = 1/2', difficulty: 'beginner', type: 'multiple-choice' }] }] },
      { id: 'ch11-2', number: '11.2', title: 'Probability Distributions', pageStart: 696, lessons: [{ id: 'ch11-2-beg', title: 'Discrete Random Variables', difficulty: 'beginner', content: ['A **random variable** X assigns a number to each outcome.', '**Expected value:** E(X) = ∑x·P(X=x) — the long-run average.', '**Variance:** Var(X) = E(X²) - [E(X)]²'], keyFormulas: ['E(X) = \\sum x \\cdot P(X=x)', 'Var(X) = E(X^2) - [E(X)]^2'], exercises: [{ id: 'ch11-2-beg-1', question: 'X takes values 1,2,3 with equal probability. E(X) = ?', answer: '2', explanation: 'E(X) = (1+2+3)/3 = 2', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch11-3', number: '11.3', title: 'Continuous Random Variables', pageStart: 706, lessons: [{ id: 'ch11-3-beg', title: 'Continuous Distributions', difficulty: 'beginner', content: ['For continuous variables, we use a **probability density function (PDF)** f(x).', 'P(a ≤ X ≤ b) = ∫(a to b) f(x) dx — probability = area under curve.', 'Total area must equal 1: ∫f(x) dx = 1'], exercises: [{ id: 'ch11-3-beg-1', question: 'For a PDF, ∫f(x)dx over all x must equal:', options: ['0', '1', 'f(x)', '∞'], answer: '1', explanation: 'Total probability must equal 1.', difficulty: 'beginner', type: 'multiple-choice' }] }] },
      { id: 'ch11-4', number: '11.4', title: 'Binomial Distribution', pageStart: 712, lessons: [{ id: 'ch11-4-beg', title: 'Binomial Model', difficulty: 'beginner', content: ['**Binomial:** X ~ B(n,p) for n independent trials, each with probability p of success.', 'P(X=k) = C(n,k) · p^k · (1-p)^(n-k)', 'E(X) = np, Var(X) = np(1-p)'], keyFormulas: ['P(X=k) = \\binom{n}{k}p^k(1-p)^{n-k}'], exercises: [{ id: 'ch11-4-beg-1', question: 'X ~ B(10, 0.5). What is E(X)?', answer: '5', explanation: 'E(X) = np = 10(0.5) = 5', difficulty: 'beginner', type: 'short-answer' }] }] },
      { id: 'ch11-5', number: '11.5', title: 'The Normal Distribution', pageStart: 718, lessons: [{ id: 'ch11-5-beg', title: 'Normal (Gaussian) Distribution', difficulty: 'beginner', content: ['The **normal distribution** X ~ N(μ, σ²) is the bell curve. μ = mean, σ = standard deviation.', '**68-95-99.7 rule:** 68% within 1σ, 95% within 2σ, 99.7% within 3σ.', '**Z-score:** Z = (X - μ)/σ standardizes to N(0,1).'], keyFormulas: ['Z = \\frac{X - \\mu}{\\sigma}'], exercises: [{ id: 'ch11-5-beg-1', question: 'For X ~ N(50, 100), what is the standard deviation?', answer: '10', explanation: 'Var = σ² = 100, so σ = 10', difficulty: 'beginner', type: 'short-answer' }, { id: 'ch11-5-beg-2', question: 'About what % of data falls within 2 standard deviations of the mean?', options: ['68%', '90%', '95%', '99%'], answer: '95%', explanation: 'By the 68-95-99.7 rule, about 95% falls within 2σ.', difficulty: 'beginner', type: 'multiple-choice' }] }] }
    ]
  }
];

export function getTotalExercises(): number {
  let count = 0;
  curriculum.forEach(ch => ch.topics.forEach(t => t.lessons.forEach(l => { count += l.exercises.length; })));
  return count;
}

export function getTotalTopics(): number {
  let count = 0;
  curriculum.forEach(ch => { count += ch.topics.length; });
  return count;
}

export function getTotalLessons(): number {
  let count = 0;
  curriculum.forEach(ch => ch.topics.forEach(t => { count += t.lessons.length; }));
  return count;
}
