#!/usr/bin/env python3
import http.server
import socketserver
import urllib.parse
import urllib.request
import os
import sys
import hashlib
import subprocess
import re

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8089
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.join(BASE_DIR, 'audio_cache')
os.makedirs(CACHE_DIR, exist_ok=True)

class AngelaTTSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/speak':
            self.send_response(200)
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
        else:
            super().do_HEAD()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/api/speak':
            self.handle_tts(parsed)
        else:
            super().do_GET()

    def handle_tts(self, parsed):
        query = urllib.parse.parse_qs(parsed.query)
        text = query.get('text', [''])[0].strip()
        lang = query.get('lang', [''])[0].strip()

        if not text:
            self.send_error(400, "Missing 'text' parameter")
            return

        # Auto-detect language if not specified
        if not lang:
            # Check for Bengali unicode range U+0980 to U+09FF
            if re.search(r'[\u0980-\u09FF]', text):
                lang = 'bn'
            else:
                lang = 'en'

        # Create cache key
        text_hash = hashlib.md5(f"{lang}_{text}".encode('utf-8')).hexdigest()
        cache_file = os.path.join(CACHE_DIR, f"{text_hash}.mp3")

        # Check if already cached
        if os.path.exists(cache_file) and os.path.getsize(cache_file) > 100:
            self.serve_audio_file(cache_file)
            return

        # Generate audio using Google TTS or macOS fallback
        audio_data = self.fetch_google_tts(text, lang)
        if not audio_data:
            audio_data = self.generate_macos_tts(text, lang)

        if audio_data:
            try:
                with open(cache_file, 'wb') as f:
                    f.write(audio_data)
            except Exception as e:
                print(f"Error caching audio: {e}", file=sys.stderr)

            self.send_response(200)
            self.send_header('Content-Type', 'audio/mpeg')
            self.send_header('Content-Length', str(len(audio_data)))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'public, max-age=86400')
            self.end_headers()
            self.wfile.write(audio_data)
        else:
            self.send_error(500, "TTS generation failed")

    def serve_audio_file(self, file_path):
        size = os.path.getsize(file_path)
        self.send_response(200)
        self.send_header('Content-Type', 'audio/mpeg')
        self.send_header('Content-Length', str(size))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'public, max-age=86400')
        self.end_headers()
        with open(file_path, 'rb') as f:
            self.wfile.write(f.read())

    def fetch_google_tts(self, text, lang):
        try:
            # Split into chunks of max 180 chars
            chunks = self.split_text(text, 180)
            combined_data = bytearray()

            for chunk in chunks:
                encoded = urllib.parse.quote(chunk)
                url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={lang}&client=tw-ob&q={encoded}"
                req = urllib.request.Request(url, headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                })
                with urllib.request.urlopen(req, timeout=6) as response:
                    combined_data.extend(response.read())

            return bytes(combined_data) if combined_data else None
        except Exception as e:
            print(f"Google TTS fetch failed: {e}", file=sys.stderr)
            return None

    def generate_macos_tts(self, text, lang):
        try:
            voice = 'Piya' if lang == 'bn' else 'Samantha'
            tmp_aiff = os.path.join(CACHE_DIR, 'tmp_voice.aiff')
            tmp_mp3 = os.path.join(CACHE_DIR, 'tmp_voice.mp3')

            # Run macOS say
            subprocess.run(['say', '-v', voice, '-o', tmp_aiff, text], check=True, timeout=5)
            # Convert to mp3 or aac/m4a using afconvert or lame/ffmpeg
            # Try ffmpeg or afconvert
            cmd = ['afconvert', '-f', 'm4af', '-d', 'aac', tmp_aiff, tmp_mp3]
            subprocess.run(cmd, check=True, timeout=5)

            if os.path.exists(tmp_mp3):
                with open(tmp_mp3, 'rb') as f:
                    data = f.read()
                try: os.remove(tmp_aiff)
                except: pass
                return data
        except Exception as e:
            print(f"macOS TTS generation failed: {e}", file=sys.stderr)
        return None

    def split_text(self, text, max_len=180):
        if len(text) <= max_len:
            return [text]
        # Split by punctuation
        sentences = re.split(r'([।!?,\n]+)', text)
        chunks = []
        current = ""
        for part in sentences:
            if len(current) + len(part) <= max_len:
                current += part
            else:
                if current.strip():
                    chunks.append(current.strip())
                current = part
        if current.strip():
            chunks.append(current.strip())
        return chunks if chunks else [text[:max_len]]

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AngelaTTSHandler) as httpd:
        print(f"Talking Angela Server with Human-like TTS running at http://localhost:{PORT}")
        httpd.serve_forever()
