
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, User, Calendar as CalendarIcon, Hash, Tag, Activity, Phone } from 'lucide-react';

import { useTranslation } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { searchPatientByPhone, cancelAppointment, type PatientData } from './actions';
import { RescheduleWizard } from '@/components/booking/reschedule-wizard';

export type Appointment = PatientData['appointments'][0];

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  const { t } = useTranslation();

  return (
    <Button type="submit" className="w-full sm:w-auto btn-gradient rounded-full" disabled={pending || disabled}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {t('search_cta')}
    </Button>
  );
}

function PatientCard({ patient }: { patient: PatientData }) {
    const { t } = useTranslation();
    return (
        <Card className="mt-8 animate-in fade-in-50 duration-500 shadow-lg rounded-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="w-6 h-6 text-primary"/>
                    {t('search_patient_info')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="font-semibold text-lg">{patient.patientName}</p>
                <p className="text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4"/>
                    {patient.phone}
                </p>
            </CardContent>
        </Card>
    );
}

function AppointmentCard({ 
  appointment, 
  patientData, 
  onCancelSuccess, 
  onRescheduleSuccess 
}: { 
  appointment: Appointment, 
  patientData: { patientName: string, phone: string }, 
  onCancelSuccess: (id: number) => void, 
  onRescheduleSuccess: (id: number, newDate: string, newCalendarId: string | undefined) => void 
}) {
    const { t, language } = useTranslation();
    const { toast } = useToast();
    const [isCanceling, startCancelTransition] = useTransition();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');
    const [rescheduleWizardOpen, setRescheduleWizardOpen] = useState(false);

    useEffect(() => {
        const dateObj = new Date(appointment.start);
        setFormattedDate(dateObj.toLocaleString(language === 'es' ? 'es-MX' : 'en-US', {
            dateStyle: 'full',
            timeStyle: 'short',
        }));
    }, [appointment.start, language]);
    
    const handleCancelClick = () => {
      setIsAlertOpen(true);
    };

    const handleConfirmCancel = () => {
      startCancelTransition(async () => {
        const result = await cancelAppointment({
          CalendarID: appointment.calendarId,
          FechaCita: appointment.start,
          ID_Doctor: Number(appointment.doctorId),
          TelefonoUsuario: patientData.phone,
        });

        if (result.success) {
          toast({ title: t('toast.cancel.success')});
          onCancelSuccess(appointment.appointmentId);
        } else {
          const errorMessage = result.error === 'rate-limited' ? 'Demasiadas solicitudes, intente más tarde.' : t('toast.cancel.error');
          toast({ variant: 'destructive', title: errorMessage });
        }
        setIsAlertOpen(false);
      });
    }

    const handleRescheduleSuccess = (newDate: string, newCalendarId: string | undefined) => {
        onRescheduleSuccess(appointment.appointmentId, newDate, newCalendarId);
        setRescheduleWizardOpen(false);
    }
    
    const a11yCancelLabel = t('appt_a11y_cancel', {
        service: appointment.service,
        doctorId: appointment.doctorId,
        start: formattedDate
    });

    const a11yRescheduleLabel = t('appt_a11y_reschedule', {
        service: appointment.service,
        doctorId: appointment.doctorId,
        start: formattedDate
    });

    const isCancelled = appointment.status.toLowerCase() === 'cancelada';

    return (
      <>
        <Card className={cn("shadow-md rounded-lg flex flex-col transition-opacity", isCancelled && "opacity-60 bg-muted/50")} data-appointment-id={appointment.appointmentId}>
            <CardContent className="p-4 flex-grow flex flex-col">
                <div className='flex-grow'>
                    <p className="font-bold text-lg text-primary">{appointment.service}</p>
                     <div className="text-sm text-muted-foreground space-y-2 mt-2">
                        <p className="flex items-center gap-2"><Activity className="w-4 h-4"/> <strong>Status:</strong> {appointment.status}</p>
                        <p className="flex items-center gap-2"><Tag className="w-4 h-4"/> <strong>Doctor ID:</strong> {appointment.doctorId}</p>
                        <p className="flex items-center gap-2"><CalendarIcon className="w-4 h-4"/> {formattedDate}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-auto pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto min-w-28"
                        data-action="cancel"
                        aria-label={a11yCancelLabel}
                        onClick={handleCancelClick}
                        disabled={isCancelled}
                    >
                        {t('appt_actions_cancel')}
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="w-full sm:w-auto min-w-28 btn-gradient"
                        data-action="reschedule"
                        aria-label={a11yRescheduleLabel}
                        disabled={isCancelled}
                        onClick={() => setRescheduleWizardOpen(true)}
                    >
                        {t('appt_actions_reschedule')}
                    </Button>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1 pt-2"><Hash className="w-3 h-3"/> {appointment.calendarId}</p>
            </CardContent>
        </Card>
        
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('cancel.title')}</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-2 text-left py-2">
                        <div><strong>{t('search_patient_info')}:</strong> {appointment.service}</div>
                        <div><strong>Doctor ID:</strong> {appointment.doctorId}</div>
                        <div><strong>Fecha y hora:</strong> {formattedDate}</div>
                        <div><strong>Calendar ID:</strong> {appointment.calendarId}</div>
                      </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCanceling}>{t('cancel.close')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirmCancel}
                        disabled={isCanceling}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        aria-label="Confirmar cancelación de la cita"
                    >
                        {isCanceling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('cancel.confirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        {rescheduleWizardOpen && (
            <RescheduleWizard 
                isOpen={rescheduleWizardOpen}
                onOpenChange={setRescheduleWizardOpen}
                appointment={appointment}
                patientData={{ patientName: patientData.patientName, phone: patientData.phone }}
                onRescheduleSuccess={handleRescheduleSuccess}
            />
        )}
      </>
    )
}

export default function PatientSearchPage() {
  const { t } = useTranslation();
  const [state, formAction] = useActionState(searchPatientByPhone, null);
  
  const [countryCode, setCountryCode] = useState('52');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  useEffect(() => {
    if (state?.success && state.data) {
      setPatientData(state.data);
    } else if(state?.success && !state.data) {
      setPatientData(null);
    }
  }, [state]);

  const handleCancelSuccess = (appointmentId: number) => {
    setPatientData(prevData => {
      if (!prevData) return null;
      return {
        ...prevData,
        appointments: prevData.appointments.map(app => 
          app.appointmentId === appointmentId ? { ...app, status: 'Cancelada' } : app
        ),
      };
    });
  };

  const handleRescheduleSuccess = (appointmentId: number, newDate: string, newCalendarId: string | undefined) => {
    setPatientData(prevData => {
        if (!prevData) return null;
        return {
            ...prevData,
            appointments: prevData.appointments.map(app => 
                app.appointmentId === appointmentId 
                ? { ...app, start: newDate, calendarId: newCalendarId ?? app.calendarId } 
                : app
            ),
        };
    });
  };

  const handleNumericInput = (setter: (value: string) => void, maxLength: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= maxLength) {
      setter(numericValue);
    }
  };

  const isSubmitDisabled = phoneNumber.length !== 10;

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl">
        <Card className="w-full animate-in fade-in-50 duration-500 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{t('search_title')}</CardTitle>
            <CardDescription>{t('search_subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-end gap-2">
                <div className="space-y-2 w-full sm:w-auto">
                    <Label htmlFor="countryCode">{t('search_labels_cc')}</Label>
                    <Input 
                        id="countryCode" 
                        name="countryCode"
                        value={countryCode}
                        onChange={handleNumericInput(setCountryCode, 3)}
                        className="w-20 text-center"
                    />
                </div>
                <div className="space-y-2 w-full sm:w-auto">
                    <Label htmlFor="fixed">{t('search_labels_fixed')}</Label>
                    <Input id="fixed" name="fixed" value="1" readOnly className="w-12 text-center bg-muted"/>
                </div>
                <div className="space-y-2 flex-grow">
                    <Label htmlFor="phoneNumber">{t('search_labels_number10')}</Label>
                    <Input 
                        id="phoneNumber" 
                        name="phoneNumber" 
                        value={phoneNumber}
                        onChange={handleNumericInput(setPhoneNumber, 10)}
                        placeholder="5512345678"
                        maxLength={10}
                    />
                </div>
                <SubmitButton disabled={isSubmitDisabled} />
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
            {state?.success === false && (
                <div className="text-center p-4 rounded-lg bg-destructive/10 text-destructive font-medium">
                    {t(state.error === 'invalid-input' ? 'search_errors_invalidInput' : 'search_errors_server')}
                </div>
            )}

            {patientData && (
                <>
                    <PatientCard patient={patientData} />
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {patientData.appointments.map(app => (
                            <AppointmentCard 
                                key={app.appointmentId} 
                                appointment={app} 
                                patientData={{ patientName: patientData.patientName, phone: patientData.phone }}
                                onCancelSuccess={handleCancelSuccess} 
                                onRescheduleSuccess={handleRescheduleSuccess}
                            />
                        ))}
                    </div>
                </>
            )}

            {state?.success === true && !state.data && !patientData && (
                 <div className="text-center p-8 rounded-lg bg-secondary/50 text-muted-foreground font-medium">
                    {t('search_empty')}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

    