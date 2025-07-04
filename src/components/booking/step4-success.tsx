'use client';

import { CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BookingData } from '@/app/page';
import { useTranslation } from '@/contexts/language-context';

interface Step4Props {
  onReset: () => void;
  data: BookingData;
}

export function Step4Success({ onReset, data }: Step4Props) {
  const { doctor, date, time } = data;
  const { t, language } = useTranslation();

  if (!doctor || !date || !time) {
    return (
      <Card className="w-full p-8 text-center animate-in fade-in-50 duration-500 shadow-xl rounded-2xl">
        <h2 className="text-2xl font-bold text-destructive">{t('errorTitle')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('missingInfo')}
        </p>
        <Button onClick={onReset} className="mt-6 btn-gradient rounded-full">
          {t('startOverButton')}
        </Button>
      </Card>
    );
  }

  const formattedDate = format(date, 'EEEE, MMMM d, yyyy', {
    locale: language === 'es' ? es : undefined,
  });

  return (
    <Card className="w-full animate-in fade-in-50 duration-500 shadow-xl rounded-2xl">
      <CardContent className="p-8 flex flex-col items-center text-center">
        <CheckCircle2 className="h-20 w-20 text-accent mb-6" />
        <h2 className="text-3xl font-bold font-headline">{t('step4Title')}</h2>
        <p className="text-muted-foreground mt-4 text-lg max-w-md">
          {t('step4Description', { doctor: doctor.name, date: formattedDate, time: time })}
        </p>
        <Button size="lg" onClick={onReset} className="mt-8 w-full sm:w-auto btn-gradient rounded-full">
          {t('scheduleAnotherButton')}
        </Button>
      </CardContent>
    </Card>
  );
}
