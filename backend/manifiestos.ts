/**
 * Los tres manifiestos, convertidos en directrices ejecutables.
 *
 * Portado 1:1 de `estilos.js` de la version local: el servidor no decide nada
 * literario, solo transporta. Toda la poetica vive en estos tres bloques.
 *
 *   - `directrices`  -> lo que el modelo debe EJECUTAR (no describir).
 *   - `colofon`      -> la linea final que el cuento debe cerrar.
 *   - `rasgos`       -> etiquetas que la interfaz muestra como ficha del estilo.
 */

export interface Estilo {
    id: string;
    numeral: string;
    nombre: string;
    lema: string;
    mecanica: string;
    fuente: string;
    color: string;
    extension: string;
    colofon: string;
    etiquetaColofon: string;
    rasgos: string[];
    directrices: string;
}

export interface EstiloVista {
    id: string;
    numeral: string;
    nombre: string;
    lema: string;
    mecanica: string;
    fuente: string;
    color: string;
    rasgos: string[];
    etiquetaColofon: string;
}

const REGLAS_COMUNES = `
REGLAS DE ENTREGA (obligatorias, sin excepción):
- Escribe SOLO el cuento. Nada de notas, prefacios, títulos internos, numeración de escenas, epígrafes ni explicaciones del método.
- No repitas el título al inicio: el cuento arranca con su primera frase.
- Es un CUENTO, no un ensayo ni una viñeta: personas concretas con nombre y oficio, un lugar determinado, escenas, algo de diálogo, y un cambio real entre la primera y la última línea.
- Extensión: {EXTENSION}. No más largo ni más corto.
- Español vivo, con el habla del lugar que elijas. Prohibido mencionar el nombre del estilo, el manifiesto o el artificio que estás usando.
- Última línea: el colofón, exactamente con el formato indicado, en cursiva, sin nada después.
`.trim();

function sistemaCordial(estilo: Estilo): string {
    return [
        'Eres un narrador latinoamericano contemporáneo. Escribes cuentos inéditos, completos y autónomos en español, a partir de un solo dato: un título.',
        '',
        REGLAS_COMUNES.replace('{EXTENSION}', estilo.extension),
        '',
        `FORMATO DEL COLOFÓN: ${estilo.colofon}`,
        'En el colofón sustituye todo marcador de relleno (N, <…>) por el valor real de tu cuento: un número contado, no una letra ni un hueco. No dejes marcadores sin rellenar.',
        '',
        `ESTILO QUE DEBES EJECUTAR — ${estilo.nombre.toUpperCase()}.`,
        'No lo describas: escríbelo. Estas son sus reglas de composición:',
        '',
        estilo.directrices,
    ].join('\n');
}

/* ------------------------------------------------------------------ */
/* I. LA CONCORDANCIA DE LAS MANOS                                     */
/* ------------------------------------------------------------------ */

const CONCORDANCIA = `
MANIFIESTO: «La concordancia de las manos». Su unidad no es un prodigio, una época ni un personaje
excepcional: es la relación entre quien dice *yo*, quienes hacen posible ese verbo y quienes cargarán
con sus consecuencias. Una escena revela su verdad cuando cambia la manera de conjugarla.

EL MECANISMO CENTRAL — dos discordancias con reglas opuestas:
1. «Yo» + verbo en primera persona del plural: *Yo abrimos el cine el sábado*. *Yo filmamos ocho minutos
   de nuestra colonia*. Habla UNA persona, pero la acción ocurrió gracias a otras. La terminación -mos
   no sirve para apropiarse del trabajo ajeno: el cuento debe mostrar qué hizo cada quien.
2. «Nosotros» / «nosotras» + verbo en primera persona del singular: *Nosotros firmé la película*.
   *Nosotras decidí abrir*. La decisión de una persona afecta a todas, quizá sin que todas la hayan
   autorizado. La frase obliga a contar quién decidió, a quién representó y quién podrá disentir.
3. Concordancia habitual para todo lo demás: *Yo corté la cuerda; nosotras levantamos la lona*. Si el
   grupo delibera y actúa en conjunto, el verbo vuelve al plural correcto. El desajuste aparece SOLO
   cuando modifica la atribución de una acción o de una responsabilidad.

CÓMO USARLAS (esto decide si el cuento funciona o es un truco):
- Cada discordancia debe cambiar quién carga con un hecho y tener consecuencias visibles en la trama:
  un nombre en una pantalla, un crédito reclamado, un trabajo no reconocido, una promesa que compromete
  a otros, una firma, una lista, un cartel, un acta, una libreta de obra.
- Empléalas entre 6 y 14 veces en total. Nunca en oraciones seguidas ni como adorno tipográfico: dentro
  de la frase deben sonar como habla, no como error subrayado.
- Derecho a corregir el pronombre: algún personaje debe reclamar. Puede pasar de escudarse en el
  «nosotros» al «yo», rechazar un «nosotros» que lo incluía sin consultarlo, o exigir que se le devuelva
  lo que hizo. Esa corrección debe ALTERAR la historia, no explicarse al pie de página.
- Tiene que haber una escena de créditos o de firma (una primera pantalla, un rótulo, una lista, un
  orden de nombres, un reparto) donde se vea lo que la atribución hace: lo que reconoce y lo que borra.
- El «nosotros» no nace como consigna: se gana con trabajo, permiso, desacuerdo y una decisión que puede
  renovarse. El cuento puede terminar en un «volvemos» ganado o en la fractura; pero el vínculo debe
  poder corregirse sin destruirse.

ESCENA Y MUNDO:
- Un trabajo compartido y verificable: un rodaje, una mudanza, un baile, una cooperativa, una comida,
  una huelga, una proyección, un taller, una comparsa, una cosecha, una obra de teatro, una radio.
- Lugar y personas determinadas: nombres propios, oficios, objetos, horas. Ninguna comunidad representa
  por sí sola a América Latina; ninguna frase vale como alegoría continental.
- Primera persona (singular, con las dos discordancias). Tono sobrio y concreto: frases limpias, hechos,
  manos, herramientas, temperaturas. Nada de lirismo que tape la contabilidad del trabajo.
- El diálogo puede pactar el pronombre: alguien puede decir «yo vuelvo» y otro responder «yo también»,
  y solo después, y solo quienes de veras pueden, decir «volvemos».
`.trim();

/* ------------------------------------------------------------------ */
/* II. EL REALISMO A PLAZOS                                            */
/* ------------------------------------------------------------------ */

const PLAZOS = `
MANIFIESTO: «El realismo a plazos». No fundamos Macondo: abrimos una ventanilla. Nuestras casas no
amanecen: se compran a veinte años y amanecen pagándose.

IDEA ÚNICA (para no deber más): aquí la vida no se compra al contado, se debe. Se debe el pan y se debe
la casa, que se hereda con su hipoteca; se debe el hijo, que nace con su hambre; se debe el milagro, que
se paga en rezos; se debe el país, cuya Independencia se firmó fiada. El futuro no es lo que viene: es lo
que ya se está amortizando. El presente es el recibo. La memoria es una prenda en la casa de empeño.
De ahí el nombre: del realismo mágico aprendimos a contar lo imposible con cara de lunes, y le agregamos
la precisión que faltaba — lo imposible es cotidiano porque nadie terminó de pagarlo. El milagro no niega
la deuda: la financia. El crédito viene de creer: el tendero fía porque tiene fe.

LOS DOCE PLAZOS (usa al menos CUATRO, sin nombrarlos nunca como tales):
1. La cuota inicial: la primera línea no compra el sentido entero, da derecho a entrar — una cifra, un
   objeto, una libreta abierta, un gesto mínimo de pago.
2. La entrega: se escribe por entregas; cada escena se entrega (se da) y se entrega (se rinde).
3. El interés narrativo: quien hace esperar el sentido cobra intereses; la digresión no es adorno, es
   usura: cada rodeo añade monto. El suspenso es mora.
4. El pago mínimo: el sentido total no se paga nunca; el lector abona el mínimo y la historia sigue
   girando, como giran las letras de cambio.
5. El gota a gota: ritmo de cobrador — frases breves, una visita diaria, puntualidad de gota.
6. El empeño: lo que se ama se empeña y se desempeña — la joya, el nombre, la memoria, el cuarto vacío.
   Deja una prenda al principio y decide al final si la rescata o la llora.
7. La manda y la novena: el milagro llega fiado y se agradece en promesas; nueve plazos para pagar lo
   impagable. Las mandas sin terminar se heredan como las deudas.
8. El cobrador: en todo relato entra alguien a cobrar — el pasado, la madre, el fiado, el muerto, el
   Estado, la sequía. Reconocer la visita, sentarse a la mesa y negociar el abono.
9. La refinanciación: los dolores grandes no se pagan, se reestructuran. Migrar es refinanciar la
   suerte; cambiar de casa, de nombre o de amor es pedir una reestructuración sin declararse en quiebra.
10. La condonación: la ética del sistema cabe en una línea — se le fía otra vez. El perdón no pasa por el
    tribunal, pasa por la caja: borrar la libreta y anotar el pedido que viene.
11. Lo no apuntado: en toda libreta hay una columna que no se escribe — la leche del hijo ajeno, la tos
    que no se anota, el pan del día del temblor. Esa columna invisible sostiene la tienda y el barrio.
12. Abonar: en español, pagar y fertilizar son el mismo verbo. Todo abono abona: cada cuota pagada
    engorda lo que viene. Los pagarés de este estilo echan flores.

CÓMO DEBE ESCRIBIRSE:
- Debe existir una libreta o una cuenta: números, montos, fechas, abonos, saldos que suman y no cuadran.
  Los números son personajes.
- Debe existir una columna invisible que nadie anota, y el cuento debe dejar que se lea entre renglones.
- Si hay prodigio, llega por giro, con cobrador y en cuotas: nada es gratuito ni puramente mágico.
- El cobrador no es un villano ni un espectáculo de violencia: es alguien que llega, se sienta y negocia.
  Cuando al cobrador se le acaba la paciencia empieza otro género, y de ese no nos reímos.
- El cariño no cobra recargo: que se vea en la contabilidad del relato, en lo que se fía y a quién.
- Registro: habla popular latinoamericana concreta, oficios y objetos reales. Prohibido el pintoresquismo
  y el «color local»: interesa la TASA local, no el adorno folclórico. Nada de moraleja explícita.
- Final: no en justicia (que escasea), sino en fianza nueva. El cuento cierra con un saldo abierto.
`.trim();

/* ------------------------------------------------------------------ */
/* III. EL REALISMO POLIFRECUENCIAL                                    */
/* ------------------------------------------------------------------ */

const POLIFRECUENCIAL = `
MANIFIESTO: «El realismo polifrecuencial» (o estratigrafía narrativa). Para trascender la herencia
monumental del Boom hay que situarse en la fractura ontológica que define hoy a América Latina: la
no-sincronía de su experiencia histórica.

PREMISA QUE MANDA EN TODO EL CUENTO: América Latina no vive en un tiempo único. Coexisten en el MISMO
SEGUNDO tres estratos, y el cuento debe hacerlos chocar:
- comunal / ancestral: la memoria de la tierra y las ánimas, la letanía, el agüero, el refranero
  barroco, los nombres botánicos vernáculos, lo que se sabe sin expediente;
- notarial-republicano: el papel sellado, la partida de bautismo de 1954, el acta, el sello de tinta
  morada, el oficio, el expediente heredado de las Indias, la firma que falta;
- algorítmico-logístico periférico: la antena de repetición oxidada, la remesa en código alfanumérico,
  el grupo vecinal de mensajería instantánea, la vigilancia biométrica en trochas de barro, el servidor
  caído por la canícula, el error 404, el técnico pasante con sueldo mínimo.

TRES PROCEDIMIENTOS OBLIGATORIOS:
1. LA CLÁUSULA DE INTERFERENCIA (ruptura del vector unilineal). La oración NO avanza en línea recta: se
   construye como una transmisión de onda corta donde convergen señales simultáneas. La cláusula
   principal es atravesada por microdescargas de datos, incisos notariales y murmullos votivos que no
   funcionan como subordinadas gramaticales, sino como frecuencias parásitas que comparten el mismo
   voltaje sintáctico. Usa guiones largos, paréntesis técnicos y comas acumulativas. Entre 5 y 9
   cláusulas de interferencia en el cuento.
2. EL LÉXICO DE TRACCIÓN MIXTA. Se anula la frontera entre el habla popular arcaica y el tecnolecto de la
   globalización precaria: fibra óptica, divisas electrónicas, informes forenses, coordenadas, firmware,
   códigos de retiro, junto al refranero y la letanía. No es pastiche posmoderno: es el registro fiel de
   un cerebro que reza una novena a San Judas mientras espera la confirmación de una transferencia
   internacional en una pantalla rota.
3. LA CAUSALIDAD SUSPENDIDA. Aquí el misterio no es el prodigio natural ni la peripecia detectivesca:
   es la inconclusión perpetua. El fallo judicial, la señal caída de telecomunicaciones y el agüero
   campesino tienen IDÉNTICA fuerza gravitatoria sobre el destino de los personajes, y ninguno se
   resuelve del todo. El expediente queda en suspenso; que el lector lo note.

CÓMO DEBE ESCRIBIRSE:
- Una gestión o un trámite como columna vertebral: una cédula, una pensión, una defunción que nadie
  redacta, una remesa, un título de tierra, un examen forense, una partida, una beca, un permiso.
- Tensión oracional: saturación sensorial del entorno. No hay pausas contemplativas aisladas; cada hecho
  biológico está inmediatamente vigilado, administrado o ignorado por un aparato técnico defectuoso.
- Fusión de escalas en un solo periodo: lo microscópico y local (el sudor, el sello de goma, el río con
  sus zopilotes) conectado con la infraestructura técnica transnacional (el código de retiro, los cables
  submarinos, los armarios que se calientan en la capital).
- Ausencia de exotismo folclórico: la periferia no es escenario pintoresco ni magia inocente; es un nodo
  de fricción geopolítica donde la precariedad no cancela la densidad mítica — la digitaliza y la corroe.
- Personas concretas con nombre, edad y oficio, atrapadas en la ventanilla, la trocha o la fila.
`.trim();

/* ------------------------------------------------------------------ */

export const ESTILOS: Estilo[] = [
    {
        id: 'concordancia',
        numeral: 'I',
        nombre: 'La concordancia de las manos',
        lema: 'Yo abrimos la puerta. Nosotros prometí cerrarla.',
        mecanica: 'Dos discordancias con reglas opuestas: quién hace el trabajo y quién habla por los demás.',
        fuente: 'Manifiesto de un estilo narrativo y una escena de prueba',
        color: '#2f4a6d',
        extension: 'entre 650 y 950 palabras',
        colofon: '*Discordancias: «<frase literal con yo + verbo en plural>» (ejecución compartida); «<frase literal con nosotros + verbo en singular>» (representación individual).*',
        etiquetaColofon: 'Discordancias',
        rasgos: ['yo + verbo en plural', 'nosotros + verbo en singular', 'créditos y firma', 'derecho a corregir el pronombre'],
        directrices: CONCORDANCIA,
    },
    {
        id: 'plazos',
        numeral: 'II',
        nombre: 'El realismo a plazos',
        lema: 'No fundamos Macondo: abrimos una ventanilla.',
        mecanica: 'Todo llega antes de pagarse: la libreta, el cobrador, la manda y la columna que no se apunta.',
        fuente: 'Manifiesto en cuota inicial',
        color: '#8a5a12',
        extension: 'entre 650 y 950 palabras',
        colofon: '*Plazos en funcionamiento: N, N y N.* (tres números del 1 al 12, según los doce plazos del manifiesto)',
        etiquetaColofon: 'Plazos en funcionamiento',
        rasgos: ['cuota inicial', 'libreta y saldo', 'el cobrador', 'lo no apuntado', 'se le fía otra vez'],
        directrices: PLAZOS,
    },
    {
        id: 'polifrecuencial',
        numeral: 'III',
        nombre: 'El realismo polifrecuencial',
        lema: 'Tres tiempos en el mismo segundo: el ánima, el expediente y la antena.',
        mecanica: 'Estratigrafía narrativa: cláusula de interferencia, léxico de tracción mixta, causalidad suspendida.',
        fuente: 'Estratigrafía narrativa · manifiesto',
        color: '#0f6f66',
        extension: 'entre 600 y 900 palabras',
        colofon: '*Estratos: comunal / notarial / algorítmico. Cláusulas de interferencia: N. Causalidad: suspendida.*',
        etiquetaColofon: 'Estratos',
        rasgos: ['cláusula de interferencia', 'léxico de tracción mixta', 'causalidad suspendida', 'los tres estratos'],
        directrices: POLIFRECUENCIAL,
    },
];

/** Los tres manifiestos, en la forma en que la interfaz los presenta. */
export const CATALOGO: EstiloVista[] = ESTILOS.map((e) => ({
    id: e.id,
    numeral: e.numeral,
    nombre: e.nombre,
    lema: e.lema,
    mecanica: e.mecanica,
    fuente: e.fuente,
    color: e.color,
    rasgos: e.rasgos,
    etiquetaColofon: e.etiquetaColofon,
}));

export function estiloPorId(id: string): Estilo | null {
    return ESTILOS.find((e) => e.id === id) || null;
}

/** Devuelve los mensajes listos para el modelo a partir de un título y un estilo. */
export function construirMensajes(
    _estilo: Estilo,
    titulo: string,
): { role: 'user'; content: string }[] {
    return [
        {
            role: 'user',
            content: `TÍTULO DEL CUENTO: «${titulo}»\n\nEscribe el cuento completo, en el estilo indicado.`,
        },
    ];
}

export { sistemaCordial };

/**
 * Separa el colofón final del cuerpo del cuento.
 * Los manifiestos cierran sus muestras con una línea en cursiva de cifras; el
 * cuento debe hacer lo mismo, así que la interfaz la lee como ficha y no como
 * texto. Los modelos a veces la pegan al final del último párrafo en vez de
 * dejarla en su propia línea, así que se aceptan las dos formas.
 */
export function separarColofon(texto: string): { cuerpo: string; colofon: string | null } {
    const limpio = texto.replace(/\s+$/, '');
    const lineas = limpio.split('\n');
    // El punto que cierra la cursiva es puntuación, no parte de la ficha.
    const limpiar = (t: string) => t.trim().replace(/\.$/, '').trim();

    // 1) Lo esperado: la última línea, entera y en cursiva.
    for (let i = lineas.length - 1; i >= 0; i--) {
        const linea = lineas[i].trim();
        if (!linea) continue;
        const m = linea.match(/^\*([^*]+)\*\.?$/);
        if (m) {
            return { cuerpo: lineas.slice(0, i).join('\n').replace(/\s+$/, ''), colofon: limpiar(m[1]) };
        }
        break; // la última línea con contenido no es un colofón
    }

    // 2) Pegado al final del último párrafo, pero con la etiqueta del estilo.
    const etiquetas = [...ESTILOS.map((e) => e.etiquetaColofon), 'Colofón']
        .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('|');
    const pegado = limpio.match(new RegExp(`\\*((?:${etiquetas})[^*]*)\\*\\.?$`, 'i'));
    if (pegado) {
        return {
            cuerpo: limpio.slice(0, pegado.index).replace(/\s+$/, ''),
            colofon: limpiar(pegado[1]),
        };
    }

    return { cuerpo: limpio, colofon: null };
}
