"""Open the local dictionary and editor on their existing browser origin."""

from __future__ import annotations

import hashlib
import posixpath
import socket
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.parse import unquote, urlsplit
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parent
PORT = 8080
BASE_URL = f"http://localhost:{PORT}"
HEALTH_PATH = "/__sousaku_dictionary_health__"
PROJECT_ID = hashlib.sha256(str(ROOT).casefold().encode("utf-8")).hexdigest()[:16]
HEALTH_BODY = f"sousaku-dictionary:{PROJECT_ID}".encode("ascii")


class LocalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: object, **kwargs: object) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        path = posixpath.normpath(unquote(urlsplit(self.path).path))
        if path == HEALTH_PATH:
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=ascii")
            self.send_header("Content-Length", str(len(HEALTH_BODY)))
            self.end_headers()
            self.wfile.write(HEALTH_BODY)
        elif path == "/":
            self.send_response(302)
            self.send_header("Location", "/docs/")
            self.end_headers()
        elif path in ("/docs", "/local-editor") or path.startswith(("/docs/", "/local-editor/")):
            super().do_GET()
        else:
            self.send_error(404, "Not found")

    def do_HEAD(self) -> None:
        path = posixpath.normpath(unquote(urlsplit(self.path).path))
        if path in ("/docs", "/local-editor") or path.startswith(("/docs/", "/local-editor/")):
            super().do_HEAD()
        else:
            self.send_error(404, "Not found")


class LocalServer(ThreadingHTTPServer):
    address_family = socket.AF_INET6
    daemon_threads = True


def already_running() -> bool:
    try:
        with urlopen(f"{BASE_URL}{HEALTH_PATH}", timeout=1) as response:
            return response.read() == HEALTH_BODY
    except (OSError, URLError):
        return False


def open_pages() -> None:
    viewer = f"{BASE_URL}/docs/"
    print(f"辞書: {viewer}")
    webbrowser.open(viewer, new=2)
    if (ROOT / "local-editor" / "index.html").exists():
        editor = f"{BASE_URL}/local-editor/"
        print(f"編集: {editor}")
        webbrowser.open(editor, new=2)


def main() -> int:
    try:
        server = LocalServer(("::1", PORT), LocalHandler)
    except OSError:
        if already_running():
            print("創作文法辞書は既に起動しています。ページを開きます。")
            open_pages()
            return 0
        print("ポート8080を別のツールが使用中です。")
        print("そのツールを停止してから、もう一度このファイルを開いてください。")
        print("下書きを守るため、自動で別ポートには切り替えません。")
        return 1

    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        if not already_running():
            print("localhost:8080 を確認できません。別のツールが応答している可能性があります。")
            return 1
        open_pages()
        print("このウィンドウを閉じるとローカルページは停止します。")
        while worker.is_alive():
            worker.join(timeout=0.5)
    except KeyboardInterrupt:
        print("\nローカルページを停止しました。")
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
