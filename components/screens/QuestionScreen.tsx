"use client";

import React, { useState } from "react";
import { Question } from "@/lib/form-template";
import { PageFrame } from "@/components/ui/PageFrame";
import { NextButton } from "@/components/ui/NextButton";
import { ShortText } from "@/components/inputs/ShortText";
import { LongText } from "@/components/inputs/LongText";
import { SingleSelect } from "@/components/inputs/SingleSelect";
import { MultiSelect } from "@/components/inputs/MultiSelect";
import { ContinueLaterModal } from "@/components/ui/ContinueLaterModal";
import { useFormState, useFormActions } from "@/lib/state/FormContext";

interface QuestionScreenProps {
  question: Question;
  blockId: string;
  questionIndex: number;
  totalInBlock: number;
  onNext: (value: unknown) => void;
  onBack: () => void;
  existingAnswer?: unknown;
}

export const QuestionScreen = React.memo(({
  question,
  blockId,
  questionIndex,
  totalInBlock,
  onNext,
  onBack,
  existingAnswer,
}: QuestionScreenProps) => {
  const state = useFormState();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  const [value, setValue] = React.useState<unknown>(() => {
    if (existingAnswer !== undefined && existingAnswer !== null) return existingAnswer;
    if (question.type === "multi_select") return [];
    if (question.type === "single_select") return null;
    return "";
  });

  const validate = (): boolean => {
    if (question.type === "short_text" || question.type === "long_text") {
      return typeof value === "string" && value.trim().length > 0;
    }
    if (question.type === "single_select") {
      return typeof value === "string" && value.length > 0;
    }
    if (question.type === "multi_select") {
      return Array.isArray(value) && value.length > 0;
    }
    return false;
  };

  const isValid = validate();

  const handleNext = () => {
    if (isValid) onNext(value);
  };

  const handleSingleSelect = (val: string) => {
    setValue(val);
    setTimeout(() => {
      onNext(val);
    }, 250);
  };

  const renderInput = () => {
    switch (question.type) {
      case "short_text":
        return (
          <ShortText
            value={value as string}
            onChange={setValue}
            placeholder={question.placeholder}
            maxChars={question.maxChars}
          />
        );
      case "long_text":
        return (
          <LongText
            value={value as string}
            onChange={setValue}
            placeholder={question.placeholder}
            maxChars={question.maxChars}
          />
        );
      case "single_select":
        return (
          <SingleSelect
            options={question.options}
            value={value as string | null}
            onChange={handleSingleSelect}
          />
        );
      case "multi_select":
        return (
          <MultiSelect
            options={question.options}
            value={value as string[]}
            onChange={setValue}
            maxSelections={question.maxSelections}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <PageFrame number={blockId} />
      <div className="w-full max-w-[640px] mx-auto px-6 py-24 flex flex-col justify-center min-h-[70vh] relative">
        
        <span className="font-sans font-medium text-[11px] tracking-[0.08em] uppercase text-ink-muted mb-8">
          {String(questionIndex + 1).padStart(2, '0')} / {String(totalInBlock).padStart(2, '0')}
        </span>
        
        <h2 className="font-editorial font-normal text-[24px] md:text-[32px] leading-[1.2] tracking-[-0.02em] text-ink mb-3">
          {question.label}
        </h2>
        
        {question.helper && (
          <p className="font-sans italic text-[14px] text-ink-muted mb-8">
            {question.helper}
          </p>
        )}
        
        {!question.helper && <div className="h-8" /> }
        
        <div className="w-full mb-12">
          {renderInput()}
        </div>

        {question.type !== "single_select" && (
          <div className="flex justify-start h-10">
            <NextButton label="Continue →" onClick={handleNext} show={isValid} />
          </div>
        )}

      </div>
      
      {/* Navigation Footer */}
      <div className="fixed bottom-8 left-6 flex flex-col gap-3 z-40">
        <button 
          onClick={onBack}
          className="font-sans text-[13px] text-ink-muted hover:text-ink text-left transition-colors duration-150"
        >
          ← Back
        </button>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="font-sans text-[11px] text-ink-muted hover:underline text-left"
        >
          Continue later
        </button>
      </div>

      <ContinueLaterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        sessionToken={state.session?.token || ""} 
      />
    </>
  );
});

QuestionScreen.displayName = "QuestionScreen";
