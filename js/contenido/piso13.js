// Piso XIII · El Observatorio del Oráculo
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saber V.1 «Inteligencia artificial y datos»: aprendizaje automático, sesgo, bases de
// datos y SQL, big data, alucinaciones, ética y Reglamento Europeo de IA. Criterio 4.3.

export default {
  id: 'piso13',
  nombre: 'Piso XIII · El Observatorio del Oráculo',
  criterios: ['4.3'],

  intro: [
    'Una cúpula abierta a las estrellas y, en el centro, un **orbe** enorme que susurra predicciones. **El Observatorio del Oráculo.**',
    'Morvath lo alimentó con todo lo que robó. Ahora el oráculo «sabe» cosas… pero solo lo que aprendió de **sus datos**.',
    'Y en algún sitio de este piso está el **registro de las celdas**. Si encontramos la de Aldric, podremos abrirla.',
    'Tres sellos: **entrenar al oráculo** (centro), la **consola de las celdas** (oeste) y el **mapa de constelaciones** (este).',
  ],

  lecciones: {
    ia: {
      titulo: 'Inteligencia artificial y aprendizaje automático',
      resumen: 'La inteligencia artificial (IA) hace que las máquinas realicen tareas que parecen inteligentes. Aprendizaje automático: en vez de programar las reglas, el sistema las aprende de ejemplos. Supervisado: ejemplos con su etiqueta (esta criatura es peligrosa). No supervisado: el sistema agrupa datos sin etiquetas. Por refuerzo: aprende probando y recibiendo premios o castigos. El modelo solo sabe lo que hay en sus datos: si los ejemplos de entrenamiento no representan bien la realidad, el modelo tiene sesgo y se equivoca (y puede discriminar). Por eso se prueba con datos nuevos y se cuida que los datos sean variados.',
      paginas: [
        'La **inteligencia artificial** hace que una máquina realice tareas que parecen inteligentes: reconocer una cara, traducir, recomendar…',
        'Casi toda la IA actual usa **aprendizaje automático**: en vez de escribir las reglas, se le dan **ejemplos** y el sistema las aprende solo.',
        'En el aprendizaje **supervisado**, cada ejemplo lleva su **etiqueta** («esta criatura es peligrosa»). En el **no supervisado**, el sistema agrupa datos sin etiquetas. Y en el aprendizaje **por refuerzo**, aprende probando y recibiendo premios o castigos.',
        'El modelo solo sabe lo que hay en sus datos. Si los ejemplos no representan bien la realidad, el modelo tiene **sesgo**: se equivoca siempre con los mismos casos… y puede **discriminar**.',
        'Por eso se prueba con **datos nuevos** y se cuida que los datos de entrenamiento sean **variados**.',
      ],
      despues: ['El oráculo clasifica criaturas en **amigas** o **peligrosas**. Probadlo… y veréis que algo falla.'],
    },
    basesDatos: {
      titulo: 'Bases de datos y SQL',
      resumen: 'Una base de datos relacional guarda la información en tablas: cada fila es un registro y cada columna, un campo. La clave primaria identifica cada fila (id); una clave ajena apunta a una fila de otra tabla (celda_id). SQL es el lenguaje para consultarlas: SELECT columnas FROM tabla elige datos; WHERE filtra (nombre = \'Aldric\'); JOIN une dos tablas por una columna común (ON prisioneros.celda_id = celdas.id); UPDATE tabla SET columna = valor WHERE … cambia datos (¡sin WHERE cambiaría todas las filas!).',
      paginas: [
        'Una **base de datos** relacional guarda la información en **tablas**: cada **fila** es un registro y cada **columna**, un dato de ese registro.',
        'La **clave primaria** (por ejemplo, **id**) identifica cada fila. Una **clave ajena** (como **celda_id**) apunta a una fila de **otra** tabla: así se relacionan.',
        'Para consultarla se usa **SQL**. **SELECT** columnas **FROM** tabla elige los datos; **WHERE** filtra: **WHERE nombre = \'Aldric\'** (el texto, entre comillas simples).',
        '**JOIN** une dos tablas por su columna común: **FROM prisioneros JOIN celdas ON prisioneros.celda_id = celdas.id**.',
        'Y **UPDATE** cambia datos: **UPDATE celdas SET estado = \'abierta\' WHERE id = 7**. Cuidado: **sin WHERE cambiaría todas las filas**.',
      ],
      despues: ['La consola de las celdas tiene tres retos. El último… abre una puerta.'],
    },
    bigData: {
      titulo: 'Big data, alucinaciones y ética de la IA',
      resumen: 'Big data: conjuntos de datos tan grandes y rápidos que no caben en herramientas normales. Se describe con las 5 V: volumen (cantidad), velocidad (llegan sin parar), variedad (texto, vídeo, sensores…), veracidad (fiabilidad) y valor (utilidad). Los modelos de lenguaje generan texto probable, no verdades comprobadas: pueden alucinar (inventar datos, citas o fuentes con seguridad). Hay que contrastar. El Reglamento Europeo de IA clasifica los sistemas por riesgo: prohibe algunos (puntuación social de personas), exige controles a los de alto riesgo (selección de personal, educación) y transparencia (avisar de que hablas con una IA o de que una imagen es artificial).',
      paginas: [
        'El **big data** son datos tan grandes y rápidos que no caben en herramientas normales. Se describen con las **5 V**: **volumen** (muchísimos), **velocidad** (llegan sin parar), **variedad** (texto, vídeo, sensores…), **veracidad** (¿son fiables?) y **valor** (¿sirven para algo?).',
        'Los **modelos de lenguaje** (los chats de IA) generan el texto **más probable**, no verdades comprobadas. Por eso pueden **alucinar**: inventar datos, citas o fuentes con total seguridad. Siempre hay que **contrastar**.',
        'El **Reglamento Europeo de IA** ordena los sistemas por **riesgo**. **Prohíbe** algunos (como puntuar socialmente a las personas), exige controles a los de **alto riesgo** (seleccionar personal, evaluar alumnos) y pide **transparencia**: avisar de que hablas con una IA o de que una imagen es artificial.',
        'Por cierto: este juego se hizo con **ayuda de IA**. La IA propuso y escribió mucho; las personas decidieron, revisaron y corrigieron. Así se usa bien: como herramienta, no como oráculo.',
      ],
      despues: ['Las constelaciones esconden ejemplos. Decid qué es cada uno.'],
    },
  },

  // ---------- Sello 1 · Entrenar al oráculo ----------
  // x = tamaño, y = brillo de los ojos (0 a 10). En el mundo real, una criatura es
  // peligrosa si le brillan los ojos (y > 5), sea del tamaño que sea.
  oraculo: {
    titulo: 'Entrenar al oráculo',
    enunciado: 'El oráculo aprendió con pocos ejemplos: todas las peligrosas que vio eran **grandes**. Probadlo con las criaturas de prueba (los cuadrados) y después **añadid ejemplos** de la reserva (los círculos huecos) hasta que acierte al menos 7 de 8.',
    ejes: ['Tamaño', 'Brillo de los ojos'],
    entrenamiento: [
      { x: 8, y: 8, clase: 'peligrosa' }, { x: 9, y: 7, clase: 'peligrosa' }, { x: 7, y: 9, clase: 'peligrosa' },
      { x: 2, y: 2, clase: 'amiga' }, { x: 3, y: 1, clase: 'amiga' }, { x: 1, y: 3, clase: 'amiga' },
    ],
    reserva: [
      { x: 2, y: 8, clase: 'peligrosa' }, { x: 1, y: 9, clase: 'peligrosa' }, { x: 3, y: 7, clase: 'peligrosa' },
      { x: 8, y: 2, clase: 'amiga' }, { x: 7, y: 2, clase: 'amiga' }, { x: 9, y: 1, clase: 'amiga' },
      { x: 9, y: 9, clase: 'peligrosa' }, { x: 1, y: 1, clase: 'amiga' },
    ],
    prueba: [
      { x: 1, y: 6, clase: 'peligrosa' }, { x: 2, y: 7, clase: 'peligrosa' }, { x: 3, y: 6, clase: 'peligrosa' }, { x: 8, y: 8, clase: 'peligrosa' },
      { x: 8, y: 3, clase: 'amiga' }, { x: 9, y: 2, clase: 'amiga' }, { x: 7, y: 4, clase: 'amiga' }, { x: 2, y: 2, clase: 'amiga' },
    ],
    minimo: 0.875,
    sesgo: 'El oráculo confunde el **tamaño** con el peligro, porque todas las peligrosas que vio eran grandes. Eso es un **sesgo** en los datos de entrenamiento.',
    arreglado: 'Con ejemplos variados, el oráculo ha aprendido lo que de verdad importa: **el brillo de los ojos**. Más datos no basta: tienen que ser **representativos**.',
  },

  // ---------- Sello 2 · La consola de las celdas ----------
  tablas: {
    celdas: {
      columnas: ['id', 'planta', 'guardian', 'estado'],
      filas: [
        { id: 1, planta: 'norte', guardian: 'Grul', estado: 'cerrada' },
        { id: 2, planta: 'norte', guardian: 'Vex', estado: 'cerrada' },
        { id: 3, planta: 'sur', guardian: 'Grul', estado: 'cerrada' },
        { id: 7, planta: 'cima', guardian: 'Morvath', estado: 'cerrada' },
        { id: 5, planta: 'oeste', guardian: 'Vex', estado: 'cerrada' },
      ],
    },
    prisioneros: {
      columnas: ['id', 'nombre', 'celda_id'],
      filas: [
        { id: 1, nombre: 'Bibliotecaria', celda_id: 1 },
        { id: 2, nombre: 'Mago gris', celda_id: 2 },
        { id: 3, nombre: 'Aldric', celda_id: 7 },
        { id: 4, nombre: 'Herrero', celda_id: 5 },
      ],
    },
  },
  retos: [
    { id: 'todos', texto: 'Reto 1 · Mostrad **todos los prisioneros** (todas las columnas de la tabla prisioneros).', ayuda: 'SELECT * FROM prisioneros' },
    { id: 'buscar', texto: 'Reto 2 · ¿En qué **celda** y en qué **planta** está **Aldric**? Usad **JOIN** para unir prisioneros y celdas, y **WHERE** para quedaros con él.', ayuda: "SELECT nombre, planta FROM prisioneros JOIN celdas ON prisioneros.celda_id = celdas.id WHERE nombre = 'Aldric'" },
    { id: 'abrir', texto: 'Reto 3 · **Abrid su celda**: cambiad su estado a **\'abierta\'** con UPDATE… y solo la suya.', ayuda: "UPDATE celdas SET estado = 'abierta' WHERE id = 7" },
  ],

  // ---------- Sello 3 · El mapa de constelaciones ----------
  constelaciones: [
    {
      id: 'p13-c1', concepto: 'bigData', criterio: '4.3', tipo: 'opcion',
      texto: 'Una red social recibe 500 horas de vídeo cada minuto. ¿Qué V del big data describe sobre todo?',
      opciones: ['Veracidad', 'Velocidad', 'Valor', 'Variedad'],
      correcta: 1,
      explicacion: 'Datos que llegan sin parar y hay que procesar al momento: velocidad.',
    },
    {
      id: 'p13-c2', concepto: 'bigData', criterio: '4.3', tipo: 'opcion',
      texto: 'Un hospital junta informes escritos, radiografías, datos de sensores y grabaciones. ¿Qué V es?',
      opciones: ['Variedad', 'Volumen', 'Velocidad', 'Valor'],
      correcta: 0,
      explicacion: 'Datos de tipos muy distintos (texto, imagen, señales, audio): variedad.',
    },
    {
      id: 'p13-c3', concepto: 'bigData', criterio: '4.3', tipo: 'opcion',
      texto: 'La mitad de las reseñas de un producto son falsas. ¿Qué V del big data falla?',
      opciones: ['Volumen', 'Velocidad', 'Veracidad', 'Variedad'],
      correcta: 2,
      explicacion: 'Si los datos no son fiables, falla la veracidad.',
    },
    {
      id: 'p13-c4', concepto: 'bigData', criterio: '4.3', tipo: 'opcion',
      texto: 'Le pides a un chat de IA una fuente para tu trabajo y te da un libro con autor y página… que no existe. ¿Qué ha pasado?',
      opciones: ['El libro se ha borrado de internet', 'El modelo ha alucinado: generó una cita probable pero inventada', 'El chat te ha hackeado', 'Es imposible: la IA no se equivoca'],
      correcta: 1,
      explicacion: 'Los modelos de lenguaje pueden inventar datos con seguridad. Hay que comprobar siempre las fuentes.',
    },
    {
      id: 'p13-c5', concepto: 'bigData', criterio: '4.3', tipo: 'opcion',
      texto: 'Un ayuntamiento quiere puntuar a sus vecinos según su comportamiento y quitar ayudas a los de nota baja. ¿Qué dice el Reglamento Europeo de IA?',
      opciones: ['Está permitido si es gratis', 'Es una práctica prohibida (puntuación social)', 'Solo necesita un aviso', 'No dice nada de esto'],
      correcta: 1,
      explicacion: 'La puntuación social de personas está entre los usos de IA prohibidos en la Unión Europea.',
    },
  ],

  pistas: {
    oraculo: 'El **oráculo** es el orbe del centro de la sala. Acercaos y pulsad **E**.',
    celdas: 'La **consola de las celdas** está en el lado oeste. Pulsad **E** junto a ella.',
    constelaciones: 'El **mapa de constelaciones** está en el lado este. Pulsad **E** junto a él.',
    puerta: '¡La puerta del norte está abierta! Arriba solo queda… **la Cima**.',
  },

  sellosRotos: [
    '¡Los tres sellos del observatorio están rotos! El orbe se apaga… y en la celda 7 algo se mueve.',
    'Las estrellas de la cúpula forman una última imagen: un **recuerdo**.',
  ],

  memoria: [
    'Morvath, ya mayor, habla con el oráculo cada noche. «Dime quién me traicionará».',
    'El orbe responde con nombres. Nombres que salen de los datos que él mismo eligió: los de quienes alguna vez le llevaron la contraria.',
    'Aldric aparece en todas las listas. No porque sea un traidor, sino porque fue el único que le dijo que no.',
    'Un oráculo entrenado con miedo solo predice miedo. Arriba, en la Cima, os espera Morvath. Y yo. Subid.',
  ],

  preguntas: [
    {
      id: 'p13-01', concepto: 'ia', criterio: '4.3', tipo: 'opcion',
      texto: '¿Qué es el aprendizaje supervisado?',
      opciones: ['Aprender sin ningún dato', 'Aprender de ejemplos que llevan su etiqueta (la respuesta correcta)', 'Que una persona vigile el ordenador', 'Copiar respuestas de internet'],
      correcta: 1,
      explicacion: 'En el supervisado, cada ejemplo de entrenamiento incluye la respuesta: «esto es un gato».',
    },
    {
      id: 'p13-02', concepto: 'ia', criterio: '4.3', tipo: 'opcion',
      texto: 'Un sistema que agrupa clientes parecidos sin que nadie le diga los grupos usa aprendizaje…',
      opciones: ['supervisado', 'no supervisado', 'por refuerzo', 'manual'],
      correcta: 1,
      explicacion: 'Encontrar grupos en datos sin etiquetas es aprendizaje no supervisado.',
    },
    {
      id: 'p13-03', concepto: 'ia', criterio: '4.3', tipo: 'opcion',
      texto: 'Una IA para seleccionar personal se entrenó con currículos de una empresa que casi solo contrataba hombres. ¿Qué riesgo hay?',
      opciones: ['Ninguno: los datos son reales', 'Que aprenda ese sesgo y discrimine a las mujeres', 'Que vaya más lenta', 'Que se quede sin memoria'],
      correcta: 1,
      explicacion: 'El modelo aprende los patrones de sus datos, también los injustos. Hay que revisar los datos y probarlo.',
    },
    {
      id: 'p13-04', concepto: 'ia', criterio: '4.3', tipo: 'opcion',
      texto: 'Un programa que aprende a jugar a un videojuego probando y recibiendo puntos por ganar usa aprendizaje…',
      opciones: ['por refuerzo', 'supervisado', 'no supervisado', 'de memoria'],
      correcta: 0,
      explicacion: 'Aprender por prueba y error con recompensas es aprendizaje por refuerzo.',
    },
    {
      id: 'p13-05', concepto: 'basesDatos', criterio: '4.3', tipo: 'opcion',
      texto: 'En una tabla de una base de datos, ¿qué es una fila?',
      opciones: ['Un registro (por ejemplo, un alumno con todos sus datos)', 'Un tipo de dato', 'El nombre de la tabla', 'Una contraseña'],
      correcta: 0,
      explicacion: 'Cada fila es un registro; cada columna, un dato de ese registro.',
    },
    {
      id: 'p13-06', concepto: 'basesDatos', criterio: '4.3', tipo: 'opcion',
      texto: '¿Qué hace WHERE en una consulta SQL?',
      opciones: ['Ordena los resultados', 'Filtra las filas que cumplen una condición', 'Borra la tabla', 'Une dos tablas'],
      correcta: 1,
      explicacion: 'WHERE se queda solo con las filas que cumplen la condición.',
    },
    {
      id: 'p13-07', concepto: 'basesDatos', criterio: '4.3', tipo: 'opcion',
      texto: '¿Qué pasa si escribes UPDATE alumnos SET nota = 10 sin WHERE?',
      opciones: ['No hace nada', 'Cambia la nota de todos los alumnos', 'Da error siempre', 'Cambia solo el primero'],
      correcta: 1,
      explicacion: 'Sin WHERE, UPDATE modifica todas las filas. Por eso el WHERE es tan importante.',
    },
    {
      id: 'p13-08', concepto: 'basesDatos', criterio: '4.3', tipo: 'opcion',
      texto: '¿Para qué sirve una clave ajena (como celda_id)?',
      opciones: ['Para cifrar la tabla', 'Para relacionar una fila con una fila de otra tabla', 'Para numerar las columnas', 'Para borrar datos'],
      correcta: 1,
      explicacion: 'La clave ajena apunta a la clave primaria de otra tabla; con JOIN se unen.',
    },
    {
      id: 'p13-09', concepto: 'bigData', criterio: '4.3', tipo: 'opcion',
      texto: '¿Qué es una «alucinación» de un modelo de lenguaje?',
      opciones: ['Un fallo de la pantalla', 'Una respuesta inventada que parece segura y correcta', 'Un virus', 'Una imagen borrosa'],
      correcta: 1,
      explicacion: 'Los modelos generan texto probable; a veces inventan datos o fuentes. Hay que contrastar.',
    },
    {
      id: 'p13-10', concepto: 'bigData', criterio: '4.3', tipo: 'opcion',
      texto: 'Según el Reglamento Europeo de IA, si hablas con un chatbot en la web de una empresa…',
      opciones: ['No tienen que decírtelo', 'Te tienen que avisar de que hablas con una IA', 'Está prohibido', 'Solo pueden usarlo los bancos'],
      correcta: 1,
      explicacion: 'La transparencia obliga a avisar de que se está interactuando con un sistema de IA.',
    },
  ],
};
