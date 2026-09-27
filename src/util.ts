import type { Corrida } from './tipos';

const CLAVE_HISTORIAL = 'tres-manifiestos:historial:v1';

export const contarPalabras = (texto: string): number =>
    texto.trim() ? texto.trim().split(/\s+/).length : 0;

/**
 * Los métodos del cliente de la plataforma devuelven `{ data }`. Este paso
 * acepta también un cuerpo pelado para que la interfaz no se rompa si la
 * respuesta llega sin envoltorio.
 */
export function desempaquetar<T>(sobre: unknown): T {
    if (sobre && typeof sobre === 'object' && 'data' in (sobre as object)) {
        return (sobre as { data: T }).data;
    }
    return sobre as T;
}

/** El mensaje que el backend devolvió con `error(...)`, si lo hay. */
export function mensajeDeError(err: unknown): string {
    const e = err as {
        response?: { data?: { error?: string; message?: string } };
        message?: string;
    };
    return (
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo escribir el cuento.'
    );
}

export function textoMarkdown(
    titulo: string,
    nombreEstilo: string,
    fuente: string,
    cuerpo: string,
    colofon: string | null,
): string {
    return (
        [
            `# ${titulo || 'Sin título'}`,
            '',
            `*${nombreEstilo} — ${fuente}*`,
            '',
            cuerpo || '',
            colofon ? `\n*${colofon}*` : '',
        ]
            .join('\n')
            .trim() + '\n'
    );
}

export function nombreArchivo(titulo: string, sufijo: string): string {
    const base =
        (titulo || 'cuento')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase()
            .slice(0, 60) || 'cuento';
    return `${base}${sufijo}.md`;
}

export function descargarArchivo(nombre: string, contenido: string): void {
    const blob = new Blob([contenido], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------ historial local */

export function leerHistorial(): Corrida[] {
    try {
        const crudo = localStorage.getItem(CLAVE_HISTORIAL);
        const datos = crudo ? JSON.parse(crudo) : [];
        return Array.isArray(datos) ? (datos as Corrida[]) : [];
    } catch {
        return [];
    }
}

export function escribirHistorial(corridas: Corrida[]): void {
    try {
        localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(corridas));
    } catch {
        /* sin espacio: el historial es un lujo, no un requisito */
    }
}

/** El título viene en la URL como /?titulo=... */
export function tituloDeLaUrl(): string {
    try {
        return new URLSearchParams(window.location.search).get('titulo') ?? '';
    } catch {
        return '';
    }
}
