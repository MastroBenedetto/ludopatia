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

    try:
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