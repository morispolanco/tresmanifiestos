import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { api } from '@appdeploy/client';
import Cuento from './Cuento';
import { CATALOGO } from './manifiestos';
import type { Corrida, EstiloVista, Guardado, RespuestaCuento, Tarjeta } from './tipos';
import {
    contarPalabras,
    desempaquetar,
    escribirHistorial,
    leerHistorial,
    mensajeDeError,
    tituloDeLaUrl,
} from './util';

const HISTORIAL_MAX = 8;

function tarjetaEnEspera(): Tarjeta {
    return {
        estado: 'espera',
        cuerpo: '',
        colofon: null,
        palabras: 0,
        segundos: null,
        aviso: null,
        error: null,
        titulo: '',
    };
}

function tableroEnEspera(estilos: EstiloVista[]): Record<string, Tarjeta> {
    const tablero: Record<string, Tarjeta> = {};
    for (const estilo of estilos) tablero[estilo.id] = tarjetaEnEspera();
    return tablero;
}

export default function App() {
    const [estilos, setEstilos] = useState<EstiloVista[]>(CATALOGO);
    const [motor, setMotor] = useState('comprobando…');
    const [avisoCatalogo, setAvisoCatalogo] = useState<string | null>(null);
    const [tarjetas, setTarjetas] = useState<Record<string, Tarjeta>>(() => tableroEnEspera(CATALOGO));
    const [titulo, setTitulo] = useState('');
    const [nota, setNota] = useState('Nada más. Solo el título: las reglas las ponen los manifiestos.');
    const [notaError, setNotaError] = useState(false);
    const [ocupado, setOcupado] = useState(false);
    const [historial, setHistorial] = useState<Corrida[]>([]);

    /** Los cuentos ya escritos, en la forma en que se guardan. */
    const cuentosRef = useRef<Record<string, Guardado>>({});
    /** Un turno por tarjeta: descarta la respuesta de una escritura vieja. */
    const turnoRef = useRef<Record<string, number>>({});
    const entradaRef = useRef<HTMLInputElement>(null);

    /* ---------------------------------------------------------- arranque */

    useEffect(() => {
        setHistorial(leerHistorial());
        const pre = tituloDeLaUrl();
        if (pre) setTitulo(pre);
        entradaRef.current?.focus();
    }, []);

    useEffect(() => {
        let vivo = true;
        (async () => {
            try {
                const sobre = await api.get('/api/manifiestos');
                const datos = desempaquetar<{ estilos?: EstiloVista[]; modelo?: string }>(sobre);
                if (!vivo) return;
                if (Array.isArray(datos?.estilos) && datos.estilos.length) {
                    setEstilos(datos.estilos);
                    setTarjetas(tableroEnEspera(datos.estilos));
                }
                setMotor(datos?.modelo || 'AppDeploy AI');
            } catch {
                if (!vivo) return;
                // El catálogo también vive en la aplicación: el tablero se pinta
                // igual y solo se avisa de que no se pudo confirmar.
                setMotor('AppDeploy AI (catálogo local)');
                setAvisoCatalogo(
                    'No pude confirmar el catálogo con el servidor: muestro la copia que trae la aplicación.',
                );
            }
        })();
        return () => {
            vivo = false;
        };
    }, []);

    /* --------------------------------------------------------- escritura */

    const escribirUno = useCallback(async (estilo: EstiloVista, tituloCuento: string) => {
        const turno = (turnoRef.current[estilo.id] ?? 0) + 1;
        turnoRef.current[estilo.id] = turno;

        setTarjetas((prev) => ({
            ...prev,
            [estilo.id]: { ...tarjetaEnEspera(), estado: 'escribiendo', titulo: tituloCuento },
        }));

        try {
            const sobre = await api.post('/api/cuento', { titulo: tituloCuento, estilo: estilo.id });
            if (turnoRef.current[estilo.id] !== turno) return;
            const datos = desempaquetar<RespuestaCuento>(sobre);
            const palabras = datos?.palabras ?? contarPalabras(datos?.cuerpo ?? '');
            cuentosRef.current[estilo.id] = {
                cuerpo: datos?.cuerpo ?? '',
                colofon: datos?.colofon ?? null,
                palabras,
            };
            setTarjetas((prev) => ({
                ...prev,
                [estilo.id]: {
                    estado: 'listo',
                    cuerpo: datos?.cuerpo ?? '',
                    colofon: datos?.colofon ?? null,
                    palabras,
                    segundos: datos?.segundos ?? null,
                    aviso: datos?.aviso ?? null,
                    error: null,
                    titulo: tituloCuento,
                },
            }));
        } catch (err) {
            if (turnoRef.current[estilo.id] !== turno) return;
            setTarjetas((prev) => ({
                ...prev,
                [estilo.id]: { ...tarjetaEnEspera(), estado: 'error', error: mensajeDeError(err), titulo: tituloCuento },
            }));
        }
    }, []);

    const guardarCorrida = useCallback((tituloCuento: string) => {
        const cuentos: Record<string, Guardado> = {};
        for (const [id, guardado] of Object.entries(cuentosRef.current)) {
            if (guardado?.cuerpo) cuentos[id] = guardado;
        }
        // Al reescribir un solo manifiesto, los otros dos cuentos de esa misma
        // corrida siguen valiendo: se recuperan del historial en vez de perderse.
        const previa = leerHistorial().find((h) => h.titulo.toLowerCase() === tituloCuento.toLowerCase());
        if (previa) {
            for (const [id, guardado] of Object.entries(previa.cuentos ?? {})) {
                if (!cuentos[id] && guardado?.cuerpo) cuentos[id] = guardado;
            }
        }
        const corrida: Corrida = { titulo: tituloCuento, fecha: new Date().toISOString(), cuentos };
        const nuevo = [
            corrida,
            ...leerHistorial().filter((h) => h.titulo.toLowerCase() !== tituloCuento.toLowerCase()),
        ].slice(0, HISTORIAL_MAX);
        escribirHistorial(nuevo);
        setHistorial(nuevo);
    }, []);

    const escribirLosTres = useCallback(
        async (tituloCuento: string) => {
            setOcupado(true);
            setNotaError(false);
            setNota(`Escribiendo tres cuentos a partir de «${tituloCuento}»…`);
            cuentosRef.current = {};

            await Promise.all(estilos.map((estilo) => escribirUno(estilo, tituloCuento)));

            const total = Object.values(cuentosRef.current).reduce((suma, c) => suma + (c.palabras || 0), 0);
            if (total) guardarCorrida(tituloCuento);

            setOcupado(false);
            setNota(
                total
                    ? `Listo: ${total} palabras repartidas en tres poéticas. Cambia el título cuando quieras.`
                    : 'Ninguno de los tres cuentos llegó a escribirse. Vuelve a intentarlo.',
            );
            setNotaError(!total);
        },
        [estilos, escribirUno, guardarCorrida],
    );

    const regenerar = useCallback(
        (estilo: EstiloVista) => {
            const tituloCuento = tarjetas[estilo.id]?.titulo || titulo.trim();
            if (!tituloCuento) {
                setNotaError(true);
                setNota('Escribe un título para que los manifiestos tengan de qué escribir.');
                entradaRef.current?.focus();
                return;
            }
            setNotaError(false);
            setNota(`Volviendo a escribir «${estilo.nombre}»…`);
            void escribirUno(estilo, tituloCuento).then(() => {
                guardarCorrida(tituloCuento);
                setNota('Ese manifiesto volvió a escribir su cuento. Los otros dos quedaron intactos.');
            });
        },
        [tarjetas, titulo, escribirUno, guardarCorrida],
    );

    const restaurar = useCallback(
        (corrida: Corrida) => {
            setTitulo(corrida.titulo);
            setNotaError(false);
            setNota(`Los tres cuentos de «${corrida.titulo}», tal como se guardaron.`);
            cuentosRef.current = { ...corrida.cuentos };
            setTarjetas((prev) => {
                const siguiente: Record<string, Tarjeta> = { ...prev };
                for (const estilo of estilos) {
                    const guardado = corrida.cuentos[estilo.id];
                    siguiente[estilo.id] = guardado
                        ? {
                              estado: 'listo',
                              cuerpo: guardado.cuerpo,
                              colofon: guardado.colofon ?? null,
                              palabras: guardado.palabras ?? contarPalabras(guardado.cuerpo),
                              segundos: null,
                              aviso: null,
                              error: null,
                              titulo: corrida.titulo,
                          }
                        : tarjetaEnEspera();
                }
                return siguiente;
            });
            document.getElementById('tablero')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        [estilos],
    );

    function enviar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        const tituloCuento = titulo.trim();
        if (!tituloCuento) {
            setNotaError(true);
            setNota('Escribe un título para que los manifiestos tengan de qué escribir.');
            entradaRef.current?.focus();
            return;
        }
        void escribirLosTres(tituloCuento);
    }

    /* ------------------------------------------------------------ pintura */

    return (
        <>
            <a className="salto" href="#tablero">
                Ir a los cuentos
            </a>

            <header className="cabecera">
                <div className="cabecera__interior">
                    <p className="sello">Un título &nbsp;·&nbsp; tres manifiestos literarios</p>
                    <h1 className="titulo-app">Tres Manifiestos</h1>
                    <p className="entrada">
                        Escribes un título. La aplicación escribe el cuento tres veces, cada una sometida a las
                        pautas de un manifiesto distinto: <em>la concordancia de las manos</em>,{' '}
                        <em>el realismo a plazos</em> y <em>el realismo polifrecuencial</em>.
                    </p>

                    <form className="forma" id="forma" autoComplete="off" onSubmit={enviar}>
                        <label className="forma__etiqueta" htmlFor="titulo">
                            El título del cuento
                        </label>
                        <div className="forma__campo">
                            <input
                                id="titulo"
                                name="titulo"
                                type="text"
                                maxLength={140}
                                placeholder="Por ejemplo: La última cuota del puente"
                                spellCheck={false}
                                value={titulo}
                                onChange={(evento) => setTitulo(evento.target.value)}
                                ref={entradaRef}
                            />
                            <button type="submit" id="escribir" disabled={ocupado}>
                                {ocupado ? 'Escribiendo…' : 'Escribir los tres'}
                            </button>
                        </div>
                        <p className="forma__nota" id="nota-forma" data-error={notaError ? 'true' : 'false'}>
                            {nota}
                        </p>
                        {avisoCatalogo ? (
                            <p className="forma__nota" data-error="true">
                                {avisoCatalogo}
                            </p>
                        ) : null}
                    </form>

                    {historial.length > 0 ? (
                        <div className="recientes" id="recientes">
                            <span className="recientes__rotulo">Títulos recientes</span>
                            <div className="recientes__lista" id="recientes-lista">
                                {historial.map((corrida) => (
                                    <button
                                        key={`${corrida.titulo}-${corrida.fecha}`}
                                        type="button"
                                        className="chip"
                                        title="Volver a leer estos cuentos"
                                        onClick={() => restaurar(corrida)}
                                    >
                                        {corrida.titulo}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </header>

            <main className="tablero" id="tablero" aria-live="polite">
                {estilos.map((estilo) => (
                    <Cuento
                        key={estilo.id}
                        estilo={estilo}
                        datos={tarjetas[estilo.id] ?? tarjetaEnEspera()}
                        onRegenerar={() => regenerar(estilo)}
                    />
                ))}
            </main>

            <footer className="pie">
                <p>
                    Tres poéticas: <strong>La concordancia de las manos</strong> ·{' '}
                    <strong>El realismo a plazos</strong> · <strong>El realismo polifrecuencial</strong>
                </p>
                <p className="pie__motor" id="pie-motor">
                    Motor: {motor} · tres manifiestos cargados
                </p>
                <button className="enlace" id="imprimir" type="button" onClick={() => window.print()}>
                    Imprimir los tres cuentos
                </button>
            </footer>
        </>
    );
}
