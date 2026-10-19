// Piso X · El Laberinto de las Sombras
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saberes III.4 «Riesgos y amenazas en la red» (fraudes, grooming, sextorsión, ciberacoso)
// y III.5 «Bienestar digital» (desconexión, identidad positiva, netiqueta, violencias
// digitales). Criterio de evaluación 3.3.
//
// TEMA SENSIBLE (PLAN_TECNICO.md, sección 10.10): los textos deben revisarlos un docente o
// el departamento de orientación antes de usarlos en clase. Sin imágenes ni descripciones
// explícitas. Las conversaciones son simuladas: nunca hay contacto real con nadie.

export default {
  id: 'piso10',
  nombre: 'Piso X · El Laberinto de las Sombras',
  criterios: ['3.3'],
  revisadoDocente: false, // cambiar a true cuando un docente u orientador lo haya revisado

  intro: [
    'Niebla, pasillos estrechos y voces que susurran desde las paredes. **El Laberinto de las Sombras.**',
    'Las sombras de Morvath imitan a cualquiera: a un repartidor, a un banco… o a alguien de vuestra edad. Su arma es la **confianza**.',
    'Tres sellos: escuchar las **voces del laberinto** (oeste), ayudar en el **grupo de los ecos** (este) y dar la vuelta al **reloj de arena** (norte).',
    'Y algo importante: si alguna vez os pasa algo parecido de verdad, **no estáis solos**. El botón **017** de la esquina os dice a quién llamar.',
  ],

  ayuda: [
    '**017** · Tu Ayuda en Ciberseguridad (INCIBE): gratuito y confidencial, para cualquier problema en internet.',
    '**900 20 20 10** · Fundación ANAR: ayuda a niños y adolescentes, gratis y a cualquier hora.',
    '**112** · Emergencias, si hay un peligro inmediato.',
    'Y siempre: contadlo a un **adulto de confianza** (familia, tutor, orientación). Pedir ayuda no es exagerar.',
  ],

  lecciones: {
    fraudes: {
      titulo: 'Fraudes por mensaje y por llamada',
      resumen: 'Smishing: SMS o mensaje falso (un paquete, un premio, tu banco) con un enlace para robar datos o dinero. Vishing: llamada falsa que se hace pasar por el banco, la compañía o soporte técnico. Señales: prisa, amenaza o premio, enlaces raros, pedir claves o códigos. Ningún banco pide por mensaje ni por teléfono las claves ni el código que te llega al móvil. Qué hacer: no pulsar, no dar datos, colgar y llamar tú al número oficial, bloquear y reportar.',
      paginas: [
        'Las primeras sombras usan dos trucos viejos con ropa nueva.',
        'El **smishing** es un SMS o mensaje falso: «Tu paquete está retenido», «Has ganado un premio», «Tu cuenta se bloqueará». Lleva un **enlace** para robarte datos o dinero.',
        'El **vishing** es lo mismo por **llamada**: alguien que dice ser de tu banco, de tu compañía o de «soporte técnico».',
        'Las señales se repiten: **prisa**, una **amenaza** o un **premio**, enlaces raros y que te pidan **claves o códigos**.',
        'Ningún banco ni empresa seria te pide por mensaje o teléfono tus contraseñas ni **el código que te llega al móvil**. Si dudas: no pulses, cuelga y **llama tú** al número oficial.',
      ],
      despues: ['Las sombras del oeste os escribirán. Elegid qué responder: veréis qué pasa con cada opción.'],
    },
    grooming: {
      titulo: 'Grooming y sextorsión',
      resumen: 'Grooming: un adulto que se gana la confianza de un menor por internet, a menudo haciéndose pasar por alguien de su edad, para conseguir imágenes o un encuentro. Señales: halagos y regalos, pedir secreto, aislarte de tu gente, presionar para pasar a otra app o enviar fotos. Sextorsión: amenazar con difundir imágenes íntimas (reales o falsas) para pedir más imágenes o dinero. Qué hacer: no ceder ni pagar, no borrar las pruebas (capturas), bloquear y reportar, contárselo a un adulto de confianza, llamar al 017 y denunciar. La culpa nunca es de la víctima.',
      paginas: [
        'Estas sombras son las más peligrosas, porque no parecen sombras: parecen **amigos**.',
        'El **grooming** es cuando un adulto se gana la confianza de un menor por internet, muchas veces haciéndose pasar por alguien de su edad.',
        'Las señales: te halaga mucho, te hace regalos, te pide **que lo guardes en secreto**, intenta alejarte de tu gente, te presiona para pasar a otra app o para enviar fotos.',
        'La **sextorsión** es amenazar con difundir imágenes íntimas (reales o inventadas) para pedir más imágenes o dinero.',
        'Qué hacer: **no ceder ni pagar**, **no borrar las pruebas** (haz capturas), **bloquear y reportar**, contárselo a un **adulto de confianza**, llamar al **017** y **denunciar**.',
        'Y lo más importante: **la culpa nunca es de la víctima**. Nunca.',
      ],
      despues: ['Elegid con cuidado. Si falláis, no pasa nada: veréis por qué y podréis volver a elegir.'],
    },
    ciberacoso: {
      titulo: 'Ciberacoso: qué hacer si lo ves',
      resumen: 'Ciberacoso: humillar, amenazar, excluir o difundir algo de alguien de forma repetida por internet. Quien lo ve (el testigo) tiene mucho poder: si no reenvía ni ríe, el acoso pierde público. Qué hacer como testigo: no reenviar ni comentar, apoyar a la víctima en privado, reportar el contenido en la plataforma, guardar pruebas y avisar a un adulto (tutor, orientación). Difundir imágenes de alguien sin su permiso puede ser delito.',
      paginas: [
        'El **ciberacoso** es humillar, amenazar, excluir o difundir algo de alguien **de forma repetida** por internet.',
        'Casi siempre hay **testigos**: el grupo que lo ve. Y los testigos tienen más poder del que creen: sin público, el acoso se apaga.',
        'Como testigo: **no reenvíes** ni rías la gracia, **apoya a la víctima** en privado, **reporta** el contenido, **guarda pruebas** y **avisa a un adulto** (tutor, orientación).',
        'Difundir imágenes de alguien sin su permiso no es una broma: puede ser **delito**.',
      ],
      despues: ['En el grupo de los ecos está pasando algo. Vosotros sois los testigos.'],
    },
    bienestar: {
      titulo: 'Bienestar digital',
      resumen: 'Bienestar digital: usar la tecnología sin que te haga daño. Señales de uso problemático: no poder dejar el móvil, dormir mal, dejar otras cosas. Ayuda: horarios sin pantallas, quitar notificaciones, el móvil fuera del dormitorio por la noche. Identidad digital positiva: publicar lo que te representa y respetar a los demás (netiqueta). Violencias sexistas digitales: controlar el móvil o la ubicación de la pareja, exigir contraseñas, difundir imágenes íntimas sin permiso; no es amor, es control.',
      paginas: [
        'El último sello no tiene trampas: tiene un **reloj de arena**. Va de cómo usáis el tiempo y la tecnología.',
        'Hay señales de que el móvil manda más que vosotros: no poder dejarlo, dormir mal, dejar otras cosas que os gustaban.',
        'Ayuda: **horarios sin pantallas**, quitar notificaciones y dejar el móvil **fuera del dormitorio** por la noche.',
        'Vuestra **identidad digital** puede ser positiva: publicar lo que os representa y tratar a los demás con respeto (**netiqueta**).',
        'Y una alerta: **controlar** el móvil o la ubicación de la pareja, exigir sus contraseñas o difundir imágenes íntimas sin permiso es **violencia digital**. No es amor: es control.',
      ],
      despues: ['Dadle la vuelta al reloj respondiendo con calma.'],
    },
  },

  // ---------- Sello 1 · Las voces del laberinto (chats simulados) ----------
  // pasos: { de: 'otro' | 'yo', texto } o { elige: [{ texto, ok, efecto }] }
  voces: [
    {
      contacto: 'Mensajería Express', titulo: 'Un SMS', leccion: 'fraudes',
      pasos: [
        { de: 'otro', texto: 'MensajeriaExpress: Su paquete esta retenido por 1,99 € de tasas. Pague hoy o se devolvera: http://mensajeria-express-pago.co/r7' },
        { elige: [
          { texto: 'Pulso el enlace y pago, que son solo 1,99 €.', ok: false, efecto: 'En la «página de pago» acabas de escribir los datos de tu tarjeta. Esos 1,99 € eran el cebo: ahora tienen tu tarjeta. Esto es **smishing**.' },
          { texto: 'No pulso. Si espero un paquete, lo miro en la web oficial escribiendo yo la dirección.', ok: true, efecto: 'Bien visto: dirección rara, prisa y un pago pequeño son las señales del **smishing**. Lo borras y lo reportas como spam.' },
        ] },
      ],
    },
    {
      contacto: 'Número desconocido', titulo: 'Una llamada', leccion: 'fraudes',
      pasos: [
        { de: 'otro', texto: '(Llamada) Buenas tardes, le llamo del departamento de seguridad de su banco. Hemos detectado un cargo sospechoso. Para anularlo, dígame el código que le acaba de llegar por SMS.' },
        { elige: [
          { texto: 'Le doy el código, que es para anular el cargo.', ok: false, efecto: 'Ese código era la llave para que **ellos** hicieran el cargo. Esto es **vishing**: ningún banco te pide ese código por teléfono.' },
          { texto: 'Cuelgo y llamo yo al número que aparece en la web oficial o en la tarjeta.', ok: true, efecto: 'Exacto. Si de verdad fuera tu banco, te lo confirmarán. Ningún banco pide claves ni códigos por teléfono.' },
        ] },
      ],
    },
    {
      contacto: 'leo_2009', titulo: 'Alguien «de tu edad»', leccion: 'grooming',
      pasos: [
        { de: 'otro', texto: 'Holaa, te vi en el grupo del juego. Eres muy buen jugador, la verdad 😄 ¿Cuántos años tienes?' },
        { de: 'otro', texto: 'Yo también tengo 16. Oye, mejor hablamos por otra app, que aquí nos leen. Y no se lo cuentes a nadie, ¿vale? Es nuestro secreto 🤫' },
        { elige: [
          { texto: 'Vale, me paso a la otra app. Parece majo.', ok: false, efecto: 'Pedir **secreto** y llevarte a otra app más privada son señales típicas de **grooming**. Nadie que te quiera bien te pide que lo escondas.' },
          { texto: 'No me paso. Lo de pedir secreto me da mala espina: lo bloqueo, lo reporto y se lo cuento a un adulto.', ok: true, efecto: 'Muy bien. Pedir secreto, halagar mucho y cambiar de app son señales de alarma. Bloquear, reportar y contarlo es lo correcto.' },
        ] },
      ],
    },
    {
      contacto: 'Cuenta sin foto', titulo: 'Una amenaza', leccion: 'grooming',
      pasos: [
        { de: 'otro', texto: 'Tengo una foto tuya que no te gustaría que vieran tus amigos. Si no me mandas 50 € esta noche, la publico.' },
        { elige: [
          { texto: 'Pago para que lo borre y no se lo cuento a nadie, que me da vergüenza.', ok: false, efecto: 'Pagar no garantiza nada: suelen pedir **más**. Esto es **sextorsión**, y la vergüenza es justo lo que buscan para que no pidas ayuda.' },
          { texto: 'No pago, hago capturas, no borro nada, lo bloqueo y lo reporto, se lo cuento a un adulto y llamamos al 017.', ok: true, efecto: 'Es lo correcto: **no ceder**, **guardar pruebas**, contarlo y **denunciar**. Y recuerda: la culpa nunca es de la víctima.' },
        ] },
      ],
    },
  ],

  // ---------- Sello 2 · El grupo de los ecos (testigo de ciberacoso) ----------
  ecos: {
    contacto: 'Grupo «1.º B 🎮»', titulo: 'El grupo de clase',
    pasos: [
      { de: 'otro', quien: 'Marcos', texto: 'JAJAJA mirad la foto que le hice a Sara en el recreo 😂😂' },
      { de: 'otro', quien: 'Íker', texto: 'Pásala al otro grupo, que la vean todos' },
      { de: 'otro', quien: 'Sara', texto: 'Borradla porfa…' },
      { elige: [
        { texto: 'Me río y la reenvío, que es solo una broma.', ok: false, efecto: 'Cada reenvío multiplica el daño. Para Sara no es una broma: es **ciberacoso**, y difundir su foto sin permiso puede ser delito.' },
        { texto: 'No digo nada y salgo del grupo.', ok: false, efecto: 'Salir evita que participes, pero Sara sigue sola. El testigo puede hacer **más**.' },
        { texto: 'No la reenvío, digo en el grupo que la borren, escribo a Sara en privado para apoyarla y lo reporto y aviso al tutor.', ok: true, efecto: 'Eso es ser un buen testigo: **sin público no hay acoso**. Apoyar a la víctima y avisar a un adulto lo para.' },
      ] },
      { de: 'otro', quien: 'Sara', texto: 'Gracias… de verdad.' },
    ],
  },

  // ---------- Sello 3 · El reloj de arena (bienestar digital) ----------
  reloj: [
    {
      id: 'p10-r1', concepto: 'bienestar', criterio: '3.3', tipo: 'opcion',
      texto: 'Te cuesta dormir porque miras el móvil hasta muy tarde. ¿Qué ayuda más?',
      opciones: ['Bajar el brillo y seguir', 'Dejar el móvil fuera del dormitorio y poner una hora sin pantallas', 'Poner más alarmas', 'Mirar vídeos más cortos'],
      correcta: 1,
      explicacion: 'Sacar el móvil del dormitorio y fijar una hora sin pantallas es de lo que más ayuda a descansar.',
    },
    {
      id: 'p10-r2', concepto: 'bienestar', criterio: '3.3', tipo: 'opcion',
      texto: 'Tu pareja te pide tus contraseñas y la ubicación en tiempo real «porque si me quieres no tienes nada que esconder». ¿Qué es esto?',
      opciones: ['Una muestra de amor', 'Control: es una forma de violencia digital', 'Algo normal en todas las parejas', 'Una medida de seguridad'],
      correcta: 1,
      explicacion: 'Exigir contraseñas o la ubicación es control, no amor. Es violencia digital y se puede pedir ayuda (017, 016 para violencia de género).',
    },
    {
      id: 'p10-r3', concepto: 'bienestar', criterio: '3.3', tipo: 'opcion',
      texto: '¿Cuál de estas acciones construye una identidad digital positiva?',
      opciones: ['Insultar en los comentarios con una cuenta falsa', 'Compartir un proyecto propio y responder con respeto a las críticas', 'Publicar fotos de otros sin preguntarles', 'Tener el perfil lleno de retos peligrosos'],
      correcta: 1,
      explicacion: 'Mostrar lo que haces y tratar a los demás con respeto (netiqueta) construye una buena reputación.',
    },
    {
      id: 'p10-r4', concepto: 'bienestar', criterio: '3.3', tipo: 'opcion',
      texto: 'Alguien de clase recibe una foto íntima de otra persona y le dicen que la pase. ¿Qué debe hacer?',
      opciones: ['Pasarla solo a un amigo', 'Borrarla, no reenviarla y avisar a un adulto: difundirla sin permiso puede ser delito', 'Guardarla por si acaso', 'Preguntar en el grupo si alguien más la tiene'],
      correcta: 1,
      explicacion: 'Reenviar imágenes íntimas de alguien sin su permiso hace daño y puede ser delito, aunque no la hicieras tú.',
    },
  ],

  pistas: {
    voces: 'Las **voces del laberinto** están en el lado oeste. Buscad la sombra y pulsad **E**.',
    ecos: 'El **grupo de los ecos** está en el lado este. Pulsad **E** junto a la sombra.',
    reloj: 'El **reloj de arena** está al norte, cerca de la puerta. Pulsad **E** junto a él.',
    puerta: '¡La puerta del norte está abierta! Subid por la escalera.',
  },

  sellosRotos: [
    '¡Los tres sellos del laberinto están rotos! La niebla se levanta.',
    'Entre las paredes queda una sombra quieta. No ataca: **recuerda**.',
  ],

  memoria: [
    'Un joven Morvath lee mensajes en un espejo. Todos dicen lo mismo: «Nadie te entiende como yo».',
    'Los escribe él. A aprendices solos, a quienes nadie escucha. Así consiguió que le contaran sus secretos… y que le obedecieran.',
    'Aldric lo descubrió y se lo contó a los maestros. Morvath nunca se lo perdonó.',
    'Por eso estas sombras imitan la confianza: es lo primero que él aprendió a robar. Seguid subiendo. Ya queda poco.',
  ],

  preguntas: [
    {
      id: 'p10-01', concepto: 'fraudes', criterio: '3.3', tipo: 'opcion',
      texto: '¿Qué es el smishing?',
      opciones: ['Un tipo de antivirus', 'Un fraude por SMS o mensaje con un enlace falso', 'Una red social', 'Un juego de móvil'],
      correcta: 1,
      explicacion: 'El smishing es phishing por SMS o mensajería: un mensaje falso con un enlace para robar datos.',
    },
    {
      id: 'p10-02', concepto: 'fraudes', criterio: '3.3', tipo: 'opcion',
      texto: 'Te llaman «de tu banco» y te piden el código que te acaba de llegar por SMS. ¿Qué haces?',
      opciones: ['Se lo doy, que es el banco', 'Cuelgo y llamo yo al número oficial', 'Le doy solo la mitad', 'Le pido que me lo repita'],
      correcta: 1,
      explicacion: 'Ningún banco pide ese código. Se cuelga y se llama al número oficial.',
    },
    {
      id: 'p10-03', concepto: 'fraudes', criterio: '3.3', tipo: 'opcion',
      texto: '¿Cuál es una señal típica de fraude en un mensaje?',
      opciones: ['Que esté bien escrito', 'Que meta prisa con una amenaza o un premio', 'Que venga de un amigo', 'Que sea largo'],
      correcta: 1,
      explicacion: 'La prisa, la amenaza o el premio buscan que actúes sin pensar.',
    },
    {
      id: 'p10-04', concepto: 'grooming', criterio: '3.3', tipo: 'opcion',
      texto: '¿Cuál de estas es una señal de grooming?',
      opciones: ['Que te pida que vuestras conversaciones sean secretas', 'Que hable de deportes', 'Que use emojis', 'Que juegue al mismo juego'],
      correcta: 0,
      explicacion: 'Pedir secreto y aislarte de tu gente son señales de alarma.',
    },
    {
      id: 'p10-05', concepto: 'grooming', criterio: '3.3', tipo: 'opcion',
      texto: 'Si alguien te amenaza con publicar una foto tuya, ¿qué NO debes hacer?',
      opciones: ['Hacer capturas', 'Contárselo a un adulto', 'Pagar lo que pide', 'Llamar al 017 o denunciar'],
      correcta: 2,
      explicacion: 'Pagar no lo para: suelen pedir más. Hay que guardar pruebas, contarlo y denunciar.',
    },
    {
      id: 'p10-06', concepto: 'grooming', criterio: '3.3', tipo: 'opcion',
      texto: '¿De quién es la culpa en un caso de sextorsión?',
      opciones: ['De la víctima, por haber confiado', 'De quien amenaza y extorsiona', 'De los dos por igual', 'De la red social'],
      correcta: 1,
      explicacion: 'La culpa es siempre de quien extorsiona. Nunca de la víctima.',
    },
    {
      id: 'p10-07', concepto: 'grooming', criterio: '3.3', tipo: 'opcion',
      texto: '¿Qué es el 017?',
      opciones: ['Un juego', 'El teléfono gratuito y confidencial de INCIBE para ayudar con problemas en internet', 'Una red social', 'El número de la policía de tráfico'],
      correcta: 1,
      explicacion: 'El 017 (Tu Ayuda en Ciberseguridad) ayuda gratis y de forma confidencial.',
    },
    {
      id: 'p10-08', concepto: 'ciberacoso', criterio: '3.3', tipo: 'opcion',
      texto: 'Ves que en un grupo se burlan de un compañero con una foto. ¿Qué es lo más útil como testigo?',
      opciones: ['Reírse para no quedar mal', 'No reenviar, apoyar al compañero, reportar y avisar a un adulto', 'Reenviarla a otro grupo', 'Esperar a que se pase solo'],
      correcta: 1,
      explicacion: 'Sin público, el acoso pierde fuerza. Apoyar y avisar lo para.',
    },
    {
      id: 'p10-09', concepto: 'ciberacoso', criterio: '3.3', tipo: 'opcion',
      texto: '¿Qué hace que algo sea ciberacoso y no una pelea puntual?',
      opciones: ['Que sea por internet y se repita para humillar o dañar', 'Que haya emojis', 'Que lo vea mucha gente una vez', 'Que sea entre amigos'],
      correcta: 0,
      explicacion: 'El ciberacoso es intencionado y repetido, y busca humillar, excluir o dañar.',
    },
    {
      id: 'p10-10', concepto: 'bienestar', criterio: '3.3', tipo: 'opcion',
      texto: '¿Qué es la netiqueta?',
      opciones: ['Una marca de ropa', 'Las normas de respeto y buena educación en internet', 'Un tipo de virus', 'Una etiqueta de precio'],
      correcta: 1,
      explicacion: 'La netiqueta son las normas de convivencia en la red: respeto, no gritar en mayúsculas, no difundir sin permiso…',
    },
    {
      id: 'p10-11', concepto: 'bienestar', criterio: '3.3', tipo: 'opcion',
      texto: '¿Cuál es una señal de uso problemático del móvil?',
      opciones: ['Usarlo para estudiar', 'No poder dejarlo aunque quieras y dormir mal por él', 'Llamar a la familia', 'Hacer fotos de un viaje'],
      correcta: 1,
      explicacion: 'Si no puedes dejarlo y te quita descanso o cosas que te gustaban, conviene poner límites.',
    },
  ],
};
