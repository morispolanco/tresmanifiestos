"""Publica Tres Manifiestos en la cuenta de AppDeploy que paga (mp@ufm.edu).

Armado con lo que importa:
  * los archivos propios van completos (content)
  * los de plantilla NO se reenvian: index.html va por diffs anclados
  * tests/tests.json va completo, es la excepcion documentada

Uso:
    python desplegar.py                 -> manifiesto + subida + publicacion + espera
    python desplegar.py --solo-manifiesto
    python desplegar.py --solo-subida
"""
import json, pathlib, subprocess, sys, time

import plus

ROOT = pathlib.Path(__file__).resolve().parent
MANIFEST = ROOT / "manifiesto.json"

NOMBRE = "Tres Manifiestos"
DESCRIPCION = (
    "Un titulo entra; tres cuentos salen: la aplicacion escribe el mismo cuento tres veces, "
    "cada una sometida a las pautas de un manifiesto literario distinto."
)
FEATURES = ["api", "ai.generate"]

# Archivos propios: van enteros.
PROPIOS = [
    "src/App.tsx",
    "src/Cuento.tsx",
    "src/tipos.ts",
    "src/manifiestos.ts",
    "src/util.ts",
    "src/index.css",
    "backend/index.ts",
    "backend/manifiestos.ts",
]

# index.html es de plantilla: solo el encabezado cambia.
DIFS_INDEX = [
    {"from": '<html lang="en">', "to": '<html lang="es">'},
    {
        "from": "    <title>APP_TITLE</title>",
        "to": (
            "    <title>Tres Manifiestos · un título, tres poéticas</title>\n"
            '    <meta name="description" content="Escribe un título y la aplicación escribe el cuento '
            'tres veces: según La concordancia de las manos, El realismo a plazos y El realismo polifrecuencial.">\n'
            "    <link rel=\"icon\" href=\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' "
            "viewBox='0 0 100 100'><text y='.9em' font-size='90'>✍</text></svg>\">"
        ),
    },
]


def armar_manifiesto():
    archivos = []
    for rel in PROPIOS:
        ruta = ROOT / rel
        if not ruta.exists():
            raise SystemExit(f"falta {rel}")
        archivos.append({"filename": rel, "content": ruta.read_text(encoding="utf8")})

    archivos.append({"filename": "index.html", "diffs": DIFS_INDEX})
    archivos.append({"filename": "tests/tests.json", "content": (ROOT / "tests/tests.json").read_text(encoding="utf8")})

    manifiesto = {"files": archivos}
    MANIFEST.write_text(json.dumps(manifiesto, ensure_ascii=False, indent=1), encoding="utf8")
    print("manifiesto:", MANIFEST, MANIFEST.stat().st_size // 1024, "KB", "|", len(archivos), "archivos")
    for a in archivos:
        que = "diffs" if "diffs" in a else f"{len(a['content'])//1024} KB"
        print("   -", a["filename"], "->", que)
    # El JSON tiene que ser valido: el servidor lo lee tal cual.
    json.loads(MANIFEST.read_text(encoding="utf8"))
    return manifiesto


if __name__ == "__main__":
    armar_manifiesto()
    if "--solo-manifiesto" in sys.argv:
        raise SystemExit(0)

    plus.iniciar()
    apps_antes = plus.tool("get_apps")
    print("cuenta:", len(apps_antes.get("apps", [])), "apps (la que paga)")

    print("subiendo el manifiesto...")
    up = plus.tool("upload_assets", {}, timeout=300)
    upload_id = up.get("upload_id") or up.get("id")
    upload_url = up.get("upload_url") or up.get("url")
    print("   upload_id:", upload_id)
    if not upload_url or not upload_id:
        print("   respuesta:", json.dumps(up)[:400])
        raise SystemExit(3)

    r = subprocess.run(
        ["curl", "-s", "-o", "NUL", "-w", "%{http_code}", "-X", "PUT", upload_url,
         "-F", f"payload=@{MANIFEST.as_posix()};type=application/json"],
        capture_output=True, text=True,
    )
    print("   PUT ->", r.stdout.strip() or r.stderr[:200])
    if not (r.stdout or "").startswith("2"):
        raise SystemExit(4)
    if "--solo-subida" in sys.argv:
        print("(modo prueba: no se publica nada)")
        raise SystemExit(0)

    print("publicando...")
    dep = plus.tool("deploy_app", {
        "app_id": None,
        "app_name": NOMBRE,
        "app_type": "frontend+backend",
        "description": DESCRIPCION,
        "features": FEATURES,
        "frontend_template": "react-vite",
        "initiator": "user",
        "intent": "primer despliegue de Tres Manifiestos (portado de la app local a AppDeploy)",
        "model": "chat",
        "type": "feature",
        "upload_id": upload_id,
    }, timeout=300)
    print("   deploy:", json.dumps(dep, ensure_ascii=False)[:600])
    app_id = dep.get("app_id") or (dep.get("data") or {}).get("app_id")
    if not app_id:
        raise SystemExit(5)
    (ROOT / "app_id.txt").write_text(str(app_id), encoding="utf8")
    print("   app_id:", app_id)

    print("esperando a 'ready'...")
    for i in range(60):
        time.sleep(8)
        st = plus.tool("get_app_status", {"app_id": app_id, "limit": 40})
        estado = (st.get("deployment") or {}).get("status") or st.get("status")
        print(f"   [{i}] {estado}")
        if estado in ("ready", "failed", "error"):
            (ROOT / "estado-final.json").write_text(json.dumps(st, ensure_ascii=False, indent=1), encoding="utf8")
            print("   guardado en estado-final.json")
            break
    print("app_id:", app_id)
