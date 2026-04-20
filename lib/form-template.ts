export type QuestionType =
  | "short_text"
  | "long_text"
  | "single_select"
  | "multi_select";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  label: string;
  helper?: string;
  placeholder?: string;
}

export interface TextQuestion extends BaseQuestion {
  type: "short_text" | "long_text";
  maxChars?: number;
}

export interface SelectQuestion extends BaseQuestion {
  type: "single_select" | "multi_select";
  options: string[];
  maxSelections?: number;
}

export type Question = TextQuestion | SelectQuestion;

export interface Block {
  id: string;
  title: string;
  mode: "individual" | "together";
  intro: string;
  questions: Question[];
}

export interface HandoffScreen {
  id: string;
  type: "handoff";
  headline: string;
  body: string;
}
export interface MilestoneScreen {
  id: string;
  type: "milestone";
  message: string;
}

export type FormSection = Block | HandoffScreen | MilestoneScreen;

export interface FormTemplate {
  version: string;
  intro: {
    headline: string;
    body: string[];
    estimatedTime: string;
    suggestedFormat: string;
  };
  gate: {
    question: string;
    options: { value: string; label: string; respondents: number }[];
  };
  sections: FormSection[];
  closing: {
    headline: string;
    body: string;
    nextStep: string;
    signoff: string;
  };
}

export const formTemplate: FormTemplate = {
  version: "1.0",
  intro: {
    headline: "Welcome.",
    body: [
      "Before we design anything, we listen.",
      "This form is the first chapter of your brand — the part where we stop guessing and start understanding. Every question here exists for a reason: your answers become the foundation of the strategy, the identity, and the visual system we'll build together.",
      "Take your time. There are no wrong answers — only honest ones.",
    ],
    estimatedTime: "40–50 minutes",
    suggestedFormat: "Two sessions recommended",
  },
  gate: {
    question: "How many people are answering this form?",
    options: [
      { value: "solo", label: "Just me", respondents: 1 },
      {
        value: "duo",
        label: "Two of us — co-founders, partners, or couple",
        respondents: 2,
      },
      {
        value: "trio_plus",
        label: "Three or more founders",
        respondents: 3,
      },
      {
        value: "corporate",
        label: "We represent an existing company or team",
        respondents: 1,
      },
    ],
  },
  sections: [
    {
      id: "001",
      title: "Who You Are",
      mode: "individual",
      intro:
        "Before we talk about the brand, we want to know the people behind it. If there's more than one of you, each person fills this block alone. Don't peek at each other's answers — the differences are where the magic lives.",
      questions: [
        {
          id: "01.1",
          type: "long_text",
          label: "Tell us your story in three acts.",
          helper:
            "Where you came from, what shaped you, and what brought you to this project. Don't polish it. Rough is better.",
        },
        {
          id: "01.2",
          type: "long_text",
          label: "What do you bring to this brand that no one else could?",
          helper:
            "Think skill, obsession, taste, instinct — whatever is uniquely yours.",
        },
        {
          id: "01.3",
          type: "long_text",
          label: "What does the name of your brand mean to you, personally?",
          helper:
            "If you inherited the name, tell us what it means to you now. If you chose it, tell us why.",
        },
      ],
    },
    {
      id: "handoff_001",
      type: "handoff",
      headline: "Nice work.",
      body: "The rest of this form is for both of you. Find a quiet evening, open a bottle of something good, and take it together. These are the questions that define what you're building.",
    },
    {
      id: "002",
      title: "The Business",
      mode: "together",
      intro:
        "Now the practical layer. We need to understand what you actually do, how you make money, and where you stand today.",
      questions: [
        {
          id: "02.1",
          type: "short_text",
          maxChars: 200,
          label: "In one sentence, what does your company do?",
          helper:
            "Pretend you're explaining it to someone at a dinner party, not on a pitch deck.",
        },
        {
          id: "02.2",
          type: "long_text",
          label: "What are your main products, services, or offerings?",
          helper: "List the top three to five. Short descriptions are fine.",
        },
        {
          id: "02.3",
          type: "single_select",
          label: "Where are you in your journey right now?",
          options: [
            "Pre-launch — building from zero",
            "Just launched (0–12 months)",
            "Growing (1–3 years, finding rhythm)",
            "Established (3+ years, ready to evolve)",
            "Rebranding — we've outgrown our current identity",
          ],
        },
        {
          id: "02.4",
          type: "long_text",
          label: "What is the single biggest business challenge you're facing this year?",
        },
        {
          id: "02.5",
          type: "long_text",
          label: "What does success look like twelve months from now?",
          helper:
            "Be specific. Revenue, recognition, team size, type of clients — whatever matters most.",
        },
      ],
    },
    {
      id: "milestone_1",
      type: "milestone",
      message: "You're warming up. The interesting part starts now.",
    },
    {
      id: "003",
      title: "Positioning",
      mode: "together",
      intro:
        "A brand without a point of view is wallpaper. This block helps us find yours.",
      questions: [
        {
          id: "03.1",
          type: "long_text",
          label: "Who are your three closest competitors or reference points?",
          helper: "One line on each is enough.",
        },
        {
          id: "03.2",
          type: "long_text",
          label: "What do you do differently — or better — than them?",
        },
        {
          id: "03.3",
          type: "short_text",
          maxChars: 240,
          label: 'Finish this sentence: "We exist because ________."',
        },
        {
          id: "03.4",
          type: "long_text",
          label: "What would your brand never do, even if it made money?",
          helper: "This is where values become visible.",
        },
      ],
    },
    {
      id: "004",
      title: "Personality & Voice",
      mode: "together",
      intro:
        "We don't design how brands look before we understand how they behave. These questions define the personality that the visual identity will express.",
      questions: [
        {
          id: "04.1",
          type: "long_text",
          label:
            "If your brand were a person arriving at a party, how would they enter and what would they do in the first five minutes?",
        },
        {
          id: "04.2",
          type: "multi_select",
          maxSelections: 3,
          label: "Choose three words that best describe the personality of your brand.",
          helper: "Pick three — no more. Trust your gut.",
          options: [
            "Bold",
            "Refined",
            "Playful",
            "Quiet",
            "Rebellious",
            "Warm",
            "Precise",
            "Raw",
            "Luminous",
            "Intimate",
            "Confident",
            "Curious",
            "Timeless",
            "Magnetic",
            "Honest",
            "Generous",
            "Sharp",
            "Grounded",
          ],
        },
        {
          id: "04.3",
          type: "long_text",
          label: "What is your brand fighting against?",
          helper:
            "Every strong brand has an enemy — a behavior, a belief, a bad habit in the industry. What's yours?",
        },
        {
          id: "04.4",
          type: "multi_select",
          maxSelections: 4,
          label: "How does your brand speak?",
          helper: "Tick all that apply — but try not to tick more than four.",
          options: [
            "Direct, no filler",
            "Poetic, layered",
            "Conversational, like a friend",
            "Expert, authoritative",
            "Witty, a bit sharp",
            "Warm, reassuring",
            "Minimal, says little",
            "Bold, says a lot",
          ],
        },
        {
          id: "04.5",
          type: "long_text",
          label: "Show us a brand whose tone of voice you admire — and tell us why.",
          helper: 'Can be from any industry. The "why" matters more than the "who".',
        },
      ],
    },
    {
      id: "milestone_2",
      type: "milestone",
      message: "Halfway there. This is where your brand starts taking shape.",
    },
    {
      id: "005",
      title: "Audience & Perception",
      mode: "together",
      intro:
        "Brands aren't built for everyone. The sharper the audience, the stronger the identity.",
      questions: [
        {
          id: "05.1",
          type: "long_text",
          label: "Describe your ideal client or customer in a short paragraph.",
          helper: "Not demographics — behavior, mindset, what they care about.",
        },
        {
          id: "05.2",
          type: "short_text",
          maxChars: 160,
          label:
            "When someone interacts with your brand for the first time, what's the one feeling you want them to walk away with?",
        },
        {
          id: "05.3",
          type: "long_text",
          label: "What do people get wrong about you today?",
          helper: "Misconceptions, wrong assumptions, lazy comparisons.",
        },
        {
          id: "05.4",
          type: "long_text",
          label:
            "In five years, if someone describes your brand to a stranger, what do you hope they say?",
        },
      ],
    },
    {
      id: "006",
      title: "Visual Universe",
      mode: "together",
      intro:
        "This is where strategy meets aesthetics. Be honest — especially about what you dislike.",
      questions: [
        {
          id: "06.1",
          type: "long_text",
          label: "Name up to five brands you visually admire.",
          helper: "Any industry. Briefly say what you love about each — a word or two is enough.",
          placeholder:
            "Example: Aesop — restraint. Jacquemus — wit. Off-White — irreverence.",
        },
        {
          id: "06.2",
          type: "long_text",
          label:
            "Name up to three brands whose aesthetic you want to stay far away from.",
          helper: "Equally important. Tell us why.",
        },
        {
          id: "06.3",
          type: "multi_select",
          maxSelections: 2,
          label: "Which of these aesthetic directions feel closest to your brand?",
          helper:
            "Pick up to two. These are starting points — not final decisions.",
          options: [
            "Editorial & sophisticated",
            "Minimal & architectural",
            "Bold & graphic",
            "Organic & handcrafted",
            "Futuristic & digital",
            "Classic & timeless",
            "Playful & unexpected",
            "Raw & documentary",
            "Luxurious & precise",
          ],
        },
        {
          id: "06.4",
          type: "long_text",
          label:
            "Are there any colors, shapes, textures, or visual codes that feel essential — or forbidden?",
          helper: "Leave blank if you have no preference yet.",
        },
        {
          id: "06.5",
          type: "long_text",
          label:
            "Drop any links, moodboards, Pinterest boards, or references you'd like us to see.",
          placeholder: "One link per line is perfect.",
        },
      ],
    },
    {
      id: "milestone_3",
      type: "milestone",
      message:
        "Almost there. Two more blocks — the vision, and a few final thoughts.",
    },
    {
      id: "007",
      title: "Five-Year Vision",
      mode: "together",
      intro:
        "Brands are built for today, but designed for tomorrow. Help us see where you're going.",
      questions: [
        {
          id: "07.1",
          type: "long_text",
          label: "Where do you want this brand to be in five years?",
          helper: "Scale, reputation, reach, category — whatever matters most to you.",
        },
        {
          id: "07.2",
          type: "long_text",
          label: 'What would make you look back and say "the rebrand worked"?',
        },
        {
          id: "07.3",
          type: "long_text",
          label: "Anything else we should know — that we didn't ask?",
          helper:
            "The stuff that doesn't fit anywhere else usually matters most.",
        },
      ],
    },
  ],
  closing: {
    headline: "That's it. Thank you.",
    body: "From here, we take your answers into our Discover phase — we study, analyze, cross-reference, and start translating words into strategy.",
    nextStep: "You'll hear from us within five business days with the next step.",
    signoff: "— The Gringa Group Team",
  },
};
