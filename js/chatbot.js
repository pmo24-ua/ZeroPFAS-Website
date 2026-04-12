/* ===== ZeroPFAS Chatbot v6 — Conversational AI with Semantic Understanding ===== */
/* Architecture: TextProcessor → SynonymEngine → SemanticEngine → ConversationContext
   → IntentClassifier → ResponseGenerator → UI
   Each module exposes a clean API. To extend: add entries to KB, synonym groups, or topic graph. */
(function () {
  'use strict';

  /* ════════════════════════════════════════════════════════════════════
     MODULE 1 — TEXT PROCESSING PIPELINE
     Normalization, tokenization, stemming, edit-distance, n-gram similarity.
     ════════════════════════════════════════════════════════════════════ */
  var TextProcessor = (function () {
    var STOPWORDS = {
      es: {a:1,al:1,ante:1,con:1,de:1,del:1,el:1,ella:1,en:1,es:1,esa:1,ese:1,eso:1,esta:1,este:1,esto:1,hay:1,la:1,las:1,le:1,les:1,lo:1,los:1,me:1,mi:1,muy:1,no:1,nos:1,o:1,para:1,pero:1,por:1,que:1,se:1,si:1,sin:1,son:1,su:1,te:1,tu:1,tus:1,un:1,una:1,uno:1,unas:1,unos:1,y:1,ya:1,yo:1,como:1,mas:1,ser:1,ver:1,dar:1,ir:1,fue:1,ha:1,he:1,tiene:1,tengo:1,hace:1},
      en: {a:1,an:1,and:1,are:1,as:1,at:1,be:1,been:1,but:1,by:1,can:1,did:1,do:1,does:1,for:1,from:1,had:1,has:1,have:1,he:1,her:1,him:1,his:1,how:1,i:1,if:1,in:1,into:1,is:1,it:1,its:1,just:1,me:1,my:1,no:1,not:1,of:1,on:1,or:1,our:1,she:1,so:1,than:1,that:1,the:1,them:1,then:1,they:1,this:1,to:1,up:1,us:1,was:1,we:1,were:1,what:1,when:1,who:1,will:1,with:1,you:1,your:1}
    };

    function normalize(str) {
      return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function stemES(w) {
      return w.replace(/(cion|ciones|miento|mientos|mente|idad|idades|ismo|ismos|ista|istas)$/i, '')
        .replace(/(ando|iendo|ado|ido|ada|ida|ados|idos|adas|idas)$/i, '')
        .replace(/(ar|er|ir|arse|erse|irse)$/i, '')
        .replace(/(amos|emos|imos|an|en|as|es|os)$/i, '')
        .replace(/(ble|bles|dor|dora|dores|doras)$/i, '');
    }
    function stemEN(w) {
      return w.replace(/(tion|tions|ment|ments|ness|ity|ism|isms|ist|ists|ous|ive|ful|less|able|ible)$/i, '')
        .replace(/(ating|ing|ed|er|est|ly)$/i, '')
        .replace(/(ize|ise|ify|ate)$/i, '')
        .replace(/(al|ial|ical)$/i, '');
    }
    function stem(w, lang) { return w.length <= 3 ? w : (lang === 'es' ? stemES(w) : stemEN(w)); }

    function tokenize(text, lang) {
      var norm = normalize(text);
      var raw = norm.split(' ').filter(function (t) { return t.length > 1; });
      var sw = STOPWORDS[lang] || STOPWORDS.es;
      var meaningful = raw.filter(function (t) { return !sw[t]; });
      return {
        raw: raw,
        meaningful: meaningful,
        stemmed: meaningful.map(function (t) { return stem(t, lang); }),
        normalized: norm
      };
    }

    /* Levenshtein edit distance */
    function editDistance(a, b) {
      if (a === b) return 0;
      var la = a.length, lb = b.length;
      if (!la) return lb;
      if (!lb) return la;
      var prev = [], curr = [], i, j;
      for (j = 0; j <= la; j++) prev[j] = j;
      for (i = 1; i <= lb; i++) {
        curr[0] = i;
        for (j = 1; j <= la; j++) {
          curr[j] = b[i - 1] === a[j - 1]
            ? prev[j - 1]
            : Math.min(prev[j - 1], prev[j], curr[j - 1]) + 1;
        }
        var tmp = prev; prev = curr; curr = tmp;
      }
      return prev[la];
    }

    /* Character-level n-gram set (default trigrams) */
    function charNgrams(word, n) {
      n = n || 3;
      var grams = {}, padded = '$' + word + '$';
      for (var i = 0; i <= padded.length - n; i++) grams[padded.substring(i, i + n)] = 1;
      return grams;
    }

    /* Jaccard similarity on character trigrams */
    function ngramSimilarity(a, b) {
      if (a === b) return 1.0;
      if (a.length < 2 || b.length < 2) return 0;
      var ga = charNgrams(a, 3), gb = charNgrams(b, 3);
      var inter = 0, sizeA = 0, sizeB = 0, k;
      for (k in ga) { sizeA++; if (gb[k]) inter++; }
      for (k in gb) sizeB++;
      var union = sizeA + sizeB - inter;
      return union === 0 ? 0 : inter / union;
    }

    /* Domain-specific spelling correction */
    var DOMAIN_DICT = {
      es: ['pfas','scwo','contaminantes','contaminante','eternos','supercritica','oxidacion','nanofiltracion','cartucho','nfc','trazabilidad','verificacion','fluoruro','fluorado','perfluorado','polifluorado','normativa','regulacion','directiva','zeropfas','membrana','purificador','filtro','dispositivo','destruccion','eliminacion','bioacumulacion','cancer','toxico','agua','grifo','potable','peligro','peligroso','salud','enfermedad','industrial','ecologia','ecosistema','sostenible','producto','tecnologia','certificado','garantia'],
      en: ['pfas','scwo','contaminants','contaminant','supercritical','oxidation','nanofiltration','cartridge','nfc','traceability','verification','fluoride','fluorinated','perfluoroalkyl','polyfluoroalkyl','regulation','directive','zeropfas','membrane','purifier','filter','device','destruction','elimination','bioaccumulation','cancer','toxic','water','tap','drinking','danger','dangerous','health','disease','industrial','ecology','ecosystem','environment','sustainable','product','technology','certified','guarantee']
    };

    function correctDomainSpelling(text, lang) {
      var dict = DOMAIN_DICT[lang] || DOMAIN_DICT.es;
      var words = text.toLowerCase().split(/\s+/);
      var changed = false;
      var corrected = words.map(function (w) {
        if (w.length < 4) return w;
        for (var i = 0; i < dict.length; i++) { if (dict[i] === w) return w; }
        var bestMatch = null, bestDist = 3;
        for (var i = 0; i < dict.length; i++) {
          if (Math.abs(dict[i].length - w.length) > 2) continue;
          var dist = editDistance(w, dict[i]);
          if (dist > 0 && dist < bestDist) { bestDist = dist; bestMatch = dict[i]; }
        }
        if (bestMatch) { changed = true; return bestMatch; }
        return w;
      });
      return changed ? corrected.join(' ') : text;
    }

    return {
      normalize: normalize, tokenize: tokenize, stem: stem,
      editDistance: editDistance, ngramSimilarity: ngramSimilarity,
      correctDomainSpelling: correctDomainSpelling,
      STOPWORDS: STOPWORDS
    };
  })();

  /* ════════════════════════════════════════════════════════════════════
     MODULE 2 — SYNONYM & SEMANTIC EXPANSION
     Groups of semantically related words. When any member appears in a
     query, ALL members become candidate match tokens — dramatically
     improving recall without sacrificing precision (IDF handles that).
     To extend: add new groups or append terms to existing groups.
     ════════════════════════════════════════════════════════════════════ */
  var SynonymEngine = (function () {
    var GROUPS = {
      es: [
        ['pfas','contaminantes eternos','forever chemicals','perfluorados','fluorados','quimicos eternos','sustancias perfluoradas','polifluorados','pfoa','pfos','genx','sustancias eternas','quimicos del agua','contaminantes invisibles','contaminantes persistentes','cop','contaminantes organicos persistentes'],
        ['peligro','peligroso','dañino','nocivo','toxico','riesgo','daño','malo','perjudicial','amenaza','veneno','venenoso','letal','mortal','grave','critico','alarmante','preocupante','insalubre','inseguro','contaminante'],
        ['salud','enfermedad','cancer','enfermo','dolencia','patologia','organismo','cuerpo','tumor','tiroides','higado','rinon','hormona','inmunologico','fertilidad','reproduccion','colesterol','obesidad','endocrino','sistema inmune','sangre','plasma','suero'],
        ['eliminar','destruir','romper','descomponer','degradar','quitar','limpiar','purificar','depurar','mineralizar','oxidar','neutralizar','descontaminar','erradicar','tratar','remediar','sanear'],
        ['precio','coste','costo','tarifa','presupuesto','cuanto cuesta','cuanto vale','pagar','economico','caro','barato','inversion','asequible','accesible','rentable','amortizar','factura','suscripcion','mensual','anual'],
        ['producto','dispositivo','filtro','aparato','equipo','maquina','purificador','sistema filtrado','cartucho','membrana','unidad','modulo','sistema de filtracion','sistema de purificacion'],
        ['tecnologia','metodo','procedimiento','proceso','mecanismo','tecnica','innovacion','ciencia','ingenieria','investigacion','patente','solucion','sistema','desarrollo'],
        ['normativa','regulacion','legislacion','ley','directiva','norma','legal','regla','obligatorio','limite','umbral','maximo','minimo','cumplimiento','requisito','estandar','mcl','ppb','ppt','nanogramo','microgramo'],
        ['verificar','comprobar','demostrar','certificar','probar','medir','analizar','testear','prueba','evidencia','resultado','informe','laboratorio','ensayo','dato','estudio','investigacion','paper','articulo','cientifico'],
        ['contacto','contactar','hablar','escribir','comunicar','email','correo','mensaje','llamar','soporte','atencion al cliente','formulario','telefono','whatsapp','linkedin','reunion','cita','consulta'],
        ['equipo','fundador','creador','responsable','detras','inventor','cientifico','investigador','director','ingeniero','quimico','biologo','experto','especialista','profesional'],
        ['agua','grifo','potable','fuente','suministro','acuifero','cañeria','tuberia','red hidrica','abastecimiento','embalse','deposito','pozo','manantial','rio','lago','corriente'],
        ['medio ambiente','ecologia','naturaleza','planeta','ecosistema','medioambiental','verde','sostenible','biodiversidad','fauna','flora','contaminacion ambiental','huella','impacto ambiental','cambio climatico'],
        ['ayudar','proteger','prevenir','actuar','contribuir','colaborar','participar','solucionar','defender','cuidar','mejorar','reducir','evitar','minimizar'],
        ['industrial','gran escala','planta','fabrica','municipal','empresa','comercial','infraestructura','edar','depuradora','potabilizadora','estacion','tratamiento','industria','corporativo'],
        ['nfc','chip','trazabilidad','rastreo','seguimiento','monitorizacion','smart','inteligente','sensor','iot','conectado','digital','app','aplicacion','movil','escanear','leer'],
        ['comprar','adquirir','obtener','conseguir','pedir','encargar','venta','tienda','reservar','solicitar','hacer pedido','disponible','disponibilidad','stock','envio'],
        ['instalar','instalacion','montar','colocar','poner','configurar','conectar','enchufe','fontanero','bricolaje','diy','facil de instalar','sin obras'],
        ['casa','hogar','domestico','residencial','vivienda','cocina','fregadero','particular','piso','apartamento','chalet','familia','personal','privado'],
        ['diferencia','ventaja','mejor','comparar','unico','especial','superior','innovador','frente a','respecto a','versus','vs','competencia','alternativa','otro','otros'],
        ['funcionar','como funciona','opera','trabaja','sirve','mecanismo','funcionamiento','operacion','modo de empleo','paso a paso','proceso'],
        ['que es','que son','definicion','significado','explicar','describir','informacion','concepto','basico','introduccion','resumen','acerca de','sobre'],
        ['preocupar','preocupado','preocupada','inquieto','inquieta','miedo','temor','temer','asustado','asustada','angustia','ansiedad','nervioso','nerviosa','alarma','alerta','urgente','urgencia'],
        ['familia','hijo','hija','hijos','nino','nina','ninos','bebe','bebes','menor','menores','pequeno','pequena','embarazada','embarazo','lactancia','lactante','pediatrico','infantil','prenatal','neonatal','recien nacido','criatura','mama','papa','padre','madre'],
        ['verdad','verdadero','real','cierto','efectivo','eficaz','fiable','confiable','probado','demostrado','garantia','certificado','avalado','respaldado','contrastado','acreditado'],
        ['bueno','buena','malo','mala','seguro','segura','peligroso','peligrosa','saludable','nocivo','toxico','limpio','limpia','sucio','sucia','puro','pura','contaminado','contaminada','sano','sana'],
        ['beber','tomar','ingerir','consumir','tragar','bebida','cocinar','preparar','usar agua','utilizar agua','ducharse','banarse','lavarse'],
        ['contaminar','contaminado','contaminada','contaminacion','contaminante','contaminantes','polucionar','polucion','poluto','vertido','vertimiento','residuo','toxico','toxicidad','impureza','suciedad'],
        /* Domain-specific synonym groups */
        ['sarten','teflon','antiadherente','ptfe','recubrimiento','plancha','olla','utensilio','menaje'],
        ['ropa','textil','impermeable','goretex','gore tex','chaqueta','tejido','fibra','tela','scotchgard'],
        ['cosmetico','maquillaje','crema','champu','protector solar','desmaquillante','producto de belleza','higiene personal'],
        ['envase','envoltorio','embalaje','packaging','carton','papel encerado','recipiente','plastico','bandeja','vaso','plato desechable'],
        ['rio','lago','mar','oceano','arroyo','caudal','cauce','corriente','estuario','pantano','embalse','cuenca'],
        ['suelo','tierra','subsuelo','sedimento','lodo','fango','acuifero','terreno','parcela','campo','cultivo'],
        ['pez','peces','pescado','marisco','molusco','crustaceo','atun','salmon','trucha','sardina'],
        ['carne','leche','huevo','lacteo','queso','yogur','mantequilla','alimento','comida','dieta','nutricion'],
        ['espuma','espuma contra incendios','afff','bombero','extintor','extincion','retardante','ignifugo'],
        ['estudio','investigacion','paper','publicacion','dato','estadistica','informe','reporte','resultado','hallazgo','conclusion','evidencia cientifica'],
        ['concentracion','nivel','cantidad','medida','nanogramo','microgramo','ppb','ppt','ng/l','ug/l','limite','umbral','dosis'],
        ['reactor','camara','presion','temperatura','supercritico','supercritica','oxidacion','mineralizacion','destruccion total','co2','fluoruro'],
        ['membrana','osmosis','nanofiltracion','ultrafiltracion','filtracion','retencion','permeado','rechazo','poroso','selectivo'],
        ['carbon activado','carbon activo','adsorcion','brita','jarra filtrante','filtro nevera','filtro grifo','filtro basico'],
        ['inversion','socio','colaborador','partner','mercado','oportunidad','negocio','licencia','startup','emprender','rentabilidad','roi']
      ],
      en: [
        ['pfas','forever chemicals','perfluoroalkyl','fluorinated chemicals','eternal chemicals','polyfluoroalkyl','pfoa','pfos','genx','persistent chemicals','invisible contaminants','persistent organic pollutants','pops','chemical contamination'],
        ['danger','dangerous','harmful','toxic','risk','hazard','threat','poisonous','lethal','deadly','critical','alarming','concerning','unhealthy','unsafe'],
        ['health','disease','cancer','illness','condition','body','blood','tumor','thyroid','liver','kidney','hormone','immune','fertility','reproduction','cholesterol','obesity','endocrine','immune system','plasma','serum'],
        ['eliminate','destroy','break','decompose','degrade','remove','clean','purify','mineralize','oxidize','neutralize','decontaminate','eradicate','treat','remediate'],
        ['price','cost','pricing','budget','how much','affordable','expensive','cheap','investment','accessible','profitable','subscription','monthly','annual','value'],
        ['product','device','filter','appliance','equipment','machine','purifier','system','cartridge','membrane','unit','module','filtration system','purification system'],
        ['technology','method','procedure','process','mechanism','technique','innovation','science','engineering','research','patent','solution','development'],
        ['regulation','legislation','law','directive','rule','legal','standard','mandatory','limit','threshold','maximum','minimum','compliance','requirement','mcl','ppb','ppt','nanogram','microgram'],
        ['verify','prove','certify','test','measure','analyze','validate','evidence','result','report','laboratory','assay','data','study','research','paper','article','scientific'],
        ['contact','reach','write','email','message','call','inquire','support','customer service','form','phone','whatsapp','linkedin','meeting','appointment','consultation'],
        ['team','founder','creator','who','behind','inventor','scientist','researcher','director','engineer','chemist','biologist','expert','specialist','professional'],
        ['water','tap','drinking','supply','faucet','aquifer','pipe','plumbing','network','reservoir','well','spring','river','lake','stream'],
        ['environment','ecology','nature','planet','ecosystem','environmental','green','sustainable','biodiversity','wildlife','flora','environmental contamination','footprint','environmental impact','climate change'],
        ['help','protect','prevent','contribute','action','participate','solve','defend','care','improve','reduce','avoid','minimize'],
        ['industrial','large scale','plant','factory','municipal','commercial','enterprise','infrastructure','wastewater','treatment plant','sewage','facility','corporate'],
        ['nfc','chip','traceability','tracking','monitoring','smart','intelligent','sensor','iot','connected','digital','app','application','mobile','scan','read'],
        ['buy','purchase','acquire','get','order','shop','sale','reserve','request','available','availability','stock','shipping','delivery'],
        ['install','installation','setup','mount','place','configure','connect','plumber','diy','easy to install','no construction'],
        ['home','house','domestic','residential','household','kitchen','sink','apartment','flat','condo','family','personal','private'],
        ['difference','advantage','better','compare','unique','special','superior','innovative','versus','vs','compared to','competition','alternative','other','others'],
        ['work','how works','operate','function','mechanism','operation','how to use','step by step','process'],
        ['what is','what are','definition','meaning','explain','describe','information','concept','basics','introduction','summary','about'],
        ['worry','worried','concern','concerned','anxious','anxiety','fear','afraid','scared','frightened','uneasy','nervous','alarm','alert','urgent','urgency'],
        ['family','son','daughter','children','kids','child','baby','babies','minor','minors','toddler','pregnant','pregnancy','breastfeeding','nursing','pediatric','infant','prenatal','neonatal','newborn','mom','dad','parent','mother','father'],
        ['true','truth','real','certain','effective','reliable','trustworthy','proven','demonstrated','guarantee','certified','endorsed','backed','verified','accredited'],
        ['good','bad','safe','unsafe','dangerous','healthy','harmful','toxic','clean','dirty','polluted','pure','contaminated','sound','wholesome'],
        ['drink','consume','ingest','swallow','beverage','cook','prepare','use water','shower','bathe','wash'],
        ['contaminate','contaminated','contamination','contaminant','contaminants','pollute','pollution','polluted','discharge','spill','residue','toxic','toxicity','impurity'],
        /* Domain-specific synonym groups */
        ['pan','teflon','nonstick','ptfe','coating','skillet','pot','cookware','utensil'],
        ['clothing','textile','waterproof','goretex','gore tex','jacket','fabric','fiber','cloth','scotchgard'],
        ['cosmetic','makeup','cream','shampoo','sunscreen','beauty product','personal care','hygiene'],
        ['packaging','wrapper','cardboard','waxed paper','container','plastic','tray','cup','disposable plate'],
        ['river','lake','sea','ocean','stream','flow','waterway','estuary','wetland','reservoir','watershed','basin'],
        ['soil','ground','subsoil','sediment','sludge','mud','aquifer','terrain','field','farmland','cropland'],
        ['fish','seafood','shellfish','mollusk','crustacean','tuna','salmon','trout','sardine'],
        ['meat','milk','egg','dairy','cheese','yogurt','butter','food','meal','diet','nutrition'],
        ['foam','firefighting foam','afff','firefighter','extinguisher','fire suppression','retardant','fire resistant'],
        ['study','research','paper','publication','data','statistics','report','finding','result','conclusion','scientific evidence'],
        ['concentration','level','amount','measurement','nanogram','microgram','ppb','ppt','ng/l','ug/l','limit','threshold','dose'],
        ['reactor','chamber','pressure','temperature','supercritical','oxidation','mineralization','total destruction','co2','fluoride'],
        ['membrane','osmosis','nanofiltration','ultrafiltration','filtration','retention','permeate','rejection','porous','selective'],
        ['activated carbon','active carbon','adsorption','brita','filter pitcher','fridge filter','tap filter','basic filter'],
        ['investment','partner','collaborator','market','opportunity','business','license','startup','entrepreneurship','profitability','roi']
      ]
    };

    var _lookup = {};
    function _buildLookup(lang) {
      if (_lookup[lang]) return;
      _lookup[lang] = {};
      var groups = GROUPS[lang] || [];
      for (var g = 0; g < groups.length; g++) {
        for (var i = 0; i < groups[g].length; i++) {
          var tokens = TextProcessor.normalize(groups[g][i]).split(' ');
          for (var t = 0; t < tokens.length; t++) {
            if (tokens[t].length < 2) continue;
            if (!_lookup[lang][tokens[t]]) _lookup[lang][tokens[t]] = [];
            if (_lookup[lang][tokens[t]].indexOf(g) === -1) _lookup[lang][tokens[t]].push(g);
          }
        }
      }
    }

    /** Expand a list of tokens with all synonyms from matching groups */
    function expand(tokens, lang) {
      _buildLookup(lang);
      var lk = _lookup[lang] || {};
      var result = {};
      var seenGroups = {};
      var i, j, k;
      for (i = 0; i < tokens.length; i++) result[tokens[i]] = 1;
      for (i = 0; i < tokens.length; i++) {
        var groupIds = lk[tokens[i]];
        if (!groupIds) continue;
        for (j = 0; j < groupIds.length; j++) {
          if (seenGroups[groupIds[j]]) continue;
          seenGroups[groupIds[j]] = 1;
          var group = GROUPS[lang][groupIds[j]];
          for (k = 0; k < group.length; k++) {
            var parts = TextProcessor.normalize(group[k]).split(' ');
            for (var p = 0; p < parts.length; p++) {
              if (parts[p].length > 2) result[parts[p]] = 1;
            }
          }
        }
      }
      var out = [];
      for (var key in result) out.push(key);
      return out;
    }

    return { expand: expand };
  })();

  /* ════════════════════════════════════════════════════════════════════
     MODULE 3 — SEMANTIC SCORING ENGINE
     Multi-signal matching with IDF weighting, synonym expansion,
     fuzzy n-gram tolerance, and context boosting.
     Signals per query-token × doc-token pair:
       Phrase match in input  → 15 × avgIDF
       Exact token match      →  8 × IDF   (original query token)
       Synonym-expanded match →  5 × IDF
       Stem match             →  4 × IDF
       Fuzzy n-gram match     →  3 × sim × IDF
     Final score = Σ signals × entryWeight × contextBoost
     ════════════════════════════════════════════════════════════════════ */
  var SemanticEngine = (function () {
    var _indices = {};

    /** Pre-compute IDF and inverted index from FAQ keyword lists */
    function buildIndex(faqEntries, lang) {
      if (_indices[lang]) return _indices[lang];
      var N = faqEntries.length;
      var docTokenSets = [];
      var allTerms = {};
      var docFreq = {};
      var i, j, k;
      for (i = 0; i < N; i++) {
        var ts = {};
        var kws = faqEntries[i].keywords;
        for (j = 0; j < kws.length; j++) {
          var parts = TextProcessor.normalize(kws[j]).split(' ');
          for (k = 0; k < parts.length; k++) {
            if (parts[k].length > 1) { ts[parts[k]] = 1; allTerms[parts[k]] = 1; }
          }
        }
        docTokenSets.push(ts);
      }
      for (var term in allTerms) {
        var count = 0;
        for (i = 0; i < N; i++) { if (docTokenSets[i][term]) count++; }
        docFreq[term] = count;
      }
      var idf = {};
      for (var term in allTerms) {
        idf[term] = Math.log((N + 1) / (docFreq[term] + 1)) + 1;
      }
      /* Stem→terms reverse index for stem matching */
      var stemIdx = {};
      for (var term in allTerms) {
        var s = TextProcessor.stem(term, lang);
        if (!stemIdx[s]) stemIdx[s] = [];
        stemIdx[s].push(term);
      }
      _indices[lang] = { docTokenSets: docTokenSets, vocab: allTerms, idf: idf, stemIdx: stemIdx, N: N };
      return _indices[lang];
    }

    /** Score query against all FAQ entries. Returns sorted [{entry, score, confidence, signals}] */
    function scoreQuery(query, faqEntries, lang, contextBoosts) {
      var idx = buildIndex(faqEntries, lang);
      var parsed = TextProcessor.tokenize(query, lang);
      if (parsed.meaningful.length === 0) return [];

      /* Synonym expansion */
      var expanded = SynonymEngine.expand(parsed.meaningful, lang);
      var origSet = {};
      for (var m = 0; m < parsed.meaningful.length; m++) origSet[parsed.meaningful[m]] = 1;

      /* Fuzzy-correct tokens not in vocabulary */
      var allTokens = {};
      for (var e = 0; e < expanded.length; e++) allTokens[expanded[e]] = 1;
      for (m = 0; m < parsed.meaningful.length; m++) {
        var tok = parsed.meaningful[m];
        if (!idx.vocab[tok] && tok.length >= 4) {
          var bestMatch = null, bestSim = 0;
          for (var vt in idx.vocab) {
            if (Math.abs(vt.length - tok.length) > 3) continue;
            var sim = TextProcessor.ngramSimilarity(tok, vt);
            if (sim > bestSim && sim > 0.35) { bestSim = sim; bestMatch = vt; }
          }
          if (bestMatch) allTokens[bestMatch] = 1;
        }
      }

      var tokenArr = [];
      for (var key in allTokens) tokenArr.push(key);
      var stemArr = tokenArr.map(function (t) { return TextProcessor.stem(t, lang); });

      var results = [];
      for (var i = 0; i < faqEntries.length; i++) {
        var entry = faqEntries[i];
        var doc = idx.docTokenSets[i];
        var score = 0;
        var signals = { phrase: 0, exact: 0, synonym: 0, stem: 0, fuzzy: 0 };

        /* Signal 1: Multi-word phrase present in raw input */
        for (var p = 0; p < entry.keywords.length; p++) {
          var kwN = TextProcessor.normalize(entry.keywords[p]);
          if (kwN.indexOf(' ') !== -1 && parsed.normalized.indexOf(kwN) !== -1) {
            var pts = kwN.split(' ');
            var avgIdf = 0;
            for (var pi = 0; pi < pts.length; pi++) avgIdf += (idx.idf[pts[pi]] || 1);
            avgIdf /= pts.length;
            score += 15 * avgIdf;
            signals.phrase++;
          }
        }

        /* Signals 2-5: Token-level */
        for (var t = 0; t < tokenArr.length; t++) {
          var qTok = tokenArr[t];
          var qStem = stemArr[t];
          var idfW = idx.idf[qTok] || 1.5;
          if (doc[qTok]) {
            if (origSet[qTok]) { score += 8 * idfW; signals.exact++; }
            else                { score += 5 * idfW; signals.synonym++; }
          } else {
            var stemHit = false;
            for (var dTok in doc) {
              if (TextProcessor.stem(dTok, lang) === qStem && qStem.length >= 3) {
                score += 4 * (idx.idf[dTok] || 1);
                signals.stem++;
                stemHit = true;
                break;
              }
            }
            if (!stemHit && qTok.length >= 4) {
              var bestF = 0;
              for (var dTok in doc) {
                if (dTok.length < 4) continue;
                var fs = TextProcessor.ngramSimilarity(qTok, dTok);
                if (fs > bestF) bestF = fs;
              }
              if (bestF > 0.4) { score += 3 * bestF * idfW; signals.fuzzy++; }
            }
          }
        }

        score *= (entry.weight || 1.0);
        if (contextBoosts && contextBoosts[entry.id]) score *= contextBoosts[entry.id];
        if (score > 0) results.push({ entry: entry, score: score, signals: signals, confidence: 0 });
      }

      results.sort(function (a, b) { return b.score - a.score; });

      /* Confidence: combines absolute score strength + gap from 2nd place */
      if (results.length > 0) {
        var top = results[0].score;
        var sec = results.length > 1 ? results[1].score : 0;
        var gap = top - sec;
        for (i = 0; i < results.length; i++) {
          var absC = Math.min(results[i].score / 25, 1.0);
          var relC = results.length > 1 ? Math.min(gap / (top + 0.001), 1.0) : 1.0;
          results[i].confidence = absC * 0.7 + relC * 0.3;
        }
      }
      return results;
    }

    return { buildIndex: buildIndex, scoreQuery: scoreQuery };
  })();

  /* ════════════════════════════════════════════════════════════════════
     MODULE 4 — CONVERSATION CONTEXT MANAGER
     Tracks history, visited topics, topic relationships. Enables
     follow-up detection, anaphora resolution, context-aware boosting.
     ════════════════════════════════════════════════════════════════════ */
  var ConversationCtx = (function () {
    var _history = [];
    var _topicStack = [];
    var _currentTopic = null;
    var _lastFollowUp = null;
    var MAX_HISTORY = 20;

    var TOPIC_GRAPH = {
      'pfas-intro':     ['pfas-danger','pfas-types','pfas-sources','cf-bond','environment','regulation','scwo'],
      'pfas-danger':    ['pfas-intro','pfas-children','how-to-help','water-safe','environment','pfas-food'],
      'scwo':           ['scwo-deep','verification','product','industrial','pfas-intro','other-methods'],
      'product':        ['nfc','pricing','installation','flow-rate','filtered-water-quality','scwo','water-safe','difference','cartridge-return'],
      'regulation':     ['regulation-eu-detail','regulation-epa-detail','pfas-intro','pfas-danger','product','industrial'],
      'verification':   ['scwo','scwo-deep','industrial','product','report-analytics'],
      'industrial':     ['scwo','verification','product','pricing','scalability'],
      'nfc':            ['product','cartridge-return','report-analytics','pricing'],
      'contact':        ['pricing','team','invest'],
      'team':           ['zeropfas-about','contact'],
      'pricing':        ['product','industrial','contact'],
      'water-safe':     ['product','filtered-water-quality','pfas-danger','regulation','pfas-water-sources','pfas-children'],
      'difference':     ['scwo','verification','product','activated-carbon','other-methods'],
      'zeropfas-about': ['team','scwo','product','scalability','invest'],
      'environment':    ['pfas-intro','pfas-danger','how-to-help','pfas-water-sources'],
      'how-to-help':    ['product','water-safe','contact','pfas-children'],
      'pfas-types':     ['pfas-intro','pfas-danger','cf-bond','regulation'],
      'pfas-sources':   ['pfas-intro','pfas-food','water-safe','how-to-help'],
      'cf-bond':        ['pfas-intro','scwo','scwo-deep','other-methods'],
      'capture-stage':  ['concentration-stage','product','scwo'],
      'concentration-stage': ['capture-stage','scwo-deep','product'],
      'scwo-deep':      ['scwo','verification','cf-bond','capture-stage'],
      'cartridge-return': ['nfc','product','verification','report-analytics'],
      'activated-carbon': ['difference','product','scwo','other-methods'],
      'pfas-food':      ['pfas-sources','pfas-danger','water-safe','how-to-help'],
      'pfas-history':   ['pfas-intro','pfas-types','regulation'],
      'installation':   ['product','nfc','flow-rate','pricing'],
      'flow-rate':      ['product','installation','pricing'],
      'pfas-children':  ['pfas-danger','how-to-help','product','water-safe'],
      'other-methods':  ['scwo','activated-carbon','difference','verification'],
      'pfas-water-sources': ['water-safe','pfas-intro','environment','product'],
      'invest':         ['contact','zeropfas-about','scalability','industrial'],
      'regulation-eu-detail': ['regulation','regulation-epa-detail','product'],
      'regulation-epa-detail': ['regulation','regulation-eu-detail','product'],
      'scalability':    ['industrial','product','invest','zeropfas-about'],
      'report-analytics': ['verification','nfc','cartridge-return'],
      'filtered-water-quality': ['product','water-safe','nfc','installation','flow-rate']
    };

    var FOLLOWUP = {
      es: /\b(dime mas|cuentame mas|cuenta mas|mas informacion|mas info|mas detalles|ampliar|profundizar|sigue|continua|y que mas|que mas|mas sobre|algo mas|otra cosa|explica mas|detalla|amplia|saber mas|desarrolla|mas)\b/i,
      en: /\b(tell me more|more info|more information|more details|elaborate|continue|go on|expand|what else|anything else|more about|explain more|keep going|further|additional)\b/i
    };

    var REFERBACK = {
      es: /\b(eso|esto|lo anterior|el anterior|la anterior|del que|de lo que|sobre eso|de eso|al respecto|sobre esto|de esto)\b/i,
      en: /\b(that|this|the previous|about that|about this|regarding that|regarding this)\b/i
    };

    function push(userMsg, topicId) {
      _history.push({ user: userMsg, topicId: topicId, ts: Date.now() });
      if (_history.length > MAX_HISTORY) _history.shift();
      if (topicId) {
        _currentTopic = topicId;
        var i = _topicStack.indexOf(topicId);
        if (i !== -1) _topicStack.splice(i, 1);
        _topicStack.push(topicId);
      }
    }

    function setLastFollowUp(arr) { _lastFollowUp = arr; }
    function getLastFollowUp()    { return _lastFollowUp; }
    function getTopic()           { return _currentTopic; }
    function getStack()           { return _topicStack.slice(); }

    function isFollowUp(text, lang) {
      return (FOLLOWUP[lang] || FOLLOWUP.es).test(text);
    }
    function hasReferback(text, lang) {
      return (REFERBACK[lang] || REFERBACK.es).test(text);
    }

    /** Unvisited topics adjacent to current in the topic graph */
    function relatedUnvisited() {
      if (!_currentTopic) return [];
      var adj = TOPIC_GRAPH[_currentTopic] || [];
      var visited = {};
      for (var i = 0; i < _topicStack.length; i++) visited[_topicStack[i]] = 1;
      return adj.filter(function (t) { return !visited[t]; });
    }

    /** Next unvisited related topic (or null) */
    function resolveFollowUp() {
      var uv = relatedUnvisited();
      return uv.length > 0 ? uv[0] : null;
    }

    /** Scoring boosts based on conversation state */
    function getBoosts() {
      var b = {};
      if (!_currentTopic) return b;
      b[_currentTopic] = 1.15;
      var adj = TOPIC_GRAPH[_currentTopic] || [];
      for (var i = 0; i < adj.length; i++) b[adj[i]] = 1.1;
      return b;
    }

    function reset() { _history = []; _topicStack = []; _currentTopic = null; _lastFollowUp = null; }

    /** Count how many times a topic has been answered (before current turn) */
    function getVisitCount(topicId) {
      var count = 0;
      for (var i = 0; i < _history.length; i++) {
        if (_history[i].topicId === topicId) count++;
      }
      return count;
    }

    /** Resolve anaphoric/short queries by injecting current topic context */
    function resolveAnaphora(text, lang) {
      if (!_currentTopic) return text;

      var normText = TextProcessor.normalize(text).trim();
      if (!normText) return text;

      var wc = normText.split(/\s+/).length;
      var explicitReferback = hasReferback(text, lang);

      // Solo tratamos como pregunta dependiente del contexto
      // si realmente parece un follow-up corto o referencial.
      var elliptical =
        explicitReferback ||
        wc <= 2 ||
        /^(y|e|entonces|tambien|también|y si|y que|y qué|y el|y la|y los|y las|eso|esto|lo anterior|sobre eso|sobre esto)$/i.test(normText);

      // Si la pregunta ya trae una ancla clara, NO metemos contexto previo.
      var standaloneAnchor = /\b(nfc|chip|precio|cuanto|cuánto|cuesta|coste|costo|agua|grifo|epa|echa|directiva|normativa|regulacion|regulación|instalacion|instalación|caudal|flujo|cartucho|pfas|pfoa|pfos|scwo|producto)\b/i.test(normText);

      if (!elliptical) return text;
      if (standaloneAnchor && !explicitReferback && wc >= 2) return text;

      var topicCtx = {
        'pfas-intro':     {es:'pfas contaminantes eternos',en:'pfas forever chemicals'},
        'pfas-danger':    {es:'pfas peligro salud riesgo',en:'pfas danger health risk'},
        'scwo':           {es:'scwo tecnologia eliminar destruir',en:'scwo technology eliminate destroy'},
        'product':        {es:'producto filtro dispositivo comprar',en:'product filter device buy'},
        'regulation':     {es:'normativa regulacion ley',en:'regulation law directive'},
        'verification':   {es:'verificar probar demostrar',en:'verify prove demonstrate'},
        'industrial':     {es:'industrial planta gran escala',en:'industrial plant large scale'},
        'nfc':            {es:'nfc chip trazabilidad',en:'nfc chip traceability'},
        'contact':        {es:'contacto email',en:'contact email'},
        'team':           {es:'equipo fundador zeropfas',en:'team founder zeropfas'},
        'pricing':        {es:'precio coste cuanto',en:'price cost how much'},
        'water-safe':     {es:'agua segura grifo potable',en:'water safe tap drinking'},
        'difference':     {es:'diferencia ventaja mejor',en:'difference advantage better'},
        'zeropfas-about': {es:'zeropfas empresa sobre',en:'zeropfas company about'},
        'environment':    {es:'medio ambiente ecosistema',en:'environment ecosystem'},
        'how-to-help':    {es:'ayudar proteger prevenir',en:'help protect prevent'}
      };

      var ctx = topicCtx[_currentTopic];
      if (!ctx) return text;

      return text + ' ' + (ctx[lang] || ctx.es);
    }

    return {
      push: push, getTopic: getTopic, getStack: getStack,
      setLastFollowUp: setLastFollowUp, getLastFollowUp: getLastFollowUp,
      isFollowUp: isFollowUp, hasReferback: hasReferback,
      relatedUnvisited: relatedUnvisited, resolveFollowUp: resolveFollowUp,
      getBoosts: getBoosts, reset: reset, getVisitCount: getVisitCount,
      resolveAnaphora: resolveAnaphora, TOPIC_GRAPH: TOPIC_GRAPH
    };
  })();

  /* ════════════════════════════════════════════════════════════════════
     MODULE 4b — NATURAL LANGUAGE UNDERSTANDING (NLU)
     Sentence-level intent detection via regex patterns on full text.
     Produces ADDITIVE scores for FAQ entries — works even when
     token-level scoring returns 0 (no keyword overlap).
     ════════════════════════════════════════════════════════════════════ */
  var NLU = (function () {
    var PATTERNS = {
      es: [
        /* Question archetypes */
        {test: /\b(qu[eé]\s+(es|son|significa|quiere\s+decir)|explic[aá](me|r|nos)|cu[eé]ntame\s+(sobre|de|qu[eé])|dime\s+(qu[eé]|sobre)|informaci[oó]n\s+(sobre|de)|h[aá]bla(me)?\s+(de|sobre))\b/i, targets: {'pfas-intro': 3.0, 'zeropfas-about': 1.5}},
        {test: /\b(c[oó]mo\s+(funciona|se\s+(hace|elimina|destruye|rompe|consigue|usa|utiliza)|trabaja|opera|lo\s+hac[eé])|de\s+qu[eé]\s+(manera|forma)|mediante\s+qu[eé]|cu[aá]l\s+es\s+el\s+(proceso|m[eé]todo)|en\s+qu[eé]\s+consiste)\b/i, targets: {'scwo': 3.0, 'product': 1.5}},
        {test: /\b(es\s+segur[oa]|es\s+peligros[oa]|puede\s+(afectar|da[nñ]ar|hacer\s+da[nñ]o|enfermar)|riesgo\s+(para|de|en)|da[nñ]a|perjudica|seguridad\s+(del|de)|saludable|insegur[oa])\b/i, targets: {'pfas-danger': 3.0, 'water-safe': 2.5}},
        /* Water concern */
        {test: /\b(agua\s+(de\s+mi|del|que\s+(beb|tom)|de\s+casa|del\s+grifo|corriente|embotellad)|beb(o|er|emos|en)\s+agua|tomar\s+agua|mi\s+grifo|puedo\s+beber|calidad\s+(del|de\s+mi)\s+agua)\b/i, targets: {'water-safe': 3.5, 'product': 1.5, 'pfas-danger': 1.2}},
        {test: /\b(agua\s+contaminad|contaminaci[oó]n\s+(del|de)\s+agua|agua\s+(mal[oa]|sucia|t[oó]xic))\b/i, targets: {'water-safe': 3.0, 'pfas-danger': 2.0, 'pfas-intro': 1.0}},
        /* Purchase / Product interest */
        {test: /\b(comprar|adquirir|d[oó]nde\s+(compro|lo\s+venden|consigo|puedo)|cu[aá]nto\s+(cuesta|vale|es)|precio|quiero\s+(un|el|comprar)|venden|ofrecen|para\s+mi\s+casa|instalar\s+en\s+(mi|casa|hogar))\b/i, targets: {'product': 3.0, 'pricing': 2.5, 'nfc': 1.0}},
        {test: /\b(filtro|purificador|sistema\s+(de\s+filtrado|de\s+purificaci|para\s+agua)|debajo\s+del\s+fregadero|aparato\s+para\s+(el\s+)?agua)\b/i, targets: {'product': 3.0, 'pricing': 1.5}},
        /* What can I do / Protection */
        {test: /\b(qu[eé]\s+(puedo|debo|deber[ií]a)\s+hacer|c[oó]mo\s+(me\s+protejo|proteger|evitar|prevenir|act[uú]o|ayudo|contribu)|hay\s+(algo|alguna\s+forma)|se\s+puede\s+(hacer|evitar)|qu[eé]\s+hago|consejos?|recomendaci[oó]n|formas?\s+de\s+(proteger|ayudar|actuar|evitar))\b/i, targets: {'how-to-help': 3.5, 'product': 1.5, 'water-safe': 1.2}},
        /* Regulations */
        {test: /\b(normativa|regulaci[oó]n|ley(es)?|legal|obligatori[oa]|cumplir|permitid[oa]|prohibid[oa]|l[ií]mites?|cuando\s+entra|fecha|plazo|EPA|ECHA|directiva|europ[ea]|estados\s+unidos|2026)\b/i, targets: {'regulation': 3.5}},
        /* Team / About */
        {test: /\b(qui[eé]n(es)?\s+(sois|son|est[aá]|cre[oó]|fund[oó]|lidera|dirige)|equipo|fundador(es)?|startup|detr[aá]s\s+de|sobre\s+(vosotros|ustedes|zeropfas|la\s+empresa)|a\s+qu[eé]\s+(os\s+dedic[aá]is|se\s+dedican))\b/i, targets: {'team': 2.5, 'zeropfas-about': 3.0}},
        /* Verification / Trust */
        {test: /\b(funciona\s+(de\s+verdad|realmente|bien)|es\s+(verdad|cierto|real|efectiv[oa]|eficaz|fiable)|c[oó]mo\s+(sab[eé][ins]|demuestr|prueb|verific|comprueb)|de\s+verdad|seguro\s+que|confiar|garant[ií]a|certificad[oa]|fi[aá]r(me|se|nos)|mentira|enga[nñ]o|estafa|timo)\b/i, targets: {'verification': 3.5, 'scwo': 1.2}},
        /* Difference / Comparison */
        {test: /\b(qu[eé]\s+(os|les|te)\s+diferencia|por\s+qu[eé]\s+(zeropfas|vosotros|elegir(os)?|ustedes)|mejor\s+que|comparad[oa]?\s+con|diferencia|ventaja|[uú]nic[oa]|especial|frente\s+a\s+otros|otros\s+(filtros|sistemas|m[eé]todos))\b/i, targets: {'difference': 3.5, 'scwo': 1.2}},
        /* Contact */
        {test: /\b(contactar|hablar\s+con\s+(alguien|una\s+persona|vosotros|ustedes)|c[oó]mo\s+(os\s+contacto|contacto|llego)|email|tel[eé]fono|quiero\s+hablar|necesito\s+ayuda\s+(de\s+una\s+persona|humana)|formulario)\b/i, targets: {'contact': 3.5}},
        /* Environmental */
        {test: /\b(medio\s*ambiente|naturaleza|planeta|ecosistema|contaminaci[oó]n\s+(del|de\s+los|ambiental)|r[ií]os?|lagos?|mares?|oc[eé]anos?|suelos?|animales?|peces?|cadena\s+alimentaria|impacto\s+(ambiental|en\s+el))\b/i, targets: {'environment': 3.5, 'pfas-intro': 1.2}},
        /* Industrial */
        {test: /\b(industrial|gran\s+escala|f[aá]brica|planta\s+(de|industrial)|municipal|ciudad|EDAR|depuradora|grandes\s+vol[uú]menes|mucha\s+agua|negocio|comercial|soluci[oó]n\s+para\s+empresas)\b/i, targets: {'industrial': 3.5, 'pricing': 1.3}},
        /* NFC / Monitoring */
        {test: /\b(nfc|chip|trazabilidad|monitorizar|seguimiento|app|aplicaci[oó]n|cu[aá]ndo\s+cambiar|cu[aá]nto\s+dura|vida\s+[uú]til|recambio|cartucho|reemplazar|sustituir)\b/i, targets: {'nfc': 3.5, 'product': 1.3}},
        /* General concern (emotional, no domain words needed) */
        {test: /\b(me\s+preocupa|tengo\s+miedo|estoy\s+preocupad[oa]|me\s+da\s+miedo|me\s+asusta|no\s+s[eé]\s+si|deber[ií]a\s+preocuparme|es\s+(grave|serio|importante)|qu[eé]\s+tan\s+(grave|serio|malo))\b/i, targets: {'pfas-danger': 2.5, 'water-safe': 2.5, 'how-to-help': 2.0}},
        /* Family / Children concern */
        {test: /\b(mi\s+familia|mis\s+hijos|mis\s+ni[nñ]os|ni[nñ]os|beb[eé]s?|embarazad[oa]|embarazo|proteger\s+a\s+mi|mi\s+hij[oa]|menores|peque[nñ]os|hijos\s+peque[nñ]os)\b/i, targets: {'pfas-danger': 2.5, 'how-to-help': 2.5, 'water-safe': 2.0}},
        /* Skepticism / Doubt */
        {test: /\b(no\s+creo|imposible|no\s+se\s+puede|no\s+funciona|dudo|dudas?|no\s+me\s+(creo|f[ií][oa])|suena\s+(raro|fake|mentira)|es\s+(posible|imposible)|es\s+(un\s+)?(fraude|timo|enga[nñ]o|estafa)|demasiado\s+bueno)\b/i, targets: {'verification': 3.0, 'scwo': 2.0}},
        /* Cancer / Health specific */
        {test: /\b(c[aá]ncer|tumor|enfermedad|enferm[oa]|causan?|provocan?|producen?\s+(c[aá]ncer|enfermedad)|tiroides|h[ií]gado|ri[nñ][oó]n|hormona|sistema\s+inmun|fertilidad|reproducci[oó]n)\b/i, targets: {'pfas-danger': 3.5, 'pfas-intro': 1.5}},
        /* What I drink / consume / tap output */
        {test: /\b(lo\s+que\s+(beb|com|consum|tom)|lo\s+que\s+sale\s+del\s+grifo|beber\s+del\s+grifo|agua\s+que\s+sale)\b/i, targets: {'water-safe': 3.0, 'pfas-danger': 1.5}},
        /* "Quiero saber" intent */
        {test: /\b(quiero\s+saber|me\s+gustaria\s+saber|necesito\s+saber|quisiera\s+(saber|entender|conocer)|me\s+interesa|siento\s+curiosidad)\b/i, targets: {'pfas-intro': 2.0, 'zeropfas-about': 1.5}},
        /* PFAS in water specifically */
        {test: /\b(pfas\s+en\s+(el\s+)?agua|agua\s+con\s+pfas|pfas\s+del\s+grifo|hay\s+pfas)\b/i, targets: {'water-safe': 3.0, 'pfas-danger': 2.0, 'pfas-intro': 1.5}},
        /* PFAS types */
        {test: /\b(tipos?\s+de\s+pfas|pfoa|pfos|genx|cadena\s+(corta|larga)|clases?\s+de\s+pfas|cu[aá]ntos\s+tipos|familias?\s+de|variantes?|subtipos?)\b/i, targets: {'pfas-types': 3.5, 'pfas-intro': 1.5}},
        /* PFAS sources - everyday products */
        {test: /\b(d[oó]nde\s+(hay|est[aá]n|se\s+encuentran)|productos?\s+con\s+pfas|sart[eé]n|teflon|ropa|textil|envase|cosm[eé]tic|maquillaje|impermeable|goretex|scotchgard|espuma|antiadherente|en\s+qu[eé]\s+productos?|exposici[oó]n\s+diaria|vida\s+cotidiana)\b/i, targets: {'pfas-sources': 3.5, 'pfas-intro': 1.2}},
        /* C-F bond chemistry */
        {test: /\b(enlace|c-?f|carbono\s*-?\s*fl[uú]or|por\s+qu[eé]\s+(no\s+se\s+(degrada|rompe)|son\s+eternos|persisten|duran)|qu[ií]mica\s+(del|de)|estructura\s+molecular|485\s*kj|energ[ií]a\s+de\s+disociaci[oó]n|fuerza\s+del\s+enlace)\b/i, targets: {'cf-bond': 3.5, 'pfas-intro': 1.5}},
        /* Capture stage */
        {test: /\b(fase\s+de\s+captura|etapa\s+de\s+captura|c[oó]mo\s+(captur[aá]|atrap[aá])|resina\s+ani[oó]nica|carb[oó]n\s+(activ|activad)|adsorci[oó]n|pretratamiento|prefiltro|sedimentos)\b/i, targets: {'capture-stage': 3.5, 'product': 1.5}},
        /* Concentration stage */
        {test: /\b(concentraci[oó]n|concentrar|nanofiltraci[oó]n|[oó]smosis\s+inversa|membrana\s+(nf|ro)|x100|factor\s+de\s+concentraci[oó]n|reducir\s+volumen)\b/i, targets: {'concentration-stage': 3.5, 'scwo': 1.5}},
        /* SCWO deep dive */
        {test: /\b(agua\s+supercr[ií]tica|estado\s+supercr[ií]tico|374\s*(grados|°)|22[,.]?1\s*mpa|220\s*bar|reactor\s+scwo|dentro\s+del\s+reactor|punto\s+cr[ií]tico|fase\s+supercr[ií]tica|qu[eé]\s+(sale|pasa)\s+(del|en\s+el)\s+reactor|subproductos?|residuos?\s+t[oó]xicos?)\b/i, targets: {'scwo-deep': 3.5, 'scwo': 2.0}},
        /* Cartridge return */
        {test: /\b(retorno|devolver\s+(el\s+)?cartucho|cartucho\s+(usado|agotado|saturado)|recogida|circuito\s+(cerrado|de\s+retorno)|qu[eé]\s+hago\s+con\s+el\s+cartucho|cuando\s+se\s+agota)\b/i, targets: {'cartridge-return': 3.5, 'nfc': 1.5}},
        /* Activated carbon limitations */
        {test: /\b(carb[oó]n\s+activado|carb[oó]n\s+activo|brita|jarra|filtro\s+(normal|convencional|com[uú]n|barato)|por\s+qu[eé]\s+no\s+sirve|limitacion|solo\s+retiene|retener\s+no\s+es\s+destruir|otros\s+filtros|qu[eé]\s+filtro\s+usar?)\b/i, targets: {'activated-carbon': 3.5, 'difference': 2.0}},
        /* PFAS in food */
        {test: /\b(pfas\s+en\s+(la\s+)?comida|alimentos?\s+(contaminad|con\s+pfas)|cadena\s+(alimentaria|tr[oó]fica)|pescado|carne|leche|l[aá]cteo|huevo|envases?\s+(de\s+comida|alimentario)|comida\s+r[aá]pida|fast\s+food|palomitas|microondas|sart[eé]n.*teflon)\b/i, targets: {'pfas-food': 3.5, 'pfas-sources': 2.0}},
        /* PFAS history */
        {test: /\b(historia\s+(de\s+los\s+)?pfas|cu[aá]ndo\s+se\s+(descubri|invent)|desde\s+cu[aá]ndo|origen\s+(de\s+los\s+)?pfas|dupont|3m|dark\s+waters|pel[ií]cula|esc[aá]ndalo|demanda|juicio|cu[aá]nto\s+tiempo\s+llevan)\b/i, targets: {'pfas-history': 3.5, 'pfas-intro': 1.5}},
        /* Installation */
        {test: /\b(c[oó]mo\s+se\s+instala|instalaci[oó]n|f[aá]cil\s+de\s+instalar|necesito\s+fontanero|bricolaje|diy|debajo\s+(del\s+)?fregadero|espacio|dimensiones|tama[nñ]o|necesita\s+electricidad|silencioso|ruido)\b/i, targets: {'installation': 3.5, 'product': 1.5}},
        /* Flow rate */
        {test: /\b(caudal|litros\s+por\s+minuto|presi[oó]n|flujo|r[aá]pido|lento|cu[aá]nto\s+tarda|llenar\s+(un\s+)?vaso|2[,.]1\s*l|rendimiento\s+(del|de))\b/i, targets: {'flow-rate': 3.5, 'product': 1.5}},
        /* PFAS & children */
        {test: /\b(ni[nñ]os?\s+y\s+pfas|pfas\s+(en|y)\s+ni[nñ]os|leche\s+materna|biber[oó]n|f[oó]rmula|agua\s+para\s+beb[eé]|desarrollo\s+infantil|vacunas?\s+(infantil|de\s+ni[nñ]os)|afecta\s+a\s+(los\s+)?ni[nñ]os|proteger\s+a\s+mis\s+hijos)\b/i, targets: {'pfas-children': 3.5, 'pfas-danger': 2.0}},
        /* Other treatment methods */
        {test: /\b(otros\s+(m[eé]todos|tratamientos|tecnolog[ií]as)|alternativas?|incineraci[oó]n|incinerar|quemar|plasma|fotocatal|electroqui|bioremediaci[oó]n|bacterias|estado\s+del\s+arte|comparaci[oó]n\s+de\s+m[eé]todos|no\s+solo\s+scwo)\b/i, targets: {'other-methods': 3.5, 'scwo': 1.5}},
        /* PFAS in water sources */
        {test: /\b(r[ií]os?\s+(contaminad|con\s+pfas)|lagos?\s+(contaminad|con)|acu[ií]feros?|aguas?\s+subterr[aá]neas?|depuradora|potabilizadora|edar|etap|red\s+(de\s+agua|p[uú]blica)|de\s+d[oó]nde\s+vien|c[oó]mo\s+llegan\s+al\s+agua|tratamiento\s+convencional)\b/i, targets: {'pfas-water-sources': 3.5, 'water-safe': 2.0}},
        /* Investment / collaboration */
        {test: /\b(invertir|inversi[oó]n|inversor|capital|financiaci[oó]n|fondos|ronda|startup|colaborar|colaboraci[oó]n|partnership|socio|modelo\s+de\s+negocio|mercado|licencia|escalable)\b/i, targets: {'invest': 3.5, 'contact': 1.5}},
        /* EU regulation detail */
        {test: /\b(directiva\s+(europea|2020|eu)|2020\/2184|l[ií]mite\s+(europeo|de\s+la\s+ue)|echa\s+restricci[oó]n|restricci[oó]n\s+universal|0[,.]1\s*[µu]g|prohibici[oó]n\s+europa|normativa\s+europea)\b/i, targets: {'regulation-eu-detail': 3.5, 'regulation': 2.0}},
        /* EPA regulation detail */
        {test: /\b(epa\s+(l[ií]mite|regulaci[oó]n|normativa|4\s*ng)|mcl|maximum\s+contaminant|4\s*ng\/l|normativa\s+(epa|americana|usa)|regulaci[oó]n\s+(de\s+)?estados\s+unidos)\b/i, targets: {'regulation-epa-detail': 3.5, 'regulation': 2.0}},
        /* Scalability */
        {test: /\b(escalabilidad|escalar|modular|ampliable|de\s+casa\s+a\s+industria|todas\s+las\s+escalas|linea\s+dual|transferible|transferibilidad|global|licencia\s+tecnol[oó]gica|otros\s+pa[ií]ses)\b/i, targets: {'scalability': 3.5, 'industrial': 1.5}},
        /* Reports & analytics */
        {test: /\b(informe|reporte|datos|anal[ií]tica|dashboard|panel|monitorizar|monitorizaci[oó]n|tiempo\s+real|estad[ií]sticas?|gr[aá]fico|resultados?|c[oó]mo\s+s[eé]\s+que\s+funciona|plataforma\s+online)\b/i, targets: {'report-analytics': 3.5, 'verification': 1.5}},
        /* Implicit statements (user states a fact, expects info) */
        {test: /\b(he\s+(le[ií]do|visto|o[ií]do|escuchado)\s+(que|sobre|acerca)|(le[ií]|vi|escuch[eé])\s+(que|sobre|en\s+las\s+noticias|en\s+la\s+tele))\b/i, targets: {'pfas-intro': 2.5, 'pfas-danger': 2.0}},
        {test: /\b(mi\s+agua\s+(tiene|esta|huele|sabe|contiene)|sale\s+agua\s+(rara|turbia|mala|sucia|blanca|amarilla))\b/i, targets: {'water-safe': 3.5, 'product': 2.0}},
        {test: /\b(en\s+mi\s+(ciudad|pueblo|zona|barrio|comunidad|region)\s+(hay|tienen|detectaron|encontraron)|han\s+encontrado\s+pfas|detectaron\s+pfas|hay\s+pfas\s+en)\b/i, targets: {'pfas-water-sources': 3.0, 'water-safe': 2.5}},
        /* Cooking / daily use with water */
        {test: /\b(cocinar|hervir|hacer\s+(cafe|te|sopa|pasta|arroz)|lavar\s+(fruta|verdura|lechuga)|agua\s+para\s+cocinar|cocino\s+con)\b/i, targets: {'water-safe': 3.0, 'pfas-food': 2.5}},
        /* Everyday products concern */
        {test: /\b(mi\s+sart[eé]n|mi\s+ropa|mi\s+chaqueta|mi\s+crema|mi\s+champu|mi\s+maquillaje|uso\s+(teflon|gore|scotchgard)|tengo\s+(sartenes|ropa)\s+(con|de))\b/i, targets: {'pfas-sources': 3.5, 'pfas-danger': 1.5}},
        /* Pet concern */
        {test: /\b(mascota|perro|gato|animal(es)?\s+dom[eé]stico|mi\s+perro|mi\s+gato|animales|afecta\s+a\s+(los\s+)?animales)\b/i, targets: {'pfas-danger': 2.5, 'environment': 2.5}},
        /* Shower / bath concern */
        {test: /\b(ducha|ba[nñ]o|duchar(me|se|nos)|ba[nñ]ar(me|se|nos)|piel|absorbe\s+por\s+la\s+piel|contacto\s+con\s+la\s+piel|dermico)\b/i, targets: {'pfas-danger': 2.5, 'water-safe': 2.5}},
        /* Cost-benefit / value */
        {test: /\b(merece\s+la\s+pena|vale\s+la\s+pena|es\s+necesario|realmente\s+necesito|hace\s+falta|compensar|amortizar|relaci[oó]n\s+calidad|precio\s*-?\s*calidad|ahorro)\b/i, targets: {'pricing': 2.5, 'product': 2.0, 'pfas-danger': 1.5}},
        /* Bottled water comparison */
        {test: /\b(agua\s+(embotellada|mineral|envasada)|botella\s+de\s+agua|garrafa|manantial|comprar\s+agua|mejor\s+embotellar|beber\s+embotellada)\b/i, targets: {'water-safe': 3.0, 'activated-carbon': 2.0, 'product': 1.5}},
        /* Building/house buying concern */
        {test: /\b(construir|obra\s+nueva|piso\s+nuevo|casa\s+nueva|edificio|urbanizaci[oó]n|comunidad|vecinos|portero|administrador)\b/i, targets: {'installation': 2.5, 'product': 2.5}},
        /* Environmental news concern */
        {test: /\b(noticias|prensa|periodico|periodista|tele(vision)?|documental|reportaje|art[ií]culo|invest[ií]gaci[oó]n|estudio|universidad|publicaci[oó]n|cient[ií]fico)\b/i, targets: {'pfas-history': 2.5, 'pfas-intro': 2.0, 'verification': 1.5}},
        /* Warranties / guarantees */
        {test: /\b(garant[ií]a|cuanto\s+dura\s+(la\s+garant|el\s+producto)|vida\s+[uú]til|durabilidad|cuanto\s+tiempo\s+dura|a[nñ]os\s+de\s+garant|se\s+estropea|se\s+rompe|mantenimiento)\b/i, targets: {'product': 3.0, 'nfc': 2.0, 'pricing': 1.5}},
        /* Spain-specific */
        {test: /\b(espa[nñ]a|madrid|barcelona|valencia|sevilla|bilbao|andaluc[ií]a|catalu[nñ]a|galicia|disponible\s+en\s+espa|envian\s+a\s+espa|funciona\s+en\s+espa)\b/i, targets: {'product': 2.5, 'contact': 2.5}},
        /* Filtered water quality */
        {test: /\b(como\s+(esta|está|sale|queda)\s+el\s+agua|calidad\s+del\s+agua|agua\s+(filtrada|tratada|de\s+salida)|que\s+agua\s+sale|como\s+queda\s+el\s+agua)\b/i, targets: {'filtered-water-quality': 4.0, 'water-safe': 1.8, 'product': 1.0}},
      ],
      en: [
        /* Question archetypes */
        {test: /\b(what\s+(is|are|does)|explain|tell\s+me\s+about|information\s+(about|on)|describe)\b/i, targets: {'pfas-intro': 3.0, 'zeropfas-about': 1.5}},
        {test: /\b(how\s+(does\s+it|do\s+you|to)\s+(work|operate)|what\s+(process|method)|how\s+is\s+it\s+done|mechanism)\b/i, targets: {'scwo': 3.0, 'product': 1.5}},
        {test: /\b(is\s+it\s+(safe|dangerous)|can\s+it\s+(affect|harm|hurt)|worried|concerned|risk(y)?|harmful|damag|fear|afraid|safety|healthy|unsafe)\b/i, targets: {'pfas-danger': 3.0, 'water-safe': 2.5}},
        /* Water concern */
        {test: /\b(water\s+(from|in|at)\s+my|drinking?\s+water|my\s+(tap|faucet)|can\s+i\s+drink|safe\s+to\s+drink|water\s+quality|contaminated\s+water|home\s+water)\b/i, targets: {'water-safe': 3.5, 'product': 1.5, 'pfas-danger': 1.2}},
        /* Purchase / Product */
        {test: /\b(buy|purchase|where\s+(can\s+i|to)\s+(buy|get)|how\s+much|price|cost|want\s+(a|the|to\s+buy)|do\s+you\s+sell|available|for\s+my\s+home|install)\b/i, targets: {'product': 3.0, 'pricing': 2.5, 'nfc': 1.0}},
        {test: /\b(filter|purifier|filtration\s+system|under\s+(the\s+)?sink|water\s+(device|appliance|system))\b/i, targets: {'product': 3.0, 'pricing': 1.5}},
        /* What can I do */
        {test: /\b(what\s+(can|should)\s+i\s+do|how\s+(to|can\s+i)\s+(protect|prevent|avoid|help|act)|anything\s+i\s+can|advice|recommendation|ways\s+to)\b/i, targets: {'how-to-help': 3.5, 'product': 1.5, 'water-safe': 1.2}},
        /* Regulations */
        {test: /\b(regulation|law|legal|mandatory|comply|allowed|banned|limit|deadline|EPA|ECHA|directive|europe|united\s+states|2026)\b/i, targets: {'regulation': 3.5}},
        /* Team / About */
        {test: /\b(who\s+(are\s+you|created|founded|leads|is\s+behind)|team|founder|company|startup|about\s+(you|zeropfas|the\s+company))\b/i, targets: {'team': 2.5, 'zeropfas-about': 3.0}},
        /* Verification / Trust */
        {test: /\b(does\s+it\s+(really|actually)\s+work|is\s+it\s+(true|real|effective|reliable|proven)|how\s+do\s+you\s+(prove|verify|demonstrate|know)|guarantee|certified|trust|scam|fake|lie)\b/i, targets: {'verification': 3.5, 'scwo': 1.2}},
        /* Difference */
        {test: /\b(what\s+makes\s+you\s+different|why\s+(zeropfas|choose\s+you)|better\s+than|compared\s+to|difference|advantage|unique|superior|vs\s+other)\b/i, targets: {'difference': 3.5, 'scwo': 1.2}},
        /* Contact */
        {test: /\b(contact|talk\s+to\s+(someone|a\s+person|you)|how\s+(to|can\s+i)\s+(reach|contact)|email|phone|want\s+to\s+(talk|speak)|help\s+from\s+a\s+person|form)\b/i, targets: {'contact': 3.5}},
        /* Environmental */
        {test: /\b(environment|nature|planet|ecosystem|pollution|rivers?|lakes?|oceans?|soil|animals?|fish|food\s+chain|environmental\s+impact)\b/i, targets: {'environment': 3.5, 'pfas-intro': 1.2}},
        /* Industrial */
        {test: /\b(industrial|large\s+scale|enterprise|factory|plant|municipal|city|commercial|business|high\s+volume)\b/i, targets: {'industrial': 3.5, 'pricing': 1.3}},
        /* NFC */
        {test: /\b(nfc|chip|traceability|monitor|tracking|app|when\s+to\s+(change|replace)|how\s+long|lifespan|cartridge|replacement)\b/i, targets: {'nfc': 3.5, 'product': 1.3}},
        /* General concern */
        {test: /\b(i'?m\s+(worried|concerned|afraid|scared)|should\s+i\s+(worry|be\s+concerned)|is\s+it\s+(serious|bad|critical))\b/i, targets: {'pfas-danger': 2.5, 'water-safe': 2.5, 'how-to-help': 2.0}},
        /* Family */
        {test: /\b(my\s+family|my\s+(kids|children|baby)|children|babies|pregnant|pregnancy|protect\s+my|little\s+ones)\b/i, targets: {'pfas-danger': 2.5, 'how-to-help': 2.5, 'water-safe': 2.0}},
        /* Skepticism */
        {test: /\b(i\s+don'?t\s+(believe|think)|impossible|can'?t\s+be|doesn'?t\s+work|doubt|too\s+good\s+to\s+be\s+true|sounds?\s+(fake|like\s+a\s+scam))\b/i, targets: {'verification': 3.0, 'scwo': 2.0}},
        /* Cancer / Health */
        {test: /\b(cancer|tumor|disease|sick|cause|thyroid|liver|kidney|hormone|immune\s+system|fertility|reproduction)\b/i, targets: {'pfas-danger': 3.5, 'pfas-intro': 1.5}},
        /* PFAS in water */
        {test: /\b(pfas\s+in\s+(my\s+)?water|water\s+with\s+pfas|pfas\s+from\s+(the\s+)?tap)\b/i, targets: {'water-safe': 3.0, 'pfas-danger': 2.0, 'pfas-intro': 1.5}},
        /* PFAS types */
        {test: /\b(types?\s+of\s+pfas|pfoa|pfos|genx|short\s+chain|long\s+chain|how\s+many\s+types|families?\s+of|variants?|subtypes?)\b/i, targets: {'pfas-types': 3.5, 'pfas-intro': 1.5}},
        /* PFAS sources */
        {test: /\b(where\s+(are|can\s+you\s+find)\s+pfas|products?\s+with\s+pfas|teflon|nonstick|clothing|textile|packaging|cosmetics?|makeup|waterproof|goretex|scotchgard|foam|everyday\s+products?|daily\s+exposure|which\s+products?)\b/i, targets: {'pfas-sources': 3.5, 'pfas-intro': 1.2}},
        /* C-F bond */
        {test: /\b(c-?f\s+bond|carbon\s*-?\s*fluorine|why\s+(don'?t|won'?t)\s+they\s+(degrade|break)|why\s+(eternal|forever|persistent)|bond\s+(energy|strength|dissociation)|485\s*kj|molecular\s+structure|chemistry\s+of)\b/i, targets: {'cf-bond': 3.5, 'pfas-intro': 1.5}},
        /* Capture stage */
        {test: /\b(capture\s+stage|how\s+do\s+you\s+(capture|trap)|anionic\s+resin|activated\s+carbon|adsorption|pretreatment|prefilter|sediment\s+filter|first\s+(stage|step))\b/i, targets: {'capture-stage': 3.5, 'product': 1.5}},
        /* Concentration stage */
        {test: /\b(concentration\s+(stage|step)|nanofiltration|reverse\s+osmosis|nf\/ro|x100|concentration\s+factor|reduce\s+volume|membrane\s+stage)\b/i, targets: {'concentration-stage': 3.5, 'scwo': 1.5}},
        /* SCWO deep */
        {test: /\b(supercritical\s+(water|state|conditions|fluid)|374\s*(degrees|°)|22[.]?1\s*mpa|220\s*bar|scwo\s+reactor|inside\s+the\s+reactor|critical\s+point|what\s+comes\s+out|byproducts?|end\s+products?|toxic\s+residues?)\b/i, targets: {'scwo-deep': 3.5, 'scwo': 2.0}},
        /* Cartridge return */
        {test: /\b(return\s+(the\s+)?cartridge|used\s+cartridge|spent\s+cartridge|send\s+(it\s+)?back|collection|closed\s+loop|return\s+circuit|what\s+do\s+i\s+do\s+with|when\s+depleted)\b/i, targets: {'cartridge-return': 3.5, 'nfc': 1.5}},
        /* Activated carbon */
        {test: /\b(activated\s+carbon|carbon\s+filter|brita|pitcher|regular\s+filter|conventional\s+filter|cheap\s+filter|why\s+doesn'?t\s+it|limitations?|only\s+retains?|other\s+filters?|which\s+filter|market\s+filters?)\b/i, targets: {'activated-carbon': 3.5, 'difference': 2.0}},
        /* PFAS in food */
        {test: /\b(pfas\s+in\s+food|contaminated\s+food|food\s+chain|fish|meat|dairy|eggs?|packaging|fast\s+food|popcorn|microwave|nonstick\s+pan|food\s+(contamination|exposure)|what\s+i\s+eat)\b/i, targets: {'pfas-food': 3.5, 'pfas-sources': 2.0}},
        /* PFAS history */
        {test: /\b(history\s+of\s+pfas|when\s+(discover|invent|creat)|since\s+when|origin\s+of|dupont|3m|dark\s+waters|movie|film|scandal|lawsuit|case|how\s+long\s+have)\b/i, targets: {'pfas-history': 3.5, 'pfas-intro': 1.5}},
        /* Installation */
        {test: /\b(how\s+to\s+install|installation|easy\s+to\s+install|need\s+a\s+plumber|diy|under\s+(the\s+)?sink|space|dimensions|size|need\s+electricity|power|silent|quiet|noise)\b/i, targets: {'installation': 3.5, 'product': 1.5}},
        /* Flow rate */
        {test: /\b(flow\s+rate|liters?\s+per\s+minute|pressure|how\s+fast|how\s+slow|fill\s+a\s+(glass|bottle)|2[.]1\s*l|performance|capacity|throughput)\b/i, targets: {'flow-rate': 3.5, 'product': 1.5}},
        /* PFAS & children */
        {test: /\b(pfas\s+(and|in|for)\s+(children|kids|babies)|breast\s+milk|baby\s+(formula|water|bottle)|child\s+development|childhood\s+vaccines?|affects?\s+(children|kids|babies)|protect\s+my\s+(kids|children))\b/i, targets: {'pfas-children': 3.5, 'pfas-danger': 2.0}},
        /* Other methods */
        {test: /\b(other\s+(methods|treatments|technologies)|alternatives?|incineration|burn|plasma|photocatalysis|electrochemistry|bioremediation|bacteria|state\s+of\s+the\s+art|comparison|not\s+only\s+scwo|alternative\s+to)\b/i, targets: {'other-methods': 3.5, 'scwo': 1.5}},
        /* PFAS water sources */
        {test: /\b(rivers?\s+(contaminated|with\s+pfas)|lakes?\s+(contaminated|with)|aquifers?|groundwater|treatment\s+plant|water\s+utility|public\s+(water|supply)|where\s+do\s+they\s+come\s+from|how\s+do\s+they\s+(enter|get\s+in)|conventional\s+treatment)\b/i, targets: {'pfas-water-sources': 3.5, 'water-safe': 2.0}},
        /* Investment */
        {test: /\b(invest|investment|investor|capital|funding|finance|round|startup|collaborate|collaboration|partnership|partner|business\s+model|market|license|scalable|roi|opportunity)\b/i, targets: {'invest': 3.5, 'contact': 1.5}},
        /* EU regulation detail */
        {test: /\b(european\s+directive|directive\s+2020|2020\/2184|eu\s+limit|echa\s+restriction|universal\s+restriction|0[.]1\s*[µu]g|europe\s+ban|european\s+regulation)\b/i, targets: {'regulation-eu-detail': 3.5, 'regulation': 2.0}},
        /* EPA regulation detail */
        {test: /\b(epa\s+(limit|regulation|standard|rule|4\s*ng)|mcl|maximum\s+contaminant|4\s*ng\/l|us\s+regulation|usa\s+regulation|american\s+regulation)\b/i, targets: {'regulation-epa-detail': 3.5, 'regulation': 2.0}},
        /* Scalability */
        {test: /\b(scalability|scale\s+up|modular|expandable|home\s+to\s+industrial|all\s+scales|dual\s+line|transferable|transferability|global\s+expansion|technology\s+license|other\s+countries)\b/i, targets: {'scalability': 3.5, 'industrial': 1.5}},
        /* Reports & analytics */
        {test: /\b(reports?|data|analytics?|dashboard|panel|monitor|monitoring|real\s+time|statistics|graph|results?|how\s+do\s+i\s+know\s+it\s+works|platform|online\s+access)\b/i, targets: {'report-analytics': 3.5, 'verification': 1.5}},
        /* Implicit statements (user states a fact, expects info) */
        {test: /\b(i\s+(read|saw|heard)\s+(that|about)|(read|saw|heard)\s+(that|about|on\s+the\s+news|on\s+tv))\b/i, targets: {'pfas-intro': 2.5, 'pfas-danger': 2.0}},
        {test: /\b(my\s+water\s+(has|is|smells|tastes|contains)|water\s+(tastes?|smells?)\s+(weird|funny|bad|off|strange))\b/i, targets: {'water-safe': 3.5, 'product': 2.0}},
        {test: /\b(in\s+my\s+(city|town|area|neighborhood|community|region)\s+(there\s+are|they\s+(found|detected))|they\s+found\s+pfas|pfas\s+(detected|found)\s+in)\b/i, targets: {'pfas-water-sources': 3.0, 'water-safe': 2.5}},
        /* Cooking / daily use */
        {test: /\b(cook(ing)?|boil(ing)?|mak(e|ing)\s+(coffee|tea|soup|pasta|rice)|wash(ing)?\s+(fruit|vegetables|lettuce)|water\s+for\s+cooking|cook\s+with)\b/i, targets: {'water-safe': 3.0, 'pfas-food': 2.5}},
        /* Everyday products concern */
        {test: /\b(my\s+(pan|clothes|jacket|cream|shampoo|makeup)|using?\s+(teflon|gore|scotchgard)|have\s+(pans|clothes)\s+with)\b/i, targets: {'pfas-sources': 3.5, 'pfas-danger': 1.5}},
        /* Pet concern */
        {test: /\b(pet|dog|cat|domestic\s+animal|my\s+(dog|cat)|animals?|affect\s+animals)\b/i, targets: {'pfas-danger': 2.5, 'environment': 2.5}},
        /* Shower / bath */
        {test: /\b(shower|bath|skin|absorb\s+through\s+skin|skin\s+contact|dermal|showering|bathing)\b/i, targets: {'pfas-danger': 2.5, 'water-safe': 2.5}},
        /* Cost-benefit */
        {test: /\b(worth\s+it|is\s+it\s+necessary|do\s+i\s+really\s+need|needed|cost\s*-?\s*benefit|value\s+for\s+money|pay\s+off|savings?)\b/i, targets: {'pricing': 2.5, 'product': 2.0, 'pfas-danger': 1.5}},
        /* Bottled water comparison */
        {test: /\b(bottled\s+water|mineral\s+water|water\s+bottle|gallon|spring\s+water|buy\s+water|better\s+to\s+buy|drink\s+bottled)\b/i, targets: {'water-safe': 3.0, 'activated-carbon': 2.0, 'product': 1.5}},
        /* News / media */
        {test: /\b(news|press|journalist|television|tv|documentary|report(age)?|article|investigation|study|university|publication|scientific)\b/i, targets: {'pfas-history': 2.5, 'pfas-intro': 2.0, 'verification': 1.5}},
        /* Warranties */
        {test: /\b(warranty|how\s+long\s+does\s+(the\s+product|it)\s+last|lifespan|durability|years\s+of\s+warranty|breaks?|maintenance|upkeep)\b/i, targets: {'product': 3.0, 'nfc': 2.0, 'pricing': 1.5}},
        /* Filtered water quality */
        {test: /\b(how\s+(is|does)\s+the\s+(filtered|treated|output)\s+water|water\s+quality\s+after|what\s+water\s+comes\s+out|filtered\s+water\s+quality|how\s+clean\s+is\s+the\s+water|output\s+water)\b/i, targets: {'filtered-water-quality': 4.0, 'water-safe': 1.8, 'product': 1.0}},
      ]
    };

    function analyze(text, lang) {
      var norm = TextProcessor.normalize(text);
      var patterns = PATTERNS[lang] || PATTERNS.es;
      var scores = {};
      var matchCount = 0;
      for (var i = 0; i < patterns.length; i++) {
        if (patterns[i].test.test(text) || patterns[i].test.test(norm)) {
          matchCount++;
          for (var id in patterns[i].targets) {
            scores[id] = (scores[id] || 0) + patterns[i].targets[id];
          }
        }
      }
      return { scores: scores, matchCount: matchCount };
    }

    /* Emotion detection for empathetic responses */
    var EMOTION_PATTERNS = {
      es: {
        worry:      /\b(me\s+preocupa|estoy\s+preocupad[oa]|tengo\s+miedo|me\s+da\s+miedo|me\s+asusta|me\s+inquieta|me\s+angustia|temo\s+que|deber[ií]a\s+preocuparme|es\s+(grave|serio))\b/i,
        fear:       /\b(tengo\s+miedo|me\s+aterr|me\s+da\s+(p[aá]nico|terror)|aterrador|horr[io]ble|terrible|espantoso)\b/i,
        skepticism: /\b(no\s+(creo|me\s+(creo|f[ií][oa]))|dudo|dudas|imposible|mentira|fake|fraude|timo|estafa|enga[nñ]o|demasiado\s+bueno|suena\s+(raro|fake))\b/i,
        family:     /\b(mi(s)?\s+(familia|hij[oa]s?|ni[nñ]os?|beb[eé]s?|peque[nñ]os?)|embarazad[oa]|embarazo|proteger\s+a\s+mi)\b/i,
        urgency:    /\b(urgente|cuando\s+(antes|ya)|ya\s+mismo|inmediatamente|necesito\s+ya|lo\s+antes\s+posible|cuanto\s+antes|emergencia)\b/i
      },
      en: {
        worry:      /\b(i'?m\s+(worried|concerned)|worries\s+me|concerns\s+me|should\s+i\s+(worry|be\s+concerned)|is\s+it\s+(serious|bad))\b/i,
        fear:       /\b(i'?m\s+(afraid|scared|terrified)|scares\s+me|frightening|horrible|terrible|terrifying)\b/i,
        skepticism: /\b(i\s+don'?t\s+(believe|think)|doubt|impossible|fake|scam|sounds?\s+fake|too\s+good\s+to\s+be\s+true)\b/i,
        family:     /\b(my\s+(family|kids?|children|baby|babies)|pregnant|protect\s+my|little\s+ones)\b/i,
        urgency:    /\b(urgent|asap|immediately|right\s+now|need\s+it\s+now|emergency|as\s+soon\s+as)\b/i
      }
    };

    function detectEmotion(text, lang) {
      var patterns = EMOTION_PATTERNS[lang] || EMOTION_PATTERNS.es;
      for (var emotion in patterns) {
        if (patterns[emotion].test(text)) return emotion;
      }
      return null;
    }

    return { analyze: analyze, detectEmotion: detectEmotion };
  })();

  /* ════════════════════════════════════════════════════════════════════
     MODULE 5 — KNOWLEDGE BASE
     FAQ entries, conversational messages, topic labels.
     To add a topic: push to es.faq + en.faq, add TOPIC_LABELS, TOPIC_GRAPH.
     ════════════════════════════════════════════════════════════════════ */
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
        },
        {
          id: 'pfas-types',
          keywords: [
            'tipos', 'clases', 'familias', 'pfoa', 'pfos', 'genx', 'pfba', 'pfhxa',
            'cadena corta', 'cadena larga', 'cuantos tipos', 'cuantos hay', 'variantes',
            'diferentes pfas', 'compuestos pfas', 'subtipos', 'categorias', 'grupos',
            'acido perfluorooctanoico', 'sulfonato', 'perfluorooctano', 'acido perfluoro',
            'mas peligrosos', 'peor', 'mas comunes', 'mas frecuentes', 'lista pfas',
            'cuales son', 'cuantos pfas existen', 'clasificacion', 'nomenclatura',
            'todos iguales', 'son todos iguales', 'son lo mismo', 'diferencias entre pfas',
            '4700', 'compuesto', 'sustancia', 'grupo 1', 'cancerigeno', 'iarc',
            'cuantos compuestos', 'que pfas hay', 'principales pfas', 'pfas mas conocidos'
          ],
          answer: 'Existen más de <strong>4 700 compuestos PFAS</strong> diferentes. Los más conocidos:\n\n• <strong>PFOA</strong> (ácido perfluorooctanoico) — usado en teflón, clasificado como <strong>carcinógeno Grupo 1</strong> por la IARC\n• <strong>PFOS</strong> (sulfonato de perfluorooctano) — usado en espumas contra incendios, muy bioacumulativo\n• <strong>GenX</strong> — sustituto de PFOA que también resulta tóxico\n• <strong>PFBA / PFHxA</strong> — PFAS de cadena corta, más difíciles de filtrar\n\nSe clasifican en <strong>cadena larga</strong> (≥8 carbonos, más bioacumulativos) y <strong>cadena corta</strong> (más móviles en agua, más difíciles de capturar).',
          followUp: ['¿Son peligrosos?', '¿Cómo se eliminan?', 'Normativa'],
          weight: 1.0
        },
        {
          id: 'pfas-sources',
          keywords: [
            'donde hay', 'donde se encuentran', 'fuentes', 'origen', 'de donde vienen',
            'como llegan', 'como entran', 'productos con pfas', 'objetos', 'cosas',
            'sarten', 'teflon', 'ropa', 'textil', 'envase', 'comida rapida',
            'espuma', 'extintor', 'cosmetic', 'maquillaje', 'dental', 'hilo dental',
            'pizza', 'palomitas', 'microondas', 'impermeable', 'goretex', 'scotchgard',
            'papel', 'carton', 'envoltorio', 'antiadherente', 'en que productos',
            'donde estan', 'en mi casa', 'en mi comida', 'en mi ropa', 'exposicion diaria',
            'contacto diario', 'vida cotidiana', 'dia a dia',
            'cocina', 'ollas', 'cacharros', 'chaqueta', 'gore tex', 'plancha',
            'menaje', 'recubrimiento', 'pintura', 'barniz', 'alfombra', 'moqueta',
            'cera', 'crema solar', 'protector solar', 'champu', 'gel', 'jabon',
            'hilo', 'seda dental', 'caja pizza', 'envase comida', 'bolsa', 'plastico',
            'ptfe', 'como me expongo', 'por donde entran', 'me afectan', 'en casa hay'
          ],
          answer: 'Los PFAS están en más productos de lo que imaginas:\n\n🍳 <strong>Cocina</strong> — sartenes antiadherentes (teflón), envases de comida rápida, bolsas de palomitas\n👕 <strong>Ropa</strong> — textiles impermeables (Gore-Tex), tratamientos antimanchas (Scotchgard)\n🧴 <strong>Cosmética</strong> — bases de maquillaje, cremas, hilo dental\n🧯 <strong>Industrial</strong> — espumas contra incendios (AFFF), recubrimientos industriales\n📦 <strong>Envases</strong> — cartón para alimentos, papel resistente a grasa\n\nLa principal vía de exposición es el <strong>agua potable</strong>, seguida de alimentos y productos de consumo.',
          followUp: ['¿Mi agua es segura?', '¿Son peligrosos?', '¿Qué puedo hacer?'],
          weight: 1.0
        },
        {
          id: 'cf-bond',
          keywords: [
            'enlace', 'enlace c-f', 'enlace carbono fluor', 'por que no se degrada',
            'por que no se rompe', 'por que son eternos', 'quimica', 'estructura',
            'molecular', 'molecula', 'kj', 'kjmol', '485', 'energia',
            'resistente', 'indestructible', 'irrompible', 'mas fuerte',
            'disociacion', 'enlace covalente', 'fuerza del enlace', 'estabilidad',
            'por que persisten', 'por que duran tanto', 'como es posible',
            'por que contaminantes eternos', 'por que forever', 'fluor', 'fluoruro',
            'carbono', 'atomo', 'atomos', 'quimica organica', 'no desaparecen',
            'no se van', 'no se eliminan solos', 'naturaleza no puede', 'imposible romper',
            'que los hace eternos', 'que los hace persistentes', 'duran para siempre',
            'por que se llaman eternos', 'por que no se destruyen', 'inmune a la naturaleza'
          ],
          answer: 'El secreto de la persistencia de los PFAS está en su <strong>enlace C–F</strong>:\n\n• Energía de disociación: <strong>485 kJ/mol</strong> — el más fuerte en química orgánica\n• Comparación con otros enlaces:\n  – C–H: 411 kJ/mol\n  – C–O: 358 kJ/mol\n  – C–C: 346 kJ/mol\n  – <strong>C–F: 485 kJ/mol</strong> ⬆️\n\nNingún proceso natural (luz solar, bacterias, oxidación ambiental) tiene energía suficiente para romperlo. Por eso necesitamos condiciones <strong>supercríticas</strong> (>374 °C, >22,1 MPa) para destruirlos.',
          followUp: ['Tecnología SCWO', '¿Qué son los PFAS?', 'Verificación'],
          weight: 1.0
        },
        {
          id: 'capture-stage',
          keywords: [
            'captura', 'fase captura', 'etapa captura', 'como capturan', 'como atrapan',
            'resina', 'resina anionica', 'carbon activo', 'carbon activado', 'adsorcion',
            'absorcion', 'retencion', 'retener', 'atrapar', 'primera etapa',
            'prefiltro', 'sedimentos', 'pretratamiento', 'filtro previo',
            'primer paso', 'primera fase', 'atrapan', 'recogen', 'como filtra',
            'como funciona el filtro', 'que pasa primero', 'proceso de filtrado',
            'etapas del filtro', 'fases del proceso', '98 por ciento', '98%',
            'eficiencia', 'como retiene', 'mecanismo de captura'
          ],
          answer: 'La <strong>fase de captura</strong> es la primera etapa de nuestro sistema:\n\n<strong>1. Prefiltro de sedimentos</strong>\nElimina partículas físicas del agua\n\n<strong>2. Carbón activo</strong>\nCaptura contaminantes generales\n\n<strong>3. Resina aniónica selectiva</strong>\nDiseñada específicamente para PFAS — eficiencia de retención <strong>>98 %</strong>\n\nEsta etapa atrapa los PFAS sin destruirlos. Para la destrucción real, el cartucho saturado se envía a nuestra planta SCWO centralizada.',
          followUp: ['Concentración', 'Destrucción SCWO', 'Verificación'],
          weight: 1.0
        },
        {
          id: 'concentration-stage',
          keywords: [
            'concentracion', 'concentrar', 'membrana', 'nanofiltracion', 'osmosis inversa',
            'nf', 'ro', 'por que concentrar', 'reducir volumen', 'eficiencia',
            'x100', 'factor de concentracion', 'etapa concentracion', 'separacion',
            'segunda etapa', 'segundo paso', 'membranas', 'osmosis', 'por que no tratar todo',
            'por que concentran', 'hace falta concentrar', 'para que concentrar',
            'seleccion', 'molecular', 'filtracion por membrana', 'economico',
            'ahorrar', 'optimizar', 'menos volumen', 'cien veces'
          ],
          answer: 'La <strong>etapa de concentración</strong> usa membranas <strong>NF/RO</strong> (nanofiltración / ósmosis inversa):\n\n• 🔬 Factor de concentración: <strong>×100</strong>\n• Reduce drásticamente el volumen a tratar en el reactor SCWO\n• Hace el proceso mucho más <strong>económico y eficiente</strong>\n\nEn lugar de tratar miles de litros, concentramos los PFAS para que el reactor SCWO solo procese una fracción. Esto permite llevar la tecnología de destrucción al <strong>ámbito doméstico</strong>.',
          followUp: ['Destrucción SCWO', 'Ver el producto', 'Solución industrial'],
          weight: 1.0
        },
        {
          id: 'scwo-deep',
          keywords: [
            'agua supercritica', 'estado supercritico', 'condiciones supercriticas',
            '374 grados', '22 mpa', '220 bar', 'reactor scwo', 'como funciona scwo',
            'que pasa en el reactor', 'dentro del reactor', 'fase supercritica',
            'oxidante', 'disolvente', 'punto critico', 'agua a 374',
            'que sale del reactor', 'residuos', 'subproductos', 'productos finales',
            'co2', 'h2o', 'fluoruro', 'f-', 'inocuo', 'seguro despues',
            'temperatura alta', 'presion alta', 'alta presion', 'alta temperatura',
            'reactor', 'camara supercritica', 'como destruye', 'como rompe el enlace',
            'mineralizacion', 'destruccion total', 'fluido supercritico',
            'que queda despues', 'deja residuos', 'es limpio', 'dioxido de carbono',
            'iones fluoruro', 'cero residuos', 'oxidacion supercritica detalle'
          ],
          answer: 'Dentro del reactor <strong>SCWO</strong> ocurre algo extraordinario:\n\n🌡️ <strong>Condiciones</strong>\nTemperatura >374 °C, presión >22,1 MPa (>220 bar)\n\n💧 <strong>Estado supercrítico</strong>\nEl agua deja de ser líquido o gas — se convierte en un <strong>fluido supercrítico</strong> con propiedades únicas: disuelve compuestos orgánicos como un disolvente y los oxida simultáneamente.\n\n⚡ <strong>Proceso</strong>\nLos enlaces C–F (485 kJ/mol) se rompen completamente.\n\n✅ <strong>Productos finales</strong>\n• CO₂ (dióxido de carbono)\n• H₂O (agua)\n• F⁻ (iones fluoruro inorgánico)\n\n<strong>Cero residuos tóxicos.</strong> Todo medible y verificable.',
          followUp: ['Verificación triple', '¿Cómo lo demuestran?', 'Ver el producto'],
          weight: 1.0
        },
        {
          id: 'cartridge-return',
          keywords: [
            'retorno', 'devolver', 'devolucion', 'cartucho usado', 'cartucho agotado',
            'cartucho saturado', 'recoger', 'recogida', 'enviar cartucho',
            'que hago con el cartucho', 'cuando se agota', 'ciclo', 'logistica',
            'retornable', 'devolver cartucho', 'mandar cartucho', 'cadena',
            'circuito cerrado', 'circuito de retorno',
            'que pasa con el filtro', 'filtro gastado', 'filtro agotado', 'filtro saturado',
            'cambiar filtro', 'cambiar cartucho', 'a donde va', 'donde va el residuo',
            'se tira', 'se recicla', 'basura', 'residuo', 'recambio', 'repuesto',
            'envio gratis', 'recoger a domicilio', 'servicio recogida', 'ciclo de vida'
          ],
          answer: 'Nuestro sistema funciona con un <strong>circuito cerrado de retorno</strong>:\n\n<strong>1.</strong> El cartucho filtra PFAS en tu hogar\n<strong>2.</strong> El chip NFC te avisa cuando está saturado\n<strong>3.</strong> Lo recoges y envías de vuelta (logística incluida)\n<strong>4.</strong> En nuestra planta central, se destruyen los PFAS capturados mediante SCWO\n<strong>5.</strong> Recibes un <strong>informe analítico</strong> confirmando la destrucción\n\nAsí no solo filtramos: <strong>destruimos y verificamos</strong>. Nada queda en un vertedero.',
          followUp: ['Chip NFC', 'Verificación', 'Ver el producto'],
          weight: 1.0
        },
        {
          id: 'activated-carbon',
          keywords: [
            'carbon activado', 'carbon activo', 'filtro carbon', 'brita', 'jarra',
            'filtro normal', 'filtro convencional', 'filtro comun', 'filtro barato',
            'por que no sirve', 'no funciona', 'no elimina', 'limitaciones',
            'diferencia con filtro', 'filtro vs', 'solo retiene', 'retener no es destruir',
            'otros filtros', 'filtros del mercado', 'que filtro usar',
            'jarra filtrante', 'filtro nevera', 'filtro grifo', 'filtro basico', 'osmosis casera',
            'tengo un filtro', 'ya tengo filtro', 'mi filtro no vale', 'mi brita',
            'sirve brita', 'sirve mi filtro', 'vale un filtro normal', 'se satura',
            'saturacion', 'reliberar', 'vuelven al agua', 'no destruye', 'no descompone',
            'jarra de agua', 'filtro de agua casero', 'mejor que brita'
          ],
          answer: 'Los filtros de carbón activado (como jarras Brita) tienen <strong>limitaciones importantes</strong> con PFAS:\n\n❌ <strong>No destruyen</strong> — solo retienen (adsorben) los PFAS en el carbón\n❌ <strong>Eficacia parcial</strong> — no capturan bien PFAS de cadena corta (PFBA, PFHxA)\n❌ <strong>Saturación</strong> — cuando se saturan, los PFAS pueden re-liberarse al agua\n❌ <strong>Residuo contaminado</strong> — el carbón usado sigue conteniendo los PFAS\n\nNuestra diferencia: usamos nanofiltración selectiva + <strong>destrucción SCWO verificada</strong>. Los PFAS no se transfieren de lugar — se <strong>eliminan para siempre</strong>.',
          followUp: ['¿Por qué ZeroPFAS?', 'Ver el producto', 'Tecnología SCWO'],
          weight: 1.0
        },
        {
          id: 'pfas-food',
          keywords: [
            'comida', 'alimento', 'alimentos', 'comer', 'dieta', 'ingesta',
            'pescado', 'carne', 'huevo', 'leche', 'lacteo', 'verdura', 'fruta',
            'cadena alimentaria', 'cadena trofica', 'bioconcentracion',
            'comida contaminada', 'alimentos contaminados', 'lo que como',
            'envases alimentarios', 'packaging', 'envasado', 'microondas',
            'palomitas', 'fast food', 'comida rapida', 'grasa', 'aceite',
            'supermercado', 'mercado', 'compra', 'alimentacion', 'nutricion',
            'cocinar con agua', 'hervir agua', 'que como', 'que comemos',
            'arroz', 'pasta', 'sopa', 'cafe', 'te', 'infusion', 'bebida',
            'queso', 'yogur', 'mantequilla', 'marisco', 'gambas', 'atun', 'salmon',
            'lechuga', 'tomate', 'cultivo', 'riego', 'agricultura', 'campo',
            'suelo contaminado', 'lodo', 'biossolido', 'abono'
          ],
          answer: 'Los PFAS llegan a tu comida por <strong>varias vías</strong>:\n\n🐟 <strong>Bioacumulación</strong> — pescados y mariscos de aguas contaminadas\n🥛 <strong>Lácteos y huevos</strong> — animales expuestos a agua o suelos con PFAS\n🌱 <strong>Cultivos</strong> — riego con agua contaminada o suelos tratados con lodos\n📦 <strong>Envases</strong> — cartón resistente a grasa (cajas de pizza, bolsas de palomitas, envases de fast food)\n🍳 <strong>Utensilios</strong> — sartenes antiadherentes deterioradas con teflón\n\nLa principal fuente sigue siendo el <strong>agua potable</strong>. Un filtro específico en tu hogar reduce significativamente la exposición total.',
          followUp: ['¿Mi agua es segura?', '¿Son peligrosos?', 'Ver el producto'],
          weight: 1.0
        },
        {
          id: 'pfas-history',
          keywords: [
            'historia', 'cuando', 'cuando se descubrieron', 'desde cuando',
            'origen pfas', 'quien invento', 'quien creo', '1950', '1940', '3m',
            'dupont', 'teflon', 'scotchgard', 'dark waters', 'pelicula',
            'cuando se prohibieron', 'escandalo', 'caso', 'demanda', 'juicio',
            'contaminacion historica', 'cuanto tiempo llevan',
            'cronologia', 'linea temporal', 'timeline', 'evolucion', 'primer pfas',
            '1938', '2000', '2019', '2022', 'cuando empezaron', 'desde cuando existen',
            'cuanto llevan contaminando', 'como empezaron', 'como se descubrieron',
            'robert bilott', 'west virginia', 'parkersburg', 'mark ruffalo',
            'pelicula pfas', 'documental', 'noticias pfas', 'prensa', 'mediático'
          ],
          answer: 'La historia de los PFAS es larga y preocupante:\n\n📅 <strong>1938</strong> — Se descubre accidentalmente el PTFE (teflón) en laboratorios de DuPont\n📅 <strong>1950s</strong> — Comienza el uso masivo en productos industriales y de consumo\n📅 <strong>2000s</strong> — Primeras evidencias de contaminación global y daños a la salud (caso DuPont/West Virginia)\n📅 <strong>2019</strong> — La película <em>Dark Waters</em> expone el escándalo al público\n📅 <strong>2022</strong> — La IARC clasifica el PFOA como <strong>carcinógeno Grupo 1</strong>\n📅 <strong>2026</strong> — Entran en vigor límites estrictos de EPA (4 ng/L) y la Directiva EU 2020/2184\n\nHan pasado más de <strong>75 años</strong> de uso antes de que se tomaran medidas serias.',
          followUp: ['¿Qué son los PFAS?', 'Normativa 2026', '¿Son peligrosos?'],
          weight: 1.0
        },
        {
          id: 'installation',
          keywords: [
            'instalar', 'instalacion', 'como se instala', 'facil de instalar',
            'necesito fontanero', 'hago yo mismo', 'bricolaje', 'diy',
            'debajo fregadero', 'bajo fregadero', 'cocina', 'espacio',
            'dimensiones', 'tamaño', 'cabe', 'medidas', 'peso',
            'conectar', 'conexion', 'tuberia', 'enchufe', 'electricidad',
            'necesita electricidad', 'corriente', 'enchufar', 'ruido', 'silencioso',
            'donde se pone', 'donde va', 'donde se coloca', 'como se monta',
            'montaje', 'preparacion', 'herramientas', 'hace falta fontanero',
            'complicado de instalar', 'necesito obras', 'reforma', 'sin obras',
            'gasta luz', 'consume electricidad', 'consumo', 'autonomo',
            'facil', 'sencillo', 'rapido de instalar', 'cuanto tarda', 'paso a paso'
          ],
          answer: 'La instalación de nuestro dispositivo es <strong>sencilla</strong>:\n\n📍 <strong>Ubicación</strong> — debajo del fregadero de cocina\n🔧 <strong>Instalación</strong> — conexión directa a la tubería de agua fría\n⚡ <strong>Electricidad</strong> — <strong>no necesita</strong> conexión eléctrica para el filtrado\n🔇 <strong>Ruido</strong> — funcionamiento completamente silencioso\n📐 <strong>Tamaño</strong> — diseño compacto, cabe en la mayoría de muebles bajo fregadero\n\nPuedes instalarlo tú mismo o solicitar asistencia. El cartucho se reemplaza fácilmente con un simple clic.',
          followUp: ['Chip NFC', '¿Cuánto cuesta?', 'Ver el producto'],
          weight: 1.0
        },
        {
          id: 'flow-rate',
          keywords: [
            'caudal', 'litros', 'litros por minuto', 'presion', 'bar', 'flujo',
            'velocidad', 'rapido', 'lento', 'tarda', 'cuanto tarda',
            'llenar', 'llenar vaso', 'llenar botella', 'rendimiento',
            '2.1', 'capacidad filtrado', 'volumen', 'suficiente',
            'cuanta agua', 'cuantos litros', 'presion agua', 'potencia',
            'sale poca agua', 'reduce la presion', 'flujo normal', 'baja presion',
            'tarda mucho', 'es rapido', 'esperar', 'tiempo', 'cuanto filtra',
            'cuanto puede filtrar', 'litro', 'l/min', 'capacidad diaria',
            'da abasto', 'para toda la familia', 'suficiente agua'
          ],
          answer: 'Nuestro dispositivo tiene un caudal nominal de <strong>2,1 L/min a 3 bar</strong> de presión.\n\n• 💧 Llenas un vaso de agua en <strong>~3 segundos</strong>\n• 🍶 Llenas una botella de 1L en <strong>~30 segundos</strong>\n• 🚿 Flujo continuo sin esperas\n\nEs un caudal similar al de un grifo convencional. No notarás diferencia en tu uso diario, pero el agua estará libre de PFAS y cumpliendo los estándares más exigentes (<strong><0,5 ng/L</strong>).',
          followUp: ['Ver el producto', 'Instalación', '¿Cuánto cuesta?'],
          weight: 1.0
        },
        {
          id: 'pfas-children',
          keywords: [
            'niños', 'niñas', 'hijos', 'bebes', 'infantil', 'pediatr',
            'leche materna', 'biberon', 'formula', 'agua para bebe',
            'escuela', 'colegio', 'guarderia', 'parque', 'jugar',
            'desarrollo infantil', 'crecimiento', 'inmunidad', 'vacunas',
            'afecta a niños', 'afecta a bebes', 'pequenos', 'menores',
            'proteger a mis hijos', 'mi bebe', 'mi hijo', 'embarazo',
            'lactancia', 'amamantar', 'pecho', 'dar de mamar', 'prenatal',
            'feto', 'placenta', 'neonato', 'recien nacido', 'recien nacida',
            'hijo pequeno', 'hija pequena', 'nena', 'nene', 'criatura',
            'vulnerables', 'sensibles', 'mas afectados', 'peso corporal',
            'por kg', 'dosis relativa', 'sistema inmunitario', 'hormonas',
            'tiroides infantil', 'desarrollo cerebral', 'neurotoxicidad'
          ],
          answer: 'Los niños y bebés son <strong>especialmente vulnerables</strong> a los PFAS:\n\n👶 <strong>Exposición prenatal</strong> — los PFAS cruzan la placenta y llegan al feto\n🍼 <strong>Leche materna</strong> — se han detectado PFAS en leche materna en todo el mundo\n💉 <strong>Sistema inmune</strong> — reducen la respuesta a vacunas infantiles (estudio EPA)\n📏 <strong>Desarrollo</strong> — pueden afectar al crecimiento y desarrollo hormonal\n⚖️ <strong>Menor peso corporal</strong> — los niños beben más agua por kg que los adultos, amplificando la exposición\n\nUn sistema de filtración en casa es una de las <strong>medidas más efectivas</strong> para proteger a los más pequeños.',
          followUp: ['Ver el producto', '¿Son peligrosos?', '¿Qué puedo hacer?'],
          weight: 1.0
        },
        {
          id: 'other-methods',
          keywords: [
            'otros metodos', 'alternativas', 'otras tecnologias', 'como se elimina',
            'incineracion', 'incinerar', 'quemar', 'plasma', 'fotocatalisis',
            'sonoquimica', 'electroquimica', 'bioremediacion', 'bacterias',
            'tratamientos actuales', 'estado del arte', 'metodos existentes',
            'que opciones hay', 'que mas existe', 'comparacion metodos',
            'existen otros', 'no solo scwo', 'alternativa scwo',
            'que se hace en otros sitios', 'en otros paises', 'soluciones actuales',
            'que hay en el mercado', 'ozono', 'ultravioleta', 'uv', 'radiacion',
            'microondas', 'pirolisis', 'biodegradacion', 'hongo', 'enzima',
            'nanotecnologia', 'nanomaterial', 'tratamiento avanzado', 'remediacion',
            'como lo hacen otros', 'mejor tecnologia', 'tecnologia punta'
          ],
          answer: 'Principales métodos de tratamiento de PFAS y sus limitaciones:\n\n🔥 <strong>Incineración convencional</strong> — necesita >1 100 °C y puede generar subproductos tóxicos\n⚡ <strong>Electroquímica</strong> — funciona para bajas concentraciones, pero es lenta y costosa\n☀️ <strong>Fotocatálisis</strong> — en fase de investigación, no escalable aún\n🦠 <strong>Biorremediación</strong> — las bacterias no pueden romper el enlace C–F\n🧲 <strong>Carbón activado / resinas</strong> — solo retienen, no destruyen\n\n<strong>SCWO</strong> es la única tecnología que opera a escala con <strong>>99,9 % de destrucción</strong>, convirtiendo los PFAS en CO₂ + H₂O + F⁻ sin residuos tóxicos.',
          followUp: ['Tecnología SCWO', '¿Por qué ZeroPFAS?', 'Verificación'],
          weight: 1.0
        },
        {
          id: 'pfas-water-sources',
          keywords: [
            'rios', 'lagos', 'acuiferos', 'aguas subterraneas', 'embalse',
            'pantano', 'fuente', 'manantial', 'pozo', 'grifo', 'tuberia',
            'depuradora', 'potabilizadora', 'edar', 'etap', 'red de agua',
            'suministro', 'abastecimiento', 'distribucion',
            'de donde viene', 'entra en el agua', 'como llegan al agua',
            'agua del grifo', 'red publica', 'tratamiento convencional',
            'vertido', 'vertidos industriales', 'escorrentia', 'lixiviado',
            'vertedero', 'base militar', 'aeropuerto', 'bomberos', 'afff',
            'espuma extincion', 'no eliminan', 'no filtran', '98 por ciento',
            'contaminacion del agua', 'agua contaminada', 'mi rio', 'mi ciudad',
            'agua de mi zona', 'de donde viene mi agua', 'planta depuradora'
          ],
          answer: 'Los PFAS llegan al agua por múltiples vías:\n\n🏭 <strong>Vertidos industriales</strong> — fábricas que usan o fabrican PFAS\n🧯 <strong>Espumas contra incendios</strong> — entrenamientos en bases militares, aeropuertos\n🌧️ <strong>Escorrentía</strong> — lluvia que arrastra PFAS de suelos contaminados\n🗑️ <strong>Vertederos</strong> — lixiviados de residuos que contienen PFAS\n🚰 <strong>Tratamiento convencional</strong> — las depuradoras <strong>NO eliminan</strong> PFAS\n\nEl <strong>98 %</strong> de las fuentes de agua analizadas contienen PFAS detectables. Las plantas potabilizadoras convencionales no están diseñadas para eliminarlos.',
          followUp: ['¿Mi agua es segura?', 'Ver el producto', 'Tecnología SCWO'],
          weight: 1.0
        },
        {
          id: 'invest',
          keywords: [
            'invertir', 'inversion', 'inversor', 'inversores', 'capital', 'financiacion',
            'financiar', 'fondos', 'ronda', 'startup', 'emprender', 'negocio',
            'oportunidad', 'colaborar', 'colaboracion', 'partnership', 'socio',
            'asociarse', 'participar', 'accionista', 'crowdfunding', 'venture',
            'business model', 'modelo de negocio', 'rentable', 'rentabilidad',
            'escalable', 'mercado', 'potencial', 'proyeccion'
          ],
          answer: 'ZeroPFAS representa una <strong>oportunidad de mercado</strong> con proyección global:\n\n📈 <strong>Mercado</strong> — el tratamiento de PFAS será obligatorio en EU y EE.UU. desde 2026\n🔬 <strong>Tecnología propia</strong> — SCWO + verificación triple, enfoque integral\n📊 <strong>Escalabilidad</strong> — modelo dual (residencial + industrial)\n🌍 <strong>Transferibilidad</strong> — aplicable a cualquier país con regulación PFAS\n\nCategorías de interés:\n• 💼 Colaboración / Partnership\n• 💰 Inversión\n• 🏢 Licencia tecnológica\n\nContacta a través del <a href="#contact">formulario</a> seleccionando tu categoría de interés.',
          followUp: ['Contactar', 'Sobre ZeroPFAS', 'Solución industrial'],
          weight: 1.0
        },
        {
          id: 'regulation-eu-detail',
          keywords: [
            'directiva europea', 'directiva 2020', '2020/2184', 'europa', 'union europea',
            'ue', 'eu', 'limite europeo', '0.1', '0.5', 'microgramo',
            'transposicion', 'pais', 'paises', 'miembro', 'estampados',
            'echa restriccion', 'restriccion universal', 'prohibicion europa',
            'normativa europea', 'ley europea', 'legislacion europea', 'reglamento europeo',
            'comision europea', 'bruselas', 'parlamento europeo', 'agua potable europa',
            'directiva agua potable', 'espana', 'alemania', 'francia', 'italia',
            'limite total pfas', 'obligatorio europa', 'cuando entra en vigor europa',
            'prohibir pfas europa', 'restringir pfas', 'fabricar pfas', 'usar pfas'
          ],
          answer: 'La regulación europea sobre PFAS tiene dos pilares:\n\n🇪🇺 <strong>Directiva 2020/2184</strong> (Agua Potable)\n• Límite total de PFAS: <strong>0,1 µg/L</strong>\n• Los estados miembros deben transponer a ley nacional\n• Fecha de cumplimiento: <strong>2026</strong>\n\n🔬 <strong>ECHA — Restricción Universal</strong>\n• Propuesta de prohibir la <strong>fabricación y uso</strong> de todos los PFAS\n• La restricción más amplia de la historia\n• Periodo: 2025–2027\n\nNuestro producto cumple con los límites más exigentes: <strong><0,5 ng/L</strong> en agua filtrada, muy por debajo del requisito europeo.',
          followUp: ['Normativa EPA', 'Ver el producto', '¿Qué son los PFAS?'],
          weight: 1.0
        },
        {
          id: 'regulation-epa-detail',
          keywords: [
            'epa', 'estados unidos', 'eeuu', 'usa', 'america', 'americano',
            'mcl', 'maximo nivel', 'nivel maximo', '4 ng', '4ng',
            'pfoa pfos', 'limites epa', 'regulacion americana', 'normativa usa',
            'federal', 'estatal', 'drinking water', 'clean water act',
            'normativa americana', 'ley americana', 'agencia proteccion ambiental',
            'environmental protection', 'partes por trillon', 'ppt', 'ppb',
            'nivel maximo contaminante', 'maximo nivel contaminante',
            'pfoa limite', 'pfos limite', 'agua potable america', 'cuando en america',
            'ley usa', 'regulacion usa', 'trump', 'biden', 'gobierno'
          ],
          answer: 'La regulación de la <strong>EPA</strong> (EE.UU.) sobre PFAS:\n\n🇺🇸 <strong>MCL — Maximum Contaminant Level</strong>\n• PFOA: <strong>4,0 ng/L</strong>\n• PFOS: <strong>4,0 ng/L</strong>\n• En vigor desde: <strong>2026</strong>\n\nEsto es un nivel <strong>extremadamente bajo</strong> (partes por trillón). Los sistemas de tratamiento convencionales no pueden alcanzarlo.\n\nNuestro dispositivo produce agua con <strong><0,5 ng/L</strong> — cumple y supera el estándar EPA. Esto es crítico para municipios y hogares en zonas con contaminación conocida.',
          followUp: ['Normativa europea', 'Ver el producto', 'Solución industrial'],
          weight: 1.0
        },
        {
          id: 'scalability',
          keywords: [
            'escalabilidad', 'escalar', 'escala', 'crecer', 'crecimiento',
            'modular', 'ampliable', 'adaptable', 'flexible',
            'de casa a industria', 'todas las escalas', 'dual', 'doble linea',
            'residencial e industrial', 'hogar y empresa',
            'transferible', 'global', 'mundial', 'otros paises', 'licencia',
            'expandir', 'expansion', 'ampliar', 'mas grande', 'mas capacidad',
            'crece', 'puede crecer', 'funciona en grande', 'funciona a gran escala',
            'tambien para empresas', 'tambien industrial', 'se puede ampliar',
            'replicar', 'exportar', 'franquicia', 'internacionalizar'
          ],
          answer: 'ZeroPFAS se diseñó con <strong>escalabilidad dual</strong> desde el inicio:\n\n🏠 <strong>Línea residencial</strong>\n• Dispositivo point-of-use bajo fregadero\n• Caudal: 2,1 L/min\n• Cartuchos retornables con NFC\n\n🏭 <strong>Línea industrial</strong>\n• Reactor SCWO centralizado\n• Capacidad: >1 000 m³/día\n• Monitorización en tiempo real\n• Arquitectura modular — se amplía según demanda\n\n🌍 <strong>Transferibilidad</strong>\nLa tecnología es adaptable a cualquier país y fuente de agua. Modelo de licencia disponible para expansión global.',
          followUp: ['Solución industrial', 'Ver el producto', 'Contactar'],
          weight: 1.0
        },
        {
          id: 'report-analytics',
          keywords: [
            'informe', 'reporte', 'datos', 'analisis', 'analitica',
            'dashboard', 'panel', 'monitorizar', 'monitorizacion', 'tiempo real',
            'que datos', 'que mide', 'estadisticas', 'grafico',
            'resultado', 'resultados', 'como se que funciona',
            'plataforma', 'online', 'acceder', 'ver resultados',
            'lc-ms', 'lc ms', 'tof', 'balance de fluoruro', 'cromatografia',
            'espectrometria', 'laboratorio', 'certificado destruccion',
            'puedo comprobarlo', 'puedo verlo', 'transparencia', 'que me dicen',
            'me informan', 'recibo datos', 'cuanto destruyeron', 'cuanto eliminaron',
            'que cantidad', 'porcentaje', 'medicion', 'mediciones'
          ],
          answer: 'Nuestro sistema ofrece <strong>monitorización y reportes completos</strong>:\n\n📱 <strong>App / Plataforma</strong>\n• Estado del cartucho en tiempo real (vía NFC)\n• Alerta de reemplazo antes del agotamiento\n• Historial de uso acumulado\n\n📊 <strong>Informe de destrucción</strong>\nCada lote de cartuchos procesado genera un informe con:\n• Resultados LC-MS/MS (PFAS individual)\n• Fluoroorgánico total (TOF)\n• Balance de fluoruro (prueba de destrucción)\n\n✅ Sabrás exactamente <strong>cuántos PFAS se destruyeron</strong> y podrás verificarlo.',
          followUp: ['Verificación', 'Chip NFC', 'Ver el producto'],
          weight: 1.0
        },
        {
          id: 'filtered-water-quality',
          keywords: [
            'como esta el agua', 'como está el agua', 'como sale el agua', 'como queda el agua',
            'agua filtrada', 'agua tratada', 'agua de salida', 'calidad del agua',
            'que agua sale', 'qué agua sale', 'resultado del agua', 'agua final',
            'cumple normativa', 'agua limpia', 'agua bajo fregadero'
          ],
          answer: 'El agua filtrada está pensada para uso doméstico diario y para reducir la presencia de PFAS en el punto de uso.\n\n• ✅ La membrana de <strong>nanofiltración</strong> captura PFAS antes de que lleguen al grifo\n• 📋 El objetivo es que el agua tratada <strong>cumpla normativa EPA y EU</strong>\n• 🔄 El sistema usa <strong>cartucho reemplazable</strong> con seguimiento NFC para controlar su estado\n• 🔇 Todo ello en un formato <strong>compacto y silencioso</strong>, sin necesidad de electricidad para el filtrado\n\nEn la práctica, la idea es que el agua que sale del sistema ya haya pasado por un tratamiento específico frente a PFAS.',
          followUp: ['¿Cómo funciona el NFC?', '¿Cuánto cuesta?', 'Instalación'],
          weight: 1.05
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
        },
        {
          id: 'pfas-types',
          keywords: [
            'types', 'classes', 'families', 'pfoa', 'pfos', 'genx', 'pfba', 'pfhxa',
            'short chain', 'long chain', 'how many types', 'variants', 'different pfas',
            'subtypes', 'categories', 'groups', 'most dangerous', 'most common',
            'list pfas', 'perfluorooctanoic', 'sulfonate', 'acid',
            'which ones', 'how many pfas', 'classification', 'all the same',
            'are they all the same', 'differences between pfas', '4700',
            'compound', 'substance', 'group 1', 'carcinogen', 'iarc',
            'how many compounds', 'main pfas', 'best known', 'most studied'
          ],
          answer: 'There are over <strong>4,700 different PFAS compounds</strong>. The most well-known:\n\n• <strong>PFOA</strong> (perfluorooctanoic acid) — used in Teflon, classified as <strong>Group 1 carcinogen</strong> by IARC\n• <strong>PFOS</strong> (perfluorooctane sulfonate) — used in firefighting foams, highly bioaccumulative\n• <strong>GenX</strong> — PFOA replacement that also turned out to be toxic\n• <strong>PFBA / PFHxA</strong> — short-chain PFAS, harder to filter\n\nThey\'re classified as <strong>long-chain</strong> (≥8 carbons, more bioaccumulative) and <strong>short-chain</strong> (more mobile in water, harder to capture).',
          followUp: ['Are they dangerous?', 'How are they removed?', 'Regulations'],
          weight: 1.0
        },
        {
          id: 'pfas-sources',
          keywords: [
            'where are they', 'where found', 'sources', 'origin', 'where do they come from',
            'how do they get', 'products with pfas', 'everyday products', 'items',
            'pan', 'teflon', 'clothing', 'textile', 'packaging', 'fast food',
            'foam', 'extinguisher', 'cosmetics', 'makeup', 'dental floss',
            'pizza', 'popcorn', 'microwave', 'waterproof', 'goretex', 'scotchgard',
            'paper', 'wrapper', 'nonstick', 'which products', 'daily exposure',
            'everyday life', 'in my home', 'in my food', 'in my clothes',
            'kitchen', 'pots', 'pans', 'jacket', 'gore tex', 'coating',
            'cookware', 'furniture', 'carpet', 'rug', 'stain resistant',
            'sunscreen', 'shampoo', 'personal care', 'container', 'bag', 'plastic',
            'ptfe', 'how am i exposed', 'exposure routes', 'contact with'
          ],
          answer: 'PFAS are in more products than you\'d think:\n\n🍳 <strong>Kitchen</strong> — non-stick pans (Teflon), fast food wrappers, popcorn bags\n👕 <strong>Clothing</strong> — waterproof textiles (Gore-Tex), stain-resistant treatments (Scotchgard)\n🧴 <strong>Cosmetics</strong> — foundations, creams, dental floss\n🧯 <strong>Industrial</strong> — firefighting foams (AFFF), industrial coatings\n📦 <strong>Packaging</strong> — grease-resistant cardboard, food wrapping\n\nThe main exposure route is <strong>drinking water</strong>, followed by food and consumer products.',
          followUp: ['Is my water safe?', 'Are they dangerous?', 'What can I do?'],
          weight: 1.0
        },
        {
          id: 'cf-bond',
          keywords: [
            'bond', 'c-f bond', 'carbon fluorine', 'why dont they degrade',
            'why dont they break', 'why eternal', 'chemistry', 'structure',
            'molecular', 'molecule', 'kj', 'kjmol', '485', 'energy',
            'resistant', 'indestructible', 'strongest bond', 'dissociation',
            'covalent', 'bond strength', 'stability', 'why persist', 'how is it possible',
            'why forever', 'fluorine', 'fluoride', 'carbon', 'atom', 'atoms',
            'organic chemistry', 'dont disappear', 'dont go away', 'cant be destroyed',
            'nature cant', 'impossible to break', 'what makes them eternal',
            'what makes them persistent', 'last forever', 'why called forever',
            'why not destroyed', 'immune to nature'
          ],
          answer: 'The secret behind PFAS persistence is their <strong>C–F bond</strong>:\n\n• Dissociation energy: <strong>485 kJ/mol</strong> — the strongest in organic chemistry\n• Comparison with other bonds:\n  – C–H: 411 kJ/mol\n  – C–O: 358 kJ/mol\n  – C–C: 346 kJ/mol\n  – <strong>C–F: 485 kJ/mol</strong> ⬆️\n\nNo natural process (sunlight, bacteria, environmental oxidation) has enough energy to break it. That\'s why we need <strong>supercritical conditions</strong> (>374 °C, >22.1 MPa) to destroy them.',
          followUp: ['SCWO technology', 'What are PFAS?', 'Verification'],
          weight: 1.0
        },
        {
          id: 'capture-stage',
          keywords: [
            'capture', 'capture stage', 'how do you capture', 'how do you trap',
            'resin', 'anionic resin', 'activated carbon', 'adsorption',
            'absorption', 'retention', 'retain', 'trap', 'first stage',
            'prefilter', 'sediment', 'pretreatment',
            'first step', 'first phase', 'how does the filter work', 'what happens first',
            'filtration process', 'filter stages', 'process phases', '98 percent', '98%',
            'efficiency', 'how does it retain', 'capture mechanism'
          ],
          answer: 'The <strong>capture stage</strong> is the first phase of our system:\n\n<strong>1. Sediment prefilter</strong>\nRemoves physical particles from water\n\n<strong>2. Activated carbon</strong>\nCaptures general contaminants\n\n<strong>3. Selective anionic resin</strong>\nSpecifically designed for PFAS — retention efficiency <strong>>98%</strong>\n\nThis stage traps PFAS without destroying them. For actual destruction, the saturated cartridge is sent to our centralized SCWO plant.',
          followUp: ['Concentration', 'SCWO destruction', 'Verification'],
          weight: 1.0
        },
        {
          id: 'concentration-stage',
          keywords: [
            'concentration', 'concentrate', 'membrane', 'nanofiltration', 'reverse osmosis',
            'nf', 'ro', 'why concentrate', 'reduce volume', 'efficiency',
            'x100', 'concentration factor', 'separation stage',
            'second stage', 'second step', 'membranes', 'osmosis', 'why not treat all',
            'why concentrate', 'need to concentrate', 'purpose of concentration',
            'molecular selection', 'membrane filtration', 'economical',
            'optimize', 'less volume', 'hundred times'
          ],
          answer: 'The <strong>concentration stage</strong> uses <strong>NF/RO</strong> membranes (nanofiltration / reverse osmosis):\n\n• 🔬 Concentration factor: <strong>×100</strong>\n• Drastically reduces the volume to be treated in the SCWO reactor\n• Makes the process much more <strong>economical and efficient</strong>\n\nInstead of treating thousands of liters, we concentrate the PFAS so the SCWO reactor only processes a fraction. This is what makes destruction technology viable at the <strong>household level</strong>.',
          followUp: ['SCWO destruction', 'See the product', 'Industrial solution'],
          weight: 1.0
        },
        {
          id: 'scwo-deep',
          keywords: [
            'supercritical water', 'supercritical state', 'supercritical conditions',
            '374 degrees', '22 mpa', '220 bar', 'scwo reactor', 'how scwo works',
            'inside the reactor', 'supercritical phase', 'oxidant', 'solvent',
            'critical point', 'what comes out', 'residues', 'byproducts', 'end products',
            'co2', 'h2o', 'fluoride', 'f-', 'safe after',
            'high temperature', 'high pressure', 'how does it destroy', 'how does it break',
            'mineralization', 'total destruction', 'supercritical fluid',
            'what remains', 'any residues', 'is it clean', 'carbon dioxide',
            'fluoride ions', 'zero residues', 'supercritical oxidation detail',
            'reactor chamber', 'how hot', 'how much pressure'
          ],
          answer: 'Inside the <strong>SCWO</strong> reactor, something extraordinary happens:\n\n🌡️ <strong>Conditions</strong>\nTemperature >374 °C, pressure >22.1 MPa (>220 bar)\n\n💧 <strong>Supercritical state</strong>\nWater stops being liquid or gas — it becomes a <strong>supercritical fluid</strong> with unique properties: dissolves organic compounds like a solvent and oxidizes them simultaneously.\n\n⚡ <strong>Process</strong>\nC–F bonds (485 kJ/mol) are completely broken.\n\n✅ <strong>End products</strong>\n• CO₂ (carbon dioxide)\n• H₂O (water)\n• F⁻ (inorganic fluoride ions)\n\n<strong>Zero toxic residues.</strong> Everything measurable and verifiable.',
          followUp: ['Triple verification', 'How do you prove it?', 'See the product'],
          weight: 1.0
        },
        {
          id: 'cartridge-return',
          keywords: [
            'return', 'send back', 'used cartridge', 'spent cartridge',
            'saturated cartridge', 'collect', 'collection', 'send cartridge',
            'what do i do with', 'when depleted', 'cycle', 'logistics',
            'returnable', 'closed loop', 'return circuit',
            'what happens to filter', 'used filter', 'spent filter', 'old filter',
            'change filter', 'replace cartridge', 'where does it go', 'where does the waste go',
            'thrown away', 'recycled', 'trash', 'waste', 'replacement', 'spare',
            'free shipping', 'pickup', 'collection service', 'lifecycle'
          ],
          answer: 'Our system works on a <strong>closed-loop return circuit</strong>:\n\n<strong>1.</strong> The cartridge filters PFAS at your home\n<strong>2.</strong> The NFC chip alerts you when it\'s saturated\n<strong>3.</strong> You send it back (logistics included)\n<strong>4.</strong> At our central plant, captured PFAS are destroyed via SCWO\n<strong>5.</strong> You receive an <strong>analytical report</strong> confirming destruction\n\nWe don\'t just filter: we <strong>destroy and verify</strong>. Nothing ends up in a landfill.',
          followUp: ['NFC chip', 'Verification', 'See the product'],
          weight: 1.0
        },
        {
          id: 'activated-carbon',
          keywords: [
            'activated carbon', 'carbon filter', 'brita', 'pitcher', 'jug',
            'regular filter', 'conventional filter', 'cheap filter',
            'why doesnt it work', 'limitations', 'difference from filter',
            'filter vs', 'only retains', 'retention is not destruction',
            'other filters', 'market filters', 'which filter',
            'filter pitcher', 'fridge filter', 'tap filter', 'basic filter', 'home osmosis',
            'i have a filter', 'already have a filter', 'my filter doesnt work', 'my brita',
            'does brita work', 'does my filter work', 'normal filter enough', 'saturates',
            'saturation', 're-release', 'back into water', 'doesnt destroy', 'doesnt decompose',
            'water jug', 'home water filter', 'better than brita'
          ],
          answer: 'Activated carbon filters (like Brita pitchers) have <strong>significant limitations</strong> with PFAS:\n\n❌ <strong>No destruction</strong> — they only retain (adsorb) PFAS in the carbon\n❌ <strong>Partial effectiveness</strong> — poor capture of short-chain PFAS (PFBA, PFHxA)\n❌ <strong>Saturation</strong> — when saturated, PFAS can re-release into water\n❌ <strong>Contaminated waste</strong> — spent carbon still contains all the PFAS\n\nOur difference: selective nanofiltration + <strong>verified SCWO destruction</strong>. PFAS don\'t get transferred — they\'re <strong>eliminated forever</strong>.',
          followUp: ['Why ZeroPFAS?', 'See the product', 'SCWO technology'],
          weight: 1.0
        },
        {
          id: 'pfas-food',
          keywords: [
            'food', 'eat', 'diet', 'intake', 'fish', 'meat', 'egg', 'milk',
            'dairy', 'vegetable', 'fruit', 'food chain', 'bioconcentration',
            'contaminated food', 'what i eat', 'food packaging',
            'popcorn', 'fast food', 'grease', 'oil', 'microwave',
            'grocery', 'shopping', 'nutrition', 'cooking with water', 'boiling water',
            'rice', 'pasta', 'soup', 'coffee', 'tea', 'beverage',
            'cheese', 'yogurt', 'butter', 'seafood', 'shrimp', 'tuna', 'salmon',
            'lettuce', 'tomato', 'crop', 'irrigation', 'agriculture', 'farmland',
            'contaminated soil', 'biosolids', 'fertilizer', 'sludge'
          ],
          answer: 'PFAS reach your food through <strong>multiple pathways</strong>:\n\n🐟 <strong>Bioaccumulation</strong> — fish and seafood from contaminated waters\n🥛 <strong>Dairy and eggs</strong> — from animals exposed to PFAS-contaminated water or soil\n🌱 <strong>Crops</strong> — irrigated with contaminated water or grown in treated soils\n📦 <strong>Packaging</strong> — grease-resistant cardboard (pizza boxes, popcorn bags, fast food wrappers)\n🍳 <strong>Cookware</strong> — deteriorated non-stick pans with Teflon\n\nThe main source remains <strong>drinking water</strong>. A specific filter at home significantly reduces your total exposure.',
          followUp: ['Is my water safe?', 'Are they dangerous?', 'See the product'],
          weight: 1.0
        },
        {
          id: 'pfas-history',
          keywords: [
            'history', 'when', 'when discovered', 'since when', 'origin',
            'who invented', 'who created', '1950', '1940', '3m', 'dupont',
            'teflon', 'scotchgard', 'dark waters', 'movie', 'film',
            'when banned', 'scandal', 'lawsuit', 'case', 'trial',
            'historical contamination', 'how long',
            'chronology', 'timeline', 'evolution', 'first pfas',
            '1938', '2000', '2019', '2022', 'when did they start', 'since when exist',
            'how long contaminating', 'how did they start', 'how were they discovered',
            'robert bilott', 'west virginia', 'parkersburg', 'mark ruffalo',
            'pfas movie', 'documentary', 'news', 'media', 'press'
          ],
          answer: 'The history of PFAS is long and concerning:\n\n📅 <strong>1938</strong> — PTFE (Teflon) accidentally discovered in DuPont labs\n📅 <strong>1950s</strong> — Massive adoption begins in industrial and consumer products\n📅 <strong>2000s</strong> — First evidence of global contamination and health damage (DuPont/West Virginia case)\n📅 <strong>2019</strong> — <em>Dark Waters</em> film exposes the scandal to the public\n📅 <strong>2022</strong> — IARC classifies PFOA as <strong>Group 1 carcinogen</strong>\n📅 <strong>2026</strong> — Strict EPA limits (4 ng/L) and EU Directive 2020/2184 take effect\n\nOver <strong>75 years</strong> of use before serious action was taken.',
          followUp: ['What are PFAS?', '2026 regulations', 'Are they dangerous?'],
          weight: 1.0
        },
        {
          id: 'installation',
          keywords: [
            'install', 'installation', 'how to install', 'easy to install',
            'need a plumber', 'diy', 'do it myself', 'under sink', 'kitchen',
            'space', 'dimensions', 'size', 'fit', 'measurements', 'weight',
            'connect', 'connection', 'pipe', 'plumbing', 'electricity',
            'need electricity', 'power', 'plug in', 'noise', 'silent', 'quiet',
            'where does it go', 'where to place', 'how to mount', 'mounting',
            'preparation', 'tools', 'need a plumber', 'complicated',
            'need construction', 'renovation', 'no construction needed',
            'uses power', 'power consumption', 'energy', 'autonomous',
            'easy', 'simple', 'quick to install', 'step by step'
          ],
          answer: 'Installation of our device is <strong>straightforward</strong>:\n\n📍 <strong>Location</strong> — under your kitchen sink\n🔧 <strong>Setup</strong> — direct connection to cold water pipe\n⚡ <strong>Electricity</strong> — <strong>no power needed</strong> for filtration\n🔇 <strong>Noise</strong> — completely silent operation\n📐 <strong>Size</strong> — compact design, fits most under-sink cabinets\n\nYou can install it yourself or request assistance. The cartridge is replaced easily with a simple click.',
          followUp: ['NFC chip', 'How much does it cost?', 'See the product'],
          weight: 1.0
        },
        {
          id: 'flow-rate',
          keywords: [
            'flow rate', 'liters', 'liters per minute', 'pressure', 'bar', 'flow',
            'speed', 'fast', 'slow', 'how long', 'fill', 'fill a glass',
            'fill a bottle', 'performance', '2.1', 'capacity', 'volume', 'enough',
            'how much water', 'how many liters', 'water pressure', 'power',
            'low flow', 'reduces pressure', 'normal flow', 'low pressure',
            'takes long', 'is it fast', 'wait', 'time', 'how much does it filter',
            'daily capacity', 'keeps up', 'for whole family', 'enough water'
          ],
          answer: 'Our device has a nominal flow rate of <strong>2.1 L/min at 3 bar</strong> pressure.\n\n• 💧 Fill a glass in <strong>~3 seconds</strong>\n• 🍶 Fill a 1L bottle in <strong>~30 seconds</strong>\n• 🚿 Continuous flow, no waiting\n\nThat\'s comparable to a regular faucet. You won\'t notice any difference in daily use, but your water will be PFAS-free and meeting the strictest standards (<strong><0.5 ng/L</strong>).',
          followUp: ['See the product', 'Installation', 'How much does it cost?'],
          weight: 1.0
        },
        {
          id: 'pfas-children',
          keywords: [
            'children', 'kids', 'babies', 'infant', 'pediatric',
            'breast milk', 'bottle', 'formula', 'baby water',
            'school', 'daycare', 'playground', 'child development', 'growth',
            'immunity', 'vaccines', 'affects children', 'affects babies',
            'protect my kids', 'my baby', 'my child', 'pregnancy',
            'breastfeeding', 'nursing', 'prenatal', 'fetus', 'placenta',
            'newborn', 'toddler', 'little ones', 'vulnerable', 'sensitive',
            'most affected', 'body weight', 'per kg', 'relative dose',
            'immune system', 'hormones', 'thyroid', 'brain development', 'neurotoxicity',
            'my son', 'my daughter', 'expecting', 'pregnant'
          ],
          answer: 'Children and babies are <strong>especially vulnerable</strong> to PFAS:\n\n👶 <strong>Prenatal exposure</strong> — PFAS cross the placenta and reach the fetus\n🍼 <strong>Breast milk</strong> — PFAS have been detected in breast milk worldwide\n💉 <strong>Immune system</strong> — reduces response to childhood vaccines (EPA study)\n📏 <strong>Development</strong> — can affect growth and hormonal development\n⚖️ <strong>Lower body weight</strong> — children drink more water per kg than adults, amplifying exposure\n\nA home filtration system is one of the <strong>most effective measures</strong> to protect the little ones.',
          followUp: ['See the product', 'Are they dangerous?', 'What can I do?'],
          weight: 1.0
        },
        {
          id: 'other-methods',
          keywords: [
            'other methods', 'alternatives', 'other technologies', 'how to remove',
            'incineration', 'burn', 'plasma', 'photocatalysis', 'sonochemistry',
            'electrochemistry', 'bioremediation', 'bacteria', 'current treatments',
            'state of the art', 'existing methods', 'what options',
            'comparisons', 'not only scwo', 'alternative to scwo',
            'what do others do', 'other countries', 'current solutions',
            'whats available', 'ozone', 'ultraviolet', 'uv', 'radiation',
            'pyrolysis', 'biodegradation', 'fungi', 'enzyme', 'nanotechnology',
            'nanomaterial', 'advanced treatment', 'remediation',
            'how do others do it', 'best technology', 'cutting edge'
          ],
          answer: 'Main PFAS treatment methods and their limitations:\n\n🔥 <strong>Conventional incineration</strong> — needs >1,100 °C and may generate toxic byproducts\n⚡ <strong>Electrochemistry</strong> — works for low concentrations, but slow and expensive\n☀️ <strong>Photocatalysis</strong> — still in research phase, not scalable yet\n🦠 <strong>Bioremediation</strong> — bacteria cannot break the C–F bond\n🧲 <strong>Activated carbon / resins</strong> — only retain, don\'t destroy\n\n<strong>SCWO</strong> is the only technology operating at scale with <strong>>99.9% destruction</strong>, converting PFAS into CO₂ + H₂O + F⁻ with no toxic residues.',
          followUp: ['SCWO technology', 'Why ZeroPFAS?', 'Verification'],
          weight: 1.0
        },
        {
          id: 'pfas-water-sources',
          keywords: [
            'rivers', 'lakes', 'aquifers', 'groundwater', 'reservoir',
            'spring', 'well', 'tap', 'pipes', 'treatment plant',
            'water utility', 'public water', 'supply', 'distribution',
            'where does it come from', 'how do they enter', 'how do they get in',
            'tap water', 'public supply', 'conventional treatment',
            'discharge', 'industrial discharge', 'runoff', 'leachate',
            'landfill', 'military base', 'airport', 'firefighters', 'afff',
            'firefighting foam', 'dont remove', 'dont filter', '98 percent',
            'water contamination', 'contaminated water', 'my river', 'my city',
            'water in my area', 'where does my water come from', 'treatment facility'
          ],
          answer: 'PFAS enter water through multiple pathways:\n\n🏭 <strong>Industrial discharge</strong> — factories that use or manufacture PFAS\n🧯 <strong>Firefighting foams</strong> — training at military bases, airports\n🌧️ <strong>Runoff</strong> — rain washing PFAS from contaminated soils\n🗑️ <strong>Landfills</strong> — leachate from PFAS-containing waste\n🚰 <strong>Conventional treatment</strong> — water treatment plants <strong>DO NOT remove</strong> PFAS\n\n<strong>98%</strong> of analyzed water sources contain detectable PFAS. Conventional water treatment plants were not designed to eliminate them.',
          followUp: ['Is my water safe?', 'See the product', 'SCWO technology'],
          weight: 1.0
        },
        {
          id: 'invest',
          keywords: [
            'invest', 'investment', 'investor', 'capital', 'funding', 'finance',
            'round', 'startup', 'business', 'opportunity', 'collaborate',
            'collaboration', 'partnership', 'partner', 'shareholder',
            'crowdfunding', 'venture', 'business model', 'profitable',
            'scalable', 'market', 'potential', 'projection', 'roi'
          ],
          answer: 'ZeroPFAS represents a <strong>market opportunity</strong> with global potential:\n\n📈 <strong>Market</strong> — PFAS treatment becomes mandatory in EU and USA from 2026\n🔬 <strong>Proprietary technology</strong> — SCWO + triple verification, integrated approach\n📊 <strong>Scalability</strong> — dual model (residential + industrial)\n🌍 <strong>Transferability</strong> — applicable to any country with PFAS regulations\n\nInterest categories:\n• 💼 Collaboration / Partnership\n• 💰 Investment\n• 🏢 Technology license\n\nReach out via the <a href="#contact">contact form</a> selecting your category of interest.',
          followUp: ['Contact us', 'About ZeroPFAS', 'Industrial solution'],
          weight: 1.0
        },
        {
          id: 'regulation-eu-detail',
          keywords: [
            'european directive', 'directive 2020', '2020/2184', 'europe', 'european union',
            'eu limit', '0.1', '0.5', 'microgram', 'transposition', 'member states',
            'echa restriction', 'universal restriction', 'europe ban',
            'european regulation', 'european law', 'european legislation',
            'european commission', 'brussels', 'european parliament', 'drinking water europe',
            'drinking water directive', 'spain', 'germany', 'france', 'italy',
            'total pfas limit', 'mandatory europe', 'when does it take effect europe',
            'ban pfas europe', 'restrict pfas', 'manufacture pfas', 'use pfas'
          ],
          answer: 'European PFAS regulation has two pillars:\n\n🇪🇺 <strong>Directive 2020/2184</strong> (Drinking Water)\n• Total PFAS limit: <strong>0.1 µg/L</strong>\n• Member states must transpose into national law\n• Compliance deadline: <strong>2026</strong>\n\n🔬 <strong>ECHA — Universal Restriction</strong>\n• Proposal to ban the <strong>manufacture and use</strong> of all PFAS\n• The broadest restriction in history\n• Timeline: 2025–2027\n\nOur product meets the most stringent limits: <strong><0.5 ng/L</strong> in filtered water — far below the European requirement.',
          followUp: ['EPA regulations', 'See the product', 'What are PFAS?'],
          weight: 1.0
        },
        {
          id: 'regulation-epa-detail',
          keywords: [
            'epa', 'united states', 'usa', 'america', 'american',
            'mcl', 'maximum contaminant', '4 ng', '4ng',
            'pfoa pfos', 'epa limits', 'us regulation', 'usa regulation',
            'federal', 'state', 'drinking water', 'clean water act',
            'american regulation', 'american law', 'environmental protection agency',
            'parts per trillion', 'ppt', 'ppb', 'maximum contaminant level',
            'pfoa limit', 'pfos limit', 'drinking water america', 'when in america',
            'us law', 'us regulation'
          ],
          answer: '<strong>EPA</strong> (USA) regulation on PFAS:\n\n🇺🇸 <strong>MCL — Maximum Contaminant Level</strong>\n• PFOA: <strong>4.0 ng/L</strong>\n• PFOS: <strong>4.0 ng/L</strong>\n• Effective since: <strong>2026</strong>\n\nThis is an <strong>extremely low level</strong> (parts per trillion). Conventional treatment systems cannot achieve it.\n\nOur device produces water at <strong><0.5 ng/L</strong> — meets and exceeds EPA standards. This is critical for municipalities and homes in areas with known contamination.',
          followUp: ['European regulations', 'See the product', 'Industrial solution'],
          weight: 1.0
        },
        {
          id: 'scalability',
          keywords: [
            'scalability', 'scale', 'scale up', 'grow', 'growth',
            'modular', 'expandable', 'adaptable', 'flexible',
            'home to industrial', 'all scales', 'dual', 'dual line',
            'residential and industrial', 'home and business',
            'transferable', 'global', 'worldwide', 'other countries', 'license',
            'expand', 'expansion', 'enlarge', 'bigger', 'more capacity',
            'grows', 'can it grow', 'works large scale', 'works at scale',
            'also for businesses', 'also industrial', 'can be expanded',
            'replicate', 'export', 'franchise', 'internationalize'
          ],
          answer: 'ZeroPFAS was designed with <strong>dual scalability</strong> from the start:\n\n🏠 <strong>Residential line</strong>\n• Point-of-use device under sink\n• Flow rate: 2.1 L/min\n• Returnable cartridges with NFC\n\n🏭 <strong>Industrial line</strong>\n• Centralized SCWO reactor\n• Capacity: >1,000 m³/day\n• Real-time monitoring\n• Modular architecture — expands on demand\n\n🌍 <strong>Transferability</strong>\nThe technology adapts to any country and water source. Licensing model available for global expansion.',
          followUp: ['Industrial solution', 'See the product', 'Contact us'],
          weight: 1.0
        },
        {
          id: 'report-analytics',
          keywords: [
            'report', 'data', 'analysis', 'analytics', 'dashboard', 'panel',
            'monitor', 'monitoring', 'real time', 'what data', 'what does it measure',
            'statistics', 'graph', 'results', 'how do i know it works',
            'platform', 'online', 'access', 'see results',
            'lc-ms', 'lc ms', 'tof', 'fluoride balance', 'chromatography',
            'spectrometry', 'laboratory', 'destruction certificate',
            'can i verify', 'can i see', 'transparency', 'what do you tell me',
            'do you inform me', 'do i get data', 'how much destroyed', 'how much eliminated',
            'what amount', 'percentage', 'measurement', 'measurements'
          ],
          answer: 'Our system offers <strong>comprehensive monitoring and reports</strong>:\n\n📱 <strong>App / Platform</strong>\n• Real-time cartridge status (via NFC)\n• Replacement alert before depletion\n• Cumulative usage history\n\n📊 <strong>Destruction Report</strong>\nEach processed cartridge batch generates a report with:\n• LC-MS/MS results (individual PFAS)\n• Total organofluorine (TOF)\n• Fluoride balance (destruction proof)\n\n✅ You\'ll know exactly <strong>how many PFAS were destroyed</strong> and can verify it yourself.',
          followUp: ['Verification', 'NFC chip', 'See the product'],
          weight: 1.0
        },
        {
          id: 'filtered-water-quality',
          keywords: [
            'how is the water', 'how does the water come out', 'water after filtering',
            'filtered water', 'treated water', 'output water', 'water quality',
            'what water comes out', 'water result', 'final water',
            'meets regulations', 'clean water', 'under sink water'
          ],
          answer: 'The filtered water is designed for daily household use and to reduce the presence of PFAS at the point of use.\n\n• ✅ The <strong>nanofiltration</strong> membrane captures PFAS before they reach your tap\n• 📋 The goal is for treated water to <strong>meet EPA and EU standards</strong>\n• 🔄 The system uses a <strong>replaceable cartridge</strong> with NFC tracking to monitor its status\n• 🔇 All in a <strong>compact and silent</strong> format, no electricity needed for filtration\n\nIn practice, the water coming out of the system has been through a specific PFAS treatment process.',
          followUp: ['How does NFC work?', 'How much does it cost?', 'Installation'],
          weight: 1.05
        }
      ]
    }
  };

  /* ════════════════════════════════════════════════════════════════════
     MODULE 6 — INTENT PATTERNS & NON-DOMAIN RESPONSES
     Regex-based guardrails for non-domain conversational intents.
     ════════════════════════════════════════════════════════════════════ */
  var PATTERNS = {
    es: {
      greetingTest: /\b(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|saludos|que tal|ei|ey|wenas)\b/i,
      thanksTest: /\b(gracias|genial|perfecto|vale|ok|entendido|claro|muchas gracias|te agradezco|guay|excelente|estupendo|increible|super|fantastico|buenisimo|mola|bien|muy bien)\b/i,
      byeTest: /\b(adios|hasta luego|chao|bye|nos vemos|hasta pronto|me voy|nada mas|eso es todo)\b/i,
      affirmativeTest: /\b(si|sí|claro|por supuesto|dale|venga|adelante|quiero|me interesa)\b/i
    },
    en: {
      greetingTest: /\b(hello|hi|hey|good morning|good afternoon|good evening|greetings|howdy|what's up|yo|sup)\b/i,
      thanksTest: /\b(thanks|thank you|great|perfect|got it|understood|awesome|appreciate|cool|nice|excellent|wonderful|amazing|brilliant|fantastic)\b/i,
      byeTest: /\b(bye|goodbye|see you|later|farewell|that's all|nothing else|i'm done|gotta go)\b/i,
      affirmativeTest: /\b(yes|yeah|yep|sure|of course|go ahead|please|i'm interested|want to know)\b/i
    }
  };

  var INTENT_PATTERNS = {
    es: {
      ofensivo: /\b(puta|puto|mierda|joder|cabron|cabrona|gilipollas|idiota|imbecil|estupido|estupida|subnormal|retrasado|retrasada|guarra|guarro|zorra|zorro|marica|maricon|bollera|follar|folla|follame|follate|cono|polla|culo|teta|tetas|verga|pendejo|pendeja|chinga|hijueputa|hijo de puta|malparido|basura|asco|asqueroso|asquerosa|maldito|maldita|hdp|ctm|cagada|cagar|come mierda|vete a la mierda|que te den|muerete|muérete|desgraciado|desgraciada|inutil|payaso|payasa|mongolo|mongola|tu madre|tu vieja|perra|perro|cerdo|cerda|aborto|tarado|tarada|chupar|chupas|chupa|chupame|chupamela|chupatela|chupala|chupapollas|mamar|mamame|mamamela|mamarla|mamada|mamadas|pajero|pajera|pajillero|masturbar|masturbacion|pene|pija|rabo|picha|cipote|capullo|zumbado|zumbada|lameculos|comemierda|soplapollas|giliflautas|gilipuertas|me la chupas|me la mamas|la tienes pequeña|te voy a matar|ojala te mueras|muere|pudrete)\b/i,
      afectivo: /\b(me quieres|te quiero|te amo|eres guapa|eres guapo|eres bonita|eres bonito|eres lista|eres listo|eres tonta|eres tonto|tienes sentimientos|sientes algo|estas viva|estas vivo|eres real|eres humana|eres humano|que sientes|como te sientes|te gusto|me gustas|novio|novia|pareja|casarse|casarnos|casarte|cita conmigo|salir conmigo|salir contigo|tengo hambre|estoy triste|estoy solo|estoy sola|tengo frio|tengo calor|tienes nombre|como te llamas|cuantos anos tienes|donde vives|eres hombre|eres mujer|eres chico|eres chica|que eres|eres un robot|eres una maquina|eres inteligente)\b/i,
      ambiguo: /^(no entiendo|no se|no sé|que|qué|eh|mmm*|hm+|hmm+|ah|ok|vale|a ver|pues|bueno|y|aja|ajá|como|cómo|por que|por qué|nada|ni idea|no entiendo nada|perdon|perdona|como asi|emm?)$/i
    },
    en: {
      ofensivo: /\b(fuck|fucking|fucked|fucker|shit|shitty|damn|bastard|bitch|asshole|dick|dickhead|cock|pussy|slut|whore|idiot|moron|stupid|dumb|retard|retarded|crap|suck|suck me|blow me|screw you|go to hell|loser|trash|disgusting|pathetic|ugly|hate you|stfu|wtf|wanker|tosser|bollocks|piss off|bugger|arse|scumbag|freak|jerk|twat|cum|penis|vagina|masturbate|boobs|tits|kill yourself|kys|die|rot in hell)\b/i,
      afectivo: /\b(do you love me|i love you|are you real|are you human|are you alive|do you feel|how do you feel|are you pretty|are you smart|are you cute|do you have feelings|what are you really|who are you really|are you a boy|are you a girl|what is your name|how old are you|where do you live|i'm lonely|i'm sad|i'm hungry|i'm bored|be my friend|be my girlfriend|be my boyfriend|date me|marry me|go out with me|you're cute|you're pretty|you're hot|are you a robot|are you a machine|are you intelligent)\b/i,
      ambiguo: /^(i don't understand|don't know|what|huh|umm*|hm+|hmm+|ah|ok|okay|well|so|and|yeah|sure|how|why|nothing|no idea|idk|sorry|pardon|come again)$/i
    }
  };

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

  /* ════════════════════════════════════════════════════════════════════
     MODULE 7 — INTENT CLASSIFIER
     Multi-layer intent detection using regex guardrails, conversation
     context, and the SemanticEngine for domain routing.
     Priority: offensive → conversational → follow-up → affective
     → domain (semantic) → ambiguous → off-topic
     ════════════════════════════════════════════════════════════════════ */
  var IntentClassifier = (function () {
    /** Language detection via word-frequency scoring */
    function detectLang(text) {
      var esW = /\b(qué|que|cómo|como|cuál|cual|hola|por favor|dónde|donde|puedo|quiero|tienen|necesito|ayuda|gracias|buenos|buenas|también|producto|normativa|eliminación|destrucción|verificación|peligro|salud|agua|más|esto|esta|este|para|las|los|una|del|con|hay|muy|pero|ese|esa|son|soy|tengo|tiene|hace|nos|les|sobre|sin|ser|ver|dar|año|dia|todo|nuestro|vuestra)\b/gi;
      var enW = /\b(what|how|which|hello|please|where|can|want|need|help|thanks|also|product|regulation|elimination|destruction|verification|danger|health|water|more|the|is|are|does|this|that|for|with|from|have|has|your|you|our|been|will|would|could|should|about|they|their|these|those|some|any|much|very|just|only|into)\b/gi;
      var esM = text.match(esW), enM = text.match(enW);
      var esS = esM ? esM.length : 0, enS = enM ? enM.length : 0;
      if (esS === 0 && enS === 0) return null;
      return esS >= enS ? 'es' : 'en';
    }

    /**
     * classify(text, lang) → { intent, data }
     * Intents: greeting | farewell | thanks | affirmative | followup |
     *          offensive | affective | domain_high | domain_medium |
     *          domain_low | ambiguous | off_topic
     */
    function classify(text, lang) {
      var norm = TextProcessor.normalize(text);
      var ip = INTENT_PATTERNS[lang] || INTENT_PATTERNS.es;
      var conv = PATTERNS[lang] || PATTERNS.es;
      var wc = text.trim().split(/\s+/).length;

      /* P1 — Offensive (safety first) */
      if (ip.ofensivo.test(text) || ip.ofensivo.test(norm)) {
        return { intent: 'offensive' };
      }

      /* P2 — Conversational patterns (short utterances) */
      if (conv.byeTest.test(text) && wc <= 5)  return { intent: 'farewell' };
      if (conv.thanksTest.test(text) && wc <= 4) return { intent: 'thanks' };
      if (conv.greetingTest.test(text) && wc <= 3) return { intent: 'greeting' };

      /* P3 — Follow-up / "tell me more" (context-aware) */
      if (ConversationCtx.isFollowUp(text, lang) && ConversationCtx.getTopic()) {
        return { intent: 'followup' };
      }

      /* P4 — Affirmative (context-dependent) */
      if (conv.affirmativeTest.test(text) && wc <= 3) {
        return { intent: 'affirmative' };
      }

      /* P5 — Affective / personal */
      if (ip.afectivo.test(text) || ip.afectivo.test(norm)) {
        return { intent: 'affective' };
      }

      /* P6 — Pre-processing: spelling correction */
      var correctedText = TextProcessor.correctDomainSpelling(text, lang);
      var emotion = NLU.detectEmotion(text, lang);

      /* Primero NLU sin contaminar con contexto */
      var nluResult = NLU.analyze(text, lang);

      if (correctedText !== text) {
        var nluCorrected = NLU.analyze(correctedText, lang);
        for (var cid in nluCorrected.scores) {
          nluResult.scores[cid] = Math.max(nluResult.scores[cid] || 0, nluCorrected.scores[cid]);
        }
        nluResult.matchCount = Math.max(nluResult.matchCount, nluCorrected.matchCount);
      }

      /* Solo añadimos contexto si NO hay una intención clara */
      var enrichedText = correctedText;
      if (nluResult.matchCount === 0) {
        enrichedText = ConversationCtx.resolveAnaphora(correctedText, lang);
      }

      /* Context boosts */
      var boosts = ConversationCtx.getBoosts();
      if (ConversationCtx.hasReferback(text, lang) && ConversationCtx.getTopic()) {
        var currentId = ConversationCtx.getTopic();
        boosts[currentId] = (boosts[currentId] || 1) * 1.2;
      }

      /* Run semantic scoring on enriched text (spelling + optional anaphora context) */
      var results = SemanticEngine.scoreQuery(enrichedText, KB[lang].faq, lang, boosts);

      /* Merge NLU scores into semantic results (ADDITIVE, not multiplicative) */
      if (nluResult.matchCount > 0) {
        var NLU_SCALE = 10;
        var resultMap = {};
        for (var ri = 0; ri < results.length; ri++) {
          resultMap[results[ri].entry.id] = ri;
        }
        for (var nluId in nluResult.scores) {
          var addScore = nluResult.scores[nluId] * NLU_SCALE;
          if (resultMap[nluId] !== undefined) {
            results[resultMap[nluId]].score += addScore;
            results[resultMap[nluId]].signals.nlu = (results[resultMap[nluId]].signals.nlu || 0) + 1;
          } else {
            var nluEntry = null;
            var faqList = KB[lang].faq;
            for (var fi = 0; fi < faqList.length; fi++) {
              if (faqList[fi].id === nluId) { nluEntry = faqList[fi]; break; }
            }
            if (nluEntry) {
              results.push({
                entry: nluEntry,
                score: addScore * (nluEntry.weight || 1.0),
                signals: { phrase: 0, exact: 0, synonym: 0, stem: 0, fuzzy: 0, nlu: 1 },
                confidence: 0
              });
            }
          }
        }
        results.sort(function (a, b) { return b.score - a.score; });
        if (results.length > 0) {
          var topS = results[0].score;
          var secS = results.length > 1 ? results[1].score : 0;
          var gapS = topS - secS;
          for (var ci = 0; ci < results.length; ci++) {
            var absCC = Math.min(results[ci].score / 25, 1.0);
            var relCC = results.length > 1 ? Math.min(gapS / (topS + 0.001), 1.0) : 1.0;
            results[ci].confidence = absCC * 0.7 + relCC * 0.3;
          }
        }
      }

      /* Anti-repetition: if top result is the current topic but a strong
         second candidate exists, prefer the second to avoid context drag */
      var currentTopic = ConversationCtx.getTopic();

      if (
        currentTopic &&
        results.length > 1 &&
        results[0].entry.id === currentTopic &&
        !ConversationCtx.hasReferback(text, lang)
      ) {
        var topResult = results[0];
        var secondResult = results[1];

        var secondLooksStrong =
          (secondResult.signals.nlu || 0) > 0 ||
          secondResult.signals.exact > 0 ||
          secondResult.signals.phrase > 0;

        if (secondLooksStrong && secondResult.score >= topResult.score * 0.72) {
          var tmp = results[0];
          results[0] = results[1];
          results[1] = tmp;
        }
      }

      if (results.length > 0) {
        var top = results[0];
        /* HIGH confidence: strong NLU or semantic signal */
        if (top.score >= 8 && top.confidence >= 0.20) {
          return { intent: 'domain_high', results: results, emotion: emotion };
        }
        /* MEDIUM confidence */
        if (top.score >= 3) {
          return { intent: 'domain_medium', results: results, emotion: emotion };
        }
        /* LOW confidence — lowered threshold to catch more partial matches */
        if (top.score >= 1.0) {
          return { intent: 'domain_low', results: results, emotion: emotion };
        }
      }

      /* P7 — Ambiguous: very short or unclear */
      if (ip.ambiguo.test(norm)) return { intent: 'ambiguous' };

      /* P8 — Off topic */
      return { intent: 'off_topic' };
    }

    return { classify: classify, detectLang: detectLang };
  })();

  /* ════════════════════════════════════════════════════════════════════
     MODULE 8 — RESPONSE GENERATOR
     Builds the final HTML response + follow-up suggestions based on
     the classified intent and conversation state.
     ════════════════════════════════════════════════════════════════════ */
  var ResponseGenerator = (function () {
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function faqById(id, lang) {
      var faq = KB[lang].faq;
      for (var i = 0; i < faq.length; i++) { if (faq[i].id === id) return faq[i]; }
      return null;
    }

    function formatAnswer(entry) {
      return entry.answer.replace(/\n/g, '<br>');
    }

    /** Empathetic prefix for emotional queries */
    function emotionPrefix(emotion, lang) {
      var prefixes = {
        es: {
          worry: 'Entiendo tu preocupación. Es normal querer estar informado sobre estos temas.',
          fear: 'Es comprensible que esto genere inquietud. La buena noticia es que existen soluciones.',
          skepticism: 'Entiendo tus dudas — es importante ser crítico. Te comparto los datos para que puedas juzgar:',
          family: 'Proteger a tu familia es lo más importante. Aquí tienes lo que necesitas saber:',
          urgency: 'Entiendo la urgencia. Vamos directo al punto:'
        },
        en: {
          worry: 'I understand your concern. It\'s normal to want to stay informed about these issues.',
          fear: 'It\'s understandable that this is concerning. The good news is that solutions exist.',
          skepticism: 'I understand your doubts — being critical is important. Here are the facts:',
          family: 'Protecting your family is what matters most. Here\'s what you need to know:',
          urgency: 'I understand the urgency. Let me get straight to the point:'
        }
      };
      var bank = prefixes[lang] || prefixes.es;
      return bank[emotion] || null;
    }

    /** Generate a context-aware follow-up expansion */
    function handleFollowUp(lang) {
      var nextId = ConversationCtx.resolveFollowUp();
      if (nextId) {
        var entry = faqById(nextId, lang);
        if (entry) {
          ConversationCtx.push('(follow-up)', nextId);
          return {
            html: formatAnswer(entry),
            suggestions: entry.followUp || KB[lang].defaultSuggestions,
            topicId: nextId
          };
        }
      }
      /* No unvisited related topic — suggest related topics or defaults */
      var unvisited = ConversationCtx.relatedUnvisited();
      var TOPIC_LABELS_LOCAL = TOPIC_LABELS[lang] || {};
      var sugg = unvisited.slice(0, 3).map(function (id) {
        var lbl = TOPIC_LABELS_LOCAL[id];
        return lbl ? lbl.label : id;
      });
      if (sugg.length === 0) sugg = KB[lang].defaultSuggestions;
      var msg = lang === 'es'
        ? 'Ya hemos cubierto los temas más cercanos. ¿Te gustaría explorar algo diferente?'
        : 'We\'ve covered the closest topics. Would you like to explore something different?';
      return { html: msg, suggestions: sugg, topicId: null };
    }

    /**
     * generate(intent, lang) → { html, suggestions, topicId }
     */
    function generate(intentResult, lang) {
      var bank = KB[lang];
      var sugg, html, topicId = null;

      switch (intentResult.intent) {
        case 'greeting':
          html = timeGreeting(lang) + ' ' + (lang === 'es'
            ? 'Soy el asistente de <strong>ZeroPFAS</strong>. ¿En qué puedo ayudarte?'
            : 'I\'m the <strong>ZeroPFAS</strong> assistant. How can I help you?');
          sugg = bank.defaultSuggestions;
          break;

        case 'farewell':
          html = bank.goodbye;
          sugg = bank.defaultSuggestions;
          break;

        case 'thanks':
          html = bank.thanksReply;
          sugg = ConversationCtx.getLastFollowUp() || bank.defaultSuggestions;
          break;

        case 'affirmative':
          if (ConversationCtx.getLastFollowUp()) {
            html = lang === 'es' ? '¡Perfecto! Elige el tema que más te interese:' : 'Great! Pick the topic you\'re most interested in:';
            sugg = ConversationCtx.getLastFollowUp();
          } else {
            html = lang === 'es' ? '¡Perfecto! ¿Sobre qué te gustaría saber?' : 'Great! What would you like to know about?';
            sugg = bank.defaultSuggestions;
          }
          break;

        case 'followup':
          return handleFollowUp(lang);

        case 'offensive':
          html = pick(NON_DOMAIN_RESPONSES[lang].ofensivo);
          sugg = bank.defaultSuggestions;
          break;

        case 'affective':
          html = pick(NON_DOMAIN_RESPONSES[lang].afectivo);
          sugg = bank.defaultSuggestions;
          break;

        case 'domain_high':
          var best = intentResult.results[0];
          html = formatAnswer(best.entry);
          /* Empathetic prefix for emotional queries */
          if (intentResult.emotion) {
            var empathy = emotionPrefix(intentResult.emotion, lang);
            if (empathy) html = '<em>' + empathy + '</em><br><br>' + html;
          }

          sugg = best.entry.followUp || bank.defaultSuggestions;
          topicId = best.entry.id;
          break;

        case 'domain_medium':
          var top = intentResult.results[0];
          var prefix = lang === 'es'
            ? 'Creo que esto es lo que buscas:<br><br>'
            : 'I think this is what you\'re looking for:<br><br>';
          if (intentResult.emotion) {
            var empathyM = emotionPrefix(intentResult.emotion, lang);
            if (empathyM) prefix = '<em>' + empathyM + '</em><br><br>';
          }
          html = prefix + formatAnswer(top.entry);
          /* Suggest follow-ups + alternative topic labels from runner-ups */
          var altSugg = (top.entry.followUp || []).slice();
          for (var ri = 1; ri < Math.min(intentResult.results.length, 3); ri++) {
            var altEntry = intentResult.results[ri].entry;
            var lbl = TOPIC_LABELS[lang] && TOPIC_LABELS[lang][altEntry.id];
            if (lbl) altSugg.push(lbl.label);
          }
          /* Deduplicate */
          var seen = {};
          sugg = altSugg.filter(function (s) { if (seen[s]) return false; seen[s] = 1; return true; }).slice(0, 4);
          if (sugg.length === 0) sugg = bank.defaultSuggestions;
          topicId = top.entry.id;
          break;

        case 'domain_low':
          var lowTop = intentResult.results[0];
          var lowPrefix = lang === 'es'
            ? 'Quizá esto te resulte útil:<br><br>'
            : 'This might be helpful:<br><br>';
          html = lowPrefix + formatAnswer(lowTop.entry);
          /* Suggest alternatives from other top results */
          var lowSugg = (lowTop.entry.followUp || []).slice(0, 2);
          for (var li = 1; li < Math.min(intentResult.results.length, 4); li++) {
            var le = intentResult.results[li].entry;
            var ll = TOPIC_LABELS[lang] && TOPIC_LABELS[lang][le.id];
            if (ll) lowSugg.push(ll.label);
          }
          sugg = lowSugg.length > 0 ? lowSugg : bank.defaultSuggestions;
          topicId = lowTop.entry.id;
          break;

        case 'ambiguous':
          html = pick(NON_DOMAIN_RESPONSES[lang].ambiguo);
          sugg = ConversationCtx.getLastFollowUp() || bank.defaultSuggestions;
          break;

        case 'off_topic':
        default:
          html = pick(NON_DOMAIN_RESPONSES[lang].fuera_de_tema);
          sugg = bank.defaultSuggestions;
          break;
      }

      return { html: html, suggestions: sugg, topicId: topicId };
    }

    return { generate: generate, faqById: faqById, formatAnswer: formatAnswer };
  })();

  /* ════════════════════════════════════════════════════════════════════
     TOPIC LABELS, WELCOME TOPICS, TIME GREETING
     ════════════════════════════════════════════════════════════════════ */
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
      'how-to-help':    { icon: '🤝', label: '¿Qué puedo hacer?' },
      'pfas-types':     { icon: '🔢', label: 'Tipos de PFAS' },
      'pfas-sources':   { icon: '📍', label: '¿Dónde hay PFAS?' },
      'cf-bond':        { icon: '⚛️', label: 'Enlace C–F' },
      'capture-stage':  { icon: '🧲', label: 'Fase de captura' },
      'concentration-stage': { icon: '🔄', label: 'Concentración' },
      'scwo-deep':      { icon: '🌡️', label: 'SCWO en detalle' },
      'cartridge-return': { icon: '♻️', label: 'Retorno de cartucho' },
      'activated-carbon': { icon: '🆚', label: 'Carbón activo vs SCWO' },
      'pfas-food':      { icon: '🍽️', label: 'PFAS en alimentos' },
      'pfas-history':   { icon: '📜', label: 'Historia de los PFAS' },
      'installation':   { icon: '🔧', label: 'Instalación' },
      'flow-rate':      { icon: '💧', label: 'Caudal y rendimiento' },
      'pfas-children':  { icon: '👶', label: 'PFAS y niños' },
      'other-methods':  { icon: '🔬', label: 'Otros métodos' },
      'pfas-water-sources': { icon: '🚰', label: 'PFAS en agua' },
      'invest':         { icon: '📈', label: 'Invertir / Colaborar' },
      'regulation-eu-detail': { icon: '🇪🇺', label: 'Normativa EU' },
      'regulation-epa-detail': { icon: '🇺🇸', label: 'Normativa EPA' },
      'scalability':    { icon: '📊', label: 'Escalabilidad' },
      'report-analytics': { icon: '📄', label: 'Informes y datos' },
      'filtered-water-quality': { icon: '🚰', label: 'Calidad del agua filtrada' }
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
      'how-to-help':    { icon: '🤝', label: 'What can I do?' },
      'pfas-types':     { icon: '🔢', label: 'Types of PFAS' },
      'pfas-sources':   { icon: '📍', label: 'Where are PFAS?' },
      'cf-bond':        { icon: '⚛️', label: 'C–F bond' },
      'capture-stage':  { icon: '🧲', label: 'Capture stage' },
      'concentration-stage': { icon: '🔄', label: 'Concentration' },
      'scwo-deep':      { icon: '🌡️', label: 'SCWO in detail' },
      'cartridge-return': { icon: '♻️', label: 'Cartridge return' },
      'activated-carbon': { icon: '🆚', label: 'Carbon vs SCWO' },
      'pfas-food':      { icon: '🍽️', label: 'PFAS in food' },
      'pfas-history':   { icon: '📜', label: 'History of PFAS' },
      'installation':   { icon: '🔧', label: 'Installation' },
      'flow-rate':      { icon: '💧', label: 'Flow rate' },
      'pfas-children':  { icon: '👶', label: 'PFAS & children' },
      'other-methods':  { icon: '🔬', label: 'Other methods' },
      'pfas-water-sources': { icon: '🚰', label: 'PFAS in water' },
      'invest':         { icon: '📈', label: 'Invest / Collaborate' },
      'regulation-eu-detail': { icon: '🇪🇺', label: 'EU regulations' },
      'regulation-epa-detail': { icon: '🇺🇸', label: 'EPA regulations' },
      'scalability':    { icon: '📊', label: 'Scalability' },
      'report-analytics': { icon: '📄', label: 'Reports & data' },
      'filtered-water-quality': { icon: '🚰', label: 'Filtered water quality' }
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
    /* Pre-build semantic indices for both languages */
    SemanticEngine.buildIndex(KB.es.faq, 'es');
    SemanticEngine.buildIndex(KB.en.faq, 'en');

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
    var isProcessing = false;
    var messageCount = 0;

    function rebuildMenu() {
      renderTopicMenu(menuEl, currentLang, function (topicId) {
        closeMenu();
        triggerTopicById(topicId);
      });
    }

    /* Direct topic access (welcome cards, menu, or follow-up resolution) */
    function triggerTopicById(topicId) {
      var entry = ResponseGenerator.faqById(topicId, currentLang);
      if (!entry) return;

      var labels = TOPIC_LABELS[currentLang];
      var label = labels[topicId] ? labels[topicId].label : topicId;
      appendMessage(messagesEl, escapeHtml(label), 'user');
      suggestionsEl.innerHTML = '';

      var typing = showTyping(messagesEl);
      var answerHtml = ResponseGenerator.formatAnswer(entry);

      /* Update conversation context */
      ConversationCtx.push(label, topicId);
      ConversationCtx.setLastFollowUp(entry.followUp || KB[currentLang].defaultSuggestions);
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

    function closeMenu() { menuOpen = false; menuEl.classList.remove('is-open'); }
    function toggleMenu() { menuOpen = !menuOpen; menuEl.classList.toggle('is-open', menuOpen); }

    /* Restore open state */
    try {
      if (sessionStorage.getItem('zeroPFAS_chatOpen') === '1') {
        setTimeout(function () { if (!isOpen) toggleOpen(); }, 800);
      }
    } catch (e) {}

    setTimeout(function () {
      if (!isOpen && badge) badge.classList.add('is-visible');
    }, 3000);

    setTimeout(function () {
      if (!isOpen && tooltipEl) {
        tooltipEl.textContent = currentLang === 'es' ? '¿Dudas sobre PFAS? ¡Pregúntame!' : 'Questions about PFAS? Ask me!';
        tooltipEl.classList.add('is-visible');
        setTimeout(function () { tooltipEl.classList.remove('is-visible'); }, 6000);
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
          renderWelcomeScreen(messagesEl, currentLang, function (topicId) { triggerTopicById(topicId); });
          rebuildMenu();
          firstOpen = false;
        }
        closeMenu();
        setTimeout(function () { input.focus(); }, 100);
      }
      try { sessionStorage.setItem('zeroPFAS_chatOpen', isOpen ? '1' : '0'); } catch (e) {}
    }

    /* ════════════════════════════════════════════════════════════════
       handleUserInput — The main conversational loop.
       Uses IntentClassifier + ResponseGenerator + ConversationCtx.
       ════════════════════════════════════════════════════════════════ */
    function handleUserInput(text) {
      if (!text.trim() || isProcessing) return;
      isProcessing = true;
      closeMenu();

      /* Language detection */
      var prevLang = currentLang;
      var detected = IntentClassifier.detectLang(text);
      if (detected) currentLang = detected;
      if (currentLang !== prevLang) rebuildMenu();

      appendMessage(messagesEl, escapeHtml(text), 'user');
      suggestionsEl.innerHTML = '';
      input.value = '';
      sendBtn.disabled = true;

      var typing = showTyping(messagesEl);

      /* Classify intent through the multi-layer pipeline */
      var intentResult = IntentClassifier.classify(text, currentLang);

      /* Generate response from intent + context */
      var resp = ResponseGenerator.generate(intentResult, currentLang);

      /* Update conversation context */
      ConversationCtx.push(text, resp.topicId || null);
      ConversationCtx.setLastFollowUp(resp.suggestions);
      messageCount++;

      /* Typing delay proportional to response length */
      var delay = Math.min(350 + resp.html.length * 1.2, 1400);
      setTimeout(function () {
        typing.remove();
        appendMessage(messagesEl, resp.html, 'bot');
        renderSuggestions(suggestionsEl, resp.suggestions, handleUserInput);
        isProcessing = false;
        sendBtn.disabled = false;
      }, delay);
    }

    /* ---- Event Listeners ---- */
    els.toggle.addEventListener('click', toggleOpen);
    closeBtn.addEventListener('click', function () { if (isOpen) toggleOpen(); });
    menuBtn.addEventListener('click', function (e) { e.stopPropagation(); toggleMenu(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); handleUserInput(input.value); });

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
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      e.preventDefault();
      var targetId = link.getAttribute('href').slice(1);
      var target = document.getElementById(targetId);
      if (target) {
        if (isOpen) toggleOpen();
        setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 350);
      }
    });

    els.win.addEventListener('click', function (e) {
      if (menuOpen && !e.target.closest('.chatbot-menu') && !e.target.closest('#chatbotMenuBtn')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (menuOpen) { closeMenu(); return; } if (isOpen) toggleOpen(); }
    });
    els.toggle.addEventListener('mouseenter', function () { if (tooltipEl) tooltipEl.classList.remove('is-visible'); });
    input.addEventListener('input', function () {
      var det = IntentClassifier.detectLang(input.value);
      input.placeholder = det === 'en' ? 'Type your question…' : 'Escribe tu pregunta…';
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

