#!/usr/bin/env python3
"""Build the offline cobalt.html using Python's standard library."""
import argparse
import base64
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent


def render():
    html = (ROOT / "index.html").read_text(encoding="utf-8")

    def stylesheet(match):
        return "<style>" + (ROOT / match[1]).read_text(encoding="utf-8") + "</style>"

    def script(match):
        code = (ROOT / match[1]).read_text(encoding="utf-8")
        code = re.sub(r"</script", r"<\\/script", code, flags=re.IGNORECASE)
        return "<script>" + code + "</script>"

    html = re.sub(r'<link rel="stylesheet" href="\./([^"]+)">', stylesheet, html)
    html = re.sub(r'<script src="\./([^"]+)"></script>', script, html)
    marker = "<script>/* Imported Cobalt viewer."
    if html.count(marker) != 1:
        raise ValueError("The model loader marker is missing or duplicated")
    model = base64.b64encode((ROOT / "assets/cobalt-mobile.glb.gz").read_bytes()).decode("ascii")
    html = html.replace(marker, '<script id="cobaltGlb" type="application/octet-stream">' + model + "</script>\n" + marker)
    notices = "\n\n".join((ROOT / "licenses" / name).read_text(encoding="utf-8") for name in ("three-MIT.txt", "fflate-MIT.txt", "MODEL-ATTRIBUTION.txt"))
    notices = notices.replace("--", "- -")
    html = html.replace("<!DOCTYPE html>", "<!DOCTYPE html>\n<!--\nTHIRD-PARTY NOTICES\n" + notices + "\n-->", 1)
    return html


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check that cobalt.html matches the sources")
    args = parser.parse_args()
    target = ROOT / "cobalt.html"
    expected = render()
    if args.check:
        if not target.is_file() or target.read_text(encoding="utf-8") != expected:
            print("FAIL: cobalt.html is stale; run python scripts/build-standalone.py", file=sys.stderr)
            return 1
        print("PASS: cobalt.html matches the modular sources")
    else:
        target.write_text(expected, encoding="utf-8", newline="\n")
        print(f"Built cobalt.html ({target.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
