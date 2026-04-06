/* ===== ZeroPFAS Chatbot v5 — Intent Classification + Bilingual Smart FAQ (ES/EN) ===== */
(function () {
  'use strict';

  /* ================================================================
     KNOWLEDGE BASE — Massively expanded keywords, semantic coverage
     Every possible phrasing of a question should match something.
     ================================================================ */
  var KB = {
    es: {
      greetings: [
        '¡Hola! 👋 Soy el asistente virtual de <strong>ZeroPFAS</strong>. Estoy aquí para resolver tus dudas sobre PFAS y nuestra tecnología.',
        '¡Bienvenido! 👋 Soy el asistente de <strong>ZeroPFAS</strong>. Pregúntame lo que necesites sobre contaminantes eternos, nuestra tecnología o el producto.'
      ],
      goodbye: '¡Gracias por tu interés en ZeroPFAS! Si necesitas algo más, aquí estaré. 🧪',
      thanksReply: '¡De nada! Si tienes más preguntas, no dudes en escribir. 😊',
      smartFallback: 'Quizás pueda ayudarte con alguno de estos temas:',
      defaultSuggestions: ['¿Qué son los PFAS?', 'Tecnología SCWO', 'Ver el producto', 'Normativa 2026'],
      faq: [
        {
          id: 'pfas-intro',
          keywords: [
            'que son', 'qué son', 'pfas', 'forever chemicals', 'contaminantes eternos', 'sustancias perfluoradas',
            'explicar pfas', 'definicion', 'significan', 'que significa', 'perfluor', 'polifluor',
            'quimicos eternos', 'quimicos persistentes', 'compuestos', 'sinteticos', 'contaminante',
            'que es pfas', 'que son pfas', 'informacion pfas', 'info pfas', 'sobre pfas', 'acerca pfas',
            'enlace c-f', 'enlace carbono', 'carbono fluor', 'fluor', 'fluorado', 'antiadherente',
            'teflon', 'espuma', 'impermeabilizante', 'contaminacion', 'polución', 'contaminan',
            'que contamina', 'sustancia quimica', 'compuesto quimico', 'toxico persistente',
            '4700', '4 700', '1950', '485', 'degradacion', 'no se degrada', 'no se destruye',
            'saber mas', 'que es esto', 'de que va', 'de que trata', 'explicame', 'explicar',
            'cuéntame', 'cuentame', 'dime', 'informacion'
          ],
          answer: 'Los <strong>PFAS</strong> (sustancias per- y polifluoroalquiladas) son más de <strong>4 700 compuestos sintéticos</strong> usados desde 1950 en productos antiadherentes, impermeabilizantes y espumas contra incendios.\n\nSe les llama «contaminantes eternos» porque su enlace C–F (<strong>485 kJ/mol</strong>) resiste toda degradación natural. Se encuentran en agua, suelos y organismos vivos de todo el planeta.',
          followUp: ['¿Son peligrosos?', '¿Cómo se eliminan?', 'Normativa vigente'],
          weight: 1.0
        },
        {
          id: 'pfas-danger',
          keywords: [
            'peligro', 'salud', 'riesgo', 'cancer', 'dañino', 'daño', 'toxico', 'toxica', 'toxicidad',
            'bioacumula', 'peligrosos', 'efectos', 'enfermedad', 'malo', 'nocivo', 'veneno',
            'mortal', 'letal', 'hace daño', 'hace mal', 'afecta', 'problema salud', 'consecuencia',
            'organismo', 'cuerpo', 'sangre', 'higado', 'riñon', 'tiroides', 'sistema inmune',
            'inmunologico', 'feto', 'fetal', 'embarazo', 'niños', 'bebes', 'poblacion',
            'preocupante', 'preocupar', 'grave', 'gravedad', 'serio', 'importante',
            'dañan', 'mata', 'enfermar', 'provocan', 'causan', 'producen', 'generan',
            'acumulan', 'acumulacion', 'bioacumulacion', 'hormona', 'endocrino', 'disruptor',
            'me puede afectar', 'es peligroso', 'son peligrosos', 'son malos', 'son dañinos',
            'por que preocuparse', 'porque preocuparse', 'deberia preocupar', 'son seguros',
            'hacen daño', 'son nocivos', 'que pasa si', 'riesgo sanitario'
          ],
          answer: 'Los PFAS representan un riesgo grave para la salud:\n\n• <strong>Bioacumulación</strong> — se acumulan en sangre, hígado y riñones\n• <strong>Cáncer</strong> — asociados a cáncer de riñón, testicular y tiroides\n• <strong>Sistema inmune</strong> — reducen la respuesta a vacunas\n• <strong>Desarrollo</strong> — afectan al crecimiento fetal\n\nEl <strong>98 %</strong> de la población mundial tiene PFAS detectables en sangre.',
          followUp: ['¿Cómo se eliminan?', '¿Qué producto ofrecen?', '¿Hay normativa?'],
          weight: 1.0
        },
        {
          id: 'scwo',
          keywords: [
            'scwo', 'supercritica', 'destruccion', 'oxidacion', 'como destruyen', 'eliminar pfas',
            'como funciona', 'tecnologia', 'proceso', 'metodo', 'solucion tecnica', 'tratamiento',
            'agua supercritica', 'oxidacion supercritica', 'reactor', 'reaccion', 'quimica',
            'descomponer', 'romper enlace', 'romper', 'degradar', 'destruir', 'eliminar',
            'temperatura', 'presion', '374', 'supercritico', 'grado',
            'como lo hacen', 'como lo haceis', 'como funcionais', 'que tecnologia', 'que metodo',
            'como se hace', 'como eliminais', 'como destruis', 'con que', 'mediante que',
            'mecanismo', 'innovacion', 'investigacion', 'ciencia', 'procedimiento',
            'como trabaja', 'como opera', 'tipo tecnologia', 'base cientifica',
            'co2', 'h2o', 'fluoruro', 'conversion', 'transformar', 'convertir',
            'que hacen', 'que haceis', 'a que os dedicais', 'a que se dedican',
            'vuestra tecnologia', 'su tecnologia', 'solucion', 'propuesta'
          ],
          answer: 'Usamos <strong>SCWO</strong> (Oxidación con Agua Supercrítica):\n\n<strong>1.</strong> El agua se lleva a >374 °C y >22,1 MPa (condiciones supercríticas)\n<strong>2.</strong> En ese estado, el agua actúa como disolvente y oxidante simultáneamente\n<strong>3.</strong> Los enlaces C–F se rompen por completo\n<strong>4.</strong> Los PFAS se convierten en <strong>CO₂ + H₂O + F⁻</strong>\n\nTasa de destrucción: <strong>>99,9 %</strong> verificada.',
          followUp: ['¿Cómo lo verifican?', 'Solución industrial', 'Ver el producto'],
          weight: 1.0
        },
        {
          id: 'product',
          keywords: [
            'producto', 'dispositivo', 'filtro', 'cartucho', 'point-of-use', 'bajo fregadero',
            'punto de uso', 'comprar', 'instalar', 'instalacion', 'aparato', 'equipo', 'maquina',
            'membrana', 'nanofiltracion', 'purificador', 'purificar', 'depurador',
            'hogar', 'domestico', 'casa', 'cocina', 'fregadero', 'grifo',
            'como se instala', 'que venden', 'que vendeis', 'que ofrecen', 'que ofreceis',
            'tienen producto', 'teneis producto', 'para mi casa', 'para casa',
            'uso domestico', 'uso personal', 'residencial', 'vivienda', 'particular',
            'osmosis', 'jarra', 'brita', 'purificacion', 'depuracion', 'filtrado', 'filtracion',
            'limpiar agua', 'tratar agua', 'agua limpia', 'agua pura', 'potabilizar',
            'sistema', 'sistema filtracion', 'ver producto', 'quiero comprar', 'donde comprar',
            'adquirir', 'obtener', 'conseguir', 'disponible', 'venta', 'tienda', 'comercializar'
          ],
          answer: 'Nuestro dispositivo <strong>point-of-use</strong> se instala bajo el fregadero doméstico:\n\n• 🔬 <strong>Membrana de nanofiltración</strong> para captura de PFAS\n• 🔄 <strong>Cartucho reemplazable</strong> con chip NFC integrado\n• 📱 <strong>Conexión a plataforma</strong> de monitorización en tiempo real\n• ✅ <strong>Agua filtrada</strong> que cumple normativa EPA y EU\n\nDiseño compacto, silencioso y sin necesidad de electricidad para el filtrado.',
          followUp: ['¿Cómo funciona el NFC?', '¿Cuánto cuesta?', 'Tecnología SCWO'],
          weight: 1.0
        },
        {
          id: 'regulation',
          keywords: [
            'normativa', 'regulacion', 'epa', 'directiva', 'eu', 'echa', 'legal', 'legislacion',
            'limite', 'mcl', 'ley', 'obligatorio', '2026', 'europa', 'europeo', 'europeas',
            'estados unidos', 'eeuu', 'usa', 'america', 'gobierno', 'legislar',
            'prohibir', 'prohibicion', 'restriccion', 'restringir', 'permitido', 'ilegal',
            'regulado', 'cumplir', 'cumplimiento', 'directiva europea', 'norma',
            'ng/l', 'nanogramo', 'microgramo', 'µg', 'concentracion maxima',
            'agua potable', 'potabilidad', 'calidad agua', 'estandar', 'requisito',
            'pfoa', 'pfos', 'pfas regulacion', 'leyes pfas', 'nueva normativa',
            'cuando', 'cuando entra', 'fecha limite', 'plazo', 'vigente', 'vigor'
          ],
          answer: 'Las principales regulaciones vigentes y próximas:\n\n🇺🇸 <strong>EPA (EE.UU.)</strong>\nMCL de <strong>4 ng/L</strong> para PFOA y PFOS — en vigor desde 2026\n\n🇪🇺 <strong>Directiva EU 2020/2184</strong>\nLímite total de <strong>0,5 µg/L</strong> para PFAS en agua potable\n\n🔬 <strong>ECHA</strong>\nPropuesta de restricción universal de todos los PFAS en Europa — la más amplia de la historia',
          followUp: ['¿Cómo cumplimos?', 'Ver el producto', '¿Qué son los PFAS?'],
          weight: 1.0
        },
        {
          id: 'verification',
          keywords: [
            'verificacion', 'prueba', 'analisis', 'lc-ms', 'fluoruro', 'balance',
            'demostrar', 'comprobar', 'medir', 'certificar', 'evidencia', 'dato',
            'garantia', 'seguridad', 'funciona de verdad', 'realmente funciona', 'eficaz', 'eficacia',
            'efectividad', 'efectivo', 'resultado', 'laboratorio', 'lab', 'test',
            'como saben', 'como sabeis', 'como verifican', 'como comprueban', 'como miden',
            'como demuestran', 'como prueban', 'esta comprobado', 'esta probado', 'certificado',
            'que garantia', 'fiable', 'fiabilidad', 'confiable', 'preciso', 'precision',
            'tof', 'organofluor', 'espectrometria', 'masa', 'cromatografia',
            'pruebas', 'testing', 'medicion'
          ],
          answer: 'Nuestro sistema de verificación en tres etapas:\n\n<strong>1. LC-MS/MS</strong>\nAnálisis cuantitativo individual — identifica y mide cada PFAS presente\n\n<strong>2. Fluoroorgánico total (TOF)</strong>\nCombustión oxidativa para medir todo el flúor orgánico\n\n<strong>3. Balance de fluoruro</strong>\nSe compara el F⁻ inorgánico liberado con el flúor orgánico destruido. Si coinciden → <strong>eliminación completa confirmada</strong>',
          followUp: ['Tecnología SCWO', 'Solución industrial', 'Normativa'],
          weight: 1.0
        },
        {
          id: 'industrial',
          keywords: [
            'industrial', 'escala', 'gran escala', 'planta', '1000', 'tratamiento industrial',
            'municipio', 'municipal', 'grande', 'empresa', 'fabrica', 'factoria',
            'ciudad', 'pueblo', 'comunidad', 'estacion depuradora', 'depuradora', 'edar',
            'potabilizadora', 'etap', 'abastecimiento', 'suministro', 'infraestructura',
            'grandes volumenes', 'mucha agua', 'masivo', 'comercial', 'negocio',
            'escalable', 'escalabilidad', 'modular', 'ampliable', 'capacidad',
            'para empresas', 'para ciudades', 'para municipios', 'uso industrial',
            'metros cubicos', 'toneladas', 'litros', 'caudal', 'volumen'
          ],
          answer: 'Nuestra solución industrial está diseñada para grandes volúmenes:\n\n• 📊 Capacidad: <strong>>1 000 m³/día</strong>\n• 🧱 Arquitectura <strong>modular</strong> — escala horizontal según demanda\n• 📡 Monitorización en <strong>tiempo real</strong>\n• 📋 Cumplimiento con regulaciones locales e internacionales\n\nIdeal para plantas de tratamiento de agua, parques industriales y gestión municipal.',
          followUp: ['Ver el producto doméstico', '¿Cómo lo verifican?', 'Contactar'],
          weight: 1.0
        },
        {
          id: 'nfc',
          keywords: [
            'nfc', 'trazabilidad', 'monitorizacion', 'rastreo', 'app', 'seguimiento', 'chip',
            'smart', 'inteligente', 'movil', 'telefono', 'smartphone', 'aplicacion',
            'cuando cambiar', 'aviso', 'alerta', 'notificacion', 'recambio', 'repuesto',
            'vida util', 'duracion', 'cuanto dura', 'reemplazar', 'sustituir', 'cambiar cartucho',
            'gestion', 'residuo', 'reciclaje', 'reciclar', 'desechar',
            'digital', 'conectado', 'iot', 'internet', 'plataforma', 'dashboard',
            'como funciona nfc', 'que es nfc', 'para que sirve el chip', 'lectura nfc'
          ],
          answer: 'Cada cartucho integra un <strong>chip NFC</strong> que permite:\n\n• 📦 Registro de <strong>instalación</strong> (fecha, ubicación)\n• 📈 Seguimiento del <strong>uso acumulado</strong> en tiempo real\n• 🔔 <strong>Alertas de reemplazo</strong> antes del agotamiento\n• ♻️ <strong>Gestión de residuos</strong> — trazabilidad completa del cartucho agotado\n\nTodo accesible desde tu smartphone con un simple toque NFC.',
          followUp: ['Ver el producto', '¿Cuánto cuesta?', 'Tecnología SCWO'],
          weight: 1.0
        },
        {
          id: 'contact',
          keywords: [
            'contacto', 'email', 'correo', 'escribir', 'hablar con alguien', 'soporte',
            'ayuda humana', 'persona real', 'hablar persona', 'responsable',
            'linkedin', 'red social', 'como contactar', 'como llegar', 'telefono', 'llamar',
            'reunion', 'cita', 'demo', 'demostracion', 'presentacion',
            'quiero hablar', 'necesito contactar', 'comunicar', 'mensaje', 'enviar',
            'formulario', 'form', 'rellenar', 'mis datos', 'donde escribo', 'donde contacto'
          ],
          answer: '¡Por supuesto! Puedes contactarnos de varias formas:\n\n• 📝 <a href="#contact">Formulario de contacto</a> en esta web\n• 💼 Perfil de LinkedIn (enlace en el footer)\n\nTe responderemos lo antes posible.',
          followUp: ['¿Qué son los PFAS?', 'Ver el producto', 'Normativa'],
          weight: 1.0
        },
        {
          id: 'team',
          keywords: [
            'daniel', 'martinez', 'onofre', 'quien', 'equipo', 'fundador', 'investigador',
            'creador', 'detras', 'autor', 'responsable', 'inventor', 'cientifico',
            'quien esta detras', 'quien creo', 'quien invento', 'quien fundo', 'quienes sois',
            'quienes son', 'sobre vosotros', 'sobre ustedes', 'la empresa', 'startup',
            'proyecto', 'historia', 'origen', 'como empezo', 'como surgió', 'como nacio',
            'experiencia', 'trayectoria', 'curriculum', 'perfil', 'quimico', 'quimica'
          ],
          answer: '<strong>ZeroPFAS Solutions</strong> es un proyecto de investigación liderado por <strong>Daniel Martínez Onofre</strong>, químico especializado en la eliminación de PFAS.\n\nSu enfoque integra captura, destrucción mediante SCWO y verificación analítica — una estrategia completa que va más allá de simplemente filtrar.',
          followUp: ['Tecnología SCWO', '¿Qué son los PFAS?', 'Contactar'],
          weight: 1.0
        },
        {
          id: 'pricing',
          keywords: [
            'coste', 'costo', 'precio', 'cuanto cuesta', 'presupuesto', 'tarifas', 'inversion',
            'barato', 'caro', 'economico', 'asequible', 'accesible', 'pagar', 'comprar',
            'valor', 'cuanto vale', 'que cuesta', 'rango precio', 'oferta', 'descuento',
            'financiacion', 'financiar', 'pagar plazos', 'suscripcion', 'mensual', 'anual',
            'cuanto es', 'cuanto cobran', 'cuanto cobrais', 'tarifa', 'plan',
            'que precio tiene', 'a que precio', 'cuanto sale'
          ],
          answer: 'El precio varía según la escala de implementación:\n\n• 🏠 <strong>Point-of-use</strong> (doméstico) — dispositivo + suscripción de cartuchos\n• 🏭 <strong>Industrial</strong> — proyecto personalizado según volumen\n\nContacta con nosotros en el <a href="#contact">formulario</a> y te enviaremos una propuesta adaptada a tus necesidades.',
          followUp: ['Ver el producto', 'Solución industrial', 'Contactar'],
          weight: 1.0
        },
        {
          id: 'water-safe',
          keywords: [
            'agua segura', 'agua potable', 'beber', 'grifo', 'mi agua', 'agua de casa',
            'contaminada', 'purificar', 'limpiar', 'tratar', 'potable',
            'puedo beber', 'es segura', 'esta limpia', 'tiene pfas', 'hay pfas',
            'agua del grifo', 'calidad del agua', 'analizar agua', 'test agua',
            'mi grifo', 'agua corriente', 'red agua', 'agua publica', 'embotellada',
            'mi pueblo', 'mi ciudad', 'mi zona', 'mi region', 'mi casa tiene',
            'preocupado', 'preocupada', 'miedo', 'afecta mi', 'riesgo en mi',
            'tengo pfas', 'hay contaminacion', 'agua contaminada', 'contaminar agua'
          ],
          answer: 'Es difícil saber si tu agua contiene PFAS sin un análisis específico. Los filtros convencionales <strong>no eliminan</strong> la mayoría de PFAS.\n\nNuestro dispositivo point-of-use está diseñado exactamente para esto: captura PFAS con membrana de nanofiltración y lo verifica en tiempo real.\n\n¿Quieres saber más sobre el producto o la normativa de tu zona?',
          followUp: ['Ver el producto', 'Normativa 2026', '¿Son peligrosos?'],
          weight: 1.0
        },
        {
          id: 'difference',
          keywords: [
            'diferencia', 'ventaja', 'mejor', 'competencia', 'comparar', 'otros', 'por que zeropfas',
            'unico', 'especial', 'innovador', 'diferente', 'novedoso', 'nuevo',
            'que os diferencia', 'que os hace diferentes', 'por que elegirnos', 'por que elegiros',
            'mejor que', 'frente a', 'versus', 'vs', 'alternativa',
            'que aportan', 'que aportais', 'valor añadido', 'propuesta valor',
            'por que vosotros', 'por que ustedes', 'ventajas', 'beneficios',
            'carbon activado', 'simplemente filtrar', 'solo filtrar', 'retener',
            'no destruyen', 'no eliminan', 'otros metodos', 'otros sistemas'
          ],
          answer: 'Lo que nos diferencia:\n\n• 🔥 <strong>Destrucción real</strong> — no solo filtramos, eliminamos los PFAS por completo con SCWO\n• ✅ <strong>Verificación triple</strong> — LC-MS/MS + TOF + balance de fluoruro\n• 📱 <strong>Trazabilidad NFC</strong> — seguimiento completo del ciclo de vida\n• 📊 <strong>Escalabilidad</strong> — desde tu hogar hasta plantas industriales\n\nLa mayoría de soluciones solo retienen PFAS; nosotros los <strong>destruimos y lo demostramos</strong>.',
          followUp: ['Tecnología SCWO', '¿Cómo lo verifican?', 'Contactar'],
          weight: 1.0
        },
        {
          id: 'zeropfas-about',
          keywords: [
            'zeropfas', 'zero pfas', 'que es zeropfas', 'de que va', 'de que trata',
            'que sois', 'que son', 'quienes sois', 'quienes son', 'empresa',
            'a que se dedican', 'a que os dedicais', 'que ofrecen', 'que ofreceis',
            'mision', 'vision', 'objetivo', 'proposito', 'para que', 'que pretenden',
            'de que va esta web', 'de que es esta pagina', 'que es esto', 'donde estoy',
            'presentacion', 'resumen', 'descripcion', 'sobre', 'acerca'
          ],
          answer: '<strong>ZeroPFAS Solutions</strong> es un proyecto de investigación dedicado a la eliminación verificable de PFAS — los «contaminantes eternos».\n\nNuestra estrategia integra:\n• 🔬 <strong>Captura</strong> — dispositivos point-of-use con nanofiltración\n• ⚗️ <strong>Destrucción</strong> — tecnología SCWO (Oxidación con Agua Supercrítica)\n• ✅ <strong>Verificación</strong> — análisis triple (LC-MS/MS + TOF + balance de fluoruro)\n\nDesde soluciones domésticas hasta industriales (>1 000 m³/día).',
          followUp: ['¿Qué son los PFAS?', 'Tecnología SCWO', 'Ver el producto'],
          weight: 1.2
        },
        {
          id: 'environment',
          keywords: [
            'medio ambiente', 'ecologia', 'ecologico', 'sostenible', 'sostenibilidad',
            'naturaleza', 'planeta', 'tierra', 'ecosistema', 'biodiversidad',
            'rio', 'lago', 'mar', 'oceano', 'acuifero', 'subterranea',
            'suelo', 'tierra', 'alimento', 'comida', 'cadena alimentaria',
            'animal', 'pez', 'peces', 'fauna', 'flora', 'impacto ambiental',
            'medioambiental', 'verde', 'limpio', 'huella', 'residuo', 'vertido',
            'reciclaje', 'donde van', 'que pasa despues', 'impacto', 'consecuencia ambiental'
          ],
          answer: 'Los PFAS son un problema ambiental global:\n\n• 🌊 Contaminan <strong>ríos, lagos, acuíferos y océanos</strong>\n• 🌱 Se acumulan en <strong>suelos y cadena alimentaria</strong>\n• 🐟 Se detectan en <strong>peces, aves y mamíferos</strong> de todo el mundo\n• ♾️ No se degradan naturalmente — persisten <strong>miles de años</strong>\n\nNuestra tecnología SCWO no solo los retira del agua, sino que los <strong>destruye completamente</strong>, generando solo CO₂, agua y fluoruro inorgánico.',
          followUp: ['Tecnología SCWO', '¿Qué son los PFAS?', '¿Son peligrosos?'],
          weight: 1.0
        },
        {
          id: 'how-to-help',
          keywords: [
            'que puedo hacer', 'como ayudo', 'como colaboro', 'como participo',
            'como protegerme', 'proteger', 'prevencion', 'prevenir', 'evitar',
            'reducir exposicion', 'minimizar', 'que hago', 'consejos', 'recomendaciones',
            'como me protejo', 'estoy expuesto', 'estoy en riesgo',
            'quien puede ayudar', 'soluciones disponibles', 'que alternativa',
            'pasos', 'acciones', 'medidas', 'puedo contribuir', 'quiero ayudar',
            'involucrarme', 'participar', 'como actuo', 'que hacer'
          ],
          answer: 'Hay varias formas de actuar frente a los PFAS:\n\n• 🏠 <strong>En tu hogar</strong> — instala un sistema de filtración específico para PFAS (como nuestro dispositivo point-of-use)\n• 📊 <strong>Infórmate</strong> — conoce la normativa de tu zona y la calidad de tu agua\n• 📢 <strong>Difunde</strong> — muchas personas no conocen este problema\n• 🤝 <strong>Contacta con nosotros</strong> — podemos asesorarte según tu situación\n\n¿Te interesa saber más sobre nuestro producto o la normativa?',
          followUp: ['Ver el producto', 'Normativa 2026', 'Contactar'],
          weight: 1.0
        }
      ]
    },
    en: {
      greetings: [
        'Hello! 👋 I\'m the <strong>ZeroPFAS</strong> virtual assistant. I\'m here to answer your questions about PFAS and our technology.',
        'Welcome! 👋 I\'m the <strong>ZeroPFAS</strong> assistant. Ask me anything about forever chemicals, our technology, or our product.'
      ],
      goodbye: 'Thanks for your interest in ZeroPFAS! If you need anything else, I\'ll be here. 🧪',
      thanksReply: 'You\'re welcome! If you have more questions, just type away. 😊',
      smartFallback: 'Maybe I can help you with one of these topics:',
      defaultSuggestions: ['What are PFAS?', 'SCWO technology', 'See the product', '2026 regulations'],
      faq: [
        {
          id: 'pfas-intro',
          keywords: [
            'what are', 'pfas', 'forever chemicals', 'perfluoroalkyl', 'explain pfas', 'definition',
            'about pfas', 'tell me', 'information', 'info', 'describe', 'meaning',
            'synthetic', 'compounds', 'chemicals', 'substances', 'pollutant', 'pollution',
            'contamination', 'carbon fluorine', 'c-f bond', 'fluorinated', 'nonstick', 'teflon',
            'waterproof', 'firefighting foam', '4700', '4,700', '1950', '485',
            'not degrade', 'persistent', 'forever', 'eternal', 'never break down',
            'learn more', 'what is this', 'what does this', 'explain', 'overview'
          ],
          answer: '<strong>PFAS</strong> (per- and polyfluoroalkyl substances) are over <strong>4,700 synthetic compounds</strong> used since 1950 in non-stick coatings, waterproofing, and firefighting foams.\n\nThey\'re called "forever chemicals" because their C–F bond (<strong>485 kJ/mol</strong>) resists all natural degradation. Found in water, soil, and living organisms worldwide.',
          followUp: ['Are they dangerous?', 'How are they removed?', 'Current regulations'],
          weight: 1.0
        },
        {
          id: 'pfas-danger',
          keywords: [
            'danger', 'health', 'risk', 'cancer', 'harmful', 'toxic', 'bioaccumulate',
            'dangerous', 'effects', 'disease', 'safe', 'poisonous', 'lethal', 'deadly',
            'body', 'blood', 'liver', 'kidney', 'thyroid', 'immune', 'fetal',
            'pregnancy', 'children', 'babies', 'population', 'concern', 'worried',
            'serious', 'accumulate', 'hormone', 'endocrine', 'disruptor',
            'affect me', 'is it dangerous', 'should i worry', 'are they safe',
            'side effects', 'symptoms', 'harm', 'cause', 'linked to', 'associated'
          ],
          answer: 'PFAS pose serious health risks:\n\n• <strong>Bioaccumulation</strong> — builds up in blood, liver, and kidneys\n• <strong>Cancer</strong> — linked to kidney, testicular, and thyroid cancer\n• <strong>Immune system</strong> — reduces vaccine response\n• <strong>Development</strong> — affects fetal growth\n\n<strong>98%</strong> of the world population has detectable PFAS in their blood.',
          followUp: ['How are they removed?', 'See the product', 'Any regulations?'],
          weight: 1.0
        },
        {
          id: 'scwo',
          keywords: [
            'scwo', 'supercritical', 'destruction', 'oxidation', 'destroy', 'eliminate',
            'remove pfas', 'how it works', 'technology', 'process', 'method', 'solution',
            'reactor', 'reaction', 'chemistry', 'decompose', 'break bond', 'break down',
            'degrade', 'temperature', 'pressure', '374', 'supercritical water',
            'how do you', 'what method', 'what technology', 'mechanism', 'innovation',
            'science', 'scientific', 'procedure', 'works', 'operate',
            'co2', 'h2o', 'fluoride', 'conversion', 'transform', 'convert',
            'what do you do', 'your solution', 'your approach', 'technique',
            'your technology', 'proposal', 'how does it work'
          ],
          answer: 'We use <strong>SCWO</strong> (Supercritical Water Oxidation):\n\n<strong>1.</strong> Water is heated to >374 °C at >22.1 MPa (supercritical conditions)\n<strong>2.</strong> It becomes both solvent and oxidant simultaneously\n<strong>3.</strong> C–F bonds are completely broken\n<strong>4.</strong> PFAS become <strong>CO₂ + H₂O + F⁻</strong>\n\nDestruction rate: <strong>>99.9%</strong> verified.',
          followUp: ['How do you verify?', 'Industrial solution', 'See the product'],
          weight: 1.0
        },
        {
          id: 'product',
          keywords: [
            'product', 'device', 'filter', 'cartridge', 'point-of-use', 'under sink',
            'buy', 'install', 'home', 'appliance', 'equipment', 'machine', 'membrane',
            'nanofiltration', 'purifier', 'purify', 'household', 'domestic', 'kitchen',
            'faucet', 'tap', 'residential', 'personal', 'house', 'apartment',
            'osmosis', 'brita', 'purification', 'filtration', 'filtered',
            'clean water', 'treat water', 'pure water', 'drinking', 'system',
            'what do you sell', 'what do you offer', 'purchase', 'where to buy',
            'acquire', 'get', 'available', 'sale', 'shop', 'order', 'see product'
          ],
          answer: 'Our <strong>point-of-use</strong> device installs under your kitchen sink:\n\n• 🔬 <strong>Nanofiltration membrane</strong> for PFAS capture\n• 🔄 <strong>Replaceable cartridge</strong> with embedded NFC chip\n• 📱 <strong>Real-time monitoring</strong> platform connection\n• ✅ <strong>Filtered water</strong> meets EPA and EU standards\n\nCompact, silent design — no electricity needed for filtration.',
          followUp: ['How does NFC work?', 'How much does it cost?', 'SCWO technology'],
          weight: 1.0
        },
        {
          id: 'regulation',
          keywords: [
            'regulation', 'epa', 'directive', 'eu', 'echa', 'legal', 'legislation',
            'limit', 'mcl', 'law', 'mandatory', '2026', 'standard', 'europe', 'european',
            'united states', 'usa', 'america', 'government', 'ban', 'restrict', 'restriction',
            'prohibit', 'compliance', 'compliant', 'norm', 'requirement',
            'ng/l', 'nanogram', 'microgram', 'concentration', 'drinking water',
            'pfoa', 'pfos', 'when', 'deadline', 'effective', 'enforce', 'rules'
          ],
          answer: 'Key current and upcoming regulations:\n\n🇺🇸 <strong>EPA (USA)</strong>\nMCL of <strong>4 ng/L</strong> for PFOA and PFOS — effective 2026\n\n🇪🇺 <strong>EU Directive 2020/2184</strong>\nTotal PFAS limit of <strong>0.5 µg/L</strong> in drinking water\n\n🔬 <strong>ECHA</strong>\nUniversal restriction proposal for all PFAS in Europe — the broadest ever proposed',
          followUp: ['How do we comply?', 'See the product', 'What are PFAS?'],
          weight: 1.0
        },
        {
          id: 'verification',
          keywords: [
            'verification', 'proof', 'analysis', 'lc-ms', 'fluoride', 'balance',
            'testing', 'prove', 'measure', 'certify', 'evidence', 'data',
            'guarantee', 'really work', 'actually work', 'effective', 'efficacy',
            'effectiveness', 'results', 'laboratory', 'lab', 'test',
            'how do you know', 'how verify', 'how prove', 'how measure',
            'certified', 'reliable', 'reliable', 'accurate', 'precision',
            'tof', 'organofluorine', 'spectrometry', 'chromatography', 'validated'
          ],
          answer: 'Our three-stage verification system:\n\n<strong>1. LC-MS/MS</strong>\nIndividual quantitative analysis — identifies and measures each PFAS present\n\n<strong>2. Total Organofluorine (TOF)</strong>\nCombustion oxidation to measure all organic fluorine\n\n<strong>3. Fluoride Balance</strong>\nReleased F⁻ is compared against destroyed organic fluorine. If they match → <strong>complete elimination confirmed</strong>',
          followUp: ['SCWO technology', 'Industrial solution', 'Regulations'],
          weight: 1.0
        },
        {
          id: 'industrial',
          keywords: [
            'industrial', 'scale', 'large scale', 'plant', '1000', 'treatment',
            'municipal', 'enterprise', 'commercial', 'factory', 'city', 'community',
            'infrastructure', 'supply', 'scalable', 'modular', 'capacity',
            'business', 'volume', 'cubic meters', 'tons', 'liters', 'flow rate',
            'water treatment', 'wastewater', 'for companies', 'for cities'
          ],
          answer: 'Our industrial solution is designed for high volumes:\n\n• 📊 Capacity: <strong>>1,000 m³/day</strong>\n• 🧱 <strong>Modular</strong> architecture — horizontal scaling on demand\n• 📡 <strong>Real-time</strong> monitoring\n• 📋 Compliance with local and international regulations\n\nIdeal for water treatment plants, industrial parks, and municipal management.',
          followUp: ['See the home device', 'How do you verify?', 'Contact us'],
          weight: 1.0
        },
        {
          id: 'nfc',
          keywords: [
            'nfc', 'traceability', 'monitoring', 'tracking', 'app', 'chip', 'smart',
            'intelligent', 'phone', 'smartphone', 'application', 'alert', 'notification',
            'replacement', 'lifespan', 'how long', 'replace', 'change cartridge',
            'waste', 'recycle', 'disposal', 'digital', 'connected', 'iot', 'platform',
            'dashboard', 'how does nfc work', 'what is nfc'
          ],
          answer: 'Each cartridge integrates an <strong>NFC chip</strong> enabling:\n\n• 📦 <strong>Installation</strong> registration (date, location)\n• 📈 Real-time <strong>usage tracking</strong>\n• 🔔 <strong>Replacement alerts</strong> before depletion\n• ♻️ <strong>Waste management</strong> — full traceability of spent cartridges\n\nAll accessible from your smartphone with a simple NFC tap.',
          followUp: ['See the product', 'How much does it cost?', 'SCWO technology'],
          weight: 1.0
        },
        {
          id: 'contact',
          keywords: [
            'contact', 'email', 'write', 'talk', 'support', 'reach', 'human',
            'real person', 'help', 'linkedin', 'social media', 'phone', 'call',
            'meeting', 'demo', 'demonstration', 'presentation', 'form',
            'want to talk', 'need to contact', 'message', 'send', 'inquire', 'inquiry'
          ],
          answer: 'Of course! You can reach us through:\n\n• 📝 <a href="#contact">Contact form</a> on this website\n• 💼 LinkedIn profile (link in the footer)\n\nWe\'ll get back to you as soon as possible.',
          followUp: ['What are PFAS?', 'See the product', 'Regulations'],
          weight: 1.0
        },
        {
          id: 'team',
          keywords: [
            'daniel', 'martinez', 'onofre', 'who', 'team', 'founder', 'researcher',
            'creator', 'behind', 'author', 'inventor', 'scientist', 'chemist',
            'who created', 'who founded', 'who are you', 'about you', 'company',
            'startup', 'project', 'history', 'origin', 'how it started', 'background',
            'experience', 'profile', 'your story'
          ],
          answer: '<strong>ZeroPFAS Solutions</strong> is a research project led by <strong>Daniel Martínez Onofre</strong>, a chemist specializing in PFAS elimination.\n\nHis approach integrates capture, SCWO destruction, and analytical verification — a complete strategy that goes beyond simply filtering.',
          followUp: ['SCWO technology', 'What are PFAS?', 'Contact us'],
          weight: 1.0
        },
        {
          id: 'pricing',
          keywords: [
            'cost', 'price', 'how much', 'budget', 'pricing', 'investment', 'afford',
            'cheap', 'expensive', 'economical', 'affordable', 'accessible', 'pay',
            'value', 'worth', 'range', 'offer', 'discount', 'subscription',
            'monthly', 'annual', 'plan', 'fee', 'charge', 'rate', 'quote'
          ],
          answer: 'Pricing varies by implementation scale:\n\n• 🏠 <strong>Point-of-use</strong> (home) — device + cartridge subscription\n• 🏭 <strong>Industrial</strong> — custom project based on volume\n\nReach out via the <a href="#contact">form</a> and we\'ll send a proposal tailored to your needs.',
          followUp: ['See the product', 'Industrial solution', 'Contact us'],
          weight: 1.0
        },
        {
          id: 'water-safe',
          keywords: [
            'safe water', 'drinking water', 'drink', 'tap', 'my water', 'home water',
            'contaminated', 'purify', 'clean', 'treat', 'potable',
            'can i drink', 'is it safe', 'is it clean', 'does it have pfas',
            'tap water', 'water quality', 'test water', 'my area', 'my city',
            'worried', 'afraid', 'scared', 'am i exposed', 'at risk', 'bottled water'
          ],
          answer: 'It\'s hard to know if your water contains PFAS without specific testing. Standard filters <strong>don\'t remove</strong> most PFAS.\n\nOur point-of-use device is designed exactly for this: captures PFAS with nanofiltration and verifies it in real-time.\n\nWant to know more about the product or your area\'s regulations?',
          followUp: ['See the product', '2026 regulations', 'Are they dangerous?'],
          weight: 1.0
        },
        {
          id: 'difference',
          keywords: [
            'difference', 'advantage', 'better', 'competition', 'compare', 'others',
            'why zeropfas', 'unique', 'special', 'innovative', 'different', 'novel',
            'what sets you apart', 'why choose', 'compared to', 'versus', 'vs',
            'alternative', 'value proposition', 'benefits', 'strengths',
            'activated carbon', 'just filter', 'only filter', 'retain',
            'other methods', 'other systems', 'competitors'
          ],
          answer: 'What sets us apart:\n\n• 🔥 <strong>Real destruction</strong> — we don\'t just filter, we completely eliminate PFAS with SCWO\n• ✅ <strong>Triple verification</strong> — LC-MS/MS + TOF + fluoride balance\n• 📱 <strong>NFC traceability</strong> — full lifecycle tracking\n• 📊 <strong>Scalability</strong> — from your home to industrial plants\n\nMost solutions only retain PFAS; we <strong>destroy them and prove it</strong>.',
          followUp: ['SCWO technology', 'How do you verify?', 'Contact us'],
          weight: 1.0
        },
        {
          id: 'zeropfas-about',
          keywords: [
            'zeropfas', 'zero pfas', 'what is zeropfas', 'about', 'what is this',
            'who are you', 'your company', 'your mission', 'mission', 'vision',
            'purpose', 'goal', 'objective', 'what do you do', 'what is your focus',
            'summary', 'description', 'overview', 'introduction', 'website'
          ],
          answer: '<strong>ZeroPFAS Solutions</strong> is a research project dedicated to the verified elimination of PFAS — "forever chemicals."\n\nOur strategy integrates:\n• 🔬 <strong>Capture</strong> — point-of-use devices with nanofiltration\n• ⚗️ <strong>Destruction</strong> — SCWO technology (Supercritical Water Oxidation)\n• ✅ <strong>Verification</strong> — triple analysis (LC-MS/MS + TOF + fluoride balance)\n\nFrom home solutions to industrial scale (>1,000 m³/day).',
          followUp: ['What are PFAS?', 'SCWO technology', 'See the product'],
          weight: 1.2
        },
        {
          id: 'environment',
          keywords: [
            'environment', 'ecology', 'ecological', 'sustainable', 'sustainability',
            'nature', 'planet', 'earth', 'ecosystem', 'biodiversity',
            'river', 'lake', 'ocean', 'sea', 'groundwater', 'soil',
            'food', 'food chain', 'animal', 'fish', 'wildlife', 'flora', 'fauna',
            'environmental impact', 'green', 'footprint', 'waste', 'discharge',
            'recycle', 'what happens after', 'impact', 'consequence'
          ],
          answer: 'PFAS are a global environmental crisis:\n\n• 🌊 They contaminate <strong>rivers, lakes, aquifers, and oceans</strong>\n• 🌱 They accumulate in <strong>soils and the food chain</strong>\n• 🐟 They\'re detected in <strong>fish, birds, and mammals</strong> worldwide\n• ♾️ They don\'t degrade naturally — persisting for <strong>thousands of years</strong>\n\nOur SCWO technology doesn\'t just remove them from water — it <strong>completely destroys them</strong>, producing only CO₂, water, and inorganic fluoride.',
          followUp: ['SCWO technology', 'What are PFAS?', 'Are they dangerous?'],
          weight: 1.0
        },
        {
          id: 'how-to-help',
          keywords: [
            'what can i do', 'how to help', 'how to contribute', 'how to participate',
            'how to protect', 'protect myself', 'prevention', 'prevent', 'avoid',
            'reduce exposure', 'minimize', 'advice', 'recommendations', 'tips',
            'am i exposed', 'at risk', 'who can help', 'solutions available',
            'steps', 'actions', 'measures', 'get involved', 'what should i do'
          ],
          answer: 'There are several ways to take action against PFAS:\n\n• 🏠 <strong>At home</strong> — install a PFAS-specific filtration system (like our point-of-use device)\n• 📊 <strong>Stay informed</strong> — learn about regulations in your area and your water quality\n• 📢 <strong>Spread awareness</strong> — many people don\'t know about this problem\n• 🤝 <strong>Contact us</strong> — we can advise you based on your situation\n\nWant to know more about our product or the regulations?',
          followUp: ['See the product', '2026 regulations', 'Contact us'],
          weight: 1.0
        }
      ]
    }
  };

  /* ================================================================
     CONVERSATIONAL PATTERNS — expanded
     ================================================================ */
  var PATTERNS = {
    es: {
      greetingTest: /\b(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos|que tal|ei|ey|wenas)\b/i,
      thanksTest: /\b(gracias|genial|perfecto|vale|ok|entendido|claro|muchas gracias|te agradezco|guay|excelente|estupendo|increible|super|fantastico|buenisimo|mola|bien|muy bien)\b/i,
      byeTest: /\b(adios|hasta luego|chao|bye|nos vemos|hasta pronto|me voy|nada mas|eso es todo)\b/i,
      affirmativeTest: /\b(si|sí|claro|por supuesto|dale|venga|adelante|quiero|me interesa|dime mas|cuéntame mas|cuentame mas)\b/i
    },
    en: {
      greetingTest: /\b(hello|hi|hey|good morning|good afternoon|good evening|greetings|howdy|what's up|yo|sup)\b/i,
      thanksTest: /\b(thanks|thank you|great|perfect|got it|understood|awesome|appreciate|cool|nice|excellent|wonderful|amazing|brilliant|fantastic)\b/i,
      byeTest: /\b(bye|goodbye|see you|later|farewell|that's all|nothing else|i'm done|gotta go)\b/i,
      affirmativeTest: /\b(yes|yeah|yep|sure|of course|go ahead|please|tell me more|i'm interested|want to know)\b/i
    }
  };

  /* ================================================================
     INTENT PATTERNS — Detect non-domain categories
     Priority: ofensivo > conversational > afectivo > dominio > ambiguo > fuera_de_tema
     ================================================================ */
  var INTENT_PATTERNS = {
    es: {
      ofensivo: /\b(puta|puto|mierda|joder|cabron|cabrona|gilipollas|idiota|imbecil|estupido|estupida|subnormal|retrasado|retrasada|guarra|guarro|zorra|zorro|marica|maricon|bollera|follar|folla|follame|follate|cono|polla|culo|teta|tetas|verga|pendejo|pendeja|chinga|hijueputa|hijo de puta|malparido|basura|asco|asqueroso|asquerosa|maldito|maldita|hdp|ctm|cagada|cagar|come mierda|vete a la mierda|que te den|muerete|muérete|desgraciado|desgraciada|inutil|payaso|payasa|mongolo|mongola|tu madre|tu vieja|perra|perro|cerdo|cerda|aborto|tarado|tarada|chupar|chupas|chupa|chupame|chupamela|chupatela|chupala|chupapollas|mamar|mamame|mamamela|mamarla|mamada|mamadas|pajero|pajera|pajillero|masturbar|masturbacion|pene|pija|rabo|picha|cipote|capullo|zumbado|zumbada|lameculos|comemierda|soplapollas|giliflautas|imbecil|gilipuertas|me la chupas|me la mamas|la tienes pequeña|te voy a matar|ojala te mueras|muere|pudrete)\b/i,
      afectivo: /\b(me quieres|te quiero|te amo|eres guapa|eres guapo|eres bonita|eres bonito|eres lista|eres listo|eres tonta|eres tonto|tienes sentimientos|sientes algo|estas viva|estas vivo|eres real|eres humana|eres humano|que sientes|como te sientes|te gusto|me gustas|novio|novia|pareja|casarse|casarnos|casarte|cita conmigo|salir conmigo|salir contigo|tengo hambre|estoy triste|estoy solo|estoy sola|tengo frio|tengo calor|tienes nombre|como te llamas|cuantos anos tienes|donde vives|eres hombre|eres mujer|eres chico|eres chica|que eres|eres un robot|eres una maquina|eres inteligente)\b/i,
      ambiguo: /^(no entiendo|no se|no sé|que|qué|eh|mmm*|hm+|hmm+|ah|ok|vale|a ver|pues|bueno|y|aja|ajá|como|cómo|por que|por qué|nada|ni idea|no entiendo nada|perdon|perdona|como asi|emm?)$/i
    },
    en: {
      ofensivo: /\b(fuck|fucking|fucked|fucker|shit|shitty|damn|bastard|bitch|asshole|dick|dickhead|cock|pussy|slut|whore|idiot|moron|stupid|dumb|retard|retarded|crap|suck|suck me|blow me|screw you|go to hell|loser|trash|disgusting|pathetic|ugly|hate you|stfu|wtf|wanker|tosser|bollocks|piss off|bugger|arse|scumbag|freak|jerk|twat|cum|penis|vagina|masturbate|boobs|tits|kill yourself|kys|die|rot in hell)\b/i,
      afectivo: /\b(do you love me|i love you|are you real|are you human|are you alive|do you feel|how do you feel|are you pretty|are you smart|are you cute|do you have feelings|what are you really|who are you really|are you a boy|are you a girl|what is your name|how old are you|where do you live|i'm lonely|i'm sad|i'm hungry|i'm bored|be my friend|be my girlfriend|be my boyfriend|date me|marry me|go out with me|you're cute|you're pretty|you're hot|are you a robot|are you a machine|are you intelligent)\b/i,
      ambiguo: /^(i don't understand|don't know|what|huh|umm*|hm+|hmm+|ah|ok|okay|well|so|and|yeah|sure|how|why|nothing|no idea|idk|sorry|pardon|come again)$/i
    }
  };

  /* ================================================================
     NON-DOMAIN RESPONSES — Neutral replies for non-PFAS queries
     Each category has 3 variants picked at random
     ================================================================ */
  var NON_DOMAIN_RESPONSES = {
    es: {
      ofensivo: [
        'Entiendo tu frustración, pero no puedo responder a ese tipo de mensajes. Si tienes alguna consulta sobre PFAS o nuestra tecnología, estaré encantado de ayudarte. 🧪',
        'No me es posible atender ese tipo de lenguaje. Estoy aquí para resolver dudas sobre contaminantes PFAS y agua segura. ¿Puedo ayudarte con eso?',
        'Prefiero centrarme en ayudarte con algo útil. ¿Te gustaría saber sobre PFAS, nuestra tecnología o nuestro producto?'
      ],
      afectivo: [
        'Soy un asistente virtual especializado en PFAS, así que no puedo responder a preguntas personales. Pero si tienes curiosidad sobre contaminantes eternos o agua segura, ¡pregúntame! 😊',
        'Agradezco tu interés, pero solo soy un chatbot de ZeroPFAS. Mi especialidad son los PFAS y la calidad del agua. ¿Te ayudo con eso?',
        'No tengo sentimientos, ¡pero sí tengo mucha información sobre PFAS! ¿Quieres que te cuente algo?'
      ],
      ambiguo: [
        '¿Podrías reformular tu pregunta? Puedo ayudarte con temas como PFAS, nuestra tecnología SCWO, normativa o nuestro producto.',
        'No estoy seguro de entender. ¿Podrías ser más específico? Estoy especializado en PFAS y tratamiento de agua.',
        'Necesito un poco más de contexto para ayudarte. ¿Sobre qué te gustaría saber?'
      ],
      fuera_de_tema: [
        'Esa consulta queda fuera de mi área. Estoy especializado en PFAS, contaminantes eternos y tecnología de tratamiento de agua. ¿Puedo ayudarte con alguno de esos temas?',
        'No tengo información sobre eso, ya que mi especialidad son los PFAS y la calidad del agua. ¿Hay algo relacionado con esto en lo que pueda ayudarte?',
        'Eso no está relacionado con mi función. Soy el asistente de ZeroPFAS y puedo resolver dudas sobre PFAS, normativa, nuestro producto o tecnología SCWO.'
      ]
    },
    en: {
      ofensivo: [
        'I understand your frustration, but I can\'t respond to that kind of message. If you have questions about PFAS or our technology, I\'d be happy to help. 🧪',
        'I\'m not able to address that kind of language. I\'m here to answer questions about PFAS and safe water. Can I help with that?',
        'I\'d rather focus on helping you with something useful. Would you like to know about PFAS, our technology, or our product?'
      ],
      afectivo: [
        'I\'m a virtual assistant specialized in PFAS, so I can\'t answer personal questions. But if you\'re curious about forever chemicals or safe water, ask away! 😊',
        'I appreciate your interest, but I\'m just a ZeroPFAS chatbot. My specialty is PFAS and water quality. Can I help with that?',
        'I don\'t have feelings, but I do have lots of information about PFAS! Want me to tell you something?'
      ],
      ambiguo: [
        'Could you rephrase your question? I can help with topics like PFAS, our SCWO technology, regulations, or our product.',
        'I\'m not sure I understand. Could you be more specific? I specialize in PFAS and water treatment.',
        'I need a bit more context to help you. What would you like to know about?'
      ],
      fuera_de_tema: [
        'That question is outside my area. I specialize in PFAS, forever chemicals, and water treatment technology. Can I help with any of those?',
        'I don\'t have information on that — my specialty is PFAS and water quality. Is there something related I can help with?',
        'That\'s not related to what I do. I\'m the ZeroPFAS assistant and can help with PFAS, regulations, our product, or SCWO technology.'
      ]
    }
  };

  /* ================================================================
     STOPWORDS — Common words that must NOT drive domain scoring
     ================================================================ */
  var STOPWORDS = {
    es: { 'a':1,'al':1,'ante':1,'con':1,'de':1,'del':1,'el':1,'ella':1,'en':1,'es':1,'esa':1,'ese':1,'eso':1,'esta':1,'este':1,'esto':1,'hay':1,'la':1,'las':1,'le':1,'les':1,'lo':1,'los':1,'me':1,'mi':1,'muy':1,'no':1,'nos':1,'o':1,'para':1,'pero':1,'por':1,'que':1,'se':1,'si':1,'sin':1,'son':1,'su':1,'te':1,'tu':1,'tus':1,'un':1,'una':1,'uno':1,'unas':1,'unos':1,'y':1,'ya':1,'yo':1,'como':1,'mas':1,'ser':1,'ver':1,'dar':1,'ir':1,'fue':1,'ha':1,'he':1,'nos':1,'les':1,'tiene':1,'tengo':1,'hace':1,'eso':1 },
    en: { 'a':1,'an':1,'and':1,'are':1,'as':1,'at':1,'be':1,'been':1,'but':1,'by':1,'can':1,'did':1,'do':1,'does':1,'for':1,'from':1,'had':1,'has':1,'have':1,'he':1,'her':1,'him':1,'his':1,'how':1,'i':1,'if':1,'in':1,'into':1,'is':1,'it':1,'its':1,'just':1,'me':1,'my':1,'no':1,'not':1,'of':1,'on':1,'or':1,'our':1,'she':1,'so':1,'than':1,'that':1,'the':1,'them':1,'then':1,'they':1,'this':1,'to':1,'up':1,'us':1,'was':1,'we':1,'were':1,'what':1,'when':1,'who':1,'will':1,'with':1,'you':1,'your':1 }
  };

  /* ================================================================
     DOMAIN KEYWORDS — Strong signals that the query is about PFAS/water
     At least one must match for a domain response to be allowed
     ================================================================ */
  var DOMAIN_KEYWORDS = {
    es: ['pfas','pfoa','pfos','agua','filtro','filtracion','nanofiltracion','contaminacion','contaminante','contaminantes','fluorados','fluorado','perfluor','polifluor','normativa','regulacion','directiva','epa','echa','tratamiento','analisis','scwo','supercritica','supercritico','zeropfas','zero pfas','cartucho','depuradora','potabilizadora','membrana','nfc','trazabilidad','producto','dispositivo','point-of-use','destruccion','verificacion','toxico','toxica','toxicidad','peligro','peligrosos','cancer','salud','bioacumula','enlace c-f','contaminantes eternos','forever chemicals','purificador','depurador','industrial','modular','grifo','fregadero','agua potable','agua segura','daniel martinez','equipo','contacto','precio','coste','medio ambiente','ecosistema','rio','lago','acuifero'],
    en: ['pfas','pfoa','pfos','water','filter','filtration','nanofiltration','contamination','contaminant','contaminants','fluorinated','perfluor','polyfluor','regulation','directive','epa','echa','treatment','analysis','scwo','supercritical','zeropfas','zero pfas','cartridge','membrane','nfc','traceability','product','device','point-of-use','destruction','verification','toxic','toxicity','danger','dangerous','cancer','health','bioaccumulate','c-f bond','forever chemicals','purifier','industrial','modular','tap','sink','drinking water','safe water','daniel martinez','team','contact','price','cost','environment','ecosystem','river','lake','aquifer']
  };

  /** Check if normalized text contains at least one strong domain keyword */
  function tieneSenalDominio(textoNorm, lang) {
    var kws = DOMAIN_KEYWORDS[lang] || DOMAIN_KEYWORDS.es;
    for (var i = 0; i < kws.length; i++) {
      if (textoNorm.indexOf(kws[i]) !== -1) return true;
    }
    return false;
  }

  /* ================================================================
     LANGUAGE DETECTION — improved with scoring
     ================================================================ */
  function detectLang(text) {
    var esScore = 0;
    var enScore = 0;
    var esWords = /\b(qué|que|cómo|como|cuál|cual|hola|por favor|dónde|donde|puedo|quiero|tienen|necesito|ayuda|gracias|buenos|buenas|también|producto|normativa|eliminación|destrucción|verificación|peligro|salud|agua|más|esto|esta|este|para|las|los|una|del|con|hay|muy|pero|ese|esa|son|soy|tengo|tiene|hace|nos|les|sobre|sin|ser|ver|dar|año|dia|todo|nuestro|vuestra)\b/gi;
    var enWords = /\b(what|how|which|hello|please|where|can|want|need|help|thanks|also|product|regulation|elimination|destruction|verification|danger|health|water|more|the|is|are|does|this|that|for|with|from|have|has|your|you|our|been|will|would|could|should|about|they|their|these|those|some|any|much|very|just|only|into|been)\b/gi;
    var esMatches = text.match(esWords);
    var enMatches = text.match(enWords);
    if (esMatches) esScore = esMatches.length;
    if (enMatches) enScore = enMatches.length;
    if (esScore === 0 && enScore === 0) return null;
    return esScore >= enScore ? 'es' : 'en';
  }

  /* ================================================================
     STEMMING — Strip common suffixes for root matching
     ================================================================ */
  function stemES(word) {
    return word
      .replace(/(ción|ciones|miento|mientos|mente|idad|idades|ismo|ismos|ista|istas)$/i, '')
      .replace(/(ando|iendo|ado|ido|ada|ida|ados|idos|adas|idas)$/i, '')
      .replace(/(ar|er|ir|arse|erse|irse)$/i, '')
      .replace(/(amos|emos|imos|an|en|as|es|os)$/i, '')
      .replace(/(ble|bles|dor|dora|dores|doras)$/i, '');
  }

  function stemEN(word) {
    return word
      .replace(/(tion|tions|ment|ments|ness|ity|ism|isms|ist|ists|ous|ive|ful|less|able|ible)$/i, '')
      .replace(/(ating|ating|ing|ed|er|est|ly)$/i, '')
      .replace(/(ize|ise|ify|ate)$/i, '')
      .replace(/(al|ial|ical)$/i, '');
  }

  function stem(word, lang) {
    if (word.length <= 3) return word;
    return lang === 'es' ? stemES(word) : stemEN(word);
  }

  /* ================================================================
     NORMALIZE
     ================================================================ */
  function normalize(str) {
    return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* ================================================================
     SMART MATCHING — Multi-layer scoring engine
     Layer 1: Exact phrase match (highest weight)
     Layer 2: Exact token match
     Layer 3: Stemmed token match
     Layer 4: Partial/substring match
     Always returns ranked results, never truly "fails"
     ================================================================ */
  function findAnswer(input, lang) {
    var bank = KB[lang];
    var normalInput = normalize(input);
    var sw = STOPWORDS[lang] || STOPWORDS.es;
    /* Filter input tokens: keep only non-stopword tokens with length > 1 */
    var allTokens = normalInput.split(' ').filter(function (t) { return t.length > 1; });
    var inputTokens = allTokens.filter(function (t) { return !sw[t]; });
    /* If ALL tokens are stopwords, no domain content can match */
    if (inputTokens.length === 0) {
      return { type: 'none', answer: bank.smartFallback, followUp: bank.defaultSuggestions, id: null };
    }
    var stemmedInput = inputTokens.map(function (t) { return stem(t, lang); });
    var results = [];

    for (var i = 0; i < bank.faq.length; i++) {
      var entry = bank.faq[i];
      var score = 0;
      var entryWeight = entry.weight || 1.0;

      for (var j = 0; j < entry.keywords.length; j++) {
        var kw = normalize(entry.keywords[j]);

        /* Layer 1: Exact phrase match in full input — highest score */
        if (normalInput.indexOf(kw) !== -1) {
          score += kw.split(' ').length * 10;
        }

        /* Layer 2 & 3: Token-level matching */
        var kwTokens = kw.split(' ').filter(function (t) { return t.length > 1; });
        for (var k = 0; k < kwTokens.length; k++) {
          var kwToken = kwTokens[k];
          var kwStem = stem(kwToken, lang);

          for (var t = 0; t < inputTokens.length; t++) {
            /* Layer 2: Exact token match */
            if (inputTokens[t] === kwToken) {
              score += 6;
            }
            /* Layer 3: Stemmed match */
            else if (stemmedInput[t] === kwStem && kwStem.length >= 3) {
              score += 4;
            }
            /* Layer 4: Substring/partial match (one contains the other) */
            else if (inputTokens[t].length >= 4 && kwToken.length >= 4) {
              if (inputTokens[t].indexOf(kwToken) !== -1 || kwToken.indexOf(inputTokens[t]) !== -1) {
                score += 3;
              }
              /* Starting prefix match (first 4+ chars) */
              else {
                var prefix = Math.min(inputTokens[t].length, kwToken.length, 5);
                if (prefix >= 4 && inputTokens[t].substring(0, prefix) === kwToken.substring(0, prefix)) {
                  score += 2;
                }
              }
            }
          }
        }
      }

      score = score * entryWeight;

      if (score > 0) {
        results.push({ entry: entry, score: score });
      }
    }

    /* Sort by score descending */
    results.sort(function (a, b) { return b.score - a.score; });

    /* High-confidence match — return directly */
    if (results.length > 0 && results[0].score >= 6) {
      var best = results[0].entry;
      return {
        type: 'match',
        answer: best.answer.replace(/\n/g, '<br>'),
        followUp: best.followUp || null,
        id: best.id
      };
    }

    /* Low-confidence partial matches — return as suggestions */
    if (results.length > 0) {
      var topResults = results.slice(0, 3);
      var sugTopics = topResults.map(function (r) {
        return (r.entry.followUp && r.entry.followUp[0]) || bank.defaultSuggestions[0];
      });
      /* De-duplicate */
      var seen = {};
      sugTopics = sugTopics.filter(function (s) {
        if (seen[s]) return false;
        seen[s] = true;
        return true;
      });

      return {
        type: 'partial',
        answer: bank.smartFallback,
        followUp: sugTopics.length > 0 ? sugTopics : bank.defaultSuggestions,
        id: null
      };
    }

    /* No matches at all — show default suggestions */
    return {
      type: 'none',
      answer: bank.smartFallback,
      followUp: bank.defaultSuggestions,
      id: null
    };
  }

  /* ================================================================
     INTENT CLASSIFIER — detectarCategoria
     Routes input to: ofensivo | despedida | agradecimiento | saludo |
     afirmativo | afectivo | dominio | ambiguo | fuera_de_tema
     ================================================================ */
  function detectarCategoria(texto, lang) {
    var norm = normalize(texto);
    var ip = INTENT_PATTERNS[lang] || INTENT_PATTERNS.es;
    var conv = PATTERNS[lang] || PATTERNS.es;
    var wordCount = texto.trim().split(/\s+/).length;

    /* P1 — Offensive: highest priority */
    if (ip.ofensivo.test(texto) || ip.ofensivo.test(norm)) {
      return { categoria: 'ofensivo', resultado: null };
    }

    /* P2 — Conversational patterns (short utterances only) */
    if (conv.byeTest.test(texto) && wordCount <= 5) {
      return { categoria: 'despedida', resultado: null };
    }
    if (conv.thanksTest.test(texto) && wordCount <= 4) {
      return { categoria: 'agradecimiento', resultado: null };
    }
    if (conv.greetingTest.test(texto) && wordCount <= 3) {
      return { categoria: 'saludo', resultado: null };
    }
    if (conv.affirmativeTest && conv.affirmativeTest.test(texto) && wordCount <= 3) {
      return { categoria: 'afirmativo', resultado: null };
    }

    /* P3 — Affective / personal questions */
    if (ip.afectivo.test(texto) || ip.afectivo.test(norm)) {
      return { categoria: 'afectivo', resultado: null };
    }

    /* P4 — Domain: require domain signal + strong FAQ match */
    var hasDomainSignal = tieneSenalDominio(norm, lang);
    if (hasDomainSignal) {
      var result = findAnswer(texto, lang);
      if (result.type === 'match') {
        return { categoria: 'dominio', resultado: result };
      }
    }

    /* P5 — Ambiguous: explicit unclear phrases */
    if (ip.ambiguo.test(norm)) {
      return { categoria: 'ambiguo', resultado: null };
    }

    /* P6 — Out of scope (default) */
    return { categoria: 'fuera_de_tema', resultado: null };
  }

  /* ================================================================
     TOPIC LABELS — For welcome screen cards & quick menu
     ================================================================ */
  var TOPIC_LABELS = {
    es: {
      'pfas-intro':     { icon: '🧬', label: '¿Qué son los PFAS?' },
      'pfas-danger':    { icon: '⚠️', label: 'Riesgos para la salud' },
      'scwo':           { icon: '⚗️', label: 'Tecnología SCWO' },
      'product':        { icon: '🔬', label: 'Nuestro producto' },
      'regulation':     { icon: '📋', label: 'Normativa 2026' },
      'verification':   { icon: '✅', label: 'Verificación' },
      'industrial':     { icon: '🏭', label: 'Solución industrial' },
      'nfc':            { icon: '📱', label: 'Chip NFC' },
      'contact':        { icon: '📧', label: 'Contacto' },
      'team':           { icon: '👤', label: 'Equipo' },
      'pricing':        { icon: '💰', label: 'Precios' },
      'water-safe':     { icon: '💧', label: '¿Mi agua es segura?' },
      'difference':     { icon: '🏆', label: '¿Por qué ZeroPFAS?' },
      'zeropfas-about': { icon: '🌐', label: 'Sobre ZeroPFAS' },
      'environment':    { icon: '🌍', label: 'Impacto ambiental' },
      'how-to-help':    { icon: '🤝', label: '¿Qué puedo hacer?' }
    },
    en: {
      'pfas-intro':     { icon: '🧬', label: 'What are PFAS?' },
      'pfas-danger':    { icon: '⚠️', label: 'Health risks' },
      'scwo':           { icon: '⚗️', label: 'SCWO Technology' },
      'product':        { icon: '🔬', label: 'Our product' },
      'regulation':     { icon: '📋', label: '2026 Regulations' },
      'verification':   { icon: '✅', label: 'Verification' },
      'industrial':     { icon: '🏭', label: 'Industrial solution' },
      'nfc':            { icon: '📱', label: 'NFC chip' },
      'contact':        { icon: '📧', label: 'Contact' },
      'team':           { icon: '👤', label: 'Team' },
      'pricing':        { icon: '💰', label: 'Pricing' },
      'water-safe':     { icon: '💧', label: 'Is my water safe?' },
      'difference':     { icon: '🏆', label: 'Why ZeroPFAS?' },
      'zeropfas-about': { icon: '🌐', label: 'About ZeroPFAS' },
      'environment':    { icon: '🌍', label: 'Environmental impact' },
      'how-to-help':    { icon: '🤝', label: 'What can I do?' }
    }
  };

  /* 4 featured topics for the welcome screen */
  var WELCOME_TOPICS = ['pfas-intro', 'scwo', 'product', 'regulation'];

  /* ================================================================
     TIME-AWARE GREETING
     ================================================================ */
  function timeGreeting(lang) {
    var h = new Date().getHours();
    if (lang === 'es') {
      if (h < 13) return '¡Buenos días! ☀️';
      if (h < 20) return '¡Buenas tardes! 🌤️';
      return '¡Buenas noches! 🌙';
    }
    if (h < 12) return 'Good morning! ☀️';
    if (h < 18) return 'Good afternoon! 🌤️';
    return 'Good evening! 🌙';
  }

  /* ================================================================
     DOM BUILD — v4 with welcome screen, quick menu, modern layout
     ================================================================ */
  function buildChatbot() {
    /* Toggle Button */
    var toggle = document.createElement('button');
    toggle.className = 'chatbot-toggle';
    toggle.id = 'chatbotToggle';
    toggle.setAttribute('aria-label', 'Abrir chat');
    toggle.innerHTML =
      '<span class="chatbot-toggle__glow"></span>' +
      '<span class="chatbot-toggle__badge" id="chatbotBadge">1</span>' +
      '<svg class="chatbot-toggle__icon chatbot-toggle__icon--chat" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '<svg class="chatbot-toggle__icon chatbot-toggle__icon--close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    /* Tooltip */
    var tooltip = document.createElement('div');
    tooltip.className = 'chatbot-tooltip';
    tooltip.id = 'chatbotTooltip';

    /* Window */
    var win = document.createElement('div');
    win.className = 'chatbot-window';
    win.id = 'chatbotWindow';
    win.innerHTML =
      '<div class="chatbot-header">' +
        '<div class="chatbot-header__accent"></div>' +
        '<div class="chatbot-header__content">' +
          '<div class="chatbot-header__info">' +
            '<div class="chatbot-header__avatar">' +
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4m-3.5-6.5L17 7m-10 10-1.5 1.5M20.5 17.5 19 17M5 7 3.5 5.5"/></svg>' +
            '</div>' +
            '<div>' +
              '<span class="chatbot-header__title">ZeroPFAS Assistant</span>' +
              '<span class="chatbot-header__status"><i class="chatbot-header__dot"></i> Online</span>' +
            '</div>' +
          '</div>' +
          '<div class="chatbot-header__actions">' +
            '<button class="chatbot-header__btn" id="chatbotMenuBtn" aria-label="Temas" title="Ver todos los temas">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>' +
            '</button>' +
            '<button class="chatbot-header__btn" id="chatbotClose" aria-label="Cerrar chat">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="chatbot-menu" id="chatbotMenu"></div>' +
      '<div class="chatbot-messages" id="chatbotMessages"></div>' +
      '<div class="chatbot-suggestions" id="chatbotSuggestions"></div>' +
      '<form class="chatbot-input" id="chatbotForm" autocomplete="off">' +
        '<input type="text" class="chatbot-input__field" id="chatbotInput" placeholder="Escribe tu pregunta…" maxlength="300" />' +
        '<button type="submit" class="chatbot-input__send" id="chatbotSend" aria-label="Enviar">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
        '</button>' +
      '</form>';

    document.body.appendChild(toggle);
    document.body.appendChild(tooltip);
    document.body.appendChild(win);

    return { toggle: toggle, win: win, tooltip: tooltip };
  }

  /* ================================================================
     MESSAGE HELPERS — with bot avatar, timestamps, copy button
     ================================================================ */
  function getTimeStr() {
    var d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function appendMessage(container, html, sender, opts) {
    opts = opts || {};
    var wrap = document.createElement('div');
    wrap.className = 'chatbot-msg chatbot-msg--' + sender;
    if (opts.isWelcome) wrap.classList.add('chatbot-msg--welcome');

    var inner = '';
    if (sender === 'bot') {
      inner += '<div class="chatbot-msg__avatar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg></div>';
    }
    inner += '<div class="chatbot-msg__content">';
    inner += '<div class="chatbot-msg__bubble">' + html + '</div>';
    inner += '<div class="chatbot-msg__meta">';
    inner += '<span class="chatbot-msg__time">' + getTimeStr() + '</span>';
    if (sender === 'bot' && !opts.isWelcome && !opts.noCopy) {
      inner += '<button class="chatbot-msg__copy" aria-label="Copiar" title="Copiar respuesta"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>';
    }
    inner += '</div>';
    inner += '</div>';

    wrap.innerHTML = inner;
    container.appendChild(wrap);
    requestAnimationFrame(function () {
      container.scrollTop = container.scrollHeight;
    });
    return wrap;
  }

  function showTyping(container) {
    var wrap = document.createElement('div');
    wrap.className = 'chatbot-msg chatbot-msg--bot chatbot-typing';
    wrap.innerHTML =
      '<div class="chatbot-msg__avatar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg></div>' +
      '<div class="chatbot-msg__content"><div class="chatbot-msg__bubble"><span class="chatbot-dots"><i></i><i></i><i></i></span></div></div>';
    container.appendChild(wrap);
    requestAnimationFrame(function () {
      container.scrollTop = container.scrollHeight;
    });
    return wrap;
  }

  /* ================================================================
     WELCOME SCREEN — Rich visual cards instead of plain text
     ================================================================ */
  function renderWelcomeScreen(messagesEl, lang, onTopicClick) {
    var greeting = timeGreeting(lang);
    var subtitle = lang === 'es'
      ? 'Soy el asistente de <strong>ZeroPFAS</strong>. Elige un tema o escribe tu pregunta.'
      : 'I\'m the <strong>ZeroPFAS</strong> assistant. Pick a topic or type your question.';

    var welcomeHtml = '<div class="chatbot-welcome">' +
      '<div class="chatbot-welcome__greeting">' + greeting + '</div>' +
      '<div class="chatbot-welcome__subtitle">' + subtitle + '</div>' +
      '<div class="chatbot-welcome__cards">';

    var labels = TOPIC_LABELS[lang];
    for (var i = 0; i < WELCOME_TOPICS.length; i++) {
      var topicId = WELCOME_TOPICS[i];
      var t = labels[topicId];
      welcomeHtml += '<button class="chatbot-welcome__card" data-topic="' + topicId + '">' +
        '<span class="chatbot-welcome__card-icon">' + t.icon + '</span>' +
        '<span class="chatbot-welcome__card-label">' + t.label + '</span>' +
        '</button>';
    }

    welcomeHtml += '</div></div>';
    var msgEl = appendMessage(messagesEl, welcomeHtml, 'bot', { isWelcome: true, noCopy: true });

    /* Bind card clicks */
    var cards = msgEl.querySelectorAll('.chatbot-welcome__card');
    for (var j = 0; j < cards.length; j++) {
      cards[j].addEventListener('click', (function (id) {
        return function () { onTopicClick(id); };
      })(cards[j].getAttribute('data-topic')));
    }
  }

  /* ================================================================
     QUICK TOPIC MENU — overlay with all topics
     ================================================================ */
  function renderTopicMenu(menuEl, lang, onTopicClick) {
    var labels = TOPIC_LABELS[lang];
    var faq = KB[lang].faq;
    var html = '<div class="chatbot-menu__title">' +
      (lang === 'es' ? 'Todos los temas' : 'All Topics') +
      '</div><div class="chatbot-menu__grid">';

    for (var i = 0; i < faq.length; i++) {
      var t = labels[faq[i].id];
      if (t) {
        html += '<button class="chatbot-menu__item" data-topic="' + faq[i].id + '">' +
          '<span class="chatbot-menu__item-icon">' + t.icon + '</span>' +
          '<span class="chatbot-menu__item-label">' + t.label + '</span>' +
          '</button>';
      }
    }

    html += '</div>';
    menuEl.innerHTML = html;

    var items = menuEl.querySelectorAll('.chatbot-menu__item');
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener('click', (function (id) {
        return function () { onTopicClick(id); };
      })(items[j].getAttribute('data-topic')));
    }
  }

  /* ================================================================
     SUGGESTIONS — with staggered animation
     ================================================================ */
  function renderSuggestions(sugContainer, suggestions, handler) {
    sugContainer.innerHTML = '';
    if (!suggestions || !suggestions.length) return;
    suggestions.forEach(function (text, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chatbot-suggestion';
      btn.textContent = text;
      btn.style.animationDelay = (idx * 0.06) + 's';
      btn.addEventListener('click', function () {
        handler(text);
      });
      sugContainer.appendChild(btn);
    });
  }

  /* ================================================================
     INIT — Main controller with full state management
     ================================================================ */
  function init() {
    var els = buildChatbot();
    var messagesEl = document.getElementById('chatbotMessages');
    var suggestionsEl = document.getElementById('chatbotSuggestions');
    var menuEl = document.getElementById('chatbotMenu');
    var menuBtn = document.getElementById('chatbotMenuBtn');
    var form = document.getElementById('chatbotForm');
    var input = document.getElementById('chatbotInput');
    var closeBtn = document.getElementById('chatbotClose');
    var sendBtn = document.getElementById('chatbotSend');
    var badge = document.getElementById('chatbotBadge');
    var tooltipEl = document.getElementById('chatbotTooltip');
    var isOpen = false;
    var firstOpen = true;
    var menuOpen = false;
    var currentLang = 'es';
    var lastTopicId = null;
    var lastResult = null;
    var isProcessing = false;
    var messageCount = 0;

    /* Build topic menu (will rebuild on lang change) */
    function rebuildMenu() {
      renderTopicMenu(menuEl, currentLang, function (topicId) {
        closeMenu();
        triggerTopicById(topicId);
      });
    }

    /* Direct topic access (from welcome cards or menu) */
    function triggerTopicById(topicId) {
      var faq = KB[currentLang].faq;
      var entry = null;
      for (var i = 0; i < faq.length; i++) {
        if (faq[i].id === topicId) { entry = faq[i]; break; }
      }
      if (!entry) return;

      var labels = TOPIC_LABELS[currentLang];
      var label = labels[topicId] ? labels[topicId].label : topicId;
      appendMessage(messagesEl, escapeHtml(label), 'user');
      suggestionsEl.innerHTML = '';

      var typing = showTyping(messagesEl);
      var answerHtml = entry.answer.replace(/\n/g, '<br>');

      lastTopicId = topicId;
      lastResult = { type: 'match', answer: answerHtml, followUp: entry.followUp, id: topicId };
      messageCount++;

      var delay = Math.min(400 + answerHtml.length * 1.2, 1400);
      setTimeout(function () {
        typing.remove();
        appendMessage(messagesEl, answerHtml, 'bot');
        renderSuggestions(suggestionsEl, entry.followUp || KB[currentLang].defaultSuggestions, handleUserInput);
        isProcessing = false;
        sendBtn.disabled = false;
      }, delay);
    }

    function closeMenu() {
      menuOpen = false;
      menuEl.classList.remove('is-open');
    }
    function toggleMenu() {
      menuOpen = !menuOpen;
      menuEl.classList.toggle('is-open', menuOpen);
    }

    /* Restore open state */
    try {
      if (sessionStorage.getItem('zeroPFAS_chatOpen') === '1') {
        setTimeout(function () { if (!isOpen) toggleOpen(); }, 800);
      }
    } catch (e) {}

    /* Show badge & tooltip after delay */
    setTimeout(function () {
      if (!isOpen && badge) {
        badge.classList.add('is-visible');
      }
    }, 3000);

    setTimeout(function () {
      if (!isOpen && tooltipEl) {
        var tip = currentLang === 'es' ? '¿Dudas sobre PFAS? ¡Pregúntame!' : 'Questions about PFAS? Ask me!';
        tooltipEl.textContent = tip;
        tooltipEl.classList.add('is-visible');
        /* Auto-hide after 6s */
        setTimeout(function () {
          tooltipEl.classList.remove('is-visible');
        }, 6000);
      }
    }, 8000);

    function toggleOpen() {
      isOpen = !isOpen;
      els.win.classList.toggle('is-open', isOpen);
      els.toggle.classList.toggle('is-active', isOpen);

      if (isOpen) {
        if (badge) badge.classList.remove('is-visible');
        if (tooltipEl) tooltipEl.classList.remove('is-visible');
        if (firstOpen) {
          renderWelcomeScreen(messagesEl, currentLang, function (topicId) {
            triggerTopicById(topicId);
          });
          rebuildMenu();
          firstOpen = false;
        }
        closeMenu();
        setTimeout(function () { input.focus(); }, 100);
      }

      try { sessionStorage.setItem('zeroPFAS_chatOpen', isOpen ? '1' : '0'); } catch (e) {}
    }

    function handleUserInput(text) {
      if (!text.trim() || isProcessing) return;
      isProcessing = true;
      closeMenu();

      /* Detect language — only change if confident */
      var prevLang = currentLang;
      var detected = detectLang(text);
      if (detected) currentLang = detected;
      if (currentLang !== prevLang) rebuildMenu();

      appendMessage(messagesEl, escapeHtml(text), 'user');
      suggestionsEl.innerHTML = '';
      input.value = '';
      sendBtn.disabled = true;

      var typing = showTyping(messagesEl);

      /* ---- Intent classification (v5) ---- */
      var cat = detectarCategoria(text, currentLang);
      var responseHtml = null;
      var followUpSuggestions = null;

      switch (cat.categoria) {
        case 'saludo':
          responseHtml = timeGreeting(currentLang) + ' ' + (currentLang === 'es'
            ? 'Soy el asistente de <strong>ZeroPFAS</strong>. ¿En qué puedo ayudarte?'
            : 'I\'m the <strong>ZeroPFAS</strong> assistant. How can I help you?');
          followUpSuggestions = KB[currentLang].defaultSuggestions;
          break;

        case 'despedida':
          responseHtml = KB[currentLang].goodbye;
          followUpSuggestions = KB[currentLang].defaultSuggestions;
          break;

        case 'agradecimiento':
          responseHtml = KB[currentLang].thanksReply;
          followUpSuggestions = (lastResult && lastResult.followUp)
            ? lastResult.followUp
            : KB[currentLang].defaultSuggestions;
          break;

        case 'afirmativo':
          if (lastResult && lastResult.followUp) {
            responseHtml = currentLang === 'es'
              ? '¡Perfecto! Aquí tienes temas relacionados:'
              : 'Great! Here are related topics:';
            followUpSuggestions = lastResult.followUp;
          } else {
            responseHtml = currentLang === 'es'
              ? '¡Perfecto! Elige un tema que te interese:'
              : 'Great! Pick a topic you\'re interested in:';
            followUpSuggestions = KB[currentLang].defaultSuggestions;
          }
          break;

        case 'ofensivo':
          var ofR = NON_DOMAIN_RESPONSES[currentLang].ofensivo;
          responseHtml = ofR[Math.floor(Math.random() * ofR.length)];
          followUpSuggestions = KB[currentLang].defaultSuggestions;
          break;

        case 'afectivo':
          var afR = NON_DOMAIN_RESPONSES[currentLang].afectivo;
          responseHtml = afR[Math.floor(Math.random() * afR.length)];
          followUpSuggestions = KB[currentLang].defaultSuggestions;
          break;

        case 'ambiguo':
          var amR = NON_DOMAIN_RESPONSES[currentLang].ambiguo;
          responseHtml = amR[Math.floor(Math.random() * amR.length)];
          followUpSuggestions = KB[currentLang].defaultSuggestions;
          break;

        case 'fuera_de_tema':
          var ftR = NON_DOMAIN_RESPONSES[currentLang].fuera_de_tema;
          responseHtml = ftR[Math.floor(Math.random() * ftR.length)];
          followUpSuggestions = KB[currentLang].defaultSuggestions;
          break;

        case 'dominio':
        default:
          var result = cat.resultado || findAnswer(text, currentLang);
          responseHtml = result.answer;
          followUpSuggestions = result.followUp || KB[currentLang].defaultSuggestions;
          if (result.id) {
            lastTopicId = result.id;
            lastResult = result;
          }
          break;
      }

      messageCount++;

      /* Typing delay proportional to answer length */
      var delay = Math.min(350 + responseHtml.length * 1.2, 1400);

      setTimeout(function () {
        typing.remove();
        appendMessage(messagesEl, responseHtml, 'bot');
        renderSuggestions(suggestionsEl, followUpSuggestions, handleUserInput);
        isProcessing = false;
        sendBtn.disabled = false;
      }, delay);
    }

    /* ---- Event Listeners ---- */

    els.toggle.addEventListener('click', toggleOpen);
    closeBtn.addEventListener('click', function () {
      if (isOpen) toggleOpen();
    });
    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleUserInput(input.value);
    });

    /* Copy button delegation */
    messagesEl.addEventListener('click', function (e) {
      var copyBtn = e.target.closest('.chatbot-msg__copy');
      if (copyBtn) {
        var bubble = copyBtn.closest('.chatbot-msg').querySelector('.chatbot-msg__bubble');
        if (bubble) {
          var text = bubble.innerText || bubble.textContent;
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.classList.add('is-copied');
            setTimeout(function () { copyBtn.classList.remove('is-copied'); }, 1500);
          });
        }
        return;
      }

      /* Intercept link clicks inside chat to smooth-scroll */
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      e.preventDefault();
      var targetId = link.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        if (isOpen) toggleOpen();
        setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
      }
    });

    /* Close menu when clicking outside */
    els.win.addEventListener('click', function (e) {
      if (menuOpen && !e.target.closest('.chatbot-menu') && !e.target.closest('#chatbotMenuBtn')) {
        closeMenu();
      }
    });

    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (menuOpen) { closeMenu(); return; }
        if (isOpen) toggleOpen();
      }
    });

    /* Dismiss tooltip on hover */
    els.toggle.addEventListener('mouseenter', function () {
      if (tooltipEl) tooltipEl.classList.remove('is-visible');
    });

    /* Input placeholder changes with language */
    input.addEventListener('input', function () {
      var detected = detectLang(input.value);
      if (detected === 'en') {
        input.placeholder = 'Type your question…';
      } else {
        input.placeholder = 'Escribe tu pregunta…';
      }
    });
  }

  /* ================================================================
     HTML ESCAPE — prevent XSS from user input
     ================================================================ */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ================================================================
     BOOT
     ================================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

