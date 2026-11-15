import mathCourses from './courses/math.js?v=stem-v1';
import computerScienceCourses from './courses/computer-science.js?v=stem-v1';
import scienceCourses from './courses/science.js?v=stem-v1';
import engineeringCourses from './courses/engineering.js?v=stem-v1';

export const LEVELS = [
  { id: 'elementary', label: 'Elementary', detail: 'Grades 1–5', short: 'Elementary' },
  { id: 'middle', label: 'Middle school', detail: 'Grades 6–8', short: 'Middle school' },
  { id: 'high', label: 'High school', detail: 'Grades 9–12', short: 'High school' },
  { id: 'college', label: 'College', detail: 'Introductory level', short: 'College' },
];
export const SUBJECTS = [
  { id: 'math', label: 'Math', icon: 'math', detail: 'Numbers & logic', color: '#79aef2' },
  { id: 'computer-science', label: 'Computer Science', icon: 'computer-science', detail: 'Code & logic', color: '#79aef2' },
  { id: 'science', label: 'Science', icon: 'science', detail: 'Explore & discover', color: '#79aef2' },
  { id: 'engineering', label: 'Engineering', icon: 'engineering', detail: 'Build & solve', color: '#79aef2' },
];

// Each row: question, correct answer, three distractors, explanation.
// Options are shuffled whenever a card is drawn.
const BANK = {
  elementary: {
    math: [
      ['What is 7 × 6?', '42', '36', '48', '56', 'Seven groups of six make 42.'],
      ['A square has a side length of 4 cm. What is its perimeter?', '16 cm', '8 cm', '12 cm', '20 cm', 'Add all four sides: 4 + 4 + 4 + 4 = 16 cm.'],
      ['Which fraction is equal to one half?', '2/4', '1/4', '3/4', '2/3', 'Two of four equal parts cover the same amount as one of two equal parts.'],
      ['What number comes next: 5, 10, 15, 20, …?', '25', '21', '24', '30', 'The pattern adds 5 each time.'],
      ['You have 24 blocks and share them equally among 3 people. How many does each person get?', '8', '6', '9', '12', '24 divided by 3 equals 8.'],
      ['Which shape has exactly 3 sides?', 'Triangle', 'Square', 'Pentagon', 'Hexagon', 'A triangle has three sides and three corners.'],
    ],
    science: [
      ['What do plants take in through their roots?', 'Water', 'Sunlight', 'Sound', 'Plastic', 'Roots absorb water and dissolved minerals from the soil.'],
      ['Which material is usually attracted to a magnet?', 'Iron', 'Wood', 'Glass', 'Paper', 'Iron is a magnetic material.'],
      ['What is frozen water called?', 'Ice', 'Steam', 'Sand', 'Air', 'Water becomes solid ice when it freezes.'],
      ['Which part of your body pumps blood?', 'Heart', 'Lungs', 'Stomach', 'Brain', 'The heart pumps blood through the circulatory system.'],
      ['Which force pulls a dropped ball toward Earth?', 'Gravity', 'Light', 'Sound', 'Heat', 'Gravity pulls objects toward Earth.'],
      ['Which is a source of light?', 'The Sun', 'A wooden desk', 'A brick', 'An unlit candle', 'The Sun produces its own light.'],
    ],
    engineering: [
      ['Which simple machine is a ramp?', 'Inclined plane', 'Pulley', 'Wheel and axle', 'Lever', 'A ramp is an inclined plane: a sloping surface for moving objects between heights.'],
      ['What is a prototype?', 'An early model used to try an idea', 'The name of a building', 'A kind of battery', 'A unit of length', 'Engineers test early models, called prototypes, to learn what works.'],
      ['Which tool is best for measuring the length of a pencil?', 'Ruler', 'Thermometer', 'Scale', 'Clock', 'A ruler measures length.'],
      ['Which base usually makes a tall tower more stable?', 'A wide base', 'A tiny base', 'A rounded point', 'No base', 'A wide base makes a tower harder to tip.'],
      ['Your model bridge bends too much. What is a useful next step?', 'Change one part and test it again', 'Never test it again', 'Ignore the bending', 'Only change its color', 'Testing a design change helps you see whether it improves the bridge.'],
      ['What does a wheel help a cart do?', 'Move with less sliding friction', 'Become invisible', 'Make electricity by itself', 'Lose all its weight', 'Wheels let a cart roll instead of sliding along the ground.'],
    ],
  },
  middle: {
    math: [
      ['Solve for x: 3x + 5 = 20.', '5', '3', '15', '25', 'Subtract 5 to get 3x = 15, then divide by 3.'],
      ['What is 25% of 80?', '20', '25', '40', '60', '25% is one quarter, and 80 ÷ 4 = 20.'],
      ['A rectangle is 8 m long and 3 m wide. What is its area?', '24 m²', '11 m²', '22 m²', '48 m²', 'Area equals length times width: 8 × 3 = 24 m².'],
      ['What is the mean of 4, 6, 8, and 10?', '7', '6', '8', '28', 'Add the values to get 28, then divide by 4 to get 7.'],
      ['What is the probability of rolling a 6 on a fair six-sided die?', '1/6', '1/2', '1/3', '5/6', 'One of the six equally likely outcomes is a 6.'],
      ['What is −4 + 9?', '5', '−5', '13', '−13', 'Start at −4 and move nine units to the right to reach 5.'],
    ],
    science: [
      ['What is the basic unit of living things?', 'Cell', 'Atom of gold', 'Rock', 'Planet', 'Cells are the basic structural and functional units of life.'],
      ['Which process turns liquid water into water vapor?', 'Evaporation', 'Freezing', 'Condensation', 'Melting', 'During evaporation, liquid water changes into a gas.'],
      ['What is the chemical formula for water?', 'H₂O', 'CO₂', 'O₂', 'NaCl', 'A water molecule has two hydrogen atoms and one oxygen atom.'],
      ['Which form of energy is stored in a stretched rubber band?', 'Elastic potential energy', 'Sound energy', 'Nuclear energy', 'Light energy', 'Stretching an elastic object stores potential energy.'],
      ['Which planet is closest to the Sun?', 'Mercury', 'Venus', 'Earth', 'Mars', 'Mercury has the smallest orbit of the eight planets.'],
      ['In an experiment, what is the variable you deliberately change called?', 'Independent variable', 'Dependent variable', 'Conclusion', 'Measurement error', 'You change the independent variable and measure the dependent variable.'],
    ],
    engineering: [
      ['Why are triangles common in bridge trusses?', 'Their shape resists changing under load', 'They have no corners', 'They eliminate gravity', 'They use no material', 'A triangle is a rigid shape when its side lengths stay fixed.'],
      ['What does CAD stand for?', 'Computer-aided design', 'Circuit alignment device', 'Calculated air density', 'Central axle direction', 'CAD software helps people create and revise designs.'],
      ['What is a design constraint?', 'A limit the design must work within', 'A decoration on a drawing', 'A guaranteed solution', 'An optional product name', 'Constraints can include cost, size, materials, and time.'],
      ['What is needed for current to flow in a simple battery-and-bulb circuit?', 'A complete conducting path', 'A gap in every wire', 'A disconnected battery', 'Only a plastic loop', 'A complete circuit provides a conducting path through the bulb and back to the battery.'],
      ['If a drawing uses a scale of 1:10, what does a 2 cm line represent?', '20 cm', '2 cm', '0.2 cm', '200 cm', 'Multiply the drawing measurement by 10: 2 × 10 = 20 cm.'],
      ['Why should engineers test a prototype?', 'To find problems before final production', 'To guarantee it can never fail', 'To avoid collecting evidence', 'To remove all constraints', 'Testing reveals how a design behaves and where it can improve.'],
    ],
  },
  high: {
    math: [
      ['What is the slope of y = 3x − 2?', '3', '−2', '2', '−3', 'In y = mx + b, the coefficient m is the slope.'],
      ['What are the solutions to x² = 49?', 'x = 7 or x = −7', 'x = 7 only', 'x = 49 or x = −49', 'x = 0 only', 'Both 7² and (−7)² equal 49.'],
      ['A right triangle has legs of 3 cm and 4 cm. How long is its hypotenuse?', '5 cm', '7 cm', '12 cm', '25 cm', 'By the Pythagorean theorem, c = √(3² + 4²) = 5 cm.'],
      ['What is sin(30°)?', '1/2', '1', '0', '√3/2', 'In a 30–60–90 triangle, the side opposite 30° is half the hypotenuse.'],
      ['Simplify 2³ × 2².', '32', '16', '64', '12', 'Add the exponents for the same base: 2⁵ = 32.'],
      ['A fair coin is flipped twice. What is the probability of two heads?', '1/4', '1/2', '3/4', '1/8', 'The independent probabilities multiply: 1/2 × 1/2 = 1/4.'],
    ],
    science: [
      ['What is the SI unit of force?', 'Newton', 'Joule', 'Watt', 'Volt', 'One newton is the force needed to accelerate 1 kg by 1 m/s².'],
      ['A 2 kg object accelerates at 3 m/s². What net force acts on it?', '6 N', '1.5 N', '5 N', '9 N', 'Newton’s second law gives F = ma = 2 × 3 = 6 N.'],
      ['Which particle has a negative electric charge?', 'Electron', 'Proton', 'Neutron', 'Photon', 'Electrons carry negative charge; protons carry positive charge.'],
      ['A solution has a pH of 3. How is it classified?', 'Acidic', 'Neutral', 'Basic', 'Always pure water', 'A pH below 7 indicates an acidic solution under ordinary aqueous conditions.'],
      ['What molecule carries hereditary information in living cells?', 'DNA', 'Water', 'Glucose', 'Sodium chloride', 'DNA stores genetic information in its sequence of bases.'],
      ['Which law states that energy cannot be created or destroyed?', 'Conservation of energy', 'Law of reflection', 'Ohm’s law', 'Law of segregation', 'Energy changes form or transfers between systems, but the total is conserved.'],
    ],
    engineering: [
      ['A 6 V supply is connected across a 3 Ω resistor. What is the current?', '2 A', '18 A', '0.5 A', '9 A', 'Ohm’s law gives I = V/R = 6/3 = 2 A.'],
      ['A beam is being pulled apart along its length. What kind of loading is this?', 'Tension', 'Compression', 'Pure torsion', 'No load', 'Tension stretches a member; compression pushes its ends together.'],
      ['What does a factor of safety compare?', 'Failure capacity to the intended working load', 'Paint cost to surface area', 'Voltage to current only', 'Length to width only', 'A factor of safety provides a margin between capacity and expected demand.'],
      ['A machine receives 100 J and delivers 80 J of useful work. What is its efficiency?', '80%', '20%', '125%', '100%', 'Efficiency is useful output divided by input: 80/100 = 80%.'],
      ['What does a manufacturing tolerance specify?', 'An acceptable range of variation', 'The color of every component', 'A ban on measurement', 'The exact delivery date', 'Tolerances define how far dimensions or properties may vary from their specified values.'],
      ['Which device converts rotational motion into electrical energy?', 'Generator', 'Resistor', 'Static bracket', 'Fuse', 'A generator converts mechanical energy into electrical energy.'],
    ],
  },
  college: {
    math: [
      ['What is the derivative of f(x) = x³?', '3x²', 'x²', '3x', 'x⁴/4', 'The power rule gives d(xⁿ)/dx = nxⁿ⁻¹.'],
      ['What is the definite integral of 2x from 0 to 1?', '1', '0', '2', '1/2', 'An antiderivative is x². Evaluate 1² − 0² = 1.'],
      ['What is the determinant of the matrix [[2, 1], [3, 4]]?', '5', '11', '8', '−5', 'For a 2 × 2 matrix, det = ad − bc = 2(4) − 1(3) = 5.'],
      ['For independent events A and B, how do you calculate P(A and B)?', 'P(A) × P(B)', 'P(A) + P(B)', 'P(A) − P(B)', '1 − P(A)', 'Independence lets you multiply the individual probabilities.'],
      ['What is ln(e²)?', '2', 'e', '1', 'e²', 'The natural logarithm and the exponential function with base e are inverses.'],
      ['What is the dot product of (1, 2) and (3, 4)?', '11', '10', '7', '−5', 'Multiply corresponding components and add: 1(3) + 2(4) = 11.'],
    ],
    science: [
      ['What is the SI unit of electrical capacitance?', 'Farad', 'Tesla', 'Henry', 'Ohm', 'Capacitance is measured in farads, equivalent to coulombs per volt.'],
      ['Which quantity is conserved in an isolated system during a collision?', 'Total linear momentum', 'Each object’s speed', 'Each object’s kinetic energy', 'Each object’s direction', 'With no net external force, total linear momentum remains constant.'],
      ['At constant temperature, what happens to an ideal gas’s pressure if its volume is halved?', 'It doubles', 'It halves', 'It stays the same', 'It becomes zero', 'For a fixed amount of ideal gas at constant temperature, PV is constant.'],
      ['What does a catalyst change?', 'The reaction rate by lowering activation energy', 'The equilibrium constant at fixed temperature', 'The number of atoms conserved', 'The identity of every final product', 'A catalyst offers a lower-energy pathway and speeds approach to equilibrium.'],
      ['Which type of bond involves sharing electron pairs between atoms?', 'Covalent bond', 'Hydrogen bond', 'Gravitational bond', 'Purely ionic bond', 'In a covalent bond, atoms share electron pairs.'],
      ['Under the second law of thermodynamics, the total entropy of an isolated system can do what?', 'Increase or remain constant', 'Always decrease', 'Always remain zero', 'Change only if mass changes', 'For an isolated system, total entropy cannot decrease.'],
    ],
    engineering: [
      ['What is normal stress for a uniform axial force F acting on area A?', 'F/A', 'F × A', 'A/F', 'F + A', 'Normal stress is axial force per unit cross-sectional area.'],
      ['For a linear spring with stiffness k, what is the force magnitude at displacement x?', 'kx', 'k/x', 'x/k', 'kx²', 'Hooke’s law gives a restoring force with magnitude kx in the linear range.'],
      ['In a feedback controller, what is the error signal?', 'The reference value minus the measured output', 'The measured output plus the reference value', 'The supply voltage alone', 'The elapsed time alone', 'The controller uses the difference between the desired value and measured output.'],
      ['What happens to resistors connected in series?', 'Their resistances add', 'Their resistances always cancel', 'Their total resistance is always zero', 'Each receives the full supply voltage regardless of value', 'The same current passes through series resistors, and their equivalent resistances add.'],
      ['What is Young’s modulus in the linear elastic range?', 'Normal stress divided by normal strain', 'Force divided by velocity', 'Mass times acceleration', 'Temperature divided by pressure', 'Young’s modulus measures axial stiffness as the ratio of normal stress to normal strain.'],
      ['Why is dimensional analysis useful?', 'It checks whether equations have consistent units', 'It proves all design assumptions are correct', 'It removes the need for measurements', 'It guarantees a prototype is safe', 'Dimensional consistency can reveal mistakes, although it does not prove an equation is correct.'],
    ],
  },
};

const BASE_QUESTIONS = Object.entries(BANK).flatMap(([level, subjects]) =>
  Object.entries(subjects).flatMap(([subject, rows]) => rows.map((row, i) => ({
    id: `${level}-${subject}-${i + 1}`, level, subject,
    prompt: row[0], answer: row[1], distractors: row.slice(2, 5), explanation: row[5],
  }))),
);

const COURSE_BANK = { math: mathCourses, 'computer-science': computerScienceCourses, science: scienceCourses, engineering: engineeringCourses };

// Keep existing question IDs stable so saved cards survive the expanded catalog.
const LEGACY_COURSES = {
  elementary: {
    math: ['arithmetic', 'geometry', 'fractions', 'arithmetic', 'arithmetic', 'geometry'],
    science: ['life-science', 'physical-science', 'physical-science', 'life-science', 'physical-science', 'earth-space'],
    engineering: ['simple-machines', 'design', 'design', 'structures', 'design', 'simple-machines'],
  },
  middle: {
    math: ['pre-algebra', 'pre-algebra', 'geometry', 'statistics', 'statistics', 'pre-algebra'],
    science: ['biology', 'earth-space', 'chemistry', 'physics', 'earth-space', 'physics'],
    engineering: ['mechanics', 'design', 'design', 'circuits', 'design', 'design'],
  },
  high: {
    math: ['algebra', 'algebra', 'geometry', 'precalculus', 'algebra', 'statistics'],
    science: ['physics', 'physics', 'chemistry', 'chemistry', 'biology', 'physics'],
    engineering: ['electrical', 'civil', 'civil', 'mechanical', 'mechanical', 'electrical'],
  },
  college: {
    math: ['calculus', 'calculus', 'linear-algebra', 'statistics', 'calculus', 'linear-algebra'],
    science: ['physics', 'physics', 'chemistry', 'chemistry', 'chemistry', 'physics'],
    engineering: ['civil', 'mechanical', 'mechanical', 'electrical', 'civil', 'mechanical'],
  },
};

export const COURSES = LEVELS.flatMap(level => SUBJECTS.flatMap(subject =>
  COURSE_BANK[subject.id][level.id].map(course => ({ id: course.id, label: course.label, level: level.id, subject: subject.id })),
));

export function getCourses(level, subject) {
  return COURSES.filter(course => course.level === level && course.subject === subject);
}

export const QUESTIONS = LEVELS.flatMap(level => SUBJECTS.flatMap(subject => {
  const originals = BASE_QUESTIONS.filter(q => q.level === level.id && q.subject === subject.id)
    .map((q, i) => ({ ...q, course: LEGACY_COURSES[level.id][subject.id][i] }));
  return COURSE_BANK[subject.id][level.id].flatMap(course => {
    const additions = course.cards.map((row, i) => ({
      id: `${level.id}-${subject.id}-${course.id}-${i + 1}`,
      level: level.id, subject: subject.id, course: course.id,
      prompt: row[0], answer: row[1], distractors: row.slice(2, 5), explanation: row[5],
    }));
    const seen = new Set();
    return [...originals.filter(q => q.course === course.id), ...additions].filter(q => {
      const key = q.prompt.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  });
}));
