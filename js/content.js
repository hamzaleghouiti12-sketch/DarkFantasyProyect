// Contenido educativo y narrativo. Todo el texto del juego vive aquí para que
// un docente pueda revisarlo o ampliarlo sin tocar el motor.
// Piso I → Bloque "Digitalización del entorno personal de aprendizaje":
// seguridad en la red (contraseñas, verificación en dos pasos, phishing).

export const PROLOGO = {
  paginas: [
    'Era una tarde normal en el aula de informática. Hasta que todas las pantallas se volvieron **violetas** a la vez… y el suelo desapareció bajo vuestros pies.',
    'Despertasteis en **Umbravel**, un reino de piedra, niebla y lunas pálidas. Os había traído **Aldric**, un mago que intentaba abrir un portal entre mundos. El experimento salió mal.',
    'Durante dos días, Aldric os dio cobijo en su taller. Le fascinaba vuestro mundo: las contraseñas le parecían **sellos mágicos**, y las redes, hechizos que unen a la gente.',
    'La tercera mañana, Aldric no bajó a desayunar. Su bastón seguía junto a la puerta. Y sobre la mesa del taller, algo **brillaba**.',
  ],
  finalCasa: [
    'El portal os devuelve al aula. Todo parece normal. Pero cada noche soñáis con una torre negra… y con un mago al que **nadie fue a buscar**.',
  ],
};

// Cinemática de inicio (js/cinematica.js): los cuatro amigos, el portal y Aldric.
// Cada línea: [quién, texto]. Los nombres de los chicos van con sus personajes.
export const CINE_INICIO = {
  amigos: { encapuchado: 'Leo', picaro: 'Nayra', caballero: 'Dani', barbaro: 'Aitor' },
  parque: [
    ['Nayra', '¿Habéis terminado el trabajo de Informática?'],
    ['Aitor', 'Ni lo he empezado. ¿Para qué quiero saber lo que es un byte?'],
    ['Dani', 'Para no llorar cuando se te rompa el móvil y pierdas todas las fotos, listo.'],
    ['Leo', 'Eh… ¿lo oís? Es como un zumbido…'],
  ],
  portal: [
    ['Nayra', '¡¿Qué es eso?! ¡El suelo está brillando!'],
    ['Aitor', '¡Agarraos a algo!'],
  ],
  llegada: [
    ['Aldric', '¡No, no, NO! ¡Tres lunas calibrando el portal… y en vez de abrirse a otro mundo me escupe críos!'],
    ['Aldric', '¡Mis cristales! ¡Mis cálculos! ¡Todo perdido!'],
    ['Aldric', '…Un momento.'],
    ['Aldric', 'Esas ropas… Ese ladrillo que brilla en vuestra mano… ¿De dónde habéis salido?'],
    ['Dani', 'Es… es un móvil. ¿Dónde estamos? ¿Quién es usted?'],
    ['Aldric', 'Aldric, mago e inventor. Estáis en Umbravel. ¡Y vosotros venís del otro lado del portal! Fascinante…'],
    ['Nayra', '¿Puede devolvernos a casa?'],
    ['Aldric', 'Puedo intentarlo. Pero el portal tardará días en recargarse. Mientras tanto… sois mis invitados.'],
  ],
  rotuloDias: 'Los días siguientes…',
  dias: [
    ['Aldric', '¿Una palabra secreta que protege toda vuestra memoria? ¡Eso es un sello mágico!'],
    ['Leo', 'Bueno… lo llamamos contraseña. Y mejor que sea larga.'],
    ['Aldric', '¿Y vuestras «redes» unen a millones de personas a la vez? ¡No conozco hechizo más poderoso!'],
  ],
  rotuloNoche: 'La segunda noche…',
  rotuloFinal: 'La tercera mañana, Aldric no bajó a desayunar. Su bastón seguía junto a la puerta. Y sobre la mesa del taller, algo brillaba.',
};

// Cinemática corta: la primera vez que se ve la torre desde el camino
export const CINE_TORRE = [
  ['Aldric (holograma)', 'Ahí está: la torre de Morvath. Cada piso guarda un saber que él ha robado, protegido por tres sellos.'],
  ['Aldric (holograma)', 'Yo estoy en lo más alto. Seguid el camino hasta el arco… y no os separéis.'],
];

// La casa de Aldric: primera zona jugable
export const CASA = {
  nombre: 'La casa de Aldric · El taller',
  inicio: 'El taller está en silencio. Sobre la mesa, un **cristal azul** late como un corazón. (Acércate y pulsa **E**)',
  mensaje: [
    '¿Me oís? Bien… Si estáis viendo este holograma, es que **Morvath** me ha capturado. Anoche vinieron a por mí mientras dormíais.',
    'Estoy en lo alto de su torre, al norte. Quiere algo que solo yo sé hacer… y no pienso dárselo por las buenas.',
    'Escuchadme bien. El **portal** de mi experimento, el de la pared, todavía funciona. **Una sola vez.** Si lo cruzáis, volveréis a vuestra aula.',
    'O podéis salir por esa **puerta** y seguir el camino hasta la torre. No os voy a obligar. Es vuestra decisión.',
  ],
  aceptar: [
    'Habéis elegido venir a por mí. Gracias… de verdad.',
    'Llevad el cristal con vosotros: así podré guiaros y enseñaros lo que necesitéis. Y tomad esta **varita**.',
    'Es caprichosa: solo lanza un hechizo si le demuestras algo que hayas aprendido. Pulsa **F** para usarla. Si os perdéis, pulsad **H** y os daré una pista.',
    'Seguid el camino hacia el norte. La torre no tiene pérdida. Al pie hay un **arco** que os llevará dentro.',
  ],
  pistas: {
    cristal: 'El **cristal azul** está sobre la mesa de trabajo. Acercaos y pulsad **E**.',
    decidir: 'Tenéis que decidir: el **portal** de la pared os devuelve a casa; la **puerta** os lleva hasta mí.',
    salir: 'La **puerta** de la casa está al sur. Acercaos y pulsad **E**.',
  },
};

// El camino hasta la torre
export const EXTERIOR = {
  nombre: 'Umbravel · El camino a la torre',
  llegada: [
    'El aire de Umbravel es frío por la noche. Seguid el **camino de tierra** hacia el norte: la torre de Morvath está al final.',
  ],
  comentarios: {
    cementerio: ['Ese cementerio es más viejo que la torre. Morvath no siempre fue malvado… pero esa historia os la contaré en otro momento.'],
    santuario: ['Un santuario de los antiguos guardianes. Alguien sigue encendiendo sus velas. Eso me da esperanza.'],
    torre: ['Ahí está: la **torre de Morvath**. El arco brillante es un portal: os llevará directamente al primer piso.'],
  },
  pistas: {
    camino: 'Seguid el **camino de tierra** hacia el norte hasta la torre. Las farolas marcan la ruta.',
    arco: 'El **arco brillante** al pie de la torre es la entrada. Acercaos y pulsad **E**.',
  },
};

export const PISO1 = {
  nombre: 'Piso I · La Cámara de los Sellos',

  intro: [
    'Ya estamos dentro. Esta es la base de la torre de Morvath: **la Cámara de los Sellos**.',
    'Cada piso está cerrado por **sellos**. Para abrir la puerta del norte tendréis que romper **tres**.',
    'Las defensas de Morvath se alimentan de conocimiento… de vuestro mundo, curiosamente. Yo os enseñaré lo que necesitáis. Vosotros tendréis que **demostrarlo**.',
    'Acercaos a cada desafío y pulsad **E**. Yo iré con vosotros.',
  ],

  lecciones: {
    '2fa': {
      titulo: 'Verificación en dos pasos',
      resumen: 'Demostrar quién eres con dos factores distintos: algo que sabes (contraseña), algo que tienes (móvil) o algo que eres (huella, cara). Si roban tu contraseña, sin el segundo factor no pueden entrar. El código de verificación no se comparte con nadie.',
      paginas: [
        'Este cartel guarda el primer sello. Antes de leerlo, escuchad: a veces **un solo sello no basta**.',
        'Por eso existe la **verificación en dos pasos** (también llamada autenticación de doble factor, o **2FA**).',
        'Consiste en demostrar quién eres con **dos cosas distintas**: algo que **sabes** (tu contraseña), algo que **tienes** (tu móvil) o algo que **eres** (tu huella o tu cara).',
        'Aunque un ladrón descubra tu contraseña, sin el segundo factor, por ejemplo el **código que llega a tu móvil**, no podrá entrar.',
        'Por eso ese código **nunca se comparte**. Ni con un amigo, ni con alguien que diga ser «del soporte técnico». Ahora sí: leed el cartel.',
      ],
    },
    contrasenas: {
      titulo: 'Contraseñas robustas',
      resumen: 'Largas (12 caracteres o más), mezclando mayúsculas, minúsculas, números y símbolos. Sin datos personales. Truco: varias palabras sin relación. Una distinta para cada cuenta; un gestor de contraseñas ayuda a recordarlas.',
      paginas: [
        'En mi mundo, un sello protege una puerta. En el vuestro, una **contraseña** protege vuestras cuentas: el correo, las redes, la plataforma del instituto.',
        'Una contraseña robusta es **larga** (12 caracteres o más) y mezcla **mayúsculas, minúsculas, números y símbolos**.',
        'Nunca uséis **datos personales**: vuestro nombre, vuestra fecha de nacimiento, el nombre de vuestra mascota… Es lo primero que prueba un atacante.',
        'Truco de archimago: unid **varias palabras sin relación**, como «Gato-Luna-Tostada». Es fácil de recordar y muy difícil de adivinar.',
        'Y lo más importante: **una contraseña distinta para cada cuenta**. Si roban una, las demás siguen a salvo. Un **gestor de contraseñas** os ayuda a recordarlas todas.',
      ],
      despues: [
        'Cuatro cristales, cuatro contraseñas. Solo una es lo bastante fuerte para romper el sello.',
        'Acercaos a esa y ofrecedla al altar con **E**. Pensadlo bien: un cristal débil os estallará en la cara.',
      ],
    },
    phishing: {
      titulo: 'Phishing',
      resumen: 'Engaño que suplanta a un banco, una red social, una tienda o una persona para robarte datos. Señales: prisa, piden contraseñas o tarjeta, premios que no pediste, remitentes o enlaces con letras cambiadas. Ante la duda, no pulses: entra tú en la web oficial.',
      paginas: [
        '¡Cuidado! Esos pergaminos flotantes son mensajes. Los ladrones de mi mundo usan disfraces… y los del vuestro también. Se llama **phishing**, de «fishing»: **pescar**.',
        'Es un **engaño**: un mensaje que se hace pasar por tu banco, una red social, una tienda o incluso un amigo, para que le des tus **contraseñas o tus datos**.',
        'Señales de alerta: te meten **prisa** («en 10 minutos»), te piden **contraseñas o datos de tarjeta**, prometen **premios** que no pediste, o el remitente o el enlace **no son los oficiales**: letras cambiadas como «banc0-seguro.com» o dominios inventados como «instagram-verificacion.net».',
        'Una empresa de verdad **nunca** te pedirá tu contraseña por mensaje. Ante la duda, no pulses el enlace: entra tú mismo en la web o la app oficial.',
      ],
      despues: [
        'Algunos de estos pergaminos son trampas de phishing; otros son mensajes legítimos. **Destruid solo los falsos.**',
        'Girad la cámara hacia un pergamino para leerlo y pulsad **F** para usar la varita sobre él. Si destruís uno legítimo… lo notaréis.',
      ],
    },
  },

  cartel: {
    id: 'cartel',
    concepto: '2fa',
    texto: 'Alguien ha robado la contraseña de tu cuenta del instituto, pero tienes activada la verificación en dos pasos. ¿Qué pasa cuando intente entrar?',
    opciones: [
      'Entra sin problema: con la contraseña es suficiente.',
      'Le pedirá también el segundo factor, como el código que llega a tu móvil, y sin él no podrá entrar.',
      'La cuenta se borra automáticamente para protegerte.',
      'Su ordenador se bloquea y deja de funcionar.',
    ],
    correcta: 1,
    explicacion: 'La verificación en dos pasos pide algo más que la contraseña. Sin tu móvil (o tu huella), el ladrón se queda en la puerta.',
  },

  altar: [
    { texto: 'maria2009', ok: false, porque: 'Es un nombre y un año: datos personales que cualquiera puede averiguar mirando tus redes.' },
    { texto: '123456789', ok: false, porque: 'Es una de las contraseñas más usadas del mundo. Un programa la adivina en menos de un segundo.' },
    { texto: 'Gato-Luna-Tostada-47!', ok: true, porque: 'Larga, con palabras sin relación, mayúsculas, números y símbolos.' },
    { texto: 'Contraseña', ok: false, porque: 'Es una palabra del diccionario. Los atacantes prueban listas enteras de palabras así.' },
  ],

  pergaminos: [
    {
      de: 'Banco Seguro',
      texto: 'Hemos bloqueado tu cuenta. Entra en banc0-seguro.com y escribe tu PIN antes de 10 minutos.',
      fraude: true,
      motivo: 'Te mete prisa, te pide el PIN y el enlace cambia la «o» por un «0».',
    },
    {
      de: 'Prof. de Tecnología · Aula virtual',
      texto: 'Recordatorio: la práctica del tema 3 se entrega el viernes en vuestro curso del aula virtual.',
      fraude: false,
      motivo: 'No pide datos ni contraseñas, no mete prisa y llega por la plataforma oficial del centro.',
    },
    {
      de: '¡¡PREMIO!!',
      texto: '¡Enhorabuena! Has ganado un móvil nuevo. Solo tienes que pagar 1 € de envío con los datos de tu tarjeta.',
      fraude: true,
      motivo: 'Un premio que no pediste que te pide los datos de tu tarjeta.',
    },
    {
      de: 'soporte@instagram-verificacion.net',
      texto: 'Tu cuenta será eliminada hoy. Respóndenos con tu usuario y tu contraseña para verificarla.',
      fraude: true,
      motivo: 'Ninguna empresa real te pide la contraseña, y el remitente no es el dominio oficial (instagram.com).',
    },
    {
      de: 'App de mensajería',
      texto: 'Tu código de verificación es 482 913. No lo compartas con nadie. (Lo acabas de pedir tú al iniciar sesión.)',
      fraude: false,
      motivo: 'Es el segundo factor que tú mismo has pedido. Es legítimo… mientras no se lo des a nadie.',
    },
  ],

  pistas: {
    cartel: 'El **cartel del guardián** está en el lado oeste de la sala, a vuestra izquierda al entrar. Acercaos y pulsad **E**.',
    altar: 'El **altar de los cristales** está en el lado este, a vuestra derecha. Buscad la contraseña más robusta.',
    pergaminos: 'Los **pergaminos flotantes** están junto a la puerta del norte. Leedlos bien antes de disparar: solo los de phishing deben arder.',
    puerta: '¡La puerta del norte está abierta! Cruzadla para subir al siguiente piso.',
  },

  sellosRotos: [
    '¡Los **tres sellos** están rotos! Lo habéis hecho muy bien.',
    'La puerta del norte se está abriendo. Arriba os espera el segundo piso… y, algún día, Morvath.',
  ],
};

// Preguntas de la varita: salen al azar, solo de los conceptos ya aprendidos.
export const PREGUNTAS = [
  // Contraseñas
  {
    id: 'c1', concepto: 'contrasenas',
    texto: '¿Cuál de estas contraseñas es la más robusta?',
    opciones: ['lucas2011', 'qwerty123', 'Nube.Tren-Lápiz_83', 'contraseña'],
    correcta: 2,
    explicacion: 'Es larga, une palabras sin relación y mezcla mayúsculas, números y símbolos.',
  },
  {
    id: 'c2', concepto: 'contrasenas',
    texto: '¿Por qué no debes usar la misma contraseña en todas tus cuentas?',
    opciones: [
      'Porque si roban una, el atacante puede entrar en todas las demás.',
      'Porque las webs no lo permiten.',
      'Porque las contraseñas se gastan con el uso.',
      'No pasa nada, es más cómodo usar siempre la misma.',
    ],
    correcta: 0,
    explicacion: 'Una contraseña robada abre todas las puertas que usen esa misma contraseña.',
  },
  {
    id: 'c3', concepto: 'contrasenas',
    texto: '¿Qué dato NUNCA deberías usar en una contraseña?',
    opciones: ['Un símbolo como #', 'Tu fecha de nacimiento', 'Una palabra inventada', 'Un número al azar'],
    correcta: 1,
    explicacion: 'Los datos personales son fáciles de averiguar: es lo primero que prueba un atacante.',
  },
  {
    id: 'c4', concepto: 'contrasenas',
    texto: '¿Qué herramienta te ayuda a guardar muchas contraseñas distintas de forma segura?',
    opciones: ['Un pósit pegado en la pantalla', 'Un mensaje a tu mejor amigo', 'Un gestor de contraseñas', 'Una nota pública en tus redes'],
    correcta: 2,
    explicacion: 'Un gestor de contraseñas las guarda cifradas y solo necesitas recordar una contraseña maestra.',
  },
  // Verificación en dos pasos
  {
    id: 'd1', concepto: '2fa',
    texto: 'En la verificación en dos pasos, ¿cuál es un ejemplo de «algo que tienes»?',
    opciones: ['Tu contraseña', 'Tu móvil, donde llega un código', 'Tu nombre de usuario', 'Tu color favorito'],
    correcta: 1,
    explicacion: 'El móvil es un objeto que posees. La contraseña es «algo que sabes».',
  },
  {
    id: 'd2', concepto: '2fa',
    texto: 'Alguien que dice ser del soporte técnico te pide el código de verificación que te acaba de llegar. ¿Qué haces?',
    opciones: [
      'Se lo doy: es del soporte técnico.',
      'Se lo doy solo si es amable.',
      'No se lo doy: ese código no se comparte con nadie.',
      'Lo publico para que lo pueda comprobar.',
    ],
    correcta: 2,
    explicacion: 'Con ese código, quien tenga tu contraseña puede entrar en tu cuenta. Nadie legítimo te lo pedirá.',
  },
  {
    id: 'd3', concepto: '2fa',
    texto: 'Usar tu huella dactilar para desbloquear una cuenta es un factor de tipo…',
    opciones: ['Algo que sabes', 'Algo que tienes', 'Algo que eres', 'Algo que compras'],
    correcta: 2,
    explicacion: 'La huella, la cara o la voz son rasgos biométricos: «algo que eres».',
  },
  {
    id: 'd4', concepto: '2fa',
    texto: '¿Para qué sirve activar la verificación en dos pasos?',
    opciones: [
      'Para que el móvil vaya más rápido.',
      'Para que no baste con robar tu contraseña para entrar en tu cuenta.',
      'Para no tener que usar contraseña nunca más.',
      'Para recibir más publicidad.',
    ],
    correcta: 1,
    explicacion: 'Añade una segunda barrera: aunque roben la contraseña, falta el segundo factor.',
  },
  // Phishing
  {
    id: 'p1', concepto: 'phishing',
    texto: '¿Qué es el phishing?',
    opciones: [
      'Un virus que rompe la pantalla.',
      'Un engaño que suplanta a una empresa o persona para robarte datos.',
      'Una red wifi gratuita.',
      'Un tipo de copia de seguridad.',
    ],
    correcta: 1,
    explicacion: 'El phishing «pesca» tus datos haciéndose pasar por alguien de confianza.',
  },
  {
    id: 'p2', concepto: 'phishing',
    texto: '¿Cuál de estas es una señal de alerta de phishing?',
    opciones: [
      'Tu profesora recuerda la fecha de un examen en clase.',
      'Un amigo te saluda en persona.',
      'Un mensaje te dice: «Tienes 10 minutos o bloquearemos tu cuenta».',
      'Tu calendario te recuerda un cumpleaños.',
    ],
    correcta: 2,
    explicacion: 'Meter prisa es un truco clásico: quieren que actúes sin pensar.',
  },
  {
    id: 'p3', concepto: 'phishing',
    texto: 'Te llega un correo de «tu banco» con un enlace para «verificar tu cuenta». ¿Qué es lo más seguro?',
    opciones: [
      'Pulsar el enlace rápido, por si acaso.',
      'Responder con mis datos.',
      'Reenviarlo a todos mis contactos.',
      'No pulsar el enlace y entrar yo mismo en la web o la app oficial.',
    ],
    correcta: 3,
    explicacion: 'Si entras tú por el camino oficial, esquivas cualquier enlace falso.',
  },
  {
    id: 'p4', concepto: 'phishing',
    texto: '¿Qué tiene de sospechoso el remitente «soporte@instagram-verificacion.net»?',
    opciones: [
      'Nada, parece correcto.',
      'Que tiene una arroba.',
      'No es el dominio oficial de Instagram, que es instagram.com.',
      'Que está escrito en minúsculas.',
    ],
    correcta: 2,
    explicacion: 'Los estafadores usan dominios que se parecen al real. Fíjate siempre en lo que va detrás de la @.',
  },
];
