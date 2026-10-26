#!/usr/bin/env python3
"""
Poly OS Interactive Preview Runner
Starts a lightweight local HTTP server and opens the Poly Shell in your browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import json
import urllib.parse

PORT = 5173
DIRECTORY = os.path.join(os.path.dirname(__file__), "poly-shell")
DAEMON_DIR = os.path.join(os.path.dirname(__file__), "poly-daemon")

if DAEMON_DIR not in sys.path:
    sys.path.insert(0, DAEMON_DIR)

try:
    import polyd
    daemon_config = polyd.load_config()
    daemon_manager = polyd.PolyLifecycleManager(config=daemon_config, dry_run=True)
except Exception as e:
    polyd = None
    daemon_manager = None

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path in ("/api/telemetry", "/api/status", "/telemetry"):
            if daemon_manager:
                body = json.dumps(daemon_manager.dump_status(), indent=2).encode('utf-8')
            else:
                body = b'{"error":"daemon_not_available"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if path in ("/api/zram/stats", "/zram/stats"):
            if daemon_manager:
                body = json.dumps(daemon_manager.zram.read_mm_stat().to_dict(), indent=2).encode('utf-8')
            else:
                body = b'{"error":"daemon_not_available"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if path in ("/api/zram/algorithm", "/zram/algorithm"):
            if daemon_manager and "set" in query:
                algo = query["set"][0].lower().strip()
                ok = daemon_manager.zram.set_algorithm(algo)
                body = json.dumps({"success": ok, "algorithm": daemon_manager.zram.algorithm, "zram": daemon_manager.zram.read_mm_stat().to_dict()}).encode('utf-8')
            elif daemon_manager:
                body = json.dumps({"algorithm": daemon_manager.zram.algorithm, "zram": daemon_manager.zram.read_mm_stat().to_dict()}).encode('utf-8')
            else:
                body = b'{"error":"daemon_not_available"}'
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path in ("/api/zram/algorithm", "/zram/algorithm"):
            length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(length).decode('utf-8') if length > 0 else "{}"
            try:
                data = json.loads(body_raw)
                algo = data.get("algorithm", "").lower().strip()
            except Exception:
                algo = ""

            if daemon_manager and algo in ("lz4", "zstd"):
                ok = daemon_manager.zram.set_algorithm(algo)
                body = json.dumps({"success": ok, "algorithm": daemon_manager.zram.algorithm, "zram": daemon_manager.zram.read_mm_stat().to_dict()}).encode('utf-8')
                status = 200
            else:
                body = b'{"error":"invalid_algorithm"}'
                status = 400

            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        super().do_POST()

if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def run():
    os.chdir(DIRECTORY)
    with ThreadingHTTPServer(("", PORT), Handler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=====================================================")
        print("       Poly OS Interactive Shell Running at:        ")
        print(f"               {url}                                ")
        print("=====================================================")
        print("Features to test in Poly Shell:")
        print("1. Drag windows -> flick to watch iOS spring momentum")
        print("2. Drag to screen top, left, right, or corners for Windows Aero Snap")
        print("3. Click the toggle button on the dock to switch between iOS Pill Dock and Windows Taskbar")
        print("4. Click top-right sliders icon to open iOS Control Center")
        print("5. Click 'Exposé' (or Ctrl+Tab) to see 3D workspace switcher")
        print("6. Watch top telemetry: background apps automatically freeze (polyd)")
        print("\nPress Ctrl+C to stop server.\n")
        
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down preview server.")

if __name__ == "__main__":
    run()
