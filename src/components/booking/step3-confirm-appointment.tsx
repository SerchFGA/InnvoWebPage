'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { format, parse } from 'date-fns';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { es } from 'date-fns/locale';
import getConfig from 'next/config';

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
const { publicRuntimeConfig } = getConfig();
const N8N_WEBHOOK_URL = publicRuntimeConfig.N8N_SCHEDULE_APPOINTMENT_WEBHOOK_URL;

export function Step3ConfirmAppointment({ onNext, onBack, data }: Step3Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t, language } = useTranslation();
  
  const form = useForm<z.infer<typeof patientDetailsSchema>>({
    resolver: zodResolver(patientDetailsSchema(t)),
    defaultValues: {
      fullName: data.patientDetails?.fullName ?? '',
      phone: data.patientDetails?.phone ?? '',
      reason: data.patientDetails?.reason ?? '',
      notes: data.patientDetails?.notes ?? '',
    },
  });

  async function onSubmit(values: z.infer<typeof patientDetailsSchema>) {
    setIsSubmitting(true);
    
    if (!N8N_WEBHOOK_URL) {
      toast({
        variant: "destructive",
        title: t('errorTitle'),
        description: "Configuration error: Webhook URL is not set.",
      });
      setIsSubmitting(false);
      return;
    }
    
    let timeString = '';
    if (data.time) {
      try {
        const timeAsDate = parse(data.time, 'p', new Date());
        timeString = format(timeAsDate, 'HH:mm');
      } catch (e) {
        console.error("Could not parse time:", data.time);
      }
    }

    const payload = {
      doctor_id: data.doctor?.id,
      doctor: data.doctor?.name,
      Fecha: data.date ? format(data.date, 'yyyy-MM-dd') : '',
      Hora: timeString,
      duration: data.doctor?.duration,
      full_name: values.fullName,
      phone: `+52${values.phone}`,
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
      
      onNext({ patientDetails: { ...values, phone: `+52${values.phone}` } });

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
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-secondary text-muted-foreground text-sm">
                        +52
                      </span>
                      <Input
                        type="tel"
                        placeholder="5512345678"
                        {...field}
                        onChange={(e) => {
                          const { value } = e.target;
                          // Allow only digits and limit to 10
                          const numericValue = value.replace(/\D/g, '').slice(0, 10);
                          field.onChange(numericValue);
                        }}
                        className="rounded-l-none"
                        aria-label={t('phoneLabel')}
                      />
                    </div>
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
