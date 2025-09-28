'use client';

import { useState } from 'react';
import type { z } from 'zod';
import { format } from 'date-fns';
import getConfig from 'next/config';

import { Step1SelectDoctorAndDate } from '@/components/booking/step1-select-doctor-and-date';
import { Step2SelectTime } from '@/components/booking/step2-select-time';
import { Step3ConfirmAppointment } from '@/components/booking/step3-confirm-appointment';
import { Step4Success } from '@/components/booking/step4-success';
import type { doctorSchema, patientDetailsSchema } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/contexts/language-context';
import { ProgressIndicator } from '@/components/layout/progress-indicator';

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

const { publicRuntimeConfig } = getConfig();
const N8N_AVAILABLE_TIMES_WEBHOOK_URL = publicRuntimeConfig.N8N_AVAILABLE_TIMES_WEBHOOK_URL;

export default function Home() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);
  const [isStep1Submitting, setIsStep1Submitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleStep1Submit = async (data: { doctor: Doctor; date: Date }) => {
    setIsStep1Submitting(true);
    
    if (!N8N_AVAILABLE_TIMES_WEBHOOK_URL) {
      toast({
        variant: "destructive",
        title: t('errorTitle'),
        description: "Configuration error: Webhook URL is not set.",
      });
      setIsStep1Submitting(false);
      return;
    }
    
    try {
      const payload = {
        doctor: data.doctor.name,
        doctor_id: data.doctor.id,
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
      
      const rawHours = responseData?.hours || [];

      // Ensure hours are strings and sort them
      const hours = rawHours
        .filter((h: unknown): h is string => typeof h === 'string')
        .sort((a: string, b: string) => a.localeCompare(b));
      
      if (hours.length === 0) {
        toast({
          variant: 'destructive',
          title: t('noTimeSlotsTitle'),
          description: t('noTimeSlotsDescription'),
        });
        setIsStep1Submitting(false);
        return;
      }
      
      // Format hours from "13:00" to "1:00 PM"
      const availableTimes = hours.map((hourString) => {
        const [hour, minute] = hourString.split(':');
        const d = new Date();
        d.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
        return format(d, 'p'); // 'p' formats to locale-specific time like "1:00 PM"
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
        title: t('errorTitle'),
        description: t('errorDescription'),
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
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <ProgressIndicator currentStep={step} />
        
        <div className="mt-8">
          {step === 1 && <Step1SelectDoctorAndDate onNext={handleStep1Submit} data={bookingData} isSubmitting={isStep1Submitting} />}
          {step === 2 && <Step2SelectTime onNext={handleStep2Submit} onBack={prevStep} data={bookingData} />}
          {step === 3 && <Step3ConfirmAppointment onNext={handleStep3Submit} onBack={prevStep} data={bookingData} />}
          {step === 4 && <Step4Success onReset={handleReset} data={bookingData} />}
        </div>

      </div>
    </div>
  );
}
