# La Torre de Morvath — Guía de pisos

**Cómo se reparte todo el currículo de Informática y Digitalización II (2.º de Bachillerato, Canarias) entre los pisos de la torre.**

Fuente: *Informatica-Digitalizacion-II_conceptos.pdf* (Decreto 78/2025, Anexo 2). 5 bloques de saberes y 13 criterios de evaluación.
Fecha: 30 de septiembre de 2026 · Estado del juego: casa de Aldric, camino exterior y Piso I terminados; modo equipo de 2 a 5 jugadores con chat.

---

## 1. La idea en una frase

Cada piso de la torre es **un tema del currículo convertido en un lugar**: su sala, sus desafíos, sus lecciones del holograma de Aldric y sus preguntas para la varita. Para subir al siguiente piso hay que **aprender y demostrar** lo de ese piso. Arriba del todo espera Morvath, y el combate final repasa todo el curso.

## 2. Un aviso antes de empezar: el público ha cambiado

El Piso I se escribió pensando en **ESO** (contraseñas, verificación en dos pasos y phishing a nivel básico). El documento nuevo es de **2.º de Bachillerato**, con alumnos de 17-18 años y un temario bastante más técnico (complemento a 2, máscaras de subred, SQL, programación orientada a objetos…).

**Propuesta:** mantener el Piso I como **piso tutorial** (aprender a jugar y repasar seguridad básica), pero **subirle el nivel** a sus preguntas (MFA, smishing, vishing, ingeniería social) para que no resulte infantil. El resto de pisos se diseñan ya para Bachillerato.

## 3. Reglas que siguen todos los pisos

1. **Enseñar primero, evaluar después.** Aldric explica cada concepto antes de pedir que se use, igual que en el Piso I.
2. **Tres sellos por piso.** Cada piso tiene 3 desafíos principales (los "sellos") y uno o dos opcionales. Al romper los tres, se abre la puerta.
3. **Cada desafío es una mecánica distinta.** Nada de exámenes disfrazados: el concepto se *usa* (conectar cables para hacer una red, mover palancas para escribir en binario, escribir HTML de verdad…).
4. **La varita repasa.** Sus preguntas salen de todo lo aprendido hasta ese momento, no solo del piso actual: es repaso espaciado.
5. **Cada piso se puede jugar suelto.** Para repasar para un examen (o la extraordinaria), habrá un *Portal de los pisos* para ir directo al que interese.
6. **En equipo, todos aprenden.** Las lecciones y los sellos se comparten; las preguntas de la varita son individuales. Algunos pisos tienen desafíos que **solo se pueden hacer en equipo** (y una variante para quien juegue solo).
7. **Cada pregunta está etiquetada con su criterio** (1.1, 3.2…), para poder dar al final un informe por criterios.

## 4. El mapa de la torre

| Piso | Nombre | Bloque | Saberes | Criterios |
|---|---|---|---|---|
| I | La Cámara de los Sellos *(ya existe)* | III | Contraseñas, 2FA/MFA, phishing (introducción) | 3.1, 3.3 |
| II | La Bóveda de la Memoria *(jugable desde el 30-09)* | I | I.1 Almacenamiento | 1.1 |
| III | El Scriptorium Binario *(jugable desde el 30-09)* | I | I.2 Codificación de la información | 1.1 |
| IV | Los Puentes Flotantes *(jugable desde el 30-09)* | I | I.3 Redes | 1.2 |
| V | El Taller de los Heraldos *(jugable desde el 30-09)* | II | Base del bloque II, II.1.1 Web, II.2.4 Accesibilidad | 2.2, 2.3 |
| VI | La Forja de las Formas *(jugable desde el 30-09)* | II | II.1.2 Modelado 3D, II.1.3 RV y RA (introducción) | 2.1 |
| VII | La Gran Biblioteca | II | II.2.1 Licencias, II.2.2 Bulos, II.2.3 Curación | 2.3, 3.3 |
| VIII | Las Criptas del Contagio | III | III.1.1 Seguridad, III.1.2 Malware | 3.1 |
| IX | El Tribunal de los Datos | III | III.2 Identificación electrónica, III.3 Protección de datos | 3.2, 3.3 |
| X | El Laberinto de las Sombras | III | III.4 Amenazas, III.5 Privacidad y bienestar | 3.3 |
| XI | El Taller de los Autómatas | IV | IV.1 Pensamiento computacional, IV.2 Elementos de programación | 4.1, 4.2 |
| XII | La Fragua del Código | IV | IV.3 Aplicaciones y POO | 4.3, 4.4 |
| XIII | El Observatorio del Oráculo | V | V.1 IA, big data y bases de datos | 4.3 |
| Cima | El Trono de Morvath | V + todos | V.2 RV/RA + repaso final | 4.5 + todos |

**13 pisos y la cima.** El orden sigue el de los bloques del currículo y va de lo más concreto (hardware) a lo más abstracto (programación e IA).

## 5. Piso a piso

### Piso I · La Cámara de los Sellos *(existe, se ajusta)*
- **Historia:** la base de la torre; Aldric os explica cómo funcionan los sellos.
- **Sellos:** el cartel del guardián (2FA), el altar de las contraseñas y los pergaminos de phishing.
- **Ajuste para Bachillerato:** preguntas nuevas sobre MFA, gestor de contraseñas, smishing, vishing e ingeniería social; un cuarto pergamino de *smishing* (SMS falso de paquetería).

### Piso II · La Bóveda de la Memoria — Almacenamiento (I.1)
- **Historia:** Morvath guarda aquí sus recuerdos robados; la bóveda se desmorona si no se protegen.
- **Sello 1 · El altar de los soportes:** llegan encargos ("una fotógrafa que viaja", "un archivo que debe durar 20 años", "un servidor que lee sin parar") y hay que elegir el soporte adecuado entre HDD, SSD NVMe, SSD SATA, cinta, Blu-ray, pendrive, tarjeta SD, NAS y nube, justificándolo por velocidad, capacidad, durabilidad, precio por GB o portabilidad.
- **Sello 2 · La balanza de las unidades:** ordenar y convertir cantidades (bit, byte, KB… PB) y descubrir por qué un disco "de 1 TB" muestra 931 GB (1000 frente a 1024).
- **Sello 3 · La cripta 3-2-1:** repartir tres copias de un recuerdo en dos tipos de soporte distintos y llevar una fuera de la torre por un portal. Los cofres explican la copia completa, incremental y diferencial.
- **Opcionales:** el sello de formato (FAT32, exFAT, NTFS o ext4 según el caso: "un archivo de 6 GB en un pendrive para Mac y Windows") y el candado de cifrado de unidad.

### Piso III · El Scriptorium Binario — Codificación (I.2)
- **Historia:** los escribas de Morvath escriben en un idioma de unos y ceros.
- **Sello 1 · La puerta de las ocho palancas:** cada palanca es un bit. Hay que formar números en binario, pasar a decimal y hexadecimal y, en la puerta roja, escribir un **número negativo en complemento a 2**.
- **Sello 2 · La inscripción:** un mensaje de Morvath escrito en códigos ASCII y Unicode (UTF-8) que hay que descifrar; una runa "especial" que no cabe en ASCII (un emoji) enseña por qué existe Unicode.
- **Sello 3 · El relicario de los formatos:** calcular cuánto pesa una imagen (ancho × alto × profundidad de color) y un audio (muestreo × bits × canales × segundos); clasificar formatos (JPG/PNG/SVG, WAV/MP3/FLAC, códec frente a contenedor) y decidir compresión con o sin pérdida.
- **Guiño:** Aldric muestra "el esqueleto" del propio personaje del jugador (su malla de vértices, aristas y caras) para explicar la imagen 3D y el formato glTF que usa el juego.

### Piso IV · Los Puentes Flotantes — Redes (I.3)
- **Historia:** el piso es un archipiélago de islas flotantes, como Canarias, y Morvath ha cortado todos los puentes.
- **Sello 1 · Tender la red:** conectar las islas con cables mágicos siguiendo una topología (estrella con un switch, malla para no depender de un solo puente…) y colocar cada dispositivo en su sitio: router, switch, punto de acceso, repetidor y módem/ONT. Un cable submarino entre dos islas enseña el papel de la red frente a la fragmentación del territorio canario.
- **Sello 2 · El oráculo de las direcciones:** configurar cada isla con su IP privada, máscara, puerta de enlace y DNS; distinguir IP estática de DHCP, pública de privada e IPv4 de IPv6.
- **Sello 3 · La terminal del vigía:** una consola donde se escriben `ipconfig`, `ping` y `tracert` de verdad (con respuestas simuladas) para encontrar dónde se ha cortado la conexión.
- **Opcionales:** el faro Wi-Fi (poner SSID, WPA3 y una contraseña robusta) y la chatarrería RAEE (decidir qué se reutiliza, qué se recicla y qué es obsolescencia programada).
- **Guiño:** Aldric explica que el propio modo equipo del juego es una red **P2P en estrella**.

### Piso V · El Taller de los Heraldos — Web y accesibilidad (II.1.1, II.2.4)
- **Historia:** hay que publicar un cartel de "Se busca a Aldric" que llegue a todo Umbravel.
- **Sello 1 · El pergamino vivo:** un editor de HTML y CSS dentro del juego, con vista previa al momento. Hay que construir el cartel con título, imagen, lista y enlace, y darle estilo con una hoja CSS.
- **Sello 2 · El espejo de los tamaños:** ver la misma página en móvil, tableta y ordenador y arreglarla para que sea adaptable (responsive).
- **Sello 3 · La auditoría del heraldo ciego:** un heraldo que "lee" las páginas con lector de pantalla encuentra los fallos de accesibilidad (imágenes sin texto alternativo, poco contraste, sin títulos) y hay que corregirlos siguiendo las pautas WCAG.
- **Opcional:** el mapa de la publicación (dominio, alojamiento, servidor, URL y CMS como WordPress o Google Sites).
- **Base del bloque II:** aquí se presenta el entorno personal de aprendizaje (PLE), el trabajo colaborativo con historial de versiones y el lenguaje inclusivo.

### Piso VI · La Forja de las Formas — Modelado 3D (II.1.2) y RV/RA (II.1.3)
- **Historia:** para abrir la puerta hay que forjar la llave que encaja en su cerradura.
- **Sello 1 · El yunque de las primitivas:** una herramienta de modelado real dentro del juego. Se añaden cubos, esferas y cilindros; se mueven, giran y escalan en los ejes X, Y, Z; se unen, restan e intersecan (operaciones booleanas) hasta que la llave coincide con el molde.
- **Sello 2 · La prueba del molde:** comprobar la pieza (vértices, aristas, caras) y exportarla en STL, con explicación del laminado para imprimirla en 3D. En clase, la llave se puede descargar e imprimir de verdad.
- **Sello 3 · El consejo de los artesanos:** elegir la herramienta adecuada para cada encargo (Tinkercad, SketchUp, Blender o FreeCAD) de forma razonada.
- **Opcional:** el visor de realidades (diferencias entre realidad virtual, aumentada y mixta), que prepara la cima.

### Piso VII · La Gran Biblioteca — Licencias, bulos y curación (II.2.1-II.2.3)
- **Historia:** Morvath ha llenado la biblioteca de libros falsos y copias robadas.
- **Sello 1 · La sala de las licencias:** colocar cada obra en su estantería según su licencia (copyright, dominio público, Creative Commons BY, SA, NC, ND y combinaciones; software libre, código abierto, propietario, freeware y shareware). **Guiño:** los modelos 3D del propio juego son CC0.
- **Sello 2 · El tablón de pregones:** noticias del reino que hay que verificar con herramientas: la lupa de búsqueda inversa de imágenes, la fecha, la autoría y el verificador (fact-checking). Se distinguen bulo, desinformación, información errónea, clickbait y deepfake, y se decide qué hacer con cada una.
- **Sello 3 · El buscador del bibliotecario:** encontrar un libro concreto construyendo la búsqueda con comillas, `site:`, `filetype:` y el signo menos, y después ordenar las cinco fases de la curación de contenidos.
- **Opcional:** la burbuja de filtros (cómo un algoritmo decide lo que ves).

### Piso VIII · Las Criptas del Contagio — Seguridad y malware (III.1.1, III.1.2)
- **Historia:** el primer piso con **enemigos**: las criaturas de Morvath son programas maliciosos.
- **Sello 1 · El bestiario del malware:** cada criatura se comporta como su tipo:
  - el **virus** se esconde en un cofre y necesita que lo abras;
  - el **gusano** se multiplica solo por los pasillos;
  - el **troyano** se disfraza de regalo;
  - el **ransomware** encierra un cofre y pide rescate;
  - el **spyware/keylogger** copia lo que haces;
  - la **botnet** son esqueletos manejados por un nigromante.
  Para desterrarlos hay que identificar el tipo con la varita y aplicar la contramedida correcta.
- **Sello 2 · La muralla cortafuegos:** decidir qué tráfico entra y qué no, y aplicar actualizaciones, cuentas sin privilegios y permisos de apps.
- **Sello 3 · La tríada:** proteger la confidencialidad, la integridad y la disponibilidad de un tesoro, cada una con su medida.
- **Opcional:** el pozo de la Wi-Fi pública (riesgos, VPN y HTTPS).

### Piso IX · El Tribunal de los Datos — Identificación electrónica y protección de datos (III.2, III.3)
- **Historia:** un tribunal donde los ciudadanos de Umbravel reclaman sus derechos.
- **Sello 1 · Los juicios:** casos prácticos en los que hay que aplicar el derecho correcto (acceso, rectificación, supresión, oposición, limitación, portabilidad), la edad mínima de consentimiento (14 años), quién es el responsable del tratamiento y el papel de la AEPD. Normativa: RGPD y LOPDGDD.
- **Sello 2 · El cofre de las dos llaves:** criptografía asimétrica hecha juego. **En equipo:** un jugador cierra el cofre con la clave pública de otro y solo ese otro puede abrirlo con su clave privada. **Solo:** lo hace el holograma de Aldric. Se explican el cifrado simétrico, el certificado digital (FNMT), el DNIe, Cl@ve, la firma electrónica y la sede electrónica.
- **Sello 3 · El espejo de la huella:** tu reflejo muestra la huella digital activa y pasiva que has ido dejando (cookies, publicaciones…); hay que configurar la privacidad y decidir qué borrar. Se tratan los derechos digitales: desconexión, testamento digital y neutralidad de la red.

### Piso X · El Laberinto de las Sombras — Amenazas, privacidad y bienestar (III.4, III.5)
- **Historia:** las sombras de Morvath imitan a personas para engañar.
- **Sello 1 · Los mensajes de las sombras:** conversaciones simuladas (el juego nunca contacta con nadie real) en las que hay que detectar las señales de ingeniería social, smishing, vishing, grooming, sextorsión o una tienda falsa, y elegir la respuesta correcta: no responder, guardar pruebas, bloquear y denunciar (INCIBE 017, Policía o Guardia Civil).
- **Sello 2 · El testigo:** una escena de ciberacoso a un compañero en la que el jugador decide cómo actuar como testigo.
- **Sello 3 · El reloj de arena:** bienestar digital (tiempo de pantalla, desconexión, nomofobia, FOMO), identidad digital positiva, netiqueta y violencias sexistas digitales (control del móvil de la pareja, difusión de imágenes sin consentimiento).
- **Cuidado:** son temas sensibles para menores. Se tratan con escenas simbólicas, sin contenido explícito, con el enfoque de INCIBE y **deben revisarlos un profesor u orientador** antes de usarse en clase.

### Piso XI · El Taller de los Autómatas — Pensamiento computacional (IV.1, IV.2)
- **Historia:** hay que programar un autómata de piedra para que cruce una sala llena de trampas.
- **Sello 1 · Las losas del diagrama:** colocar en el suelo losas con los símbolos de un diagrama de flujo (inicio, proceso, decisión, entrada/salida) para que la puerta se abra en el orden correcto. Se ven las fases del pensamiento computacional: descomponer, patrones, abstraer y diseñar el algoritmo.
- **Sello 2 · El autómata:** programarlo con bloques visuales (secuencia, condicional, bucle, variables, operadores) para que cruce el laberinto; el pseudocódigo se muestra a la vez.
- **Sello 3 · La depuración:** un autómata "roto" con un error de sintaxis y otro de lógica; hay que encontrarlos y corregirlos.
- **En equipo:** cada jugador programa un autómata y tienen que coordinarse para pisar las placas a la vez.

### Piso XII · La Fragua del Código — Aplicaciones y POO (IV.3)
- **Historia:** los autómatas de Morvath se fabrican aquí a partir de "moldes" (clases).
- **Sello 1 · Los moldes (POO):** definir la clase `Criatura` con atributos y métodos, crear objetos que **aparecen de verdad en la sala** y usar la herencia (`Esqueleto` hereda de `Criatura`).
- **Sello 2 · La placa del artífice:** programar una placa tipo micro:bit (una matriz de 5×5 luces y dos botones) para que muestre un símbolo que abre la puerta: una app para otro dispositivo.
- **Sello 3 · El libro de registro:** un programa que lee un "fichero" de datos (un pergamino), lo procesa y guarda el resultado; con el código comentado para que otro jugador pueda entenderlo. Aldric enseña el historial de versiones y a reutilizar código ajeno.
- **Conceptos transversales:** lenguajes por bloques y textuales, alto y bajo nivel, compilados e interpretados, qué es un IDE.

### Piso XIII · El Observatorio del Oráculo — IA, big data y bases de datos (V.1)
- **Historia:** el Oráculo de Morvath "lo sabe todo"… pero se equivoca, y alguien tiene que entrenarlo bien.
- **Sello 1 · Entrenar al oráculo:** aprendizaje supervisado de verdad. Se dan ejemplos etiquetados (pergaminos de phishing y legítimos, del Piso I) y el oráculo aprende a clasificarlos. Si los ejemplos están desequilibrados, **aprende mal**: así se ven los sesgos. Hay versiones visuales del aprendizaje no supervisado (agrupar cristales por color) y por refuerzo (un autómata que aprende un laberinto por recompensas).
- **Sello 2 · El archivo de Umbravel:** una consola SQL real sobre una base de datos del reino (tablas de prisioneros, celdas y guardias con claves primaria y foránea). Con `SELECT … WHERE` y `JOIN` se descubre **en qué celda está Aldric**.
- **Sello 3 · Las cinco uves:** clasificar ejemplos de big data (volumen, velocidad, variedad, veracidad y valor) y detectar una "alucinación" del oráculo generativo. Se tratan la ética, la privacidad y el Reglamento Europeo de IA.

### Cima · El Trono de Morvath — RV/RA (V.2) y jefe final
- **Sello de la cima · La visión aumentada:** diseñar una pequeña escena de realidad aumentada (objetos, activadores como un marcador, un QR o una ubicación, e interacción) que revela los puntos débiles de Morvath. Con un visor o un móvil compatible se puede ver en realidad virtual o aumentada de verdad (WebXR); sin él, en un modo simulado.
- **El combate final:** por fases, una por bloque del curso: repaso de los cinco bloques con todo el equipo.
- **El final:** el rescate de Aldric y la verdad sobre Morvath.

## 6. Historia de fondo (hilo narrativo)

- **Quién es Morvath:** fue el aprendiz más brillante de Aldric. Quiso "guardar todo el conocimiento del reino" y acabó vigilando, copiando y manipulando la información de todos.
- **Por qué encaja con el temario:** almacenamiento, datos personales, desinformación, IA.
- **Cómo se descubre:** cada piso deja un **fragmento de memoria** que se desvela al romper el tercer sello.
- **El final:** el mensaje no es "la tecnología es mala", sino "depende de quién la use y para qué".

## 7. Cobertura: todos los criterios tienen su piso

| Criterio | Qué se demuestra | Pisos |
|---|---|---|
| 1.1 | Almacenamiento, codificación y protección de datos | II, III |
| 1.2 | Redes: conexión, configuración, mantenimiento y sostenibilidad | IV |
| 2.1 | Modelado 3D | VI |
| 2.2 | Publicar contenidos web | V |
| 2.3 | Buscar, seleccionar y organizar información respetando licencias | V, VII |
| 3.1 | Seguridad de la información, huella digital y malware | I, VIII, IX |
| 3.2 | Protección de datos y derechos digitales | IX |
| 3.3 | Amenazas, identificación electrónica y fiabilidad de la información | I, VII, IX, X |
| 4.1 | Pensamiento computacional | XI |
| 4.2 | Diagramas de flujo y algoritmos | XI |
| 4.3 | IDE, tratamiento de datos, comentar código, IA y datos | XII, XIII |
| 4.4 | Programar apps para dispositivos variados | XII |
| 4.5 | Diseñar aplicaciones de RV y RA | VI (introducción), Cima |

Todos los saberes del documento tienen sitio; la tabla completa, saber a saber, está en el plan técnico (`ContextWindow/PLAN_TECNICO.md`, apéndice A).

## 8. Orden de construcción recomendado

No hace falta construirlos en orden de subida. Propuesta:

1. **Primero la base técnica** (sistema de pisos genérico, informes por criterio, Portal de los pisos). Sin esto, cada piso nuevo costaría el doble.
2. **Piso II y Piso III.** Reutilizan casi todo lo que ya existe (el escenario de mazmorra y mecánicas de "elegir" y "clasificar").
3. **Piso IV (redes).** Estrena las mecánicas de "conectar" y "terminal", que luego se reutilizan.
4. **Pisos V y VII.** Mucho contenido y mecánicas de interfaz (editor, estanterías).
5. **Pisos VIII a X.** Los enemigos (piden descargar un pack nuevo de KayKit, con tu aprobación) y los temas sensibles (con revisión docente).
6. **Pisos XI y XII (programación).** Las mecánicas más complejas.
7. **Piso VI y XIII.** Modelado 3D, SQL e IA: las librerías más nuevas.
8. **La cima y el jefe final.**

**Estimación:** entre 2 y 3 sesiones de trabajo por piso, y alguna más para la base técnica y la cima. En total, del orden de **35 a 45 sesiones**.

## 9. Decisiones que tienes que tomar tú

1. **¿Para quién es el juego: ESO, Bachillerato o ambos?** (cambia la dificultad y el tono).
2. **¿Revisará un profesor los temas sensibles del Piso X?** (muy recomendable).
3. **¿Se quiere un informe para el profesor?** Sería un archivo que se descarga al final, sin servidores ni datos personales en internet.
4. **¿Se aprueba descargar el pack KayKit Skeletons (CC0)** para los enemigos del Piso VIII?
5. **¿Publicamos en GitHub Pages?** Es gratis y hace falta HTTPS para la realidad virtual y aumentada de la cima.
