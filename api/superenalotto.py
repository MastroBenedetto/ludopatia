import json
import requests
from bs4 import BeautifulSoup  # ✅ Import obbligatorio

def handler(request):
    url = "https://www.adm.gov.it/portale/monopoli/giochi/giochi_num_total/superenalotto?p_p_id=it_sogei_wda_web_portlet_WebDisplayAamsPortlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage"
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

    try:from http.server import BaseHTTPRequestHandler
import json
import requests
from bs4 import BeautifulSoup

class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        # CORS leggero per poter chiamare dall'index.html se vuoi
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        # log semplice (comparirà nei Logs di Vercel / vercel logs)
        print(f"Incoming GET request: path={self.path}")

        url = ("https://www.adm.gov.it/portale/monopoli/giochi/giochi_num_total/"
               "superenalotto?p_p_id=it_sogei_wda_web_portlet_WebDisplayAamsPortlet"
               "&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_cacheability=cacheLevelPage")
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

        try:
            print("Eseguo richiesta POST verso ADM...")
            resp = requests.post(url, data="", headers=headers, timeout=10)
            resp.raise_for_status()
            print(f"Risposta ricevuta: status_code={resp.status_code}, lunghezza={len(resp.text)}")
        except Exception as e:
            print(f"HTTP request error: {e}")
            return self._send_json(500, {"error": f"HTTP error: {str(e)}"})

        try:
            soup = BeautifulSoup(resp.text, 'html.parser')

            vincenti = soup.find('h4', string='Combinazione Vincente')
            if not vincenti:
                raise ValueError("Combinazione Vincente non trovata")

            p_intbord = vincenti.find_next('p', class_='IntBordo')
            if not p_intbord:
                raise ValueError("Elemento con class 'IntBordo' per combinazione vincente non trovato")

            num_princ = [span.get_text(strip=True) for span in p_intbord.find_all('span')]
            if len(num_princ) != 6:
                raise ValueError(f"Numeri principali non completi: trovati {len(num_princ)}")

            # Jolly
            jolly_h4 = soup.find('h4', string='Numero Jolly')
            if not jolly_h4:
                raise ValueError("Numero Jolly non trovato")
            jolly = jolly_h4.find_next('p', class_='IntBordo').find('span').get_text(strip=True)

            # SuperStar
            ss_h4 = soup.find('h4', string='Numero SuperStar estratto')
            if not ss_h4:
                raise ValueError("Numero SuperStar estratto non trovato")
            superstar = ss_h4.find_next('p', class_='IntBordo').find('span').get_text(strip=True)

            result = {"numeri": num_princ + [jolly, superstar]}
            print(f"Parsing OK - result: {result}")
            return self._send_json(200, result)

        except Exception as e:
            print(f"Parsing error: {e}")
            return self._send_json(500, {"error": f"Parsing error: {str(e)}"})

        response = requests.post(url, data="", headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": f"HTTP error: {str(e)}"})
        }

    try:
        soup = BeautifulSoup(response.text, 'html.parser')
        vincenti = soup.find('h4', string='Combinazione Vincente')
        if not vincenti:
            raise ValueError("Combinazione Vincente non trovata")
        num_princ = [span.get_text(strip=True) for span in vincenti.find_next('p', class_='IntBordo').find_all('span')]
        if len(num_princ) != 6:
            raise ValueError("Numeri principali non completi")

        jolly = soup.find('h4', string='Numero Jolly').find_next('p', class_='IntBordo').find('span').get_text(strip=True)
        superstar = soup.find('h4', string='Numero SuperStar estratto').find_next('p', class_='IntBordo').find('span').get_text(strip=True)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"numeri": num_princ + [jolly, superstar]})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": f"Parsing error: {str(e)}"})
        }