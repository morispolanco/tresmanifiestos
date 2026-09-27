import { Fragment, useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { EstiloVista, Tarjeta } from './tipos';
import { descargarArchivo, nombreArchivo, textoMarkdown } from './util';

/** Los `*así*` del cuento se leen como cursivas, igual que en los manifiestos. */
function enfasis(linea: string, clave: string): ReactNode[] {
    return linea.split(/\*([^*\n]+)\*/g).map((trozo, i) =>
        i % 2 === 1 ? <em key={`${clave}-${i}`}>{trozo}</em> : <Fragment key={`${clave}-${i}`}>{trozo}</Fragment>,
    );
}

/** Un cuento se pinta en párrafos; los saltos sueltos son de la misma escena. */
function Narracion({ texto }: { texto: string }) {
    const bloques = texto.split(/\n{2,}/).filter((b) => b.trim());
    return (
        <>
            {bloques.map((bloque, i) => (
                <p key={i}>
                    {bloque.split('\n').map((linea, j) => (
                        <Fragment key={j}>
                            {j > 0 ? <br /> : null}
                            {enfasis(linea, `${i}-${j}`)}
                        </Fragment>
                    ))}
                </p>
            ))}
        </>
    );
}

interface Props {
    estilo: EstiloVista;
    datos: Tarjeta;
    onRegenerar: () => void;
}

export default function Cuento({ estilo, datos, onRegenerar }: Props) {
    const [copiado, setCopiado] = useState(false);
    const [transcurridos, setTranscurridos] = useState(0);

    // Mientras el manifiesto escribe, el estado cuenta los segundos: en la
    // version local el cuento se veía llegar palabra por palabra; aquí el
    // único signo de vida posible es el reloj.
    useEffect(() => {
        if (datos.estado !== 'escribiendo') {
            setTranscurridos(0);
            return;
        }
        const marca = Date.now();
        const tic = setInterval(() => setTranscurridos(Math.round((Date.now() - marca) / 1000)), 500);
        return () => clearInterval(tic);
    }, [datos.estado]);

    useEffect(() => {
        if (!copiado) return;
        const t = setTimeout(() => setCopiado(false), 1600);
        return () => clearTimeout(t);
    }, [copiado]);

    const listo = datos.estado === 'listo' && Boolean(datos.cuerpo);

    const etiquetaEstado =
        datos.estado === 'escribiendo'
            ? `escribiendo · ${transcurridos} s`
            : datos.estado === 'listo'
              ? `${datos.palabras} palabras${datos.segundos ? ` · ${datos.segundos} s` : ''}`
              : datos.estado === 'error'
                ? 'interrumpido'
                : 'en espera';

    async function copiar() {
        const texto = [datos.titulo, '', datos.cuerpo, datos.colofon ? `\n*${datos.colofon}*` : '']
            .join('\n')
            .trim();
        try {
            await navigator.clipboard.writeText(texto);
            setCopiado(true);
        } catch {
            /* el navegador no dejó copiar: el botón no cambia */
        }
    }

    return (
        <article className="cuento" data-estilo={estilo.id} data-estado={datos.estado} style={{ '--acento': estilo.color } as CSSProperties}>
            <div className="cuento__filo" aria-hidden="true" />

            <header className="cuento__cabecera">
                <span className="cuento__numeral">{estilo.numeral}</span>
                <div className="cuento__identidad">
                    <h2 className="cuento__nombre">{estilo.nombre}</h2>
                    <p className="cuento__fuente">{estilo.fuente}</p>
                </div>
                <span className="estado" data-estado={datos.estado}>
                    <i className="punto" />
                    <span className="estado__texto">{etiquetaEstado}</span>
                </span>
            </header>

            <blockquote className="cuento__lema">«{estilo.lema}»</blockquote>
            <p className="cuento__mecanica">{estilo.mecanica}</p>

            <ul className="cuento__rasgos">
                {estilo.rasgos.map((rasgo) => (
                    <li key={rasgo}>{rasgo}</li>
                ))}
            </ul>

            <div className="cuento__cuerpo" data-vacio={listo ? 'false' : 'true'}>
                {listo ? (
                    <Narracion texto={datos.cuerpo} />
                ) : datos.estado === 'escribiendo' ? (
                    <span className="pensando">
                        <i />
                        <i />
                        <i /> leyendo el manifiesto…
                    </span>
                ) : datos.estado === 'error' ? (
                    <p className="cuento__vacio">El cuento no llegó a escribirse.</p>
                ) : (
                    <p className="cuento__vacio">El cuento aparecerá aquí.</p>
                )}
            </div>

            {datos.colofon ? (
                <div className="cuento__colofon">
                    <span className="cuento__colofon-rotulo">{estilo.etiquetaColofon}</span>
                    <span className="cuento__colofon-texto">{datos.colofon}</span>
                </div>
            ) : null}

            {datos.error ? (
                <div className="cuento__error" data-tipo="fallo">
                    {datos.error}
                </div>
            ) : null}

            {datos.aviso ? (
                <div className="cuento__error" data-tipo="aviso">
                    {datos.aviso}
                </div>
            ) : null}

            <footer className="cuento__acciones">
                <button type="button" data-accion="regenerar" onClick={onRegenerar}>
                    Volver a escribir
                </button>
                <button type="button" data-accion="copiar" disabled={!listo} onClick={copiar}>
                    {copiado ? 'Copiado' : 'Copiar'}
                </button>
                <button
                    type="button"
                    data-accion="descargar"
                    disabled={!listo}
                    onClick={() =>
                        descargarArchivo(
                            nombreArchivo(datos.titulo, `-${estilo.id}`),
                            textoMarkdown(datos.titulo, estilo.nombre, estilo.fuente, datos.cuerpo, datos.colofon),
                        )
                    }
                >
                    Descargar .md
                </button>
            </footer>
        </article>
    );
}
