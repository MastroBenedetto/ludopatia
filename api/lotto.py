from http.server import BaseHTTPRequestHandler
import json
import requests
from datetime import datetime

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
        print("GET /lotto chiamato")
        url = "https://www.lotto-italia.it/gdl/estrazioni-e-vincite/estrazioni-del-lotto.json"
        headers = {
            "Referer": "https://www.lotto-italia.it/lotto/estratti-ruote",
            "Content-Type": "application/json",
        }

        # data dinamica YYYYMMDD
        data_str = datetime.now().strftime("%Y%m%d")
        body = {"data": data_str}
        print(f"Usando data: {data_str}")

        try:
            resp = requests.post(url, json=body, headers=headers, timeout=10)
            resp.raise_for_status()
            print(f"Risposta OK: {resp.status_code}, len={len(resp.text)}")
            return self._send_json(200, resp.json())
        except Exception as e:
            print(f"Errore richiesta lotto: {e}")
            return self._send_json(500, {"error": str(e)})
