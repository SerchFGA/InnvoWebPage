'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { patientDetailsSchema } from '@/lib/schemas';
import type { BookingData, PatientDetails } from '@/app/page';
import { useToast } from "@/hooks/use-toast"

interface Step3Props {
  onNext: (data: { patientDetails: PatientDetails }) => void;
  onBack: () => void;
  data: BookingData;
}

const N8N_WEBHOOK_URL = 'https://devn8n.pixanai.com/webhook-test/PodactivaExternalCalendar';

export function Step3ConfirmAppointment({ onNext, onBack, data }: Step3Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof patientDetailsSchema>>({
    resolver: zodResolver(patientDetailsSchema),
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
        title: "Oh no! Something went wrong.",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      })
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!data.doctor || !data.date || !data.time) {
    return <p>Missing appointment information. Please go back.</p>;
  }

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle>Confirm Your Appointment</CardTitle>
        <CardDescription>
          Please provide your details for your appointment with <span className="font-semibold text-primary">{data.doctor.name}</span> on <span className="font-semibold text-primary">{format(data.date, 'EEEE, d MMMM')}</span> at <span className="font-semibold text-primary">{data.time}</span>.
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
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+525512345678" {...field} />
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
                  <FormLabel>Reason for Appointment</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., General Checkup" {...field} />
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional information for the doctor..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center mt-8">
              <Button variant="outline" onClick={onBack} type="button" disabled={isSubmitting} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button size="lg" type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Schedule Appointment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
