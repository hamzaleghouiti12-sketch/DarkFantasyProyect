// Piso VII · La Gran Biblioteca
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saberes II.2.1 «Licencias», II.2.2 «Bulos y desinformación» y II.2.3 «Curación de contenidos».
// Criterios de evaluación 2.3 y 3.3.

export default {
  id: 'piso7',
  nombre: 'Piso VII · La Gran Biblioteca',
  criterios: ['2.3', '3.3'],

  intro: [
    'Estanterías hasta el techo… **la Gran Biblioteca de Umbravel**. O lo que Morvath ha hecho con ella.',
    'La ha llenado de **copias robadas** y de **pregones falsos**. Nadie sabe ya qué se puede usar, qué es verdad ni cómo encontrar nada.',
    'Tres sellos: devolver cada obra a su estantería según su **licencia**, verificar los **pregones** del tablón y dominar el **buscador del bibliotecario**.',
  ],

  lecciones: {
    licencias: {
      titulo: 'Licencias y derechos de autor',
      resumen: 'Quien crea una obra tiene derechos morales (que se le reconozca la autoría; no se pueden vender) y patrimoniales (explotarla económicamente). Copyright: todos los derechos reservados. Dominio público: la obra ya se puede usar libremente (en España, 70 años después de la muerte del autor, en general) o el autor la cedió (CC0). Plagio: presentar como propio lo de otro; citar evita el plagio. Creative Commons: BY (citar al autor), SA (compartir igual, con la misma licencia), NC (no comercial) y ND (sin obras derivadas), combinables. Software libre: se puede usar, estudiar, modificar y compartir (GNU/Linux, LibreOffice); código abierto: el código es público; propietario: no; freeware: gratis pero cerrado; shareware: prueba gratis y luego de pago.',
      paginas: [
        'Quien crea algo tiene **derechos de autor**. Los **morales** son para siempre: que se reconozca que la obra es suya. Los **patrimoniales** le permiten ganar dinero con ella.',
        '**Copyright** significa «todos los derechos reservados»: para usar la obra hace falta permiso. Cuando pasan los años (en España, en general, **70 años tras la muerte del autor**), la obra pasa al **dominio público** y cualquiera puede usarla. Un autor también puede regalarla al dominio público desde el principio: eso es **CC0**. Los modelos 3D de este juego son CC0.',
        'Entre medias están las licencias **Creative Commons**: **BY** obliga a **citar** al autor; **SA** a **compartir igual**, con la misma licencia; **NC** prohíbe el uso **comercial**; y **ND** prohíbe **modificar** la obra. Se combinan: CC BY-NC-SA, por ejemplo.',
        'Presentar como propio lo que es de otro es **plagio**. Citar la fuente siempre lo evita.',
        'Con el software pasa igual: el **software libre** se puede usar, estudiar, modificar y compartir (GNU/Linux, LibreOffice); el **propietario**, no. **Freeware** es gratis pero cerrado; **shareware**, una prueba gratis que luego se paga.',
      ],
      despues: [
        'Sobre la mesa hay diez obras. Al cogerlas veréis qué permite su autor. Llevad cada una a su **estantería**.',
      ],
    },
    bulos: {
      titulo: 'Bulos, desinformación y cómo verificar',
      resumen: 'Desinformación: información falsa difundida a propósito para engañar. Información errónea: falsa, pero compartida sin mala intención. Bulo: mentira que se hace viral. Clickbait: titular exagerado para conseguir clics. Deepfake: vídeo, audio o imagen falsos generados con IA. Sátira: humor que no pretende engañar. Para verificar: buscar la fuente original y su autoría, mirar la fecha, hacer una búsqueda inversa de la imagen, contrastar con varios medios y con verificadores (fact-checking). Si es falso: no difundirlo y reportarlo. La burbuja de filtros: los algoritmos nos muestran lo que ya nos gusta y acabamos viendo solo una parte.',
      paginas: [
        'Este tablón está lleno de **pregones**. Algunos son verdad y otros no. La **desinformación** es información falsa difundida **a propósito**; la **información errónea** también es falsa, pero quien la comparte cree que es cierta.',
        'Los tipos que más veréis: el **bulo**, una mentira que se hace viral; el **clickbait**, un titular exagerado para que pulses; el **deepfake**, un vídeo, audio o imagen falsos creados con IA; y la **sátira**, que es humor y no pretende engañar.',
        'Para verificar usad las herramientas del tablón: la **lupa** (búsqueda inversa de la imagen: ¿de dónde salió de verdad?), la **fecha**, la **autoría** y el **verificador**, que contrasta con otras fuentes.',
        'Y un aviso sobre vosotros mismos: los algoritmos os enseñan lo que ya os gusta. Poco a poco veis solo una parte del mundo: es la **burbuja de filtros**. Buscad a propósito otras fuentes.',
      ],
      despues: ['Para cada pregón: usad al menos una herramienta, decid **qué es** y **qué haríais** con él.'],
    },
    curacion: {
      titulo: 'Búsqueda avanzada y curación de contenidos',
      resumen: 'Búsqueda avanzada: "frase exacta" entre comillas; -palabra para excluir; site:dominio para buscar en una sola web; filetype:pdf para un tipo de archivo. Criterios de calidad de una fuente: autoría, fecha, rigor, objetividad, propósito. Curación de contenidos: buscar, seleccionar (evaluar la calidad), organizar (etiquetas, marcadores, RSS), añadir valor (resumir, comentar, citar) y difundir.',
      paginas: [
        'Buscar bien es un superpoder. **"Frase exacta"** entre comillas busca esas palabras juntas y en ese orden. **-palabra** excluye los resultados que la contengan.',
        '**site:biblioteca.umbravel** busca solo en esa web y **filetype:pdf** solo archivos de ese tipo. Se pueden combinar.',
        'Y no todo lo que aparece vale lo mismo. Mirad la **autoría**, la **fecha**, el **rigor** y el **propósito** de cada fuente.',
        'Quien selecciona y organiza lo mejor para los demás hace **curación de contenidos**: buscar, seleccionar, organizar (etiquetas, marcadores, suscripciones RSS), añadir valor y difundir citando las fuentes.',
      ],
      despues: ['El buscador os pedirá tres libros. Tenéis que conseguir que salga **el primero** de la lista.'],
    },
    burbuja: {
      titulo: 'La burbuja de filtros',
      resumen: 'Las redes y los buscadores ordenan lo que ves con algoritmos de recomendación: aprenden de lo que pulsas, miras y compartes, y te enseñan más de lo mismo para que sigas dentro. Así se forma una burbuja de filtros (solo ves una parte del mundo) y una cámara de eco (solo oyes opiniones que ya compartes). Para salir: seguir fuentes variadas y de opiniones distintas, buscar activamente otros puntos de vista, usar el orden cronológico o el modo sin personalizar cuando exista, revisar el historial y los intereses que la plataforma tiene de ti, y contrastar antes de creer o compartir.',
      paginas: [
        'El espejo no os ha mentido: os ha enseñado **lo que creía que queríais ver**. Así funcionan los **algoritmos de recomendación** de las redes, los vídeos y los buscadores.',
        'Aprenden de todo lo que hacéis: qué pulsáis, cuánto tiempo miráis algo, qué compartís. Y os enseñan **más de lo mismo**, porque así seguís dentro más rato.',
        'El resultado es una **burbuja de filtros**: solo veis una parte del mundo. Y si además solo seguís a gente que opina como vosotros, es una **cámara de eco**: todo os da la razón.',
        'Para salir: seguid **fuentes variadas** (también de opiniones distintas), buscad otros puntos de vista **a propósito**, usad el **orden cronológico** o el modo sin personalizar cuando exista y revisad los **intereses** que la plataforma ha guardado de vosotros.',
        'Y lo de siempre en esta biblioteca: **contrastad** antes de creer o compartir.',
      ],
    },
  },

  // ---------- Sello 1 · La sala de las licencias ----------
  // ---------- Opcional · El espejo de las recomendaciones (burbuja de filtros) ----------
  espejo: {
    aviso: 'Un **espejo** junto a la entrada muestra noticias. Dice que aprende de vosotros. Es un reto **opcional**: elegid cinco veces lo que os apetezca leer y mirad qué pasa.',
    temas: {
      deporte: ['El equipo de Umbravel gana la liga de escobas', 'Récord en la carrera de las siete islas', 'Fichaje sorpresa del mejor arquero del reino', 'Entrevista a la campeona de esgrima', 'Polémica arbitral en la final de justas', 'Nuevo estadio flotante en Gran Canaria'],
      ciencia: ['Descubren una estrella que cambia de color', 'Un telescopio fotografía el cráter más profundo', 'Así funciona la memoria de los cristales', 'Hallan un fósil de dragón en Fuerteventura', 'Nuevo mapa de las corrientes del Atlántico', 'Las abejas reconocen caras, según un estudio'],
      musica: ['El trovador más escuchado del año', 'Vuelve el festival de la luna llena', 'Las 10 canciones que suenan en la torre', 'Un violinista toca bajo el mar', 'Concierto gratuito en la plaza mayor', 'El nuevo disco de los Gnomos Eléctricos'],
      juegos: ['Truco secreto para el nivel final', 'Sale la secuela del juego más esperado', 'Los 5 jefes más difíciles de la historia', 'Torneo de ajedrez mágico este fin de semana', 'Análisis: ¿vale la pena el nuevo mando?', 'Una speedrun bate el récord mundial'],
      moda: ['Las capas que se llevan este invierno', 'Vuelven los sombreros puntiagudos', 'Cómo combinar una túnica con botas', 'El desfile de los sastres del norte', 'Diez accesorios para magos con estilo', 'Ropa hecha con tejidos reciclados'],
      politica: ['El consejo de las islas aprueba el presupuesto', 'Debate sobre la nueva ley de bibliotecas', 'Los alcaldes piden más transporte público', 'Elecciones en el gremio de escribas', 'Nueva norma sobre el uso de datos personales', 'Acuerdo para proteger los bosques de laurisilva'],
    },
    rondas: 5,
    nombres: { deporte: 'deporte', ciencia: 'ciencia', musica: 'música', juegos: 'videojuegos', moda: 'moda', politica: 'política' },
    pregunta: {
      id: 'p7-op1', concepto: 'burbuja', criterio: '3.3', tipo: 'opcion',
      texto: 'Una amiga solo ve en su red social vídeos que le dan la razón y cree que «todo el mundo piensa como ella». ¿Qué le recomendaríais?',
      opciones: ['Que deje de usar internet', 'Que siga a fuentes variadas, busque otros puntos de vista y revise sus intereses guardados', 'Que comparta más vídeos para que el algoritmo aprenda', 'Nada: el algoritmo es neutral'],
      correcta: 1,
      explicacion: 'El algoritmo le enseña más de lo mismo. Variar las fuentes a propósito y revisar lo que la plataforma sabe de ella ayuda a salir de la burbuja.',
    },
    hecho: '¡El espejo se aclara! Reto **opcional** completado (+20 de saber).',
  },

  estanterias: [
    { id: 'copyright', texto: '© Copyright' },
    { id: 'dominio', texto: 'Dominio público · CC0' },
    { id: 'by', texto: 'CC BY' },
    { id: 'bysa', texto: 'CC BY-SA' },
    { id: 'bync', texto: 'CC BY-NC' },
    { id: 'bynd', texto: 'CC BY-ND' },
    { id: 'libre', texto: 'Software libre' },
    { id: 'propietario', texto: 'Software propietario' },
  ],
  obras: [
    { id: 'quijote', texto: 'El Quijote (1605)', caso: 'Cervantes murió en 1616. ¿Hace falta pedir permiso para publicarlo?', destino: 'dominio', porque: 'Han pasado más de 70 años desde la muerte de su autor: es de dominio público.' },
    { id: 'novela', texto: 'Novela de 2024', caso: 'Una autora viva la publicó con «Todos los derechos reservados».', destino: 'copyright', porque: 'Todos los derechos reservados: para usarla hace falta su permiso.' },
    { id: 'foto', texto: 'Foto de un volcán', caso: 'Puedes copiarla, modificarla y hasta venderla, siempre que cites a la fotógrafa.', destino: 'by', porque: 'Solo exige reconocimiento: CC BY.' },
    { id: 'mapa', texto: 'Mapa de Canarias', caso: 'Puedes modificarlo citando al autor, pero lo que crees debe llevar su misma licencia.', destino: 'bysa', porque: 'Citar y compartir igual: CC BY-SA.' },
    { id: 'wiki', texto: 'Artículo de Wikipedia', caso: 'Se puede copiar y adaptar citando, y lo que publiques tiene que llevar la misma licencia.', destino: 'bysa', porque: 'Los textos de Wikipedia llevan CC BY-SA.' },
    { id: 'cancion', texto: 'Canción de un grupo local', caso: 'Puedes usarla en tus vídeos citándolos, pero no si ganas dinero con ellos.', destino: 'bync', porque: 'Reconocimiento y uso no comercial: CC BY-NC.' },
    { id: 'lamina', texto: 'Lámina ilustrada', caso: 'Puedes compartirla tal cual, citando a la ilustradora, pero no recortarla ni modificarla.', destino: 'bynd', porque: 'Sin obras derivadas: CC BY-ND.' },
    { id: 'kaykit', texto: 'Modelos 3D de este juego', caso: 'Su autor los regaló sin condiciones: úsalos como quieras, ni siquiera hace falta citarlo.', destino: 'dominio', porque: 'CC0: su autor renunció a todos sus derechos. ¡Por eso este juego puede usarlos!' },
    { id: 'libreoffice', texto: 'LibreOffice', caso: 'Puedes usarlo, estudiar su código, modificarlo y compartir tus cambios.', destino: 'libre', porque: 'Las cuatro libertades del software libre.' },
    { id: 'programa', texto: 'Editor de fotos de pago', caso: 'Pagas una licencia de uso; su código es secreto y no puedes copiarlo.', destino: 'propietario', porque: 'Código cerrado y uso restringido: software propietario.' },
  ],

  // ---------- Sello 2 · El tablón de pregones ----------
  etiquetas: ['Verdadera', 'Bulo', 'Sátira', 'Clickbait', 'Deepfake'],
  acciones: ['Compartirla', 'No difundirla', 'Reportarla', 'Contrastarla antes de compartir'],
  pregones: [
    {
      titular: '¡Un tiburón nada por la calle Triana tras la tormenta!',
      texto: 'La foto corre por todos los grupos de mensajería esta mañana. «Lo he visto con mis propios ojos», dice el mensaje.',
      herramientas: {
        lupa: 'La búsqueda inversa encuentra la misma foto en 2011… y en cada tormenta desde entonces, en ciudades distintas. Es un montaje.',
        fecha: 'El mensaje no tiene fecha ni lugar concreto.',
        autor: 'No hay autor: «me lo ha pasado un amigo».',
        verificador: 'Los verificadores la desmintieron hace años.',
      },
      etiqueta: 'Bulo', accion: 'Reportarla',
      explicacion: 'Una foto vieja que reaparece con cada tormenta: un bulo clásico. No se difunde y se reporta.',
    },
    {
      titular: 'El Cabildo abre las becas de transporte para estudiantes',
      texto: 'El plazo termina el día 30. Se solicitan en la sede electrónica del Cabildo.',
      herramientas: {
        lupa: 'La imagen es el logotipo oficial, sin manipular.',
        fecha: 'Publicada hoy.',
        autor: 'La publica la web oficial del Cabildo.',
        verificador: 'Coincide con lo publicado en el boletín oficial.',
      },
      etiqueta: 'Verdadera', accion: 'Compartirla',
      explicacion: 'Fuente oficial, fecha actual y confirmada en el boletín: se puede compartir, mejor con el enlace oficial.',
    },
    {
      titular: 'Científicos confirman que el gofio da superpoderes',
      texto: 'Según «El Diario Burlón», un estudio demuestra que tres cucharadas de gofio permiten volar durante diez minutos.',
      herramientas: {
        lupa: 'La foto es de un anuncio de cereales.',
        fecha: 'Publicada el 28 de diciembre, Día de los Inocentes.',
        autor: '«El Diario Burlón» es una web de humor: lo dice en su página «Quiénes somos».',
        verificador: 'No existe ningún estudio así.',
      },
      etiqueta: 'Sátira', accion: 'No difundirla',
      explicacion: 'Es humor. El problema llega cuando alguien la comparte como si fuera real: no la difundas como noticia.',
    },
    {
      titular: 'No vas a creer lo que pasó en este examen… ¡el 7 te dejará sin palabras!',
      texto: 'Diez anécdotas de exámenes. Para leerlas hay que pasar por doce páginas llenas de anuncios.',
      herramientas: {
        lupa: 'Las imágenes son de bancos de fotos.',
        fecha: 'Publicada hace dos años y actualizada para que parezca nueva.',
        autor: 'Una web que vive de los clics en sus anuncios.',
        verificador: 'Las anécdotas no tienen fuente: puede que algunas sean ciertas y otras no.',
      },
      etiqueta: 'Clickbait', accion: 'Contrastarla antes de compartir',
      explicacion: 'Un titular exagerado para conseguir clics. Antes de compartir algo así, hay que contrastar lo que dice.',
    },
    {
      titular: 'VÍDEO: Aldric confiesa que trabaja para Morvath',
      texto: 'En el vídeo, Aldric mira a cámara y dice: «Morvath tiene razón. Dejad de subir la torre».',
      herramientas: {
        lupa: 'La cara aparece en un vídeo antiguo de Aldric, en el que hablaba de otra cosa.',
        fecha: 'Apareció anoche, sin fuente original.',
        autor: 'Una cuenta creada ayer.',
        verificador: 'El parpadeo es extraño y los labios no coinciden con la voz: generado con IA.',
      },
      etiqueta: 'Deepfake', accion: 'Reportarla',
      explicacion: 'Un vídeo manipulado con IA para suplantar a alguien. Se reporta y no se difunde.',
    },
  ],

  // ---------- Sello 3 · El buscador del bibliotecario ----------
  retos: [
    { texto: 'Encontrad el **PDF** de «El mapa de las siete islas» en la web de la biblioteca (**biblioteca.umbravel**).', objetivo: 'mapa-pdf', pista: 'Combinad site:biblioteca.umbravel con filetype:pdf.' },
    { texto: 'Buscad un artículo sobre **volcanes** que **no** hable de **Tenerife**.', objetivo: 'volcanes-lapalma', pista: 'El signo menos excluye: volcanes -tenerife.' },
    { texto: 'Encontrad el libro que contiene exactamente la frase **«la torre negra»**.', objetivo: 'cronica-torre', pista: 'Las comillas buscan la frase exacta: "la torre negra".' },
  ],
  indice: [
    { id: 'mapa-pdf', titulo: 'El mapa de las siete islas', url: 'biblioteca.umbravel/fondos/mapa-siete-islas.pdf', texto: 'Edición digital del mapa de las siete islas con caminos, faros y puertos.' },
    { id: 'mapa-html', titulo: 'El mapa de las siete islas (reseña)', url: 'biblioteca.umbravel/resenas/mapa-siete-islas', texto: 'Reseña del mapa de las siete islas: un libro imprescindible sobre las islas.' },
    { id: 'mapa-tienda', titulo: 'Compra El mapa de las siete islas', url: 'tienda-de-libros.umb/mapa-siete-islas', texto: 'El mapa de las siete islas en tapa dura. Envío gratis a todas las islas.' },
    { id: 'mapa-foro', titulo: '¿Alguien tiene el mapa de las siete islas en pdf?', url: 'foro.umbravel/hilo/mapa', texto: 'Busco el mapa de las siete islas en pdf, gracias. Mapa islas pdf.' },
    { id: 'mapa-copia', titulo: 'mapa siete islas pdf gratis', url: 'descargas-dudosas.umb/mapa-islas.pdf', texto: 'Descarga el mapa de las siete islas pdf gratis sin registro, copia no autorizada.' },
    { id: 'islas-guia', titulo: 'Guía de las siete islas', url: 'biblioteca.umbravel/fondos/guia-islas', texto: 'Guía de viaje por las siete islas: mapa, playas y senderos.' },
    { id: 'volcanes-teide', titulo: 'Los volcanes de Tenerife', url: 'geologia.umb/volcanes-tenerife', texto: 'Los volcanes de Tenerife y el Teide, el pico más alto de España.' },
    { id: 'volcanes-guia', titulo: 'Guía de volcanes de Canarias', url: 'biblioteca.umbravel/fondos/volcanes', texto: 'Volcanes de Canarias: desde Tenerife hasta Lanzarote, erupciones y paisajes.' },
    { id: 'volcanes-lapalma', titulo: 'Los volcanes de La Palma: la erupción de 2021', url: 'geologia.umb/la-palma-2021', texto: 'Crónica de la erupción del volcán de Cumbre Vieja en La Palma y sus efectos.' },
    { id: 'volcanes-ninos', titulo: 'Volcanes para curiosos', url: 'ciencia-facil.umb/volcanes', texto: 'Qué es un volcán y por qué entra en erupción, con ejemplos como Tenerife.' },
    { id: 'volcanes-tenerife2', titulo: 'Rutas por los volcanes de Tenerife', url: 'senderos.umb/tenerife-volcanes', texto: 'Cinco rutas por los volcanes y las cañadas de Tenerife.' },
    { id: 'cronica-torre', titulo: 'Crónica de Umbravel', url: 'biblioteca.umbravel/fondos/cronica', texto: 'Y al norte, sobre la colina, se alzó la torre negra que ningún mago se atrevía a nombrar.' },
    { id: 'torre-guia', titulo: 'Torres y castillos de Umbravel', url: 'biblioteca.umbravel/fondos/torres', texto: 'Cada torre del reino tiene su historia: la torre blanca del puerto, la torre de piedra negra del norte y la de los vientos.' },
    { id: 'torre-negra-novela', titulo: 'La negra noche de la torre', url: 'tienda-de-libros.umb/negra-noche', texto: 'Novela de misterio: una noche negra, una torre y un secreto.' },
    { id: 'torre-foro', titulo: 'Leyendas: ¿quién vive en la torre?', url: 'foro.umbravel/hilo/torre', texto: 'Dicen que en la torre vive un mago; la puerta es negra y nunca se abre.' },
    { id: 'licencias', titulo: 'Guía de licencias Creative Commons', url: 'biblioteca.umbravel/guias/licencias', texto: 'Qué significan BY, SA, NC y ND y cómo citar una obra.' },
    { id: 'bulos', titulo: 'Cómo detectar un bulo', url: 'verificadores.umb/guia', texto: 'Fuente, fecha, autor y búsqueda inversa de imágenes: cómo verificar un pregón.' },
    { id: 'redes', titulo: 'Redes y puentes flotantes', url: 'biblioteca.umbravel/fondos/redes.pdf', texto: 'Cómo se unieron las islas con enlaces de luz y cables submarinos.' },
    { id: 'recetas', titulo: 'Recetas con gofio', url: 'cocina.umb/gofio', texto: 'Escaldón, gofio amasado y otras recetas tradicionales de las islas.' },
    { id: 'magia', titulo: 'Manual de varitas caprichosas', url: 'biblioteca.umbravel/fondos/varitas.pdf', texto: 'Una varita solo responde a quien demuestra lo que ha aprendido.' },
  ],
  curacion: {
    id: 'b-curacion', concepto: 'curacion', criterio: '2.3', tipo: 'orden',
    texto: 'Para terminar, ordenad las fases de la curación de contenidos.',
    opciones: ['Buscar', 'Seleccionar (evaluar la calidad)', 'Organizar (etiquetas, marcadores, RSS)', 'Añadir valor (resumir, comentar)', 'Difundir citando las fuentes'],
    explicacion: 'Primero se busca, luego se filtra lo que vale, se organiza, se le añade valor propio y se comparte citando.',
  },

  pistas: {
    licencias: 'Coged una obra de la **mesa central** con **E**: veréis qué permite su autor. Llevadla a la estantería de su licencia.',
    pregones: 'El **tablón de pregones** está al norte. Usad las herramientas antes de decidir.',
    buscador: 'El **buscador del bibliotecario** está junto al tablón. Recordad: "comillas", -palabra, site: y filetype:.',
    puerta: '¡La puerta del norte está abierta! Subid por la escalera.',
  },

  sellosRotos: [
    '¡Los tres sellos de la biblioteca están rotos! Cada obra en su sitio, cada bulo desenmascarado.',
    'Entre las páginas de la Crónica de Umbravel hay algo escrito a mano… otro **recuerdo**.',
  ],

  memoria: [
    'Morvath escribe en la Crónica de Umbravel. Pero no cuenta lo que pasa: **cuenta lo que le conviene**.',
    'Sus pregones repiten tres veces la misma mentira, en tres plazas distintas. «Lo que se oye muchas veces», anota, «acaba pareciendo verdad».',
    'Y firma cada pregón con otro nombre: el de un guardia, el de una panadera, el mío. Nadie comprueba de dónde viene nada.',
    'Ahora sabéis comprobarlo. Esa es la peor noticia posible para Morvath. Seguid subiendo.',
  ],

  preguntas: [
    {
      id: 'p7-01', concepto: 'licencias', criterio: '2.3', tipo: 'opcion',
      texto: 'Una foto tiene licencia CC BY-NC. ¿Puedes usarla en el cartel de una rifa benéfica del instituto que no cobra nada?',
      opciones: ['Sí, citando a su autor', 'No, nunca', 'Sí, sin citar', 'Solo si la modificas'], correcta: 0,
      explicacion: 'BY: hay que citar. NC: no se puede ganar dinero con ella. Un uso sin ánimo de lucro está permitido.',
    },
    {
      id: 'p7-02', concepto: 'licencias', criterio: '2.3', tipo: 'opcion',
      texto: '¿Qué significa «SA» en una licencia Creative Commons?',
      opciones: ['Sin autor', 'Compartir igual: lo que crees debe llevar la misma licencia', 'Solo para adultos', 'Sin anuncios'], correcta: 1,
      explicacion: 'Share Alike: las obras derivadas se comparten con la misma licencia.',
    },
    {
      id: 'p7-03', concepto: 'licencias', criterio: '2.3', tipo: 'opcion',
      texto: '¿Qué diferencia hay entre freeware y software libre?',
      opciones: [
        'Ninguna, los dos son gratis.',
        'El freeware es gratis pero su código es cerrado; el software libre permite estudiarlo, modificarlo y compartirlo.',
        'El software libre siempre es de pago.',
        'El freeware se puede modificar y el libre no.',
      ],
      correcta: 1, explicacion: '«Libre» habla de libertades, no de precio.',
    },
    {
      id: 'p7-04', concepto: 'licencias', criterio: '2.3', tipo: 'opcion',
      texto: 'Copias un párrafo de un blog en tu trabajo sin decir de dónde es. ¿Qué es eso?',
      opciones: ['Una cita', 'Plagio', 'Dominio público', 'Una licencia CC'], correcta: 1,
      explicacion: 'Presentar como propio lo de otro es plagio. Si lo citas con su autor y su enlace, deja de serlo.',
    },
    {
      id: 'p7-05', concepto: 'licencias', criterio: '2.3', tipo: 'opcion',
      texto: '¿Qué derecho de autor no se puede vender ni ceder nunca?',
      opciones: ['El derecho a cobrar por la obra', 'El derecho moral a que se reconozca la autoría', 'El derecho a traducirla', 'El derecho a imprimirla'], correcta: 1,
      explicacion: 'Los derechos morales acompañan siempre al autor; los patrimoniales sí se pueden ceder.',
    },
    {
      id: 'p7-06', concepto: 'bulos', criterio: '3.3', tipo: 'opcion',
      texto: 'Tu tía comparte una noticia falsa creyendo que es verdad. ¿Qué es, técnicamente?',
      opciones: ['Desinformación', 'Información errónea', 'Sátira', 'Un deepfake'], correcta: 1,
      explicacion: 'La desinformación busca engañar a propósito; tu tía no lo sabe: es información errónea.',
    },
    {
      id: 'p7-07', concepto: 'bulos', criterio: '3.3', tipo: 'opcion',
      texto: 'Te llega una foto impactante de «hoy». ¿Qué herramienta te dice si ya circulaba hace años?',
      opciones: ['Un antivirus', 'La búsqueda inversa de imágenes', 'El modo avión', 'Un gestor de contraseñas'], correcta: 1,
      explicacion: 'La búsqueda inversa encuentra dónde y cuándo apareció antes esa imagen.',
    },
    {
      id: 'p7-08', concepto: 'bulos', criterio: '3.3', tipo: 'opcion',
      texto: '¿Qué es la burbuja de filtros?',
      opciones: [
        'Un tipo de virus.',
        'Que los algoritmos te muestren sobre todo lo que ya te gusta, hasta que ves solo una parte de la realidad.',
        'Un filtro de fotos.',
        'Una red Wi-Fi privada.',
      ],
      correcta: 1, explicacion: 'Las recomendaciones personalizadas te encierran en tus propias preferencias. Hay que salir a buscar otras fuentes.',
    },
    {
      id: 'p7-09', concepto: 'bulos', criterio: '3.3', tipo: 'opcion',
      texto: '¿Cuál es una señal típica de un deepfake de vídeo?',
      opciones: ['Que tenga subtítulos', 'Parpadeos extraños y labios que no encajan con la voz', 'Que dure más de un minuto', 'Que esté en alta resolución'], correcta: 1,
      explicacion: 'Aunque cada vez son mejores, suelen fallar en detalles: parpadeo, sombras, sincronía de labios.',
    },
    {
      id: 'p7-10', concepto: 'curacion', criterio: '2.3', tipo: 'opcion',
      texto: '¿Qué hace la búsqueda  volcanes -tenerife ?',
      opciones: ['Busca volcanes solo de Tenerife', 'Busca volcanes excluyendo lo que mencione Tenerife', 'Resta volcanes', 'Nada: el signo menos no funciona'], correcta: 1,
      explicacion: 'El signo menos delante de una palabra excluye los resultados que la contienen.',
    },
    {
      id: 'p7-11', concepto: 'curacion', criterio: '2.3', tipo: 'texto',
      texto: 'Escribe el operador que limita la búsqueda a un tipo de archivo (por ejemplo, PDF), sin la extensión.',
      aceptadas: ['filetype:', 'filetype'], esperada: 'filetype:',
      explicacion: 'filetype:pdf devuelve solo documentos PDF.',
    },
    {
      id: 'p7-12', concepto: 'curacion', criterio: '2.3', tipo: 'opcion',
      texto: '¿Para qué sirve una suscripción RSS?',
      opciones: ['Para cifrar tu correo', 'Para recibir en un solo lector las novedades de las webs que sigues', 'Para comprar libros', 'Para bloquear anuncios'], correcta: 1,
      explicacion: 'El RSS reúne las novedades de muchas fuentes en un lector, sin depender de un algoritmo.',
    },
    {
      id: 'p7-13', concepto: 'curacion', criterio: '2.3', tipo: 'opcion',
      texto: '¿Qué criterio NO sirve para juzgar la calidad de una fuente?',
      opciones: ['Quién la firma', 'Su fecha', 'El número de «me gusta» que tiene', 'Si cita de dónde saca los datos'], correcta: 2,
      explicacion: 'La popularidad no es rigor: un bulo puede tener millones de «me gusta».',
    },
    {
      id: 'p7-14', concepto: 'burbuja', criterio: '3.3', tipo: 'opcion',
      texto: '¿Qué es una burbuja de filtros?',
      opciones: ['Un filtro de agua para el ordenador', 'Que los algoritmos solo te enseñan lo que se parece a lo que ya miras', 'Un tipo de virus', 'Una forma de comprimir imágenes'], correcta: 1,
      explicacion: 'Los algoritmos de recomendación aprenden de lo que pulsas y te muestran más de lo mismo: acabas viendo solo una parte del mundo.',
    },
  ],
};
