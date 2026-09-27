/**
 * Prueba del backend en local: llama a las rutas del manejador ya empaquetado
 * y comprueba el colofón, el conteo de palabras y los guardarraíles.
 *
 * Uso:  node local/prueba-backend.mjs
 */
const { handler } = await import('../local/backend.bundle.mjs');

let fallos = 0;
const mirar = (nombre, condicion, detalle = '') => {
    console.log(`${condicion ? '  ok  ' : ' FALLA'} ${nombre}${condicion ? '' : ' -> ' + detalle}`);
    if (!condicion) fallos++;
};

const llamar = async (clave, ctx = {}) => {
    const ruta = handler[clave];
    if (!ruta) return { tipo: 'ausente' };
    return await ruta[0]({ body: ctx.body });
};

/* 1. salud y catálogo */
const salud = await llamar('GET /api/salud');
mirar('GET /api/salud devuelve ok', salud?.status === 200 && salud.cuerpo.ok === true, JSON.stringify(salud));

const cat = await llamar('GET /api/manifiestos');
mirar('el catálogo trae los tres manifiestos', cat?.cuerpo?.estilos?.length === 3, JSON.stringify(cat?.cuerpo?.estilos?.length));

/* 2. escritura buena */
const bien = await llamar('POST /api/cuento', { body: { titulo: 'La última cuota del puente', estilo: 'concordancia' } });
mirar('escribe y devuelve 200', bien?.status === 200, JSON.stringify(bien).slice(0, 200));
mirar('el cuerpo NO incluye el colofón', Boolean(bien?.cuerpo?.cuerpo) && !bien.cuerpo.cuerpo.includes('Discordancias:'), String(bien?.cuerpo?.cuerpo).slice(-80));
mirar('el colofón se separó', typeof bien?.cuerpo?.colofon === 'string' && bien.cuerpo.colofon.startsWith('Discordancias:'), String(bien?.cuerpo?.colofon));
mirar('cuenta palabras', bien?.cuerpo?.palabras > 50, String(bien?.cuerpo?.palabras));
mirar('sin aviso (el cuento cerró con colofón)', bien?.cuerpo?.aviso === null, String(bien?.cuerpo?.aviso));

/* 3. guardarraíles */
const sinTitulo = await llamar('POST /api/cuento', { body: { titulo: '   ', estilo: 'plazos' } });
mirar('título vacío -> 400 nombrando el campo', sinTitulo?.status === 400 && /título/i.test(sinTitulo.cuerpo.error), JSON.stringify(sinTitulo));

const sinEstilo = await llamar('POST /api/cuento', { body: { titulo: 'Algo' } });
mirar('estilo ausente -> 400', sinEstilo?.status === 400, JSON.stringify(sinEstilo));

const estiloMalo = await llamar('POST /api/cuento', { body: { titulo: 'Algo', estilo: 'inexistente' } });
mirar('estilo desconocido -> 400 con los válidos', estiloMalo?.status === 400 && estiloMalo.cuerpo.error.includes('concordancia'), JSON.stringify(estiloMalo));

const largo = await llamar('POST /api/cuento', { body: { titulo: 'x'.repeat(200), estilo: 'plazos' } });
mirar('título larguísimo -> 400', largo?.status === 400, JSON.stringify(largo));

const sinCuerpo = await llamar('POST /api/cuento', {});
mirar('cuerpo vacío -> 400', sinCuerpo?.status === 400, JSON.stringify(sinCuerpo));

console.log(fallos ? `\n${fallos} comprobación(es) fallidas` : '\nTodo bien');
process.exit(fallos ? 1 : 0);
