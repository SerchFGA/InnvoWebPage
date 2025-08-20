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

const doctors: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Pablo Carvajal',
    services: 'HOMEOPATIA, OSTEOPATIA',
    duration: '60 min session',
    image: '/assets/DrPabloCarvajal.png',
  },
  {
    id: 2,
    name: 'Dr. ALFONSO CARVAJAL',
    services: 'HOMEOPATIA, TRAUMATOLOGIA, OSTEOPATIA',
    duration: '30 min session',
    image: 'https://placehold.co/80x80.png',
  },
  {
    id: 3,
    name: 'REVISIONES PODOACTIVA',
    services: 'REVISIONES DE PLANTILLAS',
    duration: '30 min session',
    image: 'https://placehold.co/80x80.png',
  },
  {
    id: 4,
    name: 'ESTUDIO BIOMECANICO',
    services: 'ESTUDIO DE LA PISADA',
    duration: '60 min session',
    image: 'https://placehold.co/80x80.png',
  },
  {
    id: 5,
    name: 'QUIROPODIA',
    services: 'CUIDADOS DEL PIE',
    duration: '30 min session',
    image: 'https://placehold.co/80x80.png',
  },
  {
    id: 6,
    name: 'FISIOTERAPIA 01',
    services: 'REHABILITACION FISICA',
    duration: '60 min session',
    image: 'https://placehold.co/80x80.png',
  },
];

interface Step1Props {
  onNext: (data: { doctor: Doctor; date: Date }) => void;
  data: BookingData;
  isSubmitting: boolean;
}

export function Step1SelectDoctorAndDate({ onNext, data, isSubmitting }: Step1Props) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(data.doctor);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(data.date ?? undefined);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { t, language } = useTranslation();

  const getDoctorDuration = (doctor: Doctor) => {
    if (language === 'es') {
      if (doctor.duration.includes('60')) return 'Sesión de 60 min';
      if (doctor.duration.includes('30')) return 'Sesión de 30 min';
    }
    return doctor.duration;
  };
  
  useEffect(() => {
    setIsMounted(true);
    if(data.doctor || data.date) {
      setHasInteracted(true);
    }
  }, [data.doctor, data.date]);

  useEffect(() => {
    if (isMounted && !data.date) {
      const today = new Date();
      if (today.getDay() !== 0) { // Not Sunday
        setSelectedDate(today);
      } else { // If today is Sunday, select next day
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow);
      }
    }
  }, [isMounted, data.date]);

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
    <Card className="w-full animate-in fade-in-50 duration-500 shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{t('step1Title')}</CardTitle>
        <CardDescription>{t('step1Description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column: Calendar */}
          <div className="w-full lg:w-1/2 flex justify-center items-start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={
                !isMounted
                  ? () => true
                  : (date) =>
                      date < new Date(new Date().setDate(new Date().getDate() - 1)) ||
                      date.getDay() === 0
              }
              initialFocus
              className="rounded-xl border shadow-lg"
            />
          </div>

          {/* Right Column: Doctor List */}
          <div className="w-full lg:w-1/2">
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  onClick={() => handleDoctorSelect(doctor)}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-xl hover:border-primary',
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
                      <p className="text-sm text-muted-foreground">{doctor.services}</p>
                      <p className="text-sm text-muted-foreground mt-1">{getDoctorDuration(doctor)}</p>
                    </div>
                    <Button variant={selectedDoctor?.id === doctor.id ? 'default' : 'outline'} className="hidden sm:inline-flex rounded-full">
                      {t('selectButton')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Continue Button Section */}
        <div className="flex flex-col items-end mt-8">
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
