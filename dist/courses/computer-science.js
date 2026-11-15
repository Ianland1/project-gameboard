export default {
  elementary: [
    {
      id: 'coding', label: 'Coding Basics', cards: [
        ['What is a computer program?', 'A set of instructions a computer can follow', 'A type of computer screen', 'A place to plug in a cable', 'A picture of a keyboard', 'A program tells a computer which actions to perform.'],
        ['A robot follows “move forward one step” three times. How many steps does it move?', '3 steps', '1 step', '2 steps', '6 steps', 'Repeating a one-step movement three times produces three steps.'],
        ['What does debugging a program mean?', 'Finding and fixing mistakes in its instructions', 'Making its screen brighter', 'Changing the computer’s color', 'Printing every file', 'A bug is a mistake in a program; debugging helps find and correct it.'],
        ['Why does the order of instructions matter in a program?', 'Changing the order can change what the program does', 'A computer always ignores the first instruction', 'All instruction orders produce the same result', 'Instructions can only be read backward', 'A sequence runs instructions in an order, and later steps can depend on earlier ones.'],
        ['A game starts when you press the space bar. What is the key press called in the program?', 'An event', 'A printer', 'A folder', 'A battery', 'An event, such as a key press, can trigger a programmed action.'],
        ['A robot’s rule says “If the light is red, stop.” The light is red. What should the robot do?', 'Stop', 'Move faster', 'Turn off the light', 'Ignore the rule', 'The condition is true, so the robot follows the instruction to stop.'],
      ],
    },
    {
      id: 'algorithms', label: 'Patterns & Algorithms', cards: [
        ['What is an algorithm?', 'A set of ordered steps for solving a task', 'Only the outside of a computer', 'A kind of electrical plug', 'A random collection of unrelated words', 'An algorithm describes steps for completing a task or solving a problem.'],
        ['What comes next in this repeating pattern: circle, square, circle, square, …?', 'Circle', 'Triangle', 'Rectangle', 'Star', 'The pattern repeats a circle followed by a square.'],
        ['Which list puts 3, 1, and 2 in order from smallest to largest?', '1, 2, 3', '3, 2, 1', '2, 3, 1', '3, 1, 2', 'Sorting from smallest to largest is called ascending order.'],
        ['A number pattern adds 2 each time: 2, 4, 6, … . What comes next?', '8', '7', '9', '12', 'Adding 2 to 6 gives 8.'],
        ['An animation must show “Ready” before it shows “Go.” Which sequence follows that rule?', 'Show Ready, then show Go', 'Show Go, then show Ready', 'Show only Go', 'Show only Ready', 'The sequence includes both required actions and puts them in the required order.'],
        ['You split making a sandwich into “get ingredients,” “build sandwich,” and “clean up.” What are you doing?', 'Breaking a task into smaller tasks', 'Deleting the whole task', 'Doing every step backward', 'Making the task impossible to describe', 'Breaking a larger task into manageable parts is called decomposition.'],
      ],
    },
    {
      id: 'digital-systems', label: 'Digital Systems', cards: [
        ['Which device lets you type letters into a computer?', 'Keyboard', 'Speaker', 'Printer', 'Projector', 'A keyboard is an input device that sends key presses to a computer.'],
        ['Which device usually shows a computer’s pictures and text?', 'Monitor', 'Mouse', 'Microphone', 'Keyboard', 'A monitor is an output device that displays visual information.'],
        ['Which two digits are used in binary?', '0 and 1', '1 and 2', '2 and 3', '5 and 10', 'Binary represents information using two possible digits: 0 and 1.'],
        ['What does a computer’s storage keep?', 'Saved files and programs', 'Only the room’s temperature', 'The weight of the desk', 'Only sounds outside the computer', 'Storage holds files and programs so they can be used later.'],
        ['What is a pixel in a digital picture?', 'A small picture element', 'A computer’s power cable', 'A whole keyboard', 'A type of desk', 'A digital image is made from small picture elements called pixels.'],
        ['What does a computer network connect?', 'Computers and other devices so they can exchange data', 'Only the legs of a desk', 'Only paper notebooks', 'Only objects with no electronics', 'A network provides connections that let devices exchange information.'],
      ],
    },
  ],
  middle: [
    {
      id: 'programming', label: 'Programming', cards: [
        ['What is a variable used for in a program?', 'Storing a value under a name', 'Making a computer screen physically larger', 'Replacing every instruction with a picture', 'Preventing a program from using data', 'A variable gives a name to a value that a program can use or update.'],
        ['In this pseudocode, ← means assignment: x ← 4; x ← x + 3. What is x afterward?', '7', '4', '3', '12', 'The second assignment replaces x with its previous value, 4, plus 3.'],
        ['A counter starts at 0. A loop adds 2 to it four times. What is the final value?', '8', '2', '4', '6', 'Four additions of 2 give 0 + 2 + 2 + 2 + 2 = 8.'],
        ['If x is 7, is the condition x > 5 true or false?', 'True', 'False', 'Neither, because 7 is a number', 'It changes the value of x to 5', 'Seven is greater than five, so the comparison evaluates to true.'],
        ['Why do programmers define functions?', 'To group instructions into reusable named tasks', 'To remove all inputs from every program', 'To guarantee every program has no mistakes', 'To make data impossible to read', 'A function groups instructions that can be called when that task is needed.'],
        ['Which value is a string representing text?', '"Hello"', '42', '3.5', 'True as a Boolean value', 'A string stores text; quotation marks commonly distinguish it from numeric or Boolean values.'],
      ],
    },
    {
      id: 'algorithms', label: 'Algorithms', cards: [
        ['A search checks items one by one from the start of a list. What is this called?', 'Linear search', 'Binary search', 'Image compression', 'Encryption', 'Linear search examines items in sequence until it finds a match or reaches the end.'],
        ['What must be true about a list before standard binary search can be used?', 'It is sorted by the value being searched', 'It contains exactly two items', 'Every item is identical', 'It contains only pictures', 'Binary search uses sorted order to decide which half can be discarded.'],
        ['Which instruction gives a loop a fixed, finite number of repetitions?', 'Repeat exactly 5 times', 'Repeat forever', 'Repeat without any stopping rule', 'Start again after every stop', 'An exact repetition count sets a clear limit on the loop.'],
        ['In a conventional flowchart, what does a diamond usually represent?', 'A decision with different possible branches', 'Only the end of a page', 'A saved image file', 'A keyboard key', 'A diamond commonly marks a condition or decision that leads to different paths.'],
        ['Sort 9, 3, and 6 into ascending order.', '3, 6, 9', '9, 6, 3', '6, 3, 9', '3, 9, 6', 'Ascending order places the smallest value first and the largest last.'],
        ['Which plan best demonstrates decomposition when creating a game?', 'Separate the work into input, rules, scoring, and display tasks', 'Write unrelated instructions without a plan', 'Treat every feature as one step with no details', 'Remove all tasks except choosing a title', 'Decomposition divides a complex project into smaller parts that can be developed and tested.'],
      ],
    },
    {
      id: 'digital-systems', label: 'Digital Systems', cards: [
        ['How many bits are in one standard byte?', '8', '2', '4', '16', 'A standard byte contains eight bits.'],
        ['Which component typically holds a program’s working data while the computer is powered on?', 'RAM', 'A paper notebook', 'The monitor stand', 'A disconnected power cord', 'RAM provides working memory; ordinary RAM loses its contents when power is removed.'],
        ['What is the CPU mainly responsible for?', 'Executing program instructions', 'Printing ink onto paper', 'Displaying every image without other components', 'Providing a desk surface', 'The central processing unit executes instructions and performs operations on data.'],
        ['What is an IP address used for?', 'Addressing data to network interfaces using Internet Protocol', 'Measuring a screen’s brightness', 'Counting the keys on a keyboard', 'Specifying a printer’s paper size', 'Internet Protocol uses IP addresses to help route data to network interfaces.'],
        ['What is a network packet?', 'A formatted unit of data sent across a network', 'A physical box containing a computer', 'The entire Internet in one file', 'A type of electrical wall socket', 'Networks often split communication into packets that carry data and addressing information.'],
        ['What is one central role of an operating system?', 'Managing hardware resources and supporting applications', 'Making a computer work without any hardware', 'Replacing all program instructions with sound', 'Increasing the number of physical keys automatically', 'An operating system manages resources such as memory, files, and input/output devices.'],
      ],
    },
  ],
  high: [
    {
      id: 'programming', label: 'Programming', cards: [
        ['If x = 10, what is the value of “x > 0 AND x < 10”?', 'False', 'True', '10', 'The expression changes x to 0', 'The second comparison is false because 10 is not less than 10; AND requires both comparisons to be true.'],
        ['A list uses zero-based indexing: [10, 20, 30]. What is the value at index 1?', '20', '10', '30', '1', 'Zero-based indexing labels the first element 0 and the second element 1.'],
        ['A function square(n) returns n × n. What does square(5) return?', '25', '10', '5', '125', 'The function multiplies its input by itself: 5 × 5 = 25.'],
        ['What does converting the text "12" to an integer produce?', 'The numeric value 12', 'The numeric value 2', 'The text "integer"', 'The numeric value 120', 'Type conversion interprets the digit characters as the whole-number value 12.'],
        ['What is a unit test designed to check?', 'A small, individual piece of program behavior', 'Only the computer’s physical dimensions', 'Every possible program in existence at once', 'The color of the application icon only', 'Unit tests check small units of behavior against expected results.'],
        ['A loop visits counter values 1 through 4, including both endpoints. How many iterations occur?', '4', '3', '5', '1', 'The counter takes four values: 1, 2, 3, and 4.'],
      ],
    },
    {
      id: 'algorithms', label: 'Algorithms', cards: [
        ['What is the usual worst-case time complexity of binary search on a sorted array?', 'O(log n)', 'O(n²)', 'O(2ⁿ)', 'O(n!)', 'Binary search repeatedly halves the remaining search interval.'],
        ['Checking every element once in a list of n elements has what time complexity?', 'O(n)', 'O(1)', 'O(n²)', 'O(n!)', 'The amount of work grows in direct proportion to the number of elements.'],
        ['Which data structure follows last in, first out?', 'Stack', 'Queue', 'Sorted array in every situation', 'Relational table', 'A stack removes the most recently added item first.'],
        ['Which data structure follows first in, first out?', 'Queue', 'Stack', 'Binary search tree in every situation', 'Unordered set', 'A queue removes the earliest-added item that has not yet been removed.'],
        ['An outer loop runs n times, and an inner loop runs n times per outer iteration. How many inner iterations occur?', 'n²', 'n', '2n', 'log₂ n', 'The nested repetition counts multiply: n × n = n².'],
        ['What does it mean for an algorithm to be correct?', 'It produces the specified results for all valid inputs', 'It is always the shortest possible program', 'It uses only one variable', 'It has no written explanation', 'Correctness concerns whether an algorithm satisfies its specification for valid inputs.'],
      ],
    },
    {
      id: 'data', label: 'Data & Logic', cards: [
        ['When is the Boolean expression A AND B true?', 'When both A and B are true', 'Whenever either value is false', 'Only when both values are false', 'Whenever A and B are different', 'AND is true only when both of its inputs are true.'],
        ['What is the result of True OR False?', 'True', 'False', 'Neither true nor false', 'The number 2', 'Boolean OR is true when at least one input is true.'],
        ['What is the result of NOT False?', 'True', 'False', 'An empty list', 'The text "False"', 'NOT reverses a Boolean value, changing false to true.'],
        ['How many distinct bit patterns can four bits represent?', '16', '4', '8', '32', 'Each bit has two possibilities, so four bits have 2⁴ = 16 patterns.'],
        ['What is the unsigned binary number 1011 in decimal?', '11', '9', '10', '13', 'The place values are 8, 4, 2, and 1: 8 + 0 + 2 + 1 = 11.'],
        ['Which data type represents whole numbers such as −3, 0, and 18?', 'Integer', 'Boolean', 'Text string', 'Image pixel array only', 'Integers represent whole numbers without a fractional part.'],
      ],
    },
  ],
  college: [
    {
      id: 'programming', label: 'Programming', cards: [
        ['Which description matches a pure function?', 'It has no side effects and returns the same output for the same inputs', 'It always modifies a global variable', 'It returns a random value on every call', 'It can only be called once', 'A pure function’s result depends only on its inputs, and it does not cause observable side effects.'],
        ['What role does a base case play in a recursive function?', 'It provides a condition that stops further recursive calls', 'It forces the function to call itself forever', 'It removes all function parameters', 'It changes every result into a string', 'A base case returns a result without making another recursive call.'],
        ['What does a local variable’s scope describe?', 'The region of code where that variable can be accessed by its name', 'The number of pixels on a monitor', 'The physical size of a memory chip', 'The maximum length of every file', 'Scope determines where a binding or variable name is available in a program.'],
        ['What does it mean for a data value to be immutable?', 'It cannot be changed after it is created', 'It is never stored in memory', 'It can only contain zeros', 'It must be deleted after one read', 'Immutable values are not modified in place; changes are represented by creating other values.'],
        ['Which test focuses on whether separately developed components work together?', 'Integration test', 'A spelling check on comments only', 'A test of one isolated arithmetic expression only', 'A screen-resolution measurement', 'Integration tests check interactions between combined components or subsystems.'],
        ['For an array of length n using zero-based indexing, which indices are valid when n > 0?', '0 through n − 1', '1 through n only', '0 through n inclusive', 'Only n', 'A zero-based array starts at index 0 and ends at index n − 1.'],
      ],
    },
    {
      id: 'algorithms', label: 'Algorithms', cards: [
        ['What is the usual worst-case time complexity of comparison-based merge sort?', 'O(n log n)', 'O(n²)', 'O(2ⁿ)', 'O(1)', 'Merge sort divides the input into smaller parts and merges them with linear work across logarithmically many levels.'],
        ['Which traversal finds paths with the fewest edges from a source in an unweighted graph?', 'Breadth-first search', 'Choosing the largest-numbered neighbor first', 'Sorting the vertex names alphabetically only', 'Visiting one arbitrary vertex and stopping', 'Breadth-first search explores vertices in order of their distance in number of edges from the source.'],
        ['Which edge-weight condition is required for the standard Dijkstra shortest-path algorithm?', 'All edge weights are nonnegative', 'Every edge weight is negative', 'All weights must equal exactly 1', 'The graph must contain a negative cycle', 'Standard Dijkstra relies on nonnegative edge weights when finalizing shortest distances.'],
        ['What property makes a sorting algorithm stable?', 'Equal-key items keep their original relative order', 'It never uses any memory', 'It only sorts lists that are already sorted', 'It produces the same running time for all input sizes', 'Stable sorting preserves the order of records whose sort keys compare as equal.'],
        ['In a topological ordering of a directed acyclic graph, what is true for every edge u → v?', 'u appears before v', 'v must appear immediately before u', 'u and v must be the same vertex', 'Every edge is removed before any vertex is listed', 'A topological ordering places each vertex before the vertices it points to.'],
        ['What does an algorithm’s space complexity describe?', 'How memory use grows with input size', 'The area of the computer’s desk', 'The distance a network cable travels', 'Only the number of characters in its title', 'Space complexity expresses the memory needed as a function of the input size.'],
      ],
    },
    {
      id: 'data', label: 'Data & Databases', cards: [
        ['In SQL, which command is used to retrieve data from tables?', 'SELECT', 'DELETE', 'DROP', 'UPDATE', 'SELECT queries retrieve data; DELETE removes rows, DROP removes objects, and UPDATE changes existing values.'],
        ['A relational table has a single-column primary key. What must be true of its values?', 'They are unique and not NULL', 'They are repeated in every row', 'They are always decimal numbers', 'They are always the longest text in each row', 'A primary key uniquely identifies a row and does not allow NULL values.'],
        ['What does a foreign-key constraint usually enforce?', 'A reference to an existing primary or unique key value, or an allowed NULL', 'That every column contains a password', 'That all tables contain identical rows', 'That no two tables can be related', 'A foreign key helps maintain referential integrity by restricting references to valid key values; nullable foreign keys can allow NULL.'],
        ['What is a main purpose of database normalization?', 'Reducing unwanted redundancy and data-modification anomalies', 'Making every table contain the exact same data', 'Removing all relationships between records', 'Guaranteeing that every query has constant running time', 'Normalization organizes data to reduce redundancy and problems when inserting, updating, or deleting records.'],
        ['What does the atomicity property of a database transaction mean?', 'Its changes are completed together or are rolled back together', 'Each statement must use exactly one character', 'It can never read any data', 'It always finishes within one millisecond', 'Atomicity treats a transaction as a single unit of work: either its changes commit or none of them do.'],
        ['In SQL, what does COUNT(*) count in a query result?', 'Rows, including rows that contain NULL values', 'Only rows with no NULL values anywhere', 'Only the number of columns', 'Only distinct text values', 'COUNT(*) counts rows; unlike COUNT(column), it does not exclude a row because a particular column value is NULL.'],
      ],
    },
  ],
};
