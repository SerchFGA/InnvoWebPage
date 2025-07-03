'use client';

import { useState } from 'react';
import type { z } from 'zod';

import { Step1SelectDoctorAndDate } from '@/components/booking/step1-select-doctor-and-date';
import { Step2SelectTime } from '@/components/booking/step2-select-time';
import { Step3ConfirmAppointment } from '@/components/booking/step3-confirm-appointment';
import { Step4Success } from '@/components/booking/step4-success';
import type { doctorSchema, patientDetailsSchema } from '@/lib/schemas';

export type Doctor = z.infer<typeof doctorSchema>;
export type PatientDetails = z.infer<typeof patientDetailsSchema>;

export type BookingData = {
  doctor: Doctor | null;
  date: Date | null;
  time: string | null;
  patientDetails: PatientDetails | null;
};

const initialBookingData: BookingData = {
  doctor: null,
  date: null,
  time: null,
  patientDetails: null,
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleStep1Submit = (data: { doctor: Doctor; date: Date }) => {
    setBookingData((prev) => ({ ...prev, doctor: data.doctor, date: data.date }));
    nextStep();
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
        
        {step === 1 && <Step1SelectDoctorAndDate onNext={handleStep1Submit} data={bookingData} />}
        {step === 2 && <Step2SelectTime onNext={handleStep2Submit} onBack={prevStep} data={bookingData} />}
        {step === 3 && <Step3ConfirmAppointment onNext={handleStep3Submit} onBack={prevStep} data={bookingData} />}
        {step === 4 && <Step4Success onReset={handleReset} data={bookingData} />}

      </div>
    </main>
  );
}
