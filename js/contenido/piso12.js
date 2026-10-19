// Piso XII · La Fragua del Código
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saberes IV.3 «Programación» (lenguajes, IDE, POO, tratamiento de datos, comentar
// el código, control de versiones) e IV.4 «Aplicaciones para dispositivos».
// Criterios de evaluación 4.3 y 4.4.

export default {
  id: 'piso12',
  nombre: 'Piso XII · La Fragua del Código',
  criterios: ['4.3', '4.4'],

  intro: [
    'Yunques, moldes con forma de criatura y una **placa de luces** enorme en la pared. **La Fragua del Código.**',
    'Aquí Morvath forjaba a sus sirvientes… escribiendo su código. Lo que se programa aquí, cobra forma.',
    'Tres sellos: el **molde de las criaturas** (oeste), la **placa de luces** (norte) y el **libro de registro** (este).',
  ],

  lecciones: {
    poo: {
      titulo: 'Lenguajes y programación orientada a objetos',
      resumen: 'Lenguajes compilados (C, C++, Rust): un compilador traduce todo el programa a código máquina antes de ejecutarlo. Interpretados (Python, JavaScript): un intérprete lo va ejecutando línea a línea. Un IDE (VS Code, Thonny) reúne editor, ejecución y depurador. El control de versiones (Git) guarda el historial del código. Programación orientada a objetos: una clase es el molde (class); cada objeto es una pieza hecha con ese molde (new). Los objetos tienen atributos (datos, this.nombre) y métodos (acciones, saludar()). La herencia (extends) crea una clase a partir de otra; super llama a lo que hacía la clase madre.',
      paginas: [
        'Hay lenguajes **compilados** (C, C++, Rust): un compilador traduce todo el programa a código máquina antes de ejecutarlo. Y lenguajes **interpretados** (Python, JavaScript): un intérprete lo ejecuta línea a línea.',
        'Se programa en un **IDE** (VS Code, Thonny…), que junta el editor, la ejecución y el depurador. Y el código se guarda con **control de versiones** (Git): un historial de cada cambio, para volver atrás y trabajar en equipo.',
        'La **programación orientada a objetos** organiza el código como piezas de una fragua. Una **clase** es el **molde** (**class**); cada **objeto** es una pieza hecha con él (**new**).',
        'Los objetos tienen **atributos** (sus datos: **this.nombre**, **this.color**) y **métodos** (lo que saben hacer: **saludar()**).',
        'La **herencia** (**extends**) crea una clase a partir de otra: un Esqueleto es una Criatura con algo más. Y **super** llama a lo que ya hacía la clase madre.',
      ],
      despues: ['El molde tiene huecos. Rellenadlos y las criaturas cobrarán forma en la sala.'],
    },
    dispositivos: {
      titulo: 'Programar dispositivos y apps',
      resumen: 'Los dispositivos (microcontroladores como micro:bit o Arduino, móviles, relojes) se programan por eventos: el código espera a que pase algo (pulsar un botón, un sensor) y entonces reacciona. Una pantalla de LED se describe con datos: cada fila, una cadena de 0 y 1. Las apps móviles pueden ser nativas (para un sistema concreto, como Android o iOS), web (en el navegador) o híbridas. Hay entornos por bloques como App Inventor o MakeCode.',
      paginas: [
        'Los dispositivos —un **micro:bit**, un **Arduino**, un móvil, un reloj— casi siempre se programan **por eventos**: el código espera a que pase algo (pulsar un botón, que un sensor note luz) y entonces **reacciona**.',
        'Una pantalla de LED se describe con **datos**: una lista de filas, cada una con **0** (apagado) y **1** (encendido). Igual que una imagen es una tabla de píxeles.',
        'Las apps del móvil pueden ser **nativas** (hechas para Android o iOS), **web** (funcionan en el navegador) o **híbridas** (una web dentro de una app).',
        'Para empezar hay entornos por **bloques** como **MakeCode** o **App Inventor**, que luego se pueden ver como código.',
      ],
      despues: ['La placa de la pared debe mostrar la **runa de la puerta** cuando se pulse el botón **A**.'],
    },
    datos: {
      titulo: 'Leer y escribir datos (y comentar el código)',
      resumen: 'Los programas leen y escriben ficheros. Un CSV es texto con datos en columnas separadas por comas; la primera línea suele ser la cabecera. Para procesarlo: partir el texto en líneas (split por saltos de línea), cada línea en campos (split por comas), y acumular resultados (un contador por día). Comentar el código (// en JavaScript, # en Python) explica qué hace cada parte para quien lo lea después, incluido tú mismo.',
      paginas: [
        'Los programas leen y escriben **ficheros**. Uno muy común es el **CSV**: texto con datos en columnas separadas por **comas**. La primera línea suele ser la **cabecera**, con los nombres de las columnas.',
        'Para procesarlo: se parte el texto en **líneas**, cada línea en **campos** y se **acumula** lo que interese (por ejemplo, un contador por día).',
        'Y algo que distingue a un buen programador: **comentar el código** (**//** en JavaScript, **#** en Python). Un comentario explica qué hace cada parte a quien lo lea después… incluido tú dentro de un mes.',
      ],
      despues: ['El libro de registro tiene el código a medias. Completadlo para contar las visitas de cada día.'],
    },
  },

  // ---------- Sello 1 · El molde de las criaturas (POO) ----------
  molde: {
    titulo: 'El molde de las criaturas',
    enunciado: 'Rellenad los huecos para que el molde forje las criaturas. Al ejecutarlo, aparecerán en la sala.',
    codigo: [
      '// Una clase es el molde; cada objeto, una pieza hecha con él',
      '⟨0⟩ Criatura {',
      '  constructor(nombre, color) {',
      '    this.nombre = nombre;',
      '    this.color = color;',
      '  }',
      '  saludar() {',
      "    return 'Soy ' + this.nombre;",
      '  }',
      '}',
      '',
      '// Esqueleto hereda todo lo de Criatura y cambia saludar()',
      'class Esqueleto ⟨1⟩ Criatura {',
      '  saludar() {',
      "    return ⟨2⟩.saludar() + ' y doy miedo';",
      '  }',
      '}',
      '',
      "const huesitos = ⟨3⟩ Esqueleto('Huesitos', 'blanco');",
      "const chispa = new Criatura('Chispa', 'azul');",
      "const tibia = new Esqueleto('Tibia', 'gris');",
      'console.log(huesitos.⟨4⟩());',
    ].join('\n'),
    huecos: [
      { opciones: ['function', 'class', 'object', 'new'], correcta: 1, porque: 'Una clase se declara con class.' },
      { opciones: ['copia', '==', 'extends', 'implements'], correcta: 2, porque: 'La herencia en JavaScript se escribe con extends.' },
      { opciones: ['this', 'Criatura', 'parent', 'super'], correcta: 3, porque: 'super llama al método de la clase madre.' },
      { opciones: ['new', 'class', 'make', 'create'], correcta: 0, porque: 'Los objetos se crean a partir de una clase con new.' },
      { opciones: ['nombre', 'constructor', 'saludar', 'color'], correcta: 2, porque: 'saludar es un método: se llama con paréntesis.' },
    ],
    salida: 'Soy Huesitos y doy miedo',
    criaturas: [
      { nombre: 'Huesitos', tipo: 'esqueleto_minion' },
      { nombre: 'Chispa', tipo: 'mago_corrupto' },
      { nombre: 'Tibia', tipo: 'esqueleto_warrior' },
    ],
  },

  // ---------- Sello 2 · La placa de luces ----------
  placa: {
    titulo: 'La placa de luces',
    enunciado: 'Encended los LED para dibujar la **runa de la puerta** (la flecha de la derecha) y completad el código para que aparezca **al pulsar A**.',
    runa: ['00100', '01110', '10101', '00100', '00100'],
    codigo: [
      '// Placa de 5 × 5 LED: cada cadena es una fila; 1 = encendido',
      'const RUNA = [',
      '⟨RUNA⟩',
      '];',
      '',
      "placa.⟨0⟩('A', () => {",
      '  pantalla.⟨1⟩(RUNA);',
      '});',
    ].join('\n'),
    huecos: [
      { opciones: ['siempre', 'alPulsar', 'esperar', 'repetir'], correcta: 1, porque: 'El código reacciona a un evento: al pulsar el botón A.' },
      { opciones: ['borrar', 'apagar', 'mostrar', 'sumar'], correcta: 2, porque: 'Hay que mostrar la imagen en la pantalla.' },
    ],
  },

  // ---------- Sello 3 · El libro de registro ----------
  registro: {
    titulo: 'El libro de registro',
    enunciado: 'El fichero **pergamino_visitas.csv** guarda quién visitó la fragua. Completad el código (¡con su comentario!) para contar las visitas de cada día.',
    csv: [
      'fecha,dia,visitante',
      '01/10,lunes,Leo',
      '01/10,lunes,Nayra',
      '02/10,martes,Dani',
      '02/10,martes,Aitor',
      '02/10,martes,Leo',
      '03/10,miércoles,Nayra',
      '04/10,jueves,Dani',
      '04/10,jueves,Leo',
    ].join('\n'),
    codigo: [
      '⟨0⟩ Cuenta cuántas visitas hubo cada día',
      'function contarVisitas(texto) {',
      '  const contador = {};',
      "  const lineas = texto.trim().⟨1⟩('\\n').slice(1); // la primera línea es la cabecera",
      '  for (const linea of lineas) {',
      '    const [fecha, dia] = linea.split(⟨2⟩);',
      '    contador[dia] = (contador[dia] ?? 0) ⟨3⟩ 1;',
      '  }',
      '  return contador;',
      '}',
    ].join('\n'),
    huecos: [
      { opciones: ['#', '//', '<!--', '**'], correcta: 1, porque: 'En JavaScript, un comentario de una línea empieza por //.' },
      { opciones: ['join', 'push', 'split', 'sort'], correcta: 2, porque: 'split parte el texto en trozos (aquí, en líneas).' },
      { opciones: ["';'", "' '", "'-'", "','"], correcta: 3, porque: 'En un CSV los campos van separados por comas.' },
      { opciones: ['+', '-', '*', '='], correcta: 0, porque: 'Cada visita suma 1 al contador de su día.' },
    ],
    pregunta: {
      id: 'p12-r1', concepto: 'datos', criterio: '4.3', tipo: 'numero',
      texto: 'Mirad resumen.txt: ¿cuántas visitas hubo el martes?',
      valor: 3, tolerancia: 0, unidad: 'visitas',
      explicacion: 'Hay tres líneas con «martes»: Dani, Aitor y Leo.',
    },
  },

  pistas: {
    molde: 'El **molde de las criaturas** está en el lado oeste. Pulsad **E** junto a él.',
    placa: 'La **placa de luces** está en la pared norte. Pulsad **E** delante de ella.',
    registro: 'El **libro de registro** está en el lado este. Pulsad **E** junto al atril.',
    puerta: '¡La puerta del norte está abierta! Subid por la escalera.',
  },

  sellosRotos: [
    '¡Los tres sellos de la fragua están rotos! Las criaturas que habéis forjado os saludan.',
    'En el yunque central queda grabado un **recuerdo**.',
  ],

  memoria: [
    'Morvath y Aldric, jóvenes, escriben código a cuatro manos. Aldric deja comentarios en cada función: «para quien venga después».',
    'Morvath los borra uno a uno. «Si nadie entiende mi código, nadie podrá cambiarlo sin mí».',
    'Aldric guarda una copia de todo, con su historial. «El saber que no se comparte se pierde», le dice.',
    'Esa copia es la razón por la que todavía podéis subir. Seguid: el Observatorio está cerca.',
  ],

  preguntas: [
    {
      id: 'p12-01', concepto: 'poo', criterio: '4.3', tipo: 'opcion',
      texto: '¿Qué diferencia hay entre un lenguaje compilado y uno interpretado?',
      opciones: ['Ninguna', 'El compilado se traduce entero a código máquina antes de ejecutarse; el interpretado se ejecuta línea a línea', 'El interpretado no tiene bucles', 'El compilado solo funciona en móviles'],
      correcta: 1,
      explicacion: 'C o Rust se compilan antes; Python o JavaScript los ejecuta un intérprete sobre la marcha.',
    },
    {
      id: 'p12-02', concepto: 'poo', criterio: '4.3', tipo: 'opcion',
      texto: 'En programación orientada a objetos, ¿qué es una clase?',
      opciones: ['Un objeto concreto', 'El molde a partir del cual se crean objetos', 'Un error del programa', 'Una variable numérica'],
      correcta: 1,
      explicacion: 'La clase es el molde; con new se crean objetos (instancias) a partir de ella.',
    },
    {
      id: 'p12-03', concepto: 'poo', criterio: '4.3', tipo: 'opcion',
      texto: '¿Qué hace la herencia (extends)?',
      opciones: ['Borra una clase', 'Crea una clase nueva que reutiliza lo de otra y puede añadir o cambiar cosas', 'Copia un fichero', 'Ejecuta el programa más rápido'],
      correcta: 1,
      explicacion: 'La clase hija hereda atributos y métodos de la madre y puede sobrescribirlos.',
    },
    {
      id: 'p12-04', concepto: 'poo', criterio: '4.3', tipo: 'opcion',
      texto: '¿Para qué sirve un sistema de control de versiones como Git?',
      opciones: ['Para hacer el código más bonito', 'Para guardar el historial de cambios, volver atrás y trabajar en equipo', 'Para compilar', 'Para buscar en internet'],
      correcta: 1,
      explicacion: 'Git guarda cada versión del código: se puede comparar, deshacer y combinar el trabajo de varias personas.',
    },
    {
      id: 'p12-05', concepto: 'poo', criterio: '4.3', tipo: 'opcion',
      texto: '¿Qué es un IDE?',
      opciones: ['Un tipo de virus', 'Un entorno que reúne editor, ejecución y depurador para programar', 'Un lenguaje de programación', 'Un componente del ordenador'],
      correcta: 1,
      explicacion: 'VS Code o Thonny son IDE: facilitan escribir, ejecutar y depurar el código.',
    },
    {
      id: 'p12-06', concepto: 'dispositivos', criterio: '4.4', tipo: 'opcion',
      texto: '«Cuando se pulse el botón A, enciende la luz» es un ejemplo de programación…',
      opciones: ['por eventos', 'compilada', 'sin código', 'secuencial sin condiciones'],
      correcta: 0,
      explicacion: 'El programa reacciona a un evento (pulsar el botón). Así se programan casi todos los dispositivos.',
    },
    {
      id: 'p12-07', concepto: 'dispositivos', criterio: '4.4', tipo: 'opcion',
      texto: '¿Qué es una app web?',
      opciones: ['Una app que solo funciona sin internet', 'Una aplicación que funciona en el navegador, sin instalarla desde una tienda', 'Un virus', 'Una app solo para relojes'],
      correcta: 1,
      explicacion: 'Las apps web se usan desde el navegador; las nativas se instalan para un sistema concreto.',
    },
    {
      id: 'p12-08', concepto: 'dispositivos', criterio: '4.4', tipo: 'opcion',
      texto: 'En una placa de 5 × 5 LED, ¿qué representa la fila "10001"?',
      opciones: ['Todos encendidos', 'Encendidos solo el primero y el último', 'Todos apagados', 'Encendido solo el del centro'],
      correcta: 1,
      explicacion: 'Cada 1 es un LED encendido y cada 0, apagado.',
    },
    {
      id: 'p12-09', concepto: 'datos', criterio: '4.3', tipo: 'opcion',
      texto: '¿Qué es un fichero CSV?',
      opciones: ['Una imagen', 'Texto con datos en columnas separadas por comas', 'Un programa ejecutable', 'Un vídeo comprimido'],
      correcta: 1,
      explicacion: 'CSV significa «valores separados por comas»: se abre con una hoja de cálculo o se procesa con código.',
    },
    {
      id: 'p12-10', concepto: 'datos', criterio: '4.3', tipo: 'opcion',
      texto: '¿Por qué es importante comentar el código?',
      opciones: ['Porque el ordenador lo necesita para funcionar', 'Para que quien lo lea después (incluido tú) entienda qué hace cada parte', 'Para que ocupe más', 'No es importante'],
      correcta: 1,
      explicacion: 'El ordenador ignora los comentarios: son para las personas que mantendrán el código.',
    },
  ],
};
