export const translations = {
  en: {
    // Menu
    menu_agendar: 'Scheduler',
    menu_buscarPaciente: 'Search Patient',

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
    phoneRegex: 'Please enter a valid 10-digit phone number.',
    reasonRequired: 'Reason for appointment is required.',

    // Patient Search
    search_title: 'Search Patient',
    search_subtitle: 'Enter the phone number in the requested format',
    search_labels_cc: 'Country',
    search_labels_fixed: 'Fixed',
    search_labels_number10: 'Phone Number',
    search_cta: 'Search',
    search_errors_invalidInput: 'The provided data is invalid.',
    search_errors_server: 'Could not retrieve patient data. Please try again.',
    search_empty: 'No appointments found for this patient.',
    search_patient_info: 'Patient Information',

    // Appointment Card Actions
    appt_actions_cancel: "Cancel",
    appt_actions_reschedule: "Reschedule",
    appt_a11y_cancel: "Cancel appointment {{service}} with doctor {{doctorId}} on {{start}}.",
    appt_a11y_reschedule: "Reschedule appointment {{service}} with doctor {{doctorId}} on {{start}}.",
    
    // Footer
    footerAllRightsReserved: 'All rights reserved.',
    footerPrivacyPolicy: 'Privacy Policy',
    footerTerms: 'Terms & Conditions',
    footerAccessibility: 'Accessibility',
    footerPoweredBy: 'Powered by'
  },
  es: {
    // Menu
    menu_agendar: 'Agendar',
    menu_buscarPaciente: 'Buscar Paciente',

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
    phoneRegex: 'Por favor, ingresa un número de teléfono válido de 10 dígitos.',
    reasonRequired: 'El motivo de la cita es obligatorio.',

    // Patient Search
    search_title: 'Buscar Paciente',
    search_subtitle: 'Ingresa el teléfono en el formato solicitado.',
    search_labels_cc: 'País',
    search_labels_fixed: 'Fijo',
    search_labels_number10: 'Teléfono',
    search_cta: 'Buscar',
    search_errors_invalidInput: 'Los datos proporcionados son inválidos.',
    search_errors_server: 'No se pudo obtener la información del paciente. Intenta de nuevo.',
    search_empty: 'No se encontraron citas para este paciente.',
    search_patient_info: 'Información del Paciente',

    // Appointment Card Actions
    appt_actions_cancel: "Cancelar",
    appt_actions_reschedule: "Reagendar",
    appt_a11y_cancel: "Cancelar cita {{service}} del doctor {{doctorId}} el {{start}}.",
    appt_a11y_reschedule: "Reagendar cita {{service}} del doctor {{doctorId}} el {{start}}.",

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
