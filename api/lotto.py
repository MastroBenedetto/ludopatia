# /api/lotto.py
import json
import traceback

def handler(request):
    # import dentro handler per intercettare errori di import e mostrarli nei log
    try:
        import requests
    except Exception as e:
        tb = traceback.format_exc()
        print("IMPORT ERROR:", str(e))
        print(tb)
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "ImportError", "details": str(e), "traceback": tb})
        }

    # Logging iniziale (compare nei logs di Vercel)
    print("=== lotto handler invoked ===")
    try:
        method = getattr(request, "method", "UNKNOWN")
        print(f"Incoming method: {method}")
        try:
            # stampa solo qualche header per non sovraccaricare i log
            headers_preview = dict(list(request.headers.items())[:10])
            print("Incoming headers (preview):", headers_preview)
        except Exception:
            pass
    except Exception:
        pass

    url = "https://www.lotto-italia.it/gdl/estrazioni-e-vincite/estrazioni-del-lotto.json"
    headers = {
        "Referer": "https://www.lotto-italia.it/lotto/estratti-ruote",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; VercelFunction/1.0)"
    }

    payload = {"data": "20251125"}

    try:
        print(f"Posting to {url} payload={payload}")
        resp = requests.post(url, json=payload, headers=headers, timeout=10)
        print("Remote status:", resp.status_code)
        preview = resp.text[:400].replace("\n", " ")
        print("Remote body preview:", preview + ("..." if len(resp.text) > 400 else ""))

        resp.raise_for_status()

        try:
            data = resp.json()
        except ValueError:
            # non è JSON: loggare parte di body ed errore
            print("Response not JSON; full preview (2000 chars):")
            print(resp.text[:2000])
            raise

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(data)
        }

    except requests.exceptions.Timeout as e:
        tb = traceback.format_exc()
        print("Timeout:", str(e))
        print(tb)
        return {"statusCode": 504, "headers": {"Content-Type": "application/json"}, "body": json.dumps({"error": "timeout", "details": str(e)})}

    except requests.exceptions.HTTPError as e:
        tb = traceback.format_exc()
        status = getattr(e.response, "status_code", None)
        preview = e.response.text[:1000] if getattr(e, "response", None) else None
        print("HTTPError:", str(e))
        print(tb)
        return {"statusCode": 502, "headers": {"Content-Type": "application/json"}, "body": json.dumps({"error": "upstream_http_error", "status": status, "preview": preview})}

    except Exception as e:
        tb = traceback.format_exc()
        print("Unexpected error:", str(e))
        print(tb)
        return {"statusCode": 500, "headers": {"Content-Type": "application/json"}, "body": json.dumps({"error": "internal", "details": str(e), "traceback": tb})}
