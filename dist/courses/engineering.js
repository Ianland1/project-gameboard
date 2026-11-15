// Engineering course cards: question, answer, three distractors, explanation.
export default {
  elementary: [
    {
      id: 'design', label: 'Design & Testing', cards: [
        ['Before designing a new lunch box, what should you find out first?', 'What the lunch box needs to do', 'Which sticker looks coolest', 'What name to give the finished box', 'How many boxes to throw away', 'Start by understanding the problem and what the people using the lunch box need.'],
        ['How can a sketch help you design a toy car?', 'It shows your idea before you build it', 'It makes testing unnecessary', 'It guarantees the car will win a race', 'It measures the car’s speed by itself', 'A sketch helps you plan the parts and share your idea with other people.'],
        ['You compare two paper airplanes. What makes the distance test fairer?', 'Launch both from the same place in the same way', 'Throw one indoors and the other outdoors', 'Change the launch point every time', 'Measure only the airplane you like better', 'Using the same test conditions helps you compare the airplane designs.'],
        ['You add identical blocks to a model bridge until it bends. What are you testing?', 'How much weight the bridge can support', 'How brightly the bridge reflects light', 'How loud the blocks sound', 'How quickly the bridge changes color', 'Adding equal blocks lets you compare the weight different bridge designs can support.'],
        ['A toy boat tips over during a test. What should a designer do next?', 'Use the test result to improve the design', 'Pretend the boat did not tip', 'Stop recording what happened', 'Assume a new color will fix every problem', 'A test can reveal a problem that guides the next design change.'],
        ['What is a useful way to keep the results of several ramp tests?', 'Write the measurements in a table', 'Try to remember only the best result', 'Erase the results after each test', 'Record only the ramp’s color', 'A results table makes measurements easier to compare later.'],
      ],
    },
    {
      id: 'simple-machines', label: 'Simple Machines', cards: [
        ['A seesaw turns around a support in the middle. Which simple machine is it?', 'Lever', 'Screw', 'Wedge', 'Pulley', 'A lever is a bar that turns around a support called a fulcrum.'],
        ['Which simple machine helps raise a flag with a rope over a wheel?', 'Pulley', 'Wedge', 'Screw', 'Inclined plane', 'A pulley guides a rope around a wheel and can change the direction of a pull.'],
        ['A round doorknob turns a smaller shaft. Which simple machine does this show?', 'Wheel and axle', 'Wedge', 'Inclined plane', 'Pulley', 'The larger wheel turns together with a smaller axle or shaft.'],
        ['Which simple machine has a spiral thread wrapped around a shaft?', 'Screw', 'Lever', 'Pulley', 'Wedge', 'The spiral thread of a screw is like an inclined plane wrapped around a cylinder.'],
        ['A doorstop has a sloping shape that fits under a door. Which simple machine is it?', 'Wedge', 'Pulley', 'Wheel and axle', 'Screw', 'A wedge has sloping surfaces and can hold objects in place or push them apart.'],
        ['You push a cart up a long ramp instead of lifting it straight up. What does the ramp usually reduce?', 'The force needed, by spreading the lift over a longer distance', 'The height of the destination', 'The weight of the cart itself', 'The number of wheels on the cart', 'An inclined plane trades a longer travel distance for a smaller lifting force, ignoring friction.'],
      ],
    },
    {
      id: 'structures', label: 'Structures', cards: [
        ['In a model bridge test, what is the load?', 'The weight the bridge is supporting', 'Only the bridge’s paint', 'The bridge’s name', 'The color of the test table', 'A load is a force or weight that a structure must support.'],
        ['Which building part is usually a vertical support?', 'Column', 'Roof tile', 'Window pane', 'Floor mat', 'A column is a vertical member that carries loads down toward the foundation.'],
        ['Which building part is often a horizontal support over an opening?', 'Beam', 'Curtain', 'Paint layer', 'Door handle', 'A beam spans between supports and carries loads across a space.'],
        ['A square frame wobbles sideways. What added part can help keep its shape?', 'A diagonal brace', 'A paper label', 'A loose ribbon', 'A coat of paint', 'A diagonal brace creates triangles that help resist sideways changes in shape.'],
        ['Why does a building need a foundation?', 'To transfer its loads to the ground', 'To stop every possible earthquake', 'To make its rooms warmer by itself', 'To remove all the building’s weight', 'A foundation supports a building and transfers its loads into the ground.'],
        ['A flat strip of paper bends easily. Which change can help it support more weight as a beam?', 'Fold it into an accordion shape', 'Write its name on it', 'Change only its color', 'Make it wet', 'Folding changes the paper’s shape and can increase its resistance to bending.'],
      ],
    },
  ],
  middle: [
    {
      id: 'design', label: 'Engineering Design', cards: [
        ['A water filter must remove visible dirt. In the design process, that required performance is called what?', 'A design criterion', 'A decorative feature', 'A material name', 'A drawing scale', 'A criterion describes something a successful design should achieve.'],
        ['A team can spend no more than $20 on a model. What does this limit represent?', 'A cost constraint', 'A test result', 'A final prototype', 'A performance measurement', 'A constraint limits the resources or conditions within which a design must work.'],
        ['To compare two bridge shapes fairly, what should you keep the same?', 'The material and amount of material used', 'Only the names of the bridges', 'Nothing about the test', 'Only the colors of the labels', 'Keeping material and quantity the same helps isolate the effect of the bridge shape.'],
        ['A stronger design is also heavier. What does choosing between these features involve?', 'A trade-off', 'A guaranteed improvement in every way', 'An arithmetic error', 'A change of measurement units', 'A trade-off balances competing design goals, such as strength and low weight.'],
        ['How can a digital 3D model help before a part is manufactured?', 'It lets the team inspect and revise the part’s shape', 'It proves the real part can never fail', 'It automatically removes all production costs', 'It makes physical dimensions unnecessary', 'A digital model can reveal fit or shape issues before material is used to make the part.'],
        ['What is the purpose of a design decision matrix?', 'To compare options using the same criteria', 'To hide the reasons for a choice', 'To replace every physical test', 'To choose only the most colorful idea', 'A decision matrix organizes how different designs perform against common criteria.'],
      ],
    },
    {
      id: 'mechanics', label: 'Mechanics', cards: [
        ['A 10 N force acts perpendicular to a wrench, 0.2 m from its pivot. What is the torque?', '2 N·m', '50 N·m', '10.2 N·m', '0.02 N·m', 'For a perpendicular force, torque equals force times distance: 10 × 0.2 = 2 N·m.'],
        ['What unit is commonly used for mechanical work?', 'Joule', 'Ampere', 'Volt', 'Ohm', 'Mechanical work is measured in joules; one joule equals one newton-meter.'],
        ['Why does a longer handle help you turn a tight nut?', 'It gives the force a longer lever arm', 'It makes the nut weigh less', 'It removes the pivot point', 'It makes friction always equal zero', 'For the same force, a longer perpendicular lever arm produces more torque.'],
        ['When a block slides across a table, which way does sliding friction act on the block?', 'Opposite its sliding motion relative to the table', 'Always straight upward', 'Always in the same direction as its sliding motion', 'Only toward the nearest table edge', 'Sliding friction opposes the relative sliding motion between the contacting surfaces.'],
        ['A 20-tooth gear drives a 40-tooth gear. How fast does the 40-tooth gear turn compared with the driver?', 'Half as fast', 'Twice as fast', 'At the same speed', 'Four times as fast', 'The driven gear has twice as many teeth, so it makes half as many turns in the same time.'],
        ['Two equal forces pull an object in opposite directions along the same line. What is their net force?', 'Zero', 'Twice either force in one direction', 'Always upward', 'Equal to the object’s speed', 'Equal, opposite forces along the same line cancel when calculating net force.'],
      ],
    },
    {
      id: 'circuits', label: 'Circuits', cards: [
        ['In a simple series circuit with two bulbs, how does the current through the bulbs compare?', 'The same current passes through both', 'The first bulb always receives twice the current', 'The second bulb receives no current', 'Current flows through only one bulb at a time', 'A series circuit has one path, so the same current passes through each component.'],
        ['Two bulbs are in separate parallel branches across a battery. One branch is disconnected. What happens to the other branch?', 'It can still carry current', 'It must also become disconnected', 'Its wires turn into insulators', 'The battery must reverse its polarity', 'Each parallel branch provides its own path across the source.'],
        ['Which material is a good electrical conductor for a wire?', 'Copper', 'Dry rubber', 'Glass', 'Dry plastic', 'Copper lets electric charge move through it easily and is commonly used in wires.'],
        ['What is the main purpose of the plastic coating around a wire?', 'To electrically insulate the conductor', 'To make every circuit use more current', 'To replace the metal conductor', 'To increase the battery voltage automatically', 'An insulating coating helps prevent unintended electrical contact with the conductor.'],
        ['What happens when a switch opens the only conducting path in a simple circuit?', 'The current stops', 'The current always doubles', 'The battery becomes a light bulb', 'The wire loses all its mass', 'An open switch creates a gap in the path, so steady current cannot flow around the circuit.'],
        ['A battery supplying a circuit mainly converts which stored energy into electrical energy?', 'Chemical energy', 'Sound energy', 'Wind energy', 'Elastic energy', 'Chemical reactions in a battery provide electrical energy to the external circuit.'],
      ],
    },
  ],
  high: [
    {
      id: 'mechanical', label: 'Mechanical', cards: [
        ['A shaft turns at 120 revolutions per minute. How many revolutions does it make per second?', '2', '60', '120', '7,200', 'Divide revolutions per minute by 60: 120 ÷ 60 = 2 revolutions per second.'],
        ['A motor does 600 J of work in 3 s. What is its average mechanical power?', '200 W', '1,800 W', '603 W', '0.005 W', 'Average power equals work divided by time: 600 ÷ 3 = 200 W.'],
        ['A 100 N force acts uniformly on an area of 0.02 m². What pressure does it produce?', '5,000 Pa', '2 Pa', '50 Pa', '200 Pa', 'Pressure equals force divided by area: 100 ÷ 0.02 = 5,000 Pa.'],
        ['An ideal lever has a 0.6 m effort arm and a 0.2 m load arm. What is its mechanical advantage?', '3', '0.33', '0.12', '0.8', 'Ideal mechanical advantage is effort-arm length divided by load-arm length: 0.6 ÷ 0.2 = 3.'],
        ['A 12-tooth gear rotating at 600 rpm drives a 36-tooth gear. What is the driven speed?', '200 rpm', '1,800 rpm', '600 rpm', '50 rpm', 'Gear speed is inversely proportional to tooth count: 600 × 12/36 = 200 rpm.'],
        ['What is a main purpose of a bearing around a rotating shaft?', 'To support rotation while reducing friction', 'To guarantee the shaft never needs inspection', 'To increase the shaft’s mass without limit', 'To stop all possible shaft motion', 'A bearing supports a shaft and allows controlled relative motion with reduced friction.'],
      ],
    },
    {
      id: 'electrical', label: 'Electrical', cards: [
        ['A 12 V supply is connected across a 4 Ω resistor. What current flows?', '3 A', '48 A', '0.33 A', '16 A', 'Ohm’s law gives current I = V/R = 12/4 = 3 A.'],
        ['A device draws 2 A from a 12 V supply. What electrical power does it use?', '24 W', '6 W', '14 W', '144 W', 'Electrical power equals voltage times current: 12 × 2 = 24 W.'],
        ['What is the equivalent resistance of two 6 Ω resistors connected in parallel?', '3 Ω', '12 Ω', '6 Ω', '36 Ω', 'For two equal resistors in parallel, the equivalent resistance is half either resistance.'],
        ['What is an electrical fuse designed to do when excessive current flows?', 'Open the circuit by melting its fuse element', 'Increase current without limit', 'Store the excess current forever', 'Make the supply voltage always zero', 'A fuse interrupts excessive current by melting a calibrated conducting element.'],
        ['Why does the connection direction of a basic LED matter?', 'An LED normally conducts and lights in its forward direction', 'An LED has no electrical terminals', 'An LED only works with mechanical force', 'An LED always lights equally in either direction', 'An LED is a diode; correct polarity allows forward current and light emission.'],
        ['Which description best matches steady direct current?', 'Current that keeps the same direction', 'Current that must reverse every second', 'Current that can flow only through air', 'Current with no moving electric charge', 'Direct current flows in one direction, while alternating current periodically reverses direction.'],
      ],
    },
    {
      id: 'civil', label: 'Civil & Structures', cards: [
        ['A straight column carries a centered downward load. What type of axial loading is it mainly under?', 'Compression', 'Tension', 'Pure torsion', 'No loading', 'A centered load pushing along a column’s axis produces compression.'],
        ['Why can a diagonal brace stiffen a rectangular frame?', 'It divides the frame into rigid triangular shapes', 'It removes all weight from the frame', 'It makes every joint flexible', 'It prevents the material from having any stress', 'Triangular bracing resists changes of shape that an unbraced rectangular frame can undergo.'],
        ['A site drawing uses a 1:200 scale. A line is 5 cm long on the drawing. What real length does it represent?', '10 m', '1 m', '40 m', '100 m', 'The real length is 5 × 200 = 1,000 cm, which equals 10 m.'],
        ['A uniform axial force of 1,000 N acts on a 0.01 m² cross section. What is the average normal stress?', '100,000 Pa', '10 Pa', '1,000 Pa', '0.00001 Pa', 'Average normal stress equals force divided by area: 1,000 ÷ 0.01 = 100,000 Pa.'],
        ['Why might a foundation use a wider footing under the same load?', 'To reduce average pressure on the supporting soil', 'To make the building’s weight disappear', 'To eliminate the need to know the soil conditions', 'To increase average soil pressure', 'Spreading the same load over a larger area lowers its average pressure on the soil.'],
        ['What is a main purpose of drainage around a building?', 'To direct water away from areas where it could cause damage', 'To increase water pressure against every wall', 'To replace the building’s supports', 'To remove the need for a roof', 'Drainage routes water away to help manage moisture and reduce water-related damage.'],
      ],
    },
    {
      id: 'computing', label: 'Computing', cards: [
        ['When does a Boolean AND operation return true?', 'When both inputs are true', 'When both inputs are false', 'Whenever the inputs differ', 'Whenever either input is false', 'AND is true only if all of its inputs are true.'],
        ['What is a variable used for in a program?', 'To store a value that the program can use', 'To guarantee the program has no errors', 'To replace the computer’s power source', 'To make all instructions execute at once', 'A variable gives a stored value a name so the program can refer to it.'],
        ['Which programming structure is designed to repeat instructions?', 'Loop', 'Comment', 'File name', 'Single constant', 'A loop runs a block of instructions repeatedly according to a condition or count.'],
        ['What decimal number does the binary number 101 represent?', '5', '3', '10', '101', 'The binary place values are 4, 2, and 1, so 101 equals 4 + 0 + 1 = 5.'],
        ['In a temperature-controlled system, what is the temperature sensor mainly providing?', 'An input measurement', 'The mechanical support frame', 'The final report’s title', 'The electrical fuse rating', 'A sensor provides information about the physical system for the controller to use.'],
        ['What is an algorithm?', 'A defined sequence of steps for solving a problem', 'Any computer screen color', 'A device that stores electrical charge', 'A guarantee that a program is fast', 'An algorithm describes the steps used to carry out a task or solve a problem.'],
      ],
    },
  ],
  college: [
    {
      id: 'mechanical', label: 'Mechanical', cards: [
        ['A rod carries an axial load of 1,200 N over a 400 mm² section. What is its average normal stress?', '3 MPa', '300 MPa', '0.003 MPa', '480 MPa', 'Stress is 1,200/400 = 3 N/mm², and 1 N/mm² equals 1 MPa.'],
        ['A shaft transmits 120 N·m of torque at 2 rad/s. What mechanical power does it transmit?', '240 W', '60 W', '122 W', '14,400 W', 'For rotational motion, power P = torque × angular speed = 120 × 2 = 240 W.'],
        ['A linear spring has stiffness 200 N/m and is stretched 0.1 m from its unstretched length. How much energy is stored?', '1 J', '20 J', '2 J', '10 J', 'Spring energy is ½kx² = ½ × 200 × 0.1² = 1 J.'],
        ['In linear thermal expansion, ΔL = αLΔT. What units must α have if temperature change is measured in kelvins?', 'K⁻¹', 'm/K', 'K/m', 'm²', 'The coefficient α must have units of inverse temperature so αLΔT has units of length.'],
        ['For steady incompressible flow through a pipe, what happens to average speed when the cross-sectional area is halved?', 'It doubles', 'It halves', 'It stays the same', 'It becomes zero', 'Continuity requires volume flow rate Q = Av to remain constant, so halving A doubles v.'],
        ['What are the units of the Reynolds number?', 'It is dimensionless', 'Meters per second', 'Pascals', 'Newtons', 'Reynolds number is a ratio of inertial to viscous effects, and its units cancel.'],
      ],
    },
    {
      id: 'electrical', label: 'Electrical', cards: [
        ['What does Kirchhoff’s current law state for an electrical node?', 'Total current entering equals total current leaving', 'Every connected resistor has the same resistance', 'All node voltages must be zero', 'Current is consumed inside the node', 'Conservation of charge requires the algebraic sum of currents at a node to be zero.'],
        ['A first-order RC circuit has R = 10 kΩ and C = 100 µF. What is its time constant?', '1 s', '0.01 s', '100 s', '1,000 s', 'The time constant is RC = 10,000 × 0.0001 = 1 second.'],
        ['After a capacitor is fully charged in an ideal steady DC circuit, how does it behave?', 'As an open circuit to steady current', 'As a zero-resistance wire', 'As a current source of unlimited size', 'As a resistor whose value is always 1 Ω', 'An ideal capacitor carries current when its voltage changes; at steady DC its current is zero.'],
        ['An ideal op-amp is configured as a voltage follower and operates in its linear range. What is its closed-loop voltage gain?', '1', '0', '−1', 'Infinite', 'A voltage follower uses negative feedback so its output voltage follows its input voltage.'],
        ['Two equal resistors form an unloaded divider across a 10 V source. What is the voltage across either resistor?', '5 V', '10 V', '20 V', '0 V', 'Equal resistances in series divide the source voltage equally when the divider is unloaded.'],
        ['A sinusoidal voltage has a peak value of 10√2 V. What is its RMS value?', '10 V', '20 V', '5 V', '10√2 V', 'For a sine wave, RMS voltage equals peak voltage divided by √2.'],
      ],
    },
    {
      id: 'civil', label: 'Civil & Structures', cards: [
        ['A simply supported beam carries a 10 kN point load at midspan and has negligible self-weight. What is the vertical reaction at each support?', '5 kN', '10 kN', '20 kN', '2.5 kN', 'Symmetry gives equal reactions, and vertical force balance makes their sum 10 kN.'],
        ['A material in its linear elastic range has E = 200 GPa and axial strain 0.001. What is its normal stress?', '200 MPa', '0.2 MPa', '2,000 MPa', '200 GPa', 'Using σ = Eε gives 200 GPa × 0.001 = 0.2 GPa = 200 MPa.'],
        ['In foundation engineering, what is settlement?', 'Downward movement caused by deformation of supporting ground', 'The total number of rooms in a building', 'The width of a reinforcement bar', 'A measure of the paint’s brightness', 'Settlement is movement of a foundation or structure as its supporting ground deforms.'],
        ['Why is steel reinforcement commonly placed in concrete where tension is expected?', 'Steel provides tensile resistance that concrete alone lacks', 'Steel removes all compression from the concrete', 'Steel makes gravity act upward', 'Steel prevents every possible crack under every load', 'Concrete is relatively weak in tension, so reinforcement helps carry tensile forces.'],
        ['What are the SI units of the second moment of area used in beam bending calculations?', 'm⁴', 'm²', 'm³', 'kg·m²', 'The second moment of area integrates squared distance over an area, giving length to the fourth power.'],
        ['A triangular distributed load rises from zero to 4 kN/m over 6 m. What is the magnitude of its resultant force?', '12 kN', '24 kN', '4 kN', '1.5 kN', 'The resultant equals the area under the load diagram: ½ × 6 × 4 = 12 kN.'],
      ],
    },
    {
      id: 'computing', label: 'Computing', cards: [
        ['Which listed bound most tightly describes the worst-case time complexity of binary search on a sorted array of n items?', 'O(log n)', 'O(n²)', 'O(n!)', 'O(n² log n)', 'Each comparison roughly halves the remaining search range, producing logarithmic growth.'],
        ['Which removal order defines a stack data structure?', 'Last in, first out', 'First in, first out', 'Smallest value first', 'A uniformly random item first', 'A stack removes the most recently added item first.'],
        ['In a zero-indexed array, which index identifies the third element?', '2', '3', '1', '0', 'The first element has index 0, so the third element has index 2.'],
        ['Which SQL statement is used to retrieve rows from a database table?', 'SELECT', 'DELETE', 'DROP', 'INSERT', 'SELECT queries data; DELETE removes rows, DROP removes objects, and INSERT adds rows.'],
        ['What is a race condition in concurrent software?', 'An outcome that depends on the timing of accesses to shared state', 'Any program that runs in less than one second', 'A loop that has exactly ten iterations', 'A file whose name contains a number', 'Unsynchronized operations on shared state can produce different results depending on their interleaving.'],
        ['Which description matches a pure function?', 'It returns the same result for the same inputs and has no side effects', 'It must change a global variable every time it runs', 'It always reads the current time', 'It cannot accept any inputs', 'A pure function depends only on its inputs and does not change state outside itself.'],
      ],
    },
  ],
};
