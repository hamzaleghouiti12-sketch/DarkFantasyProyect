// Piso IV · Los Puentes Flotantes
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saber I.3 «Redes», criterio de evaluación 1.2.

export default {
  id: 'piso4',
  nombre: 'Piso IV · Los Puentes Flotantes',
  criterios: ['1.2'],

  intro: [
    '¿Aire libre… dentro de la torre? Morvath ha convertido este piso en un **archipiélago de islas flotantes**. Os resultará familiar.',
    'Cada isla guarda un aparato de red. Antes estaban unidas por **enlaces de luz**, pero Morvath los ha cortado todos: las islas ya no pueden hablar entre sí.',
    'Podéis caminar por las pasarelas de piedra, pero **cuidado con el vacío**: si caéis, volveréis a la última isla que pisasteis.',
    'Tres sellos: **tender la red**, configurar las **direcciones** en el oráculo de la isla central y usar la **terminal del vigía**.',
  ],

  lecciones: {
    redes: {
      titulo: 'Redes: tipos, medios y dispositivos',
      resumen: 'Una red une dispositivos para compartir datos. Por tamaño: PAN (personal, Bluetooth), LAN (una casa o un instituto), MAN (una ciudad) y WAN (países; internet es la mayor). Medios guiados: cable de par trenzado UTP con conector RJ45, fibra óptica (luz, muy rápida y a larga distancia) y coaxial. No guiados: Wi-Fi, Bluetooth, 4G/5G y satélite. Topologías: estrella (todos a un switch; si cae el centro, cae todo), bus, anillo y malla (varios caminos: redundancia). Dispositivos: tarjeta de red (NIC), switch (une equipos de una LAN), router (une redes distintas y sale a internet), punto de acceso (Wi-Fi), repetidor (amplía la señal), módem/ONT (convierte la señal de la línea o de la fibra), PLC (red por los enchufes). Cliente-servidor: un servidor atiende a muchos clientes. P2P: los equipos se comunican entre iguales.',
      paginas: [
        'Una **red** es un conjunto de dispositivos unidos para compartir datos. Según su tamaño: **PAN** (la de vuestro móvil y vuestros auriculares Bluetooth), **LAN** (una casa o un instituto), **MAN** (una ciudad) y **WAN** (países enteros; internet es la mayor de todas).',
        'Los datos viajan por **medios guiados**: el cable de **par trenzado UTP** con su conector **RJ45**, la **fibra óptica** (pulsos de luz, muy rápida y para largas distancias) o el **coaxial**. O por **medios no guiados**: **Wi-Fi, Bluetooth, 4G/5G** y **satélite**.',
        'Cada aparato tiene su papel. El **switch** une los equipos de una misma red local. El **router** une redes distintas: es la puerta hacia internet. El **punto de acceso** da Wi-Fi, el **repetidor** alarga la señal y el **módem u ONT** traduce la señal que llega por la línea telefónica o por la fibra.',
        'La forma en que se conectan se llama **topología**. En **estrella**, todos van a un switch central: es sencilla, pero si cae el centro, cae todo. En **malla** hay varios caminos: si se rompe uno, los datos van por otro. Eso es la **redundancia**.',
        'Y un detalle: el propio **modo equipo** de este juego es una red **P2P** (de igual a igual) en **estrella**. El anfitrión hace de centro, y un servidor gratuito ayuda a que vuestros navegadores se encuentren.',
      ],
      despues: [
        'Primer trabajo: el **barrio** del oeste. Montad una **estrella**: la biblioteca, el taller y el punto de acceso, cada uno unido **solo** al switch. Y el switch, al router.',
        'Para tender un enlace, pulsad **E** junto al poste de una isla, id hasta el poste de la otra y pulsad **E** otra vez. Si unís algo que no debíais, repetid el enlace para quitarlo.',
      ],
    },
    canarias: {
      titulo: 'Canarias conectada',
      resumen: 'Las islas Canarias están unidas entre sí, con la Península y con África por cables submarinos de fibra óptica. Sin ellos, la fragmentación del territorio dejaría islas aisladas. La conectividad permite el teletrabajo y la teleformación, y reducir la brecha digital (las diferencias de acceso a internet entre personas y territorios) es un reto en las islas no capitalinas y en las zonas rurales.',
      paginas: [
        'Ahora, las dos islas del este: **Tenerife** y **Gran Canaria**. Entre ellas hay mar. ¿Cómo se unen dos islas de verdad?',
        'Con **cables submarinos de fibra óptica**, tendidos por el fondo del océano. Así están conectadas las islas Canarias entre sí, con la Península y con África.',
        'Sin esos cables, vivir en un archipiélago significaría estar **aislado**. Con ellos existen el **teletrabajo**, las clases a distancia y los servicios en línea… aunque todavía hay una **brecha digital**: zonas rurales e islas pequeñas con peor conexión que las capitales.',
      ],
      despues: ['Unid **Tenerife** con el router y después **Tenerife con Gran Canaria**. Pensad bien qué cable elegís para cruzar el mar.'],
    },
    direcciones: {
      titulo: 'Direcciones IP, máscara, puerta de enlace y DNS',
      resumen: 'La IP identifica a un equipo en una red. IPv4: 4 números del 0 al 255 (192.168.20.25); IPv6: 128 bits en hexadecimal, porque las IPv4 se agotaron. Pública: la que te ve internet (una por router). Privada: dentro de casa (10.x, 172.16-31.x, 192.168.x). La máscara (255.255.255.0 o /24) dice qué parte de la IP es la red: con /24, los tres primeros números. La puerta de enlace es el router, por donde salen los paquetes a otras redes. El DNS traduce nombres (instituto.es) a IP. La MAC es la dirección física de la tarjeta de red. Estática: se escribe a mano. Dinámica: la reparte el servidor DHCP del router.',
      paginas: [
        'Para que los paquetes lleguen, cada equipo necesita una **dirección IP**. En **IPv4** son cuatro números del 0 al 255: por ejemplo, **192.168.20.25**. Como se agotaron, existe **IPv6**, con 128 bits escritos en hexadecimal.',
        'Hay IP **públicas** (la que ve internet: normalmente una por router) e IP **privadas**, que solo valen dentro de una red local: las que empiezan por **10.**, **172.16 a 172.31** o **192.168**.',
        'La **máscara** dice qué parte de la IP indica la red. Con **255.255.255.0** (o **/24**), los tres primeros números son la red y el último, el equipo. Todos los equipos de la misma red comparten esos tres primeros números.',
        'La **puerta de enlace** es el router: por ahí salen los paquetes hacia otras redes. El **DNS** traduce nombres, como aldric.umbravel, a direcciones IP. Y cada tarjeta de red tiene además una **MAC**, su dirección física de fábrica.',
        'Ojo: la dirección que termina en **.0** es la de la red y la que termina en **.255**, la de **difusión**. Ningún equipo puede usarlas. Y dos equipos no pueden tener la misma IP.',
      ],
      despues: ['El oráculo os pedirá configurar **tres equipos** en la red del router: **192.168.20.1** con máscara **/24**.'],
    },
    protocolos: {
      titulo: 'Protocolos y diagnóstico',
      resumen: 'Protocolo: conjunto de reglas para comunicarse. Internet usa TCP/IP (el modelo OSI lo explica en 7 capas). HTTP/HTTPS: páginas web (la S, cifrado). DNS: nombres a IP. DHCP: reparte IP automáticamente. FTP: transferir archivos. SMTP: enviar correo; POP3 e IMAP: recibirlo. Diagnóstico: ipconfig (tu configuración), ping (¿responde un equipo?, y cuánto tarda) y tracert (por qué routers pasan los paquetes, útil para ver dónde se corta la conexión).',
      paginas: [
        'Para entenderse, los equipos siguen **protocolos**: reglas comunes. Internet funciona con **TCP/IP**; el modelo **OSI** lo explica dividido en 7 capas.',
        'Algunos que usáis a diario sin saberlo: **HTTP y HTTPS** (páginas web; la S significa cifrado), **DNS** (nombres a IP), **DHCP** (IP automáticas), **FTP** (enviar archivos), **SMTP** (enviar correo) y **POP3 o IMAP** (recibirlo).',
        'Y tres comandos de diagnóstico que usan los técnicos de verdad: **ipconfig** muestra tu configuración; **ping** comprueba si un equipo responde y cuánto tarda; **tracert** enseña por qué routers pasan los paquetes… y **dónde dejan de pasar**.',
      ],
      despues: [
        '¡Morvath ha cortado algo! **aldric.umbravel**, mi servidor en Gran Canaria, ya no responde.',
        'Usad **ping aldric.umbravel** para comprobarlo y **tracert aldric.umbravel** para ver hasta dónde llegan los paquetes. Cuando sepáis qué enlace falla, escribid **reparar isla1-isla2**.',
      ],
    },
    wifiCasa: {
      titulo: 'Configurar una Wi-Fi segura',
      resumen: 'El SSID es el nombre de la red: mejor uno que no dé pistas de quién sois ni de dónde vivís. Seguridad: WPA3 (o WPA2 si el aparato no admite otra); nunca WEP ni red abierta. Contraseña de al menos 12 caracteres, mezclando minúsculas, mayúsculas, números y símbolos, sin palabras típicas ni el nombre de la red. Cambiad también la contraseña de administración del router que viene de fábrica, desactivad WPS y usad una red de invitados para las visitas.',
      paginas: [
        'El faro del archipiélago emite una **red Wi-Fi**. Si está mal configurada, cualquiera desde el muelle podría entrar… o espiar lo que pasa por ella.',
        'El **SSID** es el nombre de la red. Elegid uno que **no dé pistas** de quién sois ni de dónde vivís: nada de teléfonos, direcciones o «Wifi del 3.º B».',
        'La **seguridad** decide cómo se cifra lo que viaja por el aire. **WPA3** es lo más seguro hoy; **WPA2** vale si algún aparato no admite otra cosa. **WEP** se rompe en minutos y una red **abierta** no protege nada.',
        'La **contraseña** debe tener **al menos 12 caracteres** y mezclar minúsculas, mayúsculas, números y símbolos, sin palabras típicas (password, 123456, admin…) ni el nombre de la red.',
        'Y tres trucos de archimago: cambiad la **contraseña de administración** del router que viene de fábrica, **desactivad WPS** y cread una **red de invitados** para las visitas.',
      ],
    },
    raee: {
      titulo: 'Residuos electrónicos (RAEE) y obsolescencia',
      resumen: 'RAEE: residuos de aparatos eléctricos y electrónicos. Contienen metales valiosos (oro, cobre, tierras raras) y sustancias tóxicas (plomo, mercurio, el electrolito de las baterías): nunca a la basura normal. Orden de preferencia: reducir, reutilizar (donar o vender lo que funciona), reparar o mejorar (pantalla, batería, SSD, más RAM) y, al final, reciclar en un punto limpio o en la tienda, que está obligada a recoger el viejo al vender uno nuevo. Obsolescencia programada: diseñar productos para que duren menos. Obsolescencia percibida: cambiar algo que funciona solo por moda. La UE impulsa el derecho a reparar.',
      paginas: [
        'Este pozo está lleno de **aparatos viejos**: móviles, portátiles, cargadores, impresoras… Morvath los tira aquí cuando dejan de interesarle. En vuestro mundo se llaman **RAEE**: residuos de aparatos eléctricos y electrónicos.',
        'Dentro llevan **metales valiosos** (oro, cobre, tierras raras) y **sustancias tóxicas** (plomo, mercurio, las baterías). Por eso **nunca** van a la basura normal.',
        'Antes de tirar, pensad en este orden: **reducir** (¿de verdad necesito uno nuevo?), **reutilizar** (si funciona, se dona o se vende), **reparar o mejorar** (una pantalla, una batería, un SSD, más RAM) y, al final, **reciclar**.',
        'Para reciclar: el **punto limpio** o la **tienda**, que está obligada a recoger el aparato viejo cuando vende uno nuevo del mismo tipo.',
        'Ojo con dos trampas: la **obsolescencia programada** (aparatos diseñados para durar menos) y la **obsolescencia percibida** (cambiar algo que funciona solo porque ha salido otro). La Unión Europea impulsa el **derecho a reparar**.',
      ],
    },
  },

  // ---------- Opcionales del archipiélago (individuales; no hacen falta para la salida) ----------
  faro: {
    aviso: 'El **faro** de Tenerife emite la red Wi-Fi del archipiélago… sin contraseña. Es un reto **opcional**: configuradlo bien y ganaréis saber extra.',
    hecho: '¡El faro brilla con una red segura! Reto **opcional** completado (+20 de saber).',
  },
  chatarra: {
    aviso: 'El **pozo de la chatarra** está lleno de aparatos que Morvath ha tirado. Es un reto **opcional**: decidid qué hacer con cada uno.',
    opciones: ['Reutilizar (donarlo o venderlo)', 'Reparar o mejorar', 'Reciclar en un punto limpio'],
    casos: [
      { id: 'p4-op1', texto: 'Un portátil de 4 años que funciona bien, pero os habéis comprado otro.', correcta: 0, explicacion: 'Si funciona, lo mejor es que siga usándose: donarlo o venderlo alarga su vida.' },
      { id: 'p4-op2', texto: 'Un móvil con la pantalla rota; todo lo demás funciona.', correcta: 1, explicacion: 'Cambiar la pantalla cuesta mucho menos (en dinero y en recursos) que fabricar un móvil nuevo.' },
      { id: 'p4-op3', texto: 'La batería hinchada de un móvil antiguo.', correcta: 2, explicacion: 'Una batería hinchada es peligrosa: al punto limpio (o a la tienda), nunca a la basura normal.' },
      { id: 'p4-op4', texto: 'Un ordenador que va lento solo porque tiene un disco duro mecánico y poca RAM.', correcta: 1, explicacion: 'Con un SSD y más RAM puede durar varios años más: es mejorarlo, no tirarlo.' },
      { id: 'p4-op5', texto: 'Una impresora de hace 15 años, sin repuestos ni controladores para los sistemas actuales.', correcta: 2, explicacion: 'Si ya no se puede reparar ni usar, toca reciclarla en un punto limpio para recuperar sus materiales.' },
    ],
    hecho: '¡El pozo está en orden! Reto **opcional** completado (+20 de saber).',
  },

  // ---------- Sello 1 · Tender la red ----------
  islas: {
    router: { nombre: 'Isla del Router', equipo: 'Router', pos: [0, 6], escala: 6 },
    switch: { nombre: 'Isla del Switch', equipo: 'Switch', pos: [-17, 3], escala: 5 },
    pc1: { nombre: 'Isla de la Biblioteca', equipo: 'Ordenador', pos: [-30, -5], escala: 4 },
    pc2: { nombre: 'Isla del Taller', equipo: 'Ordenador', pos: [-31, 11], escala: 4 },
    ap: { nombre: 'Isla del Punto de acceso', equipo: 'Punto de acceso', pos: [-17, 18], escala: 4 },
    tenerife: { nombre: 'Tenerife', equipo: 'Router de Tenerife', pos: [17, -1], escala: 5 },
    grancanaria: { nombre: 'Gran Canaria', equipo: 'Router de Gran Canaria', pos: [31, 11], escala: 5 },
  },
  // islas sin aparato de red: el muelle de llegada y el islote de la salida
  muelle: { pos: [0, 24], escala: 4 },
  salida: { pos: [0, -9], escala: 3.5 },
  // pasarelas de piedra por las que se camina (no son enlaces de red)
  pasarelas: [['muelle', 'router'], ['router', 'switch'], ['switch', 'pc1'], ['switch', 'pc2'], ['switch', 'ap'], ['router', 'tenerife'], ['tenerife', 'grancanaria'], ['router', 'salida']],
  nucleo: ['router', 'switch', 'tenerife', 'grancanaria'],
  hojas: ['pc1', 'pc2', 'ap'],
  fases: [
    { id: 'estrella', objetivo: 'Monta una estrella: biblioteca, taller y punto de acceso al switch; el switch al router' },
    { id: 'fibra', objetivo: 'Une Tenerife al router, y Tenerife con Gran Canaria por el cable adecuado' },
    { id: 'redundancia', objetivo: 'Añade redundancia: que ningún enlace entre router, switch, Tenerife y Gran Canaria sea imprescindible' },
  ],
  preguntaCable: {
    id: 'r-cable', concepto: 'canarias', criterio: '1.2', tipo: 'opcion',
    texto: 'Vas a unir Tenerife y Gran Canaria atravesando el mar: unos 60 km. ¿Qué medio eliges?',
    opciones: ['Cable de par trenzado (UTP)', 'Fibra óptica submarina', 'Bluetooth', 'Cable coaxial de antena'],
    correcta: 1,
    explicacion: 'La fibra lleva la información con luz a enormes distancias sin apenas perderla. El UTP no pasa de 100 m por tramo y el Bluetooth, de unos metros.',
  },

  // ---------- Sello 2 · El oráculo de las direcciones ----------
  oraculo: {
    red: { puerta: '192.168.20.1', prefijo: 24 },
    equipos: ['Portátil de Aldric', 'Ordenador de la biblioteca', 'Impresora del taller'],
    dhcp: [
      'Muy bien: habéis configurado las tres direcciones **a mano**. Eso es una **IP estática**: útil para equipos que siempre deben tener la misma, como una impresora o un servidor.',
      'Ahora mirad qué pasa si activo el **DHCP** del router… Cada equipo pide una IP al conectarse y el router se la **presta** durante un tiempo: 192.168.20.100, .101, .102… Sin escribir nada.',
      'Por eso en casa nunca configuráis la IP del móvil: lo hace el **DHCP**. A mano, controláis cada dirección; con DHCP, no hay errores ni direcciones repetidas.',
    ],
  },

  // ---------- Sello 3 · La terminal del vigía ----------
  terminal: {
    equipos: {
      router: { ip: '192.168.20.1', nombre: 'router' },
      switch: { ip: '—', nombre: 'switch', capa2: true },
      pc1: { ip: '192.168.20.11', nombre: 'biblioteca' },
      pc2: { ip: '192.168.20.12', nombre: 'taller' },
      ap: { ip: '192.168.20.13', nombre: 'punto-acceso' },
      tenerife: { ip: '10.0.38.1', nombre: 'tenerife' },
      grancanaria: { ip: '10.0.35.1', nombre: 'grancanaria' },
    },
    dns: { 'aldric.umbravel': 'grancanaria', 'biblioteca.umbravel': 'pc1' },
    bien: [
      '¡**aldric.umbravel** vuelve a responder! Habéis hecho lo que hace un técnico de redes: **comprobar** (ping), **localizar** (tracert) y **reparar**.',
      'Yo me encargo de los demás enlaces que cortó Morvath. Y fijaos: gracias a la **redundancia**, la mitad de la red ni se enteró del corte.',
    ],
  },

  pistas: {
    red: 'Pulsad **E** junto al poste de una isla y **E** en el poste de otra para tenderles un enlace. Mirad el objetivo en la lista de la izquierda.',
    oraculo: 'El **oráculo de las direcciones** está en la isla central, junto al router. Recordad: la misma red (192.168.20.x), la máscara /24 y el router como puerta de enlace.',
    terminal: 'La **terminal del vigía** está en la isla central. Escribid **ping aldric.umbravel** y **tracert aldric.umbravel**.',
    puerta: '¡El arco del norte está abierto! Cruzad la pasarela hasta el islote de la salida.',
    bloqueada: 'Primero tended la red: la terminal no sirve de nada si no hay enlaces.',
  },

  sellosRotos: [
    '¡Los tres sellos del archipiélago están rotos!',
    'Los enlaces de luz brillan otra vez… y en ellos viaja un **recuerdo**.',
  ],

  memoria: [
    'Morvath y el joven Aldric construyen algo juntos: una **red de cristales** que une todas las bibliotecas de Umbravel. Cualquiera puede leer cualquier libro desde cualquier isla.',
    'Morvath sonríe al principio. Pero cada noche revisa quién lee qué. «Si todos pueden llegar a todo», dice, «alguien lo romperá. Mejor que todo pase por **un solo centro**… por mí».',
    'Aldric no está de acuerdo. «Una red con un solo centro», le responde, «es una red que cae entera cuando cae ese centro».',
    'Esa fue nuestra primera discusión de verdad. Él quería una **estrella** con él en medio; yo, una **malla** donde nadie fuera imprescindible. Seguid subiendo.',
  ],

  preguntas: [
    {
      id: 'p4-01', concepto: 'redes', criterio: '1.2', tipo: 'opcion',
      texto: 'La red que forman tu móvil, tu reloj inteligente y tus auriculares Bluetooth es una…',
      opciones: ['WAN', 'MAN', 'LAN', 'PAN'], correcta: 3,
      explicacion: 'PAN (red de área personal): unos pocos metros alrededor de una persona.',
    },
    {
      id: 'p4-02', concepto: 'redes', criterio: '1.2', tipo: 'opcion',
      texto: '¿Qué dispositivo une tu red de casa con internet?',
      opciones: ['El switch', 'El router', 'El repetidor', 'La tarjeta de red'], correcta: 1,
      explicacion: 'El router enruta los paquetes entre redes distintas: tu LAN y internet.',
    },
    {
      id: 'p4-03', concepto: 'redes', criterio: '1.2', tipo: 'opcion',
      texto: 'En una topología en estrella, ¿qué pasa si falla el switch central?',
      opciones: ['Nada, los equipos siguen conectados', 'Solo falla un equipo', 'Se cae toda la red', 'La red va más rápido'],
      correcta: 2, explicacion: 'Todo pasa por el centro: es su punto débil. La malla lo evita con caminos alternativos.',
    },
    {
      id: 'p4-04', concepto: 'redes', criterio: '1.2', tipo: 'opcion',
      texto: '¿Qué conector usa el cable de red de par trenzado (UTP)?',
      opciones: ['USB-C', 'RJ45', 'HDMI', 'Coaxial F'], correcta: 1,
      explicacion: 'El RJ45 es el conector del cable Ethernet: 8 hilos trenzados por parejas.',
    },
    {
      id: 'p4-05', concepto: 'redes', criterio: '1.2', tipo: 'opcion',
      texto: 'En el modo equipo de este juego, el anfitrión reenvía los mensajes de todos. ¿Qué modelo y topología es?',
      opciones: ['Cliente-servidor en bus', 'P2P en estrella', 'P2P en anillo', 'Una red MAN'], correcta: 1,
      explicacion: 'Los navegadores se hablan directamente (P2P) y todos pasan por el anfitrión, que hace de centro de la estrella.',
    },
    {
      id: 'p4-06', concepto: 'canarias', criterio: '1.2', tipo: 'opcion',
      texto: '¿Qué es la brecha digital?',
      opciones: [
        'Un fallo de seguridad en los routers.',
        'Las diferencias de acceso a internet y a la tecnología entre personas o territorios.',
        'La distancia entre dos islas.',
        'Un tipo de cable roto.',
      ],
      correcta: 1, explicacion: 'Zonas rurales, islas pequeñas o personas sin recursos pueden quedarse atrás: por eso la conectividad es un reto social.',
    },
    {
      id: 'p4-07', concepto: 'direcciones', criterio: '1.2', tipo: 'opcion',
      texto: '¿Cuál de estas IP es privada?',
      opciones: ['8.8.8.8', '192.168.1.20', '80.58.61.250', '1.1.1.1'], correcta: 1,
      explicacion: 'Las que empiezan por 192.168 están reservadas para redes locales.',
    },
    {
      id: 'p4-08', concepto: 'direcciones', criterio: '1.2', tipo: 'opcion',
      texto: '¿Para qué sirve el DNS?',
      opciones: ['Para cifrar las contraseñas', 'Para traducir nombres de dominio a direcciones IP', 'Para repartir IP automáticamente', 'Para amplificar el Wi-Fi'],
      correcta: 1, explicacion: 'Recordamos nombres (instituto.es); los equipos necesitan números. El DNS hace de agenda.',
    },
    {
      id: 'p4-09', concepto: 'direcciones', criterio: '1.2', tipo: 'opcion',
      texto: 'Tu móvil obtiene su IP automáticamente al conectarse al Wi-Fi de casa. ¿Quién se la da?',
      opciones: ['El servidor DNS', 'El servidor DHCP del router', 'Tu operador de telefonía', 'Nadie, se la inventa'],
      correcta: 1, explicacion: 'El DHCP presta una IP libre de la red durante un tiempo.',
    },
    {
      id: 'p4-10', concepto: 'direcciones', criterio: '1.2', tipo: 'opcion',
      texto: '¿Por qué se creó IPv6?',
      opciones: ['Porque IPv4 era demasiado rápido', 'Porque se agotaron las direcciones IPv4', 'Para que las IP sean más cortas', 'Para eliminar el DNS'],
      correcta: 1, explicacion: 'IPv4 tiene unos 4.300 millones de direcciones; IPv6 tiene 2¹²⁸, prácticamente infinitas.',
    },
    {
      id: 'p4-11', concepto: 'direcciones', criterio: '1.2', tipo: 'numero',
      texto: 'Con la máscara 255.255.255.0, ¿cuántas direcciones pueden usar los equipos de la red? (sin contar la de red ni la de difusión)',
      valor: 254, tolerancia: 0, unidad: 'direcciones',
      explicacion: 'El último número va de 0 a 255 (256 valores); se quitan la .0 (red) y la .255 (difusión): 254.',
    },
    {
      id: 'p4-12', concepto: 'protocolos', criterio: '1.2', tipo: 'opcion',
      texto: '¿Qué protocolo usas cuando envías un correo electrónico?',
      opciones: ['SMTP', 'FTP', 'DHCP', 'HTTP'], correcta: 0,
      explicacion: 'SMTP envía el correo; POP3 o IMAP lo descargan en tu dispositivo.',
    },
    {
      id: 'p4-13', concepto: 'protocolos', criterio: '1.2', tipo: 'opcion',
      texto: '¿Qué comando usarías para ver por qué routers pasan tus paquetes hasta un servidor?',
      opciones: ['ipconfig', 'ping', 'tracert', 'cls'], correcta: 2,
      explicacion: 'tracert muestra cada salto (router) del camino y cuánto tarda en cada uno.',
    },
    {
      id: 'p4-14', concepto: 'protocolos', criterio: '1.2', tipo: 'opcion',
      texto: '¿Qué significa la «S» de HTTPS?',
      opciones: ['Simple', 'Seguro: la conexión va cifrada', 'Servidor', 'Streaming'], correcta: 1,
      explicacion: 'HTTPS cifra lo que viaja entre tu navegador y la web: nadie en medio puede leerlo.',
    },
    {
      id: 'p4-15', concepto: 'wifiCasa', criterio: '1.2', tipo: 'opcion',
      texto: '¿Qué tipo de seguridad Wi-Fi está obsoleto y se rompe en minutos?',
      opciones: ['WPA3', 'WPA2', 'WEP', 'Ninguno: todos son seguros'], correcta: 2,
      explicacion: 'WEP está roto desde hace años. Hoy lo recomendable es WPA3, o WPA2 si algún aparato no admite otra cosa.',
    },
    {
      id: 'p4-16', concepto: 'raee', criterio: '1.2', tipo: 'opcion',
      texto: '¿Qué hacemos con un cargador de móvil que ya no funciona?',
      opciones: ['Tirarlo a la basura orgánica', 'Llevarlo a un punto limpio o a la tienda', 'Tirarlo al contenedor amarillo', 'Guardarlo en un cajón para siempre'], correcta: 1,
      explicacion: 'Es un RAEE: va al punto limpio o a la tienda para recuperar sus materiales y evitar que contamine.',
    },
  ],
};
