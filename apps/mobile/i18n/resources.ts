export const supportedLanguages = ['en', 'es'] as const;

export type AppLanguage = (typeof supportedLanguages)[number];
import { copyEnglish, copySpanish } from './mobile-copy';

const mobileSpanishOverrides: Record<string, string> = {
  'Account number': 'Número de cuenta',
  'Sort code': 'Código bancario',
  'Overdraft limit': 'Límite de descubierto',
  'Interest rate (%)': 'Tipo de interés (%)',
  'Credit limit': 'Límite de crédito',
  'Billing cycle day': 'Día del ciclo de facturación',
  'Property value': 'Valor de la propiedad',
  'Mortgage amount': 'Importe de la hipoteca',
  'Term length (years)': 'Duración (años)',
  'Loan amount': 'Importe del préstamo',
  'account number': 'número de cuenta',
  'sort code': 'código bancario',
  'overdraft limit': 'límite de descubierto',
  'interest rate (%)': 'tipo de interés (%)',
  'credit limit': 'límite de crédito',
  'billing cycle day': 'día del ciclo de facturación',
  'property value': 'valor de la propiedad',
  'mortgage amount': 'importe de la hipoteca',
  'term length (years)': 'duración (años)',
  'loan amount': 'importe del préstamo',
  'Enter {{field}} to save these account details.':
    'Completa {{field}} para guardar los datos de esta cuenta.',
  'Enter a valid {{field}}.': 'Introduce un valor válido para {{field}}.',
  'Collapse {{name}}': 'Contraer {{name}}',
  'Expand {{name}}': 'Expandir {{name}}',
  '{{label}} ({{currency}})': '{{label}} ({{currency}})',
  'Choose currency, {{currency}}': 'Elegir moneda, {{currency}}',
  'View {{title}} monthly schedule': 'Ver el calendario mensual de {{title}}',
  'Open {{description}}': 'Abrir {{description}}',
  'Accounts, {{summary}}': 'Cuentas, {{summary}}',
  '{{label}}, {{description}}': '{{label}}, {{description}}',
  '{{progress}} percent used': '{{progress}} % utilizado',
  'Choose color {{color}}': 'Elegir color {{color}}',
  'Open transaction': 'Abrir movimiento',
  '{{name}}, {{currency}}': '{{name}}, {{currency}}',
  '{{name}}, {{progress}} percent complete':
    '{{name}}, {{progress}} % completado',
  '{{name}} progress': 'Progreso de {{name}}',
  'View {{name}} goal': 'Ver el objetivo {{name}}',
  'We sent a 6-digit code to {{email}}':
    'Enviamos un código de 6 dígitos a {{email}}',
  'Loan A costs {{amount}} less overall':
    'El préstamo A cuesta {{amount}} menos en total',
  'Loan B costs {{amount}} less overall':
    'El préstamo B cuesta {{amount}} menos en total',
  'Both loans cost the same overall':
    'Ambos préstamos cuestan lo mismo en total',
  'We sent a password reset link to {{email}}.':
    'Enviamos un enlace para restablecer la contraseña a {{email}}.',
  'Open your email app and look for a message from Guallet.':
    'Abre tu aplicación de correo y busca un mensaje de Guallet.',
  'Discard changes?': '¿Descartar los cambios?',
  'Your unsaved changes will be lost.': 'Se perderán los cambios sin guardar.',
  'Keep editing': 'Seguir editando',
  Discard: 'Descartar',
  'Could not sign in': 'No se pudo iniciar sesión',
  'Check your account details and try again.':
    'Comprueba los datos de la cuenta e inténtalo de nuevo.',
  create: 'crear',
  update: 'actualizar',
  'Add a description for this transaction.':
    'Añade una descripción para este movimiento.',
  'Select an account.': 'Selecciona una cuenta.',
  'Enter a valid amount.': 'Introduce un importe válido.',
  'Currency must be a three-letter code, such as GBP.':
    'La moneda debe tener un código de tres letras, como GBP.',
  'Select a transaction date.': 'Selecciona la fecha del movimiento.',
  'We couldn’t save this transaction. Please try again.':
    'No se pudo guardar este movimiento. Inténtalo de nuevo.',
  'Delete {{name}}?': '¿Eliminar {{name}}?',
  'This removes the account and its transactions. This action cannot be undone.':
    'Se eliminarán la cuenta y sus movimientos. Esta acción no se puede deshacer.',
  'Delete account': 'Eliminar cuenta',
  'Couldn’t delete account': 'No se pudo eliminar la cuenta',
  'Please try again in a moment.': 'Inténtalo de nuevo en un momento.',
  'Delete budget?': '¿Eliminar presupuesto?',
  'This removes the budget but does not delete its transactions.':
    'Se eliminará el presupuesto, pero no sus movimientos.',
  Delete: 'Eliminar',
  'Couldn’t delete budget': 'No se pudo eliminar el presupuesto',
  'Delete “{{name}}”?': '¿Eliminar «{{name}}»?',
  'This goal and its progress will be removed. Linked account balances will stay as they are.':
    'Se eliminarán este objetivo y su progreso. Los saldos de las cuentas vinculadas no cambiarán.',
  'Keep goal': 'Conservar objetivo',
  'Couldn’t delete goal': 'No se pudo eliminar el objetivo',
  'Please try again.': 'Inténtalo de nuevo.',
  'That code is not valid. Try again.':
    'El código no es válido. Inténtalo de nuevo.',
  'New code sent': 'Nuevo código enviado',
  'Check {{email}} for your new code.':
    'Revisa {{email}} para encontrar tu nuevo código.',
  'We could not resend the code.': 'No se pudo volver a enviar el código.',
  'Could not open your inbox': 'No se pudo abrir tu bandeja de entrada',
  'Check {{email}} for your code.':
    'Revisa {{email}} para encontrar tu código.',
  'Enter a budget name with at least two characters.':
    'Escribe un nombre de presupuesto de al menos dos caracteres.',
  'Enter a positive budget amount.':
    'Introduce un importe de presupuesto positivo.',
  'Select at least one category.': 'Selecciona al menos una categoría.',
  'Couldn’t {{action}} this budget. Please try again.':
    'No se pudo {{action}} este presupuesto. Inténtalo de nuevo.',
  'Enter a valid balance.': 'Introduce un saldo válido.',
  'Enter an account name.': 'Escribe un nombre para la cuenta.',
  'Use a three-letter currency code, such as GBP or EUR.':
    'Usa un código de moneda de tres letras, como GBP o EUR.',
  'Couldn’t create this account. Please try again.':
    'No se pudo crear la cuenta. Inténtalo de nuevo.',
  'Couldn’t update this account. Please try again.':
    'No se pudo actualizar la cuenta. Inténtalo de nuevo.',
  'Hi,': 'Hola,',
  shown: 'mostrados',
  '+ Add': '+ Añadir',
  of: 'de',
  'Done (': 'Listo (',
  '+ New': '+ Nuevo',
  'INCOME · 30D': 'INGRESOS · 30 DÍAS',
  'EXPENSE · 30D': 'GASTOS · 30 DÍAS',
  'See all': 'Ver todo',
  'No transactions yet': 'Aún no hay movimientos',
  'See all saving goals': 'Ver todos los objetivos de ahorro',
  'Couldn’t load goals. Open saving goals to try again.':
    'No se pudieron cargar los objetivos. Abre Objetivos de ahorro para intentarlo de nuevo.',
  'Sent to the email on your account when ready':
    'Se enviará al correo de tu cuenta cuando esté listo',
  'YOUR REQUEST': 'TU SOLICITUD',
  Format: 'Formato',
  'Edit selection': 'Editar selección',
  'Loading accounts…': 'Cargando cuentas…',
  'Couldn’t load your accounts. You can still export all accounts.':
    'No se pudieron cargar tus cuentas. Aun así, puedes exportar todas las cuentas.',
  'Try loading accounts again': 'Intenta cargar las cuentas de nuevo',
  'Opens account selection': 'Abre la selección de cuentas',
  'Leave accounts and dates as All to export every transaction.':
    'Deja Cuentas y Fechas en Todas para exportar todos los movimientos.',
  'Choose accounts': 'Elegir cuentas',
  'Apply accounts': 'Aplicar cuentas',
  '· Interest': '· Intereses',
  'Balance after payment': 'Saldo después del pago',
  mo: 'meses',
  'ESTIMATED MONTHLY PAYMENT': 'PAGO MENSUAL ESTIMADO',
  'monthly payments': 'pagos mensuales',
  'View monthly schedule': 'Ver calendario mensual',
  'View monthly schedule →': 'Ver calendario mensual →',
  View: 'Ver',
  'monthly schedule →': 'calendario mensual →',
  'Password-free': 'Sin contraseña',
  'you@example.com': 'tu@ejemplo.com',
  'You can also use the secure sign-in link included in the email.':
    'También puedes usar el enlace seguro de inicio de sesión incluido en el correo.',
  'Enter your account email and we’ll send you a secure link to choose a new password.':
    'Introduce el correo de tu cuenta y te enviaremos un enlace seguro para elegir una contraseña nueva.',
  'Account recovery': 'Recuperación de cuenta',
  'Back to sign in': 'Volver al inicio de sesión',
  "By continuing, you agree to Guallet's Terms of Service and Privacy Policy.":
    'Al continuar, aceptas los Términos del servicio y la Política de privacidad de Guallet.',
  'Your plan is on track': 'Tu plan va según lo previsto',
  'Return to the previous step so we know where to send your code.':
    'Vuelve al paso anterior para indicarnos dónde enviarte el código.',
  'Email address missing': 'Falta el correo electrónico',
  "Didn't receive it?": '¿No lo has recibido?',
  'Use the email and password linked to your Guallet account.':
    'Usa el correo y la contraseña asociados a tu cuenta de Guallet.',
  'Your new password is ready. You can now use it to sign in.':
    'Tu nueva contraseña está lista. Ya puedes usarla para iniciar sesión.',
  'Continue to sign in': 'Continuar al inicio de sesión',
  'This link is incomplete or has expired. Request a new reset email to continue.':
    'Este enlace está incompleto o ha caducado. Solicita un nuevo correo para restablecer la contraseña.',
  'Request a new link': 'Solicitar un enlace nuevo',
  'Send a new reset link': 'Enviar un nuevo enlace para restablecerla',
  'Choose a strong password you haven’t used for this account before.':
    'Elige una contraseña segura que no hayas usado antes en esta cuenta.',
  'Secure your account': 'Protege tu cuenta',
  'Update password': 'Actualizar contraseña',
  "The link expires for your security. If you don't see the email, check your spam or junk folder.":
    'El enlace caduca por seguridad. Si no encuentras el correo, revisa la carpeta de spam o correo no deseado.',
  'Cancel account selection': 'Cancelar selección de cuentas',
  'Couldn’t save this goal. Check your connection and try again.':
    'No se pudo guardar este objetivo. Comprueba tu conexión e inténtalo de nuevo.',
  'Clear date': 'Borrar fecha',
  'Retry loading accounts': 'Volver a cargar las cuentas',
  'Add an account before creating a goal.':
    'Añade una cuenta antes de crear un objetivo.',
  'View accounts': 'Ver cuentas',
  'saved towards': 'ahorrado para',
  '% complete': '% completado',
  remaining: 'restante',
  'GOAL DETAILS': 'DETALLES DEL OBJETIVO',
  'Delete goal': 'Eliminar objetivo',
  Add: 'Añadir',
  'Loading saving goals': 'Cargando objetivos de ahorro',
  'Choose one or more filters': 'Elige uno o más filtros',
  'Custom range': 'Intervalo personalizado',
  Reset: 'Restablecer',
  'Apply filters': 'Aplicar filtros',
  All: 'Todos',
  GBP: 'GBP',
  'We couldn’t load your transactions.':
    'No se pudieron cargar tus movimientos.',
  'No transactions found': 'No se encontraron movimientos',
  'Try changing or resetting your filters.':
    'Prueba a cambiar o restablecer los filtros.',
  'Your spending and income': 'Tus gastos e ingresos',
  'Edit account': 'Editar cuenta',
  'Couldn’t load account': 'No se pudo cargar la cuenta',
  'Check your connection and try again.':
    'Comprueba tu conexión e inténtalo de nuevo.',
  'Try again': 'Intentar de nuevo',
  'This account is managed by its connection.':
    'Esta cuenta está gestionada por su conexión.',
  'Go back': 'Volver',
  'Loading account…': 'Cargando cuenta…',
  'Account not found': 'No se encontró la cuenta',
  'New account': 'Nueva cuenta',
  'Edit goal': 'Editar objetivo',
  'Couldn’t load goal': 'No se pudo cargar el objetivo',
  'Loading goal…': 'Cargando objetivo…',
  'Goal not found': 'No se encontró el objetivo',
  'New goal': 'Nuevo objetivo',
  'Signing in': 'Iniciando sesión',
  'Please wait while we confirm your session.':
    'Espera mientras confirmamos tu sesión.',
  'Opens the currency picker': 'Abre el selector de moneda',
  'Choose category': 'Elegir categoría',
  Recent: 'Recientes',
  'No categories found.': 'No se encontraron categorías.',
  Done: 'Listo',
  'Keep your balance and account details up to date. You can edit these later.':
    'Mantén actualizado tu saldo y los datos de la cuenta. Puedes editarlos más tarde.',
  'Account name': 'Nombre de la cuenta',
  'e.g. Everyday current account': 'p. ej., Cuenta corriente diaria',
  'Select a currency': 'Selecciona una moneda',
  'Current balance': 'Saldo actual',
  'Use a negative value for money you owe.':
    'Usa un valor negativo para el dinero que debes.',
  'Account type': 'Tipo de cuenta',
  'Account details': 'Detalles de la cuenta',
  'Optional details for this account type.':
    'Detalles opcionales para este tipo de cuenta.',
  'NET WORTH': 'PATRIMONIO NETO',
  Assets: 'Activos',
  Liabilities: 'Pasivos',
  'This account may have been deleted.':
    'Es posible que se haya eliminado esta cuenta.',
  'CURRENT BALANCE': 'SALDO ACTUAL',
  'Balance history': 'Historial del saldo',
  'Last four months': 'Últimos cuatro meses',
  'Couldn’t load balance history. Try again':
    'No se pudo cargar el historial del saldo. Inténtalo de nuevo',
  'No balance history yet.': 'Aún no hay historial del saldo.',
  'Monthly money in and out': 'Ingresos y gastos mensuales',
  'Loading monthly activity…': 'Cargando actividad mensual…',
  'No monthly activity yet.': 'Aún no hay actividad mensual.',
  'Transactions this month': 'Movimientos de este mes',
  'Loading transactions…': 'Cargando movimientos…',
  'Couldn’t load transactions. Try again':
    'No se pudieron cargar los movimientos. Inténtalo de nuevo',
  'No transactions this month.': 'No hay movimientos este mes.',
  'View all transactions': 'Ver todos los movimientos',
  'Danger zone': 'Zona de peligro',
  'Deleting an account also removes its transaction history.':
    'Al eliminar una cuenta también se borra su historial de movimientos.',
  'Everything you own, in one place': 'Todo lo que tienes, en un solo lugar',
  'Couldn’t load accounts': 'No se pudieron cargar las cuentas',
  'No accounts yet': 'Aún no hay cuentas',
  'Add your first account to start tracking your money and see your net worth here.':
    'Añade tu primera cuenta para empezar a controlar tu dinero y ver aquí tu patrimonio neto.',
  'Add your first account': 'Añade tu primera cuenta',
  'Search accounts': 'Buscar cuentas',
  'Search by account name': 'Buscar por nombre de cuenta',
  'No matching accounts': 'No hay cuentas coincidentes',
  'Try another search term or clear the search.':
    'Prueba otro término o borra la búsqueda.',
  'Clear search': 'Borrar búsqueda',
  spent: 'gastado',
  'Over budget': 'Presupuesto excedido',
  'BUDGET OVERVIEW': 'RESUMEN DEL PRESUPUESTO',
  '% used': '% utilizado',
  'budgets · Multiple currencies': 'presupuestos · Varias monedas',
  Budgeted: 'Presupuestado',
  Spent: 'Gastado',
  'Select categories': 'Seleccionar categorías',
  'Choose the categories this budget should track.':
    'Elige las categorías que debe controlar este presupuesto.',
  Close: 'Cerrar',
  Search: 'Buscar',
  'Select an icon': 'Selecciona un icono',
  'Couldn’t load transactions for this month.':
    'No se pudieron cargar los movimientos de este mes.',
  'No transactions found for this month.':
    'No se encontraron movimientos de este mes.',
  Budget: 'Presupuesto',
  'Couldn’t load this budget': 'No se pudo cargar este presupuesto',
  'The budget may have been deleted or is temporarily unavailable.':
    'Es posible que se haya eliminado el presupuesto o que no esté disponible temporalmente.',
  'Edit budget': 'Editar presupuesto',
  'Delete budget': 'Eliminar presupuesto',
  'Please go back and try again.': 'Vuelve atrás e inténtalo de nuevo.',
  'e.g. Groceries': 'p. ej., Compra',
  'Monthly amount': 'Importe mensual',
  Color: 'Color',
  'Couldn’t load budgets': 'No se pudieron cargar los presupuestos',
  'Plan your monthly spending with confidence.':
    'Planifica tus gastos mensuales con confianza.',
  'No budgets yet': 'Aún no hay presupuestos',
  'Create your first budget': 'Crea tu primer presupuesto',
  'Create your first budget to start tracking and controlling your spending.':
    'Crea tu primer presupuesto para empezar a controlar tus gastos.',
  'Compare results': 'Comparar resultados',
  'Loan A': 'Préstamo A',
  'Loan B': 'Préstamo B',
  Metric: 'Métrica',
  'Repayment totals': 'Totales del reembolso',
  'Monthly payments': 'Pagos mensuales',
  'Monthly schedule': 'Calendario mensual',
  'Loan calculator': 'Calculadora de préstamos',
  'Your loan': 'Tu préstamo',
  'Total interest': 'Intereses totales',
  'Total repayable': 'Total a devolver',
  'Total cost incl. fee': 'Coste total con comisión',
  'Monthly payment': 'Pago mensual',
  'Back to loan calculator': 'Volver a la calculadora de préstamos',
  'Edit transaction': 'Editar movimiento',
  Expense: 'Gasto',
  Income: 'Ingreso',
  Description: 'Descripción',
  'Enter transaction description': 'Escribe la descripción del movimiento',
  Amount: 'Importe',
  Account: 'Cuenta',
  Currency: 'Moneda',
  Date: 'Fecha',
  Uncategorised: 'Sin categoría',
  Notes: 'Notas',
  'Select account': 'Seleccionar cuenta',
  'We couldn’t load this transaction.': 'No se pudo cargar este movimiento.',
  'Transaction not found.': 'No se encontró el movimiento.',
  'Filter transactions': 'Filtrar movimientos',
  'Date range': 'Intervalo de fechas',
  'Any date': 'Cualquier fecha',
  Today: 'Hoy',
  'This month': 'Este mes',
  'Last 30 days': 'Últimos 30 días',
  Accounts: 'Cuentas',
  Categories: 'Categorías',
  'Saving goals': 'Objetivos de ahorro',
  'Couldn’t load goals': 'No se pudieron cargar los objetivos',
  'No saving goals yet': 'Aún no hay objetivos de ahorro',
  'Create a goal, choose a target, and link an account to track progress.':
    'Crea un objetivo, elige una meta y vincula una cuenta para seguir el progreso.',
  'Create your first goal': 'Crea tu primer objetivo',
  'Choose what you are saving towards.': 'Elige para qué estás ahorrando.',
  'Goal details': 'Detalles del objetivo',
  'Goal name': 'Nombre del objetivo',
  'Goal name *': 'Nombre del objetivo *',
  'Target amount': 'Importe objetivo',
  'Target amount *': 'Importe objetivo *',
  'Current amount': 'Importe actual',
  'Target date': 'Fecha objetivo',
  'Target date (optional)': 'Fecha objetivo (opcional)',
  'Linked accounts': 'Cuentas vinculadas',
  'Linked accounts *': 'Cuentas vinculadas *',
  'Goal description': 'Descripción del objetivo',
  'e.g. Emergency fund': 'p. ej., Fondo de emergencia',
  'Select target date': 'Seleccionar fecha objetivo',
  'Clear target date': 'Borrar fecha objetivo',
  'Choose linked accounts': 'Elegir cuentas vinculadas',
  'Add a note': 'Añade una nota',
  'Track what you are saving towards.':
    'Haz seguimiento de tus objetivos de ahorro.',
  'Progress follows the balance of these accounts.':
    'El progreso sigue el saldo de estas cuentas.',
  'Choose one or more accounts in the same currency. Their balances determine goal progress.':
    'Elige una o más cuentas en la misma moneda. Sus saldos determinan el progreso del objetivo.',
  'No saving goals yet. Create your first goal to track progress.':
    'Aún no hay objetivos de ahorro. Crea el primero para seguir el progreso.',
  'This goal may have been deleted.':
    'Es posible que se haya eliminado este objetivo.',
  'Export data': 'Exportar datos',
  'Choose what to include. We’ll email the file to you when it’s ready.':
    'Elige qué incluir. Te enviaremos el archivo por correo cuando esté listo.',
  DELIVERY: 'ENTREGA',
  ACCOUNTS: 'CUENTAS',
  'DATE RANGE': 'INTERVALO DE FECHAS',
  'FILE FORMAT': 'FORMATO DE ARCHIVO',
  'Couldn’t start export.': 'No se pudo iniciar la exportación.',
  'Couldn’t load your transactions.': 'No se pudieron cargar tus movimientos.',
  'We’ll email your file': 'Te enviaremos el archivo por correo',
  'You can continue using Guallet while the export runs.':
    'Puedes seguir usando Guallet mientras se prepara la exportación.',
  'Got it': 'Entendido',
  'All accounts': 'Todas las cuentas',
  'All dates': 'Todas las fechas',
  'Use all accounts': 'Usar todas las cuentas',
  'Use all dates': 'Usar todas las fechas',
  'Sign in': 'Iniciar sesión',
  'Sign in to Guallet': 'Inicia sesión en Guallet',
  'Sign in with a code': 'Iniciar sesión con un código',
  'Sign in with a one-time code': 'Iniciar sesión con un código de un solo uso',
  'Continue with Google': 'Continuar con Google',
  'Continue with email': 'Continuar con correo electrónico',
  'Welcome to Guallet': 'Te damos la bienvenida a Guallet',
  'Welcome back': 'Te damos la bienvenida',
  'Your money, made clear': 'Tus finanzas, más claras',
  'A better view of your financial life': 'Una mejor visión de tus finanzas',
  'See where your money goes, plan with confidence, and make every goal feel closer.':
    'Descubre en qué gastas, planifica con confianza y acerca cada objetivo.',
  'Keep track of your accounts, spending, and saving goals in one place.':
    'Controla tus cuentas, gastos y objetivos de ahorro en un solo lugar.',
  'Secure sign-in. Your data stays private.':
    'Inicio de sesión seguro. Tus datos son privados.',
  'Email address': 'Correo electrónico',
  'Enter email address': 'Escribe tu correo electrónico',
  Password: 'Contraseña',
  'Enter your password': 'Escribe tu contraseña',
  'Forgot password?': '¿Olvidaste la contraseña?',
  'Password help': 'Ayuda con la contraseña',
  'Reset your password': 'Restablece tu contraseña',
  'Reset password': 'Restablecer contraseña',
  'Create a new password': 'Crea una contraseña nueva',
  'New password': 'Nueva contraseña',
  'Confirm new password': 'Confirma la contraseña nueva',
  'At least 8 characters': 'Al menos 8 caracteres',
  'Enter it again': 'Vuelve a escribirla',
  'Password updated': 'Contraseña actualizada',
  'Your account is protected with your new password.':
    'Tu cuenta está protegida con la nueva contraseña.',
  'Check your inbox': 'Revisa tu bandeja de entrada',
  'Check your email': 'Revisa tu correo',
  'Email code': 'Código por correo',
  'Enter code': 'Escribe el código',
  'Enter your code': 'Escribe tu código',
  'We’ll email you a 6-digit code. It expires after 5 minutes.':
    'Te enviaremos un código de 6 dígitos por correo. Caduca en 5 minutos.',
  'Verify and sign in': 'Verificar e iniciar sesión',
  'Send my code': 'Enviarme el código',
  'Didn’t receive it?': '¿No lo has recibido?',
  'Use password instead': 'Usar contraseña',
  'Use a one-time code': 'Usar un código de un solo uso',
  'Use a different email': 'Usar otro correo',
  'Open email app': 'Abrir la aplicación de correo',
  Cancel: 'Cancelar',
  or: 'o',
  Month: 'Mes',
  Name: 'Nombre',
  'Description (optional)': 'Descripción (opcional)',
  'Save changes': 'Guardar cambios',
  Principal: 'Principal',
  Term: 'Plazo',
  'Based on': 'Basado en',
  'Results will appear when every field has a valid value.':
    'Los resultados aparecerán cuando todos los campos tengan valores válidos.',
  'Enter valid loan details to see the schedule.':
    'Introduce datos válidos del préstamo para ver el calendario.',
  'Enter valid details for both loans to compare them.':
    'Introduce datos válidos para ambos préstamos para compararlos.',
};

const en = {
  common: {
    done: 'Done',
    none: 'None',
    cancel: 'Cancel',
    tryAgain: 'Try again',
    loading: 'Loading…',
    save: 'Save',
  },
  tabs: {
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    transactions: 'Transactions',
    budgets: 'Budgets',
    settings: 'Settings',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage your account, preferences, and session',
    preferences: 'Preferences',
    language: 'Language',
    languageTitle: 'App language',
    languages: { en: 'English', es: 'Español' },
    languageSaveError: 'Couldn’t save language preference',
    yourData: 'Your data',
    importTransactions: 'Import transactions from CSV',
    exportData: 'Export data',
    receiveByEmail: 'Receive by email',
    tools: 'Tools',
    loanCalculator: 'Loan calculator',
    calculateLoans: 'Calculate and compare loans',
    session: 'Session',
    signOut: 'Sign out',
    signOutQuestion: 'Sign out?',
    signOutDescription: 'You can sign back in at any time.',
    profile: 'Your profile',
    profileUnavailable: 'Profile details unavailable',
    loadingProfile: 'Loading your profile…',
    loadProfileError: 'Couldn’t load your profile',
    connectionError: 'Check your connection and try again.',
    defaultCurrency: 'Default currency',
    preferredCurrencies: 'Preferred currencies',
    currency_one: '{{count}} currency',
    currency_other: '{{count}} currencies',
    dateFormat: 'Date format',
    updateCurrencyError: 'Couldn’t update currency',
    updatePreferredCurrenciesError: 'Couldn’t update preferred currencies',
    updateDateFormatError: 'Couldn’t update date format',
    retryMessage: 'Please try again in a moment.',
    signOutError: 'Couldn’t sign out',
    profilePicture: '{{name}} profile picture',
  },
};

const es = {
  common: {
    done: 'Listo',
    none: 'Ninguno',
    cancel: 'Cancelar',
    tryAgain: 'Intentar de nuevo',
    loading: 'Cargando…',
    save: 'Guardar',
  },
  tabs: {
    dashboard: 'Resumen',
    accounts: 'Cuentas',
    transactions: 'Movimientos',
    budgets: 'Presupuestos',
    settings: 'Ajustes',
  },
  settings: {
    title: 'Ajustes',
    subtitle: 'Administra tu cuenta, preferencias y sesión',
    preferences: 'Preferencias',
    language: 'Idioma',
    languageTitle: 'Idioma de la aplicación',
    languages: { en: 'English', es: 'Español' },
    languageSaveError: 'No se pudo guardar el idioma',
    yourData: 'Tus datos',
    importTransactions: 'Importar transacciones desde CSV',
    exportData: 'Exportar datos',
    receiveByEmail: 'Recibir por correo',
    tools: 'Herramientas',
    loanCalculator: 'Calculadora de préstamos',
    calculateLoans: 'Calcula y compara préstamos',
    session: 'Sesión',
    signOut: 'Cerrar sesión',
    signOutQuestion: '¿Cerrar sesión?',
    signOutDescription: 'Puedes volver a iniciar sesión cuando quieras.',
    profile: 'Tu perfil',
    profileUnavailable: 'Detalles del perfil no disponibles',
    loadingProfile: 'Cargando tu perfil…',
    loadProfileError: 'No se pudo cargar tu perfil',
    connectionError: 'Comprueba tu conexión e inténtalo de nuevo.',
    defaultCurrency: 'Moneda predeterminada',
    preferredCurrencies: 'Monedas preferidas',
    currency_one: '{{count}} moneda',
    currency_other: '{{count}} monedas',
    dateFormat: 'Formato de fecha',
    updateCurrencyError: 'No se pudo actualizar la moneda',
    updatePreferredCurrenciesError:
      'No se pudieron actualizar las monedas preferidas',
    updateDateFormatError: 'No se pudo actualizar el formato de fecha',
    retryMessage: 'Inténtalo de nuevo en un momento.',
    signOutError: 'No se pudo cerrar la sesión',
    profilePicture: 'Foto de perfil de {{name}}',
  },
};

export const resources = {
  en: {
    translation: {
      ...flatten(en),
      ...copyEnglish,
      ...Object.fromEntries(
        Object.keys(mobileSpanishOverrides).map((text) => [text, text]),
      ),
    },
  },
  es: {
    translation: {
      ...flatten(es),
      ...copySpanish,
      ...mobileSpanishOverrides,
      ...Object.fromEntries(
        Object.entries(copyEnglish).map(([key, english]) => [
          key,
          mobileSpanishOverrides[english] ?? copySpanish[key] ?? english,
        ]),
      ),
    },
  },
} as const;

function flatten(
  value: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  return Object.entries(value).reduce<Record<string, string>>(
    (result, [key, item]) => {
      const translationKey = prefix ? `${prefix}.${key}` : key;
      if (typeof item === 'string') {
        result[translationKey] = item;
      } else if (item && typeof item === 'object') {
        Object.assign(
          result,
          flatten(item as Record<string, unknown>, translationKey),
        );
      }
      return result;
    },
    {},
  );
}

export function toAppLanguage(language?: string | null): AppLanguage {
  const baseLanguage = language?.toLowerCase().split('-')[0];
  return baseLanguage === 'es' ? 'es' : 'en';
}
