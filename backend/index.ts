/**
 * Tres Manifiestos — backend.
 *
 * Una sola ruta de trabajo: el usuario manda un título y un estilo, el servidor
 * escribe el cuento con la IA de la plataforma y lo devuelve entero.
 *
 * (En la versión local el cuento se transmitía por SSE mientras DeepSeek lo
 * redactaba. Aquí no hay streaming: cada tarjeta avisa que está escribiendo y
 * recibe el cuento completo cuando el modelo termina.)
 */

import { router, json, error, ai } from '@appdeploy/sdk';
import {
    CATALOGO,
    ESTILOS,
    estiloPorId,
    construirMensajes,
    separarColofon,
    sistemaCordial,
    type Estilo,
} from './manifiestos';

const MOTOR = 'AppDeploy AI';
const TITULO_MAX = 140;

/**
 * La plataforma corta una petición del backend a los ~30 s y devuelve un cuerpo
 * vacío. Este tope interno vive por debajo para poder contestar un error con
 * texto en vez de dejar al lector con una pantalla muda.
 */
const PRESUPUESTO_MS = 27000;

/** Una pasada de escritura. Sin fase de razonamiento: el cuento tarda menos. */
function unaPasada(estilo: Estilo, titulo: string) {
    return ai.generate({
        system: sistemaCordial(estilo),
        messages: construirMensajes(estilo, titulo),
        // 650-950 palabras caben de sobra; el margen evita el cuento cortado.
        maxTokens: 3000,
        temperature: 0.95,
        thinkingMode: 'NONE',
    });
}

function conTope<T>(promesa: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
        promesa,
        new Promise<T>((_, rechazar) =>
            setTimeout(() => rechazar(new Error('__tope_interno')), Math.max(ms, 1500)),
        ),
    ]);
}

/** Escribe un cuento y devuelve texto + segundos, dentro del presupuesto. */
async function escribirCuento(estilo: Estilo, titulo: string) {
    const marca = Date.now();
    const restante = () => PRESUPUESTO_MS - (Date.now() - marca);

    let resultado;
    try {
        resultado = await conTope(unaPasada(estilo, titulo), restante());
    } catch (err) {
        const fallo = err as { message?: string; statusCode?: number };
        const rapido = fallo?.message === '__tope_interno' ? false : restante() > 12000;
        // Un fallo veloz (cuota, red, modelo ocupado) admite un reintento; un
        // corte por tiempo, no: repetirlo es quedarse sin presupuesto.
        if (!rapido) throw err;
        resultado = await conTope(unaPasada(estilo, titulo), restante());
    }

    const texto = (resultado as { text?: string } | null)?.text ?? '';
    if (!texto.trim()) {
        throw new Error('El motor devolvió el cuento vacío. Vuelve a intentarlo.');
    }
    return { texto, segundos: Math.round((Date.now() - marca) / 1000) };
}

export const handler = router({
    'GET /api/_healthcheck': [
        async () => json({ message: 'Success' }),
    ],

    'GET /api/salud': [
        async () => json({ ok: true, claveLista: true, modelo: MOTOR, estilos: ESTILOS.length }),
    ],

    'GET /api/manifiestos': [
        async () => json({ estilos: CATALOGO, modelo: MOTOR, claveLista: true }),
    ],

    'POST /api/cuento': [
        async (ctx) => {
            const cuerpo = (ctx.body ?? {}) as { titulo?: unknown; estilo?: unknown };

            if (typeof cuerpo.titulo !== 'string' || !cuerpo.titulo.trim()) {
                return error('Falta el título: escribe el título del cuento.', 400);
            }
            const titulo = cuerpo.titulo.trim().replace(/\s+/g, ' ');
            if (titulo.length > TITULO_MAX) {
                return error(`El título no puede pasar de ${TITULO_MAX} caracteres.`, 400);
            }

            if (typeof cuerpo.estilo !== 'string' || !cuerpo.estilo.trim()) {
                return error(
                    `Falta el estilo. Los válidos son: ${ESTILOS.map((e) => e.id).join(', ')}.`,
                    400,
                );
            }
            const estilo = estiloPorId(cuerpo.estilo.trim());
            if (!estilo) {
                return error(
                    `Estilo desconocido: ${cuerpo.estilo.trim()}. Los válidos son: ${ESTILOS.map((e) => e.id).join(', ')}.`,
                    400,
                );
            }

            try {
                const { texto, segundos } = await escribirCuento(estilo, titulo);
                const { cuerpo: narracion, colofon } = separarColofon(texto);
                const palabras = narracion.split(/\s+/).filter(Boolean).length;
                const aviso = colofon
                    ? null
                    : 'El cuento no cerró con el colofón de su manifiesto. Vuelve a escribirlo si lo quieres completo.';

                return json({
                    estilo: estilo.id,
                    estiloNombre: estilo.nombre,
                    titulo,
                    cuerpo: narracion,
                    colofon,
                    palabras,
                    segundos,
                    truncado: false,
                    aviso,
                    modelo: MOTOR,
                });
            } catch (err) {
                const fallo = err as { message?: string; statusCode?: number; responseText?: string };
                const corto = fallo?.message === '__tope_interno';
                console.error(`[${estilo.id}] fallo al escribir «${titulo}»:`, fallo?.message ?? fallo);
                if (corto) {
                    return error(
                        'El motor tardó más de lo que la plataforma permite en una sola petición. Vuelve a intentarlo: casi siempre entra al segundo intento.',
                        504,
                    );
                }
                if (fallo?.statusCode === 429) {
                    return error('El motor está ocupado en este momento. Espera unos segundos y vuelve a intentarlo.', 429);
                }
                return error('No se pudo escribir el cuento. Vuelve a intentarlo.', 502);
            }
        },
    ],
});
