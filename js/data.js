/* Vitalia — datos ficticios para el prototipo.
   Los precios son valores de ejemplo: ajustarlos según la sección de costos. */

const DATA = {
  especialidades: [
    { nombre: "Medicina general", icono: "estetoscopio", texto: "Malestares comunes y chequeos" },
    { nombre: "Pediatría", icono: "bebe", texto: "Salud de niñas y niños" },
    { nombre: "Ginecología", icono: "flor", texto: "Salud de la mujer" },
    { nombre: "Dermatología", icono: "piel", texto: "Piel, cabello y uñas" },
    { nombre: "Psicología", icono: "conversacion", texto: "Acompañamiento emocional" },
    { nombre: "Psiquiatría", icono: "cerebro", texto: "Salud mental y tratamiento" },
    { nombre: "Cardiología", icono: "corazon", texto: "Corazón y presión arterial" },
    { nombre: "Medicina interna", icono: "organos", texto: "Enfermedades crónicas" }
  ],

  departamentos: [
    "Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula", "El Progreso",
    "Escuintla", "Guatemala", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa",
    "Petén", "Quetzaltenango", "Quiché", "Retalhuleu", "Sacatepéquez",
    "San Marcos", "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"
  ],

  idiomas: ["Español", "K'iche'", "Q'eqchi'", "Kaqchikel", "Inglés"],

  medicos: [
    {
      id: "m01", nombre: "Dra. Ana Lucía Pérez", especialidad: "Medicina general",
      colegiado: "12345", colegiadoVerificado: true, departamento: "Chiquimula",
      idiomas: ["Español"], calificacion: 4.8, consultas: 312, precio: 150, disponibleHoy: true,
      horarios: ["08:00", "09:30", "11:00", "14:00", "16:30", "19:00"],
      descripcion: "Médica general con 9 años de experiencia en centros de salud del oriente del país. Atiende enfermedades respiratorias, control de presión y chequeos de rutina."
    },
    {
      id: "m02", nombre: "Dr. José Manuel Caal", especialidad: "Medicina general",
      colegiado: "13872", colegiadoVerificado: true, departamento: "Alta Verapaz",
      idiomas: ["Español", "Q'eqchi'"], calificacion: 4.9, consultas: 268, precio: 150, disponibleHoy: true,
      horarios: ["07:00", "08:30", "10:00", "13:00", "15:30", "18:00"],
      descripcion: "Médico general originario de Cobán. Atiende en español y q'eqchi'. Trabajó 6 años en puestos de salud rurales de Alta Verapaz."
    },
    {
      id: "m03", nombre: "Dra. María Fernanda Xicará", especialidad: "Pediatría",
      colegiado: "11054", colegiadoVerificado: true, departamento: "Quetzaltenango",
      idiomas: ["Español", "K'iche'"], calificacion: 4.9, consultas: 421, precio: 250, disponibleHoy: true,
      horarios: ["08:00", "09:00", "10:30", "15:00", "17:00"],
      descripcion: "Pediatra con especialidad en nutrición infantil. Orienta a madres y padres sobre fiebre, diarrea, vacunas y crecimiento."
    },
    {
      id: "m04", nombre: "Dra. Sofía Castañeda", especialidad: "Ginecología",
      colegiado: "10421", colegiadoVerificado: true, departamento: "Guatemala",
      idiomas: ["Español", "Inglés"], calificacion: 4.7, consultas: 198, precio: 300, disponibleHoy: false,
      horarios: ["09:00", "11:00", "14:30", "16:00"],
      descripcion: "Ginecóloga y obstetra. Control prenatal, planificación familiar e infecciones urinarias, con atención respetuosa y confidencial."
    },
    {
      id: "m05", nombre: "Dr. Ricardo Estrada", especialidad: "Dermatología",
      colegiado: "9876", colegiadoVerificado: true, departamento: "Guatemala",
      idiomas: ["Español"], calificacion: 4.6, consultas: 156, precio: 300, disponibleHoy: true,
      horarios: ["10:00", "12:00", "15:00", "18:30"],
      descripcion: "Dermatólogo clínico. Revisa lesiones de piel por video con apoyo de fotografías enviadas por el chat de la consulta."
    },
    {
      id: "m06", nombre: "Licda. Gabriela Tuyuc", especialidad: "Psicología",
      colegiado: "4521", colegiadoVerificado: true, departamento: "Petén",
      idiomas: ["Español", "Kaqchikel"], calificacion: 4.9, consultas: 233, precio: 250, disponibleHoy: true,
      horarios: ["08:00", "10:00", "14:00", "16:00", "19:00"],
      descripcion: "Psicóloga clínica. Acompaña procesos de ansiedad, duelo y estrés laboral con un enfoque comunitario y culturalmente pertinente."
    },
    {
      id: "m07", nombre: "Dr. Fernando Ochoa", especialidad: "Psiquiatría",
      colegiado: "8734", colegiadoVerificado: true, departamento: "Guatemala",
      idiomas: ["Español", "Inglés"], calificacion: 4.8, consultas: 141, precio: 350, disponibleHoy: false,
      horarios: ["09:30", "13:00", "17:30"],
      descripcion: "Psiquiatra de adultos. Diagnóstico y seguimiento de depresión, ansiedad y trastornos del sueño."
    },
    {
      id: "m08", nombre: "Dr. Héctor Ramírez", especialidad: "Cardiología",
      colegiado: "7612", colegiadoVerificado: true, departamento: "Zacapa",
      idiomas: ["Español"], calificacion: 4.7, consultas: 189, precio: 350, disponibleHoy: true,
      horarios: ["08:00", "11:30", "15:00", "17:00"],
      descripcion: "Cardiólogo. Control de hipertensión, colesterol y seguimiento después de un evento cardíaco."
    },
    {
      id: "m09", nombre: "Dra. Claudia Barrios", especialidad: "Medicina interna",
      colegiado: "9310", colegiadoVerificado: true, departamento: "Quetzaltenango",
      idiomas: ["Español"], calificacion: 4.8, consultas: 207, precio: 300, disponibleHoy: false,
      horarios: ["08:30", "10:30", "14:00", "16:30"],
      descripcion: "Internista. Diabetes, gastritis, tiroides y control de enfermedades crónicas en personas adultas y adultas mayores."
    },
    {
      id: "m10", nombre: "Dr. Mario Cú", especialidad: "Medicina general",
      colegiado: "14590", colegiadoVerificado: true, departamento: "Petén",
      idiomas: ["Español", "Q'eqchi'"], calificacion: 4.7, consultas: 175, precio: 150, disponibleHoy: false,
      horarios: ["07:30", "09:00", "12:00", "16:00", "18:30"],
      descripcion: "Médico general en Santa Elena. Atención de enfermedades tropicales, control de niño sano y enfermedades respiratorias."
    }
  ],

  resenas: [
    { autor: "Rosa M.", lugar: "Esquipulas", estrellas: 5, texto: "Me atendió a la hora exacta y me explicó todo con calma. Ya no tuve que viajar a la capital." },
    { autor: "Julio C.", lugar: "Cobán", estrellas: 5, texto: "La señal en mi aldea es mala y con el modo de solo audio la consulta funcionó sin cortes." },
    { autor: "Andrea L.", lugar: "Mixco", estrellas: 4, texto: "Recibí la receta en el celular y la farmacia la aceptó sin problema." }
  ],

  planes: [
    {
      id: "individual", nombre: "Consulta individual", precio: 150, periodo: "por consulta",
      incluye: ["Videoconsulta con médico colegiado", "Receta electrónica", "Expediente digital"],
      accion: "Buscar médico", ruta: "#/medicos"
    },
    {
      id: "familiar", nombre: "Plan familiar", precio: 249, periodo: "al mes", destacado: true,
      incluye: ["Hasta 4 personas", "Consultas generales ilimitadas", "20 % de descuento en especialistas", "Receta electrónica y expediente"],
      accion: "Elegir plan familiar", ruta: "#/entrar"
    },
    {
      id: "empresas", nombre: "Empresas", precio: 60, periodo: "por empleado al mes",
      incluye: ["Plan familiar para cada empleado", "Panel de uso para RRHH", "Datos agregados y anónimos"],
      accion: "Ver panel de empresa", ruta: "#/empresa"
    }
  ],

  /* Diagnóstico y receta ficticios según la especialidad del médico */
  recetas: {
    "Medicina general": {
      diagnostico: "Faringitis aguda",
      items: [
        { nombre: "Azitromicina 500 mg", dosis: "1 tableta al día", duracion: "3 días" },
        { nombre: "Acetaminofén 500 mg", dosis: "1 tableta cada 6 horas si hay fiebre o dolor", duracion: "3 días" }
      ],
      nota: "Se evitó la penicilina por la alergia registrada en el expediente. Tomar abundantes líquidos y reposo de voz."
    },
    "Pediatría": {
      diagnostico: "Infección respiratoria alta",
      items: [
        { nombre: "Acetaminofén jarabe 160 mg/5 ml", dosis: "5 ml cada 6 horas si hay fiebre", duracion: "3 días" },
        { nombre: "Suero de rehidratación oral", dosis: "A libre demanda", duracion: "2 días" }
      ],
      nota: "Acudir a un servicio de emergencia si hay dificultad para respirar o fiebre por más de 3 días."
    },
    "Ginecología": {
      diagnostico: "Infección urinaria no complicada",
      items: [
        { nombre: "Nitrofurantoína 100 mg", dosis: "1 cápsula cada 12 horas", duracion: "5 días" },
        { nombre: "Fenazopiridina 200 mg", dosis: "1 tableta cada 8 horas", duracion: "2 días" }
      ],
      nota: "Tomar al menos 2 litros de agua al día. La orina puede tomar color naranja por la fenazopiridina."
    },
    "Dermatología": {
      diagnostico: "Dermatitis de contacto",
      items: [
        { nombre: "Hidrocortisona crema 1 %", dosis: "Capa fina 2 veces al día", duracion: "7 días" },
        { nombre: "Loratadina 10 mg", dosis: "1 tableta al día", duracion: "7 días" }
      ],
      nota: "Evitar el contacto con el producto que causó la reacción. No rascar la zona."
    },
    "Psicología": {
      diagnostico: "Ansiedad leve — plan de acompañamiento",
      items: [
        { nombre: "Ejercicios de respiración guiada", dosis: "2 veces al día, 10 minutos", duracion: "2 semanas" },
        { nombre: "Sesión de seguimiento", dosis: "1 sesión semanal", duracion: "4 semanas" }
      ],
      nota: "Si en algún momento sientes que estás en peligro, busca ayuda inmediata en el servicio de emergencia más cercano."
    },
    "Psiquiatría": {
      diagnostico: "Trastorno de ansiedad generalizada",
      items: [
        { nombre: "Sertralina 50 mg", dosis: "1 tableta por la mañana", duracion: "30 días" },
        { nombre: "Hidroxicina 25 mg", dosis: "1 tableta por la noche si hay insomnio", duracion: "14 días" }
      ],
      nota: "No suspender el tratamiento sin indicación médica. Cita de control en 4 semanas."
    },
    "Cardiología": {
      diagnostico: "Hipertensión arterial estadio 1",
      items: [
        { nombre: "Losartán 50 mg", dosis: "1 tableta al día", duracion: "30 días" },
        { nombre: "Amlodipino 5 mg", dosis: "1 tableta al día", duracion: "30 días" }
      ],
      nota: "Reducir la sal en las comidas y registrar la presión arterial cada mañana."
    },
    "Medicina interna": {
      diagnostico: "Gastritis aguda",
      items: [
        { nombre: "Omeprazol 20 mg", dosis: "1 cápsula en ayunas", duracion: "14 días" },
        { nombre: "Sucralfato 1 g", dosis: "1 tableta antes de cada comida", duracion: "7 días" }
      ],
      nota: "Evitar irritantes (café, picante, alcohol) y no pasar más de 4 horas sin comer."
    }
  },

  farmacias: [
    { nombre: "Farmacia La Ceiba", lugar: "Chiquimula · entrega a domicilio", cupon: "VITALIA10", descuento: "10 %" },
    { nombre: "Botica Los Volcanes", lugar: "Quetzaltenango · 14 sucursales", cupon: "VITALIA15", descuento: "15 %" },
    { nombre: "Farmacia Maíz de Oro", lugar: "Cobán · abierta 24 horas", cupon: "VITALIA10", descuento: "10 %" }
  ],

  paciente: {
    nombreDemo: "Carlos Méndez",
    edad: 34,
    sangre: "O+",
    departamento: "Chiquimula",
    alergias: ["Penicilina (reacción leve en la piel)"],
    medicamentos: [{ nombre: "Loratadina 10 mg", dosis: "1 tableta al día en temporada de polen" }],
    laboratorios: [{ nombre: "Hematología completa", archivo: "hematologia-2026-07-14.pdf", fecha: "14 jul 2026" }],
    historial: [
      { fecha: "2026-07-14", medico: "Dr. José Manuel Caal", especialidad: "Medicina general", motivo: "Chequeo general", resultado: "Resultados de laboratorio dentro de lo normal." },
      { fecha: "2026-03-03", medico: "Dra. Claudia Barrios", especialidad: "Medicina interna", motivo: "Dolor de estómago", resultado: "Gastritis leve. Tratamiento por 14 días, ya concluido." }
    ]
  },

  /* Citas fijas en la agenda del médico de demostración */
  agendaMedico: [
    { hora: "08:00", paciente: "María J.", motivo: "Control de diabetes" },
    { hora: "09:30", paciente: "Pedro A.", motivo: "Dolor de espalda" },
    { hora: "14:00", paciente: "Lucía R.", motivo: "Revisión de resultados de laboratorio" },
    { hora: "16:30", paciente: "Tomás C.", motivo: "Tos de 5 días" }
  ],

  empresa: {
    nombre: "Agroindustrias del Oriente, S.A.",
    afiliados: 120,
    usaronMes: 47,
    consultasMes: 68,
    tiempoPromedio: 11,
    especialidades: [
      { nombre: "Medicina general", valor: 31 },
      { nombre: "Pediatría (familiares)", valor: 14 },
      { nombre: "Psicología", valor: 11 },
      { nombre: "Ginecología", valor: 7 },
      { nombre: "Dermatología", valor: 5 }
    ],
    areas: [
      { area: "Producción", afiliados: 58, usaron: 22, consultas: 31 },
      { area: "Logística", afiliados: 24, usaron: 9, consultas: 13 },
      { area: "Administración", afiliados: 16, usaron: 8, consultas: 12 },
      { area: "Ventas", afiliados: 14, usaron: 5, consultas: 8 },
      { area: "Mantenimiento", afiliados: 8, usaron: 3, consultas: 4 }
    ]
  },

  kpis: {
    consultasMes: [420, 610, 880, 1150, 1490, 1820],
    usuariosNuevosMes: [300, 410, 560, 700, 860, 1010],
    nps: 62,
    rurales: 38,
    uptime: 99.92,
    tiempoInicio: 11,
    medicosActivos: 46,
    subsidiadas: 214,
    ltvCac: 3.4
  }
};
