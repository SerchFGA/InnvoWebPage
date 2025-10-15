
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
import type { Appointment } from '@/app/patients/search/page';
import { format, parse, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { rescheduleAppointment } from '@/app/patients/search/actions';

interface RescheduleWizardProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  patientData: {
    patientName: string;
    phone: string;
  };
  onRescheduleSuccess: (appointmentId: number, newDate: string, newCalendarId: string | undefined) => void;
}

function getOffsetFromISOString(dateString: string): string {
    const match = dateString.match(/([+-]\d{2}:\d{2})$/);
    if (match) {
        return match[1];
    }
    // Default to Mexico City if no offset is found
    return '-06:00';
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

  const handleFetchTimes = async () => {
    if (!selectedDate) return;
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
          Fecha: format(selectedDate, 'yyyy-MM-dd'),
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
      const timeDate = parse(selectedTime, 'p', new Date());
      
      const newDateWithTime = new Date(selectedDate);
      newDateWithTime.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
      
      const offset = getOffsetFromISOString(appointment.start);
      const dateForBackend = format(newDateWithTime, `yyyy-MM-dd'T'HH:mm:ss`) + offset;

      const payload = {
        CalendarID: appointment.calendarId,
        FechaCitaCancelar: appointment.start,
        TelefonoUsuario: patientData.phone,
        ID_Doctor: Number(appointment.doctorId),
        NombrePaciente: patientData.patientName,
        MotivoCita: appointment.motive,
        FechaCitaNueva: dateForBackend,
      };

      const result = await rescheduleAppointment(payload);

      if (result.success) {
        toast({ title: t('toast.reschedule.success')});
        const newIsoDateForUI = newDateWithTime.toISOString().replace('Z', offset);
        onRescheduleSuccess(appointment.appointmentId, newIsoDateForUI, result.data?.newCalendarId);
      } else {
        const errorMessage = result.message || t('toast.reschedule.error');
        toast({ variant: 'destructive', title: 'Error al reagendar', description: errorMessage });
      }
    });
  };

  const currentFormattedDate = format(parseISO(appointment.start), 'EEEE, d MMMM yyyy @ p', { locale: language === 'es' ? es : undefined });
  const newFormattedDate = selectedDate && selectedTime ? format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), parse(selectedTime, 'p', new Date()).getHours(), parse(selectedTime, 'p', new Date()).getMinutes()), 'EEEE, d MMMM yyyy @ p', { locale: language === 'es' ? es : undefined }) : '';


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
            <div className="flex flex-col items-center py-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1)) || date.getDay() === 0}
                initialFocus
              />
            </div>
            <DialogFooter>
              <Button
                  onClick={handleFetchTimes}
                  disabled={!selectedDate || isFetchingTimes}
                  className="w-full btn-gradient"
              >
                  {isFetchingTimes ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {t('continueButton')}
              </Button>
            </DialogFooter>
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
              <DialogDescription>
                  Confirma los detalles para reagendar la cita de <strong>{patientData.patientName}</strong> ({patientData.phone}).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-center mb-2">{t('reschedule.summary.current')}</h4>
                <p className="text-sm text-center">{currentFormattedDate}</p>
                <p className="text-xs text-center text-muted-foreground mt-1">ID: {appointment.calendarId}</p>
              </div>
              <div className="p-4 border rounded-lg bg-secondary">
                <h4 className="font-semibold text-center mb-2">{t('reschedule.summary.new')}</h4>
                <p className="text-sm text-center font-bold">{newFormattedDate}</p>
              </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={prevStep} disabled={isSubmitting}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('backButton')}
                </Button>
                <Button onClick={handleConfirmReschedule} disabled={!selectedDate || !selectedTime || isSubmitting} className="btn-gradient">
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

    