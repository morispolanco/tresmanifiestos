/** Formas compartidas por toda la interfaz. */

export type EstadoTarjeta = 'espera' | 'escribiendo' | 'listo' | 'error';

/** Un manifiesto tal como lo presenta la interfaz. */
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

/** Lo que devuelve POST /api/cuento. */
export interface RespuestaCuento {
    estilo: string;
    estiloNombre: string;
    titulo: string;
    cuerpo: string;
    colofon: string | null;
    palabras: number;
    segundos: number;
    truncado: boolean;
    aviso: string | null;
    modelo: string;
}

/** El estado vivo de una tarjeta. */
export interface Tarjeta {
    estado: EstadoTarjeta;
    cuerpo: string;
    colofon: string | null;
    palabras: number;
    segundos: number | null;
    aviso: string | null;
    error: string | null;
    titulo: string;
}

/** Un cuento guardado en el historial del navegador. */
export interface Guardado {
    cuerpo: string;
    colofon: string | null;
    palabras: number;
}

/** Una corrida completa: un título, tres cuentos. */
export interface Corrida {
    titulo: string;
    fecha: string;
    cuentos: Record<string, Guardado>;
}
