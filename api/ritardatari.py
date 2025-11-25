from http.server import BaseHTTPRequestHandler
import json
import requests
from urllib.parse import unquote

class handler(BaseHTTPRequestHandler):
    VALID_RUOTE = ["BA", "NA", "Tutte", "CA", "RM", "FI", "PA", "GE", "TO", "MI", "VE", "RN"]

    def _send_json(self, status_code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        print(f"GET {self.path} -> ritardatari")
        # path possibili:
        # /api/ritardatari
        # /api/ritardatari/MI
        parts = [p for p in self.path.split("/") if p != ""]
        # cerca se c'è la ruota come ultimo segmento
        ruota = None
        if len(parts) >= 2 and parts[-2].lower() == "ritardatari":
            # es. parts[-1] potrebbe essere 'ritardatari' (no ruota) o 'MI' (ruota)
            if parts[-1].upper() != "RITARDATARI":
                ruota = unquote(parts[-1]).upper()
        elif len(parts) >= 1 and parts[-1].lower() == "ritardatari":
            ruota = None

        if ruota:
            if ruota not in self.VALID_RUOTE:
                msg = {"error": f"Ruota non valida. Ruote valide: {self.VALID_RUOTE}"}
                print(msg)
                return self._send_json(400, msg)
            lista_ruote = [ruota]
        else:
            lista_ruote = self.VALID_RUOTE

        url = "https://www.lotto-italia.it/gdl/statistiche/numeriRitardatari.json"
        headers = {
            "Referer": "https://www.lotto-italia.it/lotto/ritardatari-frequenti/ritardatari-ruota",
            "Content-Type": "application/json",
            "accept": "application/json, text/plain, */*",
            "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
            "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
        }

        body = {
            "evidenziazione": "NO_EVID",
            "listaRuote": lista_ruote
        }

        try:
            print(f"Invio POST a numeriRitardatari.json body={body}")
            resp = requests.post(url, json=body, headers=headers, timeout=10)
            resp.raise_for_status()
            print("Risposta ritardatari OK")
            return self._send_json(200, resp.json())
        except Exception as e:
            print(f"Errore ritardatari: {e}")
            return self._send_json(500, {"error": str(e)})
