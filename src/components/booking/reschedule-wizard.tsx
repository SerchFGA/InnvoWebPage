
'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/contexts/language-context';
import type { Appointment, PatientData } from '@/app/patients/search/page';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { rescheduleAppointment } from '@/app/patients/search/actions';

interface RescheduleWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  patientData: PatientData;
  onRescheduleSuccess: (appointmentId: number, newDate: string, newCalendarId: string | undefined) => void;
}

export function RescheduleWizard({
  isOpen,
  onOpenChange,
  appointment,
  patientData,
  onRescheduleSuccess,
}: RescheduleWizardProps) {
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [isFetchingTimes, setIsFetchingTimes] = useState(false);
  const [isSubmitting, startRescheduleTransition] = useTransition();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const N8N_AVAILABLE_TIMES_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_AVAILABLE_TIMES_WEBHOOK_URL;

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setIsFetchingTimes(true);
    setSelectedTime(null);
    setAvailableTimes([]);

    if (!N8N_AVAILABLE_TIMES_WEBHOOK_URL) {
      toast({ variant: 'destructive', title: t('errorTitle'), description: 'Configuration error: Webhook URL is not set.' });
      setIsFetchingTimes(false);
      return;
    }

    try {
      const response = await fetch(N8N_AVAILABLE_TIMES_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: Number(appointment.doctorId),
          Fecha: format(date, 'yyyy-MM-dd'),
        }),
      });

      if (!response.ok) throw new Error('Server responded with an error.');
      
      const responseData = await response.json();
      const rawHours = responseData?.hours || [];
      const hours = rawHours.filter((h: unknown): h is string => typeof h === 'string').sort((a: string, b: string) => a.localeCompare(b));
      
      if (hours.length === 0) {
        toast({ variant: 'destructive', title: t('noTimeSlotsTitle'), description: t('noTimeSlotsDescription') });
      } else {
          const formattedTimes = hours.map((hourString: string) => {
            const [hour, minute] = hourString.split(':');
            const d = new Date();
            d.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
            return format(d, 'p');
          });
          setAvailableTimes(formattedTimes);
          nextStep();
      }
    } catch (error) {
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('errorDescription') });
    } finally {
      setIsFetchingTimes(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    nextStep();
  };

  const handleConfirmReschedule = () => {
    if (!selectedDate || !selectedTime) return;

    startRescheduleTransition(async () => {
      const [hour, minutePart] = selectedTime.split(':');
      const [minute] = minutePart.split(' ');
      const isPM = selectedTime.includes('PM');

      let hour24 = parseInt(hour, 10);
      if (isPM && hour24 !== 12) {
        hour24 += 12;
      }
      if (!isPM && hour24 === 12) {
        hour24 = 0;
      }
      
      const newDate = new Date(selectedDate);
      newDate.setHours(hour24, parseInt(minute, 10), 0, 0);

      const result = await rescheduleAppointment({
        CalendarID: appointment.calendarId,
        FechaCitaCancelar: appointment.start,
        TelefonoUsuario: patientData.phone,
        ID_Doctor: Number(appointment.doctorId),
        NombrePaciente: patientData.patientName,
        MotivoCita: appointment.motive,
        FechaCitaNueva: newDate.toISOString(),
      });

      if (result.success) {
        toast({ title: t('toast.reschedule.success')});
        onRescheduleSuccess(appointment.appointmentId, newDate.toISOString(), result.data?.newCalendarId);
      } else {
        toast({ variant: 'destructive', title: t('toast.reschedule.error') });
      }
    });
  };

  const currentFormattedDate = format(parseISO(appointment.start), 'EEEE, d MMMM yyyy @ p', { locale: language === 'es' ? es : undefined });
  const newFormattedDate = selectedDate && selectedTime ? format(selectedDate, 'EEEE, d MMMM yyyy', { locale: language === 'es' ? es : undefined }) + ` @ ${selectedTime}` : '';


  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('reschedule.step1.title')}</DialogTitle>
              <DialogDescription>
                {t('step2Description')} {appointment.service}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) || date.getDay() === 0}
                initialFocus
              />
            </div>
            {isFetchingTimes && <div className="flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          </>
        );
      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('reschedule.step2.title')}</DialogTitle>
              <DialogDescription>
                {t('step2Description')} {appointment.service} on {selectedDate ? format(selectedDate, 'PPP', { locale: language === 'es' ? es : undefined }) : ''}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-4 max-h-64 overflow-y-auto">
              {availableTimes.map((time) => (
                <Button key={time} variant="outline" onClick={() => handleTimeSelect(time)}>
                  {time}
                </Button>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backButton')}
              </Button>
            </DialogFooter>
          </>
        );
      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle>{t('reschedule.step3.title')}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="font-semibold">{t('reschedule.summary.current')}:</div>
                <div>{currentFormattedDate}</div>
                <div className="font-semibold">{t('reschedule.summary.new')}:</div>
                <div>{newFormattedDate}</div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backButton')}
              </Button>
              <Button onClick={handleConfirmReschedule} disabled={isSubmitting} className="btn-gradient">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('reschedule.confirm')}
              </Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedDate(undefined);
      setSelectedTime(null);
      setAvailableTimes([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}

    