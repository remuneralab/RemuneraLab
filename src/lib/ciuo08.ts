export interface CiuoEntry {
  codigo: string;
  grupo: string;
  titulos: string[];
}

export const CIUO08: CiuoEntry[] = [
  // Gran Grupo 1 — Directores y gerentes
  { codigo: "1120", grupo: "Directores ejecutivos y gerentes generales", titulos: ["CEO", "director general", "gerente general", "director ejecutivo", "presidente ejecutivo", "country manager"] },
  { codigo: "1211", grupo: "Directores de servicios financieros", titulos: ["CFO", "director financiero", "gerente financiero", "director de finanzas", "jefe de finanzas"] },
  { codigo: "1212", grupo: "Directores de recursos humanos", titulos: ["CHRO", "director de recursos humanos", "gerente de recursos humanos", "gerente de RRHH", "director de personas", "gerente de personas", "jefe de RRHH", "jefe de personas"] },
  { codigo: "1219", grupo: "Directores y gerentes administrativos y de operaciones", titulos: ["gerente administrativo", "director administrativo", "jefe administrativo", "gerente de operaciones", "director de operaciones", "COO", "jefe de operaciones", "subgerente"] },
  { codigo: "1221", grupo: "Directores de ventas y marketing", titulos: ["CMO", "director de marketing", "gerente de marketing", "director comercial", "gerente comercial", "director de ventas", "gerente de ventas", "jefe comercial", "jefe de ventas", "jefe de marketing"] },
  { codigo: "1223", grupo: "Directores de tecnología de la información", titulos: ["CTO", "CIO", "director de tecnología", "gerente de tecnología", "director de TI", "gerente de TI", "gerente de sistemas", "director de sistemas", "director de ingeniería", "VP de ingeniería"] },
  { codigo: "1330", grupo: "Gerentes de servicios de TI", titulos: ["gerente de desarrollo de software", "gerente de infraestructura", "gerente de ciberseguridad", "gerente de proyectos TI", "gerente de plataforma"] },
  { codigo: "1420", grupo: "Gerentes de comercio al por menor", titulos: ["gerente de tienda", "gerente de local", "jefe de tienda", "gerente de retail", "administrador de local"] },

  // Gran Grupo 2 — Profesionales científicos e intelectuales
  { codigo: "2131", grupo: "Agrónomos y profesionales forestales", titulos: ["ingeniero forestal", "agrónomo", "ingeniero agrónomo", "planificador forestal", "profesional forestal", "especialista forestal", "especialista en silvicultura", "especialista en manejo forestal", "profesional de planificación forestal", "ingeniero en recursos naturales"] },
  { codigo: "2141", grupo: "Ingenieros industriales y de producción", titulos: ["ingeniero industrial", "ingeniero de procesos", "ingeniero de producción", "ingeniero de calidad", "ingeniero de manufactura", "ingeniero de planta", "ingeniero de operaciones", "ingeniero de procesos de celulosa", "especialista en calidad de madera", "ingeniero de planta forestal"] },
  { codigo: "2142", grupo: "Ingenieros civiles", titulos: ["ingeniero civil", "ingeniero de obras civiles", "ingeniero estructural", "calculista estructural", "ingeniero de infraestructura civil"] },
  { codigo: "2143", grupo: "Ingenieros en medioambiente", titulos: ["ingeniero en medioambiente", "ingeniero ambiental", "especialista ambiental", "consultor ambiental", "profesional de medio ambiente", "especialista en medio ambiente", "profesional de certificaciones ambientales", "especialista en certificaciones ambientales"] },
  { codigo: "2149", grupo: "Ingenieros en prevención de riesgos y seguridad ocupacional", titulos: ["ingeniero en prevención de riesgos", "ingeniero en prevención de riesgos laborales", "ingeniero en seguridad industrial", "ingeniero en salud y seguridad ocupacional", "profesional en prevención de riesgos", "experto en prevención de riesgos", "profesional de seguridad industrial", "profesional de seguridad y salud ocupacional", "coordinador de seguridad", "asesor en prevención", "jefe de prevención de riesgos", "jefe de seguridad en faena"] },
  { codigo: "2144", grupo: "Ingenieros mecánicos", titulos: ["ingeniero mecánico", "ingeniero de mantenimiento", "ingeniero mecánico automotriz", "ingeniero de automatización", "especialista en automatización industrial"] },
  { codigo: "2145", grupo: "Ingenieros químicos", titulos: ["ingeniero químico", "ingeniero de planta química", "ingeniero de procesos químicos"] },
  { codigo: "2146", grupo: "Ingenieros de minas y metalúrgicos", titulos: ["ingeniero de minas", "ingeniero metalúrgico", "ingeniero minero", "geólogo", "geólogo de minas"] },
  { codigo: "2151", grupo: "Ingenieros electricistas", titulos: ["ingeniero eléctrico", "ingeniero electricista", "ingeniero en energía", "ingeniero en energías renovables"] },
  { codigo: "2152", grupo: "Ingenieros en electrónica", titulos: ["ingeniero en electrónica", "ingeniero electrónico", "ingeniero de hardware"] },
  { codigo: "2153", grupo: "Ingenieros en telecomunicaciones", titulos: ["ingeniero en telecomunicaciones", "ingeniero de redes", "ingeniero de comunicaciones"] },
  { codigo: "2161", grupo: "Arquitectos", titulos: ["arquitecto", "arquitecta", "arquitecto de interiores", "diseñador de espacios", "urbanista"] },
  { codigo: "2163", grupo: "Diseñadores de productos", titulos: ["diseñador de productos", "diseñador industrial", "diseñador de moda", "diseñador de packaging"] },
  { codigo: "2166", grupo: "Diseñadores gráficos y multimedia", titulos: ["diseñador gráfico", "diseñador UX", "diseñador UI", "diseñador UX UI", "diseñador web", "diseñador multimedia", "diseñador visual", "UX designer", "UI designer", "product designer"] },
  { codigo: "2211", grupo: "Médicos generalistas", titulos: ["médico general", "médico de familia", "médico generalista", "médico de atención primaria"] },
  { codigo: "2212", grupo: "Médicos especialistas", titulos: ["médico especialista", "cardiólogo", "dermatólogo", "neurólogo", "traumatólogo", "pediatra", "psiquiatra", "radiólogo", "cirujano", "ginecólogo", "urólogo", "endocrinólogo", "oncólogo", "anestesiólogo", "internista", "médico intensivista"] },
  { codigo: "2221", grupo: "Enfermeros", titulos: ["enfermero", "enfermera", "enfermero universitario", "enfermera universitaria", "enfermero clínico"] },
  { codigo: "2231", grupo: "Matronas y matrones", titulos: ["matrona", "matrón", "obstétrico", "matrona universitaria"] },
  { codigo: "2250", grupo: "Veterinarios", titulos: ["veterinario", "veterinaria", "médico veterinario"] },
  { codigo: "2261", grupo: "Dentistas", titulos: ["dentista", "odontólogo", "odontóloga", "cirujano dentista", "ortodoncista"] },
  { codigo: "2262", grupo: "Farmacéuticos", titulos: ["farmacéutico", "químico farmacéutico", "bioquímico farmacéutico"] },
  { codigo: "2264", grupo: "Kinesiólogos y fisioterapeutas", titulos: ["kinesiólogo", "kinesióloga", "fisioterapeuta", "fisiatra", "kinesiólogo deportivo"] },
  { codigo: "2265", grupo: "Nutricionistas y dietistas", titulos: ["nutricionista", "dietista", "nutrióloga", "nutriólogo"] },
  { codigo: "2266", grupo: "Fonoaudiólogos", titulos: ["fonoaudiólogo", "fonoaudióloga", "logopeda", "terapeuta del lenguaje"] },
  { codigo: "2269", grupo: "Profesionales de la salud NCP", titulos: ["terapeuta ocupacional", "químico clínico", "podólogo"] },
  { codigo: "2310", grupo: "Profesores universitarios e investigadores", titulos: ["profesor universitario", "docente universitario", "académico", "investigador", "catedrático", "profesor de universidad"] },
  { codigo: "2320", grupo: "Docentes de educación vocacional y técnica", titulos: ["docente técnico", "instructor técnico", "profesor técnico profesional", "relator", "facilitador", "facilitador de capacitación", "capacitador"] },
  { codigo: "2330", grupo: "Profesores de enseñanza media", titulos: ["profesor de enseñanza media", "docente de enseñanza media", "profesor secundario", "profesor de liceo", "profesor diferencial"] },
  { codigo: "2341", grupo: "Profesores de educación primaria y parvularia", titulos: ["profesor básico", "docente básico", "profesor de educación básica", "educador de párvulos", "educadora de párvulos", "educadora diferencial"] },
  { codigo: "2411", grupo: "Contadores y auditores", titulos: ["contador", "contador auditor", "contable", "contador general", "auditor", "auditor interno", "auditor externo", "revisor de cuentas"] },
  { codigo: "2412", grupo: "Asesores y analistas financieros", titulos: ["analista financiero", "asesor financiero", "analista de inversiones", "gestor de inversiones", "portfolio manager"] },
  { codigo: "2413", grupo: "Analistas de finanzas corporativas", titulos: ["analista de crédito", "analista de riesgo", "analista de tesorería", "analista de presupuesto", "controller", "analista de control de gestión"] },
  { codigo: "2421", grupo: "Analistas de gestión y organización", titulos: ["consultor de gestión", "analista de gestión", "consultor organizacional", "analista de negocios", "business analyst", "analista funcional de negocio", "consultor estratégico", "analista de procesos", "ingeniero comercial", "administrador de empresas", "ingeniero en negocios", "ingeniero en negocios internacionales", "profesional en negocios internacionales", "comercio exterior", "comercio internacional", "project manager", "gerente de proyecto", "jefe de proyecto", "coordinador de proyecto", "analista de proyecto", "PMO"] },
  { codigo: "2423", grupo: "Analistas y especialistas de recursos humanos", titulos: ["analista de recursos humanos", "analista de RRHH", "coordinador de recursos humanos", "coordinador de RRHH", "especialista en recursos humanos", "especialista de personas", "analista de personas", "asistente de recursos humanos", "asistente de RRHH", "encargado de recursos humanos", "encargado de RRHH", "técnico en recursos humanos", "técnico en RRHH", "asistente de personas", "encargado de personas", "coordinador de personas"] },
  { codigo: "2431", grupo: "Profesionales de publicidad y marketing", titulos: ["especialista en marketing", "analista de marketing", "ejecutivo de marketing", "community manager", "especialista en redes sociales", "growth hacker", "especialista en marketing digital", "analista de marketing digital", "SEO specialist", "SEM specialist", "performance marketing"] },
  { codigo: "2432", grupo: "Profesionales de relaciones públicas y comunicaciones", titulos: ["relacionador público", "especialista en comunicaciones", "encargado de comunicaciones", "jefe de comunicaciones", "comunicador corporativo"] },
  { codigo: "2511", grupo: "Analistas de sistemas", titulos: ["analista de sistemas", "analista funcional", "analista de TI", "analista de requisitos", "business systems analyst"] },
  { codigo: "2512", grupo: "Desarrolladores de software", titulos: ["desarrollador de software", "desarrollador backend", "desarrollador frontend", "programador", "desarrollador full stack", "full stack developer", "backend developer", "frontend developer", "software engineer", "software developer", "ingeniero de software", "desarrollador react", "desarrollador node", "desarrollador python", "programador web", "desarrollador java"] },
  { codigo: "2513", grupo: "Desarrolladores web", titulos: ["desarrollador web", "web developer", "desarrollador de aplicaciones web", "desarrollador javascript", "desarrollador typescript"] },
  { codigo: "2514", grupo: "Desarrolladores de aplicaciones móviles", titulos: ["desarrollador móvil", "desarrollador android", "desarrollador ios", "mobile developer", "desarrollador de apps", "react native developer", "flutter developer"] },
  { codigo: "2519", grupo: "Analistas de datos, ciencia de datos e inteligencia artificial", titulos: ["data scientist", "científico de datos", "machine learning engineer", "ingeniero de machine learning", "ingeniero de IA", "AI engineer", "analista de datos", "data analyst", "ingeniero de datos", "data engineer", "ML engineer", "analista de inteligencia de negocios", "BI analyst", "analista BI"] },
  { codigo: "2521", grupo: "Diseñadores y administradores de bases de datos", titulos: ["administrador de base de datos", "DBA", "arquitecto de datos", "data architect", "administrador de bases de datos"] },
  { codigo: "2522", grupo: "Administradores de sistemas y redes", titulos: ["administrador de sistemas", "sysadmin", "administrador de redes", "ingeniero de infraestructura", "devops", "devops engineer", "cloud engineer", "SRE", "site reliability engineer", "ingeniero de plataforma", "platform engineer", "administrador de servidores"] },
  { codigo: "2523", grupo: "Especialistas en ciberseguridad", titulos: ["especialista en ciberseguridad", "analista de seguridad", "ingeniero de seguridad informática", "pentester", "analista de ciberseguridad", "hacker ético", "security engineer", "analista de SOC", "arquitecto de seguridad"] },
  { codigo: "2529", grupo: "Especialistas en TIC y gestión ágil", titulos: ["scrum master", "agile coach", "product owner", "líder técnico", "tech lead", "engineering manager", "product manager", "QA engineer", "tester", "analista QA", "ingeniero QA", "arquitecto de software", "arquitecto cloud", "UX researcher", "investigador de experiencia de usuario"] },
  { codigo: "2611", grupo: "Abogados", titulos: ["abogado", "abogada", "asesor legal", "asesor jurídico", "abogado corporativo", "litigante", "abogado laboral", "abogado tributario"] },
  { codigo: "2619", grupo: "Profesionales del derecho NCP", titulos: ["notario", "procurador", "mediador", "árbitro legal", "abogado notario"] },
  { codigo: "2631", grupo: "Economistas", titulos: ["economista", "analista económico", "asesor económico", "macroeconomista"] },
  { codigo: "2634", grupo: "Sociólogos y trabajadores sociales", titulos: ["sociólogo", "antropólogo", "asistente social", "trabajador social"] },
  { codigo: "2641", grupo: "Escritores y creadores de contenido", titulos: ["escritor", "copywriter", "redactor", "creador de contenido", "content creator", "content writer", "editor de contenido"] },
  { codigo: "2642", grupo: "Periodistas y comunicadores", titulos: ["periodista", "reportero", "editor", "corresponsal", "comunicador", "locutor"] },
  { codigo: "2651", grupo: "Artistas y fotógrafos", titulos: ["artista", "fotógrafo", "ilustrador", "animador", "animador 3D", "motion designer", "videomaker"] },
  { codigo: "2720", grupo: "Psicólogos", titulos: ["psicólogo", "psicóloga", "terapeuta", "psicólogo clínico", "psicólogo organizacional", "coach", "psicólogo laboral"] },

  // Gran Grupo 3 — Técnicos y profesionales de nivel medio
  { codigo: "3112", grupo: "Técnicos y supervisores de construcción", titulos: ["técnico en construcción", "capataz de obras", "supervisor de obras", "inspector de obras", "jefe de obras", "maestro mayor de obras"] },
  { codigo: "3141", grupo: "Técnicos forestales y agropecuarios", titulos: ["técnico forestal", "técnico en silvicultura", "técnico en manejo forestal", "técnico agropecuario", "asistente de planificación forestal", "asistente forestal", "técnico en faena forestal", "técnico en plantaciones"] },
  { codigo: "3113", grupo: "Técnicos electricistas", titulos: ["técnico electricista", "técnico eléctrico", "electricista industrial", "instalador eléctrico"] },
  { codigo: "3114", grupo: "Técnicos en electrónica", titulos: ["técnico en electrónica", "técnico electrónico", "técnico en automatización", "técnico en sistemas de control", "técnico en control industrial"] },
  { codigo: "3115", grupo: "Técnicos en mecánica", titulos: ["técnico mecánico", "mecánico industrial", "técnico en mecánica", "mecánico automotriz", "técnico automotriz", "técnico en mantención electromecánica", "técnico electromecánico", "técnico en mantención", "técnico de mantenimiento mecánico"] },
  { codigo: "3121", grupo: "Supervisores de TI", titulos: ["supervisor de TI", "jefe de soporte técnico", "coordinador de TI", "líder de soporte"] },
  { codigo: "3122", grupo: "Supervisores de producción y manufactura", titulos: ["jefe de producción", "supervisor de producción", "encargado de producción", "jefe de turno", "supervisor de turno", "encargado de turno", "jefe de planta", "supervisor de manufactura", "coordinador de producción", "jefe de operaciones de planta"] },
  { codigo: "3212", grupo: "Técnicos en laboratorio médico", titulos: ["tecnólogo médico", "técnico de laboratorio", "técnico paramédico", "técnico en laboratorio clínico"] },
  { codigo: "3213", grupo: "Técnicos en farmacia", titulos: ["técnico en farmacia", "técnico de farmacia", "despachador de farmacia"] },
  { codigo: "3221", grupo: "Técnicos de enfermería", titulos: ["técnico en enfermería", "TENS", "auxiliar de enfermería", "técnico en atención de enfermería", "asistente de enfermería"] },
  { codigo: "3257", grupo: "Técnicos en prevención de riesgos y salud ocupacional", titulos: ["prevencionista de riesgos", "técnico en prevención de riesgos", "inspector de seguridad", "supervisor de seguridad en faena", "técnico en manejo de residuos industriales", "técnico en manejo de residuos"] },
  { codigo: "3311", grupo: "Agentes y ejecutivos bancarios y financieros", titulos: ["corredor de bolsa", "agente de valores", "ejecutivo de cuentas", "ejecutivo bancario", "ejecutivo de negocios", "ejecutivo de banca", "ejecutivo de cuenta", "cajero de banco", "cajera de banco", "cajero bancario"] },
  { codigo: "3313", grupo: "Contabilistas y tenedores de libros", titulos: ["técnico en contabilidad", "tenedor de libros", "asistente contable"] },
  { codigo: "3322", grupo: "Representantes y ejecutivos comerciales", titulos: ["representante de ventas", "ejecutivo de ventas", "vendedor técnico", "asesor comercial", "ejecutivo comercial", "representante comercial", "key account manager", "KAM", "account executive", "asesor de ventas", "promotor comercial", "asesor de negocios"] },
  { codigo: "3332", grupo: "Coordinadores de eventos", titulos: ["coordinador de eventos", "organizador de eventos", "planificador de eventos", "wedding planner"] },
  { codigo: "3333", grupo: "Reclutadores y headhunters", titulos: ["reclutador", "headhunter", "talent acquisition", "analista de selección", "especialista en reclutamiento", "talent sourcer"] },
  { codigo: "3339", grupo: "Técnicos en administración de empresas", titulos: ["técnico en administración de empresas", "técnico en administración", "técnico en gestión", "asistente de administración de empresas"] },
  { codigo: "3423", grupo: "Instructores de fitness y bienestar", titulos: ["instructor de yoga", "instructor de pilates", "instructor de fitness", "monitor deportivo", "instructor de natación"] },
  { codigo: "3334", grupo: "Agentes inmobiliarios", titulos: ["corredor de propiedades", "agente inmobiliario", "asesor inmobiliario", "corredor de bienes raíces"] },
  { codigo: "3324", grupo: "Agentes de compras y abastecimiento", titulos: ["analista de abastecimiento", "jefe de abastecimiento", "analista de compras", "jefe de compras", "coordinador de compras", "encargado de compras", "analista de logística", "coordinador de logística", "jefe de logística", "planificador de demanda", "especialista en cadena de suministro", "especialista en supply chain", "supply chain", "analista de operaciones logísticas", "asistente de operaciones logísticas"] },
  { codigo: "3343", grupo: "Asistentes administrativos y ejecutivos", titulos: ["customer success", "customer success manager", "ejecutivo de postventa", "encargado de postventa", "analista de experiencia de cliente", "CX analyst"] },
  { codigo: "3411", grupo: "Asistentes legales y paralegales", titulos: ["asistente legal", "paralegal", "asistente jurídico", "técnico jurídico"] },
  { codigo: "3412", grupo: "Trabajadores sociales de nivel medio", titulos: ["trabajador comunitario", "orientador social", "educador social"] },
  { codigo: "3422", grupo: "Entrenadores y preparadores físicos", titulos: ["preparador físico", "entrenador personal", "personal trainer", "coach deportivo", "instructor deportivo"] },
  { codigo: "3433", grupo: "Jefes y coordinadores de contabilidad", titulos: ["jefe de contabilidad", "supervisor contable", "coordinador contable", "encargado de contabilidad"] },
  { codigo: "3435", grupo: "Asistentes de gestión y administración de empresas", titulos: ["asistente de gestión", "asistente de operaciones", "coordinador administrativo", "analista de administración", "asistente de proyectos", "coordinador de operaciones"] },
  { codigo: "3511", grupo: "Técnicos de soporte TIC", titulos: ["técnico de soporte", "help desk", "soporte técnico", "técnico en computación", "técnico de informática", "operador de sistemas"] },
  { codigo: "3512", grupo: "Mesa de ayuda y soporte de usuarios", titulos: ["soporte usuario", "técnico de mesa de ayuda", "service desk", "operador de mesa de ayuda"] },
  { codigo: "3514", grupo: "Técnicos web", titulos: ["técnico web", "webmaster", "administrador web"] },

  // Gran Grupo 4 — Personal de apoyo administrativo
  { codigo: "4110", grupo: "Asistentes y auxiliares administrativos", titulos: ["oficinista", "auxiliar administrativo", "asistente administrativo", "empleado administrativo", "administrativo", "asistente de administración", "digitador", "digitador de datos", "ingresador de datos", "operador de datos"] },
  { codigo: "4120", grupo: "Secretarios y asistentes ejecutivos", titulos: ["secretario", "secretaria", "asistente ejecutivo", "asistente de gerencia", "asistente de dirección"] },
  { codigo: "4222", grupo: "Recepcionistas", titulos: ["recepcionista", "secretaria recepcionista", "encargado de recepción", "anfitrión de clientes"] },
  { codigo: "4225", grupo: "Operadores de call center y atención al cliente", titulos: ["operador de call center", "ejecutivo de call center", "agente de call center", "teleoperador", "ejecutivo de atención telefónica", "agente de atención al cliente", "ejecutivo de atención al cliente", "ejecutivo de servicio al cliente"] },
  { codigo: "4311", grupo: "Auxiliares contables y de finanzas", titulos: ["auxiliar contable", "asistente contable", "asistente de contabilidad", "digitador contable"] },
  { codigo: "4321", grupo: "Jefes y auxiliares de bodega", titulos: ["jefe de bodega", "auxiliar de bodega", "encargado de bodega", "bodeguero", "controlador de inventario", "pañolero", "encargado de despacho", "despachador", "despachador de bodega", "auxiliar de despacho"] },

  // Gran Grupo 5 — Trabajadores de servicios y ventas
  { codigo: "5120", grupo: "Cocineros y chefs", titulos: ["cocinero", "chef", "chef ejecutivo", "jefe de cocina", "sous chef", "pastelero", "chef de repostería"] },
  { codigo: "5131", grupo: "Garzones y bartenders", titulos: ["garzón", "mesero", "camarero", "bartender", "barman", "barista", "barista de café"] },
  { codigo: "5141", grupo: "Peluqueros y estilistas", titulos: ["peluquero", "estilista", "barbero", "colorista"] },
  { codigo: "5142", grupo: "Esteticistas y cosmetólogos", titulos: ["esteticista", "cosmetóloga", "maquillador", "maquilladora profesional", "esteticista integral"] },
  { codigo: "5152", grupo: "Conserjes y porteros", titulos: ["conserje", "portero", "recepcionista de edificio", "mayordomo"] },
  { codigo: "5222", grupo: "Supervisores de ventas y tienda", titulos: ["supervisor de ventas", "jefe de sala", "supervisor de tienda", "encargado de piso"] },
  { codigo: "5223", grupo: "Vendedores de tienda y promotores", titulos: ["vendedor", "ejecutivo de ventas retail", "promotor de ventas", "asistente de ventas", "vendedor de tienda"] },
  { codigo: "5230", grupo: "Cajeros y expendedores", titulos: ["cajero", "cajera", "cajero de supermercado", "cajera de supermercado", "cajero de tienda", "cajera de tienda", "cajero de farmacia", "cajero de retail", "cajero de multitienda"] },
  { codigo: "5311", grupo: "Auxiliares de cuidado de niños y jardín infantil", titulos: ["cuidador de niños", "nana", "parvularia", "técnico en atención de párvulos", "asistente de párvulos"] },
  { codigo: "5412", grupo: "Policías y carabineros", titulos: ["carabinero", "policía", "detective PDI", "gendarme"] },
  { codigo: "5414", grupo: "Guardias de seguridad", titulos: ["guardia de seguridad", "guardia", "vigilante", "portero de seguridad", "sereno", "oficial de seguridad"] },

  // Gran Grupo 6 — Agricultores y trabajadores agropecuarios calificados
  { codigo: "6112", grupo: "Silvicultores y supervisores forestales calificados", titulos: ["silvicultor", "supervisor forestal", "supervisor de faena forestal", "supervisor de plantaciones", "capataz forestal", "jefe de cuadrilla forestal", "encargado de plantación", "supervisor de cosecha mecanizada", "supervisor de cosecha forestal", "supervisor de transporte forestal", "jefe de faena forestal"] },

  // Gran Grupo 7 — Artesanos y oficios relacionados
  { codigo: "7115", grupo: "Carpinteros", titulos: ["carpintero", "carpintero de construcción", "carpintero de obra", "ebanista", "mueblista", "carpintero de muebles", "maestro carpintero"] },
  { codigo: "7119", grupo: "Otros trabajadores de la construcción", titulos: ["maestro de la construcción", "obrero de construcción", "operario de construcción", "jornalero de construcción", "oficial de construcción"] },
  { codigo: "7121", grupo: "Techadores y cubierteros", titulos: ["techador", "cubiertero", "instalador de techos", "instalador de tejas", "instalador de planchas"] },
  { codigo: "7122", grupo: "Albañiles", titulos: ["albañil", "maestro albañil", "mampostero", "operario de albañilería", "operario de obras"] },
  { codigo: "7125", grupo: "Gasfíteres e instaladores sanitarios", titulos: ["gasfíter", "gásfiter", "plomero", "instalador sanitario", "instalador de agua potable", "instalador de tuberías", "instalador de gas"] },
  { codigo: "7136", grupo: "Técnicos en refrigeración y climatización", titulos: ["técnico en refrigeración", "técnico en climatización", "técnico en aire acondicionado", "instalador de aire acondicionado", "técnico en HVAC", "técnico en sistemas de refrigeración", "técnico en calefacción", "técnico frigorista", "frigorista", "técnico en frío"] },
  { codigo: "7212", grupo: "Soldadores y cortadores de metal", titulos: ["soldador", "soldador mig", "soldador tig", "soldador industrial", "operario soldador", "cortador de metal", "oxicortador"] },
  { codigo: "7221", grupo: "Herreros y forjadores", titulos: ["herrero", "forjador", "herrero de obra", "maestro herrero", "trabajador metalúrgico"] },
  { codigo: "7231", grupo: "Mecánicos automotrices", titulos: ["mecánico automotriz", "mecánico de vehículos", "mecánico de autos", "mecánico de automóviles", "técnico mecánico automotriz", "mecánico de taller"] },
  { codigo: "7233", grupo: "Mecánicos de equipos industriales y de mantención", titulos: ["mecánico de mantención", "mecánico de maquinaria", "mecánico de planta", "mecánico de equipos pesados", "mecánico de equipos pesados forestales"] },
  { codigo: "7316", grupo: "Pintores de edificios y obras", titulos: ["pintor de edificios", "pintor de construcción", "pintor de obras", "empapelador", "pintor de interiores", "pintor industrial"] },
  { codigo: "7411", grupo: "Electricistas de edificios y obras", titulos: ["electricista", "electricista de construcción", "electricista de obra", "instalador eléctrico", "electricista de mantención", "electricista de edificios", "electricista industrial"] },
  { codigo: "7421", grupo: "Técnicos en electrónica y reparación de equipos", titulos: ["reparador de electrónica", "técnico en televisores", "técnico en equipos electrónicos", "reparador de equipos electrónicos", "reparador de equipos"] },
  { codigo: "7511", grupo: "Carniceros y trabajadores de alimentos", titulos: ["carnicero", "matarifes", "carnicero de supermercado", "cortador de carne", "faenador"] },
  { codigo: "7512", grupo: "Panaderos, pasteleros y confiteros", titulos: ["panadero", "pastelero", "panadero artesanal", "confitero", "hornero", "elaborador de pan", "repostero", "bollero"] },

  // Gran Grupo 8 — Operadores de instalaciones, máquinas y ensambladores
  { codigo: "8111", grupo: "Operadores de equipos de extracción minera", titulos: ["minero", "operario de minas", "operador de minas", "minero subterráneo", "perforista minero", "tronador", "minero de carbón"] },
  { codigo: "8131", grupo: "Operadores de planta industrial", titulos: ["operador de planta", "operador de procesos", "operador de planta industrial", "operador de sala de control", "operador de proceso productivo", "operador de caldera industrial", "operador de caldera", "operador de planta de celulosa", "técnico en operación de planta", "operador de sala de calderas", "operador de horno industrial"] },
  { codigo: "8160", grupo: "Operadores de línea de producción", titulos: ["operario de producción", "operador de máquinas", "operario industrial", "operador de línea de producción", "operario de planta", "ayudante de producción", "operario general", "operario de fábrica", "ayudante de planta"] },
  { codigo: "8321", grupo: "Conductores de motocicletas y repartidores", titulos: ["conductor de motocicleta", "mensajero en moto", "repartidor en moto", "delivery en moto", "cadete en moto"] },
  { codigo: "8322", grupo: "Conductores de automóviles y taxis", titulos: ["conductor de taxi", "taxista", "chofer de taxi", "chofer particular", "conductor de vehículo", "chofer", "conductor uber", "conductor de aplicación", "conductor de auto", "conductor particular"] },
  { codigo: "8331", grupo: "Conductores de buses y micros", titulos: ["conductor de bus", "chofer de bus", "chofer de micro", "conductor de micro", "conductor de minibus", "chofer de minibus", "conductor de locomoción colectiva"] },
  { codigo: "8332", grupo: "Conductores de camiones y transportistas", titulos: ["conductor de camión", "chofer de camión", "camionero", "chofer de camiones", "conductor de transporte de carga", "chofer de despacho", "chofer de reparto", "transportista"] },
  { codigo: "8341", grupo: "Operadores de maquinaria agrícola y forestal", titulos: ["operador de maquinaria agrícola", "tractorista", "operador de cosechadora", "operador de tractor", "maquinista agrícola", "operador de cosechadora forestal", "operador de motosierra", "motosierrista", "operador de procesadora de madera", "operador de forwarder", "maquinista forestal", "operador de maquinaria forestal", "operador de grúa maderera", "operador de skidder"] },
  { codigo: "8342", grupo: "Operadores de maquinaria de construcción", titulos: ["operador de maquinaria", "operador de excavadora", "maquinista de construcción", "operador de retroexcavadora", "operador de bulldozer", "maquinista de obras"] },
  { codigo: "8343", grupo: "Operadores de grúas y montacargas", titulos: ["operador de grúa", "gruero", "operador de grúa torre", "operador de montacargas", "conductor de montacargas", "operador de grúa horquilla"] },

  // Gran Grupo 9 — Ocupaciones elementales
  { codigo: "9111", grupo: "Auxiliares de limpieza de hogares y oficinas", titulos: ["auxiliar de limpieza", "aseadora", "asistente de limpieza", "empleada de limpieza", "operaria de aseo", "auxiliar de aseo domiciliario", "auxiliar de aseo de oficinas"] },
  { codigo: "9112", grupo: "Trabajadoras de casa particular", titulos: ["trabajadora de casa particular", "empleada doméstica", "asesora del hogar", "empleada de casa", "nana puertas adentro", "nana puertas afuera", "cuidadora de hogar", "empleada de servicio"] },
  { codigo: "9211", grupo: "Peones y trabajadores agrícolas y forestales", titulos: ["peón agrícola", "temporero", "obrero agrícola", "trabajador agrícola", "temporero agrícola", "jornalero agrícola", "cosechador", "recolector agrícola", "trabajador forestal", "trabajador de plantación forestal", "plantador", "operario de aplicación de herbicidas", "operario forestal", "jornalero forestal", "cuadrillero forestal", "obrero forestal", "trabajador de cosecha manual", "trabajador de mantención de caminos forestales", "trabajador de cosecha forestal"] },
  { codigo: "9321", grupo: "Empacadores y operarios de embalaje", titulos: ["empacador", "empaquetador", "operario de embalaje", "operario de bodega", "operario de packaging", "envasador"] },
  { codigo: "9331", grupo: "Vendedores ambulantes y feriantes", titulos: ["vendedor ambulante", "feriante", "vendedor de feria", "vendedor de calle", "comerciante ambulante"] },
  { codigo: "9333", grupo: "Repartidores y mensajeros", titulos: ["repartidor", "mensajero", "delivery", "cadete", "repartidor de encomiendas", "repartidor de pedidos", "courier"] },
  { codigo: "9334", grupo: "Reponedores de tiendas y supermercados", titulos: ["reponedor", "repositor", "reponedor de tienda", "reponedor de supermercado", "repositor de bodega", "reponedor de bodega"] },
  { codigo: "9411", grupo: "Preparadores de comida rápida", titulos: ["preparador de comida rápida", "cajero de comida rápida", "trabajador de fast food", "auxiliar de cafetería", "operario de comida rápida"] },
  { codigo: "9412", grupo: "Auxiliares de cocina", titulos: ["auxiliar de cocina", "asistente de cocina", "ayudante de cocina"] },
  { codigo: "9613", grupo: "Personal de aseo y limpieza", titulos: ["auxiliar de aseo", "personal de aseo", "operario de aseo", "aseador", "camarera de hotel", "mucama"] },
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function score(query: string, candidate: string): number {
  const q = normalize(query);
  const c = normalize(candidate);

  // Exact match
  if (q === c) return 1;
  // Substring match — require candidate length ≥ 5 to prevent acronym false positives
  // (e.g. "cio" in "operacion", "coo" in "coordinador", "cto" in "sector")
  if (c.length >= 5 && (c.includes(q) || q.includes(c))) return 0.85;

  // Word overlap (Dice coefficient)
  const qWords = q.split(" ").filter((w) => w.length > 2);
  const cWords = new Set(c.split(" ").filter((w) => w.length > 2));
  if (qWords.length === 0) return 0;

  let matches = 0;
  for (const w of qWords) {
    for (const cw of cWords) {
      if (cw === w || cw.startsWith(w) || w.startsWith(cw)) {
        matches++;
        break;
      }
    }
  }
  return (2 * matches) / (qWords.length + cWords.size);
}

export interface CiuoMatch {
  codigo: string;
  grupo: string;
  confianza: number;
}

export function clasificarCargo(cargo: string): CiuoMatch | null {
  if (!cargo || cargo.trim().length < 3) return null;

  let best: { entry: CiuoEntry; s: number } | null = null;

  for (const entry of CIUO08) {
    for (const titulo of entry.titulos) {
      const s = score(cargo, titulo);
      if (s > (best?.s ?? 0)) {
        best = { entry, s };
      }
    }
  }

  if (!best || best.s < 0.3) return null;
  return { codigo: best.entry.codigo, grupo: best.entry.grupo, confianza: best.s };
}
