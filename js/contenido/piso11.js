// Piso XI · El Taller de los Autómatas
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saberes IV.1 «Pensamiento computacional» y IV.2 «Diagramas de flujo y algoritmos».
// Criterios de evaluación 4.1 y 4.2.

const A = { op: 'avanzar' }, I = { op: 'izquierda' }, D = { op: 'derecha' };

export default {
  id: 'piso11',
  nombre: 'Piso XI · El Taller de los Autómatas',
  criterios: ['4.1', '4.2'],

  intro: [
    'Engranajes, cuadrículas pintadas en el suelo y pequeños **autómatas** de latón quietos en sus casillas. **El Taller de los Autómatas.**',
    'Morvath los fabricó para que hicieran su trabajo sin pensar. Solo obedecen **instrucciones exactas**, en orden.',
    'Tres sellos: el **atril de los diagramas** (oeste), el **tablero de los autómatas** (centro) y la **mesa del depurador** (este).',
  ],

  lecciones: {
    pensamiento: {
      titulo: 'Pensamiento computacional y diagramas de flujo',
      resumen: 'Pensamiento computacional: resolver problemas como lo haría un ordenador. Descomposición (partir el problema en partes pequeñas), patrones (ver qué se repite), abstracción (quedarse con lo importante) y algoritmo (los pasos exactos y ordenados). Un diagrama de flujo dibuja un algoritmo: óvalo = inicio o fin; rectángulo = proceso (una acción); rombo = decisión (una pregunta de sí o no); paralelogramo = entrada o salida de datos; flechas = el orden.',
      paginas: [
        'Para que una máquina haga algo, hay que pensar como ella: eso es el **pensamiento computacional**.',
        'Tiene cuatro herramientas: **descomposición** (partir el problema en trozos pequeños), **patrones** (ver qué se repite), **abstracción** (quedarse con lo importante) y **algoritmo** (los pasos exactos y en orden).',
        'Un **diagrama de flujo** dibuja un algoritmo. El **óvalo** marca el inicio y el fin; el **rectángulo**, una acción; el **rombo**, una pregunta de sí o no; el **paralelogramo**, entrada o salida de datos.',
        'Las **flechas** marcan el orden. Y si una flecha vuelve hacia atrás… eso es un **bucle**.',
      ],
      despues: ['El atril os pondrá a prueba con los símbolos y con el orden de un algoritmo.'],
    },
    programacion: {
      titulo: 'Secuencia, bucles y condicionales',
      resumen: 'Un programa se construye con tres estructuras: secuencia (instrucciones una detrás de otra), bucle (repetir: un número de veces con repetir/for, o mientras se cumpla una condición con while) y condicional (si pasa algo, haz esto; si no, aquello: if/else). Los bloques y el código escrito (JavaScript, pseudocódigo) expresan lo mismo con distinta forma.',
      paginas: [
        'Los autómatas entienden tres estructuras, y con ellas se puede escribir **cualquier programa**.',
        'La **secuencia**: instrucciones una detrás de otra, en orden.',
        'El **bucle**: repetir. Puede ser un número fijo de veces (**repetir 4**, en JavaScript un **for**) o **mientras** se cumpla una condición (**while**).',
        'El **condicional**: **si** pasa algo, haz esto; **si no**, haz aquello (**if / else**).',
        'Mientras programáis, el tablero os enseñará el mismo programa escrito en **JavaScript** y en **pseudocódigo**. Los bloques y el código son lo mismo con otra ropa.',
      ],
      despues: ['Tres tableros, de menos a más. Llevad el autómata hasta la casilla dorada.'],
    },
    depuracion: {
      titulo: 'Depurar: errores de sintaxis y de lógica',
      resumen: 'Depurar es encontrar y corregir errores. Error de sintaxis: el código está mal escrito (falta un paréntesis, una llave o un punto y coma) y el programa ni siquiera arranca; el intérprete dice la línea. Error de lógica: el programa funciona, pero hace otra cosa (gira al lado contrario, repite de más); hay que seguirlo paso a paso. Herramientas: leer el mensaje de error, ejecutar paso a paso, comentar el código y probar con casos pequeños.',
      paginas: [
        'Hasta los mejores programadores se equivocan. Encontrar y arreglar los fallos se llama **depurar**.',
        'Un **error de sintaxis** es una falta de ortografía del código: falta un paréntesis, una llave… El programa **ni arranca**, y el intérprete os dice en qué línea.',
        'Un **error de lógica** es más traicionero: el programa funciona, pero **hace otra cosa**. Hay que seguirlo **paso a paso** para ver dónde se tuerce.',
        'Trucos: leer el mensaje de error, ejecutar paso a paso, **comentar** el código y probar con casos pequeños.',
      ],
      despues: ['La mesa del depurador tiene dos programas rotos. Arregladlos.'],
    },
  },

  // ---------- Sello 1 · El atril de los diagramas ----------
  diagramas: [
    {
      id: 'p11-d1', concepto: 'pensamiento', criterio: '4.2', tipo: 'opcion',
      texto: 'En un diagrama de flujo, ¿qué símbolo se usa para una pregunta de sí o no, como «¿La palanca está arriba?»?',
      opciones: ['El óvalo', 'El rectángulo', 'El rombo', 'El paralelogramo'],
      correcta: 2,
      explicacion: 'El rombo es la decisión: de él salen dos flechas, una para el sí y otra para el no.',
    },
    {
      id: 'p11-d2', concepto: 'pensamiento', criterio: '4.2', tipo: 'opcion',
      texto: '«Leer el número que escribe el usuario» es entrada de datos. ¿Con qué símbolo se dibuja?',
      opciones: ['Paralelogramo', 'Rombo', 'Óvalo', 'Círculo pequeño'],
      correcta: 0,
      explicacion: 'El paralelogramo representa la entrada o salida de datos (leer, escribir, mostrar).',
    },
    {
      id: 'p11-d3', concepto: 'pensamiento', criterio: '4.2', tipo: 'orden',
      texto: 'Ordenad el algoritmo de la puerta: si la palanca está abajo hay que subirla antes de abrir.',
      opciones: ['Inicio', 'Mirar la palanca', '¿Está arriba? Si no, subirla', 'Abrir la puerta', 'Fin'],
      explicacion: 'Inicio, comprobar, decidir (y actuar si hace falta), la acción final y el fin: así se lee el diagrama de arriba abajo.',
    },
    {
      id: 'p11-d4', concepto: 'pensamiento', criterio: '4.1', tipo: 'opcion',
      texto: 'Para organizar una excursión, partís el problema en «transporte», «comida» y «horario». ¿Qué herramienta del pensamiento computacional es?',
      opciones: ['Abstracción', 'Descomposición', 'Reconocer patrones', 'Depuración'],
      correcta: 1,
      explicacion: 'Partir un problema grande en partes pequeñas y manejables es la descomposición.',
    },
  ],

  // ---------- Sello 2 · El tablero de los autómatas ----------
  // Coordenadas: x hacia el este, y hacia el sur; dir 0 = norte, 1 = este, 2 = sur, 3 = oeste.
  niveles: [
    {
      titulo: 'Tablero 1 · Secuencia',
      enunciado: 'Llevad el autómata hasta la casilla dorada. Solo hacen falta pasos y giros, en orden.',
      ancho: 5, alto: 5, inicio: { x: 0, y: 4, dir: 1 }, meta: { x: 3, y: 1 },
      muros: [[1, 2], [2, 2], [0, 1]], trampas: [],
      bloques: ['avanzar', 'izquierda', 'derecha'],
      solucion: [A, A, A, I, A, A, A],
    },
    {
      titulo: 'Tablero 2 · Bucle',
      enunciado: 'Una escalera: el mismo movimiento se repite. Hacedlo con 5 bloques como mucho (usad «repetir»).',
      ancho: 5, alto: 5, inicio: { x: 0, y: 4, dir: 1 }, meta: { x: 4, y: 0 },
      muros: [[2, 4], [3, 4], [4, 4], [3, 3], [4, 3], [4, 2]], trampas: [[0, 2], [1, 1]],
      bloques: ['avanzar', 'izquierda', 'derecha', 'repetir'],
      maxBloques: 5,
      solucion: [{ op: 'repetir', n: 4, cuerpo: [A, I, A, D] }],
    },
    {
      titulo: 'Tablero 3 · Condicional dentro de un bucle',
      enunciado: 'El autómata no sabe cuánto mide el camino. Con 4 bloques: mientras no llegue, si hay muro delante que gire a la derecha; si no, que avance.',
      ancho: 5, alto: 5, inicio: { x: 0, y: 0, dir: 1 }, meta: { x: 2, y: 4 },
      muros: [[1, 1], [2, 2], [1, 3]], trampas: [],
      bloques: ['avanzar', 'izquierda', 'derecha', 'mientras', 'si'],
      maxBloques: 4,
      solucion: [{ op: 'mientras', cuerpo: [{ op: 'si', entonces: [D], sino: [A] }] }],
    },
  ],

  // ---------- Sello 3 · La mesa del depurador ----------
  sintaxis: {
    id: 'p11-s1', concepto: 'depuracion', criterio: '4.2', tipo: 'opcion',
    texto: 'El intérprete se niega a arrancar y dice «SyntaxError: missing ) after argument list» en la línea «girarDerecha(;». ¿Qué falla?',
    opciones: ['El autómata está roto', 'Falta cerrar el paréntesis: girarDerecha();', 'Hay que girar a la izquierda', 'Falta repetir la línea'],
    correcta: 1,
    explicacion: 'Es un error de sintaxis: el código está mal escrito. Con el paréntesis cerrado, el programa arranca.',
  },
  depurar: {
    titulo: 'El programa torcido',
    enunciado: 'Este programa debería subir la escalera, pero el autómata se tuerce. Seguidlo paso a paso, encontrad el error de lógica y corregidlo: quitad bloques con **×** y pulsad sobre «Repetir» para añadir dentro.',
    nivel: {
      ancho: 5, alto: 5, inicio: { x: 0, y: 4, dir: 1 }, meta: { x: 4, y: 0 },
      muros: [[2, 4], [3, 4], [4, 4], [3, 3], [4, 3], [4, 2]], trampas: [[0, 2], [1, 1]],
    },
    bloques: ['avanzar', 'izquierda', 'derecha', 'repetir'],
    programa: [{ op: 'repetir', n: 4, cuerpo: [A, D, A, I] }],
    arreglado: [{ op: 'repetir', n: 4, cuerpo: [A, I, A, D] }],
  },

  pistas: {
    diagramas: 'El **atril de los diagramas** está en el lado oeste. Pulsad **E** junto a él.',
    tablero: 'El **tablero de los autómatas** está en el centro de la sala. Pulsad **E** para programar.',
    depurador: 'La **mesa del depurador** está en el lado este. Pulsad **E** junto a ella.',
    puerta: '¡La puerta del norte está abierta! Subid por la escalera.',
  },

  sellosRotos: [
    '¡Los tres sellos del taller están rotos! Los autómatas levantan la cabeza a la vez.',
    'Uno de ellos guarda un cilindro de música… y al girar, proyecta un **recuerdo**.',
  ],

  memoria: [
    'Morvath, encorvado sobre una mesa, programa autómatas noche tras noche. «No se cansan, no preguntan, no traicionan», dice.',
    'Aldric le trae un plato de sopa y se sienta a su lado. «Te enseñé a programar para que las máquinas ayudaran a la gente, no para sustituirla».',
    'Morvath no levanta la vista. «La gente falla. Mis autómatas, no».',
    'Se equivocaba: un autómata solo hace lo que le dicen. Si las instrucciones son malas, el resultado también. Seguid subiendo.',
  ],

  preguntas: [
    {
      id: 'p11-01', concepto: 'pensamiento', criterio: '4.1', tipo: 'opcion',
      texto: '¿Qué es un algoritmo?',
      opciones: ['Un tipo de ordenador', 'Una secuencia ordenada y finita de pasos para resolver un problema', 'Un lenguaje de programación', 'Un error del programa'],
      correcta: 1,
      explicacion: 'Un algoritmo son pasos precisos, en orden y que terminan. Después se escribe en un lenguaje de programación.',
    },
    {
      id: 'p11-02', concepto: 'pensamiento', criterio: '4.1', tipo: 'opcion',
      texto: 'Quedarse solo con lo importante de un problema e ignorar los detalles que no hacen falta es…',
      opciones: ['Abstracción', 'Descomposición', 'Compilación', 'Iteración'],
      correcta: 0,
      explicacion: 'La abstracción simplifica: un mapa de metro no dibuja cada calle, solo lo necesario.',
    },
    {
      id: 'p11-03', concepto: 'pensamiento', criterio: '4.2', tipo: 'opcion',
      texto: '¿Qué símbolo marca el inicio y el fin de un diagrama de flujo?',
      opciones: ['El óvalo', 'El rombo', 'El rectángulo', 'La flecha'],
      correcta: 0,
      explicacion: 'El óvalo (o rectángulo redondeado) marca dónde empieza y dónde acaba.',
    },
    {
      id: 'p11-04', concepto: 'programacion', criterio: '4.2', tipo: 'opcion',
      texto: '¿Qué estructura usarías para «repite estos pasos 10 veces»?',
      opciones: ['Un condicional (if)', 'Un bucle (for)', 'Una variable', 'Un comentario'],
      correcta: 1,
      explicacion: 'Un bucle for repite un bloque un número fijo de veces.',
    },
    {
      id: 'p11-05', concepto: 'programacion', criterio: '4.2', tipo: 'opcion',
      texto: '¿Qué estructura decide entre dos caminos según se cumpla una condición?',
      opciones: ['Secuencia', 'Bucle', 'Condicional (if / else)', 'Función'],
      correcta: 2,
      explicacion: 'El condicional ejecuta una parte u otra según la condición sea verdadera o falsa.',
    },
    {
      id: 'p11-06', concepto: 'programacion', criterio: '4.2', tipo: 'opcion',
      texto: '¿Qué pasa con un bucle «mientras» cuya condición nunca deja de cumplirse?',
      opciones: ['Termina enseguida', 'Se repite para siempre: es un bucle infinito', 'Se convierte en un if', 'Da un error de sintaxis'],
      correcta: 1,
      explicacion: 'Si la condición nunca cambia, el bucle no acaba. Hay que asegurarse de que algo la haga falsa.',
    },
    {
      id: 'p11-07', concepto: 'programacion', criterio: '4.2', tipo: 'opcion',
      texto: '¿Qué diferencia hay entre programar con bloques y escribir el código en JavaScript?',
      opciones: ['Ninguna en lo que hace el programa: cambia la forma de escribirlo', 'Los bloques no son programación', 'JavaScript no tiene bucles', 'Los bloques son más rápidos para el ordenador'],
      correcta: 0,
      explicacion: 'Los bloques y el código expresan las mismas estructuras (secuencia, bucle, condicional) con distinta forma.',
    },
    {
      id: 'p11-08', concepto: 'depuracion', criterio: '4.2', tipo: 'opcion',
      texto: 'Tu programa arranca, pero el personaje gira a la izquierda cuando debería girar a la derecha. ¿Qué tipo de error es?',
      opciones: ['De sintaxis', 'De lógica', 'Del ordenador', 'De conexión'],
      correcta: 1,
      explicacion: 'El programa funciona pero hace otra cosa: es un error de lógica. Se encuentra siguiéndolo paso a paso.',
    },
    {
      id: 'p11-09', concepto: 'depuracion', criterio: '4.2', tipo: 'opcion',
      texto: 'El programa no arranca y el intérprete marca la línea 7. ¿Qué tipo de error es probablemente?',
      opciones: ['De sintaxis', 'De lógica', 'De diseño gráfico', 'Ninguno'],
      correcta: 0,
      explicacion: 'Si ni siquiera arranca y te indica una línea, suele ser un error de sintaxis (algo mal escrito).',
    },
    {
      id: 'p11-10', concepto: 'depuracion', criterio: '4.2', tipo: 'opcion',
      texto: '¿Para qué sirve ejecutar un programa paso a paso?',
      opciones: ['Para que vaya más rápido', 'Para ver qué hace en cada momento y encontrar dónde se equivoca', 'Para borrar los errores solos', 'Para traducirlo a otro idioma'],
      correcta: 1,
      explicacion: 'Paso a paso se ve el estado del programa en cada instrucción y dónde empieza el fallo.',
    },
  ],
};
