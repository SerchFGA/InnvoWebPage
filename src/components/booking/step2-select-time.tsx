'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { BookingData } from '@/app/page';

const generateTimeSlots = (doctorName: string) => {
  if (doctorName.includes('Pablo')) {
    return ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00'];
  }
  return [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '16:00', '16:30', '17:00', '17:30'
  ];
};

interface Step2Props {
  onNext: (data: { time: string }) => void;
  onBack: () => void;
  data: BookingData;
}

export function Step2SelectTime({ onNext, onBack, data }: Step2Props) {
  const [selectedTime, setSelectedTime] = useState<string | null>(data.time);
  
  if (!data.doctor || !data.date) {
    return (
      <Card className="w-full p-4 text-center">
        <p className="text-destructive">Missing doctor or date information.</p>
        <Button onClick={onBack} variant="link" className="mt-4">Go Back</Button>
      </Card>
    );
  }

  const timeSlots = generateTimeSlots(data.doctor.name);

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle>Select a Time Slot</CardTitle>
        <CardDescription>
          Available times for <span className="font-semibold text-primary">{data.doctor.name}</span> on <span className="font-semibold text-primary">{format(data.date, 'EEEE, MMMM d, yyyy')}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? 'default' : 'outline'}
              onClick={() => setSelectedTime(time)}
              className="w-full text-lg py-6"
            >
              {time}
            </Button>
          ))}
        </div>
        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={() => onNext({ time: selectedTime! })}
            disabled={!selectedTime}
            className="w-full sm:w-auto"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
