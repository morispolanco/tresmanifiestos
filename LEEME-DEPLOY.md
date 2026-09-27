# Tres Manifiestos — publicado en AppDeploy

**App en vivo:** https://tres-manifiestos-7faz2v.v2.appdeploy.ai/
**app_id:** `tres-manifiestos-7faz2v`
**Cuenta:** mp@ufm.edu (la que PAGA, Plus). El token vive en
`C:/Users/DELL/equiform-plus/oauth-plus.json` y `plus.py` lo refresca solo.

La app original (servidor Node con DeepSeek en `http://localhost:4310`) sigue
intacta en `C:/Users/DELL/Downloads/tres-manifiestos` y se puede seguir usando.

---

## Cómo volver a desplegar un cambio

```bash
cd C:/Users/DELL/tres-manifiestos-appdeploy
python desplegar.py                  # manifiesto + subida + publicación + espera
python desplegar.py --solo-subida    # prueba el pipeline sin publicar
python plus.py apps                  # lista las apps de la cuenta que paga
```

El manifiesto (`manifiesto.json`) se arma solo con:
`src/App.tsx`, `src/Cuento.tsx`, `src/tipos.ts`, `src/manifiestos.ts`,
`src/util.ts`, `src/index.css`, `backend/index.ts`, `backend/manifiestos.ts`,
`tests/tests.json` (completo) e `index.html` (**por diffs**).

Los archivos de plantilla que NO se envían nunca: `package.json`,
`vite.config.ts`, `tsconfig.json`, `postcss.config.js`, `tailwind.config.js`,
`src/main.tsx`.

> **Antes de tocar nada en una app que ya existe:** `plus.py tool get_apps` para
> ver el estado y `get_app_versions` —el usuario también despliega por su lado—.
> El `app_id` de una app nueva NO viene en la respuesta de `deploy_app`: hay que
> leerlo de `get_apps` (la primera de la lista).

## Comprobaciones antes de publicar (sin gastar créditos)

```bash
npx tsc -p tsconfig.check.json         # tipos de src + backend
npm run build                          # build real de Vite
npx --yes esbuild backend/index.ts --bundle --format=esm --platform=node \
  --outfile=local/backend.bundle.mjs --alias:@appdeploy/sdk=./local/sdk-local.mjs
node local/prueba-backend.mjs          # lógica del backend con IA de mentira
```

## Comprobaciones en vivo (después de publicar)

```bash
API=https://api-v2.appdeploy.ai/app/tres-manifiestos-7faz2v/api
curl -s $API/_healthcheck
curl -s $API/manifiestos
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"titulo":"El puente","estilo":"plazos"}' $API/cuento
# negativos: sin título -> 400 nombrando el campo; estilo raro -> 400
```

Y la prueba de navegador de extremo a extremo (escribe de verdad con IA):

```bash
cd pruebas/navegador && node e2e.mjs
```

## Rutas del backend

| Ruta | Qué hace |
|------|----------|
| `GET /api/_healthcheck` | latido |
| `GET /api/salud` | latido con motor y número de estilos |
| `GET /api/manifiestos` | catálogo (los tres manifiestos tal como se pintan) |
| `POST /api/cuento` | `{titulo, estilo}` → `{cuerpo, colofon, palabras, segundos, aviso}` |

El motor es la IA de la plataforma (`ai.generate`, `thinkingMode: 'NONE'`), no
DeepSeek directo: cada cuento cuesta créditos de la cuenta (≈15-20 por cuento de
~1000 palabras; los tres en paralelo tardan ~13 s).

## Qué cambió respecto a la versión local

- No hay streaming SSE: cada tarjeta avisa «escribiendo · N s» y recibe el
  cuento completo (el tope de la plataforma es ~30 s por petición; hay un corte
  interno a 27 s que devuelve un error con texto en vez de una pantalla muda).
- Las tres escrituras salen en paralelo, una petición por tarjeta.
- El CSS y el HTML son los mismos (mismas clases e ids), portados a React.
- El historial de títulos recientes sigue viviendo en el navegador (localStorage).
