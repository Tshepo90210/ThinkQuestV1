// mockData.ts
import { Problem, Persona } from '@/store/useThinkQuestStore';

export const problems: Problem[] = [
  {
    id: 1,
    title: "Reduce Load Shedding's Impact on School Learning",
    context: "As Eskom continues with Stage 2-4 load shedding in 2025, schools across SA—from Johannesburg's urban hubs to rural Limpopo villages—face disrupted lessons, with no power for lights, computers, or fans during hot summers. In quintile 1 schools, generators are rare due to budget cuts, leading to canceled classes and learners falling behind in STEM subjects. The 2025 Basic Education Amendment Bill aims to address infrastructure, but immediate solutions are needed to keep education flowing.",
    keyChallenges: [
      "Frequent blackouts (up to 8 hours daily) halting online learning and homework.",
      "Health risks from studying in dark, hot classrooms, worsening absenteeism.",
      "Digital divide: Wealthier schools have solar backups, while poorer ones rely on candles."
    ],
    category: "High School",
    difficulty: "Fun & Easy"
  },
  {
    id: 2,
    title: "Address Water Shortages in School Facilities",
    context: "Ongoing droughts and infrastructure failures in provinces like the Eastern Cape and Western Cape leave schools without running water for days, forcing learners to share buckets or go home early. In 2025, with climate change worsening, quintile 1-3 schools in townships like Khayelitsha face hygiene issues, increasing absenteeism from illnesses. Government initiatives like the 2025 Water Infrastructure Fund aim to install boreholes, but creative, low-cost solutions are urgent for clean toilets and drinking water.",
    keyChallenges: [
      "Health risks from poor sanitation, leading to outbreaks like cholera in affected areas.",
      "Gender impacts: Girls miss school during periods due to no water for hygiene.",
      "Resource strain: Teachers buy bottled water, stretching tight budgets."
    ],
    category: "High School",
    difficulty: "Fun & Easy"
  },
  {
    id: 3,
    title: "Improve Safety During School Commutes",
    context: "With rising crime rates in 2025 (e.g., Gauteng's taxi violence and muggings in Cape Flats), learners face dangers walking or using minibus taxis to school. Rural kids in Mpumalanga trek long distances on unsafe roads, while urban ones deal with overcrowded transport. The government's Safe Schools Programme has added patrols, but community-driven ideas are needed to reduce assaults and accidents.",
    keyChallenges: [
      "High crime in townships, with 20% of learners reporting theft or harassment.",
      "Transport costs eating into family budgets, leading to skipped school days.",
      "Weather extremes (floods, heat) making walks riskier in rural areas."
    ],
    category: "High School",
    difficulty: "Fun & Easy"
  },
  {
    id: 4,
    title: "Bridge Language Barriers in Multilingual Classes",
    context: "SA's 12 official languages create confusion in classrooms, with English-medium teaching leaving non-native speakers behind, especially in diverse urban schools like those in Johannesburg. In 2025, post-COVID learning gaps widen this issue, and rural areas lack isiZulu or Setswana materials. The DBE's multilingual policy pushes for mother-tongue education, but tools are scarce.",
    keyChallenges: [
      "60% of learners struggle with English proficiency, affecting exam performance.",
      "Teacher shortages in indigenous languages, leading to code-switching chaos.",
      "Digital tools unavailable in low-resource schools."
    ],
    category: "High School",
    difficulty: "Fun & Easy"
  },
  {
    id: 5,
    title: "Tackle Youth Unemployment Through School Skills Programs",
    context: "With youth unemployment at 45% in 2025, SA schools fail to prepare learners for jobs, focusing on academics over vocational skills like coding or entrepreneurship. In areas like the Free State, limited apprenticeships leave matrics jobless. Government’s Youth Employment Service (YES) aims to bridge this, but schools need better integration.",
    keyChallenges: [
      "Mismatch between curriculum and job market needs (e.g., no digital skills training).",
      "High dropout rates due to economic pressures on families.",
      "Limited career guidance in under-resourced schools."
    ],
    category: "High School",
    difficulty: "Fun & Easy"
  },
  {
    id: 6,
    title: "Combat Bullying in Diverse School Environments",
    context: "Bullying spikes in SA schools due to cultural, racial, and economic differences, with 2025 reports showing 30% of learners affected in mixed urban schools. Cyberbullying via WhatsApp adds to mental health issues, and rural schools lack support programs. The DBE's anti-bullying campaigns need grassroots ideas.",
    keyChallenges: [
      "Racial tensions in formerly segregated schools.",
      "Mental health stigma preventing reporting.",
      "Limited counselor access in poor areas."
    ],
    category: "High School",
    difficulty: "Fun & Easy"
  },
  {
    id: 7,
    title: "Enhance Mental Health Support in Schools",
    context: "Post-COVID mental health crises persist in 2025, with SA learners facing anxiety from exam pressure, family poverty, and violence. Schools in provinces like the Western Cape have one counselor per 500 kids, and stigma in cultural communities prevents help-seeking. The 2025 Mental Health Framework calls for better resources.",
    keyChallenges: [
      "High suicide rates among youth (top global).",
      "Limited access to therapy in rural areas.",
      "Integration with curriculum without overload."
    ],
    category: "High School",
    difficulty: "Fun & Easy"
  },
  {
    id: 8,
    title: "Promote Inclusive Education for Disabled Learners",
    context: "Despite SA's inclusive policies, 2025 data shows disabled learners (e.g., with hearing or mobility issues) in mainstream schools lack ramps, sign language teachers, or braille materials. In rural areas, transport is a barrier, and stigma persists. The DBE's 2025 Inclusion Drive needs practical designs.",
    keyChallenges: [
      "70% of disabled kids out of school due to access issues.",
      "Teacher training gaps in special needs.",
      "Budget cuts limiting assistive tech."
    ],
    category: "High School",
    difficulty: "Fun & Easy"
  }
];

export const personasByProblem: { [problemId: number]: Persona[] } = {
  1: [
    {
      id: 1,
      name: "Lerato",
      role: "Rural Learner",
      avatar: "@/assets/stressed female.png",
      backstory: "Lerato is a 16-year-old Grade 11 girl from a rural village in Limpopo, where load shedding hits up to 8 hours daily, forcing her to study by candlelight or her phone's torch, which drains her limited data bundle. With Eskom's Stage 2-4 outages persisting in 2025, she often misses online homework submissions, and the heat from no fans makes focusing impossible, leading to headaches and lower marks. Her family can't afford solar lights, so she shares a single torch with siblings, dreaming of a future in nursing but worried power issues will derail her matric.",
      keyTraits: {
        age: 16,
        gender: "female",
        language: "Sotho-speaking",
        location: "Rural Limpopo, quintile 1 school",
        motivations: "Wants reliable study time to pass exams; frustrated by health impacts like eye strain."
      },
      samplePrompts: [
        "How does load shedding affect your homework?",
        "What solutions could help?"
      ]
    },
    {
      id: 2,
      name: "Mr. Dlamini",
      role: "Overworked Teacher",
      avatar: "@/assets/stressed male.png",
      backstory: "Mr. Dlamini, a 45-year-old Zulu educator from a KwaZulu-Natal township school, has taught for 20 years but now loses hours to blackouts, scrambling to adapt lessons without projectors or computers. In 2025, with teacher shortages worsening, he handles oversized classes of 50+ learners, and power cuts mean no aircon in sweltering heat, causing fatigue for everyone. He's seen dropout rates rise as kids lose motivation, and his own health suffers from stress, pushing him toward early retirement despite his passion for history.",
      keyTraits: {
        age: 45,
        gender: "male",
        language: "Zulu",
        location: "Urban KwaZulu-Natal, quintile 3 school",
        motivations: "Seeks efficient teaching tools; concerned about learner equity."
      },
      samplePrompts: [
        "How do outages disrupt classes?",
        "What backups work?"
      ]
    },
    {
      id: 3,
      name: "Tshepo",
      role: "Urban Tech User",
      avatar: "@/assets/stressed male.png",
      backstory: "Tshepo, a 15-year-old Grade 10 boy from Gauteng's East Rand, relies on his laptop for coding clubs but faces constant interruptions from load shedding, which kills his WiFi and battery. In 2025, with urban schools better equipped but still vulnerable, he misses virtual tutoring sessions, widening the gap with wealthier peers who have home inverters. Coming from a single-parent home, he juggles part-time jobs, and power cuts add to his anxiety about falling behind in tech subjects.",
      keyTraits: {
        age: 15,
        gender: "male",
        language: "English",
        location: "Urban Gauteng, quintile 4 school",
        motivations: "Aspires to IT career; frustrated by digital divide."
      },
      samplePrompts: [
        "How does it affect your tech use?",
        "Ideas for coping?"
      ]
    },
    {
      id: 4,
      name: "Aisha",
      role: "Health-Affected Student",
      avatar: "@/assets/stressed female.png",
      backstory: "Aisha, a 14-year-old Grade 9 Muslim girl from Cape Town's Cape Flats, suffers migraines from studying in hot, dark classrooms during load shedding, which exacerbates her family's economic stress. In 2025, with Western Cape's frequent outages, she avoids school on bad days, missing key lessons and social time. Her dream of becoming a doctor feels distant as health impacts pile up, and cultural stigma around mental health makes it hard to seek help.",
      keyTraits: {
        age: 14,
        gender: "female",
        language: "English/Afrikaans",
        location: "Urban Western Cape, quintile 2 school",
        motivations: "Wants better health support; concerned about absenteeism."
      },
      samplePrompts: [
        "How does it affect your health?",
        "What could improve it?"
      ]
    }
  ],
  2: [
    {
      id: 5,
      name: "Naledi",
      role: "Hygiene-Concerned Learner",
      avatar: "@/assets/stressed female.png",
      backstory: "Naledi, a 15-year-old Grade 9 Xhosa girl from an Eastern Cape rural school, faces daily hygiene struggles as droughts leave taps dry, forcing her to skip drinks to avoid dirty toilets. In 2025, with climate change intensifying water crises, her school relies on communal buckets, leading to illnesses like stomach bugs that keep her home for days. From a farming family hit by low rainfall, she worries about her younger siblings' health and dreams of engineering solutions but feels powerless without resources.",
      keyTraits: {
        age: 15,
        gender: "female",
        language: "Xhosa",
        location: "Rural Eastern Cape, quintile 1 school",
        motivations: "Prioritizes clean facilities; frustrated by disease risks."
      },
      samplePrompts: [
        "How does shortage affect hygiene?",
        "Ideas for fixes?"
      ]
    },
    {
      id: 6,
      name: "Siphiwe",
      role: "School Janitor",
      avatar: "@/assets/stressed male.png",
      backstory: "Siphiwe, a 38-year-old worker in a Johannesburg township school, spends hours fetching water from distant taps during shortages, delaying cleaning and exposing kids to unsanitary conditions. In 2025, with urban pipe bursts common, his low wage barely covers family needs, and he sees absenteeism rise from water-related illnesses. As a father, he's motivated to advocate for better infrastructure but lacks support from overstrained school admins.",
      keyTraits: {
        age: 38,
        gender: "male",
        language: "Zulu",
        location: "Urban Gauteng, quintile 2 school",
        motivations: "Wants efficient tools; concerned about community health."
      },
      samplePrompts: [
        "What's frustrating about shortages?",
        "What low-cost solutions?"
      ]
    },
    {
      id: 7,
      name: "Dr. Mthembu",
      role: "Community Health Worker",
      avatar: "@/assets/stressed female.png",
      backstory: "Dr. Mthembu, a 50-year-old public health advocate in Durban, treats water-borne diseases like diarrhea in school kids, linking them to shortages that spike during KZN's humid summers. In 2025, with cholera outbreaks lingering from poor infrastructure, she educates communities but faces budget cuts to programs. Her own child suffered, fueling her passion for preventive measures like boreholes.",
      keyTraits: {
        age: 50,
        gender: "female",
        language: "Zulu",
        location: "Urban KwaZulu-Natal, works with quintile 3 schools",
        motivations: "Focuses on prevention; alarmed by outbreak risks."
      },
      samplePrompts: [
        "How do shortages spread diseases?",
        "What community fixes?"
      ]
    },
    {
      id: 8,
      name: "Kyle",
      role: "Urban Student",
      avatar: "@/assets/stressed male.png",
      backstory: "Kyle, a 16-year-old Grade 11 boy from Cape Town with Coloured heritage, carries water from home during droughts, but it's never enough for sports or hygiene, leading to dehydration and low energy in class. In 2025, with Western Cape's water restrictions, his school's tanks run dry, affecting attendance. As a soccer player, he misses practice, dreaming of sustainable solutions like rainwater harvesting.",
      keyTraits: {
        age: 16,
        gender: "male",
        language: "English/Afrikaans",
        location: "Urban Western Cape, quintile 4 school",
        motivations: "Wants reliable access; frustrated by daily hassles."
      },
      samplePrompts: [
        "How does it affect your day?",
        "Ideas for schools?"
      ]
    }
  ],
  3: [
    {
      id: 9,
      name: "Bongani",
      role: "Taxi Rider",
      avatar: "@/assets/stressed male.png",
      backstory: "Bongani, a 17-year-old Grade 12 boy from Alexandra in Gauteng, takes overcrowded minibus taxis daily, witnessing fights and robberies amid 2025's taxi violence surges. With crime stats showing 30% of commuters affected, he arrives stressed, impacting his focus on matric exams. From a large family reliant on public transport, he walks the last km in the dark, fearing gangs, but can't afford alternatives.",
      keyTraits: {
        age: 17,
        gender: "male",
        language: "Zulu",
        location: "Township Gauteng, quintile 2 school",
        motivations: "Seeks reliable safety; worried about exam prep."
      },
      samplePrompts: [
        "What makes taxis unsafe?",
        "Solutions for commuters?"
      ]
    },
    {
      id: 10,
      name: "Nomvula",
      role: "Long-Walk Learner",
      avatar: "@/assets/stressed female.png",
      backstory: "Nomvula, a 15-year-old Grade 10 Pedi girl from a rural Free State village, walks 7km on unpaved roads, facing harassment and wildlife risks, especially during 2025's flood seasons. With limited scholar transport programs, she leaves home at dawn, arriving tired and sometimes missing class due to bad weather. Her family farms, so she helps at home, adding to her burden.",
      keyTraits: {
        age: 15,
        gender: "female",
        language: "Pedi",
        location: "Rural Free State, quintile 1 school",
        motivations: "Wants secure paths; concerned about gender safety."
      },
      samplePrompts: [
        "Dangers on your walk?",
        "What could help?"
      ]
    },
    {
      id: 11,
      name: "Sgt. Khumalo",
      role: "Local Cop",
      avatar: "@/assets/stressed male.png",
      backstory: "Sgt. Khumalo, a 42-year-old police officer from Pretoria, patrols school routes but can't cover all with 2025's budget cuts reducing staff. He sees muggings and accidents daily, especially in high-crime areas like the Cape Flats, where kids report theft of phones or bags. As a father, he's driven to protect but frustrated by lack of community reporting.",
      keyTraits: {
        age: 42,
        gender: "male",
        language: "Zulu",
        location: "Urban Gauteng, serves quintile 3 schools",
        motivations: "Focuses on prevention; alarmed by rising stats."
      },
      samplePrompts: [
        "Common commute crimes?",
        "Ideas for safety?"
      ]
    },
    {
      id: 12,
      name: "Mia",
      role: "Suburban Commuter",
      avatar: "@/assets/stressed female.png",
      backstory: "Mia, a 16-year-old Grade 11 girl with Indian heritage from Durban, uses buses but faces harassment and overcrowding, worsened by 2025's transport strikes. In diverse suburbs, she deals with catcalling, impacting her confidence. From a middle-class family, she advocates for better public transport but feels unsafe alone.",
      keyTraits: {
        age: 16,
        gender: "female",
        language: "English",
        location: "Suburban KwaZulu-Natal, quintile 4 school",
        motivations: "Seeks gender-safe options; frustrated by delays."
      },
      samplePrompts: [
        "Safety issues on buses?",
        "What changes needed?"
      ]
    }
  ],
  4: [
    {
      id: 13,
      name: "Fatima",
      role: "English Learner",
      avatar: "@/assets/stressed female.png",
      backstory: "Fatima, a 16-year-old Grade 11 Muslim girl from Cape Town with Afrikaans/English mix, struggles with technical terms in science, as 2025's English-medium policy leaves her behind despite her home language. In diverse classes, code-switching confuses her, leading to lower grades and anxiety about university. Her family emphasizes education, but stigma around 'slow learners' adds pressure.",
      keyTraits: {
        age: 16,
        gender: "female",
        language: "Afrikaans/English",
        location: "Urban Western Cape, quintile 3 school",
        motivations: "Wants clear lessons; concerned about exams."
      },
      samplePrompts: [
        "How does language affect understanding?",
        "Solutions for classes?"
      ]
    },
    {
      id: 14,
      name: "Mpho",
      role: "Rural Speaker",
      avatar: "@/assets/stressed male.png",
      backstory: "Mpho, a 14-year-old Grade 9 Setswana boy from North West province, speaks Setswana at home but faces English-only lessons, causing 60% proficiency gaps as per 2025 reports. Rural schools lack mother-tongue materials, so he drops out of discussions, feeling isolated. His farming family values education, but he considers quitting for work.",
      keyTraits: {
        age: 14,
        gender: "male",
        language: "Setswana",
        location: "Rural North West, quintile 1 school",
        motivations: "Seeks inclusion; frustrated by dropout risks."
      },
      samplePrompts: [
        "Frustrations with language?",
        "Ideas to bridge?"
      ]
    },
    {
      id: 15,
      name: "Ms. Nkosi",
      role: "Multilingual Teacher",
      avatar: "@/assets/stressed female.png",
      backstory: "Ms. Nkosi, a 48-year-old teacher in Eastern Cape with isiXhosa/English classes, juggles 5 languages in overcrowded rooms, where 2025's teacher shortages mean no specialists. She sees kids fail due to confusion, and her own training is outdated, leading to burnout. Passionate about equity, she pushes for reforms but lacks resources.",
      keyTraits: {
        age: 48,
        gender: "female",
        language: "isiXhosa/English",
        location: "Rural Eastern Cape, quintile 2 school",
        motivations: "Focuses on all learners; alarmed by gaps."
      },
      samplePrompts: [
        "Challenges in teaching?",
        "What tools help?"
      ]
    },
    {
      id: 16,
      name: "Diego",
      role: "Immigrant Student",
      avatar: "@/assets/stressed male.png",
      backstory: "Diego, a 15-year-old Grade 10 boy from Zimbabwe in Pretoria (Shona/English), faces accent barriers in diverse classes, where 2025's immigrant influx strains resources. He excels in math but struggles with group work, feeling excluded and homesick. His family fled economic issues, adding pressure to succeed.",
      keyTraits: {
        age: 15,
        gender: "male",
        language: "Shona/English",
        location: "Urban Gauteng, quintile 4 school",
        motivations: "Wants belonging; concerned about integration."
      },
      samplePrompts: [
        "How do languages affect you?",
        "Bridge ideas?"
      ]
    }
  ],
  5: [
    {
      id: 17,
      name: "Thandi",
      role: "Aspiring Entrepreneur",
      avatar: "@/assets/stressed female.png",
      backstory: "Thandi, a 17-year-old Grade 12 girl from Khayelitsha in the Western Cape, dreams of starting a hair braiding business but finds school focused on theory, not practical skills like marketing or finance, amid 45% youth unemployment in 2025. With family relying on social grants, she attends YES programs but needs more school integration to avoid post-matric joblessness.",
      keyTraits: {
        age: 17,
        gender: "female",
        language: "Xhosa/English",
        location: "Township Western Cape, quintile 2 school",
        motivations: "Business-oriented; frustrated by skills gap."
      },
      samplePrompts: [
        "What skills are missing?",
        "Program ideas?"
      ]
    },
    {
      id: 18,
      name: "Sizwe",
      role: "Dropout Risk",
      avatar: "@/assets/stressed male.png",
      backstory: "Sizwe, a 16-year-old Grade 11 boy from a Joburg township, faces pressure to drop out for low-wage work as unemployment hits record highs in 2025, with curriculum mismatches leaving him unskilled for trades like plumbing. His single mother struggles, and he sees peers in gangs, motivating him to push for vocational training.",
      keyTraits: {
        age: 16,
        gender: "male",
        language: "Zulu",
        location: "Urban Gauteng, quintile 1 school",
        motivations: "Seeks employability; worried about poverty cycle."
      },
      samplePrompts: [
        "Why dropout risk?",
        "What helps?"
      ]
    },
    {
      id: 19,
      name: "Ms. van Wyk",
      role: "Career Counselor",
      avatar: "@/assets/stressed female.png",
      backstory: "Ms. van Wyk, a 55-year-old Afrikaans counselor in Bloemfontein, sees 70% of matrics unemployed due to lack of career guidance in 2025, with rural schools offering no internships. Overworked with 500 learners, she advocates for skills programs but faces budget cuts, drawing from her own youth in apartheid-era limitations.",
      keyTraits: {
        age: 55,
        gender: "female",
        language: "Afrikaans",
        location: "Urban Free State, quintile 3 school",
        motivations: "Empowers youth; alarmed by stats."
      },
      samplePrompts: [
        "Common issues?",
        "Solutions?"
      ]
    },
    {
      id: 20,
      name: "Neo",
      role: "Tech Dreamer",
      avatar: "student-tech",
      backstory: "Neo, a 15-year-old Grade 10 non-binary learner from Durban, loves app development but lacks coding classes amid high unemployment, with 2025's digital divide leaving them behind. From a diverse family, they volunteer at community centers but need school support to turn passion into a job.",
      keyTraits: {
        age: 15,
        gender: "non-binary",
        language: "English",
        location: "Urban KwaZulu-Natal, quintile 4 school",
        motivations: "Innovation-driven; frustrated by access gaps."
      },
      samplePrompts: [
        "Skills needed?",
        "Program ideas?"
      ]
    }
  ],
  6: [
    {
      id: 21,
      name: "Aisha",
      role: "Targeted Learner",
      avatar: "@/assets/stressed female.png",
      backstory: "Aisha, a 15-year-old Grade 10 Muslim girl from Cape Flats, endures cyberbullying on WhatsApp groups in 2025, with 40% of SA learners affected, often tied to religious dress or accents. This leads to isolation and anxiety, missing school days, as her family navigates economic hardships.",
      keyTraits: {
        age: 15,
        gender: "female",
        language: "English/Afrikaans",
        location: "Urban Western Cape, quintile 2 school",
        motivations: "Seeks acceptance; concerned about mental health."
      },
      samplePrompts: [
        "How does bullying feel?",
        "What could stop it?"
      ]
    },
    {
      id: 22,
      name: "Kabelo",
      role: "Bystander",
      avatar: "@/assets/stressed male.png",
      backstory: "Kabelo, a 16-year-old Grade 11 boy from Soweto, witnesses physical fights and verbal abuse in overcrowded classes, where 2025 reports show 30% involvement. He wants to intervene but fears retaliation, affected by his own past as a newcomer.",
      keyTraits: {
        age: 16,
        gender: "male",
        language: "Zulu",
        location: "Township Gauteng, quintile 1 school",
        motivations: "Wants peace; frustrated by silence."
      },
      samplePrompts: [
        "What do you see?",
        "How to help?"
      ]
    },
    {
      id: 23,
      name: "Dr. Patel",
      role: "School Psychologist",
      avatar: "@/assets/stressed male.png",
      backstory: "Dr. Patel, a 50-year-old counselor in Gauteng, handles rising cases (500+ incidents in Q1 2025), with stigma preventing reports. Overloaded with one per 500 learners, she pushes for programs but lacks funding.",
      keyTraits: {
        age: 50,
        gender: "male",
        language: "English",
        location: "Urban Gauteng, quintile 3 school",
        motivations: "Supports healing; alarmed by suicides."
      },
      samplePrompts: [
        "Common types?",
        "Effective strategies?"
      ]
    },
    {
      id: 24,
      name: "Lebo",
      role: "Reformed Bully",
      avatar: "student-reformed",
      backstory: "Lebo, a 17-year-old Grade 12 non-binary learner from Pretoria, bullied to fit in but now regrets it after counseling, amid 2025's 40% primary school bullying rates. They advocate for change, drawing from economic stress at home.",
      keyTraits: {
        age: 17,
        gender: "non-binary",
        language: "English/Afrikaans",
        location: "Suburban Gauteng, quintile 4 school",
        motivations: "Promotes empathy; reflects on harm."
      },
      samplePrompts: [
        "Why did you bully?",
        "Prevention tips?"
      ]
    }
  ],
  7: [
    {
      id: 25,
      name: "Sindi",
      role: "Anxious Student",
      avatar: "@/assets/stressed female.png",
      backstory: "Sindi, a 16-year-old Grade 11 Zulu girl from Durban, battles exam anxiety amid 2025's high suicide rates, with economic pressures adding family stress. Schools have limited counselors, so she hides her feelings due to stigma.",
      keyTraits: {
        age: 16,
        gender: "female",
        language: "Zulu",
        location: "Urban KwaZulu-Natal, quintile 3 school",
        motivations: "Seeks relief; concerned about performance."
      },
      samplePrompts: [
        "How does stress show?",
        "What support needed?"
      ]
    },
    {
      id: 26,
      name: "Johan",
      role: "Stigmatized Learner",
      avatar: "@/assets/stressed male.png",
      backstory: "Johan, a 15-year-old Grade 10 Afrikaans boy from the Free State, bottles up depression from family farm losses, where 2025 stigma calls therapy 'weak.' Rural isolation worsens it, with no access to services.",
      keyTraits: {
        age: 15,
        gender: "male",
        language: "Afrikaans",
        location: "Rural Free State, quintile 2 school",
        motivations: "Wants acceptance; frustrated by norms."
      },
      samplePrompts: [
        "Why not seek help?",
        "Ideas for change?"
      ]
    },
    {
      id: 27,
      name: "Ms. Mokoena",
      role: "School Counselor",
      avatar: "@/assets/stressed female.png",
      backstory: "Ms. Mokoena, a 45-year-old counselor in Mpumalanga, sees burnout rise with one per 500 kids in 2025, handling economic-driven anxiety but overwhelmed by caseloads and lack of training.",
      keyTraits: {
        age: 45,
        gender: "female",
        language: "Swati",
        location: "Rural Mpumalanga, quintile 1 school",
        motivations: "Helps all; alarmed by gaps."
      },
      samplePrompts: [
        "Common issues?",
        "Solutions?"
      ]
    },
    {
      id: 28,
      name: "Refilwe",
      role: "Peer Supporter",
      avatar: "@/assets/stressed female.png",
      backstory: "Refilwe, a 17-year-old Grade 12 girl from a Johannesburg school, supports friends with anxiety but needs training, as 2025's post-COVID crises linger without school programs.",
      keyTraits: {
        age: 17,
        gender: "female",
        language: "English",
        location: "Urban Gauteng, quintile 4 school",
        motivations: "Builds community; reflects on empathy."
      },
      samplePrompts: [
        "How do you help?",
        "Program ideas?"
      ]
    }
  ],
  8: [
    {
      id: 29,
      name: "Thato",
      role: "Wheelchair User",
      avatar: "@/assets/stressed male.png",
      backstory: "Thato, a 15-year-old Grade 10 boy from Bloemfontein, navigates ramps-less schools in 2025, where 70% of disabled kids are excluded due to infrastructure gaps. His polio limits mobility, missing classes on upper floors, and stigma from peers adds emotional strain.",
      keyTraits: {
        age: 15,
        gender: "male",
        language: "Sesotho",
        location: "Urban Free State, quintile 3 school",
        motivations: "Seeks access; frustrated by barriers."
      },
      samplePrompts: [
        "Layout issues?",
        "Improvements?"
      ]
    },
    {
      id: 30,
      name: "Zinhle",
      role: "Hearing-Impaired Learner",
      avatar: "@/assets/stressed female.png",
      backstory: "Zinhle, a 16-year-old Grade 11 girl from Eastern Cape, relies on lip-reading but struggles in noisy classes without sign language teachers, as 2025 policies lag. Rural isolation means no aids, affecting her social life and grades.",
      keyTraits: {
        age: 16,
        gender: "female",
        language: "isiXhosa",
        location: "Rural Eastern Cape, quintile 1 school",
        motivations: "Wants inclusion; concerned about isolation."
      },
      samplePrompts: [
        "Communication challenges?",
        "Tools needed?"
      ]
    },
    {
      id: 31,
      name: "Mr. Botha",
      role: "Special Ed Teacher",
      avatar: "@/assets/stressed male.png",
      backstory: "Mr. Botha, a 50-year-old teacher in Northern Cape, teaches mixed classes without training for disabilities in 2025, facing budget cuts that limit aids. He sees potential but struggles with overcrowded rooms.",
      keyTraits: {
        age: 50,
        gender: "male",
        language: "Afrikaans",
        location: "Rural Northern Cape, quintile 2 school",
        motivations: "Empowers all; alarmed by exclusions."
      },
      samplePrompts: [
        "Training gaps?",
        "Inclusive ideas?"
      ]
    },
    {
      id: 32,
      name: "Keabetswe",
      role: "Visually Impaired Student",
      avatar: "student-visually",
      backstory: "Keabetswe, a 14-year-old Grade 9 non-binary learner from Gauteng, uses braille but finds books scarce in 2025, with digital tools inaccessible due to load shedding. Social stigma leads to bullying, but they advocate for change.",
      keyTraits: {
        age: 14,
        gender: "non-binary",
        language: "Tswana",
        location: "Urban Gauteng, quintile 4 school",
        motivations: "Seeks equality; reflects on stigma."
      },
      samplePrompts: [
        "Access issues?",
        "Tech solutions?"
      ]
    }
  ]
};

// Mock AI response generator (can be kept or updated with AI integration)
export const generateAIResponse = (type: 'interview' | 'refine' | 'wildcard' | 'score', context?: any) => {
  if (type === 'interview') {
    return "That's a great question! I think the main issue is...";
  }
  if (type === 'refine') {
    return {
      suggestion: `${context.user} needs ${context.needs} because ${context.why}.`,
      improvements: [
        "Consider being more specific about the user's context",
        "Clarify the emotional impact",
        "Add quantifiable details"
      ]
    };
  }
  if (type === 'wildcard') {
    return [
      "Create a digital queue system with live wait times",
      "Design a mobile pre-order app with customization",
      "Implement a token system for express pickup lanes"
    ];
  }
  if (type === 'score') {
    const baseScore = 60 + Math.floor(Math.random() * 30);
    return {
      score: baseScore,
      feedback: baseScore >= 70 
        ? "Excellent work! You've demonstrated strong understanding."
        : "Good effort! Consider adding more detail and specificity."
    };
  }
  return null;
};

// Mock login/signup functions (unchanged unless updated)
export const mockLogin = async (email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const token = btoa(JSON.stringify({ email, exp: Date.now() + 86400000 }));
  return {
    username: email.split('@')[0],
    email,
    grade: "10th Grade",
    avatar: "default-avatar",
    authToken: token
  };
};

export const mockSignup = async (username: string, email: string, password: string, grade: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const token = btoa(JSON.stringify({ email, username, exp: Date.now() + 86400000 }));
  return {
    username,
    email,
    grade,
    avatar: "default-avatar",
    authToken: token
  };
};