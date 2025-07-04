export const translations = {
  en: {
    // Progress Bar
    progressStep1: 'Select Doctor & Date',
    progressStep2: 'Select Time',
    progressStep3: 'Your Details',
    progressStep4: 'Confirmation',
    
    // Buttons
    continueButton: 'Continue',
    backButton: 'Back',
    selectButton: 'Select',
    scheduleButton: 'Schedule Appointment',
    startOverButton: 'Start Over',
    scheduleAnotherButton: 'Schedule Another Appointment',
    
    // Step 1
    step1Title: 'Select Doctor and Date',
    step1Description: 'Choose a specialist and a preferred date for your appointment.',
    step1ValidationError: 'Please select a doctor and a date.',
    
    // Step 2
    step2Title: 'Select a Time Slot',
    step2Description: 'Available times for',
    
    // Step 3
    step3Title: 'Confirm Your Appointment',
    step3Description: 'Please provide your details for your appointment with {{doctor}} on {{date}} at {{time}}.',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g., John Doe',
    phoneLabel: 'Phone Number',
    reasonLabel: 'Reason for Appointment',
    reasonPlaceholder: 'e.g., General Checkup',
    notesLabel: 'Notes (Optional)',
    notesPlaceholder: 'Any additional information for the doctor...',
    
    // Step 4
    step4Title: 'Appointment Confirmed!',
    step4Description: 'Your appointment with {{doctor}} on {{date}} at {{time}} has been successfully scheduled.',
    
    // Toasts & Errors
    noTimeSlotsTitle: 'No Time Slots',
    noTimeSlotsDescription: 'No available time slots for this doctor on the selected date.',
    errorTitle: 'Oh no! Something went wrong.',
    errorDescription: 'Unable to retrieve available hours. Please try again.',
    unknownError: 'An unknown error occurred.',
    missingInfo: 'Missing appointment information. Please go back.',

    // Form Validation
    fullNameMin: 'Full name must be at least 3 characters.',
    phoneRegex: 'Phone number must be 10 digits and start with +52.',
    reasonRequired: 'Reason for appointment is required.',
    
    // Footer
    footerAllRightsReserved: 'All rights reserved.',
    footerPrivacyPolicy: 'Privacy Policy',
    footerTerms: 'Terms & Conditions',
    footerAccessibility: 'Accessibility',
    footerPoweredBy: 'Powered by'
  },
  es: {
    // Progress Bar
    progressStep1: 'Seleccionar Doctor y Fecha',
    progressStep2: 'Seleccionar Hora',
    progressStep3: 'Tus Datos',
    progressStep4: 'Confirmación',
    
    // Buttons
    continueButton: 'Continuar',
    backButton: 'Atrás',
    selectButton: 'Seleccionar',
    scheduleButton: 'Agendar Cita',
    startOverButton: 'Comenzar de Nuevo',
    scheduleAnotherButton: 'Agendar Otra Cita',
    
    // Step 1
    step1Title: 'Selecciona Doctor y Fecha',
    step1Description: 'Elige un especialista y una fecha preferida para tu cita.',
    step1ValidationError: 'Por favor, selecciona un doctor y una fecha.',
    
    // Step 2
    step2Title: 'Selecciona un Horario',
    step2Description: 'Horarios disponibles para',
    
    // Step 3
    step3Title: 'Confirma tu Cita',
    step3Description: 'Por favor, proporciona tus datos para tu cita con {{doctor}} el {{date}} a las {{time}}.',
    fullNameLabel: 'Nombre Completo',
    fullNamePlaceholder: 'Ej., Juan Pérez',
    phoneLabel: 'Número de Teléfono',
    reasonLabel: 'Motivo de la Cita',
    reasonPlaceholder: 'Ej., Chequeo General',
    notesLabel: 'Notas (Opcional)',
    notesPlaceholder: 'Cualquier información adicional para el doctor...',
    
    // Step 4
    step4Title: '¡Cita Confirmada!',
    step4Description: 'Tu cita con {{doctor}} el {{date}} a las {{time}} ha sido agendada exitosamente.',
    
    // Toasts & Errors
    noTimeSlotsTitle: 'No hay Horarios Disponibles',
    noTimeSlotsDescription: 'No hay horarios disponibles para este doctor en la fecha seleccionada.',
    errorTitle: '¡Oh no! Algo salió mal.',
    errorDescription: 'No se pudieron obtener los horarios disponibles. Por favor, intenta de nuevo.',
    unknownError: 'Ocurrió un error desconocido.',
    missingInfo: 'Falta información de la cita. Por favor, retrocede.',
    
    // Form Validation
    fullNameMin: 'El nombre completo debe tener al menos 3 caracteres.',
    phoneRegex: 'El número de teléfono debe tener 10 dígitos y comenzar con +52.',
    reasonRequired: 'El motivo de la cita es obligatorio.',

    // Footer
    footerAllRightsReserved: 'Todos los derechos reservados.',
    footerPrivacyPolicy: 'Política de Privacidad',
    footerTerms: 'Términos y Condiciones',
    footerAccessibility: 'Accesibilidad',
    footerPoweredBy: 'Impulsado por'
  },
};

export type TranslationKey = keyof typeof translations.en;
export type InterpolationData = { [key: string]: string | number };
