from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
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
            
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"ciao")
        