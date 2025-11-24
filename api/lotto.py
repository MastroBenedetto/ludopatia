import json
import requests
import traceback

# Vercel Python serverless expects una funzione "handler(request)"
def handler(request):
    """
    Riceve la request (oggetto Vercel). Restituisce un dict con statusCode, headers e body.
    Effettua una POST al servizio lotto-italia, con logging su stdout (vedi Vercel -> Functions -> Logs).
    """
    url = "https://www.lotto-italia.it/gdl/estrazioni-e-vincite/estrazioni-del-lotto.json"
    headers = {
        "Referer": "https://www.lotto-italia.it/lotto/estratti-ruote",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; VercelFunction/1.0)"
    }

    # Log request in entrata (utile per debug)
    try:
        print("=== lotto handler invoked ===")
        try:
            method = request.method
        except Exception:
            method = "UNKNOWN"
        print(f"Incoming request method: {method}")
        # non loggare tutto l'header in produzione, ma utile in fase di debug:
        try:
            print(f"Incoming headers (some): {dict(list(request.headers.items())[:10])}")
        except Exception:
            pass
    except Exception:
        pass

    # payload di esempio (in locale probabilmente fornivi data diversa)
    payload = {"data": "20251125"}

    try:
        print(f"Posting to {url} with payload: {payload}")
        resp = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"Remote status: {resp.status_code}")
        # mostra un'anteprima del body per capire la risposta (max 200 chars)
        text_preview = resp.text[:200].replace("\n", " ")
        print(f"Remote body preview: {text_preview} {'...' if len(resp.text) > 200 else ''}")

        resp.raise_for_status()

        # Prova a parsare json
        try:
            data = resp.json()
        except ValueError as e:
            # la risposta non è JSON: log completo (con attenzione)
            print("Response is not JSON. Full text (truncated 2000 chars):")
            print(resp.text[:2000])
            raise

        # Success: ritorna JSON al client
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(data)
        }

    except requests.exceptions.Timeout as e:
        tb = traceback.format_exc()
        print("Timeout error:", str(e))
        print(tb)
        return {
            "statusCode": 504,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Timeout contacting remote service", "details": str(e)})
        }

    except requests.exceptions.HTTPError as e:
        tb = traceback.format_exc()
        print("HTTP error while fetching remote:", str(e))
        print(tb)
        # includi status e qualche dettaglio se possibile
        status = getattr(e.response, "status_code", None)
        preview = e.response.text[:500] if getattr(e, "response", None) is not None else None
        return {
            "statusCode": 502,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Upstream HTTP error", "status": status, "preview": preview})
        }

    except Exception as e:
        tb = traceback.format_exc()
        print("Unexpected error:", str(e))
        print(tb)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Internal server error", "details": str(e)})
        }
