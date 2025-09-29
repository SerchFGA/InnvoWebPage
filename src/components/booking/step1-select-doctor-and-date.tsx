'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Doctor, BookingData } from '@/app/page';
import { useTranslation } from '@/contexts/language-context';
import placeholderData from '@/lib/placeholder-images.json';

const doctors: Doctor[] = placeholderData.doctors.map(doctor => ({
  ...doctor,
  image: doctor.image.src, // Keep the flat structure for the Doctor type
}));


interface Step1Props {
  onNext: (data: { doctor: Doctor; date: Date }) => void;
  data: BookingData;
  isSubmitting: boolean;
}

export function Step1SelectDoctorAndDate({ onNext, data, isSubmitting }: Step1Props) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(data.doctor);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(data.date ?? undefined);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { t, language } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getDoctorDuration = (doctor: Doctor) => {
    if (language === 'es') {
      if (doctor.duration.includes('60')) return 'Sesión de 60 min';
      if (doctor.duration.includes('30')) return 'Sesión de 30 min';
    }
    return doctor.duration;
  };
  
  useEffect(() => {
    if(data.doctor || data.date) {
      setHasInteracted(true);
    }
  }, [data.doctor, data.date]);

  useEffect(() => {
    // This effect runs only on the client, after hydration
    // which prevents a mismatch between server and client rendered HTML
    if (!selectedDate) {
      const today = new Date();
      if (today.getDay() === 0) { // If today is Sunday, select next day
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow);
      } else {
        setSelectedDate(today);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, selectedDate]);

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    if (!hasInteracted) setHasInteracted(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && !hasInteracted) {
      setHasInteracted(true);
    }
  };

  const canContinue = selectedDoctor && selectedDate;
  const showValidationError = hasInteracted && !canContinue;

  return (
    <Card className="w-full animate-in fade-in-50 duration-500 shadow-xl rounded-2xl relative pb-24">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{t('step1Title')}</CardTitle>
        <CardDescription>{t('step1Description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column: Calendar */}
          <div className="w-full lg:w-1/2 flex justify-center items-start pt-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={
                isClient ? 
                (date) =>
                      date < new Date(new Date().setDate(new Date().getDate() - 1)) ||
                      date.getDay() === 0
                : () => true
              }
              initialFocus
              className="rounded-xl border shadow-lg p-4"
            />
          </div>

          {/* Right Column: Doctor List */}
          <div className="w-full lg:w-1/2">
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2 -mr-4">
              {placeholderData.doctors.map((doctor) => (
                <Card
                  key={`${doctor.id}-${doctor.duration}`}
                  onClick={() => handleDoctorSelect({ ...doctor, image: doctor.image.src })}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-xl hover:border-primary',
                    selectedDoctor?.id === doctor.id && selectedDoctor?.duration === doctor.duration
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-border'
                  )}
                >
                  <CardContent className="p-3 flex items-center gap-4">
                    <Image
                      src={doctor.image.src}
                      alt={doctor.name}
                      width={doctor.image.width}
                      height={doctor.image.height}
                      className="rounded-full"
                      data-ai-hint={doctor.image.aiHint}
                    />
                    <div className="flex-grow">
                      <p className="font-semibold text-md">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">{doctor.services}</p>
                      <p className="text-xs text-muted-foreground mt-1">{getDoctorDuration(doctor as Doctor)}</p>
                    </div>
                    <Button variant={selectedDoctor?.id === doctor.id && selectedDoctor?.duration === doctor.duration ? 'default' : 'outline'} size="sm" className="hidden sm:inline-flex rounded-full">
                      {t('selectButton')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button Section */}
        <div className="absolute bottom-6 right-6 flex flex-col items-end">
          <Button
            size="lg"
            className="w-full sm:w-auto btn-gradient rounded-full"
            onClick={() => onNext({ doctor: selectedDoctor!, date: selectedDate! })}
            disabled={!canContinue || isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('continueButton')}
          </Button>
          <div className="h-6 mt-2 flex items-center">
            {showValidationError && (
                <p className="text-sm text-destructive animate-in fade-in-0">
                    {t('step1ValidationError')}
                </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
