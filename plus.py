"""Cliente JSON-RPC para la cuenta que PAGA de AppDeploy (mp@ufm.edu).

El token OAuth vive en equiform-plus/oauth-plus.json y se refresca solo.
Los tools MCP de Hermes estan atados a la clave de la cuenta GRATIS, por eso
todo lo de esta app se habla a mano con este modulo.

Uso:
    python plus.py apps                 -> lista las apps de la cuenta
    python plus.py limites              -> get_deploy_instructions (cuota)
    python plus.py plantilla            -> guarda plantilla.md + sdk-ai.md
    python plus.py tool <nombre> [json] -> llama un tool y guarda la salida
"""
import json, os, pathlib, sys, time, urllib.parse, urllib.request

URL = "https://api-v2.appdeploy.ai/mcp"
TOKEN_URL = "https://api-v2.appdeploy.ai/mcp/token"
# El token de la cuenta que paga. Se puede apuntar a otro archivo con
# APPDEPLOY_TOKEN_FILE (por ejemplo, para otra cuenta de AppDeploy).
TOK_FILE = pathlib.Path(
    os.environ.get("APPDEPLOY_TOKEN_FILE", r"C:/Users/DELL/equiform-plus/oauth-plus.json")
)
ROOT = pathlib.Path(__file__).resolve().parent


def token_valido():
    """access_token vigente (refresca si esta por vencer)."""
    t = json.loads(TOK_FILE.read_text(encoding="utf8"))
    edad = time.time() - t.get("_obtenido", 0)
    if t.get("expires_in") and edad < int(t["expires_in"]) - 300:
        return t["access_token"]
    if not t.get("refresh_token"):
        raise SystemExit("token vencido y sin refresh_token: repetir oauth_plus.py")
    data = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": t["refresh_token"],
        "client_id": t.get("_client_id", ""),
    }).encode()
    req = urllib.request.Request(TOKEN_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    nuevo = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
    nuevo["_client_id"] = t.get("_client_id", "")
    nuevo["_obtenido"] = time.time()
    if nuevo.get("refresh_token") is None:
        nuevo["refresh_token"] = t["refresh_token"]
    TOK_FILE.write_text(json.dumps(nuevo, indent=1), encoding="utf8")
    print("   (token refrescado)")
    return nuevo["access_token"]


KEY = None
SID = None


def rpc(method, params=None, tries=4, timeout=180):
    global KEY, SID
    if KEY is None:
        KEY = token_valido()
    last = None
    for i in range(tries):
        try:
            body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method,
                               **({"params": params} if params else {})}).encode()
            req = urllib.request.Request(URL, data=body, method="POST")
            for k, v in {"Content-Type": "application/json",
                         "Accept": "application/json, text/event-stream",
                         "Authorization": "Bearer " + KEY}.items():
                req.add_header(k, v)
            if SID:
                req.add_header("Mcp-Session-Id", SID)
            r = urllib.request.urlopen(req, timeout=timeout)
            SID = r.headers.get("Mcp-Session-Id") or SID
            raw = r.read().decode("utf8", "replace")
            objs = []
            try:
                objs.append(json.loads(raw))          # JSON plano primero
            except Exception:
                for line in raw.splitlines():
                    if line.strip().startswith("data:"):
                        try:
                            objs.append(json.loads(line.strip()[5:].strip()))
                        except Exception:
                            pass
            return (objs[0] if objs else {"raw": raw[:400]})
        except Exception as e:
            last = e
            time.sleep(2 + 2 * i)
    return {"__err": str(last)}


def iniciar():
    rpc("initialize", {"protocolVersion": "2025-06-18", "capabilities": {},
                       "clientInfo": {"name": "hermes-tres-manifiestos", "version": "1"}})
    rpc("notifications/initialized", {})


def tool(name, args=None, timeout=180):
    res = rpc("tools/call", {"name": name, "arguments": args or {}}, timeout=timeout)
    if "error" in res:
        return {"__err": res["error"]}
    try:
        txt = res["result"]["content"][0]["text"]
    except Exception:
        return {"__err": str(res)[:400]}
    try:
        return json.loads(txt)
    except Exception:
        return {"__raw": txt}


if __name__ == "__main__":
    iniciar()
    cmd = sys.argv[1] if len(sys.argv) > 1 else "apps"
    if cmd == "apps":
        apps = tool("get_apps")
        lista = apps.get("apps", []) if isinstance(apps, dict) else []
        print(f"APPS EN LA CUENTA: {len(lista)}")
        for a in lista:
            print("  -", a["data"]["app_id"], "|", a["display"].get("status"), "|", a["display"].get("app_name"))
    elif cmd == "limites":
        ins = tool("get_deploy_instructions", {"model": "chat", "intent": "verificar cuota de la cuenta Plus",
                                              "description": "comprobacion antes de desplegar Tres Manifiestos"})
        print(json.dumps(ins)[:1500])
    elif cmd == "plantilla":
        t = tool("get_app_template", {"app_type": "frontend+backend", "frontend_template": "react-vite",
                                      "features": ["api", "ai.generate"]})
        (ROOT / "plantilla-raw.json").write_text(json.dumps(t, indent=1), encoding="utf8")
        print("plantilla ->", (ROOT / "plantilla-raw.json"), len(json.dumps(t)), "bytes")
        print("claves:", list(t.keys())[:20] if isinstance(t, dict) else type(t))
        s = tool("get_appdeploy_sdk_reference", {"feature": "ai.generate"})
        (ROOT / "sdk-ai-generate.json").write_text(json.dumps(s, indent=1), encoding="utf8")
        print("sdk ->", (ROOT / "sdk-ai-generate.json"), len(json.dumps(s)), "bytes")
    elif cmd == "tool":
        nombre = sys.argv[2]
        args = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
        out = tool(nombre, args)
        txt = json.dumps(out, indent=1)
        (ROOT / f"salida-{nombre}.json").write_text(txt, encoding="utf8")
        print(txt[:3000])
