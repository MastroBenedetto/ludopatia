from http.server import BaseHTTPRequestHandler
import json
import requests
from bs4 import BeautifulSoup


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
        print("Richiesta GET ricevuta")

        url = (
            "https://www.adm.gov.it/portale/monopoli/giochi/giochi_num_total/"
            "superenalotto?p_p_id=it_sogei_wda_web_portlet_WebDisplayAamsPortlet"
            "&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage"
        )

        headers = {
            "accept": "*/*",
            "accept-language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "text/plain;charset=UTF-8",
            "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "Referer": "https://www.adm.gov.it/portale/monopoli/giochi/giochi_num_total/superenalotto",
        }

        # ---- HTTP REQUEST ----
        try:
            print("Invio richiesta a ADM...")
            resp = requests.post(url, data="", headers=headers, timeout=10)
            resp.raise_for_status()
            print("Risposta ADM OK")
        except Exception as e:
            print(f"Errore HTTP: {e}")
            return self._send_json(500, {"error": f"HTTP error: {str(e)}"})

        # ---- PARSING HTML ----
        try:
            soup = BeautifulSoup(resp.text, "html.parser")

            vincenti = soup.find("h4", string="Combinazione Vincente")
            if not vincenti:
                raise ValueError("Combinazione Vincente non trovata")

            p = vincenti.find_next("p", class_="IntBordo")
            num_princ = [s.get_text(strip=True) for s in p.find_all("span")]
            if len(num_princ) != 6:
                raise ValueError("Numeri principali incompleti")

            jolly = (
                soup.find("h4", string="Numero Jolly")
                .find_next("p", class_="IntBordo")
                .find("span")
                .get_text(strip=True)
            )

            superstar = (
                soup.find("h4", string="Numero SuperStar estratto")
                .find_next("p", class_="IntBordo")
                .find("span")
                .get_text(strip=True)
            )

            result = {"numeri": num_princ + [jolly, superstar]}
            print(result)
            return self._send_json(200, result)

        except Exception as e:
            print(f"Errore parsing: {e}")
            return self._send_json(500, {"error": f"Parsing error: {str(e)}"})
