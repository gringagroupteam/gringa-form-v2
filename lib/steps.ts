import { Block, Question, formTemplate } from "./form-template";

export type StepType =
  | { kind: "block_header"; block: Block }
  | {
      kind: "question";
      block: Block;
      question: Question;
      questionIndex: number;
      totalInBlock: number;
    }
  | { kind: "handoff" }
  | { kind: "milestone"; message: string };

export function buildSteps(): StepType[] {
  const steps: StepType[] = [];

  for (const section of formTemplate.sections) {
    if ("type" in section && section.type === "handoff") {
      steps.push({ kind: "handoff" });
    } else if ("type" in section && section.type === "milestone") {
      steps.push({ kind: "milestone", message: section.message });
    } else if ("questions" in section) {
      const block = section as Block;
      steps.push({ kind: "block_header", block });

      block.questions.forEach((q, idx) => {
        steps.push({
          kind: "question",
          block: block,
          question: q,
          questionIndex: idx,
          totalInBlock: block.questions.length,
        });
      });
    }
  }

  return steps;
}

export function buildIndividualSteps(): StepType[] {
  const steps: StepType[] = [];
  const block001 = formTemplate.sections.find(
    (s) => "id" in s && s.id === "001"
  ) as Block;

  if (block001) {
    steps.push({ kind: "block_header", block: block001 });
    block001.questions.forEach((q, idx) => {
      steps.push({
        kind: "question",
        block: block001,
        question: q,
        questionIndex: idx,
        totalInBlock: block001.questions.length,
      });
    });
  }

  return steps;
}

export function buildTogetherSteps(): StepType[] {
  const steps: StepType[] = [];

  // Start with Handoff, then everything from Block 002 onwards
  let startAdding = false;

  for (const section of formTemplate.sections) {
    if ("type" in section && section.type === "handoff") {
      steps.push({ kind: "handoff" });
      startAdding = true;
      continue;
    }

    if (!startAdding) continue;

    if ("type" in section && section.type === "milestone") {
      steps.push({ kind: "milestone", message: section.message });
    } else if ("questions" in section) {
      const block = section as Block;
      steps.push({ kind: "block_header", block });

      block.questions.forEach((q, idx) => {
        steps.push({
          kind: "question",
          block: block,
          question: q,
          questionIndex: idx,
          totalInBlock: block.questions.length,
        });
      });
    }
  }

  return steps;
}
