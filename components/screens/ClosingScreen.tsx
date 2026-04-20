"use client";

import { PageFrame } from "@/components/ui/PageFrame";
import { formTemplate } from "@/lib/form-template";
import { useEffect } from "react";
import { useFormContext } from "@/lib/state/FormContext";

export function ClosingScreen() {
  const { completeForm } = useFormContext();

  useEffect(() => {
    completeForm();
  }, [completeForm]);

  return (
    <>
      <PageFrame number="end" />
      <div className="w-full max-w-[720px] mx-auto flex flex-col py-24 px-6 md:px-0 items-center justify-center text-center">
        
        <h1 className="font-editorial font-extralight text-[56px] md:text-[72px] leading-[1.0] tracking-[-0.03em] mb-12 text-ink">
          {formTemplate.closing.headline}
        </h1>

        <div className="flex flex-col gap-6 text-[16px] leading-[1.55] tracking-[-0.02em] font-sans text-ink-soft mb-12 max-w-[480px]">
          <p>{formTemplate.closing.body}</p>
          <p>{formTemplate.closing.nextStep}</p>
        </div>

        <p className="font-editorial font-extralight italic text-[24px] text-ink">
          {formTemplate.closing.signoff}
        </p>

      </div>
    </>
  );
}
