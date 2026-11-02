"""Serve Forge locally without installing additional packages.

    python serve.py            # serve on http://127.0.0.1:8000
    python serve.py --open     # also open the browser (used by the launchers)

Progress is stored per browser address, so the launchers always use the same
address. If Forge is already running, --open just opens it again.
"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from functools import partial
import argparse
import sys
import threading
import urllib.request
import webbrowser


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def end_headers(self):
        # index.html holds FORGE_VERSION, so the browser must always check for a new copy.
        if self.path.split("?")[0] in ("/", "/index.html"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def forge_already_running(url):
    try:
        with urllib.request.urlopen(url, timeout=1.5) as response:
            return b"Forge" in response.read(4000)
    except Exception:
        return False


def main():
    parser = argparse.ArgumentParser(description="Run the Forge app locally")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--open", action="store_true", help="open Forge in your browser")
    args = parser.parse_args()
    url = f"http://127.0.0.1:{args.port}/"
    directory = Path(__file__).resolve().parent / "dist"
    handler = partial(QuietHandler, directory=str(directory))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError:
        if forge_already_running(url):
            print(f"Forge is already running at {url}", flush=True)
            if args.open:
                webbrowser.open(url)
            return 0
        print(f"Port {args.port} is being used by another program.", flush=True)
        print("Close that program and try again. (Forge keeps your progress at this", flush=True)
        print("exact address, so a different port would start with empty progress.)", flush=True)
        return 1
    print(f"Forge is running at {url}", flush=True)
    print("Keep this window open while you practice. Close it (or press Ctrl+C) to stop.", flush=True)
    if args.open:
        threading.Timer(0.6, webbrowser.open, args=(url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
