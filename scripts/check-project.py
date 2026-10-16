#!/usr/bin/env python3
"""Check local asset paths, GLB integrity, offline embedding and portability."""
import base64
import gzip
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import struct
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.resources = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, "Duplicate DOM ID: " + attrs["id"]
            self.ids.add(attrs["id"])
        if tag == "script" and "src" in attrs:
            self.resources.append(attrs["src"])
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.resources.append(attrs["href"])


def main():
    index = (ROOT / "index.html").read_text(encoding="utf-8")
    page = Page()
    page.feed(index)
    for resource in page.resources:
        url = urlsplit(resource)
        assert not url.scheme and not url.netloc and not url.path.startswith("/"), "Nonportable dependency: " + resource
        path = (ROOT / unquote(url.path)).resolve()
        assert path.is_relative_to(ROOT) and path.is_file(), "Missing asset: " + resource
    packed = (ROOT / "assets/cobalt-mobile.glb.gz").read_bytes()
    model = gzip.decompress(packed)
    magic, version, length = struct.unpack_from("<4sII", model)
    assert magic == b"glTF" and version == 2 and length == len(model), "Invalid GLB header"
    json_length, chunk_type = struct.unpack_from("<II", model, 12)
    assert chunk_type == 0x4E4F534A, "Missing GLB JSON chunk"
    gltf = json.loads(model[20:20 + json_length])
    for item in gltf.get("buffers", []) + gltf.get("images", []):
        uri = item.get("uri", "")
        assert not uri or uri.startswith("data:"), "The model requests an external file"
    single = (ROOT / "cobalt.html").read_text(encoding="utf-8")
    offline = Page()
    offline.feed(single)
    assert not offline.resources, "Offline HTML still depends on external scripts/styles"
    match = re.search(r'<script id="cobaltGlb" type="application/octet-stream">([^<]+)</script>', single)
    assert match and base64.b64decode(match[1]) == packed, "Embedded model differs from the local GLB"
    assert single.index('id="cobaltGlb"') < single.index("/* Imported Cobalt viewer."), "Model data appears after the loader"
    assert 'user-scalable=no' not in index, "Browser zoom is blocked"
    forbidden = ("stillfairy1.chatgpt.site", "/workspace/", "appgprj_", "oaiapp_")
    for path in [ROOT / "index.html", *ROOT.glob("assets/**/*.js"), *ROOT.glob("assets/**/*.css")]:
        text = path.read_text(encoding="utf-8")
        assert not any(word in text for word in forbidden), "Private hosting reference: " + str(path.relative_to(ROOT))
    assert not (ROOT / ".openai").exists(), "Export contains private hosting metadata"
    print(f"PASS: {len(page.resources)} local resources; {len(page.ids)} unique HTML IDs; embedded GLB {len(packed):,} bytes")


if __name__ == "__main__":
    main()
