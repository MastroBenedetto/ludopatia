from flask import Response
import requests
import json

def lotto(request):
    url = "https://www.lotto-italia.it/gdl/estrazioni-e-vincite/estrazioni-del-lotto.json"
    headers = {
        "Referer": "https://www.lotto-italia.it/lotto/estratti-ruote",
        "Content-Type": "application/json"
    }
    try:
        resp = requests.post(url, json={"data": "20251125"}, headers=headers, timeout=10)
        data = resp.json()
        return Response(json.dumps(data), mimetype='application/json')
    except Exception as e:
        return Response(json.dumps({"error": str(e)}), status=500, mimetype='application/json')