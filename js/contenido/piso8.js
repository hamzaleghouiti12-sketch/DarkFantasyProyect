// Piso VIII · Las Criptas del Contagio
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saberes III.1.1 «Seguridad de los dispositivos» y III.1.2 «Malware». Criterio 3.1.

export default {
  id: 'piso8',
  nombre: 'Piso VIII · Las Criptas del Contagio',
  criterios: ['3.1'],

  intro: [
    'Cuidado. Este piso está **infectado**. Las criaturas que veis son los **programas maliciosos** de Morvath.',
    'No os harán daño, pero no os dejarán pasar. Para desterrarlas hay que **identificar qué son** y aplicar la **contramedida** correcta.',
    'Tres sellos: desterrar las **seis criaturas** con la varita (**F**, apuntando), levantar la **muralla cortafuegos** (este) y proteger el **tesoro de la tríada** (norte).',
  ],

  lecciones: {
    malware: {
      titulo: 'Malware: tipos, vías y síntomas',
      resumen: 'Malware: software malicioso. Virus: se esconde en un archivo y se activa cuando lo abres. Gusano: se copia solo por la red, sin ayuda. Troyano: se disfraza de programa útil. Ransomware: cifra tus archivos y pide un rescate. Spyware: espía lo que haces; el keylogger registra las teclas. Adware: publicidad invasiva. Rootkit y puerta trasera (backdoor): control oculto del equipo. Botnet: red de equipos zombis controlados a distancia. Criptominado: usa tu equipo para minar criptomonedas. Vías: adjuntos, descargas, USB, webs y vulnerabilidades sin parchear. Síntomas: lentitud, ventanas extrañas, archivos cifrados, consumo alto de batería o de datos.',
      paginas: [
        '**Malware** es cualquier programa hecho para dañar. Hay muchas especies, y cada una se comporta a su manera. Fijaos en **lo que hacen** las criaturas: así sabréis qué son.',
        'El **virus** se esconde dentro de un archivo y se activa cuando alguien lo **abre**. El **gusano** no necesita a nadie: **se copia solo** por la red. El **troyano** se **disfraza** de algo útil o de un regalo.',
        'El **ransomware** **cifra tus archivos** y pide un **rescate**. El **spyware** te **espía**; si registra lo que tecleas, es un **keylogger**. Y una **botnet** es un ejército de equipos **zombis** controlados a distancia por un atacante.',
        'También existen el **adware** (publicidad invasiva), el **rootkit** y las **puertas traseras** (control oculto) y el **criptominado** (usan tu equipo para minar criptomonedas).',
        'Entran por **adjuntos**, **descargas**, **memorias USB**, webs trampa y **fallos sin parchear**. Síntomas: el equipo va lento, aparecen ventanas raras, la batería o los datos se gastan sin motivo… o tus archivos ya no se abren.',
      ],
      despues: ['Apuntad a una criatura con la varita (**F**). Os preguntará **qué es** y **cómo se combate**.'],
    },
    cortafuegos: {
      titulo: 'Cortafuegos y buenas prácticas',
      resumen: 'Un cortafuegos (firewall) decide qué tráfico de red entra y sale según reglas: origen, puerto y servicio. Puertos conocidos: 443 HTTPS, 80 HTTP, 53 DNS, 3389 escritorio remoto, 22 SSH, 23 Telnet (sin cifrar). Regla de oro: denegar lo que no se necesita. Otras medidas: instalar las actualizaciones (parches), usar una cuenta sin privilegios de administrador para el día a día, revisar los permisos de las apps, antivirus activo, bloqueo de pantalla. Seguridad activa: evita el ataque (antivirus, cortafuegos, contraseñas). Pasiva: reduce el daño (copias de seguridad). Física (el equipo) y lógica (el software).',
      paginas: [
        'Un **cortafuegos** es la muralla de un equipo o de una red: mira cada conexión y decide si **entra o no** según unas **reglas**.',
        'Cada servicio usa un **puerto**: la web segura (**HTTPS**) el **443**, el **DNS** el **53**, el **escritorio remoto** el **3389**, **Telnet** (sin cifrar, antiguo) el **23**. La regla de oro: **denegar todo lo que no se necesita**.',
        'La muralla no basta sola. Hay que **instalar las actualizaciones** (tapan agujeros), usar una **cuenta sin privilegios** para el día a día y **revisar los permisos** de cada app.',
        'Hay seguridad **activa** (evita el ataque: antivirus, cortafuegos, contraseñas) y **pasiva** (reduce el daño cuando ya ha ocurrido: copias de seguridad). Y **física** (proteger el aparato) y **lógica** (proteger el software y los datos).',
      ],
      despues: ['Configurad la muralla: el instituto necesita su **web segura** y su **DNS**, y nada más desde internet.'],
    },
    triada: {
      titulo: 'La tríada de la seguridad (CIA)',
      resumen: 'La seguridad de la información protege tres cosas: confidencialidad (que solo lo lean quienes deben: cifrado, contraseñas, permisos), integridad (que nadie lo altere sin que se note: hash, firma digital, control de versiones) y disponibilidad (que esté accesible cuando se necesita: copias de seguridad, redundancia, protección contra ataques de denegación de servicio).',
      paginas: [
        'Este cofre guarda el tesoro de la biblioteca. Para protegerlo de verdad hay que cuidar **tres cosas**, la **tríada** de la seguridad.',
        '**Confidencialidad**: que solo lo lean quienes deben. Se consigue con **cifrado**, contraseñas y permisos.',
        '**Integridad**: que nadie lo cambie sin que se note. Se consigue con un **hash** (una huella del archivo) o una **firma digital**.',
        '**Disponibilidad**: que esté ahí cuando se necesita. Se consigue con **copias de seguridad** y **redundancia**. Tres guardianes de Morvath atacan cada una: el **espía**, el **alterador** y el **saboteador**.',
      ],
    },
    wifi: {
      titulo: 'Wi-Fi pública, VPN y HTTPS',
      resumen: 'En una Wi-Fi pública (cafetería, aeropuerto) cualquiera en la misma red podría intentar espiar el tráfico o crear una red falsa con un nombre parecido. Precauciones: comprobar el nombre oficial de la red, usar webs con HTTPS, evitar el banco o compras, usar una VPN (crea un túnel cifrado) o los datos móviles, y desactivar la conexión automática. En casa: cifrado WPA2 o WPA3 y contraseña robusta; nunca una red abierta ni WEP.',
      paginas: [
        'Este pozo es como una **Wi-Fi pública**: gratis y cómoda, pero cualquiera en la misma red podría intentar **espiar** lo que envías, o crear una red **falsa** con un nombre parecido.',
        'Precauciones: comprobad el **nombre oficial** de la red, usad solo webs con **HTTPS**, evitad el banco y las compras, y si podéis, usad una **VPN** (un túnel cifrado) o vuestros datos móviles.',
        'Y en casa: cifrado **WPA2 o WPA3** con una contraseña robusta. Nunca una red abierta ni el viejo WEP.',
      ],
    },
    actualizaciones: {
      titulo: 'Actualizaciones y parches',
      resumen: 'Un parche corrige errores y, sobre todo, agujeros de seguridad: muchos ataques usan fallos que ya tenían arreglo, pero el equipo no se había actualizado. Activad las actualizaciones automáticas del sistema y de las aplicaciones, y actualizad también el router y el móvil. Antes de una actualización grande, haced copia de seguridad. Descargad solo desde los ajustes del sistema, la tienda oficial o la web del fabricante: un aviso de «actualiza aquí» en una web suele ser un engaño. Un sistema sin soporte (fin de vida) ya no recibe parches: hay que cambiarlo o aislarlo de internet.',
      paginas: [
        'Este taller arregla armaduras: cada **parche** tapa un agujero. En vuestro mundo pasa igual: las **actualizaciones** corrigen errores y, sobre todo, **agujeros de seguridad**.',
        'Muchos ataques famosos usaron fallos que **ya tenían arreglo**… en equipos que nadie había actualizado. El ransomware WannaCry (2017) entró así en miles de hospitales y empresas.',
        'Activad las **actualizaciones automáticas** del sistema y de las aplicaciones. Y no os olvidéis del **router** ni del **móvil**: también tienen agujeros.',
        'Antes de una actualización grande, **copia de seguridad**. Y descargad solo desde los **ajustes del sistema**, la **tienda oficial** o la **web del fabricante**: un aviso de «tu reproductor está desactualizado, descarga aquí» en una web suele ser un **engaño**.',
        'Por último: cuando un sistema llega al **fin de soporte**, ya no recibe parches. Hay que cambiarlo o, al menos, **aislarlo** de internet.',
      ],
    },
  },

  // ---------- Sello 1 · El bestiario ----------
  tipos: ['Virus', 'Gusano', 'Troyano', 'Ransomware', 'Spyware (keylogger)', 'Botnet'],
  contramedidas: {
    Virus: 'Analizar con el antivirus y no abrir archivos de origen dudoso',
    Gusano: 'Aislar el equipo de la red e instalar los parches de seguridad',
    Troyano: 'No instalar nada de fuentes no oficiales y eliminarlo con el antivirus',
    Ransomware: 'Restaurar desde una copia de seguridad desconectada y no pagar',
    'Spyware (keylogger)': 'Eliminarlo con antimalware y cambiar las contraseñas desde otro equipo',
    Botnet: 'Desinfectar los equipos zombis y cortar su comunicación con quien los controla',
  },
  criaturas: [
    { id: 'virus', tipo: 'Virus', pista: 'Estaba dormida dentro de un cofre… hasta que alguien lo abrió.' },
    { id: 'gusano', tipo: 'Gusano', pista: 'Nadie la ayuda, pero cada pocos segundos aparece otra copia suya.' },
    { id: 'troyano', tipo: 'Troyano', pista: 'Parecía un cofre de oro, un regalo… hasta que os acercasteis.' },
    { id: 'ransomware', tipo: 'Ransomware', pista: 'Ha encadenado un cofre y exige 100 monedas para liberarlo.' },
    { id: 'spyware', tipo: 'Spyware (keylogger)', pista: 'Os sigue a distancia y apunta todo lo que tecleáis.' },
    { id: 'botnet', tipo: 'Botnet', pista: 'Un nigromante mueve a dos esqueletos como si fueran marionetas.' },
  ],

  // ---------- Sello 2 · La muralla cortafuegos ----------
  trafico: [
    { id: 'https', origen: 'Internet', puerto: 443, servicio: 'HTTPS', desc: 'Visitas a la web segura del instituto', permitir: true },
    { id: 'dns', origen: 'Internet', puerto: 53, servicio: 'DNS', desc: 'Respuestas del servidor de nombres', permitir: true },
    { id: 'rdp', origen: 'Internet', puerto: 3389, servicio: 'Escritorio remoto', desc: 'Alguien intenta controlar el ordenador de dirección desde fuera', permitir: false },
    { id: 'telnet', origen: 'Internet', puerto: 23, servicio: 'Telnet', desc: 'Acceso por consola sin cifrar', permitir: false },
    { id: 'raro', origen: 'IP desconocida', puerto: 4444, servicio: '¿?', desc: 'Conexión a un puerto que no usa ningún programa del instituto', permitir: false },
  ],
  practicas: [
    { texto: 'Instalar las actualizaciones del sistema en cuanto salen', buena: true },
    { texto: 'Usar una cuenta sin privilegios de administrador para el día a día', buena: true },
    { texto: 'Revisar qué permisos tiene cada app (cámara, micrófono, ubicación)', buena: true },
    { texto: 'Desactivar el antivirus porque hace ir lento el ordenador', buena: false },
    { texto: 'Usar siempre la cuenta de administrador para no tener que pedir permisos', buena: false },
    { texto: 'Dar a todas las apps acceso a todo para que funcionen mejor', buena: false },
  ],

  // ---------- Sello 3 · La tríada ----------
  triada: [
    {
      id: 't-conf', concepto: 'triada', criterio: '3.1', tipo: 'opcion',
      texto: 'El espía de Morvath quiere leer el contenido del cofre. ¿Qué lo protege?',
      opciones: ['Cifrar el contenido', 'Hacer una copia de seguridad', 'Calcular su hash', 'Ponerlo en un servidor más rápido'], correcta: 0,
      explicacion: 'Confidencialidad: cifrado. Aunque lo robe, no podrá leerlo sin la clave.',
    },
    {
      id: 't-integ', concepto: 'triada', criterio: '3.1', tipo: 'opcion',
      texto: 'El alterador quiere cambiar el contenido sin que nadie lo note. ¿Qué lo delata?',
      opciones: ['Un antivirus', 'Un hash o una firma digital del contenido original', 'Una VPN', 'Cambiar la contraseña'], correcta: 1,
      explicacion: 'Integridad: si cambia un solo bit, el hash cambia por completo y la firma deja de ser válida.',
    },
    {
      id: 't-disp', concepto: 'triada', criterio: '3.1', tipo: 'opcion',
      texto: 'El saboteador quiere destruir el cofre para que nadie pueda usarlo. ¿Qué lo protege?',
      opciones: ['Cifrarlo', 'Firmarlo', 'Copias de seguridad y redundancia en otro lugar', 'Un nombre de archivo difícil'], correcta: 2,
      explicacion: 'Disponibilidad: si se destruye, hay otra copia lista para seguir funcionando.',
    },
  ],

  pistas: {
    criaturas: 'Apuntad a una criatura con la cámara y pulsad **F**. Mirad cómo se comporta: esa es la pista de qué es.',
    cortafuegos: 'La **muralla cortafuegos** está en el lado este. Solo entra lo necesario: web segura y DNS.',
    triada: 'El **cofre de la tríada** está al norte: confidencialidad, integridad y disponibilidad.',
    puerta: '¡Las criptas están limpias! Subid por la escalera del norte.',
  },

  sellosRotos: [
    '¡Criptas desinfectadas! Los tres sellos están rotos.',
    'Al desaparecer la última criatura, deja caer algo: un **recuerdo** de Morvath.',
  ],

  memoria: [
    'Morvath descubre que puede escribir hechizos que **se copian solos**. Los esconde en regalos, en cofres, en mensajes de amigos.',
    'Al principio solo quería **vigilar**: saber qué libros se leían y quién hablaba con quién. Pero un hechizo que se copia solo no obedece a nadie.',
    'Una noche, sus criaturas cerraron con cadenas la biblioteca del puerto y pidieron un rescate. Ni él pudo detenerlas.',
    'Por eso este piso está así. Ni siquiera Morvath controla ya lo que creó. Seguid subiendo.',
  ],

  // ---------- Jefe: la proyección de Morvath aparece al final del piso ----------
  // Duelo de conocimiento sin castigo: cada acierto rompe uno de sus escudos.
  jefe: {
    escudos: 5,
    // una pregunta de cada piso de la torre, en orden (se repiten si hace falta)
    preguntas: ['p2-11', 'p3-06', 'p4-03', 'p5-08', 'p6-02', 'p7-06', 'p8-02'],
    aparicion: [
      'Vaya, vaya. Los aprendices de Aldric.',
      'Habéis limpiado mis criptas, desordenado mi biblioteca, colgado carteles que todo el mundo puede leer…',
      'Soy **Morvath**. O al menos, su proyección: no pienso bajar en persona a recibiros.',
      '¿Creéis que sabéis mucho? Cinco escudos protegen esta proyección. Rompedlos… si podéis. Cada pregunta, un escudo.',
    ],
    aldricAviso: ['¡Es él! No os puede hacer daño: es solo una imagen. Responded con calma: todo lo que os pregunte lo habéis aprendido subiendo.'],
    acierto: ['¡Un escudo menos!', '¡Otro escudo roto!', 'Morvath retrocede…', '¡Solo le queda uno!', '¡El último escudo!'],
    burlas: [
      'Ja. Ni vuestro propio mundo lo entendéis.',
      'Qué decepción. Aldric enseñaba mejor en sus tiempos.',
      'Pensadlo otra vez. Tenemos todo el tiempo del mundo… yo lo guardo todo, ¿recordáis?',
    ],
    derrota: [
      '…Imposible. Sabéis más de lo que Aldric me dejó creer.',
      'Esta vez os dejo pasar. Pero la torre sigue subiendo, y arriba lo que se esconde no son criptas.',
      'Os espero en la cima. Traed a vuestro maestro de hologramas… si queréis verle otra vez.',
    ],
    aldricDespues: [
      'Se ha ido. Lo habéis hecho de maravilla: habéis usado todo lo que aprendisteis en la torre.',
      'Y habéis visto lo más importante: Morvath no es invencible. **El conocimiento compartido le gana al conocimiento guardado.** Subid.',
    ],
  },

  preguntas: [
    {
      id: 'p8-01', concepto: 'malware', criterio: '3.1', tipo: 'opcion',
      texto: '¿Qué diferencia a un gusano de un virus?',
      opciones: ['El gusano es más pequeño', 'El gusano se propaga solo por la red; el virus necesita que alguien abra el archivo infectado', 'El virus no hace daño', 'Ninguna'], correcta: 1,
      explicacion: 'El gusano no necesita ayuda: se copia de equipo en equipo aprovechando fallos de la red.',
    },
    {
      id: 'p8-02', concepto: 'malware', criterio: '3.1', tipo: 'opcion',
      texto: 'Todos tus archivos aparecen cifrados y un mensaje pide 300 € en criptomonedas. ¿Qué es y qué haces?',
      opciones: ['Un troyano; pagar', 'Ransomware; no pagar, desconectar el equipo y restaurar desde una copia de seguridad', 'Adware; cerrar la ventana', 'Un virus; formatear sin avisar a nadie'], correcta: 1,
      explicacion: 'Pagar no garantiza recuperar nada y financia a los delincuentes. La copia de seguridad es la salvación.',
    },
    {
      id: 'p8-03', concepto: 'malware', criterio: '3.1', tipo: 'opcion',
      texto: 'Descargas un juego «gratis» de una web rara y, sin que lo sepas, abre una puerta trasera en tu ordenador. ¿Qué era?',
      opciones: ['Un gusano', 'Un troyano', 'Un antivirus', 'Un cortafuegos'], correcta: 1,
      explicacion: 'Como el caballo de Troya: parece un regalo y esconde al enemigo dentro.',
    },
    {
      id: 'p8-04', concepto: 'malware', criterio: '3.1', tipo: 'opcion',
      texto: '¿Qué hace un keylogger?',
      opciones: ['Cifra tus archivos', 'Registra las teclas que pulsas para robar contraseñas', 'Muestra anuncios', 'Acelera el teclado'], correcta: 1,
      explicacion: 'Es un tipo de spyware: captura todo lo que escribes, incluidas las contraseñas.',
    },
    {
      id: 'p8-05', concepto: 'malware', criterio: '3.1', tipo: 'opcion',
      texto: 'Tu móvil se calienta, la batería dura la mitad y va lento sin motivo. ¿Qué podría ser?',
      opciones: ['Criptominado u otro malware consumiendo recursos', 'Que la pantalla está sucia', 'Que tienes pocos contactos', 'Nada, es normal siempre'], correcta: 0,
      explicacion: 'El consumo anormal de batería, datos o procesador es un síntoma típico de malware.',
    },
    {
      id: 'p8-06', concepto: 'cortafuegos', criterio: '3.1', tipo: 'opcion',
      texto: '¿Por qué es importante instalar las actualizaciones del sistema?',
      opciones: ['Para cambiar el fondo de pantalla', 'Porque corrigen fallos de seguridad que el malware podría aprovechar', 'Para que ocupe más espacio', 'No es importante'], correcta: 1,
      explicacion: 'Muchos gusanos y ataques usan fallos que ya tenían parche: actualizar cierra la puerta.',
    },
    {
      id: 'p8-07', concepto: 'cortafuegos', criterio: '3.1', tipo: 'opcion',
      texto: 'Una copia de seguridad es una medida de seguridad…',
      opciones: ['Activa: evita el ataque', 'Pasiva: reduce el daño cuando el ataque ya ha ocurrido', 'Física', 'Inútil'], correcta: 1,
      explicacion: 'No impide el ataque, pero permite recuperarse de él.',
    },
    {
      id: 'p8-08', concepto: 'cortafuegos', criterio: '3.1', tipo: 'numero',
      texto: '¿Qué puerto usa la web segura (HTTPS)?', valor: 443, tolerancia: 0, unidad: '',
      explicacion: 'HTTP usa el 80 y HTTPS, el 443.',
    },
    {
      id: 'p8-09', concepto: 'cortafuegos', criterio: '3.1', tipo: 'opcion',
      texto: '¿Por qué conviene usar una cuenta sin privilegios de administrador para el día a día?',
      opciones: ['Porque es más bonita', 'Porque si se cuela un malware, tendrá menos permisos para dañar el sistema', 'Porque va más rápida', 'Porque así no hace falta contraseña'], correcta: 1,
      explicacion: 'El malware hereda los permisos de quien lo ejecuta: con menos permisos, menos daño.',
    },
    {
      id: 'p8-10', concepto: 'triada', criterio: '3.1', tipo: 'opcion',
      texto: 'Un ataque tumba la web del instituto justo el día de las notas. ¿Qué parte de la tríada falla?',
      opciones: ['Confidencialidad', 'Integridad', 'Disponibilidad', 'Ninguna'], correcta: 2,
      explicacion: 'La información no está accesible cuando se necesita: es un ataque a la disponibilidad.',
    },
    {
      id: 'p8-11', concepto: 'wifi', criterio: '3.1', tipo: 'opcion',
      texto: 'En la Wi-Fi gratis del aeropuerto quieres consultar tu banco. ¿Qué es lo más seguro?',
      opciones: ['Hacerlo sin más', 'Usar tus datos móviles o una VPN', 'Conectarte a la red con mejor señal aunque no sea la oficial', 'Desactivar el HTTPS'], correcta: 1,
      explicacion: 'Una VPN cifra todo el tráfico; los datos móviles evitan compartir red con desconocidos.',
    },
    {
      id: 'p8-12', concepto: 'wifi', criterio: '3.1', tipo: 'opcion',
      texto: '¿Qué cifrado deberías usar en la Wi-Fi de casa?',
      opciones: ['Ninguno, red abierta', 'WEP', 'WPA2 o, mejor, WPA3', 'Da igual'], correcta: 2,
      explicacion: 'WEP se rompe en minutos. WPA3 es el estándar actual más seguro.',
    },
    {
      id: 'p8-13', concepto: 'actualizaciones', criterio: '3.1', tipo: 'opcion',
      texto: '¿Por qué es importante instalar las actualizaciones de seguridad?',
      opciones: ['Porque cambian los colores del escritorio', 'Porque tapan agujeros que los atacantes ya conocen', 'Porque liberan espacio en el disco', 'No es importante si tienes antivirus'], correcta: 1,
      explicacion: 'Un parche corrige fallos de seguridad publicados: sin él, el equipo sigue abierto a ataques conocidos.',
    },
  ],
  // ---------- Opcional · El taller del parche ----------
  parche: {
    aviso: 'En el **taller del parche** se reparan las armaduras de la cripta. Es un reto **opcional**: dejad los equipos al día sin caer en trampas.',
    pasos: [
      {
        id: 'p8-op1', concepto: 'actualizaciones', criterio: '3.1', tipo: 'orden',
        texto: 'Vais a poner al día el ordenador de la biblioteca. Ordenad los pasos.',
        opciones: ['Hacer una copia de seguridad', 'Actualizar el sistema operativo', 'Actualizar las aplicaciones', 'Reiniciar y comprobar que todo funciona'],
        explicacion: 'Primero la copia (por si algo sale mal), luego el sistema, después las aplicaciones y, al final, reiniciar y comprobar.',
      },
      {
        id: 'p8-op2', concepto: 'actualizaciones', criterio: '3.1', tipo: 'opcion',
        texto: 'Una web muestra: «Tu reproductor de vídeo está desactualizado. Descarga la nueva versión aquí». ¿Qué hacéis?',
        opciones: ['Descargarlo: es por seguridad', 'Cerrar el aviso y actualizar, si hace falta, desde los ajustes o la web oficial', 'Desactivar el antivirus para que se instale bien', 'Reenviar el enlace a los compañeros'], correcta: 1,
        explicacion: 'Los avisos de «actualiza aquí» en webs ajenas son un truco clásico para colar malware. Se actualiza desde el sistema o la fuente oficial.',
      },
      {
        id: 'p8-op3', concepto: 'actualizaciones', criterio: '3.1', tipo: 'opcion',
        texto: 'El ordenador del conserje usa un sistema que ya no tiene soporte del fabricante. ¿Qué es lo correcto?',
        opciones: ['Nada: si funciona, está bien', 'Instalarle muchos antivirus', 'Cambiarlo por uno con soporte o, mientras tanto, aislarlo de internet', 'Desactivar las actualizaciones'], correcta: 2,
        explicacion: 'Sin soporte no llegan parches: cada fallo que se descubra queda abierto para siempre.',
      },
      {
        id: 'p8-op4', concepto: 'actualizaciones', criterio: '3.1', tipo: 'opcion',
        texto: '¿Cuál de estos aparatos también necesita actualizarse?',
        opciones: ['Solo el ordenador', 'El router de casa', 'Ninguno si está apagado por la noche', 'Solo los móviles nuevos'], correcta: 1,
        explicacion: 'El router es la puerta de la red de casa: su firmware también tiene fallos que se corrigen con actualizaciones.',
      },
    ],
    hecho: '¡Las armaduras de la cripta están al día! Reto **opcional** completado (+20 de saber).',
  },
};
