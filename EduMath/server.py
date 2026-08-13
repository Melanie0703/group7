"""
EduMath AI — 本地開發伺服器
執行方式：python server.py
預設網址：http://localhost:8080
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8888
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    """加上 CORS / 媒體相關 header，讓 YouTube iframe 等資源可正常載入"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        # 允許 iframe 嵌入（不設定 X-Frame-Options 限制）
        self.send_header("Cross-Origin-Embedder-Policy", "unsafe-none")
        self.send_header("Cross-Origin-Opener-Policy", "unsafe-none")
        super().end_headers()

    def log_message(self, format, *args):
        # 只印重要訊息，避免洗版
        if args and str(args[1]) not in ("200", "304"):
            super().log_message(format, *args)

def main():
    os.chdir(DIRECTORY)
    url = f"http://localhost:{PORT}/index.html"

    with socketserver.TCPServer(("", PORT), CORSHandler) as httpd:
        print("=" * 50)
        print("  EduMath AI 本地伺服器已啟動")
        print(f"  網址：{url}")
        print("  按 Ctrl+C 停止伺服器")
        print("=" * 50)
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n伺服器已停止。")

if __name__ == "__main__":
    main()
