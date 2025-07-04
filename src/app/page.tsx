'use client';

import { useState } from 'react';
import type { z } from 'zod';
import { format } from 'date-fns';

import { Step1SelectDoctorAndDate } from '@/components/booking/step1-select-doctor-and-date';
import { Step2SelectTime } from '@/components/booking/step2-select-time';
import { Step3ConfirmAppointment } from '@/components/booking/step3-confirm-appointment';
import { Step4Success } from '@/components/booking/step4-success';
import type { doctorSchema, patientDetailsSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

export type Doctor = z.infer<typeof doctorSchema>;
export type PatientDetails = z.infer<typeof patientDetailsSchema>;

export type BookingData = {
  doctor: Doctor | null;
  date: Date | null;
  time: string | null;
  patientDetails: PatientDetails | null;
  availableTimes: string[] | null;
};

const initialBookingData: BookingData = {
  doctor: null,
  date: null,
  time: null,
  patientDetails: null,
  availableTimes: null,
};

const N8N_AVAILABLE_TIMES_WEBHOOK_URL = 'https://devn8n.pixanai.com/webhook-test/2b5931c9-e16b-4f37-a18f-da1cfda5ec10';

export default function Home() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);
  const [isStep1Submitting, setIsStep1Submitting] = useState(false);
  const { toast } = useToast();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleStep1Submit = async (data: { doctor: Doctor; date: Date }) => {
    setIsStep1Submitting(true);
    try {
      const payload = {
        doctor: data.doctor.name,
        Fecha: format(data.date, 'yyyy-MM-dd'),
      };

      const response = await fetch(N8N_AVAILABLE_TIMES_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Server responded with an error.');
      }

      const responseData = await response.json();
      const rawHours = responseData?.response?.body?.['availableHours'] || [];
      const hours = rawHours
        .filter((h: unknown): h is number => typeof h === 'number')
        .sort((a: number, b: number) => a - b);

      if (hours.length === 0) {
        toast({
          variant: 'destructive',
          title: 'No Time Slots',
          description: 'No available time slots for this doctor on the selected date.',
        });
        return;
      }
      
      const availableTimes = hours.map((hour) => {
        const d = new Date();
        d.setHours(hour, 0, 0, 0);
        return format(d, 'p');
      });
      
      setBookingData((prev) => ({ 
        ...prev, 
        doctor: data.doctor, 
        date: data.date, 
        availableTimes 
      }));
      nextStep();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "Unable to retrieve available hours. Please try again.",
      });
    } finally {
      setIsStep1Submitting(false);
    }
  };

  const handleStep2Submit = (data: { time: string }) => {
    setBookingData((prev) => ({ ...prev, time: data.time }));
    nextStep();
  };

  const handleStep3Submit = (data: { patientDetails: PatientDetails }) => {
    setBookingData((prev) => ({ ...prev, patientDetails: data.patientDetails }));
    nextStep();
  };

  const handleReset = () => {
    setBookingData(initialBookingData);
    setStep(1);
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-headline text-foreground">
            MediBook MVP
          </h1>
          <p className="text-muted-foreground mt-2">
            Medical Appointment Scheduler
          </p>
        </div>
        
        {step === 1 && <Step1SelectDoctorAndDate onNext={handleStep1Submit} data={bookingData} isSubmitting={isStep1Submitting} />}
        {step === 2 && <Step2SelectTime onNext={handleStep2Submit} onBack={prevStep} data={bookingData} />}
        {step === 3 && <Step3ConfirmAppointment onNext={handleStep3Submit} onBack={prevStep} data={bookingData} />}
        {step === 4 && <Step4Success onReset={handleReset} data={bookingData} />}

      </div>
    </main>
  );
}
