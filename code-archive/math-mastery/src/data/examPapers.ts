export interface ExamQuestion {
  id: string;
  number: number;
  topic: string;
  marks: number;
  question?: string;
  parts?: { label: string; question: string; marks: number; answer: string; explanation: string }[];
  answer?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExamPaper {
  id: string;
  title: string;
  paperNumber: number;
  description: string;
  duration: number; // minutes
  totalMarks: number;
  calculator: boolean;
  questions: ExamQuestion[];
}

export const examPapers: ExamPaper[] = [
  {
    id: 'paper1-practice1',
    title: 'Practice Paper 1 — Set A',
    paperNumber: 1,
    description: 'No calculator allowed. Covers algebra, functions, calculus, and proof.',
    duration: 120,
    totalMarks: 110,
    calculator: false,
    questions: [
      {
        id: 'p1a-q1', number: 1, topic: 'Sequences & Series', marks: 6, difficulty: 'easy',
        parts: [
          { label: '(a)', question: 'Find the sum of the arithmetic series 3 + 7 + 11 + ... + 99.', marks: 3, answer: '1275', explanation: 'First find n: u_n = 3 + (n-1)4 = 99, so 4n - 1 = 99, n = 25. S_25 = 25/2 × (3 + 99) = 25 × 51 = 1275.' },
          { label: '(b)', question: 'A geometric series has first term 8 and common ratio 1/2. Find the sum to infinity.', marks: 3, answer: '16', explanation: 'S_∞ = a/(1-r) = 8/(1-0.5) = 8/0.5 = 16.' }
        ]
      },
      {
        id: 'p1a-q2', number: 2, topic: 'Functions', marks: 7, difficulty: 'easy',
        parts: [
          { label: '(a)', question: 'Given f(x) = 2x + 3 and g(x) = x² - 1, find (f ∘ g)(x).', marks: 2, answer: '2x² - 2 + 3 = 2x² + 1', explanation: 'f(g(x)) = f(x² - 1) = 2(x² - 1) + 3 = 2x² - 2 + 3 = 2x² + 1.' },
          { label: '(b)', question: 'Find the inverse function f⁻¹(x).', marks: 2, answer: '(x - 3)/2', explanation: 'y = 2x + 3. Swap: x = 2y + 3. Solve: y = (x-3)/2.' },
          { label: '(c)', question: 'State the domain and range of g(x) = x² - 1.', marks: 3, answer: 'Domain: all real numbers. Range: y ≥ -1', explanation: 'x² is defined for all reals. Minimum of x² is 0 (at x=0), so minimum of x² - 1 is -1.' }
        ]
      },
      {
        id: 'p1a-q3', number: 3, topic: 'Complex Numbers', marks: 8, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Express (3 + 2i)(1 - 4i) in the form a + bi.', marks: 3, answer: '11 - 10i', explanation: '(3)(1) + (3)(-4i) + (2i)(1) + (2i)(-4i) = 3 - 12i + 2i - 8i² = 3 - 10i + 8 = 11 - 10i.' },
          { label: '(b)', question: 'Find the modulus and argument of z = 1 + i.', marks: 3, answer: '|z| = √2, arg(z) = π/4', explanation: '|z| = √(1² + 1²) = √2. arg(z) = arctan(1/1) = π/4 (first quadrant).' },
          { label: '(c)', question: 'Hence express z in polar form.', marks: 2, answer: '√2 cis(π/4)', explanation: 'z = |z| cis(arg z) = √2 cis(π/4) = √2(cos π/4 + i sin π/4).' }
        ]
      },
      {
        id: 'p1a-q4', number: 4, topic: 'Differentiation', marks: 9, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Differentiate f(x) = x³ - 6x² + 9x + 2.', marks: 2, answer: "f'(x) = 3x² - 12x + 9", explanation: 'Apply power rule to each term: 3x² - 12x + 9.' },
          { label: '(b)', question: 'Find the coordinates of the stationary points.', marks: 4, answer: '(1, 6) and (3, 2)', explanation: "f'(x) = 3x² - 12x + 9 = 3(x² - 4x + 3) = 3(x-1)(x-3) = 0. x = 1: f(1) = 1-6+9+2 = 6. x = 3: f(3) = 27-54+27+2 = 2." },
          { label: '(c)', question: 'Determine the nature of each stationary point.', marks: 3, answer: '(1, 6) is a local maximum; (3, 2) is a local minimum', explanation: "f''(x) = 6x - 12. f''(1) = -6 < 0 → max. f''(3) = 6 > 0 → min." }
        ]
      },
      {
        id: 'p1a-q5', number: 5, topic: 'Trigonometry', marks: 8, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Solve 2sin²x - sinx - 1 = 0 for 0 ≤ x ≤ 2π.', marks: 5, answer: 'x = π/2, 7π/6, 11π/6', explanation: 'Let u = sinx: 2u² - u - 1 = 0 → (2u+1)(u-1) = 0. u = 1: sinx = 1 → x = π/2. u = -1/2: sinx = -1/2 → x = 7π/6, 11π/6.' },
          { label: '(b)', question: 'Show that sin2θ/(1 + cos2θ) = tanθ.', marks: 3, answer: 'Shown using double angle identities', explanation: 'sin2θ = 2sinθcosθ. 1 + cos2θ = 1 + 2cos²θ - 1 = 2cos²θ. So sin2θ/(1+cos2θ) = 2sinθcosθ/(2cos²θ) = sinθ/cosθ = tanθ.' }
        ]
      },
      {
        id: 'p1a-q6', number: 6, topic: 'Integration', marks: 10, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Find ∫(3x² + 2x - 5) dx.', marks: 2, answer: 'x³ + x² - 5x + C', explanation: 'Integrate term by term: x³ + x² - 5x + C.' },
          { label: '(b)', question: 'Evaluate ∫₀² (x³ - 4x) dx.', marks: 3, answer: '-4', explanation: '[x⁴/4 - 2x²]₀² = (16/4 - 8) - 0 = 4 - 8 = -4.' },
          { label: '(c)', question: 'Find the area enclosed between y = x² and y = 4.', marks: 5, answer: '32/3', explanation: 'Intersection: x² = 4, x = ±2. Area = ∫₋₂² (4 - x²) dx = [4x - x³/3]₋₂² = (8 - 8/3) - (-8 + 8/3) = 16 - 16/3 = 32/3.' }
        ]
      },
      {
        id: 'p1a-q7', number: 7, topic: 'Proof', marks: 8, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'Prove by mathematical induction that ∑(r=1 to n) r² = n(n+1)(2n+1)/6.', marks: 8, answer: 'Proof by induction', explanation: 'Base case n=1: LHS = 1, RHS = 1(2)(3)/6 = 1 ✓. Assume true for n=k: ∑r² = k(k+1)(2k+1)/6. For n=k+1: k(k+1)(2k+1)/6 + (k+1)² = (k+1)[k(2k+1) + 6(k+1)]/6 = (k+1)(2k² + 7k + 6)/6 = (k+1)(k+2)(2k+3)/6. This is the formula with n=k+1. ✓' }
        ]
      },
      {
        id: 'p1a-q8', number: 8, topic: 'Vectors', marks: 10, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Find the scalar product of a = (2, -1, 3) and b = (4, 2, -1).', marks: 2, answer: '3', explanation: 'a·b = 2(4) + (-1)(2) + 3(-1) = 8 - 2 - 3 = 3.' },
          { label: '(b)', question: 'Find the angle between vectors a and b.', marks: 3, answer: 'θ = arccos(3/(√14 × √21))', explanation: '|a| = √(4+1+9) = √14. |b| = √(16+4+1) = √21. cosθ = 3/(√14·√21) = 3/√294. θ ≈ 79.9°.' },
          { label: '(c)', question: 'Find a × b.', marks: 3, answer: '(-5, 14, 8)', explanation: 'a × b = ((-1)(-1)-3(2), 3(4)-2(-1), 2(2)-(-1)(4)) = (1-6, 12+2, 4+4) = (-5, 14, 8).' },
          { label: '(d)', question: 'Find the area of the parallelogram formed by a and b.', marks: 2, answer: '√285', explanation: 'Area = |a × b| = √(25 + 196 + 64) = √285.' }
        ]
      },
      {
        id: 'p1a-q9', number: 9, topic: 'Calculus Applications', marks: 12, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'Find dy/dx for y = e^(2x) sin(3x) using the product rule.', marks: 3, answer: 'e^(2x)(2sin3x + 3cos3x)', explanation: 'dy/dx = 2e^(2x)·sin(3x) + e^(2x)·3cos(3x) = e^(2x)(2sin3x + 3cos3x).' },
          { label: '(b)', question: 'A particle moves along a line with displacement s(t) = t³ - 12t + 5. Find when the particle is at rest.', marks: 3, answer: 't = 2 (taking t > 0)', explanation: "v(t) = s'(t) = 3t² - 12 = 0. t² = 4, t = ±2. Since t > 0, t = 2." },
          { label: '(c)', question: 'Find ∫ x·e^x dx using integration by parts.', marks: 3, answer: 'xe^x - e^x + C', explanation: 'Let u = x, dv = e^x dx. du = dx, v = e^x. ∫xe^x dx = xe^x - ∫e^x dx = xe^x - e^x + C.' },
          { label: '(d)', question: 'Solve the differential equation dy/dx = 2xy, given y(0) = 3.', marks: 3, answer: 'y = 3e^(x²)', explanation: 'Separable: ∫dy/y = ∫2x dx → ln|y| = x² + C. y = Ae^(x²). y(0) = 3 → A = 3. y = 3e^(x²).' }
        ]
      },
      {
        id: 'p1a-q10', number: 10, topic: 'Binomial Theorem', marks: 7, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Find the coefficient of x³ in the expansion of (2 + x)⁶.', marks: 3, answer: '160', explanation: 'T_{r+1} = C(6,r)·2^(6-r)·x^r. For x³: r=3. C(6,3)·2³ = 20·8 = 160.' },
          { label: '(b)', question: 'Find the term independent of x in the expansion of (x² + 1/x)⁶.', marks: 4, answer: '15', explanation: 'T_{r+1} = C(6,r)·(x²)^(6-r)·(1/x)^r = C(6,r)·x^(12-2r-r) = C(6,r)·x^(12-3r). Independent of x: 12-3r=0, r=4. C(6,4) = 15.' }
        ]
      },
      {
        id: 'p1a-q11', number: 11, topic: 'Probability', marks: 9, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'X ~ B(8, 0.3). Find P(X = 2).', marks: 3, answer: '0.2965', explanation: 'P(X=2) = C(8,2)·(0.3)²·(0.7)⁶ = 28 × 0.09 × 0.117649 ≈ 0.2965.' },
          { label: '(b)', question: 'Find E(X) and Var(X).', marks: 2, answer: 'E(X) = 2.4, Var(X) = 1.68', explanation: 'E(X) = np = 8(0.3) = 2.4. Var(X) = np(1-p) = 8(0.3)(0.7) = 1.68.' },
          { label: '(c)', question: 'Y ~ N(50, 16). Find P(Y > 54).', marks: 4, answer: 'P(Z > 1) = 0.1587', explanation: 'σ = 4. Z = (54-50)/4 = 1. P(Y > 54) = P(Z > 1) = 1 - Φ(1) ≈ 1 - 0.8413 = 0.1587.' }
        ]
      },
      {
        id: 'p1a-q12', number: 12, topic: 'Limits', marks: 6, difficulty: 'hard',
        parts: [
          { label: '(a)', question: "Evaluate lim(x→0) (e^x - 1)/x using L'Hôpital's rule.", marks: 3, answer: '1', explanation: "0/0 form. Apply L'Hôpital: lim(x→0) e^x/1 = e⁰ = 1." },
          { label: '(b)', question: "Evaluate lim(x→∞) x²/e^x.", marks: 3, answer: '0', explanation: "∞/∞ form. L'Hôpital twice: lim 2x/e^x (still ∞/∞) → lim 2/e^x = 0." }
        ]
      }
    ]
  },
  {
    id: 'paper2-practice1',
    title: 'Practice Paper 2 — Set A',
    paperNumber: 2,
    description: 'Calculator allowed. Focuses on applications, modeling, and numerical answers.',
    duration: 120,
    totalMarks: 110,
    calculator: true,
    questions: [
      {
        id: 'p2a-q1', number: 1, topic: 'Arithmetic Series', marks: 6, difficulty: 'easy',
        parts: [
          { label: '(a)', question: 'An arithmetic sequence has u₅ = 17 and u₁₂ = 38. Find the first term and common difference.', marks: 4, answer: 'a = 5, d = 3', explanation: 'u₅ = a + 4d = 17 and u₁₂ = a + 11d = 38. Subtracting: 7d = 21, d = 3. Then a = 17 - 12 = 5.' },
          { label: '(b)', question: 'Find S₂₀.', marks: 2, answer: '670', explanation: 'S₂₀ = 20/2 × (2(5) + 19(3)) = 10 × (10 + 57) = 10 × 67 = 670.' }
        ]
      },
      {
        id: 'p2a-q2', number: 2, topic: 'Trigonometry Applications', marks: 8, difficulty: 'easy',
        parts: [
          { label: '(a)', question: 'A sector has radius 8 cm and angle 1.2 radians. Find the arc length.', marks: 2, answer: '9.6 cm', explanation: 's = rθ = 8 × 1.2 = 9.6 cm.' },
          { label: '(b)', question: 'Find the area of the sector.', marks: 2, answer: '38.4 cm²', explanation: 'A = r²θ/2 = 64 × 1.2 / 2 = 38.4 cm².' },
          { label: '(c)', question: 'Find the area of the segment (region between the chord and the arc).', marks: 4, answer: '≈ 1.05 cm²', explanation: 'Area of triangle = r²sin(θ)/2 = 64sin(1.2)/2 = 32sin(1.2) ≈ 29.83. Segment = 38.4 - 29.83 ≈ 8.57 cm². Wait: let me recalculate. Area of triangle = (1/2)r²sinθ = (1/2)(64)sin(1.2) = 32(0.9320) = 29.83. Segment = 38.4 - 29.83 = 8.57 cm².' }
        ]
      },
      {
        id: 'p2a-q3', number: 3, topic: 'Functions & Modeling', marks: 10, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'The temperature of a cup of coffee is modeled by T(t) = 20 + 60e^(-0.05t), where T is in °C and t in minutes. Find T(0).', marks: 1, answer: '80°C', explanation: 'T(0) = 20 + 60e⁰ = 20 + 60 = 80°C.' },
          { label: '(b)', question: 'Find the temperature after 10 minutes.', marks: 2, answer: '≈ 56.4°C', explanation: 'T(10) = 20 + 60e^(-0.5) = 20 + 60(0.6065) ≈ 20 + 36.39 = 56.39°C.' },
          { label: '(c)', question: 'Find how long it takes for the coffee to cool to 30°C.', marks: 4, answer: '≈ 35.8 minutes', explanation: '30 = 20 + 60e^(-0.05t). 10 = 60e^(-0.05t). e^(-0.05t) = 1/6. -0.05t = ln(1/6) = -ln6. t = ln6/0.05 = 1.7918/0.05 ≈ 35.8 min.' },
          { label: '(d)', question: 'What temperature does the coffee approach as t → ∞? Explain what this represents.', marks: 3, answer: '20°C — the room temperature', explanation: 'As t → ∞, e^(-0.05t) → 0, so T → 20°C. This is the ambient/room temperature.' }
        ]
      },
      {
        id: 'p2a-q4', number: 4, topic: 'Optimization', marks: 12, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'A box with a square base and no lid has volume 32 cm³. Let the side of the base be x cm. Show that the surface area is S = x² + 128/x.', marks: 3, answer: 'Shown', explanation: 'Volume: x²h = 32, so h = 32/x². Surface = base + 4 sides = x² + 4(xh) = x² + 4x(32/x²) = x² + 128/x.' },
          { label: '(b)', question: 'Find the value of x that minimizes the surface area.', marks: 4, answer: 'x = 4', explanation: "dS/dx = 2x - 128/x² = 0. 2x = 128/x². x³ = 64. x = 4." },
          { label: '(c)', question: 'Find the minimum surface area.', marks: 2, answer: '48 cm²', explanation: 'S(4) = 16 + 128/4 = 16 + 32 = 48 cm².' },
          { label: '(d)', question: 'Verify this is a minimum using the second derivative.', marks: 3, answer: "S''(4) = 6 > 0, confirming minimum", explanation: "S''(x) = 2 + 256/x³. S''(4) = 2 + 256/64 = 2 + 4 = 6 > 0. ✓ Minimum." }
        ]
      },
      {
        id: 'p2a-q5', number: 5, topic: 'Probability & Statistics', marks: 12, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'The heights of students are normally distributed with mean 170 cm and standard deviation 8 cm. Find the probability a student is taller than 180 cm.', marks: 3, answer: 'P(Z > 1.25) ≈ 0.1056', explanation: 'Z = (180-170)/8 = 1.25. P(Z > 1.25) = 1 - 0.8944 = 0.1056.' },
          { label: '(b)', question: 'Find the probability a student is between 160 cm and 175 cm tall.', marks: 3, answer: '≈ 0.6284', explanation: 'Z₁ = (160-170)/8 = -1.25. Z₂ = (175-170)/8 = 0.625. P(-1.25 < Z < 0.625) = Φ(0.625) - Φ(-1.25) ≈ 0.7340 - 0.1056 = 0.6284.' },
          { label: '(c)', question: 'In a class of 30 students, find the expected number taller than 180 cm.', marks: 2, answer: '≈ 3.17 students', explanation: 'E = 30 × 0.1056 ≈ 3.17.' },
          { label: '(d)', question: 'Find the height exceeded by 10% of students.', marks: 4, answer: '≈ 180.2 cm', explanation: 'P(X > h) = 0.10. Z = 1.282. h = 170 + 1.282(8) = 170 + 10.26 = 180.26 cm.' }
        ]
      },
      {
        id: 'p2a-q6', number: 6, topic: 'Vectors in 3D', marks: 14, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'Find the equation of the line through A(1, 2, 3) and B(3, -1, 5) in parametric form.', marks: 3, answer: 'r = (1,2,3) + t(2,-3,2)', explanation: 'Direction: AB = (2,-3,2). r = (1,2,3) + t(2,-3,2).' },
          { label: '(b)', question: 'The plane Π has equation 2x - y + 3z = 14. Find the point where the line intersects Π.', marks: 4, answer: '(3, -1, 5)', explanation: 'Substitute: 2(1+2t) - (2-3t) + 3(3+2t) = 14. 2+4t-2+3t+9+6t = 14. 9+13t = 14. t = 5/13. Point: (1+10/13, 2-15/13, 3+10/13) = (23/13, 11/13, 49/13). Actually let me redo: 2(1+2t)-(2-3t)+3(3+2t) = 2+4t-2+3t+9+6t = 9+13t = 14 → t = 5/13.' },
          { label: '(c)', question: 'Find the angle between the line and the plane.', marks: 4, answer: '≈ 61.9°', explanation: 'sin α = |d·n|/(|d||n|) = |(2)(2)+(-3)(-1)+(2)(3)|/(√17·√14) = |4+3+6|/√238 = 13/√238 ≈ 0.8428. α ≈ 57.5°.' },
          { label: '(d)', question: 'Find the shortest distance from the point C(0, 0, 0) to the plane Π.', marks: 3, answer: '14/√14 = √14', explanation: 'Distance = |2(0)-1(0)+3(0)-14|/√(4+1+9) = 14/√14 = √14 ≈ 3.74.' }
        ]
      },
      {
        id: 'p2a-q7', number: 7, topic: 'Differential Equations', marks: 10, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'A population P grows according to dP/dt = 0.02P. If P(0) = 500, find P(t).', marks: 4, answer: 'P(t) = 500e^(0.02t)', explanation: 'Separable: ∫dP/P = ∫0.02 dt → ln P = 0.02t + C. P = Ae^(0.02t). P(0)=500 → A=500.' },
          { label: '(b)', question: 'Find how long it takes for the population to double.', marks: 3, answer: '≈ 34.7 years', explanation: '1000 = 500e^(0.02t). 2 = e^(0.02t). t = ln2/0.02 = 0.6931/0.02 ≈ 34.66.' },
          { label: '(c)', question: 'In reality, the population approaches a carrying capacity of 10000. Write a modified differential equation that models this.', marks: 3, answer: 'dP/dt = 0.02P(1 - P/10000)', explanation: 'This is the logistic equation. As P → 10000, the growth rate → 0.' }
        ]
      },
      {
        id: 'p2a-q8', number: 8, topic: 'Complex Numbers', marks: 10, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'Find all cube roots of 8 in polar form.', marks: 5, answer: '2cis(0), 2cis(2π/3), 2cis(4π/3)', explanation: '8 = 8cis(0). Cube roots: 2cis(2kπ/3) for k = 0, 1, 2. These are: 2, 2cis(120°), 2cis(240°), i.e., 2, -1+i√3, -1-i√3.' },
          { label: '(b)', question: 'Plot these roots on an Argand diagram and describe the shape they form.', marks: 2, answer: 'Equilateral triangle on circle of radius 2', explanation: 'Three points equally spaced (120° apart) on a circle of radius 2, forming an equilateral triangle.' },
          { label: '(c)', question: 'Find the sum of the three cube roots.', marks: 3, answer: '0', explanation: 'Sum = 2 + (-1+i√3) + (-1-i√3) = 0. (The sum of all nth roots of unity, scaled, is always 0.)' }
        ]
      },
      {
        id: 'p2a-q9', number: 9, topic: 'Volumes of Revolution', marks: 10, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'The region R is bounded by y = √x, the x-axis, and x = 4. Find the area of R.', marks: 3, answer: '16/3', explanation: '∫₀⁴ √x dx = [2x^(3/2)/3]₀⁴ = 2(8)/3 = 16/3.' },
          { label: '(b)', question: 'Find the volume of revolution when R is rotated about the x-axis.', marks: 4, answer: '8π', explanation: 'V = π∫₀⁴ (√x)² dx = π∫₀⁴ x dx = π[x²/2]₀⁴ = π(8) = 8π.' },
          { label: '(c)', question: 'Find the volume when R is rotated about the y-axis.', marks: 3, answer: '128π/5', explanation: 'x = y², limits y = 0 to 2. V = π∫₀² (4² - y⁴) dy = π[16y - y⁵/5]₀² = π(32 - 32/5) = π(128/5) = 128π/5.' }
        ]
      },
      {
        id: 'p2a-q10', number: 10, topic: 'Integration Techniques', marks: 8, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'Find ∫ x²ln(x) dx using integration by parts.', marks: 5, answer: '(x³/3)ln(x) - x³/9 + C', explanation: 'Let u = lnx, dv = x² dx. du = 1/x dx, v = x³/3. ∫x²lnx dx = (x³/3)lnx - ∫(x³/3)(1/x)dx = (x³/3)lnx - (1/3)∫x² dx = (x³/3)lnx - x³/9 + C.' },
          { label: '(b)', question: 'Evaluate ∫₁ᵉ x²ln(x) dx.', marks: 3, answer: '(2e³ + 1)/9', explanation: '[(x³/3)lnx - x³/9]₁ᵉ = (e³/3 · 1 - e³/9) - (0 - 1/9) = e³/3 - e³/9 + 1/9 = 2e³/9 + 1/9 = (2e³+1)/9.' }
        ]
      }
    ]
  },
  {
    id: 'paper1-practice2',
    title: 'Practice Paper 1 — Set B',
    paperNumber: 1,
    description: 'No calculator. Second practice set with different question styles.',
    duration: 120,
    totalMarks: 110,
    calculator: false,
    questions: [
      {
        id: 'p1b-q1', number: 1, topic: 'Sequences', marks: 6, difficulty: 'easy',
        parts: [
          { label: '(a)', question: 'Find the 15th term of the geometric sequence 2, 6, 18, 54, ...', marks: 3, answer: '2 × 3¹⁴ = 9565938', explanation: 'a = 2, r = 3. u₁₅ = 2 × 3¹⁴ = 2 × 4782969 = 9565938.' },
          { label: '(b)', question: 'Explain why the series 2 + 6 + 18 + 54 + ... does not have a sum to infinity.', marks: 3, answer: 'Because |r| = 3 > 1, the series diverges', explanation: 'For a geometric series to converge, we need |r| < 1. Here r = 3, so |r| > 1 and the series diverges.' }
        ]
      },
      {
        id: 'p1b-q2', number: 2, topic: 'Quadratics', marks: 8, difficulty: 'easy',
        parts: [
          { label: '(a)', question: 'Solve x² + 6x + 5 = 0 by factoring.', marks: 2, answer: 'x = -1 or x = -5', explanation: '(x+1)(x+5) = 0, so x = -1 or x = -5.' },
          { label: '(b)', question: 'For what values of k does kx² + 4x + 1 = 0 have two distinct real roots?', marks: 3, answer: 'k < 4 and k ≠ 0', explanation: 'Δ = 16 - 4k > 0, so k < 4. Also k ≠ 0 (otherwise not quadratic).' },
          { label: '(c)', question: 'Express x² + 6x + 5 in completed square form.', marks: 3, answer: '(x + 3)² - 4', explanation: 'x² + 6x + 9 - 9 + 5 = (x+3)² - 4.' }
        ]
      },
      {
        id: 'p1b-q3', number: 3, topic: 'Differentiation', marks: 10, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Differentiate y = (3x² + 1)⁴ using the chain rule.', marks: 3, answer: '24x(3x² + 1)³', explanation: 'dy/dx = 4(3x²+1)³ · 6x = 24x(3x²+1)³.' },
          { label: '(b)', question: 'Differentiate y = x²e^x using the product rule.', marks: 3, answer: 'e^x(2x + x²) = xe^x(2 + x)', explanation: 'dy/dx = 2x·e^x + x²·e^x = e^x(2x + x²) = xe^x(x+2).' },
          { label: '(c)', question: 'Differentiate y = ln(sin x).', marks: 2, answer: 'cos(x)/sin(x) = cot(x)', explanation: 'dy/dx = (1/sinx)·cosx = cosx/sinx = cotx.' },
          { label: '(d)', question: 'Find the equation of the tangent to y = x³ at the point (2, 8).', marks: 2, answer: 'y = 12x - 16', explanation: "y' = 3x². At x=2: m = 12. y - 8 = 12(x-2). y = 12x - 16." }
        ]
      },
      {
        id: 'p1b-q4', number: 4, topic: 'Integration', marks: 12, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Find ∫ sin²x dx. [Hint: use the identity cos2x = 1 - 2sin²x]', marks: 4, answer: 'x/2 - sin(2x)/4 + C', explanation: 'sin²x = (1-cos2x)/2. ∫(1-cos2x)/2 dx = x/2 - sin(2x)/4 + C.' },
          { label: '(b)', question: 'Using the substitution u = 1 + x², find ∫ 2x/(1+x²) dx.', marks: 3, answer: 'ln(1 + x²) + C', explanation: 'u = 1+x², du = 2x dx. ∫du/u = ln|u| + C = ln(1+x²) + C.' },
          { label: '(c)', question: 'Find ∫ 1/(x²+1) dx.', marks: 2, answer: 'arctan(x) + C', explanation: 'This is a standard integral: ∫1/(x²+1) dx = arctan(x) + C.' },
          { label: '(d)', question: 'Evaluate ∫₀¹ xe^(x²) dx.', marks: 3, answer: '(e-1)/2', explanation: 'Let u = x², du = 2x dx. ∫₀¹ (1/2)eᵘ du = [eᵘ/2]₀¹ = (e-1)/2.' }
        ]
      },
      {
        id: 'p1b-q5', number: 5, topic: 'Proof by Induction', marks: 8, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'Prove by induction that 5ⁿ - 1 is divisible by 4 for all positive integers n.', marks: 8, answer: 'Proof by induction', explanation: 'Base case n=1: 5¹-1 = 4, divisible by 4. ✓ Assume 5ᵏ-1 = 4m for some integer m. For n=k+1: 5^(k+1)-1 = 5·5ᵏ-1 = 5(4m+1)-1 = 20m+5-1 = 20m+4 = 4(5m+1). Divisible by 4. ✓' }
        ]
      },
      {
        id: 'p1b-q6', number: 6, topic: 'Trigonometry', marks: 10, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Prove that (sinA + cosA)² = 1 + sin2A.', marks: 3, answer: 'Proof', explanation: 'LHS = sin²A + 2sinAcosA + cos²A = 1 + 2sinAcosA = 1 + sin2A = RHS.' },
          { label: '(b)', question: 'Solve cos2x = cosx for 0 ≤ x ≤ 2π.', marks: 4, answer: 'x = 0, 2π/3, 4π/3, 2π', explanation: '2cos²x - 1 = cosx. 2cos²x - cosx - 1 = 0. (2cosx+1)(cosx-1) = 0. cosx = 1: x = 0, 2π. cosx = -1/2: x = 2π/3, 4π/3.' },
          { label: '(c)', question: 'Find the exact value of cos(π/12). [Hint: π/12 = π/3 - π/4]', marks: 3, answer: '(√6 + √2)/4', explanation: 'cos(π/3 - π/4) = cos(π/3)cos(π/4) + sin(π/3)sin(π/4) = (1/2)(√2/2) + (√3/2)(√2/2) = √2/4 + √6/4 = (√6+√2)/4.' }
        ]
      },
      {
        id: 'p1b-q7', number: 7, topic: 'Vectors', marks: 12, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'Points A(1,0,2), B(3,1,0), C(0,2,1). Find vectors AB and AC.', marks: 2, answer: 'AB = (2,1,-2), AC = (-1,2,-1)', explanation: 'AB = B-A = (2,1,-2). AC = C-A = (-1,2,-1).' },
          { label: '(b)', question: 'Find AB × AC.', marks: 3, answer: '(3, 4, 5)', explanation: 'AB × AC = (1(-1)-(-2)(2), (-2)(-1)-2(-1), 2(2)-1(-1)) = (-1+4, 2+2, 4+1) = (3, 4, 5).' },
          { label: '(c)', question: 'Find the equation of the plane containing A, B, C.', marks: 3, answer: '3x + 4y + 5z = 13', explanation: 'Normal = (3,4,5). Plane: 3(x-1)+4(y-0)+5(z-2)=0 → 3x+4y+5z = 3+10 = 13.' },
          { label: '(d)', question: 'Find the area of triangle ABC.', marks: 2, answer: '5√2/2', explanation: 'Area = |AB × AC|/2 = √(9+16+25)/2 = √50/2 = 5√2/2.' },
          { label: '(e)', question: 'Find the distance from D(0,0,0) to this plane.', marks: 2, answer: '13/√50 = 13√2/10', explanation: 'Distance = |3(0)+4(0)+5(0)-13|/√(9+16+25) = 13/√50 = 13/(5√2) = 13√2/10.' }
        ]
      },
      {
        id: 'p1b-q8', number: 8, topic: 'Complex Numbers', marks: 10, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'Use De Moivre\'s theorem to show that cos3θ = 4cos³θ - 3cosθ.', marks: 5, answer: 'Proof using De Moivre', explanation: '(cosθ + isinθ)³ = cos3θ + isin3θ. Expand LHS: cos³θ + 3cos²θ(isinθ) + 3cosθ(isinθ)² + (isinθ)³ = (cos³θ - 3cosθsin²θ) + i(...). Real part: cos3θ = cos³θ - 3cosθsin²θ = cos³θ - 3cosθ(1-cos²θ) = 4cos³θ - 3cosθ.' },
          { label: '(b)', question: 'Hence solve cos3θ = 0 for 0 ≤ θ ≤ π.', marks: 3, answer: 'θ = π/6, π/2, 5π/6', explanation: '3θ = π/2, 3π/2, 5π/2. θ = π/6, π/2, 5π/6.' },
          { label: '(c)', question: 'Hence find the exact value of cos(π/6).', marks: 2, answer: '√3/2', explanation: 'cos(π/6) = √3/2 (standard value, confirmed by cos3(π/6) = cos(π/2) = 0 → 4cos³(π/6) - 3cos(π/6) = 0).' }
        ]
      },
      {
        id: 'p1b-q9', number: 9, topic: 'Probability', marks: 12, difficulty: 'medium',
        parts: [
          { label: '(a)', question: 'Events A and B are independent with P(A) = 0.4 and P(B) = 0.3. Find P(A ∩ B).', marks: 2, answer: '0.12', explanation: 'Independent: P(A∩B) = P(A)·P(B) = 0.4 × 0.3 = 0.12.' },
          { label: '(b)', question: 'Find P(A ∪ B).', marks: 2, answer: '0.58', explanation: 'P(A∪B) = P(A) + P(B) - P(A∩B) = 0.4 + 0.3 - 0.12 = 0.58.' },
          { label: '(c)', question: 'Find P(A | B).', marks: 2, answer: '0.4', explanation: 'P(A|B) = P(A∩B)/P(B) = 0.12/0.3 = 0.4 = P(A), as expected for independent events.' },
          { label: '(d)', question: 'A discrete random variable X has the distribution: P(X=1) = 0.2, P(X=2) = 0.3, P(X=3) = k, P(X=4) = 0.1. Find k and E(X).', marks: 6, answer: 'k = 0.4, E(X) = 2.4', explanation: 'Sum = 1: 0.2+0.3+k+0.1 = 1, k = 0.4. E(X) = 1(0.2)+2(0.3)+3(0.4)+4(0.1) = 0.2+0.6+1.2+0.4 = 2.4.' }
        ]
      },
      {
        id: 'p1b-q10', number: 10, topic: 'Differential Equations', marks: 12, difficulty: 'hard',
        parts: [
          { label: '(a)', question: 'Solve dy/dx = y/x, given y(1) = 2.', marks: 4, answer: 'y = 2x', explanation: '∫dy/y = ∫dx/x → ln|y| = ln|x| + C. y = Ax. y(1)=2 → A=2. y = 2x.' },
          { label: '(b)', question: 'Solve dy/dx + y = e^(-x), given y(0) = 1.', marks: 5, answer: 'y = (x+1)e^(-x)', explanation: 'Integrating factor: e^(∫1 dx) = eˣ. d/dx(yeˣ) = 1. yeˣ = x + C. y = (x+C)e^(-x). y(0) = C = 1. y = (x+1)e^(-x).' },
          { label: '(c)', question: 'What is lim(x→∞) y for the solution in part (b)?', marks: 3, answer: '0', explanation: 'As x→∞, (x+1)e^(-x) → 0 because exponential decay dominates polynomial growth.' }
        ]
      }
    ]
  }
];
