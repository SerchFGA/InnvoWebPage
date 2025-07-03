# **App Name**: MediBook MVP

## Core Features:

- Doctor Selection Cards: Displays two cards on the right side with profile pictures and duration information for each doctor
- Monthly Calendar Display: Displays a monthly calendar on the left for date selection.
- Time Slot Display: Displays available time slots for the selected doctor in 1hr/30min steps. The display responds to doctor choice.
- Appointment Details Form: Gathers appointment details, validates the full name field, and phone number before submission.
- N8N Webhook Integration: Sends the form data to an N8N webhook to finalize the scheduling of an appointment.
- Appointment Confirmation Display: Shows the checkmark and message, "Your appointment with [Doctor] on [Date] at [Time] has been scheduled."

## Style Guidelines:

- Primary color: Blue (#1E88E5) for buttons to create a professional and trustworthy look, fitting for a medical application.
- Background color: Light Blue (#E3F2FD), very desaturated to provide a clean, calm backdrop without distracting from content.
- Accent color: Green (#43A047) for success confirmations, giving a positive and reassuring message upon completing the schedule.
- Font pairing: 'Inter' (sans-serif) for both body and headlines. This choice aligns with the minimalist style requested by the user and suits medical UI due to its clean and readable design. Note: currently only Google Fonts are supported.
- Cards with soft shadows and rounded corners for doctor selection, calendar display, and time slot options.
- Wizard flow using 'Continue' and 'Back' buttons, with visual feedback through highlighting on selections.