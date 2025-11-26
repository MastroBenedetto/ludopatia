from http.server import BaseHTTPRequestHandler
import json
import requests
from datetime import datetime

from urllib.parse import urlparse, parse_qs

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
        
        # Parse URL per estrarre i parametri
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)
        
        # Estrai anno, mese, giorno dai parametri
        try:
            anno = query_params.get('anno', [None])[0]
            mese = query_params.get('mese', [None])[0]
            giorno = query_params.get('giorno', [None])[0]
            
            if anno and mese and giorno:
                # Formatta la data come YYYYMMDD
                data_str = f"{anno}{mese.zfill(2)}{giorno.zfill(2)}"
                print(f"Data ricevuta dai parametri: {data_str}")
            else:
                # Se mancano parametri, usa la data odierna
                data_str = datetime.now().strftime("%Y%m%d")
                print(f"Parametri mancanti, usando data odierna: {data_str}")
        except Exception as e:
            print(f"Errore nel parsing dei parametri: {e}")
            data_str = datetime.now().strftime("%Y%m%d")
            print(f"Usando data odierna: {data_str}")
        
        url = "https://www.lotto-italia.it/gdl/estrazioni-e-vincite/estrazioni-del-lotto.json"
        headers = {
            "Referer": "https://www.lotto-italia.it/lotto/estratti-ruote",
            "Content-Type": "application/json",
        }
        body = {"data": data_str}

        try:
            resp = requests.post(url, json=body, headers=headers, timeout=10)
            resp.raise_for_status()
            print(f"Risposta OK: {resp.status_code}, len={len(resp.text)}")
            return self._send_json(200, resp.json())
        except Exception as e:
            print(f"Errore richiesta lotto: {e}")
            return self._send_json(500, {"error": str(e)})