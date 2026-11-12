#!/usr/bin/env python3
"""brutalist-slides command. Run ./bs help

Standard library only. Three commands (audit, shots, pdf) drive a real browser and need
Playwright; everything else, including the static check, runs without it.
"""
import argparse
import base64
import html
import json
import mimetypes
import os
import re
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path

VERSION = "0.1.0"
ROOT = Path(__file__).resolve().parent.parent
ENGINE = ROOT / "engine"
STYLES = ROOT / "styles"
FONTS = ROOT / "fonts"
D3_CDN = '<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js"></script>'
D3_VENDOR = ROOT / "vendor" / "d3.v7.9.0.min.js"
FLOOR_BODY, FLOOR_LABEL, MIN_CONTRAST = 40, 32, 4.5


# ----------------------------------------------------------------------------- colour
def luminance(hex_colour):
    h = hex_colour.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    chans = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in chans]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contrast(fg, bg):
    a, b = luminance(fg), luminance(bg)
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)


HEX = re.compile(r"#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b")


def norm_hex(h):
    h = h.upper()
    return "#" + "".join(c * 2 for c in h[1:]) if len(h) == 4 else h


# ----------------------------------------------------------------------------- styles
def style_ids():
    return sorted(p.name for p in STYLES.iterdir() if p.is_dir() and not p.name.startswith("_") and (p / "style.css").exists())


def default_style():
    for sid in style_ids():
        if load_style(sid)["meta"].get("default"):
            return sid
    return "northeastern"


def parse_tokens(css):
    """--bs-* custom properties from the first :root block."""
    m = re.search(r":root\s*\{(.*?)\}", css, re.S)
    body = re.sub(r"/\*.*?\*/", "", m.group(1), flags=re.S) if m else ""
    return {k: v.strip() for k, v in re.findall(r"--(bs-[a-z0-9-]+)\s*:\s*([^;]+);", body)}


def load_style(sid):
    d = STYLES / sid
    if not (d / "style.css").exists():
        sys.exit(f'No style named "{sid}". Styles here: {", ".join(style_ids())}. Make one with ./bs new-style <id>.')
    css = (d / "style.css").read_text()
    meta = json.loads((d / "style.json").read_text()) if (d / "style.json").exists() else {"id": sid, "name": sid}
    return {"id": sid, "dir": d, "css": css, "meta": meta, "tokens": parse_tokens(css)}


PAIRS = [  # (text token, ground token, what it is)
    ("bs-ink", "bs-ground", "text on a light slide"),
    ("bs-ink-soft", "bs-ground", "captions and sources on a light slide"),
    ("bs-accent", "bs-ground", "accent text on a light slide"),
    ("bs-ink", "bs-surface", "text on a panel"),
    ("bs-ink-soft", "bs-surface", "captions on a panel"),
    ("bs-accent", "bs-accent-tint", "accent text on the tint"),
    ("bs-dark-ink", "bs-dark-ground", "text on a dark slide"),
    ("bs-dark-ink-soft", "bs-dark-ground", "captions on a dark slide"),
    ("bs-dark-accent", "bs-dark-ground", "accent text on a dark slide"),
    ("bs-dark-ink", "bs-dark-surface", "text on a dark panel"),
    ("bs-on-accent", "bs-accent-ground", "text on a section divider"),
]
REQUIRED = sorted({t for p in PAIRS for t in p[:2]} | {
    "bs-rule", "bs-dark-rule", "bs-font-head", "bs-font-body", "bs-font-label", "bs-font-mono",
    "bs-claim-size", "bs-body-size", "bs-label-size", "bs-data-1", "bs-seq-1", "bs-seq-5"})


def style_findings(tokens):
    out = []
    for t in REQUIRED:
        if t not in tokens:
            out.append(("FAIL", "tokens", f"--{t} is not set."))
    for fg, bg, what in PAIRS:
        if fg in tokens and bg in tokens and HEX.fullmatch(tokens[fg]) and HEX.fullmatch(tokens[bg]):
            r = contrast(tokens[fg], tokens[bg])
            if r < MIN_CONTRAST:
                out.append(("FAIL", "contrast", f"--{fg} {tokens[fg]} on --{bg} {tokens[bg]} is {r:.2f}:1 ({what}); the floor is {MIN_CONTRAST}:1."))
    for name, floor in (("bs-body-size", FLOOR_BODY), ("bs-label-size", FLOOR_LABEL), ("bs-claim-size", FLOOR_BODY)):
        m = re.fullmatch(r"([\d.]+)px", tokens.get(name, ""))
        if m and float(m.group(1)) < floor:
            out.append(("FAIL", "type-size", f"--{name} is {m.group(1)} px; the floor is {floor} px."))
    for i in range(1, 6):
        t = f"bs-data-{i}"
        if t in tokens and "bs-ground" in tokens and HEX.fullmatch(tokens[t]):
            r = contrast(tokens[t], tokens["bs-ground"])
            if r < 3 and i <= 3:
                out.append(("WARN", "contrast", f"--{t} {tokens[t]} is {r:.2f}:1 on the ground: under the 3:1 a mark needs to be found."))
    return out


def data_uri(path):
    mime = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def style_block(style, logos_on=True):
    """The style's CSS, plus its logos as data URIs when the files are on this computer."""
    css = style["css"].rstrip() + "\n"
    logos = (style["meta"].get("logos") or {}) if logos_on else {}
    names = {"mark": "--bs-logo-mark", "mark-on-dark": "--bs-logo-mark-on-dark",
             "lockup": "--bs-logo-lockup", "lockup-on-dark": "--bs-logo-lockup-on-dark"}
    found = [(names[k], style["dir"] / v) for k, v in logos.items() if k in names and (style["dir"] / v).exists()]
    if found:
        css += "/* logos found in this style's logos folder, embedded so the deck is one file */\n:root{\n"
        css += "".join(f'  {var}:url("{data_uri(p)}");\n' for var, p in found) + "}\n"
    return css


def fonts_block(style, offline):
    f = style["meta"].get("fonts") or {}
    if offline:
        faces = []
        for face in f.get("local", []):
            p = FONTS / face["file"]
            if not p.exists():
                sys.exit(f"Font file missing: {p}")
            faces.append(f'@font-face{{font-family:"{face["family"]}";font-weight:{face["weight"]};font-style:{face["style"]};'
                         f'font-display:block;src:url("data:font/ttf;base64,{base64.b64encode(p.read_bytes()).decode()}") format("truetype")}}')
        return '<style id="bs-fonts">\n' + "\n".join(faces) + "\n</style>"
    if f.get("google"):
        return ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
                '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
                f'<link id="bs-fonts" rel="stylesheet" href="{html.escape(f["google"])}">')
    return ""


def d3_block(offline):
    if offline:
        if not D3_VENDOR.exists():
            sys.exit(f"D3 copy missing: {D3_VENDOR}")
        return "<script>\n" + D3_VENDOR.read_text() + "\n</script>"
    return D3_CDN


# ----------------------------------------------------------------------------- assemble
def swap(text, pattern, replacement):
    new, n = re.subn(pattern, lambda m: replacement, text, count=1, flags=re.S)
    return new, n


def set_block(text, tag, block_id, body):
    return swap(text, rf'(?<=<{tag} id="{block_id}">).*?(?=</{tag}>)', "\n" + body.rstrip() + "\n")


def set_marked(text, name, body):
    return swap(text, rf"(?<=<!-- bs:{name} -->).*?(?=<!-- /bs:{name} -->)", "\n" + body + "\n")


def deck_style_id(text):
    m = re.search(r'<html[^>]*\bdata-style="([^"]*)"', text)
    return m.group(1) if m else ""


def is_offline(text):
    return '<style id="bs-fonts">' in text


def cmd_new(a):
    out = Path(a.file)
    if out.exists() and not a.force:
        sys.exit(f"{out} already exists. Pick another name, or pass --force to replace it.")
    style = load_style(a.style or default_style())
    title = a.title or out.stem.replace("-", " ").replace("_", " ")
    slides = (Path(a.slides) if a.slides else ENGINE / "starter-slides.html").read_text().replace("{{TITLE}}", html.escape(title))
    builds = (Path(a.builds).read_text() if a.builds else "/* Builds for this deck: Deck.build(name, steps, render). None yet. */"
              if a.slides else (ENGINE / "starter-builds.js").read_text())
    parts = {
        "STYLE": style["id"], "PURPOSE": a.purpose, "VERSION": VERSION, "TITLE": html.escape(title),
        "FONTS": fonts_block(style, a.offline), "ENGINE_CSS": (ENGINE / "deck.css").read_text().rstrip(),
        "STYLE_CSS": style_block(style, not a.no_logos).rstrip(), "SLIDES": slides.strip("\n"), "D3": d3_block(a.offline),
        "ENGINE_JS": (ENGINE / "deck.js").read_text().rstrip(), "DECK_JS": builds.rstrip(),
    }
    text = (ENGINE / "shell.html").read_text()
    for k, v in parts.items():
        text = text.replace("{{" + k + "}}", v)
    if a.no_logos:
        text = text.replace('data-purpose="' + a.purpose + '"', 'data-purpose="' + a.purpose + '" data-logos="off"', 1)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text)
    print(f"Made {out} in the {style['meta'].get('name', style['id'])} style ({a.purpose}).")
    if not a.slides:
        print("It holds seven starter slides that show each layout. Replace them with the deck's own.")
    print(f"Next: ./bs ghost {out}   then   ./bs check {out}")


def rewrite(path, style=None, offline=None, engine=True):
    text = Path(path).read_text()
    if 'id="bs-engine"' not in text:
        sys.exit(f"{path} was not made by brutalist-slides (no bs-engine block). Start one with ./bs new.")
    sid = style or deck_style_id(text) or default_style()
    st = load_style(sid)
    off = is_offline(text) if offline is None else offline
    counts = []
    if engine:
        text, n1 = set_block(text, "style", "bs-engine", (ENGINE / "deck.css").read_text())
        text, n2 = set_block(text, "script", "bs-engine-js", (ENGINE / "deck.js").read_text())
        counts += [n1, n2]
    logos_on = not re.search(r'<html[^>]*\bdata-logos="off"', text)
    text, n3 = set_block(text, "style", "bs-style", style_block(st, logos_on))
    text, n4 = set_marked(text, "fonts", fonts_block(st, off))
    text, n5 = set_marked(text, "d3", d3_block(off))
    counts += [n3, n4]
    if not all(counts):
        sys.exit(f"{path}: a block this command rewrites is missing (engine, style or fonts). Nothing was changed.")
    text = re.sub(r'(<html[^>]*\bdata-style=")[^"]*(")', lambda m: m.group(1) + sid + m.group(2), text, count=1)
    text = re.sub(r'(<meta name="generator" content=")[^"]*(")', lambda m: m.group(1) + "brutalist-slides " + VERSION + m.group(2), text, count=1)
    Path(path).write_text(text)
    return st


def cmd_restyle(a):
    st = rewrite(a.file, style=a.style, engine=False)
    print(f"{a.file} is now in the {st['meta'].get('name', st['id'])} style. Slides and builds were not touched.")
    print(f"Check it: ./bs check {a.file}  and  ./bs audit {a.file}  (sizes and wrapping change with the typeface).")


def cmd_sync(a):
    rewrite(a.file)
    print(f"{a.file}: engine and style blocks refreshed to brutalist-slides {VERSION}.")


def cmd_offline(a):
    rewrite(a.file, offline=not a.undo, engine=False)
    size = Path(a.file).stat().st_size / 1e6
    print(f"{a.file}: fonts and D3 are now {'loaded from the internet' if a.undo else 'inside the file'} ({size:.1f} MB).")


# ----------------------------------------------------------------------------- reading a deck without a browser
class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.kids, self.text = tag, dict(attrs), parent, [], ""

    def cls(self):
        return (self.attrs.get("class") or "").split()

    def find(self, pred):
        out = []
        for k in self.kids:
            if pred(k):
                out.append(k)
            out += k.find(pred)
        return out

    def all_text(self, skip=lambda n: False):
        if skip(self):
            return ""
        return (self.text + " " + " ".join(k.all_text(skip) for k in self.kids)).strip()


VOID = {"meta", "link", "br", "img", "hr", "input", "source", "area", "base", "col", "embed", "track", "wbr"}


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root", [], None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.cur)
        self.cur.kids.append(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self.cur.kids.append(Node(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            self.cur = n.parent

    def handle_data(self, data):
        self.cur.text += data


def words(s):
    return re.findall(r"[A-Za-z0-9][A-Za-z0-9'’%.-]*", s)


def squash(s):
    return re.sub(r"\s+", " ", s).strip()


def norm(s):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", s.lower())).strip()


def read_deck(path):
    text = Path(path).read_text()
    t = Tree()
    t.feed(text)
    slides = t.root.find(lambda n: n.tag == "section" and "slide" in n.cls())
    return text, slides


def headline(slide):
    hs = slide.find(lambda n: any(c in n.cls() for c in ("claim", "title", "statement", "quote")))
    return squash(hs[0].all_text()) if hs else ""


def ghost_rows(slides):
    rows = []
    for i, s in enumerate(slides, 1):
        layout = s.attrs.get("data-layout", "")
        h = headline(s)
        flags = []
        if layout in ("claim", "evidence"):
            if not s.find(lambda n: "claim" in n.cls()):
                flags.append("no headline")
            else:
                if len(words(h)) < 5:
                    flags.append("topic label, not a claim?")
                if not re.search(r"[.?!]$", h):
                    flags.append("not a full sentence?")
                if len(h) > 110:
                    flags.append("long: likely over two lines")
        rows.append((i, layout, h, flags))
    return rows


def cmd_ghost(a):
    _, slides = read_deck(a.file)
    print("Ghost deck: the headlines alone, in order. Read them as the argument.\n")
    for i, layout, h, flags in ghost_rows(slides):
        print(f"{i:>3}  {layout or '-':<10} {h or '(no headline)'}" + (f"   <-- {'; '.join(flags)}" if flags else ""))
    print("\nDo the content headlines, read alone, carry the argument? If one makes no claim, the slide has no point yet.")


def block(text, tag, block_id):
    m = re.search(rf'<{tag} id="{block_id}">(.*?)</{tag}>', text, re.S)
    return m.group(1) if m else ""


def static_findings(path):
    text, slides = read_deck(path)
    out = []

    def add(n, level, rule, msg):
        out.append({"slide": n, "level": level, "rule": rule, "msg": msg})

    tokens = parse_tokens(block(text, "style", "bs-style"))
    if not slides:
        add(0, "FAIL", "structure", "No slides found (no <section class=\"slide\">).")
        return out, slides
    for level, rule, msg in style_findings(tokens):
        add(0, level, rule, "style: " + msg)
    purpose = (re.search(r'data-purpose="([^"]*)"', text) or [None, ""])[1]
    if purpose not in ("projection", "reading"):
        add(0, "WARN", "purpose", "The deck does not say what it is for. Set data-purpose on <html> to projection or reading.")
    if slides[0].attrs.get("data-layout") != "title":
        add(0, "WARN", "structure", "The first slide is not a title slide.")
    if slides[-1].attrs.get("data-layout") != "closing":
        add(0, "WARN", "structure", "The deck has no closing slide. End the talk on purpose.")
    seen = {}
    is_notes = lambda n: "notes" in n.cls()  # noqa: E731
    known = {"title", "claim", "evidence", "statement", "section", "closing"}
    for i, layout, h, flags in ghost_rows(slides):
        s = slides[i - 1]
        if layout not in known:
            add(i, "WARN", "structure", f'Unknown data-layout "{layout}". Layouts: {", ".join(sorted(known))}.')
        for f in flags:
            add(i, "FAIL" if f == "no headline" else "WARN", "headline", f"{f[0].upper() + f[1:]}: \"{h[:70]}\"" if h else "Content slide has no .claim headline.")
        if layout in ("claim", "evidence") and h:
            if norm(h) in seen:
                add(i, "WARN", "structure", f"Same headline as slide {seen[norm(h)]}.")
            seen.setdefault(norm(h), i)
        notes_nodes = s.find(is_notes)
        notes = norm(" ".join(n.all_text() for n in notes_nodes))
        if layout != "section" and not notes:
            add(i, "WARN", "notes", "No speaker notes. The explanation belongs in the notes, in your voice.")
        if layout == "evidence" and notes and not re.search(r"pause|stop|walk", notes):
            add(i, "WARN", "notes", "A dense evidence slide: the notes should say to stop talking and walk the room through it.")
        visible = squash(s.all_text(skip=lambda n: is_notes(n) or n.tag in ("title", "desc", "script", "style")
                                    or any(c in n.cls() for c in ("source", "status", "eyebrow"))))
        if layout != "evidence" and len(words(visible)) > 60:
            add(i, "WARN", "density", f"{len(words(visible))} words on screen. Is this slide a document? Move detail to the handout or the notes.")
        for n in s.find(lambda n: n.tag in ("p", "li", "h1", "h2", "h3", "td", "blockquote", "text") and not any(is_notes(p) for p in ancestors(n))):
            t = squash(n.all_text())
            if notes and len(norm(t).split()) >= 8 and norm(t) in notes:
                add(i, "WARN", "redundancy", f"On the slide and word for word in the notes. Say it or show it, not both: \"{t[:60]}\"")
            letters = re.sub(r"[^A-Za-z]", "", t)
            if len(t) > 40 and len(letters) > 30 and letters == letters.upper():
                add(i, "FAIL", "all-caps", f"All-caps running text: \"{t[:50]}\"")
        for lst in s.find(lambda n: n.tag in ("ul", "ol") and not any(is_notes(p) for p in ancestors(n))):
            items = [k for k in lst.kids if k.tag == "li"]
            if len(items) > 4:
                add(i, "WARN", "working-memory", f"A list of {len(items)} items. Past four, group them or split the slide.")
            if items and len(items) <= 4 and all("data-step" in k.attrs for k in items):
                add(i, "WARN", "steps", "A short list is revealed one item at a time. Show short lists whole; build diagrams and processes.")
            for k in items:
                if len(squash(k.all_text())) > 90:
                    add(i, "WARN", "working-memory", f"A long list item, likely over two lines: \"{squash(k.all_text())[:50]}\"")
        if layout in ("claim", "evidence") and s.find(lambda n: "logo" in n.cls()):
            add(i, "WARN", "coherence", "A logo on a content slide. Keep logos to the title and closing slides.")
        if s.find(lambda n: "legend" in n.cls()):
            add(i, "WARN", "labeling", "A legend. Label the lines, bars or regions directly and delete it.")
        for n in s.find(lambda n: n.tag == "img" and "alt" not in n.attrs):
            add(i, "WARN", "alt-text", "An image has no alt attribute.")
        for n in s.find(lambda n: "style" in n.attrs):
            for m in re.finditer(r"font-size\s*:\s*([\d.]+)px", n.attrs["style"]):
                if float(m.group(1)) < FLOOR_LABEL and n.tag not in ("text", "tspan") and not any(p.tag == "svg" for p in ancestors(n)):
                    add(i, "FAIL", "type-size", f"Inline font-size {m.group(1)} px is under the {FLOOR_LABEL} px floor.")
            for hx in HEX.findall(n.attrs["style"]):
                add(i, "WARN", "tokens", f"Hard-coded colour {hx} in a style attribute. Use a token so the deck can be restyled.")

    deck_css = re.sub(r"/\*.*?\*/", "", block(text, "style", "bs-deck"), flags=re.S)
    for m in re.finditer(r"font-size\s*:\s*([\d.]+)px", deck_css):
        if float(m.group(1)) < FLOOR_LABEL:
            add(0, "FAIL", "type-size", f"Deck CSS sets font-size {m.group(1)} px, under the {FLOOR_LABEL} px floor.")
    style_hex = {norm_hex(h) for h in HEX.findall(block(text, "style", "bs-style"))}
    for where, src in (("deck CSS", deck_css), ("deck script", re.sub(r"//[^\n]*|/\*.*?\*/", "", block(text, "script", "bs-deck-js"), flags=re.S))):
        for hx in sorted({norm_hex(h) for h in HEX.findall(src)}):
            add(0, "WARN", "tokens", f"Hard-coded colour {hx} in the {where}" + (" (it is one of this style's colours; a restyle would leave it behind)." if hx in style_hex else ". Use a token so the deck can be restyled."))
    for raw in sorted({norm_hex(h) for s in slides for n in s.find(lambda n: n.tag not in ("aside",)) for a_ in ("fill", "stroke", "color") for h in HEX.findall(n.attrs.get(a_, ""))}):
        add(0, "WARN", "tokens", f"Hard-coded colour {raw} in an SVG attribute. Use the f-* and s-* classes (f-ink, f-accent, s-hair ...).")
    return out, slides


def ancestors(n):
    p = n.parent
    while p is not None:
        yield p
        p = p.parent


def print_findings(title, findings, n_slides):
    fails = sum(1 for f in findings if f["level"] == "FAIL")
    print(f"{title}  ·  {n_slides} slides")
    print(f"FAIL {fails}   WARN {len(findings) - fails}\n")
    for f in findings:
        where = f"slide {f['slide']}" if f["slide"] else "deck"
        print(f"{where:<9} {f['level']}  {f['rule']:<15} {f['msg']}")
    if not findings:
        print("Nothing measurable is wrong.")
    return fails


def cmd_check(a):
    findings, slides = static_findings(a.file)
    if a.json:
        print(json.dumps({"file": a.file, "slides": len(slides), "findings": findings}, indent=2))
    else:
        fails = print_findings(f"Static check of {a.file}", findings, len(slides))
        print("\nThis check reads the file; it does not draw it. Type sizes inside exhibits, wrapping, overflow and")
        print(f"measured contrast need the rendered audit: ./bs audit {a.file}  (or open the deck with ?audit on the end).")
        sys.exit(1 if fails else 0)


# ----------------------------------------------------------------------------- browser commands
def browser():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return None
    return sync_playwright


def need_browser(path, what):
    print(f"{what} draws the deck in a real browser, and Playwright is not installed here.")
    print("Without it: open the deck in any browser and add ?audit to the address to see the same audit,")
    print("or ?ghost for the headlines. An agent with a browser tool can read the panel text, or window.bsAudit.")
    print(f"  file://{Path(path).resolve()}?audit")
    print("To install: python3 -m pip install playwright && python3 -m playwright install chromium")
    sys.exit(2)


def open_deck(pw, path, query=""):
    b = pw.chromium.launch()
    page = b.new_page(viewport={"width": 1920, "height": 1080})
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.goto(Path(path).resolve().as_uri() + query)
    page.wait_for_selector("html[data-bs-ready]", timeout=20000)
    return b, page, errors


def cmd_audit(a):
    sp = browser()
    if not sp:
        need_browser(a.file, "The audit")
    with sp() as pw:
        b, page, errors = open_deck(pw, a.file)
        res = page.evaluate("Deck.audit()")
        text = page.evaluate("Deck.auditText()")
        b.close()
    for e in errors:
        res["findings"].append({"slide": 0, "layout": "deck", "level": "FAIL", "rule": "console", "msg": "Browser error: " + e[:200]})
        res["fail"] += 1
        text += "\ndeck      FAIL  console         Browser error: " + e[:200]
    if a.json:
        print(json.dumps(res, indent=2))
    else:
        print(text)
        if errors:
            print(f"\n(with the browser errors the count is FAIL {res['fail']})")
    sys.exit(1 if res["fail"] else 0)


def cmd_shots(a):
    sp = browser()
    if not sp:
        need_browser(a.file, "Screenshots")
    out = Path(a.out or (Path(a.file).with_suffix("").as_posix() + "-shots"))
    out.mkdir(parents=True, exist_ok=True)
    with sp() as pw:
        b, page, _ = open_deck(pw, a.file)
        page.add_style_tag(content="#controls{display:none !important}")
        page.emulate_media(reduced_motion="reduce")
        n = page.evaluate("Deck.count()")
        made = 0
        for i in range(1, n + 1):
            steps = page.evaluate(f"Deck.steps({i})")
            for k in (range(0, steps + 1) if a.steps else [steps]):
                page.evaluate(f"Deck.go({i}, {k})")
                page.wait_for_timeout(80)
                name = f"slide-{i:02d}" + (f"-step-{k}" if a.steps and steps else "") + ".png"
                page.screenshot(path=str(out / name), clip={"x": 0, "y": 0, "width": 1920, "height": 1080})
                made += 1
        b.close()
    print(f"{made} screenshots in {out}/ (1920 x 1080, each slide in its final state" + (", plus every step" if a.steps else "") + ").")
    print("Look at them. A slide that passes the audit can still be ugly, crowded or unclear.")


def cmd_pdf(a):
    sp = browser()
    if not sp:
        need_browser(a.file, "PDF export")
    out = Path(a.out or Path(a.file).with_suffix(".pdf"))
    with sp() as pw:
        b, page, _ = open_deck(pw, a.file)
        page.emulate_media(media="print")
        page.evaluate("Deck.printReady()")
        page.pdf(path=str(out), width="1920px", height="1080px", print_background=True)
        b.close()
    print(f"Wrote {out}: one page per slide, each in its final state. Speaker notes are not in it.")


# ----------------------------------------------------------------------------- styles commands
def cmd_styles(a):
    if not a.id:
        print("Styles (./bs styles <id> for one in full):\n")
        for sid in style_ids():
            st = load_style(sid)
            t = st["tokens"]
            mark = "  (default)" if st["meta"].get("default") else ""
            print(f"  {sid:<14}{mark}")
            print(f"      {st['meta'].get('about', '')}")
            print(f"      ground {t.get('bs-ground', '?')}  ink {t.get('bs-ink', '?')}  accent {t.get('bs-accent', '?')}  head {t.get('bs-font-head', '?').split(',')[0]}")
        print("\nMake your own: ./bs new-style <id>")
        return
    st = load_style(a.id)
    t = st["tokens"]
    print(f"{st['meta'].get('name', a.id)}: {st['meta'].get('about', '')}\n")
    print("Contrast (the floor for all projected text is 4.5:1):")
    for fg, bg, what in PAIRS:
        if fg in t and bg in t and HEX.fullmatch(t[fg]) and HEX.fullmatch(t[bg]):
            r = contrast(t[fg], t[bg])
            print(f"  {r:>5.2f}:1  {'ok  ' if r >= MIN_CONTRAST else 'FAIL'}  {t[fg]} on {t[bg]}  {what}")
    for pre, gd in (("bs-accent-deco", "bs-ground"), ("bs-dark-accent-deco", "bs-dark-ground")):
        if pre in t and gd in t and HEX.fullmatch(t[pre]):
            r = contrast(t[pre], t[gd])
            print(f"  {r:>5.2f}:1  {'    ' if r >= MIN_CONTRAST else 'deco'}  {t[pre]} on {t[gd]}  marks and bars only" + ("" if r >= MIN_CONTRAST else ": never text"))
    print("\nType:")
    for k in ("bs-font-head", "bs-font-body", "bs-font-label", "bs-font-mono"):
        print(f"  {k[8:]:<6} {t.get(k, '?').split(',')[0]}")
    print(f"  sizes  claim {t.get('bs-claim-size')}  body {t.get('bs-body-size')}  label {t.get('bs-label-size')}")
    logos = st["meta"].get("logos") or {}
    if logos:
        print("\nLogos:")
        for k, v in logos.items():
            print(f"  {k:<15} {v}  {'found' if (st['dir'] / v).exists() else 'not on this computer (the slot stays empty)'}")
    if st["meta"].get("rules"):
        print("\nRules for this style:")
        for r in st["meta"]["rules"]:
            print(f"  - {r}")
    f = style_findings(t)
    print("\n" + ("Style check: nothing wrong." if not f else "Style check:"))
    for level, rule, msg in f:
        print(f"  {level}  {rule:<10} {msg}")


def cmd_new_style(a):
    if not re.fullmatch(r"[a-z][a-z0-9-]*", a.id):
        sys.exit("A style id is lowercase letters, digits and hyphens, for example: acme or my-lab.")
    dst = STYLES / a.id
    if dst.exists():
        sys.exit(f"styles/{a.id} already exists.")
    src = STYLES / (a.base or "_template")
    if not (src / "style.css").exists():
        sys.exit(f"No style to copy from at {src}.")
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns("*.svg", "*.png", "*.jpg", "*.jpeg"))
    meta = json.loads((dst / "style.json").read_text())
    meta.update({"id": a.id, "name": a.name or a.id.replace("-", " ").title()})
    meta.pop("default", None)
    (dst / "style.json").write_text(json.dumps(meta, indent=2) + "\n")
    css = (dst / "style.css").read_text()
    (dst / "style.css").write_text(re.sub(r"/\* style: [^\n]*", f"/* style: {a.id}", css, count=1))
    print(f"Made styles/{a.id}/ from {src.name}. Edit style.css (the tokens) and style.json (fonts, logos, rules).")
    print(f"Then: ./bs styles {a.id}   to see its contrast table and what fails.")


def cmd_style_check(a):
    ids = [a.id] if a.id else style_ids()
    bad = 0
    for sid in ids:
        f = style_findings(load_style(sid)["tokens"])
        fails = [x for x in f if x[0] == "FAIL"]
        bad += len(fails)
        print(f"{sid}: " + ("ok" if not f else f"{len(fails)} FAIL, {len(f) - len(fails)} WARN"))
        for level, rule, msg in f:
            print(f"  {level}  {rule:<10} {msg}")
    sys.exit(1 if bad else 0)


def cmd_install(a):
    target = Path.home() / ".claude" / "skills" / "brutalist-slides"
    if target.is_symlink() or target.exists():
        print(f"{target} already exists. Remove it yourself first if you want to relink.")
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    target.symlink_to(ROOT)
    print(f"Linked {target} -> {ROOT}. Claude Code will now offer the brutalist-slides skill in every project.")


HELP = f"""brutalist-slides {VERSION}: skills and a small engine for HTML slide decks that hold up.

Open this folder in Claude Code, Codex or another coding agent and say what the talk is.
The agent reads SKILL.md and uses these commands. You can run them yourself too.

  Make
    ./bs new <deck.html> --title "..." [--style ID] [--purpose projection|reading] [--offline]
                                         [--slides fragment.html] [--builds builds.js]  start from your own slides
                                         [--no-logos]  never put logo files in this deck
    ./bs restyle <deck.html> <style>     same slides, another style
    ./bs offline <deck.html>             put the fonts and D3 inside the file (no internet in the room)
    ./bs sync <deck.html>                refresh an older deck to this engine

  Check
    ./bs ghost <deck.html>               the headlines alone, in order: do they carry the argument?
    ./bs check <deck.html>               static check: claims, lists, notes, tokens (no browser)
    ./bs audit <deck.html>               rendered audit: type size, contrast, overflow, wrapping
    ./bs shots <deck.html> [--steps]     a PNG of every slide, to look at
    ./bs pdf <deck.html>                 one page per slide

  Styles
    ./bs styles [id]                     the styles here; one in full with its contrast table
    ./bs new-style <id> [--from ID]      start your own
    ./bs style-check [id]                does a style meet the floors?

  ./bs install                           link this folder as a Claude skill for every project

Styles here: {{styles}}
audit, shots and pdf need Playwright. Without it, open the deck with ?audit or ?ghost on the address.
Keys in a deck: arrows or space to move, N notes, G all slides, F fullscreen.
"""


def main():
    p = argparse.ArgumentParser(prog="bs", add_help=False)
    sub = p.add_subparsers(dest="cmd")
    s = sub.add_parser("new"); s.add_argument("file"); s.add_argument("--title"); s.add_argument("--style")
    s.add_argument("--purpose", choices=["projection", "reading"], default="projection")
    s.add_argument("--offline", action="store_true"); s.add_argument("--force", action="store_true")
    s.add_argument("--slides"); s.add_argument("--builds"); s.add_argument("--no-logos", action="store_true"); s.set_defaults(fn=cmd_new)
    s = sub.add_parser("restyle"); s.add_argument("file"); s.add_argument("style"); s.set_defaults(fn=cmd_restyle)
    s = sub.add_parser("sync"); s.add_argument("file"); s.set_defaults(fn=cmd_sync)
    s = sub.add_parser("offline"); s.add_argument("file"); s.add_argument("--undo", action="store_true"); s.set_defaults(fn=cmd_offline)
    s = sub.add_parser("ghost"); s.add_argument("file"); s.set_defaults(fn=cmd_ghost)
    s = sub.add_parser("check"); s.add_argument("file"); s.add_argument("--json", action="store_true"); s.set_defaults(fn=cmd_check)
    s = sub.add_parser("audit"); s.add_argument("file"); s.add_argument("--json", action="store_true"); s.set_defaults(fn=cmd_audit)
    s = sub.add_parser("shots"); s.add_argument("file"); s.add_argument("--out"); s.add_argument("--steps", action="store_true"); s.set_defaults(fn=cmd_shots)
    s = sub.add_parser("pdf"); s.add_argument("file"); s.add_argument("--out"); s.set_defaults(fn=cmd_pdf)
    s = sub.add_parser("styles"); s.add_argument("id", nargs="?"); s.set_defaults(fn=cmd_styles)
    s = sub.add_parser("new-style"); s.add_argument("id"); s.add_argument("--from", dest="base"); s.add_argument("--name"); s.set_defaults(fn=cmd_new_style)
    s = sub.add_parser("style-check"); s.add_argument("id", nargs="?"); s.set_defaults(fn=cmd_style_check)
    s = sub.add_parser("install"); s.set_defaults(fn=cmd_install)
    sub.add_parser("help")
    a = p.parse_args()
    if not a.cmd or a.cmd == "help":
        print(HELP.replace("{styles}", ", ".join(style_ids())))
        return
    a.fn(a)


if __name__ == "__main__":
    main()
