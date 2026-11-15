export default {
  elementary: [
    {
      id: 'arithmetic', label: 'Arithmetic', cards: [
        ['What is 18 + 27?', '45', '35', '44', '55', 'Add the tens and ones: 18 + 20 + 7 = 45.'],
        ['What is 9 × 4?', '36', '32', '40', '45', 'Nine groups of four contain 36 items.'],
        ['What is 63 ÷ 7?', '9', '7', '8', '10', 'Seven times nine is 63, so 63 divided by 7 is 9.'],
        ['What is 100 − 46?', '54', '44', '56', '64', 'Subtract 40 to get 60, then subtract 6 to get 54.'],
        ['There are 6 bags with 5 marbles in each bag. How many marbles are there?', '30', '11', '25', '35', 'Multiply the number of bags by the marbles in each bag: 6 × 5 = 30.'],
        ['What value does the digit 7 have in 472?', '70', '7', '700', '17', 'The 7 is in the tens place, so it represents seven tens, or 70.'],
      ],
    },
    {
      id: 'fractions', label: 'Fractions', cards: [
        ['Which fraction is equivalent to 3/6?', '1/2', '1/3', '2/3', '3/4', 'Divide both the numerator and denominator by 3: 3/6 = 1/2.'],
        ['What is 1/4 + 2/4?', '3/4', '3/8', '2/4', '1/4', 'The parts have the same size, so add the numerators and keep the denominator.'],
        ['Which fraction is greater: 2/3 or 1/3?', '2/3', '1/3', 'They are equal', 'Neither fraction has a value', 'Both fractions use thirds, and two thirds is greater than one third.'],
        ['A pizza has 8 equal slices. If 3 slices are eaten, what fraction remains?', '5/8', '3/8', '5/3', '3/5', 'Five of the eight equal slices remain, so the remaining fraction is 5/8.'],
        ['A whole is divided into 8 equal parts. What fraction is one part?', '1/8', '8/1', '1/4', '1/2', 'One of eight equal parts is one eighth.'],
        ['In the fraction 2/5, what does the numerator 2 describe?', 'The number of selected equal parts', 'The total number of equal parts', 'The number of whole objects', 'The size of a right angle', 'The numerator counts the selected parts; the denominator gives the number of equal parts in a whole.'],
      ],
    },
    {
      id: 'geometry', label: 'Geometry', cards: [
        ['Which property is true of every rectangle?', 'It has four right angles', 'It has three sides', 'All its sides have equal lengths', 'It has no corners', 'Every rectangle is a quadrilateral with four right angles.'],
        ['How many sides does a pentagon have?', '5', '4', '6', '8', 'A pentagon is a polygon with five sides.'],
        ['How many degrees are in a right angle?', '90°', '45°', '180°', '360°', 'A right angle measures 90 degrees, or one quarter of a full turn.'],
        ['Which unit is appropriate for the area of a classroom floor?', 'Square meters (m²)', 'Meters (m)', 'Liters (L)', 'Seconds (s)', 'Area measures a two-dimensional surface, so it uses square units.'],
        ['How many square faces does a cube have?', '6', '4', '8', '12', 'A cube has six square faces, eight vertices, and twelve edges.'],
        ['A triangle has side lengths of 3 cm, 4 cm, and 5 cm. What is its perimeter?', '12 cm', '10 cm', '15 cm', '20 cm', 'Perimeter is the sum of the side lengths: 3 + 4 + 5 = 12 cm.'],
      ],
    },
  ],
  middle: [
    {
      id: 'pre-algebra', label: 'Pre-Algebra', cards: [
        ['Solve for x: 2x − 7 = 11.', '9', '2', '4', '18', 'Add 7 to both sides to get 2x = 18, then divide by 2.'],
        ['Write 12/30 in simplest form.', '2/5', '3/5', '2/3', '4/5', 'Divide both 12 and 30 by their greatest common factor, 6.'],
        ['What is −6 × 4?', '−24', '24', '−10', '−2', 'A negative number times a positive number is negative: −6 × 4 = −24.'],
        ['Evaluate 5 + 3 × 4 using the order of operations.', '17', '32', '20', '12', 'Multiply before adding: 3 × 4 = 12, then 5 + 12 = 17.'],
        ['Which fraction equals the decimal 0.375?', '3/8', '1/3', '3/4', '5/8', '0.375 = 375/1000, which simplifies to 3/8.'],
        ['A $40 item is discounted by 10%. What is its sale price before tax?', '$36', '$30', '$38', '$44', 'Ten percent of $40 is $4. Subtract the discount: $40 − $4 = $36.'],
      ],
    },
    {
      id: 'geometry', label: 'Geometry', cards: [
        ['Two angles of a triangle measure 55° and 65°. What is the third angle?', '60°', '55°', '65°', '120°', 'Triangle angles total 180°: 180 − 55 − 65 = 60°.'],
        ['What is the circumference of a circle with radius 3 cm?', '6π cm', '3π cm', '9π cm', '12π cm', 'Circumference is 2πr, so 2 × π × 3 = 6π cm.'],
        ['A rectangular prism measures 4 cm by 3 cm by 2 cm. What is its volume?', '24 cm³', '9 cm³', '18 cm³', '48 cm³', 'Multiply length, width, and height: 4 × 3 × 2 = 24 cm³.'],
        ['A trapezoid has parallel sides of 6 m and 10 m and a height of 4 m. What is its area?', '32 m²', '24 m²', '40 m²', '64 m²', 'Area is half the sum of the parallel sides times the height: (6 + 10) × 4 ÷ 2 = 32 m².'],
        ['Reflect the point (−3, 5) across the y-axis. What are its new coordinates?', '(3, 5)', '(−3, −5)', '(5, −3)', '(3, −5)', 'Reflection across the y-axis changes the sign of x and leaves y unchanged.'],
        ['How many lines of symmetry does a square have?', '4', '1', '2', '8', 'A square has two diagonal symmetry lines and two lines through opposite side midpoints.'],
      ],
    },
    {
      id: 'statistics', label: 'Statistics & Probability', cards: [
        ['What is the median of 2, 3, 7, 8, and 10?', '7', '6', '8', '10', 'The median is the middle value in an ordered list. Here, the third value is 7.'],
        ['What is the mode of 1, 2, 2, 3, and 4?', '2', '1', '3', '4', 'The mode is the value that appears most often; 2 appears twice.'],
        ['What is the range of the data 6, 11, 15, and 19?', '13', '12', '19', '25', 'Range is the largest value minus the smallest: 19 − 6 = 13.'],
        ['A bag contains 3 red counters and 2 blue counters. What is the probability of drawing blue at random?', '2/5', '3/5', '1/2', '2/3', 'Two of the five equally likely counters are blue.'],
        ['What is the probability that one flip of a fair coin lands tails?', '1/2', '1/4', '1/3', '1', 'A fair coin has two equally likely outcomes, and one is tails.'],
        ['What is the probability of an even result on a fair six-sided die numbered 1–6?', '1/2', '1/6', '2/3', '5/6', 'The even results are 2, 4, and 6, so the probability is 3/6 = 1/2.'],
      ],
    },
  ],
  high: [
    {
      id: 'algebra', label: 'Algebra', cards: [
        ['Which expression is the factored form of x² − 9?', '(x − 3)(x + 3)', '(x − 9)(x + 1)', '(x − 3)²', '(x + 3)²', 'This is a difference of squares: x² − 3² = (x − 3)(x + 3).'],
        ['If x + y = 7 and x − y = 1, what is x?', '4', '3', '6', '8', 'Add the equations to get 2x = 8, so x = 4.'],
        ['What are the roots of x² − 5x + 6 = 0?', '2 and 3', '−2 and −3', '1 and 6', '−1 and −6', 'Factor the quadratic as (x − 2)(x − 3) = 0.'],
        ['For f(x) = 2x² − 1, what is f(3)?', '17', '5', '11', '18', 'Substitute 3 for x: 2(3²) − 1 = 18 − 1 = 17.'],
        ['Solve 2ˣ = 16.', 'x = 4', 'x = 3', 'x = 8', 'x = 16', 'Since 2⁴ = 16, the exponent x is 4.'],
        ['What is the slope of the line through (1, 2) and (3, 8)?', '3', '2', '6', '1/3', 'Slope is change in y divided by change in x: (8 − 2)/(3 − 1) = 6/2 = 3.'],
      ],
    },
    {
      id: 'geometry', label: 'Geometry', cards: [
        ['What is the area of a circle with radius 5 m?', '25π m²', '10π m²', '5π m²', '50π m²', 'Circle area is πr², so π × 5² = 25π m².'],
        ['What is the measure of each interior angle in a regular hexagon?', '120°', '60°', '90°', '135°', 'A hexagon has an interior angle sum of (6 − 2) × 180° = 720°. Divide by 6 to get 120°.'],
        ['Two similar triangles have corresponding side lengths in the ratio 2:3. If a smaller side is 8 cm, how long is the matching larger side?', '12 cm', '10 cm', '16 cm', '24 cm', 'The larger triangle uses a scale factor of 3/2, so 8 × 3/2 = 12 cm.'],
        ['What is the distance between (0, 0) and (6, 8)?', '10', '14', '48', '100', 'Use the distance formula: √(6² + 8²) = √100 = 10.'],
        ['A cylinder has radius 2 cm and height 7 cm. What is its volume?', '28π cm³', '14π cm³', '49π cm³', '56π cm³', 'Cylinder volume is πr²h = π × 2² × 7 = 28π cm³.'],
        ['What is the midpoint of the segment from (−2, 4) to (6, 10)?', '(2, 7)', '(4, 14)', '(−4, −3)', '(8, 6)', 'Average each coordinate: ((−2 + 6)/2, (4 + 10)/2) = (2, 7).'],
      ],
    },
    {
      id: 'precalculus', label: 'Precalculus', cards: [
        ['What is log₁₀(1000)?', '3', '10', '100', '1000', 'A logarithm gives an exponent. Since 10³ = 1000, log₁₀(1000) = 3.'],
        ['What is cos(60°)?', '1/2', '0', '1', '√3/2', 'On the unit circle, the x-coordinate at 60° is 1/2.'],
        ['What comes next in the geometric sequence 3, 6, 12, 24, …?', '48', '30', '36', '72', 'Each term is multiplied by 2, so the next term is 24 × 2 = 48.'],
        ['How many radians equal 180°?', 'π radians', '2π radians', 'π/2 radians', '180π radians', 'A full turn is 360° or 2π radians, so a half turn is π radians.'],
        ['Which real number is excluded from the domain of f(x) = 1/(x − 4)?', '4', '−4', '0', '1', 'The denominator cannot equal zero, so x cannot equal 4.'],
        ['What are the unit-circle coordinates at an angle of π radians?', '(−1, 0)', '(1, 0)', '(0, 1)', '(0, −1)', 'π radians is a half turn from the positive x-axis, reaching the point (−1, 0).'],
      ],
    },
    {
      id: 'calculus', label: 'Intro Calculus', cards: [
        ['What is the derivative of f(x) = 5x?', '5', '5x', 'x', '0', 'A linear function with slope 5 has a constant derivative of 5.'],
        ['For f(x) = x², what is f′(3)?', '6', '3', '9', '2', 'Differentiate to get f′(x) = 2x, then evaluate 2 × 3 = 6.'],
        ['What is the derivative of the constant function f(x) = 7?', '0', '1', '7', '7x', 'A constant function does not change, so its rate of change is zero.'],
        ['What is the limit of x + 2 as x approaches 3?', '5', '2', '3', '6', 'The function x + 2 is continuous, so substitute x = 3 to get 5.'],
        ['What is the definite integral of the constant 3 from x = 0 to x = 2?', '6', '3', '2', '9', 'The area under y = 3 over a width of 2 is 3 × 2 = 6.'],
        ['What does a derivative represent at a point on a function?', 'Its instantaneous rate of change', 'Its total accumulated area', 'Its average value over every interval', 'Its largest possible input', 'A derivative gives the slope of the tangent line, or instantaneous rate of change.'],
      ],
    },
    {
      id: 'statistics', label: 'Statistics & Probability', cards: [
        ['What is the mean of the scores 60, 70, 80, and 90?', '75', '70', '80', '300', 'Their sum is 300; divide by four scores to get 75.'],
        ['What is the median of 1, 4, 6, 7, 12, and 20?', '6.5', '6', '7', '8.5', 'With six ordered values, average the third and fourth: (6 + 7)/2 = 6.5.'],
        ['Events A and B are mutually exclusive, with P(A) = 0.2 and P(B) = 0.3. What is P(A or B)?', '0.5', '0.06', '0.1', '0.8', 'Mutually exclusive events do not overlap, so their probabilities add: 0.2 + 0.3 = 0.5.'],
        ['What is the probability of drawing an ace from a standard 52-card deck?', '1/13', '1/4', '4/13', '1/52', 'There are 4 aces among 52 cards: 4/52 = 1/13.'],
        ['A data set has a standard deviation of zero. What must be true?', 'All its values are identical', 'All its values are negative', 'Its mean is always zero', 'It has exactly two values', 'Standard deviation measures spread; zero spread means every value is the same.'],
        ['What does a positive association in a scatterplot mean?', 'Larger x values tend to occur with larger y values', 'x must cause changes in y', 'Every point must lie on a straight line', 'Larger x values tend to occur with smaller y values', 'A positive association describes an upward tendency, without proving causation or an exact relationship.'],
      ],
    },
  ],
  college: [
    {
      id: 'calculus', label: 'Calculus', cards: [
        ['Using radians, what is the derivative of sin(x)?', 'cos(x)', '−cos(x)', '−sin(x)', 'tan(x)', 'The derivative of sin(x) with respect to x is cos(x), when x is measured in radians.'],
        ['For x ≠ 0, which expression is an antiderivative of 1/x?', 'ln|x| + C', '1/x² + C', 'x²/2 + C', 'eˣ + C', 'Differentiating ln|x| gives 1/x on intervals that do not cross zero.'],
        ['What is the derivative of e²ˣ?', '2e²ˣ', 'e²ˣ', '2xe²ˣ', 'eˣ', 'Apply the chain rule: the derivative of 2x is 2, so multiply e²ˣ by 2.'],
        ['What is the definite integral of cos(x) from 0 to π?', '0', '1', '2', 'π', 'An antiderivative is sin(x), and sin(π) − sin(0) = 0.'],
        ['With x measured in radians, what is limₓ→₀ sin(x)/x?', '1', '0', '−1', 'The limit does not exist', 'The standard trigonometric limit sin(x)/x approaches 1 as x approaches zero in radians.'],
        ['For f(x, y) = x²y, what is the partial derivative with respect to x?', '2xy', 'x²', '2x', 'x²y²', 'Treat y as a constant and differentiate x² to obtain 2xy.'],
      ],
    },
    {
      id: 'linear-algebra', label: 'Linear Algebra', cards: [
        ['What are the eigenvalues of the diagonal matrix [[2, 0], [0, 5]]?', '2 and 5', '0 and 7', '1 and 10', '−2 and −5', 'The eigenvalues of a diagonal matrix are its diagonal entries.'],
        ['Are the vectors (1, 0) and (0, 1) linearly independent?', 'Yes, neither is a scalar multiple of the other', 'No, because both have two components', 'No, because each contains a zero', 'Yes, because their sum is zero', 'Only the zero combination a(1, 0) + b(0, 1) = (0, 0) has a = b = 0.'],
        ['What does multiplying a vector by a compatible identity matrix do?', 'Leaves the vector unchanged', 'Always changes it to the zero vector', 'Doubles each component', 'Reverses every component’s sign', 'The identity matrix acts like the number 1 in matrix multiplication.'],
        ['What is the rank of [[1, 2], [2, 4]]?', '1', '0', '2', '4', 'The second row is twice the first, so there is only one independent row.'],
        ['A 2 × 3 matrix multiplies a 3 × 4 matrix. What size is the product?', '2 × 4', '3 × 3', '2 × 3', '4 × 2', 'The matching inner dimensions allow multiplication; the outer dimensions give a 2 × 4 product.'],
        ['A square matrix has determinant zero. What follows?', 'It is not invertible', 'It must be the identity matrix', 'Every entry must be zero', 'It has full rank', 'A square matrix is invertible exactly when its determinant is nonzero.'],
      ],
    },
    {
      id: 'statistics', label: 'Statistics & Probability', cards: [
        ['For a normal distribution, approximately what percentage of observations lie within one standard deviation of the mean?', '68%', '50%', '95%', '99.7%', 'The empirical rule gives approximately 68%, 95%, and 99.7% within one, two, and three standard deviations.'],
        ['When P(B) > 0, which formula defines P(A given B)?', 'P(A ∩ B) / P(B)', 'P(A) × P(B)', 'P(A) + P(B)', 'P(B) / P(A ∩ B)', 'Conditional probability restricts the outcomes to event B and measures the fraction also in A.'],
        ['Treat the values 2 and 4 as an entire population. What is their population variance?', '1', '2', '3', '4', 'The mean is 3. Average the squared deviations: ((2 − 3)² + (4 − 3)²)/2 = 1.'],
        ['A binomial variable has n = 5 trials and success probability p = 0.4. What is its expected value?', '2', '0.4', '1.2', '5', 'A binomial variable has expectation np = 5 × 0.4 = 2.'],
        ['For n independent observations with population standard deviation σ, what is the standard error of the sample mean?', 'σ/√n', 'σ/n', 'σ√n', 'n/σ', 'The variance of the mean is σ²/n, so its standard deviation is σ/√n.'],
        ['Under a specified null model, what does a p-value measure?', 'The probability of a test statistic at least as extreme as the observed one', 'The probability that the null hypothesis is true', 'The probability that the research hypothesis is true', 'The size of the effect in the population', 'A p-value is calculated assuming the null model; it is not the probability that the null hypothesis itself is true.'],
      ],
    },
  ],
};
