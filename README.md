# Tres Manifiestos

**Un título entra; tres cuentos salen.**

Escribes un solo dato —el título— y la aplicación escribe el cuento tres veces.
Cada versión se somete a las pautas de un manifiesto literario distinto, sin que
el lector tenga que elegir estilo, longitud, tono ni nada más: las reglas las
ponen los manifiestos.

| # | Poética | Mecanismo que la gobierna |
|---|---------|---------------------------|
| I | **La concordancia de las manos** | Dos discordancias con reglas opuestas: «Yo» + verbo en plural (ejecución compartida) y «Nosotros» + verbo en singular (representación individual). |
| II | **El realismo a plazos** | Aquí todo llega antes de pagarse: cuota inicial, libreta, cobrador, manda, condonación y la columna que no se apunta. |
| III | **El realismo polifrecuencial** | Estratigrafía narrativa: cláusula de interferencia, léxico de tracción mixta y causalidad suspendida entre el ánima, el expediente y la antena. |

Al final, cada tarjeta muestra su **colofón**, calcado del gesto con que los
propios manifiestos cierran sus piezas de muestra:

- `Discordancias: «…» (ejecución compartida); «…» (representación individual).`
- `Plazos en funcionamiento: 5, 9 y 10.`
- `Estratos: comunal / notarial / algorítmico. Cláusulas de interferencia: 7. Causalidad: suspendida.`

**App en vivo:** <https://tres-manifiestos-7faz2v.v2.appdeploy.ai/>

---

## Qué es este repositorio

La aplicación publicada en **AppDeploy** (frontend React + Vite, backend en
TypeScript). Es la versión desplegable del proyecto: un solo título dispara tres
escrituras en paralelo —una por manifiesto— y cada tarjeta aparece cuando su
manifiesto termina. Las tres tardan juntas unos 13 segundos.

```
backend/
  index.ts          rutas: catálogo, salud y POST /api/cuento (una escritura por manifiesto)
  manifiestos.ts    los tres manifiestos destilados en directrices ejecutables + separador de colofón
src/
  App.tsx           cabecera, formulario, tablero, títulos recientes, pie
  Cuento.tsx        la tarjeta de un cuento: estados, párrafos, colofón, acciones
  manifiestos.ts    catálogo tal como se pinta (copia de respaldo si el servidor no responde)
  tipos.ts          formas compartidas
  util.ts           palabras, markdown, descarga .md, historial en el navegador
  index.css         papel, tinta y tres acentos (mismas clases del diseño original)
tests/tests.json    las pruebas que la plataforma ejecuta al publicar
local/              pruebas del backend sin plataforma y sin gastar créditos
pruebas/navegador/  prueba de extremo a extremo contra la app publicada
plus.py             cliente JSON-RPC de la cuenta de AppDeploy (refresca su token solo)
desplegar.py        arma el manifiesto, sube y publica
LEEME-DEPLOY.md     el runbook: cómo volver a publicar y cómo verificar
```

## La API

| Ruta | Qué hace |
|------|----------|
| `GET /api/_healthcheck` | latido |
| `GET /api/salud` | latido con el motor y el número de estilos |
| `GET /api/manifiestos` | el catálogo: los tres manifiestos tal como se pintan |
| `POST /api/cuento` | `{titulo, estilo}` → `{cuerpo, colofon, palabras, segundos, aviso}` |

`estilo` es `concordancia`, `plazos` o `polifrecuencial`. Sin título, o con un
estilo que no existe, la respuesta es un 400 que nombra el campo.

## Trabajar en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build real de Vite
npx tsc -p tsconfig.check.json    # tipos de src + backend
```

El backend usa el SDK de la plataforma (`@appdeploy/sdk`), que solo existe en el
despliegue. Para revisar su lógica sin plataforma y sin gastar créditos:

```bash
npx --yes esbuild backend/index.ts --bundle --format=esm --platform=node \
  --outfile=local/backend.bundle.mjs --alias:@appdeploy/sdk=./local/sdk-local.mjs
node local/prueba-backend.mjs      # debe imprimir «Todo bien»
```

Y la prueba de extremo a extremo contra la app ya publicada (escribe de verdad,
con IA; necesita Chrome instalado):

```bash
cd pruebas/navegador && npm install && node e2e.mjs
```

## Publicar

```bash
python desplegar.py                 # manifiesto + subida + publicación + espera
python desplegar.py --solo-subida    # prueba el pipeline sin publicar
```

Los pasos, los archivos que se envían y los que nunca se envían están en
[`LEEME-DEPLOY.md`](LEEME-DEPLOY.md).

## Sobre el texto

La poética vive entera en `backend/manifiestos.ts`: cada manifiesto está
traducido a reglas de composición (mecanismo central, procedimientos
obligatorios, mundo y escena, registro, prohibiciones y formato del colofón). El
servidor no decide nada literario: solo transporta.
