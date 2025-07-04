'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { BookingData } from '@/app/page';
import { useTranslation } from '@/contexts/language-context';

interface Step2Props {
  onNext: (data: { time: string }) => void;
  onBack: () => void;
  data: BookingData;
}

export function Step2SelectTime({ onNext, onBack, data }: Step2Props) {
  const [selectedTime, setSelectedTime] = useState<string | null>(data.time);
  const { t, language } = useTranslation();
  
  if (!data.doctor || !data.date || !data.availableTimes) {
    return (
      <Card className="w-full p-4 text-center">
        <p className="text-destructive">{t('missingInfo')}</p>
        <Button onClick={onBack} variant="link" className="mt-4">{t('backButton')}</Button>
      </Card>
    );
  }

  const timeSlots = data.availableTimes;

  const formattedDate = format(data.date, 'EEEE, MMMM d, yyyy', {
    locale: language === 'es' ? es : undefined,
  });

  return (
    <Card className="w-full animate-in fade-in-50 duration-500 shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{t('step2Title')}</CardTitle>
        <CardDescription>
          {t('step2Description')} <span className="font-semibold text-primary">{data.doctor.name}</span> on <span className="font-semibold text-primary">{formattedDate}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? 'default' : 'outline'}
              onClick={() => setSelectedTime(time)}
              className="w-full text-lg py-6 rounded-full"
            >
              {time}
            </Button>
          ))}
        </div>
        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto rounded-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backButton')}
          </Button>
          <Button
            size="lg"
            onClick={() => onNext({ time: selectedTime! })}
            disabled={!selectedTime}
            className="w-full sm:w-auto btn-gradient rounded-full"
          >
            {t('continueButton')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
