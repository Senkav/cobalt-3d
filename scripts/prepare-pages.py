#!/usr/bin/env python3
"""Copy the public website into the ignored _site directory."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parent.parent
target = ROOT / "_site"
if target.exists():
    shutil.rmtree(target)
target.mkdir()
for name in ("index.html", "cobalt.html", ".nojekyll", "THIRD_PARTY_NOTICES.md"):
    shutil.copy2(ROOT / name, target / name)
for name in ("assets", "licenses"):
    shutil.copytree(ROOT / name, target / name)
print("Prepared _site for GitHub Pages")
