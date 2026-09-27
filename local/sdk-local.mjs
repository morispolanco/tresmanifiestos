/**
 * SDK de mentira para probar el backend en local, sin plataforma y sin gastar
 * créditos. El cliente de verdad lo inyecta AppDeploy en el despliegue.
 */

export const router = (rutas) => rutas;
export const json = (cuerpo, status = 200) => ({ tipo: 'json', status, cuerpo });
export const error = (mensaje, status = 500) => ({ tipo: 'error', status, cuerpo: { error: mensaje } });

/** Cuento de mentira con colofón, para comprobar cómo se separa. */
const CUENTO = `Aurelio contó las cajas dos veces porque la primera no le cuadraron.

—Yo cargamos el camión hasta la una —dijo, y nadie lo corrigió.

Nosotros firmé la guía a las seis de la mañana, con el sol todavía bajo.

Aurelio volvió el jueves. La libreta tenía dieciséis abonos y un saldo que no bajaba.

*Discordancias: «Yo cargamos el camión hasta la una» (ejecución compartida); «Nosotros firmé la guía a las seis de la mañana» (representación individual).*`;

let fallar = false;

export const ai = {
    generate: async () => {
        if (fallar) {
            const err = new Error('cuota');
            err.statusCode = 429;
            fallar = false;
            throw err;
        }
        return { text: CUENTO };
    },
};

/** Truco de prueba: la siguiente llamada a la IA falla con 429. */
export const provocarFallo = () => {
    fallar = true;
};
