#!/usr/bin/env python3
"""Make the English written into index.html match js/text.js.

Every translatable element on the home page carries data-i18n="key", and the text inside it
is the fallback shown before JavaScript runs - which is also what search engines and link
previews read. Change js/text.js and that inline copy silently goes stale: at one point the
page source still promised "€39 a shirt" days after the price came out.

Run this after any change to the English in js/text.js:

    python3 tools/sync-inline-copy.py

It rewrites the inside of each data-i18n element with the English from js/text.js, leaves
keys that text.js doesn't have alone, and prints what it changed.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT = ROOT / "js" / "text.js"
PAGE = ROOT / "index.html"


def english() -> dict:
    src = TEXT.read_text(encoding="utf-8")
    m = re.search(r'\n  "en": \{', src)
    if not m:
        sys.exit("js/text.js: no English block")
    i, depth = m.end(), 1
    while depth:
        c = src[i]
        depth += (c == "{") - (c == "}")
        i += 1
    block = src[m.end():i - 1]
    out = {}
    for mm in re.finditer(r'\n\s*("(?:[A-Za-z0-9_]+)")\s*:\s*("(?:[^"\\]|\\.)*")', block):
        out[json.loads(mm.group(1))] = json.loads(mm.group(2))
    return out


def sync(html: str, words: dict):
    tag = re.compile(r'<([a-zA-Z0-9]+)([^>]*\bdata-i18n="([A-Za-z0-9_]+)"[^>]*)>')
    out, pos, changed = [], 0, []
    while True:
        m = tag.search(html, pos)
        if not m:
            break
        name, key = m.group(1), m.group(3)
        if "/>" in m.group(0) or name.lower() in ("input", "img", "br", "meta"):
            out.append(html[pos:m.end()])
            pos = m.end()
            continue
        # find this element's own closing tag, counting nested tags of the same name
        i, depth = m.end(), 1
        pat = re.compile(r"</?%s\b" % re.escape(name), re.I)
        while depth:
            mm = pat.search(html, i)
            if not mm:
                sys.exit("unbalanced <%s> around %s" % (name, key))
            depth += -1 if mm.group(0).startswith("</") else 1
            i = mm.end()
        close = i - len(mm.group(0))
        inner = html[m.end():close]
        if key in words and inner != words[key]:
            out.append(html[pos:m.end()])
            out.append(words[key])
            changed.append(key)
            pos = close
        else:
            out.append(html[pos:close])
            pos = close
    out.append(html[pos:])
    return "".join(out), changed


def main():
    words = english()
    before = PAGE.read_text(encoding="utf-8")
    after, changed = sync(before, words)
    keys = len(re.findall(r'data-i18n(?:-ph)?="[A-Za-z0-9_]+"', before))
    if len(re.findall(r'data-i18n(?:-ph)?="[A-Za-z0-9_]+"', after)) != keys:
        sys.exit("refusing to write: the number of keys changed")
    PAGE.write_text(after, encoding="utf-8")
    print("%d English strings read, %d element(s) synced" % (len(words), len(changed)))
    for k in changed:
        print("  " + k)


if __name__ == "__main__":
    main()
