'use client';

import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/language-context';

interface ProgressIndicatorProps {
  currentStep: number;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const { t } = useTranslation();
  const steps = [
    { id: 1, label: t('progressStep1') },
    { id: 2, label: t('progressStep2') },
    { id: 3, label: t('progressStep3') },
    { id: 4, label: t('progressStep4') },
  ];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center w-full">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                )}
              >
                {currentStep > step.id ? '✔' : step.id}
              </div>
              <p className={cn(
                'text-center text-xs mt-2',
                currentStep >= step.id ? 'font-bold text-primary' : 'text-muted-foreground'
              )}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-auto border-t-2 transition-all duration-300',
                currentStep > step.id ? 'border-primary' : 'border-secondary'
              )}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
