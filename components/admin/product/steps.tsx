// components/ui/steps.tsx
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onChange?: (step: number) => void;
}

export function Steps({ steps, currentStep, onChange }: StepsProps) {
  return (
    <div className="relative flex w-full justify-between">
      {/* Progress Bar */}
      <div className="absolute left-0 top-[15px] h-[2px] w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex w-full justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;

          return (
            <button
              key={step.title}
              className={cn(
                "flex flex-col items-center gap-2",
                (isCompleted || isCurrent) && "cursor-pointer",
                !onChange && "cursor-default"
              )}
              onClick={() => onChange?.(index)}
              disabled={!onChange}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-500",
                  isCompleted && "border-primary bg-primary",
                  isCurrent && "border-primary bg-background",
                  !isCompleted && !isCurrent && "border-muted bg-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <span
                    className={cn(
                      "text-sm",
                      isCurrent && "text-primary",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Step Title & Description */}
              <div className="hidden flex-col gap-0.5 sm:flex">
                <span
                  className={cn(
                    "text-sm font-medium",
                    (isCompleted || isCurrent) && "text-foreground",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {step.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
