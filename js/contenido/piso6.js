// Piso VI · La Forja de las Formas
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saberes II.1.2 «Diseño y modelado 3D» y II.1.3 «Realidad virtual y aumentada en el aprendizaje».
// Criterio de evaluación 2.1.

// El molde de la llave: caña + paletón − ojo + 2 dientes (unidades de la forja)
export const LLAVE = [
  { tipo: 'cilindro', op: 'sumar', x: 0.5, y: 0, z: 0, radio: 0.3, largo: 4, eje: 'x', nombre: 'Caña' },
  { tipo: 'caja', op: 'sumar', x: -2.2, y: 0, z: 0, ancho: 1.6, alto: 0.6, fondo: 1.6, nombre: 'Paletón' },
  { tipo: 'cilindro', op: 'restar', x: -2.2, y: 0, z: 0, radio: 0.4, largo: 0.8, eje: 'y', nombre: 'Ojo (se resta)' },
  { tipo: 'caja', op: 'sumar', x: 1.3, y: 0, z: -0.55, ancho: 0.4, alto: 0.6, fondo: 0.5, nombre: 'Diente 1' },
  { tipo: 'caja', op: 'sumar', x: 2.1, y: 0, z: -0.55, ancho: 0.4, alto: 0.6, fondo: 0.5, nombre: 'Diente 2' },
];

// Puntos de control: además del parecido, la llave tiene que estar hueca en el ojo
// y maciza en la caña, el paletón y los dientes
export const CONTROLES = [
  { punto: [-2.2, 0, 0], lleno: false, texto: 'El ojo del paletón está hueco' },
  { punto: [-2.2, 0, 0.65], lleno: true, texto: 'El paletón rodea el ojo' },
  { punto: [0.5, 0, 0], lleno: true, texto: 'La caña une el paletón con los dientes' },
  { punto: [1.3, 0, -0.65], lleno: true, texto: 'El primer diente' },
  { punto: [2.1, 0, -0.65], lleno: true, texto: 'El segundo diente' },
];

export default {
  id: 'piso6',
  nombre: 'Piso VI · La Forja de las Formas',
  criterios: ['2.1'],

  intro: [
    'Calor. Chispas. Un yunque enorme en el centro… Es **la Forja de las Formas**, donde Morvath fabrica sus cerraduras.',
    'La puerta de este piso no tiene sello mágico: tiene una **cerradura**. Y la única llave está en su cabeza. Tendremos que **forjarla**: diseñarla en 3D, como hacen los ingenieros de vuestro mundo.',
    'Tres sellos: **forjar la llave** en el yunque, **medir su malla** en el banco del este y **elegir la herramienta** adecuada en el altar del oeste.',
    'Junto a la entrada hay un **visor de realidades**. Os conviene mirar a través de él.',
  ],

  lecciones: {
    modelado: {
      titulo: 'Modelado 3D',
      resumen: 'Un objeto 3D se sitúa en tres ejes: X (ancho), Y (alto) y Z (fondo). Su superficie es una malla de vértices (puntos), aristas (líneas) y caras (polígonos). Se parte de primitivas (cubo, cilindro, esfera, cono) y se transforman: trasladar (mover), rotar (girar) y escalar (cambiar el tamaño). La extrusión estira una cara para crear volumen. Las operaciones booleanas combinan sólidos: unión (sumar), diferencia (restar) e intersección (quedarse con lo común).',
      paginas: [
        'En 3D todo se coloca con **tres ejes**: **X** (izquierda y derecha), **Y** (arriba y abajo) y **Z** (delante y detrás). En la forja los veréis en rojo, verde y azul.',
        'Casi todo se construye a partir de **primitivas**: cubos, cilindros, esferas, conos… A cada una se le aplican **transformaciones**: **trasladar** (moverla), **rotar** (girarla) y **escalar** (cambiarle el tamaño).',
        'Las piezas se combinan con **operaciones booleanas**: la **unión** suma dos sólidos, la **diferencia** le resta uno a otro (para hacer agujeros) y la **intersección** se queda con lo que tienen en común.',
        'Y otra herramienta clásica: la **extrusión**, que estira una forma plana para darle volumen, como la masa que sale de una churrera.',
      ],
      despues: [
        'En el yunque tenéis el **plano** de la llave: una **caña** (cilindro tumbado), un **paletón** (caja), un **ojo** (cilindro que se **resta**) y **dos dientes** (cajas pequeñas).',
        'Añadid piezas, escribid su posición y sus medidas y ved cómo se parecen al molde. Con un **85 %** de parecido, la llave encajará.',
      ],
    },
    mallas: {
      titulo: 'Mallas, formatos e impresión 3D',
      resumen: 'Toda malla cerrada cumple la fórmula de Euler: vértices − aristas + caras = 2 (un cubo: 8 − 12 + 6 = 2). Material: cómo refleja la luz (color, brillo, rugosidad) y texturas: imágenes pegadas sobre la malla. Render: calcular la imagen final con luces y cámara. Formatos: STL (solo la geometría, en triángulos; el estándar de la impresión 3D), OBJ (geometría con coordenadas de textura y materiales aparte, en el .mtl), glTF (pensado para la web y los juegos). Para imprimir, un laminador (Cura, PrusaSlicer) corta el modelo en capas y genera el G-code que sigue la impresora.',
      paginas: [
        'Cada pieza que forjáis es una **malla**. Una caja tiene **8 vértices**, **12 aristas** y **6 caras**. Hay una regla que cumple toda malla cerrada sin agujeros, la **fórmula de Euler**: vértices − aristas + caras = **2**.',
        'Encima de la malla van los **materiales** (color, brillo, rugosidad) y las **texturas** (imágenes pegadas sobre la superficie). El **render** calcula la imagen final con las luces y la cámara.',
        'Para guardar el modelo hay varios **formatos**: **STL** guarda solo la forma, en triángulos, y es el estándar de la impresión 3D; **OBJ** guarda además las coordenadas de textura (los materiales van en un archivo .mtl); y **glTF** está pensado para la web y los juegos, como este.',
        'Para **imprimir** en 3D, un programa **laminador** (Cura, PrusaSlicer) corta el modelo en capas finísimas y genera el **G-code**: las instrucciones que sigue la impresora, capa a capa.',
      ],
      despues: ['El banco de medidas os hará unas preguntas sobre mallas y formatos. Tenéis las cuentas de vuestra llave en la forja.'],
    },
    programas: {
      titulo: 'Programas de modelado 3D',
      resumen: 'Tinkercad: en el navegador, por bloques y formas; ideal para empezar. SketchUp: arquitectura y diseño de interiores. Blender: libre y gratuito; modelado orgánico, escultura, animación y render (cine y videojuegos). FreeCAD: libre; CAD paramétrico, piezas mecánicas con medidas exactas. Fusion 360: CAD profesional (licencias educativas). Cura o PrusaSlicer: laminadores, preparan el modelo para imprimirlo.',
      paginas: [
        'No hay un programa de 3D para todo. **Tinkercad** funciona en el navegador y se maneja con formas básicas: perfecto para empezar.',
        '**SketchUp** es el favorito de la **arquitectura** y el diseño de interiores. **Blender**, libre y gratuito, sirve para personajes, **escultura**, **animación** y render: se usa en cine y videojuegos.',
        '**FreeCAD**, también libre, es **CAD paramétrico**: piezas mecánicas con **medidas exactas** que se pueden cambiar después. Y **Cura** o **PrusaSlicer** no modelan: **laminan** el modelo para la impresora.',
      ],
      despues: ['Llegarán encargos al atril. Acercaos al emblema del programa adecuado y pulsad **E**. Tres aciertos seguidos rompen el sello.'],
    },
    realidades: {
      titulo: 'Realidad virtual, aumentada y mixta',
      resumen: 'Realidad virtual (RV): un mundo totalmente digital en el que te sumerges con unas gafas o un visor. Realidad aumentada (RA): capas digitales sobre el mundo real, vistas con el móvil o unas gafas (filtros, apps de museos, Pokémon GO). Realidad mixta (RM): los objetos digitales interactúan con el real. XR (realidad extendida) las engloba todas. En educación: visitas virtuales a lugares o al cuerpo humano, prácticas seguras (un laboratorio, un quirófano) y modelos 3D que se pueden girar en la mesa.',
      paginas: [
        'Mirad por el visor… Veis la forja, pero con runas flotando encima de cada herramienta. Eso es **realidad aumentada** (RA): capas digitales sobre el mundo real, como los filtros del móvil o las apps que explican un cuadro en un museo.',
        'Si el visor os tapara el mundo entero y os llevara a otro sitio, sería **realidad virtual** (RV): un mundo totalmente digital en el que os sumergís con unas gafas.',
        'Y si las runas pudieran chocar con el yunque y rebotar, sería **realidad mixta** (RM): lo digital interactúa con lo real. Todas juntas se llaman **XR**, realidad extendida.',
        'En clase sirven para cosas que serían imposibles o peligrosas: viajar dentro del cuerpo humano, practicar en un laboratorio sin riesgos o girar en la mesa un modelo 3D que habéis diseñado vosotros.',
      ],
    },
  },

  // ---------- Sello 2 · El banco de medidas ----------
  medidas: [
    {
      id: 'm-cubo', concepto: 'mallas', criterio: '2.1', tipo: 'numero',
      texto: '¿Cuántas aristas tiene un cubo?', valor: 12, tolerancia: 0, unidad: 'aristas',
      explicacion: '4 arriba, 4 abajo y 4 verticales: 12. Y se cumple Euler: 8 − 12 + 6 = 2.',
    },
    {
      id: 'm-euler', concepto: 'mallas', criterio: '2.1', tipo: 'numero',
      texto: 'Un prisma de base hexagonal tiene 12 vértices y 8 caras. Usando la fórmula de Euler (V − A + C = 2), ¿cuántas aristas tiene?',
      valor: 18, tolerancia: 0, unidad: 'aristas',
      explicacion: '12 − A + 8 = 2 → A = 18: 6 arriba, 6 abajo y 6 laterales.',
    },
    {
      id: 'm-stl', concepto: 'mallas', criterio: '2.1', tipo: 'opcion',
      texto: 'Vas a imprimir tu llave en la impresora 3D del instituto. ¿En qué formato la exportas?',
      opciones: ['STL', 'MP3', 'PNG', 'HTML'], correcta: 0,
      explicacion: 'STL guarda la forma en triángulos: es lo que entienden los laminadores de impresión 3D.',
    },
    {
      id: 'm-laminar', concepto: 'mallas', criterio: '2.1', tipo: 'opcion',
      texto: '¿Qué hace un programa laminador como Cura?',
      opciones: [
        'Pinta las texturas del modelo.',
        'Corta el modelo en capas y genera el G-code que sigue la impresora.',
        'Convierte el modelo en una foto.',
        'Anima el modelo.',
      ],
      correcta: 1, explicacion: 'La impresora 3D deposita el material capa a capa siguiendo las instrucciones del G-code.',
    },
  ],

  // ---------- Sello 3 · El altar de las herramientas ----------
  programas: {
    opciones: [
      { id: 'tinkercad', texto: 'Tinkercad', corto: 'Tinkercad', color: 0x4aa3ff },
      { id: 'sketchup', texto: 'SketchUp', corto: 'SketchUp', color: 0xd04a3a },
      { id: 'blender', texto: 'Blender', corto: 'Blender', color: 0xff8a2a },
      { id: 'freecad', texto: 'FreeCAD', corto: 'FreeCAD', color: 0xd6d6e6 },
      { id: 'cura', texto: 'Cura (laminador)', corto: 'Cura', color: 0x3ac0c0 },
    ],
    encargos: [
      { texto: 'Un estudio de **arquitectura** quiere una maqueta 3D de una casa terrera canaria con su patio.', correctas: ['sketchup'], bien: '**SketchUp** es el favorito de arquitectos e interioristas.' },
      { texto: 'Un estudio de videojuegos necesita **animar un personaje** y esculpir los detalles de su cara.', correctas: ['blender'], bien: '**Blender** modela, esculpe, anima y renderiza, y es libre y gratuito.' },
      { texto: 'Un taller necesita una **pieza mecánica con medidas exactas** que podrá cambiar más adelante.', correctas: ['freecad'], bien: '**FreeCAD** es CAD paramétrico: medidas exactas que se pueden modificar.' },
      { texto: 'Una clase de 1.º de ESO va a hacer **su primer diseño 3D**, desde el navegador y sin instalar nada.', correctas: ['tinkercad'], bien: '**Tinkercad** funciona en el navegador y se maneja con formas básicas.' },
      { texto: 'Ya tenéis el archivo **STL** de la llave y hay que convertirlo en **instrucciones para la impresora**.', correctas: ['cura'], bien: '**Cura** lamina el modelo en capas y genera el G-code.' },
      { texto: 'Una productora de cine de animación necesita el **render final** de una escena con luces y materiales.', correctas: ['blender'], bien: '**Blender** tiene motores de render profesionales.' },
    ],
    aciertosNecesarios: 3,
  },

  pistas: {
    llave: 'El **yunque** del centro abre la forja. Leed el **plano**: cada pieza tiene su posición (x, y, z) y sus medidas. El ojo se **resta**.',
    medidas: 'El **banco de medidas** está en el lado este. Recordad: vértices − aristas + caras = 2.',
    programas: 'El **altar de las herramientas** está en el oeste. Leed el encargo en el atril y acercaos al emblema adecuado.',
    puerta: '¡La cerradura ha cedido! Subid por la escalera del norte.',
  },

  sellosRotos: [
    '¡La llave encaja y los tres sellos de la forja están rotos!',
    'El metal todavía brilla… y en el reflejo aparece otro **recuerdo**.',
  ],

  memoria: [
    'Morvath, solo en esta forja, construye un **visor de realidades**: unas gafas que muestran a quien las lleva un Umbravel perfecto, limpio y en orden.',
    'Lo reparte gratis entre la gente. Pero el visor **tapa lo que no le gusta**: las plazas vacías, los libros que ha requisado, a las personas que protestan.',
    '«Si lo que ven es mejor que lo real», escribe, «¿para qué necesitan lo real?».',
    'Las realidades virtuales son maravillosas… cuando uno sabe que las lleva puestas. Recordadlo. Seguid subiendo.',
  ],

  preguntas: [
    {
      id: 'p6-01', concepto: 'modelado', criterio: '2.1', tipo: 'opcion',
      texto: 'En la forja, ¿qué eje indica la altura?', opciones: ['X', 'Y', 'Z', 'Ninguno'], correcta: 1,
      explicacion: 'X es el ancho, Y la altura y Z la profundidad (en muchos programas de CAD, Z es la altura: fijaos siempre).',
    },
    {
      id: 'p6-02', concepto: 'modelado', criterio: '2.1', tipo: 'opcion',
      texto: 'Para hacer el agujero de una llave a partir de un bloque, ¿qué operación booleana usas?',
      opciones: ['Unión', 'Diferencia (resta)', 'Intersección', 'Extrusión'], correcta: 1,
      explicacion: 'La diferencia le quita a un sólido el volumen de otro: perfecta para agujeros.',
    },
    {
      id: 'p6-03', concepto: 'modelado', criterio: '2.1', tipo: 'opcion',
      texto: '¿Qué transformación cambia el tamaño de un objeto?', opciones: ['Trasladar', 'Rotar', 'Escalar', 'Extruir'], correcta: 2,
      explicacion: 'Escalar agranda o encoge; trasladar mueve y rotar gira.',
    },
    {
      id: 'p6-04', concepto: 'modelado', criterio: '2.1', tipo: 'opcion',
      texto: 'Dibujas un círculo y lo estiras hacia arriba para convertirlo en un cilindro. ¿Cómo se llama esa operación?',
      opciones: ['Intersección', 'Extrusión', 'Render', 'Laminado'], correcta: 1,
      explicacion: 'La extrusión da volumen a una forma plana empujándola en una dirección.',
    },
    {
      id: 'p6-05', concepto: 'mallas', criterio: '2.1', tipo: 'numero',
      texto: '¿Cuántos vértices tiene un cubo?', valor: 8, tolerancia: 0, unidad: 'vértices',
      explicacion: 'Cuatro en la cara de arriba y cuatro en la de abajo.',
    },
    {
      id: 'p6-06', concepto: 'mallas', criterio: '2.1', tipo: 'opcion',
      texto: '¿Qué diferencia hay entre un material y una textura?',
      opciones: [
        'Son lo mismo.',
        'El material define cómo refleja la luz (color, brillo, rugosidad); la textura es una imagen pegada sobre la malla.',
        'La textura es el formato del archivo.',
        'El material solo existe en STL.',
      ],
      correcta: 1, explicacion: 'Un material puede usar texturas: por ejemplo, una imagen de madera como color.',
    },
    {
      id: 'p6-07', concepto: 'mallas', criterio: '2.1', tipo: 'opcion',
      texto: '¿Qué formato 3D está pensado para la web y los videojuegos, y es el que usa este juego?',
      opciones: ['STL', 'glTF', 'DOCX', 'MP4'], correcta: 1,
      explicacion: 'glTF guarda mallas, materiales, texturas y animaciones de forma compacta para cargarlos rápido.',
    },
    {
      id: 'p6-08', concepto: 'programas', criterio: '2.1', tipo: 'opcion',
      texto: '¿Qué programa elegirías para esculpir y animar un personaje, sin pagar licencia?',
      opciones: ['Tinkercad', 'Blender', 'Cura', 'Una hoja de cálculo'], correcta: 1,
      explicacion: 'Blender es libre y gratuito y cubre modelado, escultura, animación y render.',
    },
    {
      id: 'p6-09', concepto: 'programas', criterio: '2.1', tipo: 'opcion',
      texto: '¿Qué significa que un programa de CAD sea «paramétrico»?',
      opciones: [
        'Que solo funciona con internet.',
        'Que las medidas son parámetros que puedes cambiar y el modelo se actualiza solo.',
        'Que no permite medidas exactas.',
        'Que es de pago.',
      ],
      correcta: 1, explicacion: 'Cambias «largo = 40 mm» a 50 mm y toda la pieza se recalcula.',
    },
    {
      id: 'p6-10', concepto: 'realidades', criterio: '2.1', tipo: 'opcion',
      texto: 'Una app te muestra en el móvil cómo quedaría un sofá en tu salón real. ¿Qué es?',
      opciones: ['Realidad virtual', 'Realidad aumentada', 'Un render', 'Un laminador'], correcta: 1,
      explicacion: 'Añade objetos digitales sobre la imagen real: realidad aumentada.',
    },
    {
      id: 'p6-11', concepto: 'realidades', criterio: '2.1', tipo: 'opcion',
      texto: 'Con unas gafas que tapan tu vista por completo recorres una pirámide egipcia. ¿Qué es?',
      opciones: ['Realidad aumentada', 'Realidad virtual', 'Realidad mixta', 'Una videollamada'], correcta: 1,
      explicacion: 'Todo lo que ves es digital: realidad virtual.',
    },
    {
      id: 'p6-12', concepto: 'realidades', criterio: '2.1', tipo: 'opcion',
      texto: '¿Cuál es un buen uso educativo de la realidad virtual?',
      opciones: [
        'Sustituir todas las clases.',
        'Practicar en un laboratorio o un quirófano simulado sin riesgos.',
        'Copiar en los exámenes.',
        'Jugar sin límite de tiempo.',
      ],
      correcta: 1, explicacion: 'Permite practicar situaciones peligrosas, caras o imposibles de forma segura.',
    },
  ],
};
