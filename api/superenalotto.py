from flask import Response
import requests
import json


def superenalotto():
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
        return jsonify({"error": f"HTTP error: {str(e)}"}), 500

    try:
        soup = BeautifulSoup(response.text, 'html.parser')

        # --- 6 numeri principali ---
        vincenti = soup.find('h4', string='Combinazione Vincente')
        if not vincenti:
            raise ValueError("Combinazione Vincente non trovata")
        num_princ = [span.get_text(strip=True) for span in vincenti.find_next('p', class_='IntBordo').find_all('span')]
        if len(num_princ) != 6:
            raise ValueError("Numeri principali non completi")

        # --- Jolly ---
        jolly_h4 = soup.find('h4', string='Numero Jolly')
        if not jolly_h4:
            raise ValueError("Jolly non trovato")
        jolly = jolly_h4.find_next('p', class_='IntBordo').find('span').get_text(strip=True)

        # --- SuperStar ---
        superstar_h4 = soup.find('h4', string='Numero SuperStar estratto')
        if not superstar_h4:
            raise ValueError("SuperStar non trovata")
        superstar = superstar_h4.find_next('p', class_='IntBordo').find('span').get_text(strip=True)

        # Unisci tutti e 8 i numeri
        tutti_numeri = num_princ + [jolly, superstar]

        return jsonify({
            "numeri": tutti_numeri  # es. ["29", "47", "2", "8", "59", "65", "86", "26"]
        })

    except Exception as e:
        return jsonify({"error": f"Parsing error: {str(e)}"}), 500