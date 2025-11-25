from http.server import BaseHTTPRequestHandler
import json
import requests

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
        print("GET /ritardatari-assoluti chiamato")
        url = "https://www.lotto-italia.it/gdl/statistiche/numeriRitardatariTop.json"
        headers = {
            "Referer": "https://www.lotto-italia.it/lotto/ritardatari-frequenti/ritardatari-assoluti",
            "accept": "application/json, text/plain, */*",
            "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
            "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
        }

        try:
            resp = requests.get(url, headers=headers, timeout=10)
            resp.raise_for_status()
            print("Risposta ritardatari-assoluti OK")
            return self._send_json(200, resp.json())
        except Exception as e:
            print(f"Errore ritardatari-assoluti: {e}")
            return self._send_json(500, {"error": str(e)})
