/**
 * Prueba de extremo a extremo contra la app EN VIVO.
 *
 * Abre la app publicada, escribe un titulo, pulsa «Escribir los tres», espera a
 * que los tres manifiestos terminen y comprueba: textos reales, colofones,
 * guardarrail del titulo vacio y el historial de titulos recientes.
 *
 * Uso: node pruebas/navegador/e2e.mjs
 */
import puppeteer from 'puppeteer-core';
import { writeFileSync } from 'node:fs';

const URL_APP = 'https://tres-manifiestos-7faz2v.v2.appdeploy.ai/';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TITULO = 'La última cuota del puente';

const errores = [];
let fallos = 0;
const mirar = (nombre, ok, detalle = '') => {
    console.log(`${ok ? '  ok  ' : ' FALLA'} ${nombre}${ok ? '' : ' -> ' + String(detalle).slice(0, 300)}`);
    if (!ok) fallos++;
};

const navegador = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--window-size=1440,1400'],
    defaultViewport: { width: 1440, height: 1300 },
});
const pagina = await navegador.newPage();
pagina.on('console', (m) => {
    if (m.type() === 'error') errores.push('console: ' + m.text());
});
pagina.on('pageerror', (e) => errores.push('pageerror: ' + e.message));
pagina.on('requestfailed', (r) => errores.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));

/** Escribe en un input de React (el value a pelo lo ignora). */
async function escribirTexto(selector, texto) {
    await pagina.$eval(
        selector,
        (el, valor) => {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(el, valor);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        },
        texto,
    );
}

/** Clic de verdad, por coordenadas: los botones de React no obedecen a .click(). */
async function pulsar(selector) {
    const caja = await pagina.$eval(selector, (el) => {
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await pagina.mouse.click(caja.x, caja.y);
}

const leerTablero = () =>
    pagina.$$eval('.cuento', (tarjetas) =>
        tarjetas.map((t) => ({
            estilo: t.dataset.estilo,
            estado: t.dataset.estado,
            nombre: t.querySelector('.cuento__nombre')?.textContent ?? '',
            marca: t.querySelector('.estado__texto')?.textContent ?? '',
            colofon: t.querySelector('.cuento__colofon-texto')?.textContent ?? null,
            parrafos: t.querySelectorAll('.cuento__cuerpo p').length,
            primeras: (t.querySelector('.cuento__cuerpo')?.textContent ?? '').trim().slice(0, 90),
            copiarActivo: !t.querySelector('button[data-accion="copiar"]')?.disabled,
            error: t.querySelector('.cuento__error')?.textContent ?? null,
        })),
    );

const esperarListos = async (ms = 120000) => {
    const limite = Date.now() + ms;
    while (Date.now() < limite) {
        const tablero = await leerTablero();
        if (tablero.length === 3 && tablero.every((t) => t.estado === 'listo' || t.estado === 'error')) return tablero;
        await new Promise((r) => setTimeout(r, 1000));
    }
    return leerTablero();
};

/* ------------------------------------------------------------ 1. carga */

console.log('\n1) carga inicial');
await pagina.goto(URL_APP, { waitUntil: 'networkidle2', timeout: 60000 });
await pagina.waitForSelector('.cuento', { timeout: 20000 });
const inicial = await leerTablero();
mirar('se pintan tres tarjetas', inicial.length === 3, inicial.length);
mirar('las tres empiezan en espera', inicial.every((t) => t.estado === 'espera'), JSON.stringify(inicial.map((t) => t.estado)));
mirar('el catalogo del servidor llegó (motor real)', (await pagina.$eval('#pie-motor', (e) => e.textContent)).includes('AppDeploy AI'), await pagina.$eval('#pie-motor', (e) => e.textContent));
mirar('sin aviso de catálogo local', !(await pagina.$eval('body', (e) => e.textContent)).includes('No pude confirmar el catálogo'));

/* ------------------------------------------- 2. guardarraíl sin título */

console.log('\n2) guardarraíl: sin título no escribe');
await escribirTexto('#titulo', '');
await pulsar('#escribir');
await new Promise((r) => setTimeout(r, 1200));
const notaVacia = await pagina.$eval('#nota-forma', (e) => e.textContent);
const tras = await leerTablero();
mirar('avisa que falta el título', /Escribe un título/i.test(notaVacia), notaVacia);
mirar('ninguna tarjeta se puso a escribir', tras.every((t) => t.estado === 'espera'), JSON.stringify(tras.map((t) => t.estado)));

/* ------------------------------------------------ 3. escritura real */

console.log('\n3) escritura de los tres cuentos (IA real)');
await escribirTexto('#titulo', TITULO);
await pulsar('#escribir');
const empezado = Date.now();
const tablero = await esperarListos(150000);
const segundos = Math.round((Date.now() - empezado) / 1000);
console.log(`   (tardó ${segundos}s)`);

mirar('las tres tarjetas terminan en listo', tablero.every((t) => t.estado === 'listo'), JSON.stringify(tablero.map((t) => [t.estilo, t.estado, t.error])));
for (const t of tablero) {
    mirar(`${t.estilo}: cuento de verdad`, t.parrafos >= 3 && t.primeras.length > 60, `${t.parrafos} párrafos | ${t.primeras}`);
    mirar(`${t.estilo}: colofón propio`, Boolean(t.colofon) && t.colofon.length > 15, t.colofon);
    mirar(`${t.estilo}: botones de copiar/descargar activos`, t.copiarActivo === true);
}
mirar('textos distintos entre manifiestos', new Set(tablero.map((t) => t.primeras)).size === 3);
const notaFinal = await pagina.$eval('#nota-forma', (e) => e.textContent);
mirar('la nota informa el total', /Listo: \d+ palabras/.test(notaFinal), notaFinal);

/* -------------------------------------------- 4. títulos recientes */

console.log('\n4) títulos recientes tras recargar');
await pagina.reload({ waitUntil: 'networkidle2', timeout: 60000 });
await pagina.waitForSelector('.chip', { timeout: 20000 });
const chip = await pagina.$eval('.chip', (e) => e.textContent);
mirar('el historial ofrece el título', chip === TITULO, chip);
await pulsar('.chip');
await new Promise((r) => setTimeout(r, 1500));
const restaurado = await leerTablero();
mirar('las tres tarjetas vuelven a mostrar cuento', restaurado.every((t) => t.estado === 'listo' && t.parrafos >= 3), JSON.stringify(restaurado.map((t) => [t.estado, t.parrafos])));
mirar('el campo trae el título guardado', (await pagina.$eval('#titulo', (e) => e.value)) === TITULO);

/* ------------------------------------------------------ 5. captura */

writeFileSync('C:/tmp/tres-vivo.json', JSON.stringify({ tablero, restaurado, errores, segundos }, null, 1), 'utf8');
await pagina.screenshot({ path: 'C:/tmp/tres-vivo.png', fullPage: true });

console.log('\nerrores de consola/red:', errores.length ? errores.slice(0, 10) : 'ninguno');
console.log(fallos ? `\n${fallos} comprobación(es) fallidas` : '\nTODO BIEN');

await pagina.close();
await navegador.close();
process.exit(fallos || errores.length ? 1 : 0);
