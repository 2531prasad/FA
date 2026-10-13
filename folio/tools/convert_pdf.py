"""PDF-only MarkItDown worker. Reads bytes from stdin; never opens URLs or plugins."""
import io
import json
import sys
from importlib.metadata import version

MAX_PDF = 25 * 1024 * 1024
MAX_MARKDOWN = 2 * 1024 * 1024


def respond(value):
    sys.stdout.buffer.write(json.dumps(value, ensure_ascii=False).encode("utf-8"))


def main():
    try:
        import onnxruntime
        onnxruntime.disable_telemetry_events()
        from markitdown.converters import PdfConverter
        from markitdown import StreamInfo
        import pdfminer.high_level
    except ImportError:
        respond({"error": "PDF conversion needs local setup. See the PDF converter section in README.md.", "code": "setup"})
        return
    if sys.argv[1:] == ["--check"]:
        respond({"ready": True, "version": version("markitdown")})
        return
    data = sys.stdin.buffer.read(MAX_PDF + 1)
    if len(data) > MAX_PDF or not data.startswith(b"%PDF-"):
        respond({"error": "Choose a valid PDF up to 25 MiB.", "code": "invalid"})
        return
    try:
        # Only this converter runs: no auto-detection, URL fetching, AI or plugins.
        result = PdfConverter().convert(io.BytesIO(data), StreamInfo(extension=".pdf", mimetype="application/pdf"))
        markdown = result.text_content
        if not markdown.strip():
            respond({"error": "No readable text was found. This PDF may be scanned; this local converter does not perform OCR.", "code": "empty"})
        elif len(markdown.encode("utf-8")) > MAX_MARKDOWN:
            respond({"error": "The extracted Markdown exceeds 2 MiB. Split the PDF into smaller files.", "code": "large"})
        else:
            respond({"markdown": markdown, "version": version("markitdown")})
    except Exception:
        respond({"error": "This PDF could not be read. It may be damaged or password-protected. Try an unlocked PDF with selectable text.", "code": "invalid"})


if __name__ == "__main__":
    main()
