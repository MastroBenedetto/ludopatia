from http.server import BaseHTTPRequestHandler
import json
import requests
from datetime import datetime
from urllib.parse import unquote

class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        print(f"GET {self.path} -> calendario-lotto")

        # Parsing path per eventuali parametri /calendario-lotto/2025/11
        parts = [p for p in self.path.split("/") if p != ""]
        anno = None
        mese = None
        # Trova l'indice di 'calendario-lotto' se presente
        if "calendario-lotto" in parts:
            idx = parts.index("calendario-lotto")
            # se ci sono due elementi in più, prendili
            if len(parts) > idx + 1:
                anno = unquote(parts[idx + 1])
            if len(parts) > idx + 2:
                mese = unquote(parts[idx + 2])

        # Se non forniti, usa data sistema
        if anno is None or mese is None:
            now = datetime.now()
            anno = str(now.year)
            mese = str(now.month).zfill(2)
        else:
            # validazione
            try:
                anno_int = int(anno)
                mese_int = int(mese)
                if not (2000 <= anno_int <= 2100) or not (1 <= mese_int <= 12):
                    raise ValueError("anno/mese fuori range")
                mese = str(mese_int).zfill(2)
                anno = str(anno_int)
            except Exception as e:
                print(f"Errore validazione anno/mese: {e}")
                return self._send_json(400, {"error": "Anno o mese non validi. Formato: /calendario-lotto/2025/11"})

        url = "https://www.lotto-italia.it/gdl/estrazioni-e-vincite/calendario-estrazioni-del-lotto.json"
        headers = {
            "Referer": "https://www.lotto-italia.it/lotto/estratti-ruote",
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

        body = {"anno": anno, "mese": mese}
        try:
            print(f"Invio POST calendario body={body}")
            resp = requests.post(url, json=body, headers=headers, timeout=10)
            resp.raise_for_status()
            print("Risposta calendario OK")
            return self._send_json(200, resp.json())
        except Exception as e:
            print(f"Errore calendario-lotto: {e}")
            return self._send_json(500, {"error": str(e)})
