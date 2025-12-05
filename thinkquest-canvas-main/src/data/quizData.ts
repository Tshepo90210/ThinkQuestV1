export const QUIZ = [
  {
    "quiz_title": "Design Thinking 'Project Sunrise' Assessment",
    "scenario_description": "Your design team has been hired to solve a specific problem: High school students are chronically tired and stressed in the mornings, arriving at school feeling defeated before the day begins. Your goal is to use Design Thinking to create a solution that changes how students wake up and start their day.",
    "questions": [
      {
        "id": 1,
        "phase": "Phase 1: Empathize (Understanding the Human)",
        "question": "Your team needs to understand why students hit the snooze button. Which research method will give you the deepest qualitative insight?",
        "options": [
          "a) Creating a Google Form survey asking 'How many times do you hit snooze?' sent to the whole school.",
          "b) Interviewing 5 students and asking them to walk you through their morning routine step-by-step.",
          "c) Researching sleep cycles and circadian rhythms online.",
          "d) Asking the school nurse for data on late arrivals."
        ],
        "correct_answer": "b",
        "rationale": "Design thinking relies on 'Why,' not 'How many.' Surveys give numbers; interviews give stories and emotions, which are necessary for empathy."
      },
      {
        "id": 2,
        "phase": "Phase 1: Empathize (Understanding the Human)",
        "question": "You are interviewing a student named Marcus. You want to know about his phone usage at night. Which of these is a BIASED (leading) question that you should AVOID?",
        "options": [
          "a) 'Walk me through the last hour before you went to sleep.'",
          "b) 'Where do you keep your phone while you sleep?'",
          "c) 'Don't you think using your phone at night is ruining your sleep?'",
          "d) 'How do you feel when you wake up and see notifications?'"
        ],
        "correct_answer": "c",
        "rationale": "Option C imposes your opinion ('ruining your sleep') onto the user. Good research questions are neutral and open-ended."
      },
      {
        "id": 3,
        "phase": "Phase 1: Empathize (Understanding the Human)",
        "question": "Marcus tells you, 'I'm always tired.' You use the '5 Whys' technique to dig deeper. Which sequence represents the correct use of this tool?",
        "options": [
          "a) Ask him 'Why?' five times rapidly to stress him out.",
          "b) Ask 'Why are you tired?' -> 'Why do you stay up late?' -> 'Why are you on your phone?' -> 'Why do you fear missing out?' -> 'Why is social connection your priority?'",
          "c) Ask 'Why?' five times about five different unrelated topics.",
          "d) Ask him 'Why don't you just go to bed earlier?' five times."
        ],
        "correct_answer": "b",
        "rationale": "The 5 Whys technique is about drilling down into a single problem to find the root cause (emotional/belief based) rather than the symptom (tiredness)."
      },
      {
        "id": 4,
        "phase": "Phase 1: Empathize (Understanding the Human)",
        "question": "You observe that students who eat breakfast seem happier. You write down: 'Students who don't eat breakfast are lazy.' What is wrong with this note?",
        "options": [
          "a) It is a fact, not an opinion.",
          "b) It is a judgment/assumption, not an observation.",
          "c) It is too long.",
          "d) It is a good insight."
        ],
        "correct_answer": "b",
        "rationale": "'Lazy' is a judgment. An observation would be 'Student put head on desk.' Empathy requires suspending judgment."
      },
      {
        "id": 5,
        "phase": "Phase 2: Define (Framing the Problem)",
        "question": "You need to write a Problem Statement (Point of View) for Marcus. Which of these follows the correct 'User + Need + Insight' structure?",
        "options": [
          "a) 'We need to invent a vibrating pillow alarm.'",
          "b) 'High schools should start at 10:00 AM so kids can sleep.'",
          "c) 'Marcus needs a way to disconnect from his social life at night without feeling lonely, because his FOMO (Fear Of Missing Out) keeps him awake.'",
          "d) 'Teenagers need more sleep because science says they need 9 hours.'"
        ],
        "correct_answer": "c",
        "rationale": "This is the only option that combines a specific user, a verb (need), and the deep reason why ('Insight'). Option A is a solution, B is a policy, D is a fact."
      },
      {
        "id": 6,
        "phase": "Phase 2: Define (Framing the Problem)",
        "question": "Your teammate suggests this Problem Statement: 'How might we build an app that locks Marcus's phone?' Why is this a WEAK statement?",
        "options": [
          "a) It is too specific.",
          "b) It focuses on the user.",
          "c) It embeds the solution (an app) into the problem, restricting creativity.",
          "d) It is too emotional."
        ],
        "correct_answer": "c",
        "rationale": "If you include 'an app' in the problem statement, you stop yourself from inventing non-app solutions (like a vibrating watch or a smart light)."
      },
      {
        "id": 7,
        "phase": "Phase 2: Define (Framing the Problem)",
        "question": "You have grouped your sticky notes on a wall. You see a cluster of notes about 'Cold floors,' 'Dark rooms,' and 'Annoying buzzers.' You need to name this cluster with an INSIGHT. What is the best name?",
        "options": [
          "a) 'Physical Environment.'",
          "b) 'Bad Things.'",
          "c) 'The environment of the bedroom feels hostile in the morning.'",
          "d) 'Room Temperature.'"
        ],
        "correct_answer": "c",
        "rationale": "Insights interpret the data. Options A and B are just categories (labels). Option C explains the meaning of the data (the hostility of the environment)."
      },
      {
        "id": 8,
        "phase": "Phase 2: Define (Framing the Problem)",
        "question": "Why do we create a 'Persona' (like Marcus) instead of designing for 'All Teenagers'?",
        "options": [
          "a) Because it is easier to draw one person.",
          "b) Because if you design for everyone, you design for no one. Specificity creates better solutions.",
          "c) Because we only have budget for one user.",
          "d) Because Marcus is a real person."
        ],
        "correct_answer": "b",
        "rationale": "This is a core design paradox: designing for one specific person often creates a better solution for many than designing a generic solution for 'everyone.'"
      },
      {
        "id": 9,
        "phase": "Phase 3: Ideate (Generating Solutions)",
        "question": "You are ready to brainstorm. You want to turn your Problem Statement into a 'How Might We' (HMW) question. Which represents the 'Goldilocks Zone' (not too broad, not too narrow)?",
        "options": [
          "a) 'HMW fix mornings?' (Too Broad)",
          "b) 'HMW make the alarm button blue?' (Too Narrow)",
          "c) 'HMW make the transition from sleep to wakefulness feel like an accomplishment?' (Just Right)",
          "d) 'HMW force Marcus to wake up?' (Too Aggressive)"
        ],
        "correct_answer": "c",
        "rationale": "Option C allows for many types of solutions (lights, sounds, games, smells) without being too broad to solve."
      },
      {
        "id": 10,
        "phase": "Phase 3: Ideate (Generating Solutions)",
        "question": "During brainstorming, a teammate suggests: 'Let's make a bed that ejects the student out the window!' What is the Design Thinking response?",
        "options": [
          "a) 'That is dangerous and illegal. No.'",
          "b) 'Yes, and... maybe it could gently slide them onto the floor instead.'",
          "c) 'Let's stay realistic, please.'",
          "d) 'Write that down on the 'Bad Ideas' list.'"
        ],
        "correct_answer": "b",
        "rationale": "In brainstorming, you never say 'No.' You build on ideas. A bed that ejects you is dangerous, but it might lead to an idea about a bed that slowly raises the mattress to sit you up."
      },
      {
        "id": 11,
        "phase": "Phase 3: Ideate (Generating Solutions)",
        "question": "You have 50 ideas on the board. You need to narrow them down (Converge). Which method should you use?",
        "options": [
          "a) Rock-Paper-Scissors.",
          "b) The loudest person decides.",
          "c) Dot Voting (Heat mapping) to see where the team's energy is.",
          "d) Choose the cheapest one."
        ],
        "correct_answer": "c",
        "rationale": "This is a democratic, visual way to see where the team's collective enthusiasm lies, acting as a heat map for the best ideas."
      },
      {
        "id": 12,
        "phase": "Phase 3: Ideate (Generating Solutions)",
        "question": "One of your ideas is a 'Breakfast Drone.' You want to use the SCAMPER technique to improve it. You choose 'S' (Substitute). What does that look like?",
        "options": [
          "a) Substitute the drone for a rolling robot dog that brings toast.",
          "b) Combine the drone with the alarm clock.",
          "c) Eliminate the breakfast.",
          "d) Reverse the drone so it flies backward."
        ],
        "correct_answer": "a",
        "rationale": "SCAMPER stands for Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse. Replacing the drone with a robot dog is a substitution."
      },
      {
        "id": 13,
        "phase": "Phase 4: Prototype (Building to Think)",
        "question": "The team wants to prototype an app that pairs students with 'Morning Buddies.' What is the best LOW-FIDELITY way to start?",
        "options": [
          "a) Hire a coder to build the beta version.",
          "b) Spend 3 weeks on Photoshop designing the logo.",
          "c) Sketch the 5 main screens on index cards and have a student tap through them.",
          "d) 3D print a phone case for the app."
        ],
        "correct_answer": "c",
        "rationale": "Low fidelity is about speed. Code and Photoshop take too long for the first test."
      },
      {
        "id": 14,
        "phase": "Phase 4: Prototype (Building to Think)",
        "question": "You want to test a 'Smart Mirror' that displays the weather. Instead of building a real smart mirror, you put an iPad behind a piece of one-way glass to fake it. What is this technique called?",
        "options": [
          "a) The Wizard of Oz (Faking the functionality).",
          "b) The Pinocchio Effect.",
          "c) High-Fidelity Coding.",
          "d) Fraud."
        ],
        "correct_answer": "a",
        "rationale": "This technique involves a human (or simple tech) behind the scenes simulating a complex machine to test if the user wants the function before building the code."
      },
      {
        "id": 15,
        "phase": "Phase 4: Prototype (Building to Think)",
        "question": "Why are you building this prototype?",
        "options": [
          "a) To impress the teacher.",
          "b) To have a finished product to sell.",
          "c) To answer a specific question: 'Will students actually engage with this feature?'",
          "d) To patent the idea."
        ],
        "correct_answer": "c",
        "rationale": "We do not build to sell or impress; in Design Thinking, we build to learn. The prototype is a question made physical."
      },
      {
        "id": 16,
        "phase": "Phase 4: Prototype (Building to Think)",
        "question": "Your prototype fails immediately—the paper rips and the user is confused. Is this a failure?",
        "options": [
          "a) Yes, you should get an F.",
          "b) No, this is 'Failing Fast.' You saved months of work by learning this now on paper.",
          "c) Yes, you should have used better paper.",
          "d) No, the user just used it wrong."
        ],
        "correct_answer": "b",
        "rationale": "A failure in the prototype phase is a success for the process. It saves money and time."
      },
      {
        "id": 17,
        "phase": "Phase 5: Test (Validating and Iterating)",
        "question": "You are handing your 'Morning Buddy App' paper prototype to Marcus to test. What do you say?",
        "options": [
          "a) 'This is a buddy app. Click here to find a friend.'",
          "b) 'We worked really hard on this, so please be nice.'",
          "c) 'Please use this app to find a wake-up partner. Please think out loud as you go.'",
          "d) 'Do you like it?'"
        ],
        "correct_answer": "c",
        "rationale": "You set the scene ('find a partner') and ask for 'Think Aloud,' but you do not explain how to use the UI (Option A) or bias them by asking for kindness (Option B)."
      },
      {
        "id": 18,
        "phase": "Phase 5: Test (Validating and Iterating)",
        "question": "Marcus looks at the 'Connect' button and frowns. He pauses for a long time. What do you do?",
        "options": [
          "a) Explain, 'That's the connect button, go ahead and press it.'",
          "b) Stay silent and observe his struggle. Later, ask 'What was confusing there?'",
          "c) Apologize for the bad drawing.",
          "d) Take the prototype back and fix it immediately."
        ],
        "correct_answer": "b",
        "rationale": "If you explain how to use it, you ruin the test. You need to see if the design explains itself."
      },
      {
        "id": 19,
        "phase": "Phase 5: Test (Validating and Iterating)",
        "question": "Marcus says, 'I would never use this. I don't want to talk to people in the morning. I hate people in the morning.' What does this mean for your project?",
        "options": [
          "a) The project is over.",
          "b) You need to force him to like it.",
          "c) You have uncovered a critical insight. You must pivot back to the Ideate or Define phase (maybe he needs a non-social motivator).",
          "d) Marcus is just grumpy."
        ],
        "correct_answer": "c",
        "rationale": "Design Thinking is non-linear. If the premise is wrong (he hates people in the morning), you must go back and change the solution to fit the user's reality."
      },
      {
        "id": 20,
        "phase": "Phase 5: Test (Validating and Iterating)",
        "question": "You finished the test. You have a grid with four quadrants: '+' (Likes), ' ' (Wishes), '?' (Questions), and '' (Ideas). What is this tool called?",
        "options": [
          "a) The Feedback Capture Grid.",
          "b) The Final Exam.",
          "c) The SWOT Analysis.",
          "d) The Scorecard."
        ],
        "correct_answer": "a",
        "rationale": "This is the standard tool for organizing user testing feedback into actionable categories."
      }
    ]
  }
];