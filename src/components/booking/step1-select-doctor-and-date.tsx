'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Doctor, BookingData } from '@/app/page';

const doctors: Doctor[] = [
  {
    id: 'pablo-carvajal',
    name: 'Dr. Pablo Carvajal',
    duration: '1 hour session',
    image: 'https://placehold.co/100x100.png',
  },
  {
    id: 'alfonso-carvajal',
    name: 'Dr. Alfonso Carvajal',
    duration: '30 minute session',
    image: 'https://placehold.co/100x100.png',
  },
];

interface Step1Props {
  onNext: (data: { doctor: Doctor; date: Date }) => void;
  data: BookingData;
}

export function Step1SelectDoctorAndDate({ onNext, data }: Step1Props) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(data.doctor);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(data.date ?? new Date());
  const [hasInteracted, setHasInteracted] = useState(!!data.doctor || !!data.date);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setHasInteracted(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
        setHasInteracted(true);
    }
  };

  const canContinue = selectedDoctor && selectedDate;
  const showValidationError = hasInteracted && !canContinue;

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle>Select Doctor and Date</CardTitle>
        <CardDescription>Choose a specialist and a preferred date for your appointment.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex justify-center items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) || date.getDay() === 0}
              className="rounded-md border shadow-sm"
            />
          </div>
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <Card
                key={doctor.id}
                onClick={() => handleDoctorSelect(doctor)}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedDoctor?.id === doctor.id
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-border'
                )}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    width={80}
                    height={80}
                    className="rounded-full"
                    data-ai-hint="doctor portrait"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-lg">{doctor.name}</p>
                    <p className="text-muted-foreground">{doctor.duration}</p>
                  </div>
                  <Button variant={selectedDoctor?.id === doctor.id ? 'default' : 'outline'} className="hidden sm:inline-flex">
                    Select
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end mt-8">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => onNext({ doctor: selectedDoctor!, date: selectedDate! })}
            disabled={!canContinue}
          >
            Continue
          </Button>
          <div className="h-6 mt-2 flex items-center">
            {showValidationError && (
                <p className="text-sm text-destructive animate-in fade-in-0">
                    Please select a doctor and a date.
                </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
