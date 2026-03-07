"""
KYDY EDUCATIONAL SVG ENGINE  v6.0
══════════════════════════════════════════════════════════════════════════════
ROOT CAUSE FIX (the "swing" bug):
  animateTransform type="scale" with additive="sum" scales relative to the
  SVG viewport origin (0,0) — NOT the element's own centre.
  Any element without a translate() in its transform attribute will appear
  to fly in from the top-left corner, creating the swing effect.

THE FIX — two strict rules:
  1. Scale entrance animations are ONLY emitted on elements that already
     have a translate(cx,cy) in their group transform  → asset type only.
  2. All other element types (text, rect, circle, line, path, polygon…)
     use OPACITY FADE only for their entrance. No scale animation.
     If an element's JSON requests type="scale" in its animations array,
     that is executed only if the element has a translate group transform.

ADDITIONAL FIXES:
  • Scene wrapper <g> never gets a scale entrance — only opacity gating.
  • animateMotion path coords are relative to element start position.
  • Connector dash-array written once; draw reveal uses separate animate.
  • <animate>/<animateTransform> are ALWAYS siblings of content, never
    nested inside <text> nodes.
  • HUD subtitle groups: animations are siblings of <text>, not children.
══════════════════════════════════════════════════════════════════════════════
"""

import json
import math
import re
import os


# ─────────────────────────────────────────────────────────────────────────────
# ASSET LIBRARY LOADER
#
# Reads asset.svg and extracts every <symbol> definition — correctly handling
# the fact that asset.svg distributes its 459 symbols across 11 separate
# <defs> blocks.  Using re.search(r"<defs>…</defs>") would only find the
# FIRST block (191 symbols). We instead scan the entire file for all
# <symbol>…</symbol> tags directly.
#
# Also de-duplicates any gradient IDs that appear more than once in the file
# (asset.svg contains "gSph" twice) to prevent SVG id-collision warnings.
#
# The loader is called once; results are cached for the process lifetime.
# ─────────────────────────────────────────────────────────────────────────────

_ASSET_SYMBOLS_CACHE: str = ""                      # all <symbol> tags joined
_ASSET_VIEWBOX_CACHE: dict[str, tuple[float,float]] = {}  # id → (w, h)


def _load_assets(asset_path: str = "") -> tuple[str, dict[str, tuple[float, float]]]:
    """
    Returns:
      symbols_str  — one big string of every <symbol>…</symbol> block,
                     ready to embed inside a single SVG <defs>.
      viewboxes    — {symbol_id: (width, height)} parsed from each viewBox.

    Search order for asset.svg:
      1. explicit asset_path argument
      2. same directory as this script
      3. current working directory
    """
    global _ASSET_SYMBOLS_CACHE, _ASSET_VIEWBOX_CACHE
    if _ASSET_SYMBOLS_CACHE:
        return _ASSET_SYMBOLS_CACHE, _ASSET_VIEWBOX_CACHE

    candidates = []
    if asset_path:
        candidates.append(asset_path)
    candidates += [
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "asset.svg"),
        os.path.join(os.getcwd(), "asset.svg"),
    ]

    raw = ""
    for p in candidates:
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                raw = f.read()
            break

    if not raw:
        print("WARNING: asset.svg not found — asset elements will show placeholders.")
        _ASSET_SYMBOLS_CACHE = ""
        _ASSET_VIEWBOX_CACHE = {}
        return "", {}

    # ── Extract every <symbol>…</symbol> block from the whole file ────────
    # This is the critical fix vs v7: we do NOT rely on <defs>…</defs>
    # because asset.svg has 11 separate <defs> sections.
    symbol_blocks = re.findall(r'<symbol\b[^>]*>.*?</symbol>', raw, re.DOTALL)

    # ── Build viewbox map and de-duplicate gradient IDs ───────────────────
    viewboxes: dict[str, tuple[float, float]] = {}
    seen_ids: set[str] = set()
    kept_blocks: list[str] = []

    for block in symbol_blocks:
        # Parse the symbol id
        m_id = re.search(r'\bid="([^"]+)"', block)
        if not m_id:
            continue
        sym_id = m_id.group(1)
        if sym_id in seen_ids:
            continue          # skip exact duplicate symbol definitions
        seen_ids.add(sym_id)
        kept_blocks.append(block)

        # Parse viewBox → (w, h)
        m_vb = re.search(r'viewBox="0\s+0\s+([\d.]+)\s+([\d.]+)"', block)
        if m_vb:
            viewboxes[sym_id] = (float(m_vb.group(1)), float(m_vb.group(2)))


    # gSph gradient is embedded inline inside the sphere symbol definition itself.
    # We do NOT extract top-level gradients separately — doing so would create a
    # duplicate id="gSph" in the output. The symbol blocks carry everything needed.
    all_content = "\n".join(kept_blocks)

    _ASSET_SYMBOLS_CACHE = all_content
    _ASSET_VIEWBOX_CACHE = viewboxes
    print(f"Asset library loaded: {len(kept_blocks)} symbols from asset.svg")
    return all_content, viewboxes

# ─────────────────────────────────────────────────────────────────────────────
# THEMES
# ─────────────────────────────────────────────────────────────────────────────

THEMES = {
    "dark": {
        "bg": "#0f172a", "grid": "#1e293b", "surface": "#1e293b",
        "text": "#f1f5f9", "muted": "#94a3b8", "border": "#334155",
        "hud_bg": "rgba(15,23,42,0.95)", "hud_border": "#334155",
        "shadow": "rgba(0,0,0,0.6)",
        "accents": ["#38bdf8","#818cf8","#34d399","#f472b6",
                    "#fb923c","#facc15","#a78bfa","#22d3ee"],
    },
    "light": {
        "bg": "#f8fafc", "grid": "#e2e8f0", "surface": "#ffffff",
        "text": "#0f172a", "muted": "#64748b", "border": "#cbd5e1",
        "hud_bg": "rgba(248,250,252,0.97)", "hud_border": "#cbd5e1",
        "shadow": "rgba(15,23,42,0.12)",
        "accents": ["#0284c7","#7c3aed","#059669","#db2777",
                    "#ea580c","#ca8a04","#6d28d9","#0891b2"],
    },
    "blueprint": {
        "bg": "#08192e", "grid": "#0d2340", "surface": "#0d1f3c",
        "text": "#cce7ff", "muted": "#5fa8c8", "border": "#1a3a5c",
        "hud_bg": "rgba(8,25,46,0.96)", "hud_border": "#1a3a5c",
        "shadow": "rgba(0,0,0,0.7)",
        "accents": ["#4fc3f7","#81d4fa","#29b6f6","#0288d1",
                    "#64b5f6","#90caf9","#42a5f5","#2196f3"],
    },
    "warm": {
        "bg": "#1c1410", "grid": "#2d2018", "surface": "#261a12",
        "text": "#fef3e2", "muted": "#c4a882", "border": "#4a3020",
        "hud_bg": "rgba(28,20,16,0.96)", "hud_border": "#4a3020",
        "shadow": "rgba(0,0,0,0.55)",
        "accents": ["#fbbf24","#f97316","#ef4444","#fb923c",
                    "#fcd34d","#f59e0b","#d97706","#b45309"],
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# UTILITIES
# ─────────────────────────────────────────────────────────────────────────────

def _x(s) -> str:
    return (str(s).replace("&","&amp;").replace("<","&lt;")
            .replace(">","&gt;").replace('"',"&quot;"))

def _ff() -> str:
    return "'IBM Plex Sans','Segoe UI',system-ui,sans-serif"

def _fm() -> str:
    return "'IBM Plex Mono','Courier New',monospace"

def _dur(v) -> str:
    s = str(v)
    return s if s.endswith("s") else s + "s"

def _begin(v) -> str:
    return f"{float(str(v).rstrip('s')):.3f}s"

def _props_str(props: dict, skip: set = None) -> str:
    skip = (skip or set()) | {"content", "multiline"}
    return " ".join(f'{k}="{_x(v)}"' for k, v in props.items() if k not in skip)


# ─────────────────────────────────────────────────────────────────────────────
# ANIMATION BUILDER
# Returns list of complete SVG animation element strings.
# These are ALWAYS inserted as direct children of a <g>, never inside <text>.
# ─────────────────────────────────────────────────────────────────────────────

def _anims(anim_list: list, default_begin: float = 0.0,
           has_translate: bool = False) -> list[str]:
    """
    Build SMIL animation strings from the JSON animations array.

    has_translate: True only for asset-type elements that have a
                   translate(cx,cy) group transform. Scale animations
                   are ONLY emitted when this is True.
    """
    out = []
    for a in anim_list:
        atype  = a.get("type", "fade")
        begin  = float(str(a.get("begin", default_begin)).rstrip("s"))
        dur    = _dur(a.get("dur", "1s"))
        repeat = a.get("repeat", "1")
        fill   = a.get("fill", "freeze")

        if atype == "fade":
            fv = a.get("from", 0)
            tv = a.get("to", 1)
            out.append(
                f'<animate attributeName="opacity"'
                f' from="{fv}" to="{tv}" dur="{dur}" begin="{begin:.3f}s"'
                f' repeatCount="{repeat}" fill="{fill}"'
                f' calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>'
            )

        elif atype == "scale":
            # ── SWING GUARD ──────────────────────────────────────────────
            # Scale animateTransform only works correctly when the group
            # has a translate() that centres it. For elements using
            # absolute SVG coords (no group translate), scale origin is
            # the SVG (0,0) corner — which causes the swing/fly-in bug.
            # SOLUTION: skip scale for non-asset elements entirely.
            # ─────────────────────────────────────────────────────────────
            if not has_translate:
                # Degrade to a simple opacity fade instead
                fv = a.get("from", "0")
                tv = a.get("to", "1")
                # Only emit if it looks like an entrance (from < to numerically)
                try:
                    from_n = float(str(fv).split()[0])
                    to_n   = float(str(tv).split()[0])
                    if from_n < to_n:
                        out.append(
                            f'<animate attributeName="opacity"'
                            f' from="0" to="1" dur="{dur}" begin="{begin:.3f}s"'
                            f' repeatCount="1" fill="freeze"'
                            f' calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>'
                        )
                except ValueError:
                    pass
                continue

            fv = a.get("from", "0.5")
            tv = a.get("to", "1")
            out.append(
                f'<animateTransform attributeName="transform" type="scale"'
                f' from="{fv}" to="{tv}" dur="{dur}" begin="{begin:.3f}s"'
                f' repeatCount="{repeat}" fill="{fill}" additive="sum"'
                f' calcMode="spline" keyTimes="0;1"'
                f' keySplines="0.175 0.885 0.32 1.1"/>'
            )

        elif atype == "move":
            path = a.get("path", "M 0 0")
            out.append(
                f'<animateMotion path="{_x(path)}"'
                f' dur="{dur}" begin="{begin:.3f}s"'
                f' repeatCount="{repeat}" fill="{fill}"'
                f' calcMode="spline" keyTimes="0;1"'
                f' keySplines="0.42 0 0.58 1"/>'
            )

        elif atype == "rotate":
            fv = a.get("from", "0")
            tv = a.get("to", "360")
            cx = a.get("cx", 0)
            cy = a.get("cy", 0)
            out.append(
                f'<animateTransform attributeName="transform" type="rotate"'
                f' from="{fv} {cx} {cy}" to="{tv} {cx} {cy}"'
                f' dur="{dur}" begin="{begin:.3f}s"'
                f' repeatCount="{repeat}" fill="{fill}" additive="sum"/>'
            )

        elif atype == "pulse":
            # Pulse (oscillating scale) is safe ONLY on elements that have
            # a centring translate. Otherwise it wobbles from (0,0).
            if not has_translate:
                continue
            intensity = a.get("intensity", 1.07)
            out.append(
                f'<animateTransform attributeName="transform" type="scale"'
                f' values="1;{intensity};1" dur="{dur}" begin="{begin:.3f}s"'
                f' repeatCount="{repeat}" additive="sum"'
                f' calcMode="spline" keyTimes="0;0.5;1"'
                f' keySplines="0.4 0 0.2 1;0.4 0 0.2 1"/>'
            )

        elif atype == "blink":
            out.append(
                f'<animate attributeName="opacity"'
                f' values="1;0.18;1" dur="{dur}" begin="{begin:.3f}s"'
                f' repeatCount="{repeat}"'
                f' calcMode="spline" keyTimes="0;0.5;1"'
                f' keySplines="0.4 0 0.2 1;0.4 0 0.2 1"/>'
            )

        elif atype == "draw":
            length = a.get("length", 300)
            out.append(
                f'<animate attributeName="stroke-dashoffset"'
                f' from="{length}" to="0" dur="{dur}" begin="{begin:.3f}s"'
                f' fill="freeze"'
                f' calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>'
            )

        elif atype == "fade_out":
            fv = a.get("from", 1)
            tv = a.get("to", 0)
            out.append(
                f'<animate attributeName="opacity"'
                f' from="{fv}" to="{tv}" dur="{dur}" begin="{begin:.3f}s"'
                f' fill="freeze"'
                f' calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>'
            )

    return out


# ─────────────────────────────────────────────────────────────────────────────
# ELEMENT ENTRANCE  — fade only for non-asset types
# ─────────────────────────────────────────────────────────────────────────────

def _entrance(start: float, opacity: float, dur: float,
              scale: float, has_translate: bool) -> list[str]:
    """
    Return entrance animation strings for a wrapper <g>.

    Rules:
      • Opacity fade-in:  always emitted.
      • Scale spring-in:  ONLY when has_translate=True (asset type with
                          translate group transform centred on element).
        For everything else, only the opacity fade is emitted — clean,
        no swing, no fly-in from corner.
    """
    out = [
        f'<animate attributeName="opacity"'
        f' from="0" to="{opacity:.2f}" dur="{dur:.2f}s" begin="{start:.3f}s"'
        f' fill="freeze" calcMode="spline" keyTimes="0;1"'
        f' keySplines="0.4 0 0.2 1"/>'
    ]
    if has_translate:
        out.append(
            f'<animateTransform attributeName="transform" type="scale"'
            f' from="0.55" to="{scale:.3f}" dur="{dur * 0.85:.2f}s"'
            f' begin="{start:.3f}s" fill="freeze" additive="sum"'
            f' calcMode="spline" keyTimes="0;1"'
            f' keySplines="0.175 0.885 0.32 1.1"/>'
        )
    return out


# ─────────────────────────────────────────────────────────────────────────────
# ELEMENT COMPILER
# ─────────────────────────────────────────────────────────────────────────────

def _compile_el(el: dict, theme: dict) -> str:
    """
    Compile one JSON element to an SVG <g> fragment.

    POSITION MODEL (no double-apply):
      • type == "asset":  group gets translate(cx,cy). Shape renders at (0,0).
                          has_translate = True → scale entrance is SAFE.
      • all other types:  group has NO transform. All coordinates are
                          absolute canvas values from props (x,y / cx,cy).
                          has_translate = False → NO scale entrance (opacity only).
    """
    eid    = el.get("id", "el")
    etype  = el.get("type", "circle")
    props  = dict(el.get("props", {}))
    start  = float(el.get("start_time", 0))
    anim_j = el.get("animations", [])
    custom = el.get("custom", {})

    scale       = float(custom.get("scale", 1.0))
    opacity_val = float(custom.get("opacity", 1.0))
    accent_idx  = int(custom.get("accent_index", 0))
    color       = custom.get("color",
                    theme["accents"][accent_idx % len(theme["accents"])])
    ent_dur     = float(custom.get("entrance_dur", 0.5))
    use_shadow  = custom.get("shadow", False)
    rotate      = float(custom.get("rotate", 0))

    # ── Determine if this element gets a centring group translate ─────────
    is_asset     = (etype == "asset")
    has_translate = is_asset   # only assets are centred via group translate

    # Build group transform
    if is_asset:
        cx = float(el.get("cx", el.get("x", 400)))
        cy = float(el.get("cy", el.get("y", 250)))
        rotate_part = f" rotate({rotate})" if rotate else ""
        g_transform = f' transform="translate({cx},{cy}){rotate_part}"'
    elif rotate:
        # Non-asset with rotation: use group transform but still no scale entrance
        # Derive centre from props for rotate pivot
        rx = float(props.get("cx", props.get("x", 400)))
        ry = float(props.get("cy", props.get("y", 250)))
        g_transform = f' transform="translate({rx},{ry}) rotate({rotate})"'
        # Note: if we add translate here for rotation pivot, we do NOT
        # set has_translate=True — scale still not safe because coords
        # in props still reference absolute canvas positions.
    else:
        g_transform = ""

    filter_attr = ' filter="url(#edu-shadow)"' if use_shadow else ""

    out = [
        f'<g id="{_x(eid)}"{g_transform}'
        f' opacity="0" color="{color}"{filter_attr}>'
    ]

    # Entrance animations
    for s in _entrance(start, opacity_val, ent_dur, scale, has_translate):
        out.append(f"  {s}")

    # Custom animations (scale/pulse guarded by has_translate)
    for s in _anims(anim_j, default_begin=start, has_translate=has_translate):
        out.append(f"  {s}")

    # ── Shape content ────────────────────────────────────────────────────
    TC  = theme["text"]
    MC  = theme["muted"]
    SC  = theme["surface"]

    if etype == "asset":
        sid = el.get("asset_id", "")
        # Look up symbol dimensions from the asset library
        vw, vh = _ASSET_VIEWBOX_CACHE.get(sid, (60.0, 60.0))
        # "size" sets the rendered height in px; width scales by aspect ratio
        size   = float(el.get("size", 60))
        aspect = vw / vh if vh else 1.0
        rw     = size * aspect
        rh     = size
        # Centre the <use> on (0,0) of the translated group
        ux, uy = -rw / 2, -rh / 2

        if sid in _ASSET_VIEWBOX_CACHE:
            out.append(
                f'  <use href="#{_x(sid)}"'
                f' x="{ux:.3f}" y="{uy:.3f}"'
                f' width="{rw:.3f}" height="{rh:.3f}"/>'
            )
        else:
            # Placeholder: dashed box + id label for unknown asset IDs
            out.append(
                f'  <rect x="{ux:.0f}" y="{uy:.0f}"'
                f' width="{rw:.0f}" height="{rh:.0f}"'
                f' rx="6" fill="none" stroke="{color}"'
                f' stroke-width="1.5" stroke-dasharray="6 3"/>'
            )
            out.append(
                f'  <text x="0" y="5" text-anchor="middle"'
                f' fill="{color}" font-size="9"'
                f' font-family="{_fm()}">?{_x(sid)}</text>'
            )
        if "label" in el:
            ly = el.get("label_y", rh / 2 + 18)
            out.append(
                f'  <text y="{ly:.1f}" text-anchor="middle" dominant-baseline="middle"'
                f' fill="{TC}" font-size="13" font-weight="600"'
                f' font-family="{_ff()}">{_x(el["label"])}</text>'
            )
        if "sublabel" in el:
            ly = el.get("label_y", rh / 2 + 18)
            out.append(
                f'  <text y="{ly + 18:.1f}" text-anchor="middle" dominant-baseline="middle"'
                f' fill="{MC}" font-size="11"'
                f' font-family="{_ff()}">{_x(el["sublabel"])}</text>'
            )

    elif etype == "text":
        content   = _x(props.get("content", ""))
        multiline = el.get("multiline", [])
        attr_str  = _props_str(props)
        lh        = el.get("line_height", 20)
        if multiline:
            ax = props.get("x", 0)
            out.append(f'  <text {attr_str} font-family="{_ff()}">')
            for i, ln in enumerate(multiline):
                dy = 0 if i == 0 else lh
                out.append(f'    <tspan x="{ax}" dy="{dy}">{_x(ln)}</tspan>')
            out.append("  </text>")
        else:
            out.append(f'  <text {attr_str} font-family="{_ff()}">{content}</text>')

    elif etype == "circle":
        out.append(f"  <circle {_props_str(props)}/>")

    elif etype == "ellipse":
        out.append(f"  <ellipse {_props_str(props)}/>")

    elif etype == "rect":
        out.append(f"  <rect {_props_str(props)}/>")

    elif etype == "line":
        has_draw = any(a.get("type") == "draw" for a in anim_j)
        if has_draw:
            length = next((a.get("length", 300)
                           for a in anim_j if a.get("type") == "draw"), 300)
            out.append(
                f'  <line {_props_str(props)}'
                f' stroke-dasharray="{length}" stroke-dashoffset="{length}"/>'
            )
        else:
            out.append(f"  <line {_props_str(props)}/>")

    elif etype == "path":
        has_draw = any(a.get("type") == "draw" for a in anim_j)
        if has_draw:
            length = next((a.get("length", 400)
                           for a in anim_j if a.get("type") == "draw"), 400)
            out.append(
                f'  <path {_props_str(props)}'
                f' stroke-dasharray="{length}" stroke-dashoffset="{length}"/>'
            )
        else:
            out.append(f"  <path {_props_str(props)}/>")

    elif etype in ("polygon", "polyline"):
        out.append(f"  <{etype} {_props_str(props)}/>")

    else:
        content = props.pop("content", None)
        attr_s  = _props_str(props)
        if content is not None:
            out.append(f"  <{etype} {attr_s}>{_x(content)}</{etype}>")
        else:
            out.append(f"  <{etype} {attr_s}/>")

    out.append("</g>")
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────────────────────
# CONNECTOR COMPILER
# ─────────────────────────────────────────────────────────────────────────────

def _compile_conn(conn: dict, theme: dict) -> str:
    cid       = conn.get("id", "conn")
    fx, fy    = conn.get("from_pos", [0, 250])
    tx, ty    = conn.get("to_pos",   [100, 250])
    style     = conn.get("style", "solid")
    has_arrow = conn.get("arrow", True)
    label     = conn.get("label", "")
    start     = float(conn.get("start_time", 0))
    color     = conn.get("color", theme["muted"])
    ctrl      = conn.get("control")

    if ctrl:
        cx2, cy2 = ctrl
        d = f"M {fx} {fy} Q {cx2} {cy2} {tx} {ty}"
        seg = (math.hypot(cx2-fx, cy2-fy) + math.hypot(tx-cx2, ty-cy2)) * 1.1
        mx, my = 0.25*fx+0.5*cx2+0.25*tx, 0.25*fy+0.5*cy2+0.25*ty
    else:
        d = f"M {fx} {fy} L {tx} {ty}"
        seg = math.hypot(tx-fx, ty-fy) + 10
        mx, my = (fx+tx)/2, (fy+ty)/2

    draw_dur   = max(0.3, seg / 500)
    arrow_attr = ' marker-end="url(#edu-arrow)"' if has_arrow else ""
    post_dash  = ("10 6" if style == "dashed"
                  else "3 7" if style == "dotted"
                  else f"{seg:.0f}")

    out = [
        f'<g id="{_x(cid)}" opacity="0">',
        (f'  <animate attributeName="opacity" from="0" to="1"'
         f' dur="0.35s" begin="{start:.3f}s" fill="freeze"'
         f' calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>'),
        (f'  <path d="{d}" fill="none" stroke="{color}" stroke-width="1.8"'
         f'{arrow_attr} opacity="0.75"'
         f' stroke-dasharray="{seg:.0f}" stroke-dashoffset="{seg:.0f}">'),
        (f'    <animate attributeName="stroke-dashoffset"'
         f' from="{seg:.0f}" to="0" dur="{draw_dur:.2f}s"'
         f' begin="{start:.3f}s" fill="freeze"'
         f' calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>'),
        (f'    <animate attributeName="stroke-dasharray"'
         f' from="{seg:.0f}" to="{post_dash}"'
         f' dur="0.001s" begin="{start + draw_dur:.3f}s" fill="freeze"/>'),
        '  </path>',
    ]
    if label:
        out.append(
            f'  <text x="{mx:.1f}" y="{my - 10:.1f}" text-anchor="middle"'
            f' fill="{theme["muted"]}" font-size="11" font-weight="500"'
            f' font-family="{_ff()}" opacity="0.85">{_x(label)}</text>'
        )
    out.append("</g>")
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────────────────────
# SCENE COMPILER  — time-gated with fade in/out, NO scale on wrapper
# ─────────────────────────────────────────────────────────────────────────────

def _compile_scene(sid: str, scene: dict, theme: dict) -> str:
    s_start = float(scene.get("scene_start", 0))
    s_end   = float(scene.get("scene_end",   s_start + 8))
    fade_in  = 0.5
    fade_out = 0.4
    fo_begin = max(s_start + fade_in, s_end - fade_out)

    out = [
        f'<!-- ═══ {sid}  [{s_start:.1f}s – {s_end:.1f}s] ═══ -->',
        f'<g id="scene-{_x(sid)}" opacity="0">',
        # Fade IN — opacity only, NO scale (scene wrapper has no centring translate)
        (f'  <animate attributeName="opacity" from="0" to="1"'
         f' dur="{fade_in:.2f}s" begin="{s_start:.3f}s" fill="freeze"'
         f' calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>'),
        # Fade OUT
        (f'  <animate attributeName="opacity" from="1" to="0"'
         f' dur="{fade_out:.2f}s" begin="{fo_begin:.3f}s" fill="freeze"'
         f' calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>'),
    ]

    bg = scene.get("background")
    if bg:
        out.append(f'  <rect width="800" height="500" fill="{_x(bg)}"/>')

    for conn in scene.get("connectors", []):
        out.append(_compile_conn(conn, theme))
    for el in scene.get("elements", []):
        out.append(_compile_el(el, theme))

    out.append(f"</g>  <!-- /scene-{_x(sid)} -->")
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────────────────────
# SVG DEFS
# ─────────────────────────────────────────────────────────────────────────────

def _defs(theme: dict, asset_symbols: str = "") -> str:
    """
    Build the single SVG <defs> block.
    All 459 asset library symbols are injected here so <use href="#s-id">
    references resolve correctly anywhere in the document.
    """
    parts = [
        "  <defs>",
        f'    <filter id="edu-shadow" x="-25%" y="-25%" width="150%" height="150%">',
        f'      <feDropShadow dx="0" dy="2" stdDeviation="4"',
        f'                    flood-color="{theme["shadow"]}" flood-opacity="1"/>',
        f'    </filter>',
        f'    <pattern id="edu-grid" width="40" height="40" patternUnits="userSpaceOnUse">',
        f'      <path d="M 40 0 L 0 0 0 40" fill="none"',
        f'            stroke="{theme["grid"]}" stroke-width="0.75"/>',
        f'    </pattern>',
        f'    <marker id="edu-arrow" markerWidth="7" markerHeight="7"',
        f'            refX="5" refY="3" orient="auto" markerUnits="strokeWidth">',
        f'      <path d="M 0 0.5 L 5 3 L 0 5.5 Z" fill="context-stroke"/>',
        f'    </marker>',
    ]
    if asset_symbols:
        parts.append(f'    <!-- asset library: 459 symbols from asset.svg -->')
        parts.append(asset_symbols)
    parts.append("  </defs>")
    return "\n".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
# TITLE BAR
# ─────────────────────────────────────────────────────────────────────────────

def _title_bar(meta: dict, theme: dict) -> str:
    title    = _x(meta.get("title", ""))
    subtitle = _x(meta.get("subtitle", ""))
    if not title:
        return ""
    bar_h = 44 if not subtitle else 62
    out = [
        '<g id="edu-title" opacity="0">',
        ('  <animate attributeName="opacity" from="0" to="1"'
         ' dur="0.5s" begin="0s" fill="freeze"'
         ' calcMode="spline" keyTimes="0;1" keySplines="0.4 0 0.2 1"/>'),
        f'  <rect x="0" y="0" width="800" height="{bar_h + 4}"'
        f' fill="{theme["bg"]}" opacity="0.93"/>',
        f'  <rect x="20" y="10" width="4" height="{bar_h - 4}"'
        f' rx="2" fill="{theme["accents"][0]}"/>',
        f'  <text x="32" y="28" dominant-baseline="middle"'
        f' fill="{theme["text"]}" font-size="18" font-weight="700"'
        f' font-family="{_ff()}">{title}</text>',
    ]
    if subtitle:
        out.append(
            f'  <text x="32" y="50" dominant-baseline="middle"'
            f' fill="{theme["muted"]}" font-size="12"'
            f' font-family="{_ff()}">{subtitle}</text>'
        )
    out.append("</g>")
    return "\n".join(out)


# ─────────────────────────────────────────────────────────────────────────────
# SUBTITLE HUD
# RULE: <animate>/<animateTransform> are siblings of <text> inside a <g>.
#       They are NEVER nested inside the <text> element itself.
#       No scale animation on HUD — opacity + translateY only.
# ─────────────────────────────────────────────────────────────────────────────



# ─────────────────────────────────────────────────────────────────────────────
# MASTER COMPILER
# ─────────────────────────────────────────────────────────────────────────────

def kydy_compile(json_input: str, asset_path: str = "") -> str:
    """
    Compile a Kydy teaching-animation JSON into a complete SVG document.

    ┌─────────────────────────────────────────────────────────────────────┐
    │  JSON SCHEMA (top-level)                                            │
    │  ─────────────────────────────────────────────────────────────────  │
    │  {                                                                  │
    │    "theme":    "dark" | "light" | "blueprint" | "warm",            │
    │    "meta":     { "title", "subtitle", "description" },             │
    │    "canvas":   { "width": 800, "height": 500 },                    │
    │    "scenes": {                                                      │
    │      "scene1": {                                                    │
    │        "scene_start": 0.0,                                         │
    │        "scene_end":   9.0,                                         │
    │        "background":  "#hex",   (optional)                         │
    │        "elements":    [ ...Element ],                               │
    │        "connectors":  [ ...Connector ]                             │
    │      }                                                              │
    │    },                                                               │
    │    "narration": [ { "text", "start", "dur" } ]                     │
    │  }                                                                  │
    │                                                                     │
    │  ELEMENT SCHEMA                                                     │
    │  ─────────────────────────────────────────────────────────────────  │
    │  {                                                                  │
    │    "id":          str,                                              │
    │    "type":        "text" | "rect" | "circle" | "ellipse" |         │
    │                   "line" | "path" | "polygon" | "polyline" |       │
    │                   "asset",                                          │
    │    "props":       { SVG attrs; "content" key for text body },       │
    │    "start_time":  float,   (absolute seconds from t=0)             │
    │    "animations":  [ Animation ],                                    │
    │    "custom": {                                                      │
    │      "scale":        float,   (default 1.0)                        │
    │      "opacity":      float,   (default 1.0)                        │
    │      "color":        "#hex",                                        │
    │      "accent_index": int,     (0-7, theme accent list)             │
    │      "shadow":       bool,                                          │
    │      "entrance_dur": float,   (seconds, default 0.5)               │
    │      "rotate":       float    (degrees)                             │
    │    },                                                               │
    │    // asset-only:                                                   │
    │    "asset_id": str,   "cx": float, "cy": float,                    │
    │    "label": str,      "sublabel": str,  "label_y": float           │
    │  }                                                                  │
    │                                                                     │
    │  ANIMATION TYPES                                                    │
    │  ─────────────────────────────────────────────────────────────────  │
    │  { "type": "fade",     "from":0, "to":1, "begin":t, "dur":"1s" }  │
    │  { "type": "scale",    "from":"0","to":"1", ... }  (asset only)    │
    │  { "type": "move",     "path":"M…", "begin":t, "dur":"2s",         │
    │                        "repeat":"indefinite" }                      │
    │  { "type": "rotate",   "from":"0","to":"360", "cx":x, "cy":y }    │
    │  { "type": "pulse",    "intensity":1.07, ... }     (asset only)    │
    │  { "type": "blink",    "dur":"1.5s", "repeat":"indefinite" }       │
    │  { "type": "draw",     "length":300, "begin":t, "dur":"0.6s" }    │
    │  { "type": "fade_out", "begin":t, "dur":"0.4s" }                   │
    │                                                                     │
    │  SCALE / PULSE SAFETY RULE (engine enforced, no JSON config needed)│
    │  scale and pulse animations are automatically ignored for any       │
    │  element that does not have type=="asset". For non-asset elements   │
    │  they are silently converted to fade entrances. This prevents the  │
    │  "swing from top-left corner" bug permanently.                      │
    └─────────────────────────────────────────────────────────────────────┘
    """
    data  = json.loads(json_input)
    tkey  = data.get("theme", "dark")
    theme = dict(THEMES.get(tkey, THEMES["dark"]))
    if data.get("accents"):
        theme["accents"] = data["accents"]

    meta = data.get("meta", {})
    cw   = int(data.get("canvas", {}).get("width",  800))
    ch   = int(data.get("canvas", {}).get("height", 500))

    # Load external asset library (all 459 symbols, de-duplicated)
    asset_symbols, _viewboxes = _load_assets(asset_path)

    parts = [
        f'<svg viewBox="0 0 {cw} {ch}"'
        f' xmlns="http://www.w3.org/2000/svg"'
        f' style="border-radius:12px; display:block;">',
    ]
    if meta.get("title"):
        parts.append(f'  <title>{_x(meta["title"])}</title>')
    if meta.get("description"):
        parts.append(f'  <desc>{_x(meta["description"])}</desc>')

    parts.append(_defs(theme, asset_symbols))
    parts.append(f'  <rect width="{cw}" height="{ch}" fill="{theme["bg"]}"/>')
    parts.append(f'  <rect width="{cw}" height="{ch}" fill="url(#edu-grid)" opacity="0.5"/>')

    scenes = data.get("scenes", {})
    if scenes:
        for sid, scene in scenes.items():
            parts.append(_compile_scene(sid, scene, theme))
    else:
        for conn in data.get("connectors", []):
            parts.append(_compile_conn(conn, theme))
        for el in data.get("elements", []):
            parts.append(_compile_el(el, theme))

    tb = _title_bar(meta, theme)
    if tb:
        parts.append(tb)

   # hud = _hud(data.get("narration", []), theme)
   # if hud:
     #   parts.append(hud)

    

    parts.append("</svg>")
    return "\n".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys, os

    json_path  = "/Users/kabil/Desktop/Projects/Kydy_frontend/Kydy_AI4BH/kydy_engine/photosynthesis.json"
    asset_path = "/Users/kabil/Desktop/Projects/Kydy_frontend/Kydy_AI4BH/kydy_engine/asset.svg"

    if json_path and os.path.exists(json_path):
        with open(json_path) as f:
            raw = f.read()
        out_path = json_path.replace(".json", ".svg")
    else:
        # Demo: shows both legacy named assets AND new s-* symbol IDs
        raw = json.dumps({
            "theme": "dark",
            "meta": {"title": "Kydy Engine v6+ — Asset Library Demo"},
            "canvas": {"width": 800, "height": 500},
            "scenes": {
                "s1": {
                    "scene_start": 0, "scene_end": 10,
                    "elements": [
                        {"id":"t1","type":"text","props":{"x":400,"y":60,
                         "content":"v6+: External Asset Library",
                         "fill":"#f1f5f9","font-size":"24","font-weight":"700",
                         "text-anchor":"middle"},"start_time":0.3,
                         "animations":[{"type":"fade","from":0,"to":1,"dur":"0.8s"}]},
                        {"id":"a1","type":"asset","asset_id":"s-atom",
                         "cx":160,"cy":240,"size":80,"label":"Atom",
                         "start_time":0.8,
                         "animations":[{"type":"rotate","from":"0","to":"360",
                                        "begin":0.8,"dur":"6s","repeat":"indefinite","fill":"auto"}],
                         "custom":{"accent_index":0,"entrance_dur":0.7}},
                        {"id":"a2","type":"asset","asset_id":"s-net-database",
                         "cx":400,"cy":260,"size":90,"label":"Database",
                         "start_time":1.1,
                         "animations":[{"type":"pulse","intensity":1.08,
                                        "begin":1.8,"dur":"2.5s","repeat":"indefinite"}],
                         "custom":{"accent_index":1,"entrance_dur":0.7}},
                        {"id":"a3","type":"asset","asset_id":"s-chart-line",
                         "cx":640,"cy":240,"size":80,"label":"Analytics",
                         "start_time":1.4,
                         "custom":{"accent_index":2,"entrance_dur":0.7}},
                        {"id":"a4","type":"asset","asset_id":"s-resistor-iec",
                         "cx":200,"cy":380,"size":55,"label":"Resistor",
                         "start_time":1.8,
                         "custom":{"accent_index":4,"entrance_dur":0.6}},
                        {"id":"a5","type":"asset","asset_id":"s-battery",
                         "cx":400,"cy":390,"size":55,"label":"Battery",
                         "start_time":2.1,
                         "custom":{"accent_index":2,"entrance_dur":0.6}},
                        {"id":"a6","type":"asset","asset_id":"s-led",
                         "cx":600,"cy":380,"size":55,"label":"LED",
                         "start_time":2.4,
                         "custom":{"accent_index":3,"entrance_dur":0.6}},
                    ]
                }
            },
            "narration": [
                {"text":"v6+: All 459 symbols from asset.svg available as s-* IDs.",
                 "start":0.4,"dur":9.0}
            ]
        })
        out_path = "kydy_v6p_demo.svg"

    print(f"Kydy Engine v6+  |  compiling → {out_path}")
    svg = kydy_compile(raw, asset_path)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"✓  {len(svg):,} chars  |  {svg.count(chr(10))} lines")