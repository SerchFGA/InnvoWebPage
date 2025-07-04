'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { patientDetailsSchema } from '@/lib/schemas';
import type { BookingData, PatientDetails } from '@/app/page';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from '@/contexts/language-context';

interface Step3Props {
  onNext: (data: { patientDetails: PatientDetails }) => void;
  onBack: () => void;
  data: BookingData;
}
const N8N_WEBHOOK_URL = 'https://devn8n.pixanai.com/webhook/ScheduleAppointmentInnvo';

export function Step3ConfirmAppointment({ onNext, onBack, data }: Step3Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTranslation();
  
  const form = useForm<z.infer<typeof patientDetailsSchema>>({
    resolver: zodResolver(patientDetailsSchema(t)),
    defaultValues: {
      fullName: data.patientDetails?.fullName ?? '',
      phone: data.patientDetails?.phone ?? '+52',
      reason: data.patientDetails?.reason ?? '',
      notes: data.patientDetails?.notes ?? '',
    },
  });

  async function onSubmit(values: z.infer<typeof patientDetailsSchema>) {
    setIsSubmitting(true);
    const payload = {
      doctor: data.doctor?.name,
      duration: data.doctor?.duration,
      date: data.date ? format(data.date, 'yyyy-MM-dd') : '',
      time: data.time,
      full_name: values.fullName,
      phone: values.phone,
      reason: values.reason,
      notes: values.notes,
    };

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to schedule appointment. The server returned an error.'}));
        throw new Error(errorData.message || 'Failed to schedule appointment. Please try again.');
      }
      
      onNext({ patientDetails: values });

    } catch (error) {
      toast({
        variant: "destructive",
        title: t('errorTitle'),
        description: error instanceof Error ? error.message : t('unknownError'),
      })
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!data.doctor || !data.date || !data.time) {
    return <p>{t('missingInfo')}</p>;
  }

  const formattedDate = format(data.date, 'EEEE, d MMMM', {
    locale: language === 'es' ? es : undefined,
  });

  return (
    <Card className="w-full animate-in fade-in-50 duration-500 shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">{t('step3Title')}</CardTitle>
        <CardDescription>
          {t('step3Description', { doctor: data.doctor.name, date: formattedDate, time: data.time })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fullNameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('fullNamePlaceholder')} {...field} aria-label={t('fullNameLabel')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phoneLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder="+525512345678" {...field} aria-label={t('phoneLabel')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reasonLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('reasonPlaceholder')} {...field} aria-label={t('reasonLabel')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notesLabel')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('notesPlaceholder')} {...field} aria-label={t('notesLabel')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center mt-8">
              <Button variant="outline" onClick={onBack} type="button" disabled={isSubmitting} className="w-full sm:w-auto rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backButton')}
              </Button>
              <Button size="lg" type="submit" disabled={isSubmitting} className="w-full sm:w-auto btn-gradient rounded-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('scheduleButton')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
