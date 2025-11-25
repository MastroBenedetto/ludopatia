from http.server import BaseHTTPRequestHandler
import json
import traceback

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self._handle_request()
    
    def do_POST(self):
        self._handle_request()
    
    def _handle_request(self):
        print("=== lotto handler invoked ===")
        print(f"Method: {self.command}")
        
        try:
            import requests
        except Exception as e:
            tb = traceback.format_exc()
            print("IMPORT ERROR:", str(e))
            print(tb)
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {
                "error": "ImportError",
                "details": str(e),
                "traceback": tb
            }
            self.wfile.write(json.dumps(error_response).encode())
            return
        
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
                print("Response not JSON; full preview (2000 chars):")
                print(resp.text[:2000])
                raise
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
            return
            
        except requests.exceptions.Timeout as e:
            tb = traceback.format_exc()
            print("Timeout:", str(e))
            print(tb)
            self.send_response(504)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {"error": "timeout", "details": str(e)}
            self.wfile.write(json.dumps(error_response).encode())
            return
            
        except requests.exceptions.HTTPError as e:
            tb = traceback.format_exc()
            status = getattr(e.response, "status_code", None)
            preview = e.response.text[:1000] if getattr(e, "response", None) else None
            print("HTTPError:", str(e))
            print(tb)
            self.send_response(502)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {
                "error": "upstream_http_error",
                "status": status,
                "preview": preview
            }
            self.wfile.write(json.dumps(error_response).encode())
            return
            
        except Exception as e:
            tb = traceback.format_exc()
            print("Unexpected error:", str(e))
            print(tb)
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            error_response = {
                "error": "internal",
                "details": str(e),
                "traceback": tb
            }
            self.wfile.write(json.dumps(error_response).encode())
            return