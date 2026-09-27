/**
 * Tipos de los paquetes que la plataforma inyecta en tiempo de despliegue.
 * Existen solo para que `tsc` pueda revisar el arbol local; no se suben.
 */

declare module '@appdeploy/sdk' {
    export interface RouterContext {
        body?: unknown;
        query?: Record<string, string | string[] | undefined>;
        params?: Record<string, string>;
        headers?: Record<string, string | undefined>;
    }

    export interface AiMessage {
        role: 'user' | 'assistant' | 'system' | 'model';
        content: string;
    }

    export interface AiImage {
        data: string;
        mimeType: string;
    }

    export interface AiGenerateOptions {
        prompt?: string;
        messages?: AiMessage[];
        system?: string;
        schema?: Record<string, unknown>;
        images?: AiImage[];
        audios?: AiImage[];
        maxTokens?: number;
        temperature?: number;
        thinkingMode?: 'NONE' | 'FAST' | 'DEEP';
    }

    export interface AiGenerateResult {
        text: string;
    }

    export function router(
        rutas: Record<string, Array<(ctx: RouterContext) => unknown>>,
    ): unknown;
    export function json(cuerpo: unknown, status?: number): unknown;
    export function error(mensaje: string, status?: number): unknown;
    export function requireAuth(...args: unknown[]): unknown;

    export const ai: {
        generate(opciones: AiGenerateOptions): Promise<AiGenerateResult>;
    };
}

declare module '@appdeploy/client' {
    export interface Api {
        get(url: string, data?: unknown): Promise<{ data: unknown }>;
        post(url: string, data?: unknown): Promise<{ data: unknown }>;
        put(url: string, data?: unknown): Promise<{ data: unknown }>;
        delete(url: string, data?: unknown): Promise<{ data: unknown }>;
    }
    export const api: Api;
}
