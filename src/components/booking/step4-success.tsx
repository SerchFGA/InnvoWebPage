'use client';

import { CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BookingData } from '@/app/page';

interface Step4Props {
  onReset: () => void;
  data: BookingData;
}

export function Step4Success({ onReset, data }: Step4Props) {
  const { doctor, date, time } = data;

  if (!doctor || !date || !time) {
    return (
      <Card className="w-full p-8 text-center animate-in fade-in-50 duration-500">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground mt-2">
          Appointment details are missing.
        </p>
        <Button onClick={onReset} className="mt-6">
          Start Over
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardContent className="p-8 flex flex-col items-center text-center">
        <CheckCircle2 className="h-20 w-20 text-accent mb-6" />
        <h2 className="text-3xl font-bold font-headline">Appointment Confirmed!</h2>
        <p className="text-muted-foreground mt-4 text-lg max-w-md">
          Your appointment with <span className="font-semibold text-primary">{doctor.name}</span> on{' '}
          <span className="font-semibold text-primary">{format(date, 'EEEE, MMMM d, yyyy')}</span> at{' '}
          <span className="font-semibold text-primary">{time}</span> has been successfully scheduled.
        </p>
        <Button size="lg" onClick={onReset} className="mt-8 w-full sm:w-auto">
          Schedule Another Appointment
        </Button>
      </CardContent>
    </Card>
  );
}
