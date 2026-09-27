import type { EstiloVista } from './tipos';

/**
 * El catálogo tal como se pinta en pantalla.
 *
 * Es la copia que trae la aplicación: se usa mientras llega el catálogo del
 * servidor y se queda como respaldo si esa llamada falla, para que el tablero
 * nunca aparezca vacío.
 */
export const CATALOGO: EstiloVista[] = [
    {
        id: 'concordancia',
        numeral: 'I',
        nombre: 'La concordancia de las manos',
        lema: 'Yo abrimos la puerta. Nosotros prometí cerrarla.',
        mecanica: 'Dos discordancias con reglas opuestas: quién hace el trabajo y quién habla por los demás.',
        fuente: 'Manifiesto de un estilo narrativo y una escena de prueba',
        color: '#2f4a6d',
        rasgos: ['yo + verbo en plural', 'nosotros + verbo en singular', 'créditos y firma', 'derecho a corregir el pronombre'],
        etiquetaColofon: 'Discordancias',
    },
    {
        id: 'plazos',
        numeral: 'II',
        nombre: 'El realismo a plazos',
        lema: 'No fundamos Macondo: abrimos una ventanilla.',
        mecanica: 'Todo llega antes de pagarse: la libreta, el cobrador, la manda y la columna que no se apunta.',
        fuente: 'Manifiesto en cuota inicial',
        color: '#8a5a12',
        rasgos: ['cuota inicial', 'libreta y saldo', 'el cobrador', 'lo no apuntado', 'se le fía otra vez'],
        etiquetaColofon: 'Plazos en funcionamiento',
    },
    {
        id: 'polifrecuencial',
        numeral: 'III',
        nombre: 'El realismo polifrecuencial',
        lema: 'Tres tiempos en el mismo segundo: el ánima, el expediente y la antena.',
        mecanica: 'Estratigrafía narrativa: cláusula de interferencia, léxico de tracción mixta, causalidad suspendida.',
        fuente: 'Estratigrafía narrativa · manifiesto',
        color: '#0f6f66',
        rasgos: ['cláusula de interferencia', 'léxico de tracción mixta', 'causalidad suspendida', 'los tres estratos'],
        etiquetaColofon: 'Estratos',
    },
];
