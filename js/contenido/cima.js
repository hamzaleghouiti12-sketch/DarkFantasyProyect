// La Cima · El Trono de Morvath
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saber V.2 «Realidad virtual y aumentada» (criterio 4.5) y repaso de los cinco bloques
// en la batalla final.

const A = { op: 'avanzar' }, I = { op: 'izquierda' }, D = { op: 'derecha' };

export default {
  id: 'cima',
  nombre: 'La Cima · El Trono de Morvath',
  criterios: ['4.5', '1.1', '3.3', '3.1', '4.2', '4.3'],

  intro: [
    'Por fin, aire libre. La azotea de la torre, bajo una **luna enorme**. Al fondo, un trono de piedra… y alguien sentado en él.',
    'Es **Morvath**. No una proyección: él. Lleva la misma túnica que Aldric, pero teñida del color de la sangre seca.',
    'Y en una jaula, a un lado, **Aldric**. El de verdad.',
    'Aldric: «¡Chicos! No os acerquéis a él todavía. Está protegido por **cinco escudos**, uno por cada cosa que habéis aprendido. Primero, usad el **visor** de la izquierda: os enseñará dónde es débil».',
  ],

  lecciones: {
    realidad: {
      titulo: 'Realidad virtual, aumentada y mixta',
      resumen: 'Realidad virtual (RV): un mundo completamente digital que sustituye al real (gafas como Meta Quest). Realidad aumentada (RA): añade elementos digitales sobre el mundo real, normalmente con la cámara del móvil (filtros, Pokémon GO, apps de muebles). Realidad mixta (RM): los objetos digitales se integran e interactúan con el entorno real (gafas como HoloLens o Vision Pro). XR (realidad extendida) es el nombre que las engloba. Una app de RA necesita: un dispositivo con cámara y sensores, seguimiento (reconocer superficies o un marcador, como un código QR o una imagen), anclas (dónde se queda pegado el objeto) y el contenido 3D. Se crean con herramientas como CoSpaces, Unity o A-Frame. Usos: educación, medicina, arquitectura, museos, formación.',
      paginas: [
        'Este visor no muestra otro mundo: **añade cosas al nuestro**. Es **realidad aumentada**.',
        'Hay tres tipos. La **realidad virtual (RV)** te mete en un mundo totalmente digital, con unas gafas que tapan el real. La **realidad aumentada (RA)** pone elementos digitales **sobre** el mundo real, casi siempre con la cámara del móvil.',
        'La **realidad mixta (RM)** va un paso más allá: los objetos digitales se integran en el entorno y reaccionan a él. Todas juntas se llaman **XR**, realidad extendida.',
        'Una app de RA necesita: un **dispositivo** con cámara y sensores, **seguimiento** (reconocer el suelo, una superficie o un **marcador**, como una imagen o un código QR), **anclas** (dónde se queda pegado el objeto) y el **contenido 3D**.',
        'Se crean con herramientas como **CoSpaces**, **Unity** o **A-Frame**, y se usan en educación, medicina, arquitectura, museos…',
      ],
      despues: ['Configurad el visor para revelar los **puntos débiles** de Morvath.'],
    },
  },

  // ---------- Sello de la cima · El visor de realidades ----------
  visor: [
    {
      id: 'cima-v1', concepto: 'realidad', criterio: '4.5', tipo: 'opcion',
      texto: 'Queremos ver los puntos débiles de Morvath encima de él, sin dejar de ver la azotea. ¿Qué tipo de realidad necesitamos?',
      opciones: ['Realidad virtual', 'Realidad aumentada', 'Ninguna: basta con una foto', 'Un videojuego en 2D'],
      correcta: 1,
      explicacion: 'La realidad aumentada añade información digital sobre el mundo real que estás viendo.',
    },
    {
      id: 'cima-v2', concepto: 'realidad', criterio: '4.5', tipo: 'opcion',
      texto: 'Para que el visor sepa dónde está Morvath, le ponemos una runa que la cámara reconoce. ¿Qué elemento de una app de RA es?',
      opciones: ['Un marcador', 'Un compilador', 'Una contraseña', 'Un servidor DNS'],
      correcta: 0,
      explicacion: 'Un marcador (una imagen, un código QR, una runa) permite a la app reconocer y seguir un lugar u objeto.',
    },
    {
      id: 'cima-v3', concepto: 'realidad', criterio: '4.5', tipo: 'opcion',
      texto: '¿Qué dispositivo NO serviría para una experiencia de realidad virtual inmersiva?',
      opciones: ['Unas gafas de RV con sensores', 'Un móvil dentro de un visor de cartón', 'Una calculadora', 'Unas gafas autónomas como Meta Quest'],
      correcta: 2,
      explicacion: 'La RV necesita una pantalla delante de los ojos y sensores de movimiento.',
    },
    {
      id: 'cima-v4', concepto: 'realidad', criterio: '4.5', tipo: 'opcion',
      texto: 'Vuestro profesor quiere crear una visita en RA a un yacimiento canario sin programar mucho. ¿Qué herramienta encaja mejor para empezar?',
      opciones: ['CoSpaces o A-Frame', 'Un antivirus', 'Una hoja de cálculo', 'Un sistema operativo'],
      correcta: 0,
      explicacion: 'CoSpaces (por bloques) y A-Frame (web) permiten crear escenas de RV/RA sin un motor complejo.',
    },
  ],
  visorHecho: 'El visor se enciende. Sobre Morvath aparecen **tres runas** brillantes: sus puntos débiles. Y alrededor, sus **cinco escudos**.',

  // ---------- El duelo final: cinco escudos, uno por bloque ----------
  jefe: {
    aparicion: [
      'Morvath: «Así que vosotros sois los críos que el portal de Aldric escupió. Habéis llegado lejos».',
      'Morvath: «Yo protegí el saber cuando nadie lo hacía. Lo guardé, lo ordené, lo vigilé. ¿Y queréis devolverlo a quienes lo dejaron arder?».',
      'Morvath: «Cinco escudos me protegen: todo lo que creéis haber aprendido. Rompedlos… si podéis».',
    ],
    fases: [
      {
        escudo: 'Bloque I · el escudo de los bits',
        ataque: 'Morvath: «Mi primer escudo vibra con una cifra que solo entienden las máquinas».',
        pregunta: {
          id: 'cima-f1', concepto: 'binario', criterio: '1.1', tipo: 'numero',
          texto: 'El escudo vibra con la cifra binaria 101101. ¿Qué número es en decimal?',
          valor: 45, tolerancia: 0, unidad: '',
          explicacion: '101101 = 32 + 8 + 4 + 1 = 45.',
        },
      },
      {
        escudo: 'Bloque II · el escudo del pregón',
        ataque: 'Morvath clava un pergamino en el aire: «Leed lo que dice el pueblo de vuestro querido Aldric».',
        pregunta: {
          id: 'cima-f2', concepto: 'bulos', criterio: '3.3', tipo: 'opcion',
          texto: 'El pergamino dice: «¡Aldric ha huido y os ha abandonado! ¡Compartid antes de que lo borren!». Lo firma «un vecino» y la imagen es de hace tres años. ¿Qué hacéis?',
          opciones: ['Compartirlo: es urgente', 'Es un bulo: autor anónimo, prisa, imagen antigua. No se difunde y se contrasta', 'Creerlo, porque tiene foto', 'Responder con insultos'],
          correcta: 1,
          explicacion: 'Autor desconocido, prisa por compartir y una imagen sacada de contexto: señales claras de bulo.',
        },
      },
      {
        escudo: 'Bloque III · el escudo del contagio',
        ataque: 'Morvath sonríe: «Vuestra varita está desactualizada. Os he preparado una mejora».',
        pregunta: {
          id: 'cima-f3', concepto: 'malware', criterio: '3.1', tipo: 'opcion',
          texto: 'Aparece un pergamino: «Actualiza tu varita aquí. Escribe tu contraseña para continuar». ¿Qué es y qué hacéis?',
          opciones: ['Una actualización oficial: escribo la contraseña', 'Phishing: no escribo nada y actualizo solo desde la fuente oficial', 'Un regalo: lo acepto', 'Un error: lo reenvío a mis amigos'],
          correcta: 1,
          explicacion: 'Pedir la contraseña para «actualizar» es phishing. Las actualizaciones nunca piden tu contraseña así.',
        },
      },
      {
        escudo: 'Bloque IV · el escudo del autómata',
        ataque: 'Morvath: «Mi autómata custodia el cuarto escudo. Su programa es perfecto». (No lo es.)',
        automata: {
          titulo: 'El autómata de Morvath',
          enunciado: 'El autómata debería subir en escalera hasta la casilla dorada, pero se sale del tablero. Encontrad el error de lógica y corregidlo.',
          ancho: 4, alto: 4, inicio: { x: 0, y: 3, dir: 0 }, meta: { x: 3, y: 0 },
          muros: [[3, 3], [3, 2], [2, 3]], trampas: [[0, 0]],
          bloques: ['avanzar', 'izquierda', 'derecha', 'repetir'],
          programa: [{ op: 'repetir', n: 3, cuerpo: [A, I, A, D] }],
          arreglado: [{ op: 'repetir', n: 3, cuerpo: [A, D, A, I] }],
        },
      },
      {
        escudo: 'Bloque V · el escudo del oráculo',
        ataque: 'Morvath alza su orbe: «Mi oráculo no se equivoca. Me dice que todos acabaréis traicionándome».',
        pregunta: {
          id: 'cima-f5', concepto: 'ia', criterio: '4.3', tipo: 'opcion',
          texto: 'Morvath entrenó su oráculo solo con los nombres de quienes le llevaron la contraria. Ahora predice que todo el mundo es un traidor. ¿Qué le pasa al oráculo?',
          opciones: ['Nada: los datos son reales', 'Tiene sesgo: sus datos de entrenamiento no representan a la gente', 'Le falta memoria RAM', 'Es demasiado inteligente'],
          correcta: 1,
          explicacion: 'Un modelo entrenado con datos parciales repite ese sesgo. Más miedo en los datos, más miedo en las predicciones.',
        },
      },
    ],
    burlas: [
      'Morvath: «¿Eso es todo? Aldric os enseñó peor de lo que pensaba».',
      'Morvath: «Pensadlo otra vez. Yo tengo todo el tiempo del mundo».',
      'Morvath: «Casi. Y "casi" no rompe escudos».',
    ],
    acierto: ['¡El primer escudo estalla!', '¡Segundo escudo roto!', '¡El tercer escudo se apaga!', '¡Cuarto escudo hecho añicos!', '¡El último escudo cae!'],
    derrota: [
      'Morvath cae de rodillas. Sin escudos, solo es un hombre mayor y cansado.',
      'Morvath: «Lo guardé todo… para que no volviera a perderse. ¿Por qué nadie lo entendió?».',
    ],
    final: [
      'Aldric: «Porque el saber no se protege encerrándolo, viejo amigo. Se protege **compartiéndolo**: con copias, con licencias, con gente que lo entiende y lo cuida».',
      'Aldric: «Estos chicos lo han demostrado piso a piso. No vigilando a nadie. Aprendiendo».',
      'Morvath mira la ciudad dormida bajo la torre. Por primera vez en muchos años, no dice nada.',
      'Aldric: «La torre volverá a ser una biblioteca. Abierta. Y el portal… por fin está cargado. Podéis volver a casa».',
      'Aldric: «Gracias. Y recordad: todo lo que habéis aprendido aquí también funciona en vuestro mundo. Sobre todo allí».',
    ],
  },

  pistas: {
    visor: 'El **visor de realidades** está a la izquierda del trono. Acercaos y pulsad **E**.',
    jefe: 'Acercaos a **Morvath**, delante del trono, y pulsad **E** para enfrentaros a él.',
  },

  preguntas: [
    {
      id: 'cima-01', concepto: 'realidad', criterio: '4.5', tipo: 'opcion',
      texto: '¿Qué diferencia hay entre realidad virtual y realidad aumentada?',
      opciones: ['Ninguna', 'La RV sustituye el mundo real por uno digital; la RA añade elementos digitales al mundo real', 'La RA necesita siempre gafas', 'La RV solo funciona en el móvil'],
      correcta: 1,
      explicacion: 'RV: todo es digital. RA: lo digital se superpone a lo real.',
    },
    {
      id: 'cima-02', concepto: 'realidad', criterio: '4.5', tipo: 'opcion',
      texto: 'Un filtro del móvil que te pone orejas de gato en la cara es un ejemplo de…',
      opciones: ['Realidad virtual', 'Realidad aumentada', 'Inteligencia artificial sin cámara', 'Big data'],
      correcta: 1,
      explicacion: 'Añade un elemento digital sobre la imagen real de la cámara: realidad aumentada.',
    },
    {
      id: 'cima-03', concepto: 'realidad', criterio: '4.5', tipo: 'opcion',
      texto: '¿Qué significa XR?',
      opciones: ['Un tipo de procesador', 'Realidad extendida: el conjunto de RV, RA y RM', 'Una red social', 'Una extensión de archivo'],
      correcta: 1,
      explicacion: 'XR (extended reality) agrupa la realidad virtual, la aumentada y la mixta.',
    },
    {
      id: 'cima-04', concepto: 'realidad', criterio: '4.5', tipo: 'opcion',
      texto: 'En una app de RA, ¿para qué sirve un ancla?',
      opciones: ['Para que el objeto 3D se quede fijo en un punto del mundo real', 'Para cifrar la app', 'Para cerrar la app', 'Para conectarse a internet'],
      correcta: 0,
      explicacion: 'El ancla mantiene el contenido digital pegado a un lugar real aunque muevas el móvil.',
    },
  ],
};
