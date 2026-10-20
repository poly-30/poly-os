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

PORT = 5173
DIRECTORY = os.path.join(os.path.dirname(__file__), "poly-shell")

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
