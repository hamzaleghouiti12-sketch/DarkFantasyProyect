// Piso IX · El Tribunal de los Datos
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saberes III.2 «Protección de datos y derechos digitales» y III.3 «Identidad digital»
// (certificado, DNIe, Cl@ve, firma y sede electrónica; huella digital).
// Criterios de evaluación 3.2 y 3.3.

export default {
  id: 'piso9',
  nombre: 'Piso IX · El Tribunal de los Datos',
  criterios: ['3.2', '3.3'],

  intro: [
    'Una sala solemne: bancos, estandartes con una balanza y un **estrado** al fondo. Es **el Tribunal de los Datos**.',
    'Aquí Morvath guardaba los expedientes de todo Umbravel: quién leía qué, a qué hora, con quién hablaba. **Nadie le había dado permiso.**',
    'Tres sellos: resolver los **juicios** del estrado (norte), abrir el **cofre sellado** con la clave correcta (oeste) y mirar el **espejo de la huella** (este).',
  ],

  lecciones: {
    rgpd: {
      titulo: 'Protección de datos y derechos digitales',
      resumen: 'Un dato personal es cualquier información sobre una persona identificada o identificable. El RGPD (Unión Europea) y la LOPDGDD (España) dan derechos sobre ellos: acceso (saber qué datos tienen), rectificación (corregirlos), supresión o derecho al olvido (que los borren), oposición (que dejen de usarlos, por ejemplo para publicidad), limitación del tratamiento y portabilidad (llevártelos a otra empresa). En España se puede consentir solo a partir de los 14 años; antes, deciden madre, padre o tutores. Los datos de salud, biométricos, genéticos, ideología, religión, origen étnico u orientación sexual están especialmente protegidos. Primero se reclama a la empresa (o a su delegado de protección de datos) y, si no responde, a la Agencia Española de Protección de Datos (AEPD).',
      paginas: [
        'Un **dato personal** es cualquier información sobre una persona identificada o identificable: el nombre, una foto, la dirección IP, la ubicación del móvil…',
        'En Europa los protege el **RGPD**, y en España, además, la **LOPDGDD**. Quien trata tus datos necesita un motivo legal (por ejemplo, tu **consentimiento**) y tiene que explicarte para qué los usa.',
        'Tienes **derechos**: de **acceso** (saber qué datos tienen de ti), de **rectificación** (corregirlos), de **supresión** o «derecho al olvido» (que los borren) y de **oposición** (que dejen de usarlos, por ejemplo para publicidad).',
        'También de **limitación** (que los guarden pero no los usen mientras se resuelve algo) y de **portabilidad** (llevártelos a otra compañía en un formato que se pueda leer).',
        'En España puedes dar tu consentimiento tú solo a partir de los **14 años**. Antes, deciden tu madre, tu padre o tus tutores.',
        'Algunos datos están **especialmente protegidos**: salud, biométricos (la huella dactilar, la cara), genéticos, ideología, religión, origen étnico u orientación sexual. Solo se pueden tratar en casos muy concretos.',
        'Si una empresa no te hace caso, primero reclamas a ella (o a su **delegado de protección de datos**). Si no responde, a la **Agencia Española de Protección de Datos (AEPD)**.',
      ],
      despues: ['El estrado tiene seis **juicios** pendientes. Escuchad cada caso y decid qué **derecho** o qué norma lo resuelve.'],
    },
    identidad: {
      titulo: 'Identidad digital: certificado, firma y sede electrónica',
      resumen: 'La criptografía asimétrica usa dos claves: la pública (se comparte) y la privada (nunca se comparte). Lo cifrado con la clave pública de alguien solo lo descifra su clave privada; lo firmado con tu clave privada cualquiera lo comprueba con tu clave pública. Así funcionan el certificado digital (por ejemplo, el de la FNMT), el DNI electrónico y Cl@ve, que sirven para identificarse en internet. La firma electrónica garantiza quién firma (autenticidad), que el documento no ha cambiado (integridad) y que no se puede negar después (no repudio). Los trámites se hacen en la sede electrónica oficial de cada administración.',
      paginas: [
        'Este cofre está cerrado con un candado matemático: la **criptografía asimétrica**. Cada persona tiene **dos claves** que van juntas.',
        'La **clave pública** se puede dar a todo el mundo. La **clave privada** no se comparte **nunca**: es como la llave de tu casa.',
        'Si alguien quiere mandarte un mensaje secreto, lo **cifra con tu clave pública**: solo tu clave privada podrá abrirlo.',
        'Y si tú quieres **firmar** algo, usas **tu clave privada**. Cualquiera puede comprobar la firma con tu clave pública y saber que fuiste tú.',
        'La **firma electrónica** garantiza tres cosas: quién firma (**autenticidad**), que el documento no ha cambiado (**integridad**) y que no puedes negar haberlo firmado (**no repudio**).',
        'En vuestro mundo esto está en el **certificado digital** (como el de la FNMT), en el **DNI electrónico** y en **Cl@ve**: sirven para demostrar quién eres en internet.',
        'Los trámites oficiales se hacen en la **sede electrónica** de cada administración: una web oficial, con HTTPS, desde la que presentas documentos y recibes un **justificante**.',
      ],
      despues: ['Para abrir el cofre tenéis que demostrar que sabéis **qué clave usar** en cada momento y cómo se hace un trámite electrónico.'],
    },
    huella: {
      titulo: 'La huella digital',
      resumen: 'La huella digital es el rastro que dejas en internet. La huella activa es lo que publicas tú a propósito (fotos, comentarios, tu perfil). La huella pasiva es lo que se registra sin que lo publiques: tu dirección IP, las cookies, la ubicación, el historial, el modelo de móvil o la hora a la que te conectas. Juntas forman tu reputación online. Para cuidarla: revisa la configuración de privacidad, piensa antes de publicar, busca de vez en cuando qué aparece sobre ti (egosurfing) y borra cuentas que ya no uses.',
      paginas: [
        'Todo lo que hacéis en internet deja un rastro: la **huella digital**.',
        'La **huella activa** es lo que publicáis vosotros a propósito: una foto, un comentario, vuestro perfil.',
        'La **huella pasiva** es lo que se registra **sin que lo publiquéis**: vuestra dirección IP, las **cookies**, la ubicación, el historial, el modelo de móvil, la hora a la que os conectáis…',
        'Juntas forman vuestra **reputación online**: lo que alguien puede saber de vosotros dentro de cinco años.',
        'Para cuidarla: revisad la **configuración de privacidad**, pensad antes de publicar, buscad de vez en cuando qué aparece sobre vosotros (**egosurfing**) y borrad las cuentas que ya no uséis.',
      ],
      despues: ['El espejo os mostrará **vuestra propia huella en esta partida**. Decid de qué tipo es cada rastro.'],
    },
  },

  // ---------- Sello 1 · Los juicios del estrado ----------
  juicios: [
    {
      id: 'p9-j1', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: 'Juicio 1. Una alumna pidió a una red social que borrara unas fotos suyas de hace años. Siguen ahí. ¿Qué derecho la ampara?',
      opciones: ['Portabilidad', 'Supresión («derecho al olvido»)', 'Acceso', 'Rectificación'],
      correcta: 1,
      explicacion: 'El derecho de supresión permite pedir que se borren datos que ya no son necesarios o cuyo consentimiento se retira.',
    },
    {
      id: 'p9-j2', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: 'Juicio 2. Un gimnasio usa el correo de sus socios para mandar publicidad de otras empresas. Un socio quiere que deje de hacerlo. ¿Qué derecho usa?',
      opciones: ['Oposición', 'Portabilidad', 'Limitación', 'Acceso'],
      correcta: 0,
      explicacion: 'El derecho de oposición sirve para que dejen de usar tus datos para un fin concreto, como la publicidad.',
    },
    {
      id: 'p9-j3', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: 'Juicio 3. «Me cambio de compañía de teléfono y quiero llevarme mi historial en un archivo que la nueva compañía pueda leer.» ¿Qué derecho es?',
      opciones: ['Supresión', 'Rectificación', 'Portabilidad', 'Oposición'],
      correcta: 2,
      explicacion: 'La portabilidad permite recibir tus datos en un formato estructurado y llevarlos a otra empresa.',
    },
    {
      id: 'p9-j4', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: 'Juicio 4. Una app de juegos pide a una niña de 12 años que acepte ella sola el uso de sus datos. ¿Es válido en España?',
      opciones: ['Sí, si pulsa «Acepto»', 'No: por debajo de 14 años tienen que consentir sus padres o tutores', 'Sí, si la app es gratuita', 'Solo si la app es europea'],
      correcta: 1,
      explicacion: 'En España, la LOPDGDD fija en 14 años la edad para consentir por uno mismo.',
    },
    {
      id: 'p9-j5', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: 'Juicio 5. Una pulsera deportiva comparte el ritmo cardíaco de sus usuarios con una aseguradora. ¿Qué tienen de especial esos datos?',
      opciones: ['Nada: son números', 'Son datos de salud, especialmente protegidos', 'Son públicos porque los mide una máquina', 'Solo importan si incluyen el nombre de la persona'],
      correcta: 1,
      explicacion: 'Los datos de salud son una categoría especial: solo pueden tratarse en casos muy concretos y con garantías reforzadas.',
    },
    {
      id: 'p9-j6', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: 'Juicio 6. La empresa no ha contestado a ninguna de las reclamaciones. ¿Ante quién se puede reclamar en España?',
      opciones: ['Ante la Policía Local', 'Ante la Agencia Española de Protección de Datos (AEPD)', 'Ante la propia red social otra vez, sin límite', 'Ante nadie: hay que aceptarlo'],
      correcta: 1,
      explicacion: 'La AEPD es la autoridad que vigila que se cumpla la protección de datos y recibe las reclamaciones.',
    },
  ],

  // ---------- Sello 2 · El cofre sellado ----------
  cofre: [
    {
      id: 'p9-c1', concepto: 'identidad', criterio: '3.3', tipo: 'opcion',
      texto: 'Queréis mandar a Aldric un mensaje que solo él pueda leer. ¿Con qué clave lo ciframos?',
      opciones: ['Con la clave pública de Aldric', 'Con la clave privada de Aldric', 'Con nuestra clave privada', 'Con ninguna: basta con HTTPS'],
      correcta: 0,
      explicacion: 'Lo cifrado con la clave pública de Aldric solo se descifra con su clave privada, que solo tiene él.',
    },
    {
      id: 'p9-c2', concepto: 'identidad', criterio: '3.3', tipo: 'opcion',
      texto: 'Queréis firmar el pergamino para que se sepa que viene de vosotros. ¿Con qué clave?',
      opciones: ['Con la clave pública de Aldric', 'Con nuestra clave privada', 'Con nuestra clave pública', 'Con la contraseña del correo'],
      correcta: 1,
      explicacion: 'Se firma con la clave privada propia; cualquiera puede verificar la firma con la clave pública.',
    },
    {
      id: 'p9-c3', concepto: 'identidad', criterio: '3.3', tipo: 'orden',
      texto: 'Ordenad los pasos para presentar una solicitud en una sede electrónica.',
      opciones: ['Entrar en la sede electrónica oficial (web .gob.es con HTTPS)', 'Identificarse con certificado digital, DNIe o Cl@ve', 'Rellenar el formulario y adjuntar los documentos', 'Firmar electrónicamente la solicitud', 'Presentarla y descargar el justificante de registro'],
      explicacion: 'Primero la web oficial y la identificación; luego el formulario, la firma y, al final, el justificante que prueba que lo presentaste.',
    },
  ],
  firmaAldric: 'El cofre se abre con un chasquido. Dentro hay un pergamino **firmado por Aldric**. La firma se comprueba con su clave pública: **es auténtica** y nadie lo ha modificado.',

  // ---------- Sello 3 · El espejo de la huella ----------
  // Los rastros se generan con datos reales de esta partida (nunca salen del navegador).
  espejo: {
    aviso: 'En el espejo aparece una **sombra** con vuestra forma. Dice que os conoce… y empieza a enumerar todo lo que sabe de vosotros **por esta partida**.',
    activa: 'Huella activa (la he publicado yo)',
    pasiva: 'Huella pasiva (se ha registrado sola)',
    final: {
      id: 'p9-e1', concepto: 'huella', criterio: '3.3', tipo: 'opcion',
      texto: 'La sombra os ofrece configurar vuestro perfil. ¿Qué opción protege mejor vuestra privacidad?',
      opciones: [
        'Perfil público, ubicación siempre activa y que cualquiera pueda etiquetarme',
        'Perfil privado, ubicación desactivada, revisar las etiquetas antes de que aparezcan y no aceptar a desconocidos',
        'Perfil público pero sin foto',
        'Da igual: lo que subo se puede borrar cuando quiera',
      ],
      correcta: 1,
      explicacion: 'Perfil privado, sin ubicación y con control sobre las etiquetas reduce la huella. Y lo que se publica puede haberse copiado: borrar no siempre basta.',
    },
    hecho: 'La sombra se deshace en humo. Lo que ha dicho de vosotros **solo estaba en este ordenador**: el juego no envía nada a ningún sitio.',
  },

  pistas: {
    juicios: 'El **estrado** está al norte, al fondo de la sala. Acercaos y pulsad **E** para escuchar los juicios.',
    cofre: 'El **cofre sellado** está en el lado oeste. Pulsad **E** junto a él.',
    espejo: 'El **espejo de la huella** está en el lado este. Pulsad **E** delante de él.',
    puerta: '¡La puerta del norte está abierta! Subid por la escalera.',
  },

  sellosRotos: [
    '¡Los tres sellos del tribunal están rotos!',
    'Los expedientes de Morvath se queman solos, uno a uno… y una de las páginas proyecta un **recuerdo**.',
  ],

  memoria: [
    'Morvath, más joven, escribe sin parar en un libro enorme. En cada página, un nombre: lo que lee, con quién habla, a qué hora apaga la vela.',
    '«Si lo sé todo de todos», murmura, «nadie podrá volver a quemar una biblioteca sin que yo lo sepa antes».',
    'Nadie le dio permiso. Nadie sabía siquiera que existía ese libro.',
    'Proteger el saber no le daba derecho a vigilar a quienes lo leían. Esa es la línea que cruzó. Seguid subiendo.',
  ],

  // Preguntas de la varita
  preguntas: [
    {
      id: 'p9-01', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: '¿Cuál de estos es un dato personal?',
      opciones: ['La temperatura media de Canarias', 'La dirección IP de tu móvil', 'El número de habitantes de un pueblo', 'El precio de un ordenador'],
      correcta: 1,
      explicacion: 'La IP puede identificar a una persona, así que es un dato personal. Los otros son datos generales.',
    },
    {
      id: 'p9-02', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: '¿Qué derecho usas para saber qué datos tiene de ti una empresa?',
      opciones: ['Acceso', 'Oposición', 'Supresión', 'Portabilidad'],
      correcta: 0,
      explicacion: 'El derecho de acceso te permite saber qué datos tratan, para qué y durante cuánto tiempo.',
    },
    {
      id: 'p9-03', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: '¿A partir de qué edad puedes consentir tú solo el uso de tus datos en España?',
      opciones: ['12 años', '14 años', '16 años', '18 años'],
      correcta: 1,
      explicacion: 'La LOPDGDD fija los 14 años en España (el RGPD permite a cada país elegir entre 13 y 16).',
    },
    {
      id: 'p9-04', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: 'Te equivocaste al escribir tu fecha de nacimiento en una web. ¿Qué derecho usas para corregirla?',
      opciones: ['Supresión', 'Rectificación', 'Limitación', 'Portabilidad'],
      correcta: 1,
      explicacion: 'La rectificación sirve para corregir datos inexactos o incompletos.',
    },
    {
      id: 'p9-05', concepto: 'rgpd', criterio: '3.2', tipo: 'opcion',
      texto: '¿Cuál de estos datos está especialmente protegido?',
      opciones: ['Tu color favorito', 'Tu huella dactilar usada para desbloquear el móvil', 'Tu película preferida', 'El nombre de tu instituto'],
      correcta: 1,
      explicacion: 'Los datos biométricos que identifican a una persona son una categoría especial.',
    },
    {
      id: 'p9-06', concepto: 'identidad', criterio: '3.3', tipo: 'opcion',
      texto: '¿Qué clave NO debes compartir nunca?',
      opciones: ['La clave pública', 'La clave privada', 'Las dos se pueden compartir', 'Ninguna de las dos existe de verdad'],
      correcta: 1,
      explicacion: 'La clave privada es solo tuya: con ella se firma y se descifra.',
    },
    {
      id: 'p9-07', concepto: 'identidad', criterio: '3.3', tipo: 'opcion',
      texto: '¿Qué garantiza la firma electrónica?',
      opciones: ['Que el documento es bonito', 'Autenticidad, integridad y no repudio', 'Que nadie puede leer el documento', 'Que el documento ocupa menos'],
      correcta: 1,
      explicacion: 'Firmar prueba quién firma, que no se ha modificado y que no se puede negar. Cifrar es otra cosa.',
    },
    {
      id: 'p9-08', concepto: 'identidad', criterio: '3.3', tipo: 'opcion',
      texto: '¿Cuál de estos NO sirve para identificarte en una sede electrónica?',
      opciones: ['El certificado digital', 'El DNI electrónico', 'Cl@ve', 'El nombre de usuario de tu red social'],
      correcta: 3,
      explicacion: 'Las administraciones usan certificado, DNIe o Cl@ve. Una red social no acredita tu identidad oficial.',
    },
    {
      id: 'p9-09', concepto: 'identidad', criterio: '3.3', tipo: 'opcion',
      texto: '¿Cómo reconoces una sede electrónica oficial?',
      opciones: ['Tiene muchos anuncios', 'Es una web oficial de la administración, con HTTPS y su dominio (por ejemplo, .gob.es)', 'Te la manda un desconocido por mensaje', 'Pide el número de la tarjeta para entrar'],
      correcta: 1,
      explicacion: 'Se entra escribiendo la dirección oficial o desde la web de la administración, nunca desde enlaces de mensajes.',
    },
    {
      id: 'p9-10', concepto: 'huella', criterio: '3.3', tipo: 'opcion',
      texto: '¿Cuál de estos rastros es huella pasiva?',
      opciones: ['Una foto que subes a tu perfil', 'Un comentario en un vídeo', 'Las cookies que guarda una web mientras navegas', 'Tu descripción de perfil'],
      correcta: 2,
      explicacion: 'Las cookies se registran sin que tú publiques nada: es huella pasiva.',
    },
    {
      id: 'p9-11', concepto: 'huella', criterio: '3.3', tipo: 'opcion',
      texto: '¿Qué es el egosurfing?',
      opciones: ['Hacer surf en Fuerteventura', 'Buscar tu propio nombre en internet para ver qué aparece', 'Publicar muchos selfis', 'Navegar sin conexión'],
      correcta: 1,
      explicacion: 'Buscarse de vez en cuando ayuda a saber qué huella has dejado y a corregirla.',
    },
    {
      id: 'p9-12', concepto: 'huella', criterio: '3.3', tipo: 'opcion',
      texto: 'Borras una foto que subiste hace un año. ¿Ha desaparecido seguro de internet?',
      opciones: ['Sí, en el momento', 'No: alguien pudo copiarla, compartirla o guardarla antes', 'Sí, si la borras dos veces', 'Solo si era una foto privada'],
      correcta: 1,
      explicacion: 'Lo publicado puede haberse copiado. Por eso hay que pensar antes de publicar.',
    },
  ],
};
