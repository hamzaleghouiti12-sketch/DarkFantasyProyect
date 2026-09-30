// Piso V · El Taller de los Heraldos
// Currículo: Informática y Digitalización II (2.º Bachillerato, Canarias),
// saberes: base del bloque II (PLE, colaboración, versiones), II.1.1 Web y
// II.2.4 Accesibilidad. Criterios de evaluación 2.2 y 2.3.

// Imágenes que los alumnos pueden usar en sus carteles (assets/web/)
export const IMAGENES = ['aldric.jpg', 'torre.jpg', 'boveda.jpg'];

export default {
  id: 'piso5',
  nombre: 'Piso V · El Taller de los Heraldos',
  criterios: ['2.2', '2.3'],

  intro: [
    'Tinta, carteles, mesas de trabajo… Es **el Taller de los Heraldos**. Aquí Morvath fabrica los anuncios que cuelga por todo Umbravel.',
    'Usemos su propio taller contra él: vamos a crear un **cartel** para que todo el reino sepa que me tiene prisionero. Pero no con tinta: con **HTML y CSS**, como una página web de vuestro mundo.',
    'Tres sellos: el **cartel** (mesa del oeste), que se vea bien **en un móvil** (atril del norte) y **arreglar un cartel de Morvath** que nadie puede leer (mesa del este).',
    'Y junto a la entrada hay un **tablón de versiones**: echadle un vistazo, os sorprenderá.',
  ],

  lecciones: {
    ple: {
      titulo: 'Entorno personal de aprendizaje y trabajo en equipo',
      resumen: 'PLE (entorno personal de aprendizaje): las herramientas, fuentes y personas con las que cada uno aprende (buscadores, vídeos, apuntes en la nube, foros, compañeros). Herramientas colaborativas: documentos compartidos, tableros, videollamadas y chats, con permisos (lector, comentarista, editor). El historial de versiones guarda cada cambio con su autor y su fecha y permite volver atrás; los programadores usan sistemas de control de versiones como Git. Lenguaje inclusivo: comunicarse sin excluir ni estereotipar a nadie por su género, origen o capacidades.',
      paginas: [
        'Este tablón guarda la historia de **este mismo juego**. Mirad: cada línea es un cambio, con su fecha y su descripción. «La Torre de Morvath: Piso I jugable», «Chat para el modo equipo»…',
        'Es el **historial de versiones** de **Git**, un sistema que usan los programadores para guardar cada cambio, saber quién lo hizo y volver atrás si algo se rompe. Los documentos compartidos de vuestro instituto hacen lo mismo con su historial.',
        'Cada uno aprende con su propio **PLE** (entorno personal de aprendizaje): buscadores, vídeos, apuntes en la nube, foros… y personas. Para trabajar en equipo están las **herramientas colaborativas**: documentos compartidos, tableros de tareas, videollamadas. Ojo con los **permisos**: lector, comentarista o editor.',
        'Y al escribir en equipo, usad un **lenguaje inclusivo**: que nadie se quede fuera por su género, su origen o sus capacidades.',
      ],
    },
    web: {
      titulo: 'Páginas web: HTML, CSS y publicación',
      resumen: 'Una página web es un documento; un sitio web, un conjunto de páginas enlazadas. Estática: el mismo contenido para todos. Dinámica: se genera en el servidor para cada visita (una tienda, una red social). HTML da la estructura con etiquetas: h1-h6 (títulos), p (párrafos), img (imágenes, con alt), ul/ol y li (listas), a (enlaces, con href). CSS da el aspecto con reglas: selector { propiedad: valor; }. Un CMS (WordPress, Joomla) permite crear sitios sin programar. Para publicar: dominio → DNS → servidor (hosting) → URL. Diseño responsive: la página se adapta a cualquier pantalla, con @media.',
      paginas: [
        'Una **página web** es un documento; un **sitio web**, varias páginas enlazadas. Es **estática** si todos ven lo mismo, y **dinámica** si el servidor la genera para cada visita, como una tienda o una red social.',
        'La estructura se escribe en **HTML**, con **etiquetas**: **<h1>** para el título principal, **<p>** para un párrafo, **<img>** para una imagen, **<ul>** y **<li>** para una lista y **<a>** para un enlace.',
        'Las imágenes llevan siempre un atributo **alt** con una descripción: <img src="aldric.jpg" alt="Holograma del mago Aldric">. Los enlaces necesitan **href**, el destino: <a href="https://…">.',
        'El aspecto se escribe en **CSS**, con reglas: un **selector**, y entre llaves, **propiedades** con su **valor**. Por ejemplo: h1 { color: gold; } o body { background: #1a1420; }.',
        'Si no queréis programar, hay **CMS** como WordPress. Y para publicar: se compra un **dominio**, el **DNS** lo apunta a un **servidor** (hosting) y la página queda en una **URL**.',
      ],
      despues: [
        'Os he preparado el esqueleto del cartel. Tenéis que conseguir: **un h1**, **un párrafo**, **una imagen con alt**, **una lista de 3 elementos**, **un enlace** y **al menos 3 propiedades de CSS**.',
        'La lista de la derecha se va marcando sola. Cuando esté completa, pulsad **Entregar**.',
      ],
    },
    responsive: {
      titulo: 'Diseño responsive',
      resumen: 'Una web responsive se adapta al tamaño de la pantalla: móvil (unos 375 px de ancho), tableta o escritorio. Herramientas: unidades relativas (%, rem), imágenes con max-width: 100% para que nunca desborden, y consultas de medios: @media (max-width: 600px) { … } aplica reglas solo en pantallas estrechas.',
      paginas: [
        'Más de la mitad de las visitas a una web llegan desde un **móvil**. Si el cartel solo se ve bien en un ordenador, medio reino no podrá leerlo.',
        'Un diseño **responsive** se adapta a cualquier pantalla. Primer truco: las imágenes con **max-width: 100%**, así nunca se salen de la pantalla.',
        'Segundo truco: las **consultas de medios**. Todo lo que pongáis dentro de **@media (max-width: 600px) { … }** solo se aplica en pantallas estrechas: por ejemplo, un título más pequeño.',
      ],
      despues: ['Abrid vuestro cartel, probadlo con el botón de **375 px** (un móvil) y añadid una regla **@media** y el **max-width: 100%** para la imagen.'],
    },
    accesibilidad: {
      titulo: 'Accesibilidad web',
      resumen: 'Una web accesible la puede usar todo el mundo, también personas con discapacidad visual, auditiva, motora o cognitiva. Pautas WCAG. Ayudas técnicas: lector de pantalla, subtítulos, audiodescripción, dictado por voz, lupa, alto contraste. En el código: idioma de la página (html lang), texto alternativo en las imágenes (alt), contraste suficiente entre texto y fondo (al menos 4,5:1), títulos en orden (h1, h2, h3, sin saltos) y enlaces que digan adónde llevan (nunca «haz clic aquí»).',
      paginas: [
        'Morvath cuelga carteles que **no todos pueden leer**. Una web **accesible** es la que puede usar todo el mundo, también las personas con discapacidad visual, auditiva, motora o cognitiva.',
        'Existen ayudas técnicas: el **lector de pantalla** lee la página en voz alta; hay **subtítulos**, **audiodescripción**, **dictado por voz**, **lupa** y modos de **alto contraste**. Las pautas internacionales se llaman **WCAG**.',
        'Pero solo funcionan si el código ayuda. Cinco reglas de oro: indicar el **idioma** (<html lang="es">), poner **alt** a las imágenes y un **contraste** de al menos **4,5:1** entre texto y fondo.',
        'Y dos más: los **títulos en orden** (h1, luego h2, luego h3, sin saltos, porque el lector de pantalla los usa como índice) y **enlaces que digan adónde llevan**. «Haz clic aquí» no le dice nada a quien navega de enlace en enlace.',
      ],
      despues: ['El cartel de Morvath tiene **cinco fallos de accesibilidad**. Encontradlos y arregladlos: la lista os dirá cuáles quedan.'],
    },
  },

  // ---------- Sello 1 · El cartel «Se busca a Aldric» ----------
  cartel: {
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <title>Se busca a Aldric</title>
</head>
<body>
  <!-- 1. Un título principal con <h1> -->

  <!-- 2. Un párrafo con <p> que explique qué ha pasado -->

  <!-- 3. Una imagen: aldric.jpg, torre.jpg o boveda.jpg, con su alt -->

  <!-- 4. Una lista <ul> con al menos 3 <li>: cómo ayudar -->

  <!-- 5. Un enlace <a href="…"> -->

</body>
</html>`,
    css: `/* Al menos 3 propiedades. Por ejemplo: */
body {
  font-family: Georgia, serif;
}
`,
  },

  // ---------- Sello 3 · El cartel de Morvath, con 5 fallos de accesibilidad ----------
  auditoria: {
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Edicto de Morvath</title>
</head>
<body>
  <h1>Edicto del señor de la torre</h1>
  <img src="torre.jpg">
  <h4>Prohibido leer sin permiso</h4>
  <p>Todo libro de Umbravel pertenece desde hoy a la torre. Quien tenga un libro debe entregarlo antes de la luna llena.</p>
  <p>Para conocer las normas, <a href="normas.html">haz clic aquí</a>.</p>
</body>
</html>`,
    css: `body {
  font-family: Georgia, serif;
  background-color: #555555;
  color: #777777;
}
h1 {
  font-size: 2em;
}
`,
  },

  pistas: {
    cartel: 'La **mesa del oeste** abre el editor del cartel. Seguid los comentarios del esqueleto y mirad la lista de la derecha.',
    responsive: 'El **atril del norte** abre vuestro cartel en modo móvil: añadid **@media (max-width: …)** y **max-width: 100%** para la imagen.',
    auditoria: 'La **mesa del este** tiene el cartel de Morvath. Faltan: idioma, alt, contraste, orden de títulos y un enlace claro.',
    puerta: '¡La puerta del norte está abierta! Subid por la escalera.',
  },

  sellosRotos: [
    '¡Los tres sellos del taller están rotos! Vuestro cartel ya cuelga en la pared, y cualquiera puede leerlo.',
    'Mirad las mesas de los heraldos… la tinta se está ordenando sola. Otro **recuerdo**.',
  ],

  memoria: [
    'Años después de la discusión, Morvath ya no construye redes. Fabrica **carteles**: miles, colgados en cada plaza de Umbravel.',
    'Los carteles dicen solo lo que él quiere. Letras grises sobre fondo gris, imágenes sin descripción, enlaces que no llevan a ninguna parte. Quien no ve bien, quien no lee bien… simplemente no se entera.',
    '«La información es poder», escribe en su diario. «Y el poder se reparte con cuidado».',
    'Por eso vuestro cartel es tan importante: un mensaje que **todos** pueden leer es el primer hechizo contra Morvath. Seguid subiendo.',
  ],

  preguntas: [
    {
      id: 'p5-01', concepto: 'web', criterio: '2.2', tipo: 'opcion',
      texto: '¿Qué lenguaje se encarga de la estructura de una página web (títulos, párrafos, imágenes…)?',
      opciones: ['CSS', 'HTML', 'SQL', 'Python'], correcta: 1,
      explicacion: 'HTML marca la estructura con etiquetas; CSS se encarga del aspecto.',
    },
    {
      id: 'p5-02', concepto: 'web', criterio: '2.2', tipo: 'opcion',
      texto: 'En la regla CSS «h1 { color: gold; }», ¿qué es «h1»?',
      opciones: ['La propiedad', 'El valor', 'El selector', 'La etiqueta de cierre'], correcta: 2,
      explicacion: 'El selector indica a qué elementos se aplica; color es la propiedad y gold, el valor.',
    },
    {
      id: 'p5-03', concepto: 'web', criterio: '2.2', tipo: 'opcion',
      texto: 'Una tienda online muestra a cada cliente su carrito y sus pedidos. ¿Qué tipo de web es?',
      opciones: ['Estática', 'Dinámica', 'Vectorial', 'Offline'], correcta: 1,
      explicacion: 'El servidor genera la página para cada usuario: es dinámica.',
    },
    {
      id: 'p5-04', concepto: 'web', criterio: '2.2', tipo: 'orden',
      texto: 'Ordenad los pasos para publicar una web propia.',
      opciones: ['Registrar un dominio', 'Contratar un servidor (hosting)', 'Apuntar el dominio al servidor con el DNS', 'Subir los archivos al servidor', 'Visitar la URL'],
      explicacion: 'Dominio y servidor primero; el DNS los une; después se suben los archivos y la web ya responde en su URL.',
    },
    {
      id: 'p5-05', concepto: 'web', criterio: '2.2', tipo: 'opcion',
      texto: '¿Para qué sirve un CMS como WordPress?',
      opciones: ['Para comprimir imágenes', 'Para crear y gestionar un sitio web sin programarlo desde cero', 'Para proteger la red Wi-Fi', 'Para escribir en binario'],
      correcta: 1, explicacion: 'Un gestor de contenidos (CMS) permite publicar entradas y páginas desde un panel, sin tocar código.',
    },
    {
      id: 'p5-06', concepto: 'responsive', criterio: '2.2', tipo: 'opcion',
      texto: '¿Qué hace la regla «@media (max-width: 600px) { h1 { font-size: 1.5em; } }»?',
      opciones: [
        'Pone todos los títulos a 600 px.',
        'Hace el título más pequeño solo en pantallas de 600 px de ancho o menos.',
        'Impide ver la web en móviles.',
        'Reproduce un vídeo de 600 px.',
      ],
      correcta: 1, explicacion: 'Las reglas dentro de @media solo se aplican cuando se cumple la condición: aquí, pantallas estrechas.',
    },
    {
      id: 'p5-07', concepto: 'responsive', criterio: '2.2', tipo: 'opcion',
      texto: '¿Para qué se pone «max-width: 100%» a una imagen?',
      opciones: ['Para que ocupe siempre toda la pantalla', 'Para que nunca sea más ancha que su contenedor y no desborde en el móvil', 'Para hacerla transparente', 'Para que cargue más rápido'],
      correcta: 1, explicacion: 'La imagen conserva su tamaño si cabe, pero se encoge si la pantalla es más estrecha.',
    },
    {
      id: 'p5-08', concepto: 'accesibilidad', criterio: '2.2', tipo: 'opcion',
      texto: '¿Para qué sirve el atributo alt de una imagen?',
      opciones: ['Para darle un borde', 'Para describirla a quien no puede verla (el lector de pantalla lo lee)', 'Para que ocupe menos', 'Para ponerle un título encima'],
      correcta: 1, explicacion: 'El texto alternativo lo leen los lectores de pantalla, y aparece si la imagen no carga.',
    },
    {
      id: 'p5-09', concepto: 'accesibilidad', criterio: '2.2', tipo: 'opcion',
      texto: '¿Por qué «haz clic aquí» es un mal texto para un enlace?',
      opciones: ['Porque es demasiado corto', 'Porque no dice adónde lleva: fuera de contexto, no significa nada', 'Porque no se puede traducir', 'Porque los enlaces no pueden tener texto'],
      correcta: 1, explicacion: 'Quien usa un lector de pantalla salta de enlace en enlace: «Normas del reino» se entiende; «aquí», no.',
    },
    {
      id: 'p5-10', concepto: 'accesibilidad', criterio: '2.2', tipo: 'opcion',
      texto: '¿Qué contraste mínimo recomiendan las pautas WCAG para el texto normal?',
      opciones: ['1:1', '2:1', '4,5:1', '100:1'], correcta: 2,
      explicacion: '4,5:1 entre el color del texto y el del fondo (3:1 para textos grandes).',
    },
    {
      id: 'p5-11', concepto: 'accesibilidad', criterio: '2.2', tipo: 'opcion',
      texto: '¿Cuál de estas es una ayuda técnica para personas con discapacidad auditiva?',
      opciones: ['El lector de pantalla', 'Los subtítulos', 'La lupa', 'El ratón adaptado'], correcta: 1,
      explicacion: 'Los subtítulos permiten seguir el audio de un vídeo sin oírlo.',
    },
    {
      id: 'p5-12', concepto: 'ple', criterio: '2.3', tipo: 'opcion',
      texto: 'En un documento compartido, alguien borra por error la mitad del trabajo. ¿Qué herramienta lo soluciona?',
      opciones: ['El corrector ortográfico', 'El historial de versiones', 'El modo oscuro', 'Cambiar la contraseña'], correcta: 1,
      explicacion: 'El historial guarda cada versión con su autor y su fecha: se puede restaurar la anterior.',
    },
    {
      id: 'p5-13', concepto: 'ple', criterio: '2.3', tipo: 'opcion',
      texto: 'Quieres que el profesor pueda sugerir cambios en tu trabajo, pero no escribir directamente. ¿Qué permiso le das?',
      opciones: ['Lector', 'Comentarista', 'Editor', 'Propietario'], correcta: 1,
      explicacion: 'El comentarista puede dejar comentarios y sugerencias sin modificar el documento.',
    },
    {
      id: 'p5-14', concepto: 'ple', criterio: '2.3', tipo: 'opcion',
      texto: '¿Qué es un PLE?',
      opciones: [
        'Un tipo de cable de red.',
        'El conjunto de herramientas, fuentes y personas con las que cada uno aprende.',
        'Un lenguaje de programación.',
        'Una plataforma de pago obligatoria.',
      ],
      correcta: 1, explicacion: 'Entorno personal de aprendizaje: vuestros buscadores, vídeos, apuntes, foros… y compañeros.',
    },
  ],
};
