// Piso II · La Bóveda de la Memoria
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saber I.1 «Almacenamiento», criterio de evaluación 1.1.
// Todo el texto del piso vive aquí para que un docente pueda revisarlo sin tocar el motor.

export default {
  id: 'piso2',
  nombre: 'Piso II · La Bóveda de la Memoria',
  criterios: ['1.1'],

  intro: [
    'La escalera termina en una sala helada. Estantes, cofres, arcones… Esto es **la Bóveda de la Memoria**.',
    'Morvath guarda aquí todo lo que ha robado: libros, recuerdos, secretos. Pero la bóveda se está desmoronando. Lo que se guarda mal, **se pierde**.',
    'En vuestro mundo pasa lo mismo con los datos: fotos, trabajos, la memoria de una empresa entera. Hoy aprenderéis **dónde guardarlos**, **cuánto ocupan** y **cómo no perderlos nunca**.',
    'Tres sellos, como abajo: el **altar de los soportes** (oeste), la **balanza de las unidades** (este) y la **cripta 3-2-1** (norte, junto al gran cofre).',
  ],

  lecciones: {
    almacenamiento: {
      titulo: 'Soportes de almacenamiento',
      resumen: 'Memoria principal (RAM): rápida y volátil, se borra al apagar. Memoria secundaria: guarda los datos sin corriente. HDD: platos magnéticos, barato por GB, grande y más lento, sensible a golpes. SSD: memoria flash, sin partes móviles; SATA (~550 MB/s) o NVMe por PCIe (3.000-7.000 MB/s o más). Ópticos (Blu-ray 25-100 GB): lectura láser, distribución y archivo. Flash extraíble (pendrive, SD): pequeño y portátil. Cinta (LTO): enorme capacidad, el más barato por GB y dura décadas, pero se lee en orden (lenta). NAS: discos compartidos en la red local. Nube: servidores de otro por internet; desde cualquier sitio, pero depende de la conexión y del proveedor. Se elige por capacidad, velocidad, durabilidad, precio por GB y portabilidad.',
      paginas: [
        'Antes de guardar un recuerdo hay que elegir **dónde**. En vuestro mundo hay dos tipos de memoria.',
        'La **memoria principal** (la RAM) es rapidísima, pero **volátil**: al apagar el ordenador, se borra. La **memoria secundaria** guarda los datos aunque no haya corriente. De esa hablaremos.',
        'El **disco duro (HDD)** guarda los datos en platos magnéticos que giran. Es **barato por gigabyte** y tiene mucha capacidad, pero es más lento y un golpe puede estropearlo: tiene piezas móviles.',
        'El **SSD** usa memoria **flash**, sin piezas móviles. Hay dos familias: el **SSD SATA**, que usa el mismo conector que los discos duros y llega a unos **550 MB/s**, y el **SSD NVMe**, que va por **PCIe** y supera los **3.000-7.000 MB/s**. Eso sí, necesita una ranura M.2 compatible.',
        'Los **ópticos** (CD, DVD, **Blu-ray** de 25 a 100 GB) se leen con un láser. Hoy se usan sobre todo para **distribuir** películas o juegos y para archivo.',
        'La **memoria flash extraíble** (**pendrive**, tarjeta **SD**) es pequeña y portátil: ideal para llevar datos encima o para cámaras y móviles. Y fácil de perder.',
        'La **cinta magnética** (LTO) parece antigua, pero las grandes empresas la usan: **enorme capacidad**, el **precio por GB más bajo** y dura **décadas**. Su pega: se lee en orden, así que encontrar un archivo es lento.',
        'Un **NAS** es una cajita con discos conectada a la **red local**: todos los ordenadores de casa o de la oficina comparten sus archivos. La **nube** son servidores de otra empresa a los que accedes por **internet**: desde cualquier sitio, pero dependes de la conexión, del proveedor… y de sus condiciones de privacidad.',
        'Para elegir, pensad siempre en cinco cosas: **capacidad, velocidad, durabilidad, precio por GB y portabilidad**. No hay un soporte perfecto: hay uno adecuado para cada encargo.',
      ],
      despues: [
        'Sobre el atril aparece un **encargo**. Leedlo y acercaos al pedestal del soporte que mejor lo resuelva; pulsad **E** para ofrecerlo.',
        'Tenéis que acertar **tres encargos seguidos**. Si falláis, el contador vuelve a cero y llega un encargo nuevo.',
      ],
    },
    unidades: {
      titulo: 'Unidades de información',
      resumen: 'bit: un 0 o un 1. byte: 8 bits. Prefijos del SI (decimales): kB = 1.000 B, MB = 1.000 kB, GB, TB, PB. Prefijos binarios (IEC): KiB = 1.024 B, MiB, GiB, TiB. Los fabricantes venden en decimal y Windows cuenta en binario (aunque escriba «GB»): 1 TB = 10¹² B ≈ 931,3 GiB. Las velocidades de red van en bits (Mb/s): divide entre 8 para pasar a MB/s.',
      paginas: [
        'La unidad más pequeña es el **bit**: un 0 o un 1. Ocho bits forman un **byte**, lo que ocupa más o menos una letra.',
        'Luego vienen los múltiplos: **kilobyte, megabyte, gigabyte, terabyte y petabyte**. En el **Sistema Internacional** cada salto es de **1.000**: 1 kB = 1.000 bytes, 1 MB = 1.000 kB…',
        'Pero los ordenadores cuentan en potencias de 2. Por eso existen los prefijos **binarios**: 1 **KiB** (kibibyte) = **1.024** bytes, 1 MiB = 1.024 KiB, 1 GiB = 1.024 MiB…',
        'Aquí está el misterio del disco «encogido». El fabricante vende **1 TB = 1.000.000.000.000 bytes**. Windows lo divide entre 1.024 tres veces y muestra unos **931 GB**… que en realidad son **931 GiB**. Nadie os ha robado nada.',
        'Un último truco: las velocidades de internet se miden en **bits por segundo** (Mb/s) y los archivos en **bytes** (MB). Para pasar de uno a otro, **dividid entre 8**: una fibra de 600 Mb/s descarga, como mucho, 75 MB por segundo.',
      ],
      despues: [
        'La balanza os pedirá primero **ordenar las unidades** de menor a mayor y después tres **conversiones**. Escribid solo el número.',
      ],
    },
    copias: {
      titulo: 'Copias de seguridad y regla 3-2-1',
      resumen: 'Regla 3-2-1: 3 copias de los datos (contando el original), en 2 soportes de tipo distinto, y 1 fuera del lugar (otra sede o la nube). Otra carpeta del mismo disco no es una copia. Completa: copia todo. Incremental: solo lo cambiado desde la última copia (de cualquier tipo); rápida y pequeña, pero para restaurar hacen falta la completa y todas las incrementales. Diferencial: lo cambiado desde la última completa; crece cada día, y para restaurar basta la completa y la última diferencial. Cifrad las copias y probad a restaurarlas.',
      paginas: [
        'Esta cripta guarda el recuerdo más valioso de la bóveda. Y un recuerdo con **una sola copia** está a un accidente de desaparecer: un disco que falla, un robo, un incendio, un **ransomware** que lo cifra todo…',
        'Los profesionales siguen la **regla 3-2-1**: **3 copias** de los datos (contando el original), en **2 soportes de tipo distinto** y **1 fuera** del lugar: en otra sede o en la nube.',
        'Ojo con las trampas: **otra carpeta del mismo disco no es una copia**. Si el disco muere, mueren las dos.',
        'Hay tres formas de hacer copias. La **completa** lo copia todo: es lenta y ocupa mucho, pero restaurar es sencillo.',
        'La **incremental** solo copia lo que ha cambiado desde la **última copia**, sea del tipo que sea. Es rápida y pequeña, pero para restaurar necesitas la completa **y todas** las incrementales posteriores.',
        'La **diferencial** copia lo que ha cambiado desde la **última completa**. Cada día ocupa un poco más, pero para restaurar solo necesitas la completa y **la última** diferencial.',
        'Y dos consejos de archimago: **cifrad** las copias que salen de casa y **probad a restaurarlas** de vez en cuando. Una copia que nunca se ha probado es solo una esperanza.',
      ],
      despues: [
        'Sobre el pedestal flotan **tres orbes**: las copias del recuerdo. Cogedlos con **E** y dejadlos en los receptáculos, también con **E**.',
        'Cuando estén los tres colocados, la cripta comprobará si cumplís la regla **3-2-1**.',
      ],
    },
  },

  // ---------- Sello 1 · El altar de los soportes ----------
  soportes: {
    opciones: [
      { id: 'hdd', corto: 'HDD', texto: 'Disco duro (HDD)', simbolo: 'disco', porque: 'El HDD da mucha capacidad a buen precio, pero es lento y delicado con los golpes.' },
      { id: 'ssd_sata', corto: 'SSD SATA', texto: 'SSD SATA', simbolo: 'cristal', porque: 'El SSD SATA es rápido (unos 550 MB/s) y usa el conector de siempre de los discos duros.' },
      { id: 'ssd_nvme', corto: 'SSD NVMe', texto: 'SSD NVMe', simbolo: 'cristalVivo', porque: 'El SSD NVMe es el más rápido (miles de MB/s por PCIe), pero necesita una ranura M.2 compatible.' },
      { id: 'cinta', corto: 'Cinta LTO', texto: 'Cinta magnética (LTO)', simbolo: 'rollo', porque: 'La cinta es la más barata por GB y dura décadas, pero se lee en orden: es lentísima para consultar.' },
      { id: 'bluray', corto: 'Blu-ray', texto: 'Disco Blu-ray', simbolo: 'optico', porque: 'El Blu-ray guarda entre 25 y 100 GB y sirve para distribuir o archivar, pero no para trabajar a diario.' },
      { id: 'pendrive', corto: 'Pendrive', texto: 'Pendrive', simbolo: 'amuleto', porque: 'El pendrive es pequeño y portátil, pero se pierde con facilidad y no está pensado para guardar datos durante años.' },
      { id: 'sd', corto: 'Tarjeta SD', texto: 'Tarjeta SD', simbolo: 'tarjeta', porque: 'La tarjeta SD es diminuta: está pensada para cámaras, móviles y consolas portátiles.' },
      { id: 'nas', corto: 'NAS', texto: 'NAS (disco en red)', simbolo: 'cofreAntena', porque: 'El NAS comparte discos en la red local: útil en casa o en la oficina, pero no desde cualquier lugar sin configurarlo.' },
      { id: 'nube', corto: 'Nube', texto: 'La nube', simbolo: 'nube', porque: 'La nube se usa desde cualquier sitio y facilita colaborar, pero depende de internet y del proveedor.' },
    ],
    encargos: [
      {
        texto: 'Una fotógrafa dispara en ráfaga durante sus viajes y necesita dónde guardar las fotos **dentro de la cámara**.',
        correctas: ['sd'],
        bien: 'La **tarjeta SD** es diminuta, rápida para escribir ráfagas y es lo que usan las cámaras.',
        pista: 'Pensad en el tamaño: tiene que caber en una ranura de la cámara.',
      },
      {
        texto: 'El archivo histórico de Canarias debe guardar **500 TB** durante **30 años** gastando lo mínimo. Casi nunca se consulta.',
        correctas: ['cinta'],
        bien: 'La **cinta LTO** tiene el precio por GB más bajo y dura décadas. Que sea lenta da igual si casi nunca se consulta.',
        pista: 'Lo importante aquí es el precio por GB y la durabilidad, no la velocidad.',
      },
      {
        texto: 'Un estudiante quiere que su portátil nuevo, con ranura M.2, **arranque y abra los programas lo más rápido posible**.',
        correctas: ['ssd_nvme'],
        bien: 'El **SSD NVMe** va por PCIe y es el más rápido. Y su portátil tiene la ranura M.2 que necesita.',
        pista: '«Lo más rápido posible» y además tiene ranura M.2…',
      },
      {
        texto: 'Una familia quiere guardar **4 TB de vídeos** caseros en su ordenador de sobremesa **gastando poco**. La velocidad no le importa.',
        correctas: ['hdd'],
        bien: 'El **disco duro** da muchos terabytes por poco dinero. Para vídeos que se ven de vez en cuando, su lentitud no importa.',
        pista: 'Mucha capacidad, poco dinero y la velocidad da igual.',
      },
      {
        texto: 'Un grupo de trabajo tiene que **editar los mismos documentos** desde casa, desde el instituto y desde el móvil.',
        correctas: ['nube'],
        bien: 'La **nube** permite acceder y colaborar desde cualquier lugar con conexión a internet.',
        pista: 'Tiene que funcionar desde varios lugares a la vez.',
      },
      {
        texto: 'Una pequeña empresa quiere que sus 5 ordenadores **compartan archivos en la red de la oficina**, sin depender de internet.',
        correctas: ['nas'],
        bien: 'Un **NAS** comparte sus discos con todos los equipos de la red local, aunque se caiga internet.',
        pista: 'Compartir, sí, pero dentro de la oficina y sin internet.',
      },
      {
        texto: 'Tienes que llevar tu presentación al instituto **en el bolsillo** por si allí no hay internet.',
        correctas: ['pendrive'],
        bien: 'El **pendrive** es pequeño, se conecta por USB a cualquier ordenador y no necesita internet.',
        pista: 'Tiene que viajar contigo y conectarse a cualquier ordenador.',
      },
      {
        texto: 'Una productora quiere **vender en tiendas** su película en alta definición en un **soporte físico**.',
        correctas: ['bluray'],
        bien: 'El **Blu-ray** es el soporte óptico con capacidad para películas en alta definición, y es barato de fabricar en serie.',
        pista: 'Se vende en una caja, en una tienda, y se reproduce con un láser.',
      },
      {
        texto: 'Un portátil antiguo **solo tiene conector SATA** (no tiene ranura M.2). Su dueño quiere cambiar el disco duro para que vaya **mucho más rápido**.',
        correctas: ['ssd_sata'],
        bien: 'El **SSD SATA** usa el mismo conector que el disco duro viejo y es muchísimo más rápido. Un NVMe no cabría.',
        pista: 'Fijaos en el conector que tiene ese portátil.',
      },
    ],
    aciertosNecesarios: 3,
  },

  // ---------- Sello 2 · La balanza de las unidades ----------
  balanza: {
    orden: {
      id: 'b-orden', concepto: 'unidades', criterio: '1.1', tipo: 'orden',
      texto: 'Ordenad las unidades de la más pequeña a la más grande.',
      opciones: ['bit', 'byte', 'kilobyte (kB)', 'megabyte (MB)', 'gigabyte (GB)', 'terabyte (TB)', 'petabyte (PB)'],
      explicacion: 'bit → byte (8 bits) → kB → MB → GB → TB → PB. Cada prefijo multiplica por 1.000 (o por 1.024 en los prefijos binarios).',
    },
    conversiones: [
      {
        id: 'b-mb', concepto: 'unidades', criterio: '1.1', tipo: 'numero',
        texto: 'Una película ocupa 3,5 GB. ¿Cuántos MB son? (prefijos del SI: 1 GB = 1.000 MB)',
        valor: 3500, tolerancia: 0, unidad: 'MB',
        explicacion: '3,5 × 1.000 = 3.500 MB.',
      },
      {
        id: 'b-tib', concepto: 'unidades', criterio: '1.1', tipo: 'numero',
        texto: 'Compras un disco de 1 TB (10¹² bytes). ¿Cuántos «GB» muestra Windows, que en realidad cuenta en GiB? Redondead a un decimal.',
        valor: 931.3, tolerancia: 0.5, unidad: 'GiB',
        explicacion: '10¹² ÷ 1.024³ = 931,3 GiB. El disco no ha encogido: solo cambia la forma de contar.',
      },
      {
        id: 'b-kib', concepto: 'unidades', criterio: '1.1', tipo: 'numero',
        texto: '¿Cuántos bytes hay en 2 KiB?',
        valor: 2048, tolerancia: 0, unidad: 'bytes',
        explicacion: '1 KiB = 1.024 bytes, así que 2 KiB = 2.048 bytes.',
      },
    ],
  },

  // ---------- Sello 3 · La cripta 3-2-1 ----------
  // Cada receptáculo es un lugar donde dejar una copia. «dispositivo» identifica
  // el aparato físico: dos copias en el mismo aparato cuentan como una.
  cripta: {
    orbes: 3,
    receptaculos: [
      { id: 'disco', texto: 'Disco duro del taller', tipo: 'disco', dispositivo: 'hdd1', fuera: false, pieza: 'trunk_large_B' },
      { id: 'carpeta', texto: 'Otra carpeta del mismo disco', tipo: 'disco', dispositivo: 'hdd1', fuera: false, pieza: 'trunk_large_C' },
      { id: 'externo', texto: 'Disco externo del mismo cofre', tipo: 'disco', dispositivo: 'hdd2', fuera: false, pieza: 'chest' },
      { id: 'cinta', texto: 'Cinta de la bóveda', tipo: 'cinta', dispositivo: 'cinta1', fuera: false, pieza: 'coin_stack_medium' },
      { id: 'nube', texto: 'Portal a la nube · fuera de la torre', tipo: 'nube', dispositivo: 'nube1', fuera: true, pieza: null },
    ],
    fallos: {
      mismoDisco: 'Dos de las copias están en **el mismo disco**: si ese disco falla, se pierden las dos. Eso no son tres copias.',
      unTipo: 'Todas las copias están en **el mismo tipo de soporte**. Un fallo que afecte a ese tipo de soporte podría destruirlas todas: hacen falta **dos tipos distintos**.',
      nadaFuera: 'Ninguna copia ha salido de la torre. Un incendio o un robo en la bóveda acabaría con todas: hace falta **una fuera**.',
    },
    bien: '¡**Tres copias**, en **dos tipos de soporte** y **una fuera** de la torre! La cripta acepta vuestra estrategia.',
    pregunta: {
      id: 'b-cripta', concepto: 'copias', criterio: '1.1', tipo: 'opcion',
      texto: 'Última prueba de la cripta: haces una copia completa el domingo e incrementales de lunes a jueves. El viernes muere el disco. ¿Qué necesitas para recuperarlo todo?',
      opciones: [
        'Solo la copia completa del domingo.',
        'La completa del domingo y todas las incrementales, de lunes a jueves.',
        'Solo la incremental del jueves.',
        'La completa y únicamente la incremental del jueves.',
      ],
      correcta: 1,
      explicacion: 'Cada incremental solo guarda lo cambiado desde la copia anterior, así que hacen falta la completa y toda la cadena. Con diferenciales bastaría la completa y la última.',
    },
  },

  pistas: {
    soportes: 'El **altar de los soportes** está en el lado oeste. Leed el encargo sobre el atril y ofreced el pedestal adecuado con **E**.',
    balanza: 'La **balanza de las unidades** está en el lado este. Acercaos y pulsad **E**. Recordad: 1.000 en el SI, 1.024 en binario.',
    cripta: 'La **cripta 3-2-1** está al norte, junto al gran cofre. Cogéis orbes con **E** y los dejáis en un receptáculo con **E**: tres copias, dos tipos, una fuera.',
    cripta_sellar: 'Los orbes están bien colocados. Acercaos al pedestal central de la cripta y pulsad **E** para sellarla.',
    puerta: '¡La puerta del norte está abierta! Subid por la escalera.',
  },

  sellosRotos: [
    '¡Los tres sellos de la bóveda están rotos!',
    'Esperad… la bóveda está proyectando algo. Es un **recuerdo** de Morvath.',
  ],

  // Fragmento de la historia de Morvath: cada piso revela un poco más de su motivo.
  memoria: [
    'Un joven con túnica gris corre entre las llamas de la **Gran Biblioteca de Umbravel**. Intenta salvar los libros, uno a uno, con las manos quemadas.',
    'No puede. Siglos de saber arden en una noche, porque **de cada libro solo existía una copia**.',
    'El joven es **Morvath**. Esa noche juró que ningún saber volvería a perderse… y empezó a guardarlo todo. Pero solo para él, bajo llave, en esta torre.',
    'Ahora lo entiendo: Morvath no quiere destruir el conocimiento. **Quiere poseerlo**. Y a mí me necesita para algo más. Seguid subiendo.',
  ],

  // Preguntas de la varita (se suman a las de los pisos anteriores)
  preguntas: [
    {
      id: 'p2-01', concepto: 'almacenamiento', criterio: '1.1', tipo: 'opcion',
      texto: '¿Qué memoria pierde su contenido al apagar el ordenador?',
      opciones: ['El disco duro', 'La memoria RAM', 'El SSD', 'La tarjeta SD'],
      correcta: 1,
      explicacion: 'La RAM es memoria principal y volátil: sin corriente, se borra. Los demás son memoria secundaria.',
    },
    {
      id: 'p2-02', concepto: 'almacenamiento', criterio: '1.1', tipo: 'opcion',
      texto: '¿Por qué un SSD NVMe es mucho más rápido que un SSD SATA?',
      opciones: [
        'Porque tiene platos que giran más deprisa.',
        'Porque se comunica por PCIe, una conexión mucho más ancha que SATA.',
        'Porque guarda menos datos.',
        'Porque usa un láser.',
      ],
      correcta: 1,
      explicacion: 'Los dos usan memoria flash, pero SATA se queda en unos 550 MB/s y PCIe permite miles de MB/s.',
    },
    {
      id: 'p2-03', concepto: 'almacenamiento', criterio: '1.1', tipo: 'opcion',
      texto: '¿Cuál de estos soportes tiene piezas mecánicas que se mueven?',
      opciones: ['SSD NVMe', 'Pendrive', 'Disco duro (HDD)', 'Tarjeta SD'],
      correcta: 2,
      explicacion: 'El HDD tiene platos que giran y un cabezal que se mueve. Por eso es más sensible a los golpes.',
    },
    {
      id: 'p2-04', concepto: 'almacenamiento', criterio: '1.1', tipo: 'opcion',
      texto: '¿Cuál es el principal inconveniente de guardar tus archivos solo en la nube?',
      opciones: [
        'Que no se puede acceder desde el móvil.',
        'Que dependes de tener internet y de las condiciones del proveedor.',
        'Que ocupa espacio en tu disco duro.',
        'Que no se puede compartir con nadie.',
      ],
      correcta: 1,
      explicacion: 'Sin conexión no hay archivos, y el proveedor decide precios, privacidad y hasta si el servicio sigue existiendo.',
    },
    {
      id: 'p2-05', concepto: 'almacenamiento', criterio: '1.1', tipo: 'opcion',
      texto: '¿Qué es un NAS?',
      opciones: [
        'Un tipo de memoria RAM.',
        'Un dispositivo con discos conectado a la red local para compartir archivos.',
        'Un virus que cifra los discos.',
        'Un formato de vídeo.',
      ],
      correcta: 1,
      explicacion: 'NAS significa «almacenamiento conectado a la red»: todos los equipos de la red comparten sus discos.',
    },
    {
      id: 'p2-06', concepto: 'almacenamiento', criterio: '1.1', tipo: 'opcion',
      texto: '¿Por qué las grandes empresas siguen usando cinta magnética para archivar?',
      opciones: [
        'Porque es el soporte más rápido.',
        'Porque es muy barata por GB, cabe muchísimo y dura décadas.',
        'Porque se puede llevar en el bolsillo.',
        'Porque no necesita ningún aparato para leerla.',
      ],
      correcta: 1,
      explicacion: 'Para guardar mucho y consultar poco, la cinta gana: es lenta, pero barata y duradera.',
    },
    {
      id: 'p2-07', concepto: 'unidades', criterio: '1.1', tipo: 'numero',
      texto: 'Tu fibra es de 600 Mb/s. ¿Cuántos MB por segundo puedes descargar, como máximo?',
      valor: 75, tolerancia: 0, unidad: 'MB/s',
      explicacion: 'La red se mide en bits: 600 ÷ 8 = 75 MB/s.',
    },
    {
      id: 'p2-08', concepto: 'unidades', criterio: '1.1', tipo: 'numero',
      texto: '¿Cuántos kB son 2,5 MB? (prefijos del SI)',
      valor: 2500, tolerancia: 0, unidad: 'kB',
      explicacion: '2,5 × 1.000 = 2.500 kB.',
    },
    {
      id: 'p2-09', concepto: 'unidades', criterio: '1.1', tipo: 'opcion',
      texto: 'Compras un disco de 500 GB y el ordenador dice que tiene unos 465 GB. ¿Por qué?',
      opciones: [
        'Porque el fabricante te ha engañado.',
        'Porque el sistema operativo ya ocupa 35 GB.',
        'Porque el fabricante cuenta en múltiplos de 1.000 y el sistema, en múltiplos de 1.024.',
        'Porque el disco está roto.',
      ],
      correcta: 2,
      explicacion: '500 × 10⁹ ÷ 1.024³ ≈ 465,7 GiB. Es la misma cantidad de bytes contada de otra forma.',
    },
    {
      id: 'p2-10', concepto: 'unidades', criterio: '1.1', tipo: 'numero',
      texto: '¿Cuántos bytes tiene 1 MiB?',
      valor: 1048576, tolerancia: 0, unidad: 'bytes',
      explicacion: '1 MiB = 1.024 × 1.024 = 1.048.576 bytes.',
    },
    {
      id: 'p2-11', concepto: 'copias', criterio: '1.1', tipo: 'opcion',
      texto: '¿Qué dice la regla 3-2-1 de las copias de seguridad?',
      opciones: [
        '3 discos, 2 ordenadores y 1 contraseña.',
        '3 copias de los datos, en 2 tipos de soporte distintos y 1 fuera del lugar.',
        'Hacer copias cada 3 días, durante 2 semanas, 1 vez al mes.',
        '3 copias en el mismo disco para ir más rápido.',
      ],
      correcta: 1,
      explicacion: 'Tres copias (con el original), dos tipos de soporte y una fuera: así ningún desastre único acaba con todas.',
    },
    {
      id: 'p2-12', concepto: 'copias', criterio: '1.1', tipo: 'opcion',
      texto: 'Usas copias diferenciales: completa el domingo y diferenciales de lunes a jueves. ¿Qué necesitas para restaurar el viernes?',
      opciones: [
        'La completa y todas las diferenciales.',
        'Solo la diferencial del jueves.',
        'La completa y la diferencial del jueves.',
        'Solo la completa.',
      ],
      correcta: 2,
      explicacion: 'La diferencial guarda todo lo cambiado desde la última completa, así que basta con la completa y la última diferencial.',
    },
    {
      id: 'p2-13', concepto: 'copias', criterio: '1.1', tipo: 'opcion',
      texto: '¿Por qué copiar tus archivos en otra carpeta del mismo disco no es una copia de seguridad?',
      opciones: [
        'Porque ocupa demasiado.',
        'Porque si el disco se estropea o lo cifra un ransomware, se pierden las dos.',
        'Porque las carpetas no pueden tener el mismo nombre.',
        'Sí que es una buena copia de seguridad.',
      ],
      correcta: 1,
      explicacion: 'Una copia de seguridad tiene que estar en otro soporte. Mejor aún: una de ellas, fuera de casa.',
    },
    {
      id: 'p2-14', concepto: 'copias', criterio: '1.1', tipo: 'opcion',
      texto: '¿Qué tipo de copia es la más rápida de hacer cada día, pero la más laboriosa de restaurar?',
      opciones: ['La completa', 'La incremental', 'La diferencial', 'Todas tardan lo mismo'],
      correcta: 1,
      explicacion: 'La incremental solo copia lo cambiado desde la copia anterior, pero para restaurar hace falta toda la cadena.',
    },
    {
      id: 'p2-15', concepto: 'copias', criterio: '1.1', tipo: 'opcion',
      texto: 'Un ransomware cifra tu ordenador y también el disco externo que tenías siempre conectado. ¿Qué te habría salvado?',
      opciones: [
        'Tener el antivirus desactivado.',
        'Una copia desconectada o fuera de casa, como en la regla 3-2-1.',
        'Pagar el rescate.',
        'Hacer más copias en el mismo disco externo.',
      ],
      correcta: 1,
      explicacion: 'El ransomware cifra todo lo que alcanza. Una copia desconectada o fuera queda a salvo. Y pagar no garantiza nada.',
    },
  ],
};
