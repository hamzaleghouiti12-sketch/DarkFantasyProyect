// Piso III · El Scriptorium Binario
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saber I.2 «Codificación de la información», criterio de evaluación 1.1.

export default {
  id: 'piso3',
  nombre: 'Piso III · El Scriptorium Binario',
  criterios: ['1.1'],

  intro: [
    'Velas, tinta y pergaminos… Este es **el Scriptorium**: aquí los escribas de Morvath copian todo lo que él roba.',
    'Pero no escriben con letras. Escriben con **unos y ceros**. Como vuestros ordenadores.',
    'Todo lo que guarda un ordenador, números, textos, fotos o canciones, acaba convertido en **bits**. Hoy aprenderéis cómo.',
    'Tres sellos: las **ocho palancas** (oeste), la **inscripción** del atril (este) y el **relicario de los formatos** (norte).',
  ],

  lecciones: {
    binario: {
      titulo: 'Sistemas de numeración',
      resumen: 'Decimal: base 10 (0-9). Binario: base 2 (0 y 1); cada posición vale el doble que la anterior: 128 64 32 16 8 4 2 1 en un byte. Para pasar de binario a decimal se suman los valores de las posiciones con 1. Hexadecimal: base 16 (0-9 y A-F); cada cifra equivale a 4 bits, así que un byte son 2 cifras (0x3C = 0011 1100). Octal: base 8, cada cifra son 3 bits.',
      paginas: [
        'Vosotros contáis en **base 10**: diez cifras, del 0 al 9. Los ordenadores cuentan en **base 2**, el **binario**: solo tienen 0 y 1, apagado o encendido.',
        'En binario, cada posición vale **el doble** que la de su derecha. En un byte (8 bits) las posiciones valen **128, 64, 32, 16, 8, 4, 2 y 1**.',
        'Para leer un número binario, sumad las posiciones que tienen un 1. **01001101** = 64 + 8 + 4 + 1 = **77**.',
        'Para escribir un número en binario, id restando las potencias de 2 de mayor a menor: 77 → cabe 64 (queda 13) → cabe 8 (queda 5) → cabe 4 (queda 1) → cabe 1.',
        'El binario es largo de leer, así que los informáticos usan el **hexadecimal** (base 16): cifras del 0 al 9 y letras de la **A (10)** a la **F (15)**. Cada cifra hexadecimal son exactamente **4 bits**: 0x3C = 0011 1100. También existe el **octal** (base 8), en el que cada cifra son 3 bits.',
      ],
      despues: [
        'Estas ocho palancas son un **byte**. Cada una es un bit: arriba vale 1, abajo vale 0. Encima tenéis el valor de cada posición.',
        'El atril os pide un número. Acercaos a cada palanca y pulsad **E** para moverla. El atril os muestra en vivo lo que vais escribiendo.',
      ],
    },
    complemento2: {
      titulo: 'Números negativos y reales',
      resumen: 'Complemento a 2: la forma habitual de guardar enteros con signo. Para escribir −n: se escribe n en binario, se invierten todos los bits y se suma 1 (−5 = 11111011). Si el primer bit es 1, el número es negativo. Con 8 bits: de −128 a 127 (sin signo: de 0 a 255). Los números con decimales se guardan en coma flotante (IEEE 754: signo, exponente y mantisa); por eso a veces hay pequeños errores (0,1 + 0,2 ≠ 0,3). Los booleanos son un solo bit: verdadero o falso.',
      paginas: [
        '¡Una puerta **roja**! Pide un número **negativo**. Pero las palancas solo tienen 0 y 1… no hay «signo menos».',
        'El truco se llama **complemento a 2**. Para escribir −5: primero 5 en binario, **00000101**. Después **invertid** todos los bits: **11111010**. Y por último **sumad 1**: **11111011**.',
        'Si el primer bit es 1, el número es negativo. Así, con 8 bits caben los números del **−128 al 127**, en vez del 0 al 255.',
        'Una curiosidad: los números con decimales se guardan en **coma flotante** (signo, exponente y mantisa, como la notación científica). Por eso a veces un ordenador calcula que 0,1 + 0,2 = 0,30000000000000004.',
      ],
    },
    texto: {
      titulo: 'Codificación de texto',
      resumen: 'Cada carácter se guarda como un número. ASCII: 7 bits, 128 caracteres (letras inglesas, cifras, signos): A = 65, a = 97, espacio = 32. No tiene ñ, tildes ni otros alfabetos. Unicode asigna un número (punto de código) a cada carácter de todos los idiomas y a los emojis. UTF-8 guarda esos números con 1 a 4 bytes: los caracteres ASCII ocupan 1 byte, la ñ ocupa 2 (C3 B1) y un emoji, 4.',
      paginas: [
        'Esta inscripción está escrita en números. Para un ordenador, **cada letra es un número**.',
        'El código más antiguo que se sigue usando es **ASCII**: 7 bits, 128 caracteres. La **A** es el 65, la **a** es el 97 y el espacio es el 32. En el atril tenéis la tabla.',
        'Pero ASCII se inventó en inglés: no tiene **ñ**, ni tildes, ni otros alfabetos, ni emojis.',
        'Por eso existe **Unicode**: un número distinto para **cada carácter de todos los idiomas** del mundo, y también para los emojis.',
        'Y para guardar esos números se usa **UTF-8**: los caracteres de ASCII ocupan **1 byte**, la ñ ocupa **2** (C3 B1) y un emoji ocupa **4**. Así un texto en inglés ocupa lo mismo que en ASCII, pero cabe todo lo demás.',
      ],
      despues: ['Descifrad la inscripción. Usad la tabla del atril: cada número es una letra.'],
    },
    multimedia: {
      titulo: 'Imagen, audio y vídeo digitales',
      resumen: 'Imagen de mapa de bits: píxeles; peso = ancho × alto × profundidad de color (24 bits = 3 bytes por píxel, RGB). Vectorial (SVG): formas y fórmulas, se amplía sin perder calidad. Audio: muestreo (44.100 muestras/s en CD) × bits por muestra (16) × canales (2 en estéreo) × segundos. Vídeo: fotogramas por segundo, resolución y bitrate; el códec comprime (H.264, H.265, AV1) y el contenedor lo empaqueta (MP4, MKV). Compresión sin pérdida (PNG, FLAC, ZIP): se recupera todo. Con pérdida (JPG, MP3, AAC): descarta lo que apenas se percibe y ocupa mucho menos.',
      paginas: [
        'El relicario guarda imágenes y sonidos. Para un ordenador, también son números.',
        'Una imagen de **mapa de bits** es una cuadrícula de **píxeles**. Cada píxel guarda su color en **RGB**: rojo, verde y azul. Con **24 bits** de profundidad (3 bytes) hay más de 16 millones de colores.',
        'Por eso una imagen sin comprimir pesa **ancho × alto × bytes por píxel**. Una **vectorial** (como SVG) no guarda píxeles, sino **formas**: se puede ampliar sin que se pixele.',
        'El sonido se **muestrea**: se mide la onda muchas veces por segundo. Un CD usa **44.100 muestras por segundo**, de **16 bits** cada una, en **2 canales** (estéreo). Peso = muestreo × bytes por muestra × canales × segundos.',
        'El vídeo son muchas imágenes por segundo (**fps**) con sonido. El **códec** es el método que lo comprime (H.264, H.265, AV1) y el **contenedor** es la «caja» que lo guarda todo junto (MP4, MKV). No es lo mismo.',
        'Y la **compresión**: **sin pérdida** (PNG, FLAC, ZIP) permite recuperar el archivo exacto; **con pérdida** (JPG, MP3) descarta detalles que casi no se notan y ocupa muchísimo menos.',
      ],
      despues: ['Primero, el relicario os pedirá **calcular dos pesos**. Después, llevad cada **tomo de formato** a su estantería: **con pérdida** o **sin pérdida**.'],
    },
  },

  // ---------- Sello 1 · Las ocho palancas: tres puertas en serie ----------
  palancas: {
    puertas: [
      { objetivo: 77, modo: 'decimal', texto: 'Escribid el número **77** en binario.', bien: '77 = 64 + 8 + 4 + 1 → 01001101.' },
      { objetivo: 0x3c, modo: 'hex', texto: 'Escribid el número hexadecimal **0x3C** en binario.', bien: '3 → 0011 y C (12) → 1100: 0x3C = 00111100 = 60.' },
      { objetivo: -5, modo: 'negativo', texto: 'La puerta roja: escribid **−5** en complemento a 2 (8 bits).', bien: '5 = 00000101 → invertido 11111010 → +1 = 11111011.' },
    ],
  },

  // ---------- Sello 2 · La inscripción ----------
  inscripcion: [
    {
      id: 'i-hola', concepto: 'texto', criterio: '1.1', tipo: 'texto',
      texto: 'La inscripción dice: 72 111 108 97. ¿Qué palabra es? (usad la tabla ASCII del atril)',
      aceptadas: ['hola'], esperada: 'Hola',
      explicacion: '72 = H, 111 = o, 108 = l, 97 = a. La H es mayúscula (72) y las demás, minúsculas.',
    },
    {
      id: 'i-mayus', concepto: 'texto', criterio: '1.1', tipo: 'numero',
      texto: 'En ASCII, la «a» es el 97 y la «A» es el 65. ¿Qué número tiene la «M» mayúscula?',
      valor: 77, tolerancia: 0, unidad: '',
      explicacion: 'Las mayúsculas van seguidas desde A = 65: M es la 13.ª letra, así que 65 + 12 = 77. (¡El mismo número de la primera palanca!)',
    },
    {
      id: 'i-utf8', concepto: 'texto', criterio: '1.1', tipo: 'opcion',
      texto: 'Al final de la inscripción hay una «ñ». En UTF-8 se guarda como C3 B1. ¿Por qué ocupa 2 bytes?',
      opciones: [
        'Porque la ñ es una letra más difícil.',
        'Porque no está en ASCII: UTF-8 usa 1 byte para los caracteres ASCII y más bytes para el resto.',
        'Porque todas las letras ocupan 2 bytes en UTF-8.',
        'Porque está en mayúscula.',
      ],
      correcta: 1,
      explicacion: 'UTF-8 mantiene 1 byte para los 128 caracteres de ASCII y usa 2, 3 o 4 bytes para todos los demás.',
    },
    {
      id: 'i-emoji', concepto: 'texto', criterio: '1.1', tipo: 'opcion',
      texto: 'La última runa es un emoji: 🔥. ¿En qué código se puede representar?',
      opciones: ['En ASCII, que tiene 128 caracteres', 'En Unicode (por ejemplo, codificado en UTF-8 con 4 bytes)', 'En binario puro, sin ningún código', 'En hexadecimal, que tiene letras'],
      correcta: 1,
      explicacion: 'Unicode da un número a cada emoji (🔥 es U+1F525) y UTF-8 lo guarda en 4 bytes. ASCII no llega.',
    },
  ],

  // ---------- Sello 3 · El relicario de los formatos ----------
  relicario: {
    pesos: [
      {
        id: 'r-imagen', concepto: 'multimedia', criterio: '1.1', tipo: 'numero',
        texto: 'Una foto de 1920 × 1080 píxeles con 24 bits de color, sin comprimir. ¿Cuántos bytes pesa?',
        valor: 6220800, tolerancia: 0, unidad: 'bytes',
        explicacion: '1920 × 1080 = 2.073.600 píxeles × 3 bytes (24 bits) = 6.220.800 bytes, unos 5,93 MiB.',
      },
      {
        id: 'r-audio', concepto: 'multimedia', criterio: '1.1', tipo: 'numero',
        texto: 'Una canción de 3 minutos con calidad de CD (44.100 Hz, 16 bits, estéreo) sin comprimir. ¿Cuántos MB pesa? (1 MB = 1.000.000 bytes; redondead a dos decimales)',
        valor: 31.75, tolerancia: 0.1, unidad: 'MB',
        explicacion: '180 s × 44.100 × 2 bytes × 2 canales = 31.752.000 bytes ≈ 31,75 MB. En MP3 ocuparía unos 3 MB.',
      },
    ],
    // tomos que hay que llevar a su estantería
    tomos: [
      { id: 'jpg', texto: 'JPG', destino: 'con', porque: 'JPG descarta detalles de la imagen que el ojo apenas nota.' },
      { id: 'mp3', texto: 'MP3', destino: 'con', porque: 'MP3 elimina sonidos que el oído casi no percibe.' },
      { id: 'h264', texto: 'Vídeo H.264', destino: 'con', porque: 'H.264 es un códec de vídeo con pérdida: por eso los vídeos caben en el móvil.' },
      { id: 'png', texto: 'PNG', destino: 'sin', porque: 'PNG comprime sin perder ni un píxel: ideal para capturas y logotipos.' },
      { id: 'flac', texto: 'FLAC', destino: 'sin', porque: 'FLAC comprime el audio sin perder calidad: se recupera exacto.' },
      { id: 'zip', texto: 'ZIP', destino: 'sin', porque: 'Un ZIP tiene que devolver los archivos exactos: sin pérdida, siempre.' },
    ],
    estanterias: [
      { id: 'con', texto: 'Con pérdida' },
      { id: 'sin', texto: 'Sin pérdida' },
    ],
  },

  pistas: {
    palancas: 'Las **ocho palancas** están en el lado oeste. Leed el atril y moved las palancas con **E**: arriba = 1, abajo = 0.',
    inscripcion: 'La **inscripción** está en el atril del lado este. La tabla ASCII está a su lado.',
    relicario: 'El **relicario** está al norte. Primero los dos pesos y después los tomos: **E** para coger un tomo y **E** junto a una estantería para dejarlo.',
    puerta: '¡La puerta del norte está abierta! Subid por la escalera.',
  },

  sellosRotos: [
    '¡Los tres sellos del Scriptorium están rotos!',
    'Mirad: la tinta de los escribas se está moviendo sola. Es otro **recuerdo**.',
  ],

  memoria: [
    'Morvath, ya adulto, estudia en este mismo scriptorium. Pasa las noches traduciendo el saber de Umbravel a un idioma de unos y ceros.',
    '«Si todo se convierte en números», escribe, «todo se puede copiar sin error. Y lo que se puede copiar… se puede guardar para siempre».',
    'Un joven mago le ayuda con los cálculos. Se ríen juntos cuando las cuentas salen. Ese joven… soy yo.',
    'Sí. Morvath y yo fuimos amigos. Os lo debería haber contado antes. Subid: arriba entenderéis por qué dejamos de serlo.',
  ],

  preguntas: [
    {
      id: 'p3-01', concepto: 'binario', criterio: '1.1', tipo: 'numero',
      texto: '¿Qué número decimal es el binario 00001010?', valor: 10, tolerancia: 0, unidad: '',
      explicacion: '8 + 2 = 10.',
    },
    {
      id: 'p3-02', concepto: 'binario', criterio: '1.1', tipo: 'numero',
      texto: '¿Cuál es el mayor número que cabe en un byte (8 bits) sin signo?', valor: 255, tolerancia: 0, unidad: '',
      explicacion: '11111111 = 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255. Hay 256 valores: del 0 al 255.',
    },
    {
      id: 'p3-03', concepto: 'binario', criterio: '1.1', tipo: 'opcion',
      texto: '¿Cuántos bits representa cada cifra hexadecimal?',
      opciones: ['2', '4', '8', '16'], correcta: 1,
      explicacion: 'Con 4 bits hay 16 combinaciones: justo las cifras 0-9 y A-F.',
    },
    {
      id: 'p3-04', concepto: 'binario', criterio: '1.1', tipo: 'numero',
      texto: '¿Qué número decimal es el hexadecimal 0xFF?', valor: 255, tolerancia: 0, unidad: '',
      explicacion: 'F = 15: 15 × 16 + 15 = 255, que es 11111111 en binario.',
    },
    {
      id: 'p3-05', concepto: 'complemento2', criterio: '1.1', tipo: 'opcion',
      texto: 'En complemento a 2 con 8 bits, ¿qué indica que el primer bit sea 1?',
      opciones: ['Que el número es par', 'Que el número es negativo', 'Que el número es mayor que 100', 'Que hay un error'],
      correcta: 1, explicacion: 'El bit de más a la izquierda hace de signo: si es 1, el número es negativo.',
    },
    {
      id: 'p3-06', concepto: 'complemento2', criterio: '1.1', tipo: 'opcion',
      texto: '¿Qué rango de números enteros cabe en 8 bits con complemento a 2?',
      opciones: ['De 0 a 255', 'De −255 a 255', 'De −128 a 127', 'De −127 a 128'],
      correcta: 2, explicacion: 'Siguen siendo 256 valores, pero la mitad son negativos: de −128 a 127.',
    },
    {
      id: 'p3-07', concepto: 'complemento2', criterio: '1.1', tipo: 'opcion',
      texto: '¿Por qué un ordenador puede calcular que 0,1 + 0,2 = 0,30000000000000004?',
      opciones: [
        'Porque el procesador está estropeado.',
        'Porque en coma flotante algunos decimales no se pueden guardar exactos en binario.',
        'Porque redondea siempre hacia arriba.',
        'Porque suma en hexadecimal.',
      ],
      correcta: 1, explicacion: '0,1 en binario es un número infinito (como 1/3 en decimal), así que se guarda aproximado.',
    },
    {
      id: 'p3-08', concepto: 'texto', criterio: '1.1', tipo: 'opcion',
      texto: '¿Cuántos caracteres distintos tiene el código ASCII original (7 bits)?',
      opciones: ['64', '128', '256', 'Más de un millón'], correcta: 1,
      explicacion: '2⁷ = 128 caracteres: letras inglesas, cifras, signos y caracteres de control.',
    },
    {
      id: 'p3-09', concepto: 'texto', criterio: '1.1', tipo: 'opcion',
      texto: '¿Qué diferencia hay entre Unicode y UTF-8?',
      opciones: [
        'Son dos nombres para lo mismo.',
        'Unicode asigna un número a cada carácter; UTF-8 es una forma de guardar esos números en bytes.',
        'UTF-8 es más antiguo que ASCII.',
        'Unicode solo sirve para emojis.',
      ],
      correcta: 1, explicacion: 'Unicode es el «catálogo» de caracteres y UTF-8, la forma más usada de codificarlos.',
    },
    {
      id: 'p3-10', concepto: 'multimedia', criterio: '1.1', tipo: 'opcion',
      texto: '¿Qué ventaja tiene una imagen vectorial (SVG) frente a un mapa de bits (PNG)?',
      opciones: [
        'Que admite fotografías con más detalle.',
        'Que se puede ampliar sin perder calidad, porque guarda formas y no píxeles.',
        'Que siempre ocupa más.',
        'Que no tiene colores.',
      ],
      correcta: 1, explicacion: 'El vectorial guarda fórmulas geométricas: al ampliar, se vuelven a dibujar nítidas. Ideal para logotipos.',
    },
    {
      id: 'p3-11', concepto: 'multimedia', criterio: '1.1', tipo: 'opcion',
      texto: 'En un archivo «pelicula.mp4» con vídeo H.264, ¿qué es cada cosa?',
      opciones: [
        'MP4 es el códec y H.264 el contenedor.',
        'MP4 es el contenedor y H.264 el códec que comprime el vídeo.',
        'Los dos son contenedores.',
        'Los dos son códecs de audio.',
      ],
      correcta: 1, explicacion: 'El contenedor (MP4, MKV) guarda juntos el vídeo, el audio y los subtítulos; el códec (H.264, AV1) es cómo se comprime.',
    },
    {
      id: 'p3-12', concepto: 'multimedia', criterio: '1.1', tipo: 'opcion',
      texto: 'Tienes que enviar el logotipo del instituto con transparencia y bordes perfectos. ¿Qué formato de mapa de bits eliges?',
      opciones: ['JPG', 'PNG', 'MP3', 'MP4'], correcta: 1,
      explicacion: 'PNG no pierde calidad y admite transparencia. JPG emborronaría los bordes.',
    },
    {
      id: 'p3-13', concepto: 'multimedia', criterio: '1.1', tipo: 'numero',
      texto: '¿Cuántos bytes ocupa un píxel con 24 bits de profundidad de color?', valor: 3, tolerancia: 0, unidad: 'bytes',
      explicacion: '24 bits ÷ 8 = 3 bytes: uno para el rojo, otro para el verde y otro para el azul.',
    },
    {
      id: 'p3-14', concepto: 'multimedia', criterio: '1.1', tipo: 'opcion',
      texto: 'Si reduces la frecuencia de muestreo de un audio de 44.100 Hz a 22.050 Hz, ¿qué pasa?',
      opciones: ['Ocupa el doble', 'Ocupa la mitad y se pierden los sonidos más agudos', 'No cambia nada', 'Pasa a ser vídeo'],
      correcta: 1, explicacion: 'Con la mitad de muestras por segundo, el archivo pesa la mitad, pero ya no se pueden representar los agudos más altos.',
    },
  ],
};
