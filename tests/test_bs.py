"""Tests for brutalist-slides. Run: python3 -m unittest discover tests

The rendered-audit tests need Playwright and skip themselves without it.
"""
import json
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
import bs  # noqa: E402

BS = [sys.executable, str(ROOT / "scripts" / "bs.py")]
FLAWED = ROOT / "tests" / "fixtures" / "flawed-slides.html"
STYLES = ["northeastern", "seis", "brutalist"]


def run(*args):
    return subprocess.run(BS + [str(a) for a in args], capture_output=True, text=True, cwd=ROOT)


def slides_region(text):
    return re.search(r'<div id="deck">(.*?)</div>\s*</main>', text, re.S).group(1)


def has_playwright():
    try:
        import playwright  # noqa: F401
        return True
    except ImportError:
        return False


class Contrast(unittest.TestCase):
    def test_known_values(self):
        self.assertAlmostEqual(bs.contrast("#000000", "#FFFFFF"), 21.0, places=2)
        self.assertAlmostEqual(bs.contrast("#6b7280", "#ffffff"), 4.83, places=2)  # the value quoted in docs/evidence.md
        self.assertAlmostEqual(bs.contrast("#C8102E", "#FFFFFF"), 5.89, delta=0.02)

    def test_red_on_black_is_under_the_floor(self):
        # why the Northeastern style uses white, not red, for emphasis text on black
        self.assertLess(bs.contrast("#C8102E", "#000000"), 4.5)

    def test_terracotta_is_decoration_only(self):
        self.assertLess(bs.contrast("#D97757", "#FAF9F5"), 3.0)


class Styles(unittest.TestCase):
    def test_shipped_styles_exist_and_northeastern_is_default(self):
        self.assertEqual(sorted(STYLES), bs.style_ids())
        self.assertEqual(bs.default_style(), "northeastern")

    def test_every_style_and_the_template_meet_the_floors(self):
        for sid in STYLES + ["_template"]:
            css = (ROOT / "styles" / sid / "style.css").read_text()
            self.assertEqual(bs.style_findings(bs.parse_tokens(css)), [], sid)

    def test_a_bad_style_is_caught(self):
        tokens = bs.parse_tokens((ROOT / "styles" / "northeastern" / "style.css").read_text())
        tokens["bs-ink-soft"] = "#BBBBBB"
        tokens["bs-body-size"] = "28px"
        rules = {f[1] for f in bs.style_findings(tokens)}
        self.assertEqual(rules, {"contrast", "type-size"})

    def test_seis_uses_northeastern_colours(self):
        a = bs.load_style("northeastern")["tokens"]
        b = bs.load_style("seis")["tokens"]
        for k in a:
            if not k.startswith("bs-font"):
                self.assertEqual(a[k], b[k], k)

    def test_font_files_named_by_styles_exist(self):
        for sid in STYLES:
            for face in bs.load_style(sid)["meta"]["fonts"]["local"]:
                self.assertTrue((ROOT / "fonts" / face["file"]).exists(), face["file"])

    def test_engine_holds_no_typeface_or_brand_token_values(self):
        css = (ROOT / "engine" / "deck.css").read_text()
        for word in ("Lato", "Garamond", "C8102E", "FAF9F5", "D97757"):
            self.assertNotIn(word, css)


class Decks(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.d = Path(self.tmp.name)

    def tearDown(self):
        self.tmp.cleanup()

    def new(self, name="deck.html", *extra):
        p = self.d / name
        r = run("new", p, "--title", "Test deck", *extra)
        self.assertEqual(r.returncode, 0, r.stderr)
        return p

    def test_starter_deck_passes_the_static_check_in_every_style(self):
        for sid in STYLES:
            p = self.new(f"{sid}.html", "--style", sid)
            findings, slides = bs.static_findings(p)
            self.assertEqual(len(slides), 7)
            self.assertEqual(findings, [], sid)

    def test_new_refuses_to_overwrite(self):
        p = self.new()
        self.assertNotEqual(run("new", p).returncode, 0)

    def test_restyle_changes_the_style_and_nothing_in_the_slides(self):
        p = self.new()
        before = p.read_text()
        self.assertEqual(run("restyle", p, "brutalist").returncode, 0)
        after = p.read_text()
        self.assertEqual(slides_region(before), slides_region(after))
        self.assertEqual(bs.deck_style_id(after), "brutalist")
        self.assertIn("EB Garamond", bs.block(after, "style", "bs-style"))
        self.assertEqual(bs.block(before, "script", "bs-deck-js"), bs.block(after, "script", "bs-deck-js"))

    def test_offline_puts_fonts_and_d3_in_the_file_and_undo_takes_them_out(self):
        p = self.new()
        self.assertEqual(run("offline", p).returncode, 0)
        t = p.read_text()
        self.assertNotIn("fonts.googleapis.com", t)
        self.assertNotIn("cdn.jsdelivr.net", t)
        self.assertIn("@font-face", t)
        self.assertEqual(run("offline", p, "--undo").returncode, 0)
        self.assertIn("fonts.googleapis.com", p.read_text())

    def test_sync_is_stable(self):
        p = self.new()
        before = p.read_text()
        self.assertEqual(run("sync", p).returncode, 0)
        self.assertEqual(before, p.read_text())

    def test_ghost_lists_headlines_in_order(self):
        p = self.new()
        out = run("ghost", p).stdout
        self.assertIn("A sentence headline states the one thing this slide claims.", out)
        self.assertLess(out.index("Test deck"), out.index("The one thing to remember"))

    def test_static_check_catches_the_flawed_deck(self):
        p = self.new("bad.html", "--slides", FLAWED)
        r = run("check", p, "--json")
        rules = {f["rule"] for f in json.loads(r.stdout)["findings"]}
        for rule in ("headline", "notes", "steps", "redundancy", "type-size", "tokens",
                     "all-caps", "working-memory", "coherence", "labeling", "structure"):
            self.assertIn(rule, rules)
        self.assertEqual(run("check", p).returncode, 1)

    def test_hard_coded_colour_in_a_build_is_flagged(self):
        js = self.d / "b.js"
        js.write_text('Deck.build("x", 0, function (el) { el.style.color = "#C8102E"; });')
        p = self.new("c.html", "--slides", ROOT / "engine" / "starter-slides.html", "--builds", js)
        msgs = [f["msg"] for f in bs.static_findings(p)[0] if f["rule"] == "tokens"]
        self.assertTrue(any("#C8102E" in m for m in msgs))

    @unittest.skipUnless(has_playwright(), "Playwright is not installed")
    def test_rendered_audit_catches_the_flawed_deck(self):
        p = self.new("bad.html", "--slides", FLAWED)
        r = run("audit", p, "--json")
        self.assertEqual(r.returncode, 1)
        res = json.loads(r.stdout)
        by_rule = {}
        for f in res["findings"]:
            by_rule.setdefault(f["rule"], []).append(f)
        for rule in ("headline", "type-size", "contrast", "overflow", "overlap", "all-caps",
                     "redundancy", "working-memory", "steps", "coherence", "labeling", "notes", "structure"):
            self.assertIn(rule, by_rule)
        self.assertTrue(any("4 lines" in f["msg"] for f in by_rule["headline"]))
        self.assertTrue(any("1.92:1" in f["msg"] for f in by_rule["contrast"]))
        # the 18 px label inside a scaled-down SVG is measured as drawn, not as written
        self.assertTrue(any("an axis label" in f["msg"] and "18 px" not in f["msg"] for f in by_rule["type-size"]))

    @unittest.skipUnless(has_playwright(), "Playwright is not installed")
    def test_starter_deck_passes_the_rendered_audit_in_every_style(self):
        for sid in STYLES:
            p = self.new(f"{sid}.html", "--style", sid)
            res = json.loads(run("audit", p, "--json").stdout)
            self.assertEqual((res["fail"], res["warn"]), (0, 0), f"{sid}: {res['findings']}")


class Examples(unittest.TestCase):
    def decks(self):
        return sorted((ROOT / "examples").glob("*.html"))

    def test_there_is_a_sample_in_every_style(self):
        self.assertEqual({bs.deck_style_id(p.read_text()) for p in self.decks()}, set(STYLES))

    def test_examples_carry_the_current_engine(self):
        css = (ROOT / "engine" / "deck.css").read_text().strip()
        js = (ROOT / "engine" / "deck.js").read_text().strip()
        for p in self.decks():
            t = p.read_text()
            self.assertEqual(bs.block(t, "style", "bs-engine").strip(), css, f"{p.name}: run ./bs sync")
            self.assertEqual(bs.block(t, "script", "bs-engine-js").strip(), js, f"{p.name}: run ./bs sync")

    def test_examples_carry_no_logo_files(self):
        for p in self.decks():
            t = p.read_text()
            self.assertIn('data-logos="off"', t, p.name)
            self.assertNotIn("--bs-logo-", bs.block(t, "style", "bs-style").split("/* logos found")[-1] if "/* logos found" in t else "", p.name)
            self.assertNotIn("/* logos found", t, p.name)

    def test_examples_pass_the_static_check(self):
        for p in self.decks():
            self.assertEqual(bs.static_findings(p)[0], [], p.name)

    @unittest.skipUnless(has_playwright(), "Playwright is not installed")
    def test_examples_pass_the_rendered_audit(self):
        for p in self.decks():
            res = json.loads(run("audit", p, "--json").stdout)
            self.assertEqual((res["fail"], res["warn"]), (0, 0), f"{p.name}: {res['findings']}")


if __name__ == "__main__":
    unittest.main()
