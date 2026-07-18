import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const en = {
  translation: {
    appName: 'Keel',
    tagline: "You're holding a lot. Keel helps you carry it.",
    common: {
      save: 'Save', cancel: 'Cancel', delete: 'Delete', done: 'Done', edit: 'Edit',
      loading: 'Loading…', error: 'Something went wrong. Please try again.',
      retry: 'Retry', close: 'Close', today: 'Today', signOut: 'Sign out',
    },
    auth: {
      signIn: 'Sign in', signUp: 'Create account', email: 'Email', password: 'Password',
      displayName: 'What should we call you?', roleQuestion: 'Who are you?',
      roleTeen: 'Student caregiver', roleTeenHint: 'I help care for a family member while in school',
      roleOrg: 'Organization', roleOrgHint: 'School, nonprofit, or clinic supporting student caregivers',
      haveAccount: 'I already have an account', needAccount: 'New here? Create an account',
      demoNote: 'Demo mode: data stays on this device until Supabase keys are configured.',
      appLockTitle: 'Add an app lock?',
      appLockBody: 'If you share this device with the person you care for, Face ID / biometrics keeps your info private.',
      enableLock: 'Turn on app lock', skipLock: 'Not now', unlock: 'Unlock Keel',
    },
    tabs: { today: 'Today', schedule: 'Schedule', support: 'Support', impact: 'My impact', profile: 'Profile',
      requests: 'Requests', students: 'Students', resources: 'Resources' },
    today: {
      greeting: 'Hi {{name}}', nextUp: 'Next up', allDone: "You're all caught up for today.",
      progress: '{{done}} of {{total}} done', quickAdd: 'Add a care task', noTasks: 'No care tasks yet',
      noTasksBody: 'Add a medication, appointment, or task and Keel will remind you.',
      notAlone: 'You are one of 5.4 million U.S. students who care for someone. You are not alone.',
    },
    schedule: {
      title: 'Care schedule', addTask: 'New care task', editTask: 'Edit care task',
      taskTitle: 'What needs doing?', dose: 'Dose (optional)', kind: 'Type',
      kinds: { medication: 'Medication', appointment: 'Appointment', task: 'Task' },
      recipient: 'For', when: 'First due', remindBefore: 'Remind me (minutes before)',
      recurrence: 'Repeats', minutes: 'Minutes it took (optional)', logPrompt: 'Nice. How long did it take?',
      empty: 'Nothing scheduled', emptyBody: 'Your medications, appointments and care tasks will live here.',
      dateHint: 'YYYY-MM-DD', timeHint: 'HH:MM (24h)',
      markedDone: 'Logged. It counts.',
    },
    recurrence: { once: 'One time', daily: 'Every day', weekly: 'Every week', weekdays: 'School days', monthly: 'Every month' },
    recipients: {
      title: 'People I care for', add: 'Add person', alias: 'Name or nickname (no legal name needed)',
      relationship: 'Relationship', empty: 'No one added yet',
      emptyBody: "Add the person you care for — a nickname like “Grandma R.” is enough.",
    },
    support: {
      title: 'Support', findOrg: 'Get verified by a school or organization',
      findOrgBody: 'Verification unlocks local resources and lets a counselor know you may need flexibility.',
      request: 'Request verification', pending: 'Pending', verified: 'Verified', declined: 'Declined',
      consentTitle: 'Share my care schedule',
      consentBody: 'Let this organization see my care schedule to help me. You can turn this off any time.',
      resources: 'Resources for you', locked: 'Resources unlock after an organization verifies you.',
      categories: { all: 'All', respite: 'Respite', food: 'Food', mental_health: 'Mental health', legal: 'Legal', financial: 'Financial', training: 'Training' },
      save: 'Save', saved: 'Saved', open: 'Open link', sharedByOrg: 'Shared with you',
    },
    impact: {
      title: 'My impact', hoursWeek: 'Care hours this week', hoursMonth: 'This month',
      streak: '{{count}}-day streak of showing up', export: 'Export my hours',
      exportHint: 'Useful if your school offers service credit.',
      reassurance: '5.4 million students do this too. What you do counts.',
      empty: 'Check off care tasks and your hours will build here.',
    },
    profile: {
      title: 'Profile & privacy', language: 'Language', appLock: 'App lock (biometric)',
      whoCanSee: 'Who can see my data', revoke: 'Revoke', noOrgs: 'No organizations can see your data.',
      recipients: 'People I care for', comingSoon: 'Coming soon',
      vault: 'Document vault', vaultHint: 'Keep insurance cards & med lists handy (Phase 2)',
      circle: 'Peer circles', circleHint: 'Anonymous support with other student caregivers (Phase 2)',
      demoBadge: 'Demo mode — local data only',
    },
    org: {
      requests: 'Verification requests', noRequests: 'No pending requests',
      noRequestsBody: 'When a student asks your organization to verify them, it shows up here.',
      verify: 'Verify', decline: 'Decline', students: 'Verified students',
      noStudents: 'No consented students yet',
      noStudentsBody: 'Students appear here only after they grant consent — privacy first.',
      tasksActive: '{{count}} active care tasks', minsWeek: '{{count}} min of care this week',
      pushResource: 'Share a resource', resourceManager: 'Our resources', addResource: 'Add resource',
      orgSetupTitle: 'Set up your organization', orgName: 'Organization name', orgKind: 'Type',
      kinds: { school: 'School', nonprofit: 'Nonprofit', clinic: 'Clinic' }, district: 'District (e.g. CA-18)',
      create: 'Create organization', shareWith: 'Share with…', shared: 'Shared ✓',
    },
  },
};

const es = {
  translation: {
    appName: 'Keel',
    tagline: 'Cargas con mucho. Keel te ayuda a llevarlo.',
    common: {
      save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', done: 'Listo', edit: 'Editar',
      loading: 'Cargando…', error: 'Algo salió mal. Inténtalo de nuevo.',
      retry: 'Reintentar', close: 'Cerrar', today: 'Hoy', signOut: 'Cerrar sesión',
    },
    auth: {
      signIn: 'Iniciar sesión', signUp: 'Crear cuenta', email: 'Correo', password: 'Contraseña',
      displayName: '¿Cómo te llamamos?', roleQuestion: '¿Quién eres?',
      roleTeen: 'Estudiante cuidador', roleTeenHint: 'Cuido a un familiar mientras estudio',
      roleOrg: 'Organización', roleOrgHint: 'Escuela, ONG o clínica que apoya a estudiantes cuidadores',
      haveAccount: 'Ya tengo una cuenta', needAccount: '¿Nuevo aquí? Crea una cuenta',
      demoNote: 'Modo demo: los datos se quedan en este dispositivo hasta configurar Supabase.',
      appLockTitle: '¿Agregar bloqueo?',
      appLockBody: 'Si compartes este dispositivo con la persona que cuidas, la biometría mantiene tu información privada.',
      enableLock: 'Activar bloqueo', skipLock: 'Ahora no', unlock: 'Desbloquear Keel',
    },
    tabs: { today: 'Hoy', schedule: 'Agenda', support: 'Apoyo', impact: 'Mi impacto', profile: 'Perfil',
      requests: 'Solicitudes', students: 'Estudiantes', resources: 'Recursos' },
    today: {
      greeting: 'Hola {{name}}', nextUp: 'Lo que sigue', allDone: 'Ya terminaste por hoy.',
      progress: '{{done}} de {{total}} hechas', quickAdd: 'Agregar tarea de cuidado', noTasks: 'Aún no hay tareas',
      noTasksBody: 'Agrega un medicamento, cita o tarea y Keel te lo recordará.',
      notAlone: 'Eres uno de 5.4 millones de estudiantes en EE. UU. que cuidan a alguien. No estás solo.',
    },
    schedule: {
      title: 'Agenda de cuidado', addTask: 'Nueva tarea', editTask: 'Editar tarea',
      taskTitle: '¿Qué hay que hacer?', dose: 'Dosis (opcional)', kind: 'Tipo',
      kinds: { medication: 'Medicamento', appointment: 'Cita', task: 'Tarea' },
      recipient: 'Para', when: 'Primera vez', remindBefore: 'Recordarme (minutos antes)',
      recurrence: 'Se repite', minutes: 'Minutos que tomó (opcional)', logPrompt: 'Bien. ¿Cuánto tiempo tomó?',
      empty: 'Nada programado', emptyBody: 'Tus medicamentos, citas y tareas de cuidado vivirán aquí.',
      dateHint: 'AAAA-MM-DD', timeHint: 'HH:MM (24h)',
      markedDone: 'Registrado. Cuenta.',
    },
    recurrence: { once: 'Una vez', daily: 'Cada día', weekly: 'Cada semana', weekdays: 'Días de clase', monthly: 'Cada mes' },
    recipients: {
      title: 'Personas que cuido', add: 'Agregar persona', alias: 'Nombre o apodo (sin nombre legal)',
      relationship: 'Relación', empty: 'Nadie agregado aún',
      emptyBody: 'Agrega a la persona que cuidas — un apodo como “Abuela R.” es suficiente.',
    },
    support: {
      title: 'Apoyo', findOrg: 'Verifícate con una escuela u organización',
      findOrgBody: 'La verificación desbloquea recursos locales y avisa a un consejero que puedes necesitar flexibilidad.',
      request: 'Solicitar verificación', pending: 'Pendiente', verified: 'Verificado', declined: 'Rechazado',
      consentTitle: 'Compartir mi agenda de cuidado',
      consentBody: 'Permitir que esta organización vea mi agenda para ayudarme. Puedes desactivarlo cuando quieras.',
      resources: 'Recursos para ti', locked: 'Los recursos se desbloquean cuando una organización te verifica.',
      categories: { all: 'Todos', respite: 'Relevo', food: 'Comida', mental_health: 'Salud mental', legal: 'Legal', financial: 'Finanzas', training: 'Capacitación' },
      save: 'Guardar', saved: 'Guardado', open: 'Abrir enlace', sharedByOrg: 'Compartido contigo',
    },
    impact: {
      title: 'Mi impacto', hoursWeek: 'Horas de cuidado esta semana', hoursMonth: 'Este mes',
      streak: 'Racha de {{count}} días', export: 'Exportar mis horas',
      exportHint: 'Útil si tu escuela ofrece créditos de servicio.',
      reassurance: '5.4 millones de estudiantes también lo hacen. Lo que haces cuenta.',
      empty: 'Marca tareas de cuidado y tus horas se acumularán aquí.',
    },
    profile: {
      title: 'Perfil y privacidad', language: 'Idioma', appLock: 'Bloqueo (biometría)',
      whoCanSee: 'Quién puede ver mis datos', revoke: 'Revocar', noOrgs: 'Ninguna organización puede ver tus datos.',
      recipients: 'Personas que cuido', comingSoon: 'Próximamente',
      vault: 'Bóveda de documentos', vaultHint: 'Tarjetas de seguro y listas de medicinas (Fase 2)',
      circle: 'Círculos de pares', circleHint: 'Apoyo anónimo con otros estudiantes cuidadores (Fase 2)',
      demoBadge: 'Modo demo — datos locales',
    },
    org: {
      requests: 'Solicitudes de verificación', noRequests: 'Sin solicitudes pendientes',
      noRequestsBody: 'Cuando un estudiante pida verificación a tu organización, aparecerá aquí.',
      verify: 'Verificar', decline: 'Rechazar', students: 'Estudiantes verificados',
      noStudents: 'Aún no hay estudiantes con consentimiento',
      noStudentsBody: 'Los estudiantes aparecen solo después de dar su consentimiento — privacidad primero.',
      tasksActive: '{{count}} tareas activas', minsWeek: '{{count}} min de cuidado esta semana',
      pushResource: 'Compartir un recurso', resourceManager: 'Nuestros recursos', addResource: 'Agregar recurso',
      orgSetupTitle: 'Configura tu organización', orgName: 'Nombre de la organización', orgKind: 'Tipo',
      kinds: { school: 'Escuela', nonprofit: 'ONG', clinic: 'Clínica' }, district: 'Distrito (ej. CA-18)',
      create: 'Crear organización', shareWith: 'Compartir con…', shared: 'Compartido ✓',
    },
  },
};

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';

i18n.use(initReactI18next).init({
  resources: { en, es },
  lng: deviceLang === 'es' ? 'es' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
