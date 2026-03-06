"""
SVG Scene Generator  v3.0
=========================
Built-in 424-symbol asset library + sequential single-viewport slideshow.

Usage:
    python svg_generator_v3.py <scene.json> [output.svg]

All scenes play in the same screen space, transitioning automatically.
Any of the 424 built-in s-* symbol ids (or their aliases) can be used as
component names in your JSON file.

Examples of component names:
    battery, resistor, opamp, sphere-3d, cube, led, nmos, bar-chart,
    wifi, tree, rocket, heart-fill, gate-xor, flow-decision ...
"""

import json
import sys
import re as _re
from pathlib import Path


C = {
    "blue":    "#58a6ff",
    "cyan":    "#79c0ff",
    "teal":    "#4ecdc4",
    "green":   "#3fb950",
    "yellow":  "#e3b341",
    "orange":  "#ffa657",
    "red":     "#f78166",
    "pink":    "#ff79c6",
    "purple":  "#d2a8ff",
    "violet":  "#bc8cff",
    "white":   "#f0f6fc",
    "gray":    "#8b949e",
    "dark":    "#21262d",
    "gold":    "#ffd700",
    "lime":    "#a8ff3e",
    "brown":   "#c9a96e",
    "sky":     "#87ceeb",
    "rose":    "#ff6b9d",
    "indigo":  "#6366f1",
    "amber":   "#f59e0b",
}

def c(name): return C.get(name, "#58a6ff")

# ─── symbol builder helpers ───────────────────────────────────────────────────
def sym(sid, vw, vh, *children, extra=""):
    inner = "\n    ".join(children)
    return f'<symbol id="{sid}" viewBox="0 0 {vw} {vh}" {extra}>\n    {inner}\n  </symbol>'

def circle(cx,cy,r,fill="none",stroke=None,sw=2,extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"{s} {extra}/>'

def rect(x,y,w,h,rx=0,fill="none",stroke=None,sw=2,extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    rx_s = f' rx="{rx}"' if rx else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}"{rx_s} fill="{fill}"{s} {extra}/>'

def line(x1,y1,x2,y2,stroke,sw=2,extra=""):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" {extra}/>'

def poly(pts,fill="none",stroke=None,sw=2,extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"' if stroke else ""
    return f'<polygon points="{pts}" fill="{fill}"{s} {extra}/>'

def path(d,fill="none",stroke=None,sw=2,extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<path d="{d}" fill="{fill}"{s} stroke-linecap="round" stroke-linejoin="round" {extra}/>'

def text(x,y,t,fill,fs=10,anchor="middle",weight="normal",extra=""):
    return f'<text x="{x}" y="{y}" font-size="{fs}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" font-family="monospace" {extra}>{t}</text>'

def ellipse(cx,cy,rx,ry,fill="none",stroke=None,sw=2,extra=""):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}"{s} {extra}/>'

def polyline(pts,stroke,sw=2,extra=""):
    return f'<polyline points="{pts}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'

def grad_linear(gid, x1,y1,x2,y2, stops):
    stop_els = ""
    for offset,(col,op) in stops:
        stop_els += f'<stop offset="{offset}" stop-color="{col}" stop-opacity="{op}"/>'
    return f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" gradientUnits="objectBoundingBox">{stop_els}</linearGradient>'

def grad_radial(gid, stops):
    stop_els = ""
    for offset,(col,op) in stops:
        stop_els += f'<stop offset="{offset}" stop-color="{col}" stop-opacity="{op}"/>'
    return f'<radialGradient id="{gid}">{stop_els}</radialGradient>'

# ─── all symbols ──────────────────────────────────────────────────────────────
SYMBOLS = []
DEFS_EXTRA = []   # gradients etc.

# ══════════════════════════════════════════════════════════════════════════════
# §1  BASIC SHAPES — OUTLINED
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-circle-out",60,60, circle(30,30,26,stroke=c("blue"),sw=2.5)),
  sym("s-square-out",60,60, rect(5,5,50,50,rx=2,stroke=c("blue"),sw=2.5)),
  sym("s-rect-out",60,60, rect(4,12,52,36,rx=2,stroke=c("blue"),sw=2.5)),
  sym("s-triangle-out",60,60, poly("30,4 56,56 4,56",stroke=c("blue"),sw=2.5)),
  sym("s-rtriangle-out",60,60, poly("4,56 4,4 56,56",stroke=c("blue"),sw=2.5)),
  sym("s-pentagon-out",60,60, poly("30,4 57,23 46,54 14,54 3,23",stroke=c("blue"),sw=2.5)),
  sym("s-hexagon-out",60,60, poly("30,4 53,17 53,43 30,56 7,43 7,17",stroke=c("blue"),sw=2.5)),
  sym("s-heptagon-out",60,60, poly("30,3 54,14 58,40 43,57 17,57 2,40 6,14",stroke=c("blue"),sw=2.5)),
  sym("s-octagon-out",60,60, poly("20,4 40,4 56,20 56,40 40,56 20,56 4,40 4,20",stroke=c("blue"),sw=2.5)),
  sym("s-nonagon-out",60,60, poly("30,3 52,11 60,33 51,53 30,60 9,53 0,33 8,11",stroke=c("blue"),sw=2.5)),
  sym("s-decagon-out",60,60, poly("30,2 49,8 59,26 56,46 42,57 18,57 4,46 1,26 11,8",stroke=c("blue"),sw=2.5)),
  sym("s-diamond-out",60,60, poly("30,4 56,30 30,56 4,30",stroke=c("blue"),sw=2.5)),
  sym("s-rhombus-out",60,60, poly("30,8 54,30 30,52 6,30",stroke=c("blue"),sw=2.5)),
  sym("s-star5-out",60,60, poly("30,3 36,23 57,23 40,36 47,57 30,44 13,57 20,36 3,23 24,23",stroke=c("blue"),sw=2.5)),
  sym("s-star6-out",60,60, poly("30,4 36,20 53,20 40,30 46,47 30,38 14,47 20,30 7,20 24,20",stroke=c("blue"),sw=2.5)),
  sym("s-star8-out",60,60, poly("30,2 35,18 49,11 42,25 58,30 42,35 49,49 35,42 30,58 25,42 11,49 18,35 2,30 18,25 11,11 25,18",stroke=c("blue"),sw=2.5)),
  sym("s-ellipse-out",60,60, ellipse(30,30,27,17,stroke=c("blue"),sw=2.5)),
  sym("s-parallelogram-out",60,60, poly("16,10 56,10 44,50 4,50",stroke=c("blue"),sw=2.5)),
  sym("s-trapezoid-out",60,60, poly("14,10 46,10 56,50 4,50",stroke=c("blue"),sw=2.5)),
  sym("s-cross-out",60,60, path("M22,4 H38 V22 H56 V38 H38 V56 H22 V38 H4 V22 H22 Z",stroke=c("blue"),sw=2.5)),
  sym("s-arrow-right-out",60,60, path("M4,24 H38 V14 L56,30 L38,46 V36 H4 Z",stroke=c("blue"),sw=2.5)),
  sym("s-arrow-left-out",60,60, path("M56,24 H22 V14 L4,30 L22,46 V36 H56 Z",stroke=c("blue"),sw=2.5)),
  sym("s-arrowhead-out",60,60, poly("4,14 30,4 56,14 56,46 30,56 4,46",stroke=c("blue"),sw=2.5)),
  sym("s-chevron-out",60,60, path("M4,10 L30,50 L56,10 L50,10 L30,40 L10,10 Z",stroke=c("blue"),sw=2.5)),
  sym("s-crescent-out",60,60, path("M30,4 A26,26 0 1,1 30,56 A16,20 0 1,0 30,4 Z",stroke=c("blue"),sw=2.5)),
  sym("s-heart-out",60,60, path("M30,50 C10,34 2,22 2,16 C2,8 10,4 18,4 C24,4 28,8 30,12 C32,8 36,4 42,4 C50,4 58,8 58,16 C58,22 50,34 30,50 Z",stroke=c("red"),sw=2.5)),
  sym("s-cloud-out",60,60, path("M14,44 C6,44 2,38 4,32 C2,30 2,24 6,22 C6,12 14,8 22,12 C26,6 34,4 42,8 C50,4 58,10 56,20 C60,22 60,30 56,34 C58,40 54,46 46,46 Z",stroke=c("cyan"),sw=2)),
  sym("s-lightning-out",60,60, poly("34,4 14,32 28,32 26,56 46,28 32,28",stroke=c("yellow"),sw=2.5)),
  sym("s-shield-out",60,60, path("M30,4 L54,14 L54,34 C54,46 42,56 30,58 C18,56 6,46 6,34 L6,14 Z",stroke=c("blue"),sw=2.5)),
  sym("s-flag-out",60,60, path("M10,4 L10,56 M10,4 L50,4 L50,28 L10,28",stroke=c("red"),sw=2.5)),
  sym("s-gear-out",60,60, path("M28,4 L32,4 L32,10 C36,11 40,13 43,16 L48,12 L52,16 L48,20 C50,23 52,27 52,30 L58,30 L58,34 L52,34 C51,38 49,42 46,44 L50,48 L46,52 L42,48 C39,50 35,51 32,52 L32,56 L28,56 L28,52 C24,51 20,50 17,48 L14,52 L10,48 L14,44 C11,42 9,38 8,34 L2,34 L2,30 L8,30 C8,27 10,23 12,20 L8,16 L12,12 L17,16 C20,13 24,11 28,10 Z M30,22 A8,8 0 1,0 30,38 A8,8 0 1,0 30,22",stroke=c("gray"),sw=2)),
  sym("s-speech-out",60,60, path("M4,4 L56,4 L56,40 L34,40 L24,56 L24,40 L4,40 Z",stroke=c("cyan"),sw=2.5)),
  sym("s-thought-out",60,60, path("M10,36 C4,32 2,24 6,18 C6,10 14,4 24,6 C28,2 36,2 42,6 C50,4 58,10 56,20 C60,26 58,36 50,40 C48,46 40,50 32,48 L10,48 Z",stroke=c("cyan"),sw=2)),
  sym("s-badge-out",60,60, path("M30,4 L36,20 L54,20 L40,32 L46,50 L30,40 L14,50 L20,32 L6,20 L24,20 Z",stroke=c("gold"),sw=2)),
  sym("s-infinity-out",80,40, path("M16,20 C16,10 24,4 32,4 C40,4 44,10 48,20 C52,30 56,36 64,36 C72,36 80,30 80,20 C80,10 72,4 64,4 C56,4 52,10 48,20 C44,30 40,36 32,36 C24,36 16,30 16,20 Z",stroke=c("purple"),sw=2)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §2  BASIC SHAPES — FILLED (solid colour fills)
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-circle-fill",60,60, circle(30,30,26,fill=c("blue"))),
  sym("s-square-fill",60,60, rect(5,5,50,50,rx=2,fill=c("blue"))),
  sym("s-rect-fill",60,60, rect(4,12,52,36,rx=2,fill=c("blue"))),
  sym("s-triangle-fill",60,60, poly("30,4 56,56 4,56",fill=c("blue"))),
  sym("s-diamond-fill",60,60, poly("30,4 56,30 30,56 4,30",fill=c("blue"))),
  sym("s-pentagon-fill",60,60, poly("30,4 57,23 46,54 14,54 3,23",fill=c("blue"))),
  sym("s-hexagon-fill",60,60, poly("30,4 53,17 53,43 30,56 7,43 7,17",fill=c("blue"))),
  sym("s-octagon-fill",60,60, poly("20,4 40,4 56,20 56,40 40,56 20,56 4,40 4,20",fill=c("blue"))),
  sym("s-star5-fill",60,60, poly("30,3 36,23 57,23 40,36 47,57 30,44 13,57 20,36 3,23 24,23",fill=c("yellow"))),
  sym("s-star6-fill",60,60, poly("30,4 36,20 53,20 40,30 46,47 30,38 14,47 20,30 7,20 24,20",fill=c("yellow"))),
  sym("s-heart-fill",60,60, path("M30,50 C10,34 2,22 2,16 C2,8 10,4 18,4 C24,4 28,8 30,12 C32,8 36,4 42,4 C50,4 58,8 58,16 C58,22 50,34 30,50 Z",fill=c("red"))),
  sym("s-cloud-fill",60,60, path("M14,44 C6,44 2,38 4,32 C2,30 2,24 6,22 C6,12 14,8 22,12 C26,6 34,4 42,8 C50,4 58,10 56,20 C60,22 60,30 56,34 C58,40 54,46 46,46 Z",fill=c("white"))),
  sym("s-lightning-fill",60,60, poly("34,4 14,32 28,32 26,56 46,28 32,28",fill=c("yellow"))),
  sym("s-shield-fill",60,60, path("M30,4 L54,14 L54,34 C54,46 42,56 30,58 C18,56 6,46 6,34 L6,14 Z",fill=c("blue"))),
  sym("s-ellipse-fill",60,60, ellipse(30,30,27,17,fill=c("blue"))),
  sym("s-cross-fill",60,60, path("M22,4 H38 V22 H56 V38 H38 V56 H22 V38 H4 V22 H22 Z",fill=c("red"))),
  sym("s-crescent-fill",60,60, path("M30,4 A26,26 0 1,1 30,56 A16,20 0 1,0 30,4 Z",fill=c("yellow"))),
  sym("s-drop-fill",60,60, path("M30,4 C30,4 10,28 10,40 A20,20 0 0,0 50,40 C50,28 30,4 30,4 Z",fill=c("cyan"))),
  sym("s-drop-out",60,60, path("M30,4 C30,4 10,28 10,40 A20,20 0 0,0 50,40 C50,28 30,4 30,4 Z",stroke=c("cyan"),sw=2.5)),
  sym("s-semicircle-fill",60,60, path("M4,30 A26,26 0 0,1 56,30 Z",fill=c("blue"))),
  sym("s-arc-out",60,60, path("M8,52 A28,28 0 0,1 52,52",stroke=c("blue"),sw=3)),
  sym("s-ring-out",60,60, circle(30,30,22,stroke=c("blue"),sw=8)),
  sym("s-ring-fill",60,60,
      circle(30,30,26,fill=c("blue")),
      circle(30,30,14,fill="#0d1117")),
  sym("s-pie-fill",60,60,
      circle(30,30,26,fill=c("blue")),
      path("M30,30 L56,30 A26,26 0 0,0 30,4 Z",fill=c("yellow"))),
  sym("s-rounded-rect-fill",60,60, rect(5,12,50,36,rx=10,fill=c("blue"))),
  sym("s-rounded-rect-out",60,60, rect(5,12,50,36,rx=10,stroke=c("blue"),sw=2.5)),
  sym("s-capsule-fill",60,60, rect(4,18,52,24,rx=12,fill=c("blue"))),
  sym("s-capsule-out",60,60, rect(4,18,52,24,rx=12,stroke=c("blue"),sw=2.5)),
  sym("s-hexagon-fill-alt",60,60,
      poly("30,4 53,17 53,43 30,56 7,43 7,17",fill=c("teal")),
      text(30,33,"HEX",c("dark"),fs=11,weight="bold")),
]

# ══════════════════════════════════════════════════════════════════════════════
# §3  3D SHAPES
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  # 3D Cube
  sym("s-cube-3d",80,70,
      poly("10,50 40,60 70,50 40,40",fill="#1a3a5c",stroke=c("cyan"),sw=1.5),
      poly("10,50 10,20 40,10 40,40",fill="#2d5a8a",stroke=c("cyan"),sw=1.5),
      poly("40,40 70,50 70,20 40,10",fill="#1e4070",stroke=c("cyan"),sw=1.5),
      line(10,20,40,10,c("cyan"),1.5), line(40,10,70,20,c("cyan"),1.5),
      line(70,20,70,50,c("cyan"),1.5), line(10,20,10,50,c("cyan"),1.5)),
  # 3D Sphere
  sym("s-sphere-3d",60,60,
      'f<defs><radialGradient id="gSph" cx="35%" cy="35%"><stop offset="0%" stop-color="#79c0ff"/><stop offset="100%" stop-color="#0d2236"/></radialGradient></defs>'.replace("f",""),
      circle(30,30,26,fill="url(#gSph)"),
      ellipse(30,42,16,5,fill="none",stroke="rgba(255,255,255,0.2)",sw=1)),
  # 3D Cylinder
  sym("s-cylinder-3d",60,80,
      rect(8,20,44,42,fill="#1e3a5c",stroke=c("cyan"),sw=1.5),
      ellipse(30,20,22,8,fill="#2d5a8a",stroke=c("cyan"),sw=1.5),
      ellipse(30,62,22,8,fill="#1a2f4a",stroke=c("cyan"),sw=1.5)),
  # 3D Cone
  sym("s-cone-3d",60,80,
      path("M30,4 L6,66 L54,66 Z",fill="#1e3a5c",stroke=c("orange"),sw=1.5),
      ellipse(30,66,24,8,fill="#2d5a8a",stroke=c("orange"),sw=1.5)),
  # 3D Pyramid
  sym("s-pyramid-3d",70,70,
      poly("35,4 4,62 35,52",fill="#2d5a8a",stroke=c("cyan"),sw=1.5),
      poly("35,4 35,52 66,62",fill="#1e3a5c",stroke=c("cyan"),sw=1.5),
      poly("4,62 35,52 66,62",fill="#132840",stroke=c("cyan"),sw=1.5)),
  # 3D Torus
  sym("s-torus-3d",70,60,
      ellipse(35,30,30,16,fill="none",stroke=c("purple"),sw=8),
      ellipse(35,30,30,16,fill="none",stroke="#0d1117",sw=4,extra='stroke-dasharray="14 14" stroke-dashoffset="7"')),
  # 3D Prism (triangular)
  sym("s-prism-3d",80,70,
      poly("10,60 40,60 25,20",fill="#2d5a8a",stroke=c("cyan"),sw=1.5),
      poly("40,60 70,60 55,20 25,20",fill="#1e4070",stroke=c("cyan"),sw=1.5),
      poly("10,60 40,60 70,60",fill="#132840",stroke=c("cyan"),sw=1.5)),
  # 3D Box (open top)
  sym("s-box-open-3d",80,70,
      poly("10,28 40,18 70,28 70,56 40,66 10,56",fill="none",stroke=c("yellow"),sw=1.5),
      poly("10,28 40,38 70,28",fill="none",stroke=c("yellow"),sw=1.5),
      line(40,38,40,66,c("yellow"),1.5)),
  # 3D Diamond/Gem
  sym("s-gem-3d",70,70,
      poly("35,4 62,28 35,66 8,28",fill="#1e3a5c",stroke=c("violet"),sw=1.5),
      poly("35,4 62,28 35,28",fill="#2d5a8a",stroke=c("violet"),sw=1.5),
      poly("8,28 35,28 35,66",fill="#1a2f4a",stroke=c("violet"),sw=1.5),
      line(8,28,62,28,c("violet"),1.5)),
  # 3D Capsule
  sym("s-capsule-3d",80,40,
      rect(20,6,40,28,fill="#1e3a5c",stroke=c("cyan"),sw=1.5),
      ellipse(20,20,14,14,fill="#2d5a8a",stroke=c("cyan"),sw=1.5),
      ellipse(60,20,14,14,fill="#2d5a8a",stroke=c("cyan"),sw=1.5)),
  # 3D Spiral / Helix
  sym("s-helix-3d",60,80,
      path("M10,10 Q50,20 10,30 Q50,40 10,50 Q50,60 10,70",fill="none",stroke=c("teal"),sw=2.5),
      path("M50,10 Q10,20 50,30 Q10,40 50,50 Q10,60 50,70",fill="none",stroke=c("cyan"),sw=2,extra='stroke-dasharray="3,3"')),
  # 3D Mobius strip (approximation)
  sym("s-mobius-3d",80,50,
      path("M10,25 C20,10 40,10 50,25 C60,40 80,40 70,25 C60,10 40,10 50,25 C60,40 20,40 10,25",
           fill="none",stroke=c("purple"),sw=2.5)),
  # 3D Pipe
  sym("s-pipe-3d",80,40,
      ellipse(20,20,8,14,fill="#1a2f4a",stroke=c("gray"),sw=1.5),
      rect(20,6,40,28,fill="#1e3a5c",stroke=c("gray"),sw=1),
      ellipse(60,20,8,14,fill="#2d5a8a",stroke=c("gray"),sw=1.5)),
  # 3D Ring / Donut
  sym("s-donut-3d",70,60,
      ellipse(35,50,30,10,fill="#1a2f4a",stroke=c("orange"),sw=1),
      ellipse(35,30,30,16,fill="none",stroke=c("orange"),sw=10),
      ellipse(35,30,30,16,fill="none",stroke=c("amber"),sw=6,extra='opacity="0.5"')),
  # 3D Arrow (3D extruded)
  sym("s-arrow-3d",80,60,
      poly("10,30 50,30 50,16 70,30 50,44 50,30",fill="#1e3a5c",stroke=c("blue"),sw=1.5),
      poly("10,30 10,40 50,40 50,44 70,30",fill="#132840",stroke=c("blue"),sw=1)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §4  ELECTRONIC — PASSIVE COMPONENTS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-resistor-ieee",100,40,
      line(0,20,20,20,c("orange"),2.5),
      polyline("20,20 24,8 30,32 36,8 42,32 48,8 54,32 60,8 66,8 70,20 80,20",c("orange"),2.5),
      line(80,20,100,20,c("orange"),2.5)),
  sym("s-resistor-iec",100,40,
      line(0,20,20,20,c("orange"),2.5),
      rect(20,10,60,20,rx=2,stroke=c("orange"),sw=2.5),
      line(80,20,100,20,c("orange"),2.5)),
  sym("s-resistor-var",100,50,
      line(0,25,20,25,c("orange"),2.5),
      polyline("20,25 25,13 32,37 39,13 46,37 53,13 60,37 67,13 72,25 80,25",c("orange"),2.5),
      line(80,25,100,25,c("orange"),2.5),
      path("M50,36 L50,14",stroke=c("yellow"),sw=1.5),
      poly("50,10 46,17 54,17",fill=c("yellow"))),
  sym("s-capacitor",100,50,
      line(0,25,42,25,c("cyan"),2.5),
      line(42,8,42,42,c("cyan"),3),
      line(58,8,58,42,c("cyan"),3),
      line(58,25,100,25,c("cyan"),2.5)),
  sym("s-capacitor-pol",100,50,
      line(0,25,42,25,c("cyan"),2.5),
      line(42,8,42,42,c("cyan"),3),
      path("M58,8 Q68,25 58,42",fill="none",stroke=c("cyan"),sw=3),
      line(58,25,100,25,c("cyan"),2.5),
      text(36,7,"+",c("cyan"),fs=10)),
  sym("s-capacitor-var",100,50,
      line(0,25,42,25,c("cyan"),2.5),
      line(42,8,42,42,c("cyan"),3),
      line(58,8,58,42,c("cyan"),3),
      line(58,25,100,25,c("cyan"),2.5),
      path("M35,40 L65,10",stroke=c("yellow"),sw=1.5),
      poly("65,8 60,14 67,16",fill=c("yellow"))),
  sym("s-inductor",120,40,
      line(0,20,18,20,c("purple"),2.5),
      path("M18,20 Q22,8 30,20 Q34,8 42,20 Q46,8 54,20 Q58,8 66,20 Q70,8 78,20 Q82,8 90,20 Q94,8 102,20",fill="none",stroke=c("purple"),sw=2.5),
      line(102,20,120,20,c("purple"),2.5)),
  sym("s-inductor-iron",120,44,
      line(0,22,18,22,c("purple"),2.5),
      path("M18,22 Q22,10 30,22 Q34,10 42,22 Q46,10 54,22 Q58,10 66,22 Q70,10 78,22 Q82,10 90,22 Q94,10 102,22",fill="none",stroke=c("purple"),sw=2.5),
      line(102,22,120,22,c("purple"),2.5),
      line(18,6,102,6,c("gray"),2),
      line(18,2,102,2,c("gray"),2)),
  sym("s-transformer",130,70,
      path("M10,35 Q14,22 22,35 Q26,22 34,35 Q38,22 46,35 Q50,22 58,35",fill="none",stroke=c("purple"),sw=2.5),
      line(65,10,65,60,c("gray"),2,extra='stroke-dasharray="4,3"'),
      line(71,10,71,60,c("gray"),2,extra='stroke-dasharray="4,3"'),
      path("M120,35 Q116,22 108,35 Q104,22 96,35 Q92,22 84,35 Q80,22 72,35",fill="none",stroke=c("purple"),sw=2.5),
      line(0,20,10,20,c("purple"),2.5), line(0,50,58,50,c("purple"),2.5),
      line(120,20,130,20,c("purple"),2.5), line(72,50,130,50,c("purple"),2.5)),
  sym("s-crystal",100,40,
      line(0,20,22,20,c("green"),2),
      line(22,8,22,32,c("green"),3),
      rect(26,12,26,16,stroke=c("green"),sw=2.5),
      line(52,8,52,32,c("green"),3),
      line(52,20,100,20,c("green"),2)),
  sym("s-fuse",100,40,
      line(0,20,20,20,c("orange"),2.5),
      rect(20,12,60,16,rx=8,stroke=c("orange"),sw=2.5),
      path("M30,20 Q40,10 50,20 Q60,30 70,20",fill="none",stroke=c("orange"),sw=1.5),
      line(80,20,100,20,c("orange"),2.5)),
  sym("s-battery",100,50,
      line(0,25,25,25,c("green"),2.5),
      line(25,10,25,40,c("green"),4),
      line(35,17,35,33,c("green"),2),
      line(45,10,45,40,c("green"),4),
      line(55,17,55,33,c("green"),2),
      line(65,10,65,40,c("green"),4),
      line(75,17,75,33,c("green"),2),
      line(75,25,100,25,c("green"),2.5)),
  sym("s-photoresistor",100,50,
      line(0,25,20,25,c("orange"),2.5),
      polyline("20,25 25,13 32,37 39,13 46,37 53,13 60,37 67,13 72,25 80,25",c("orange"),2.5),
      line(80,25,100,25,c("orange"),2.5),
      path("M60,8 L70,2",stroke=c("yellow"),sw=1.5),
      path("M66,14 L78,10",stroke=c("yellow"),sw=1.5)),
  sym("s-thermistor",100,50,
      line(0,25,20,25,c("orange"),2.5),
      polyline("20,25 25,13 32,37 39,13 46,37 53,13 60,37 67,13 72,25 80,25",c("orange"),2.5),
      line(80,25,100,25,c("orange"),2.5),
      text(50,14,"T",c("red"),fs=12,weight="bold")),
  sym("s-varistor",100,40,
      line(0,20,20,20,c("orange"),2.5),
      rect(20,10,60,20,rx=2,stroke=c("orange"),sw=2.5),
      text(50,24,"VR",c("orange"),fs=10)),
  sym("s-potentiometer",100,50,
      line(0,25,20,25,c("orange"),2.5),
      polyline("20,25 25,13 32,37 39,13 46,37 53,13 60,37 67,13 72,25 80,25",c("orange"),2.5),
      line(80,25,100,25,c("orange"),2.5),
      line(50,38,50,50,c("yellow"),1.5),
      poly("50,42 46,36 54,36",fill=c("yellow"))),
]

# ══════════════════════════════════════════════════════════════════════════════
# §5  ELECTRONIC — DIODES & SEMICONDUCTORS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-diode",100,40,
      line(0,20,30,20,c("orange"),2.5),
      poly("30,8 30,32 62,20",fill=c("orange")),
      line(62,8,62,32,c("orange"),3),
      line(62,20,100,20,c("orange"),2.5)),
  sym("s-zener",100,40,
      line(0,20,30,20,c("orange"),2.5),
      poly("30,8 30,32 62,20",fill=c("orange")),
      path("M55,8 L62,8 L62,32 L69,32",stroke=c("orange"),sw=2.5),
      line(62,20,100,20,c("orange"),2.5)),
  sym("s-schottky",100,40,
      line(0,20,30,20,c("orange"),2.5),
      poly("30,8 30,32 62,20",fill=c("orange")),
      path("M55,32 L55,26 L62,26 L62,8 L69,8 L69,14",stroke=c("orange"),sw=2.5),
      line(62,20,100,20,c("orange"),2.5)),
  sym("s-led",100,50,
      line(0,25,25,25,c("green"),2.5),
      poly("25,13 25,37 57,25",fill=c("green")),
      line(57,13,57,37,c("green"),3),
      line(57,25,100,25,c("green"),2.5),
      line(65,10,75,4,c("green"),1.5),
      line(70,16,82,12,c("green"),1.5)),
  sym("s-photodiode",100,50,
      line(0,25,25,25,c("orange"),2.5),
      poly("25,13 25,37 57,25",fill=c("orange")),
      line(57,13,57,37,c("orange"),3),
      line(57,25,100,25,c("orange"),2.5),
      line(75,8,65,18,c("yellow"),1.5),
      line(80,14,70,22,c("yellow"),1.5)),
  sym("s-tvs-diode",100,40,
      line(0,20,30,20,c("red"),2.5),
      poly("30,8 30,32 62,20",fill=c("red")),
      path("M55,8 L62,8 L62,32 L69,32",stroke=c("red"),sw=2.5),
      line(42,8,55,8,c("red"),2),
      line(62,32,75,32,c("red"),2),
      line(62,20,100,20,c("red"),2.5)),
  sym("s-tunnel-diode",100,40,
      line(0,20,30,20,c("violet"),2.5),
      poly("62,8 62,32 30,20",fill=c("violet")),
      line(30,8,30,32,c("violet"),3),
      line(30,20,0,20,c("violet"),2.5),
      line(62,20,100,20,c("violet"),2.5)),
  sym("s-varactor",100,40,
      line(0,20,30,20,c("cyan"),2.5),
      poly("30,8 30,32 62,20",fill=c("cyan")),
      line(62,8,62,32,c("cyan"),3),
      line(72,8,72,32,c("cyan"),2),
      line(62,20,100,20,c("cyan"),2.5)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §6  ELECTRONIC — TRANSISTORS & FETs
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-npn",80,80,
      line(0,40,30,40,c("yellow"),2.5),
      line(30,20,30,60,c("yellow"),3),
      line(30,25,55,10,c("yellow"),2.5), line(55,10,55,0,c("yellow"),2.5),
      line(30,55,55,70,c("yellow"),2.5), line(55,70,55,80,c("yellow"),2.5),
      poly("43,60 50,56 46,65",fill=c("yellow")),
      text(60,12,"C",c("yellow"),fs=9), text(-8,44,"B",c("yellow"),fs=9), text(60,80,"E",c("yellow"),fs=9)),
  sym("s-pnp",80,80,
      line(0,40,30,40,c("yellow"),2.5),
      line(30,20,30,60,c("yellow"),3),
      line(30,25,55,10,c("yellow"),2.5), line(55,10,55,0,c("yellow"),2.5),
      line(30,55,55,70,c("yellow"),2.5), line(55,70,55,80,c("yellow"),2.5),
      poly("37,29 32,36 43,31",fill=c("yellow")),
      text(60,12,"C",c("yellow"),fs=9), text(-8,44,"B",c("yellow"),fs=9), text(60,80,"E",c("yellow"),fs=9)),
  sym("s-nmos",80,90,
      line(55,0,55,28,c("violet"),2.5), line(55,62,55,90,c("violet"),2.5),
      line(0,45,30,45,c("violet"),2.5),
      line(30,20,30,70,c("violet"),3),
      line(38,28,38,42,c("violet"),3), line(38,48,38,62,c("violet"),3),
      line(38,28,55,28,c("violet"),2.5), line(38,62,55,62,c("violet"),2.5),
      line(38,45,55,45,c("violet"),2,extra='stroke-dasharray="3,2"'),
      poly("46,45 40,41 40,49",fill=c("violet")),
      text(60,12,"D",c("violet"),fs=9), text(-8,48,"G",c("violet"),fs=9), text(60,90,"S",c("violet"),fs=9)),
  sym("s-pmos",80,90,
      line(55,0,55,28,c("violet"),2.5), line(55,62,55,90,c("violet"),2.5),
      line(0,45,30,45,c("violet"),2.5),
      line(30,20,30,70,c("violet"),3),
      line(38,28,38,42,c("violet"),3), line(38,48,38,62,c("violet"),3),
      line(38,28,55,28,c("violet"),2.5), line(38,62,55,62,c("violet"),2.5),
      line(38,45,55,45,c("violet"),2,extra='stroke-dasharray="3,2"'),
      poly("46,41 52,45 46,49",fill=c("violet")),
      text(60,12,"D",c("violet"),fs=9), text(-8,48,"G",c("violet"),fs=9), text(60,90,"S",c("violet"),fs=9)),
  sym("s-jfet-n",80,80,
      line(55,0,55,80,c("teal"),2.5),
      line(0,40,40,40,c("teal"),2.5),
      line(40,25,40,55,c("teal"),3),
      line(40,40,55,40,c("teal"),2.5),
      poly("48,40 42,36 42,44",fill=c("teal")),
      text(60,12,"D",c("teal"),fs=9), text(-8,44,"G",c("teal"),fs=9), text(60,80,"S",c("teal"),fs=9)),
  sym("s-igbt",80,90,
      line(55,0,55,28,c("orange"),2.5), line(55,62,55,90,c("orange"),2.5),
      line(0,45,30,45,c("orange"),2.5),
      line(30,20,30,70,c("orange"),3),
      line(38,28,38,62,c("orange"),3),
      line(38,28,55,28,c("orange"),2.5), line(38,62,55,62,c("orange"),2.5),
      poly("43,62 50,58 46,67",fill=c("orange")),
      text(60,12,"C",c("orange"),fs=9), text(-8,48,"G",c("orange"),fs=9), text(60,90,"E",c("orange"),fs=9)),
  sym("s-scr",80,80,
      line(0,40,25,40,c("red"),2.5),
      poly("25,28 25,52 55,40",fill=c("red")),
      line(55,28,55,52,c("red"),3),
      line(55,40,80,40,c("red"),2.5),
      line(40,52,40,70,c("red"),2), line(40,70,60,70,c("red"),2),
      text(62,72,"G",c("red"),fs=9)),
  sym("s-triac",80,80,
      line(0,40,80,40,c("red"),2.5),
      poly("20,28 20,52 50,40",fill=c("red"),stroke=c("red"),sw=1),
      poly("50,28 50,52 20,40",fill=c("red"),stroke=c("red"),sw=1),
      line(50,28,50,52,c("red"),2.5), line(20,28,20,52,c("red"),2.5),
      line(35,52,35,70,c("red"),2), line(35,70,55,70,c("red"),2),
      text(57,72,"G",c("red"),fs=9)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §7  ELECTRONIC — AMPLIFIERS & ICs
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-opamp",90,70,
      poly("10,5 10,65 80,35",fill="none",stroke=c("cyan"),sw=2.5),
      line(0,20,10,20,c("cyan"),2.5), line(0,50,10,50,c("cyan"),2.5),
      line(80,35,90,35,c("cyan"),2.5),
      text(14,24,"+",c("cyan"),fs=11), text(14,54,"-",c("cyan"),fs=11)),
  sym("s-comparator",90,70,
      poly("10,5 10,65 80,35",fill="none",stroke=c("violet"),sw=2.5),
      line(0,20,10,20,c("violet"),2.5), line(0,50,10,50,c("violet"),2.5),
      line(80,35,90,35,c("violet"),2.5),
      circle(84,35,4,fill="none",stroke=c("violet"),sw=2),
      text(14,24,"+",c("violet"),fs=11), text(14,54,"-",c("violet"),fs=11)),
  sym("s-schmitt",80,50,
      poly("10,5 10,45 70,25",fill="none",stroke=c("violet"),sw=2.5),
      line(0,25,10,25,c("violet"),2.5), line(70,25,80,25,c("violet"),2.5),
      path("M26,31 L26,26 L32,26 L32,19 L38,19 L38,26 L44,26 L44,31",fill="none",stroke=c("violet"),sw=1.5)),
  sym("s-ic-8pin",100,100,
      rect(20,10,60,80,rx=4,stroke=c("cyan"),sw=2.5),
      line(5,25,20,25,c("cyan"),2), line(5,40,20,40,c("cyan"),2),
      line(5,55,20,55,c("cyan"),2), line(5,70,20,70,c("cyan"),2),
      line(80,25,95,25,c("cyan"),2), line(80,40,95,40,c("cyan"),2),
      line(80,55,95,55,c("cyan"),2), line(80,70,95,70,c("cyan"),2),
      path("M34,10 Q50,18 66,10",fill="none",stroke=c("cyan"),sw=1.5),
      text(50,55,"IC",c("cyan"),fs=14,weight="bold")),
  sym("s-ic-dip14",120,100,
      rect(20,10,80,80,rx=4,stroke=c("cyan"),sw=2),
      *[line(5,18+d*12,20,18+d*12,c("cyan"),1.5) for d in range(6)],
      *[line(100,18+d*12,115,18+d*12,c("cyan"),1.5) for d in range(6)],
      path("M42,10 Q60,18 78,10",fill="none",stroke=c("cyan"),sw=1.5),
      text(60,55,"DIP-14",c("cyan"),fs=9)),
  sym("s-555-timer",100,100,
      rect(15,5,70,90,rx=4,stroke=c("orange"),sw=2),
      line(0,20,15,20,c("orange"),2), line(0,35,15,35,c("orange"),2),
      line(0,50,15,50,c("orange"),2), line(0,65,15,65,c("orange"),2),
      line(85,20,100,20,c("orange"),2), line(85,35,100,35,c("orange"),2),
      line(85,50,100,50,c("orange"),2), line(85,65,100,65,c("orange"),2),
      text(50,52,"555",c("orange"),fs=16,weight="bold")),
  sym("s-adc",100,70,
      rect(10,5,80,60,rx=4,stroke=c("green"),sw=2),
      line(0,20,10,20,c("green"),2), line(0,35,10,35,c("green"),2),
      line(0,50,10,50,c("green"),2),
      line(90,20,100,20,c("green"),2), line(90,35,100,35,c("green"),2),
      line(90,50,100,50,c("green"),2),
      text(50,38,"ADC",c("green"),fs=12,weight="bold")),
  sym("s-dac",100,70,
      rect(10,5,80,60,rx=4,stroke=c("blue"),sw=2),
      line(0,20,10,20,c("blue"),2), line(0,35,10,35,c("blue"),2),
      line(0,50,10,50,c("blue"),2),
      line(90,20,100,20,c("blue"),2), line(90,35,100,35,c("blue"),2),
      line(90,50,100,50,c("blue"),2),
      text(50,38,"DAC",c("blue"),fs=12,weight="bold")),
  sym("s-mux",80,90,
      poly("10,5 10,85 70,70 70,20",fill="none",stroke=c("teal"),sw=2),
      line(0,20,10,20,c("teal"),2), line(0,35,10,35,c("teal"),2),
      line(0,50,10,50,c("teal"),2), line(0,65,10,65,c("teal"),2),
      line(70,45,80,45,c("teal"),2),
      line(35,85,35,95,c("teal"),1.5),
      text(40,46,"MUX",c("teal"),fs=9)),
  sym("s-flipflop",90,80,
      rect(10,10,70,60,rx=4,stroke=c("yellow"),sw=2),
      line(0,25,10,25,c("yellow"),2), line(0,55,10,55,c("yellow"),2),
      line(80,25,90,25,c("yellow"),2), line(80,55,90,55,c("yellow"),2),
      line(10,55,22,55,c("yellow"),2,extra='stroke-dasharray="3,3"'),
      text(20,28,"D",c("yellow"),fs=9), text(15,58,"CLK",c("yellow"),fs=7),
      text(72,28,"Q",c("yellow"),fs=9), text(67,58,"Q'",c("yellow"),fs=9),
      text(45,44,"FF",c("yellow"),fs=14,weight="bold")),
]

# ══════════════════════════════════════════════════════════════════════════════
# §8  ELECTRONIC — POWER & SOURCES
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-vsource",60,80,
      line(30,0,30,18,c("red"),2.5),
      circle(30,40,22,stroke=c("red"),sw=2.5),
      line(30,62,30,80,c("red"),2.5),
      text(30,32,"+",c("red"),fs=12), text(30,52,"-",c("red"),fs=12)),
  sym("s-isource",60,80,
      line(30,0,30,18,c("green"),2.5),
      circle(30,40,22,stroke=c("green"),sw=2.5),
      line(30,62,30,80,c("green"),2.5),
      line(30,26,30,54,c("green"),2),
      poly("30,22 25,30 35,30",fill=c("green"))),
  sym("s-ac-source",60,80,
      line(30,0,30,18,c("blue"),2.5),
      circle(30,40,22,stroke=c("blue"),sw=2.5),
      line(30,62,30,80,c("blue"),2.5),
      path("M18,40 Q22,30 26,40 Q30,50 34,40 Q38,30 42,40",fill="none",stroke=c("blue"),sw=1.5)),
  sym("s-ground",50,40,
      line(25,0,25,14,c("gray"),2.5),
      line(5,14,45,14,c("gray"),2.5),
      line(11,22,39,22,c("gray"),2.5),
      line(18,30,32,30,c("gray"),2.5)),
  sym("s-chassis-gnd",50,44,
      line(25,0,25,12,c("gray"),2.5),
      line(5,12,45,12,c("gray"),2.5),
      line(5,12,15,28,c("gray"),2), line(15,28,25,12,c("gray"),2),
      line(25,12,35,28,c("gray"),2), line(35,28,45,12,c("gray"),2)),
  sym("s-vcc",40,40,
      line(20,40,20,20,c("red"),2.5),
      line(4,20,36,20,c("red"),2.5),
      text(20,14,"VCC",c("red"),fs=8)),
  sym("s-vdd",40,40,
      line(20,40,20,20,c("cyan"),2.5),
      line(4,20,36,20,c("cyan"),2.5),
      text(20,14,"VDD",c("cyan"),fs=8)),
  sym("s-gnd-earth",50,50,
      line(25,0,25,16,c("gray"),2.5),
      line(5,16,45,16,c("gray"),2.5),
      line(11,24,39,24,c("gray"),2.5),
      line(18,32,32,32,c("gray"),2.5),
      line(23,40,27,40,c("gray"),2)),
  sym("s-power-plug",60,70,
      rect(15,20,30,30,rx=4,stroke=c("yellow"),sw=2),
      line(22,10,22,20,c("yellow"),3), line(38,10,38,20,c("yellow"),3),
      line(10,50,50,50,c("yellow"),2), line(30,50,30,60,c("yellow"),2),
      ellipse(30,64,8,6,stroke=c("yellow"),sw=1.5)),
  sym("s-solar-cell",100,50,
      line(0,25,25,25,c("yellow"),2.5),
      line(25,10,25,40,c("yellow"),3), line(35,14,35,36,c("yellow"),2),
      line(45,10,45,40,c("yellow"),3), line(55,14,55,36,c("yellow"),2),
      line(65,10,65,40,c("yellow"),3), line(75,14,75,36,c("yellow"),2),
      line(75,25,100,25,c("yellow"),2.5),
      path("M46,6 L50,2",stroke=c("orange"),sw=1.5),
      path("M54,10 L60,4",stroke=c("orange"),sw=1.5)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §9  ELECTRONIC — SENSORS & TRANSDUCERS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-microphone",60,70,
      rect(20,5,20,36,rx=10,stroke=c("yellow"),sw=2.5),
      path("M10,32 Q10,56 30,56 Q50,56 50,32",fill="none",stroke=c("yellow"),sw=2.5),
      line(30,56,30,68,c("yellow"),2.5),
      line(16,68,44,68,c("yellow"),2.5)),
  sym("s-speaker",80,70,
      rect(5,22,20,26,rx=2,stroke=c("purple"),sw=2.5),
      poly("25,22 55,8 55,62 25,48",fill="none",stroke=c("purple"),sw=2.5),
      path("M60,22 Q70,35 60,48",fill="none",stroke=c("purple"),sw=2),
      path("M65,16 Q80,35 65,54",fill="none",stroke=c("purple"),sw=2)),
  sym("s-buzzer",60,60,
      path("M30,5 Q54,16 54,44 L6,44 Q6,16 30,5 Z",stroke=c("orange"),sw=2.5),
      line(6,44,54,44,c("orange"),3),
      circle(30,52,5,stroke=c("orange"),sw=2.5)),
  sym("s-lamp",60,80,
      circle(30,30,22,stroke=c("orange"),sw=2.5),
      line(20,50,40,50,c("orange"),2.5), line(22,56,38,56,c("orange"),2.5),
      line(30,56,30,68,c("orange"),2.5),
      path("M22,44 Q16,36 16,28 Q16,12 30,12 Q44,12 44,28 Q44,36 38,44",fill="none",stroke=c("orange"),sw=2.5),
      path("M22,44 Q26,36 30,40 Q34,44 38,36",fill="none",stroke=c("orange"),sw=1.5)),
  sym("s-motor",80,80,
      circle(40,40,30,stroke=c("cyan"),sw=2.5),
      text(40,47,"M",c("cyan"),fs=20,weight="bold"),
      line(40,10,40,0,c("cyan"),2.5), line(40,70,40,80,c("cyan"),2.5)),
  sym("s-generator",80,80,
      circle(40,40,30,stroke=c("green"),sw=2.5),
      text(40,47,"G",c("green"),fs=20,weight="bold"),
      line(40,10,40,0,c("green"),2.5), line(40,70,40,80,c("green"),2.5)),
  sym("s-antenna",60,70,
      line(30,60,30,35,c("cyan"),2.5),
      line(10,60,50,60,c("cyan"),2.5),
      line(30,35,10,10,c("cyan"),2.5), line(30,35,30,5,c("cyan"),2.5),
      line(30,35,50,10,c("cyan"),2.5)),
  sym("s-thermocouple",80,50,
      line(0,25,30,25,c("red"),2.5),
      line(0,25,30,25,c("orange"),2.5,extra='stroke-dasharray="6,3"'),
      circle(30,25,5,fill=c("orange"),stroke=c("red"),sw=1.5),
      line(30,25,80,25,c("red"),2.5)),
  sym("s-sensor-generic",70,70,
      circle(35,35,28,stroke=c("violet"),sw=2),
      text(35,40,"SNS",c("violet"),fs=11),
      line(5,35,7,35,c("violet"),2), line(63,35,65,35,c("violet"),2)),
  sym("s-hall-sensor",70,50,
      rect(10,10,50,30,rx=4,stroke=c("teal"),sw=2),
      text(35,28,"H",c("teal"),fs=14,weight="bold"),
      line(0,20,10,20,c("teal"),2), line(0,35,10,35,c("teal"),2),
      line(60,20,70,20,c("teal"),2), line(60,35,70,35,c("teal"),2)),
  sym("s-pressure-sensor",70,50,
      rect(10,10,50,30,rx=4,stroke=c("blue"),sw=2),
      path("M20,30 Q35,14 50,30",fill="none",stroke=c("blue"),sw=2),
      poly("50,30 46,24 54,24",fill=c("blue")),
      line(0,20,10,20,c("blue"),2), line(60,20,70,20,c("blue"),2)),
  sym("s-optocoupler",100,70,
      rect(5,5,90,60,rx=4,stroke=c("orange"),sw=2),
      poly("18,18 18,38 38,28",fill=c("orange")),
      line(38,18,38,38,c("orange"),2.5),
      line(5,22,18,22,c("orange"),1.5), line(5,35,18,35,c("orange"),1.5),
      line(50,25,75,15,c("orange"),1.5), line(50,25,75,50,c("orange"),1.5),
      line(50,15,50,55,c("orange"),2.5),
      line(40,22,50,28,c("orange"),1.5),
      line(75,15,95,15,c("orange"),1.5), line(75,50,95,50,c("orange"),1.5)),
  sym("s-relay",90,70,
      rect(5,5,80,60,rx=3,stroke=c("purple"),sw=2),
      path("M15,35 Q18,28 22,35 Q26,28 30,35 Q34,28 38,35 Q42,28 46,35 Q50,28 54,35 Q58,28 62,35 Q66,28 70,35",fill="none",stroke=c("purple"),sw=1.5),
      line(0,22,5,22,c("purple"),2), line(0,35,5,35,c("purple"),2),
      line(85,20,90,20,c("purple"),2),
      line(85,20,85,16,c("purple"),2), line(78,16,92,16,c("purple"),1.5),
      path("M80,26 L88,46",stroke=c("purple"),sw=2)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §10  ELECTRONIC — CONNECTORS & MISC
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-switch-spst",100,40,
      line(0,20,25,20,c("cyan"),2.5), circle(25,20,3,fill=c("cyan")),
      path("M28,20 L72,10",stroke=c("cyan"),sw=2.5),
      circle(75,20,3,fill=c("cyan")), line(75,20,100,20,c("cyan"),2.5)),
  sym("s-switch-spdt",100,60,
      line(0,30,25,30,c("cyan"),2.5), circle(25,30,3,fill=c("cyan")),
      path("M28,30 L72,18",stroke=c("cyan"),sw=2.5),
      circle(75,18,3,fill=c("cyan")), line(75,18,100,18,c("cyan"),2.5),
      circle(75,42,3,fill=c("cyan")), line(75,42,100,42,c("cyan"),2.5)),
  sym("s-switch-push",80,50,
      line(0,35,20,35,c("cyan"),2.5), line(60,35,80,35,c("cyan"),2.5),
      circle(20,35,4,stroke=c("cyan"),sw=2), circle(60,35,4,stroke=c("cyan"),sw=2),
      line(20,20,60,20,c("cyan"),2,extra='stroke-dasharray="4,4"'),
      line(20,20,20,28,c("cyan"),2), line(60,20,60,28,c("cyan"),2)),
  sym("s-junction",20,20, circle(10,10,5,fill=c("blue"))),
  sym("s-crossover",60,60,
      line(0,30,24,30,c("gray"),2.5), line(36,30,60,30,c("gray"),2.5),
      path("M26,22 Q30,30 34,22",fill="none",stroke=c("gray"),sw=2),
      line(30,0,30,60,c("gray"),2.5)),
  sym("s-test-point",40,50,
      circle(20,20,14,stroke=c("green"),sw=2),
      circle(20,20,4,fill=c("green")),
      line(20,34,20,48,c("green"),2)),
  sym("s-connector-2pin",60,50,
      rect(5,10,50,30,rx=2,stroke=c("cyan"),sw=2),
      circle(18,25,5,stroke=c("cyan"),sw=2),
      circle(42,25,5,stroke=c("cyan"),sw=2)),
  sym("s-connector-bnc",70,50,
      circle(35,25,18,stroke=c("cyan"),sw=2),
      circle(35,25,5,fill=c("cyan")),
      line(0,25,17,25,c("cyan"),2), line(53,25,70,25,c("cyan"),2),
      line(0,18,0,32,c("cyan"),3)),
  sym("s-terminal",40,40,
      rect(5,5,30,30,rx=2,stroke=c("gray"),sw=2),
      circle(20,20,8,stroke=c("gray"),sw=2),
      line(20,5,20,12,c("gray"),2), line(20,28,20,35,c("gray"),2)),
  sym("s-probe",80,30,
      line(0,15,60,15,c("yellow"),2.5),
      path("M60,15 L78,15 L74,10 L80,15 L74,20 Z",fill=c("yellow")),
      circle(8,15,6,stroke=c("yellow"),sw=2)),
  sym("s-ground-wire",60,30,
      line(0,15,60,15,c("gray"),2.5,extra='stroke-dasharray="6,3"')),
  sym("s-coax-cable",100,30,
      line(0,15,100,15,c("orange"),4),
      line(0,15,100,15,c("dark"),2),
      ellipse(10,15,8,12,stroke=c("orange"),sw=1.5),
      ellipse(90,15,8,12,stroke=c("orange"),sw=1.5)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §11  LOGIC GATES
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-gate-not",80,50,
      poly("10,5 10,45 65,25",fill="none",stroke=c("yellow"),sw=2.5),
      circle(69,25,5,stroke=c("yellow"),sw=2.5),
      line(0,25,10,25,c("yellow"),2.5), line(74,25,80,25,c("yellow"),2.5)),
  sym("s-gate-and",90,60,
      path("M15,5 H50 Q75,5 75,30 Q75,55 50,55 H15 Z",stroke=c("green"),sw=2.5),
      line(0,18,15,18,c("green"),2.5), line(0,42,15,42,c("green"),2.5),
      line(75,30,90,30,c("green"),2.5)),
  sym("s-gate-nand",90,60,
      path("M15,5 H50 Q75,5 75,30 Q75,55 50,55 H15 Z",stroke=c("green"),sw=2.5),
      circle(79,30,5,stroke=c("green"),sw=2.5),
      line(0,18,15,18,c("green"),2.5), line(0,42,15,42,c("green"),2.5),
      line(84,30,90,30,c("green"),2.5)),
  sym("s-gate-or",90,60,
      path("M12,5 Q35,5 65,30 Q35,55 12,55 Q28,30 12,5 Z",stroke=c("blue"),sw=2.5),
      line(0,18,22,18,c("blue"),2.5), line(0,42,22,42,c("blue"),2.5),
      line(65,30,90,30,c("blue"),2.5)),
  sym("s-gate-nor",90,60,
      path("M12,5 Q35,5 65,30 Q35,55 12,55 Q28,30 12,5 Z",stroke=c("blue"),sw=2.5),
      circle(69,30,5,stroke=c("blue"),sw=2.5),
      line(0,18,22,18,c("blue"),2.5), line(0,42,22,42,c("blue"),2.5),
      line(74,30,90,30,c("blue"),2.5)),
  sym("s-gate-xor",90,60,
      path("M18,5 Q40,5 68,30 Q40,55 18,55 Q34,30 18,5 Z",stroke=c("red"),sw=2.5),
      path("M8,5 Q18,30 8,55",fill="none",stroke=c("red"),sw=2.5),
      line(0,18,22,18,c("red"),2.5), line(0,42,22,42,c("red"),2.5),
      line(68,30,90,30,c("red"),2.5)),
  sym("s-gate-xnor",90,60,
      path("M18,5 Q40,5 68,30 Q40,55 18,55 Q34,30 18,5 Z",stroke=c("red"),sw=2.5),
      path("M8,5 Q18,30 8,55",fill="none",stroke=c("red"),sw=2.5),
      circle(72,30,5,stroke=c("red"),sw=2.5),
      line(0,18,22,18,c("red"),2.5), line(0,42,22,42,c("red"),2.5),
      line(77,30,90,30,c("red"),2.5)),
  sym("s-gate-buffer",80,50,
      poly("10,5 10,45 65,25",fill="none",stroke=c("yellow"),sw=2.5),
      line(0,25,10,25,c("yellow"),2.5), line(65,25,80,25,c("yellow"),2.5)),
  sym("s-gate-tristate",80,60,
      poly("10,5 10,45 65,25",fill="none",stroke=c("yellow"),sw=2.5),
      line(0,25,10,25,c("yellow"),2.5), line(65,25,80,25,c("yellow"),2.5),
      line(38,45,38,56,c("yellow"),1.5,extra='stroke-dasharray="3,2"'),
      text(38,62,"EN",c("yellow"),fs=7)),
  sym("s-gate-and3",90,70,
      path("M15,5 H50 Q75,5 75,35 Q75,65 50,65 H15 Z",stroke=c("green"),sw=2.5),
      line(0,18,15,18,c("green"),2.5), line(0,35,15,35,c("green"),2.5),
      line(0,52,15,52,c("green"),2.5), line(75,35,90,35,c("green"),2.5)),
  sym("s-gate-or3",90,70,
      path("M12,5 Q35,5 65,35 Q35,65 12,65 Q28,35 12,5 Z",stroke=c("blue"),sw=2.5),
      line(0,18,22,18,c("blue"),2.5), line(0,35,22,35,c("blue"),2.5),
      line(0,52,22,52,c("blue"),2.5), line(65,35,90,35,c("blue"),2.5)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §12  SIGNAL WAVEFORMS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-wave-sine",150,70,
      rect(0,0,150,70,rx=4,fill="#161b22"),
      line(10,35,140,35,c("dark"),1),
      path("M15,35 Q28,5 40,35 Q52,65 65,35 Q78,5 90,35 Q103,65 115,35 Q128,5 140,35",fill="none",stroke=c("purple"),sw=2.5)),
  sym("s-wave-square",150,70,
      rect(0,0,150,70,rx=4,fill="#161b22"),
      line(10,35,140,35,c("dark"),1),
      polyline("15,55 15,15 47,15 47,55 79,55 79,15 111,15 111,55 143,55",c("cyan"),sw=2.5)),
  sym("s-wave-triangle",150,70,
      rect(0,0,150,70,rx=4,fill="#161b22"),
      line(10,35,140,35,c("dark"),1),
      polyline("15,55 31,15 63,55 95,15 127,55 143,35",c("green"),sw=2.5)),
  sym("s-wave-sawtooth",150,70,
      rect(0,0,150,70,rx=4,fill="#161b22"),
      line(10,35,140,35,c("dark"),1),
      polyline("15,55 47,15 47,55 79,15 79,55 111,15 111,55 143,15",c("orange"),sw=2.5)),
  sym("s-wave-pwm",150,70,
      rect(0,0,150,70,rx=4,fill="#161b22"),
      line(10,35,140,35,c("dark"),1),
      polyline("15,55 15,15 28,15 28,55 60,55 60,15 73,15 73,55 105,55 105,15 118,15 118,55 143,55",c("yellow"),sw=2.5)),
  sym("s-wave-noise",150,70,
      rect(0,0,150,70,rx=4,fill="#161b22"),
      line(10,35,140,35,c("dark"),1),
      polyline("15,35 25,20 30,45 38,22 45,50 50,28 58,42 65,15 72,38 80,25 88,48 95,20 102,40 110,18 118,44 126,30 134,50 143,35",c("red"),sw=2)),
  sym("s-wave-dc",150,70,
      rect(0,0,150,70,rx=4,fill="#161b22"),
      line(10,35,140,35,c("dark"),1),
      line(15,55,30,55,c("red"),2.5), line(30,55,30,20,c("red"),2.5),
      line(30,20,143,20,c("red"),2.5)),
  sym("s-wave-ramp",150,70,
      rect(0,0,150,70,rx=4,fill="#161b22"),
      line(10,35,140,35,c("dark"),1),
      polyline("15,55 65,15 65,55 115,15 115,55 143,35",c("violet"),sw=2.5)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §13  FLOWCHART SYMBOLS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-flow-terminal",110,50, rect(5,5,100,40,rx=20,stroke=c("green"),sw=2.5),text(55,29,"START/END",c("green"),fs=10)),
  sym("s-flow-process",110,50, rect(5,5,100,40,rx=3,stroke=c("blue"),sw=2.5),text(55,29,"PROCESS",c("blue"),fs=10)),
  sym("s-flow-decision",110,60, poly("55,5 105,30 55,55 5,30",stroke=c("yellow"),sw=2.5),text(55,33,"YES?",c("yellow"),fs=10)),
  sym("s-flow-io",110,50, poly("20,5 110,5 90,45 0,45",stroke=c("purple"),sw=2.5),text(58,28,"I / O",c("purple"),fs=10)),
  sym("s-flow-db",100,80, ellipse(50,18,40,12,stroke=c("cyan"),sw=2.5),
      line(10,18,10,58,c("cyan"),2.5), line(90,18,90,58,c("cyan"),2.5),
      path("M10,58 Q10,70 50,70 Q90,70 90,58",fill="none",stroke=c("cyan"),sw=2.5),
      text(50,42,"DB",c("cyan"),fs=10)),
  sym("s-flow-document",110,60,
      path("M5,5 H105 V48 Q82,62 58,48 Q34,34 5,48 Z",stroke=c("orange"),sw=2.5),
      text(58,30,"DOC",c("orange"),fs=10)),
  sym("s-flow-predefined",110,50,
      rect(5,5,100,40,rx=3,stroke=c("violet"),sw=2.5),
      line(22,5,22,45,c("violet"),2), line(88,5,88,45,c("violet"),2),
      text(55,29,"FUNC",c("violet"),fs=10)),
  sym("s-flow-delay",110,50,
      path("M5,5 H84 Q105,5 105,25 Q105,45 84,45 H5 Z",stroke=c("red"),sw=2.5),
      text(50,29,"DELAY",c("red"),fs=10)),
  sym("s-flow-storage",110,50,
      path("M20,5 H105 V45 H20 Q5,45 5,25 Q5,5 20,5 Z",stroke=c("teal"),sw=2.5),
      text(58,29,"STORE",c("teal"),fs=10)),
  sym("s-flow-merge",70,70, poly("5,5 65,5 35,65",stroke=c("yellow"),sw=2.5)),
  sym("s-flow-sort",70,70,
      poly("5,35 35,5 65,35",stroke=c("orange"),sw=2.5),
      poly("5,35 35,65 65,35",stroke=c("orange"),sw=2.5)),
  sym("s-flow-offpage",70,60, poly("5,5 65,5 65,40 35,55 5,40",stroke=c("gray"),sw=2.5)),
  sym("s-flow-connector",50,50, circle(25,25,22,stroke=c("red"),sw=2.5),text(25,29,"A",c("red"),fs=12)),
  sym("s-flow-annotation",90,60,
      path("M80,4 L4,4 L4,56 L80,56",fill="none",stroke=c("gray"),sw=2),
      text(45,34,"note",c("gray"),fs=10)),
  sym("s-flow-manual-input",110,50,
      path("M5,20 L105,5 L105,45 L5,45 Z",stroke=c("teal"),sw=2.5),
      text(58,30,"INPUT",c("teal"),fs=10)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §14  ARROWS & CONNECTORS
# ══════════════════════════════════════════════════════════════════════════════
def arrow_marker(mid,col):
    return f'<defs><marker id="{mid}" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="{col}"/></marker></defs>'
def arrow_marker_back(mid,col):
    return f'<defs><marker id="{mid}b" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto"><polygon points="8,0 0,4 8,8" fill="{col}"/></marker></defs>'

SYMBOLS += [
  sym("s-arrow-right",100,30, f'<defs><marker id="ar1" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="{c("blue")}"/></marker></defs>',
      f'<line x1="4" y1="15" x2="96" y2="15" stroke="{c("blue")}" stroke-width="2.5" stroke-linecap="round" marker-end="url(#ar1)"/>'),
  sym("s-arrow-left",100,30, f'<defs><marker id="ar2" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto"><polygon points="8,0 0,4 8,8" fill="{c("blue")}"/></marker></defs>',
      f'<line x1="96" y1="15" x2="4" y2="15" stroke="{c("blue")}" stroke-width="2.5" stroke-linecap="round" marker-end="url(#ar2)"/>'),
  sym("s-arrow-up",30,100, f'<defs><marker id="ar3" markerWidth="8" markerHeight="8" refX="4" refY="0" orient="auto"><polygon points="0,8 4,0 8,8" fill="{c("blue")}"/></marker></defs>',
      f'<line x1="15" y1="96" x2="15" y2="4" stroke="{c("blue")}" stroke-width="2.5" stroke-linecap="round" marker-end="url(#ar3)"/>'),
  sym("s-arrow-down",30,100, f'<defs><marker id="ar4" markerWidth="8" markerHeight="8" refX="4" refY="8" orient="auto"><polygon points="0,0 8,0 4,8" fill="{c("blue")}"/></marker></defs>',
      f'<line x1="15" y1="4" x2="15" y2="96" stroke="{c("blue")}" stroke-width="2.5" stroke-linecap="round" marker-end="url(#ar4)"/>'),
  sym("s-arrow-double",100,30, f'<defs><marker id="ar5" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="{c("cyan")}"/></marker><marker id="ar5b" markerWidth="8" markerHeight="8" refX="0" refY="4" orient="auto"><polygon points="8,0 0,4 8,8" fill="{c("cyan")}"/></marker></defs>',
      f'<line x1="4" y1="15" x2="96" y2="15" stroke="{c("cyan")}" stroke-width="2.5" marker-start="url(#ar5b)" marker-end="url(#ar5)"/>'),
  sym("s-arrow-curved",100,60, f'<defs><marker id="ar6" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="{c("teal")}"/></marker></defs>',
      f'<path d="M5,50 Q50,5 95,50" fill="none" stroke="{c("teal")}" stroke-width="2.5" marker-end="url(#ar6)"/>'),
  sym("s-arrow-circular",60,60, f'<defs><marker id="ar7" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="{c("green")}"/></marker></defs>',
      f'<path d="M30,6 A24,24 0 1,1 6,30" fill="none" stroke="{c("green")}" stroke-width="2.5" marker-end="url(#ar7)"/>'),
  sym("s-arrow-diagonal",60,60, f'<defs><marker id="ar8" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="{c("yellow")}"/></marker></defs>',
      f'<line x1="5" y1="55" x2="55" y2="5" stroke="{c("yellow")}" stroke-width="2.5" marker-end="url(#ar8)"/>'),
  sym("s-dim-line",100,40,
      line(10,20,90,20,c("gray"),1.5),
      line(10,12,10,28,c("gray"),1.5), line(90,12,90,28,c("gray"),1.5),
      text(50,14,"100",c("gray"),fs=8)),
  sym("s-callout",120,70,
      path("M5,5 H115 Q120,5 120,10 V44 Q120,50 115,50 H60 L46,66 L50,50 H10 Q5,50 5,44 V10 Q5,5 10,5 Z",stroke=c("blue"),sw=2),
      text(62,30,"NOTE",c("blue"),fs=10)),
  sym("s-speech-bubble",110,80,
      path("M5,5 H105 Q110,5 110,12 V52 Q110,60 105,60 H60 L40,75 L45,60 H10 Q5,60 5,52 V12 Q5,5 10,5 Z",stroke=c("cyan"),sw=2),
      text(58,34,"...",c("cyan"),fs=14)),
  sym("s-elbow-arrow",80,80, f'<defs><marker id="ar9" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="{c("orange")}"/></marker></defs>',
      f'<path d="M10,10 L10,70 L75,70" fill="none" stroke="{c("orange")}" stroke-width="2.5" stroke-linecap="round" marker-end="url(#ar9)"/>'),
]

# ══════════════════════════════════════════════════════════════════════════════
# §15  UI / INTERFACE COMPONENTS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-ui-button",100,40, rect(2,2,96,36,rx=8,fill=c("blue")),text(50,24,"BUTTON",c("dark"),fs=10,weight="bold")),
  sym("s-ui-button-out",100,40, rect(2,2,96,36,rx=8,stroke=c("blue"),sw=2),text(50,24,"BUTTON",c("blue"),fs=10)),
  sym("s-ui-toggle-on",80,40,
      rect(2,8,76,24,rx=12,fill=c("green")),
      circle(63,20,10,fill=c("white"))),
  sym("s-ui-toggle-off",80,40,
      rect(2,8,76,24,rx=12,fill=c("gray")),
      circle(17,20,10,fill=c("white"))),
  sym("s-ui-slider",100,30,
      rect(4,12,92,6,rx=3,fill=c("dark"),stroke=c("gray"),sw=1),
      circle(60,15,10,fill=c("blue"))),
  sym("s-ui-checkbox-checked",40,40,
      rect(4,4,32,32,rx=4,stroke=c("blue"),sw=2),
      path("M10,20 L18,28 L30,12",stroke=c("blue"),sw=2.5)),
  sym("s-ui-checkbox-empty",40,40, rect(4,4,32,32,rx=4,stroke=c("gray"),sw=2)),
  sym("s-ui-radio-on",40,40,
      circle(20,20,16,stroke=c("blue"),sw=2),
      circle(20,20,7,fill=c("blue"))),
  sym("s-ui-radio-off",40,40, circle(20,20,16,stroke=c("gray"),sw=2)),
  sym("s-ui-input",120,40, rect(2,2,116,36,rx=6,stroke=c("gray"),sw=1.5),
      text(12,24,"Text...",c("gray"),fs=10,anchor="start"),
      line(80,8,80,32,c("blue"),1.5)),
  sym("s-ui-dropdown",120,40,
      rect(2,2,116,36,rx=6,stroke=c("gray"),sw=1.5),
      text(12,24,"Select",c("gray"),fs=10,anchor="start"),
      poly("96,14 110,14 103,26",fill=c("gray"))),
  sym("s-ui-modal",140,100,
      rect(2,2,136,96,rx=8,fill="#161b22",stroke=c("dark"),sw=1.5),
      rect(2,2,136,28,rx=8,fill=c("blue")),
      rect(2,18,136,12,fill=c("blue")),
      text(71,20,"Title",c("white"),fs=10,weight="bold"),
      text(108,16,"X",c("white"),fs=12,weight="bold"),
      text(71,60,"Content",c("gray"),fs=9),
      rect(90,76,44,18,rx=6,fill=c("blue")),text(112,88,"OK",c("white"),fs=9)),
  sym("s-ui-card",120,80, rect(2,2,116,76,rx=8,fill="#161b22",stroke=c("dark"),sw=1),
      rect(2,2,116,30,rx=8,fill=c("dark")),rect(2,20,116,12,fill=c("dark")),
      text(61,20,"Card Title",c("white"),fs=9),
      text(61,55,"Content area",c("gray"),fs=8)),
  sym("s-ui-badge",60,30, rect(2,2,56,26,rx=13,fill=c("blue")),text(30,18,"BADGE",c("white"),fs=8,weight="bold")),
  sym("s-ui-badge-num",36,36, circle(18,18,16,fill=c("red")),text(18,22,"9",c("white"),fs=12,weight="bold")),
  sym("s-ui-progress",120,24, rect(2,6,116,12,rx=6,fill=c("dark")),rect(2,6,72,12,rx=6,fill=c("blue"))),
  sym("s-ui-spinner",60,60,
      circle(30,30,22,stroke=c("dark"),sw=6),
      path("M30,8 A22,22 0 0,1 52,30",stroke=c("blue"),sw=6,extra='stroke-linecap="round"')),
  sym("s-ui-breadcrumb",200,30,
      text(10,18,"Home",c("gray"),fs=10,anchor="start"),
      text(52,18,">",c("dark"),fs=10), text(62,18,"Section",c("gray"),fs=10,anchor="start"),
      text(116,18,">",c("dark"),fs=10), text(128,18,"Page",c("blue"),fs=10,anchor="start")),
  sym("s-ui-tab-bar",200,40,
      rect(0,0,200,40,fill="#161b22"),
      rect(0,0,60,40,rx=0,fill=c("blue")),
      text(30,24,"Tab 1",c("white"),fs=9),
      text(96,24,"Tab 2",c("gray"),fs=9), text(158,24,"Tab 3",c("gray"),fs=9),
      line(0,39,200,39,c("dark"),2)),
  sym("s-ui-avatar",50,50,
      circle(25,25,23,fill=c("dark"),stroke=c("gray"),sw=1.5),
      circle(25,18,9,fill=c("gray")),
      path("M6,48 Q8,34 25,34 Q42,34 44,48",fill=c("gray"))),
  sym("s-ui-notification",60,60,
      path("M30,10 C18,10 10,20 10,32 L10,46 L6,52 L54,52 L50,46 L50,32 C50,20 42,10 30,10 Z",stroke=c("blue"),sw=2),
      ellipse(30,56,10,5,stroke=c("blue"),sw=2)),
  sym("s-ui-search",60,60,
      circle(24,24,18,stroke=c("gray"),sw=2.5),
      line(37,37,54,54,c("gray"),3)),
  sym("s-ui-settings",60,60,
      circle(30,30,8,stroke=c("gray"),sw=2),
      path("M28,4 L32,4 L32,10 C34,11 36,12 38,14 L44,10 L48,14 L44,18 C45,20 46,22 46,24 L52,24 L52,28 L46,28 C46,30 45,32 44,34 L48,38 L44,42 L38,38 C36,40 34,41 32,42 L32,48 L28,48 L28,42 C26,41 24,40 22,38 L16,42 L12,38 L16,34 C15,32 14,30 14,28 L8,28 L8,24 L14,24 C14,22 15,20 16,18 L12,14 L16,10 L22,14 C24,12 26,11 28,10 Z",stroke=c("gray"),sw=1.5)),
  sym("s-ui-menu",50,40,
      line(5,10,45,10,c("gray"),2.5),line(5,20,45,20,c("gray"),2.5),line(5,30,45,30,c("gray"),2.5)),
  sym("s-ui-close",40,40,
      line(6,6,34,34,c("red"),2.5),line(34,6,6,34,c("red"),2.5)),
  sym("s-ui-home",60,60,
      poly("30,8 52,28 52,54 8,54 8,28",stroke=c("cyan"),sw=2.5),
      rect(22,38,16,16,rx=2,stroke=c("cyan"),sw=2)),
  sym("s-ui-email",60,50,
      rect(4,8,52,34,rx=3,stroke=c("blue"),sw=2),
      path("M4,8 L30,28 L56,8",fill="none",stroke=c("blue"),sw=2)),
  sym("s-ui-lock",50,60,
      rect(8,28,34,28,rx=4,stroke=c("yellow"),sw=2.5),
      path("M14,28 L14,18 Q14,4 25,4 Q36,4 36,18 L36,28",fill="none",stroke=c("yellow"),sw=2.5),
      circle(25,42,5,fill=c("yellow"))),
  sym("s-ui-user",50,60,
      circle(25,16,12,stroke=c("gray"),sw=2),
      path("M4,58 Q5,36 25,36 Q45,36 46,58",fill="none",stroke=c("gray"),sw=2)),
  sym("s-ui-trash",50,60,
      rect(8,18,34,36,rx=3,stroke=c("red"),sw=2),
      line(4,18,46,18,c("red"),2.5), line(18,10,32,10,c("red"),2.5),
      line(18,10,16,18,c("red"),1.5), line(32,10,34,18,c("red"),1.5),
      line(18,28,18,44,c("red"),1.5), line(25,28,25,44,c("red"),1.5),
      line(32,28,32,44,c("red"),1.5)),
  sym("s-ui-edit",50,60,
      path("M8,50 L38,12 L46,8 L44,18 L12,54 Z",stroke=c("blue"),sw=2),
      line(32,16,44,28,c("blue"),2), line(4,54,14,56,c("blue"),2)),
  sym("s-ui-copy",50,60,
      rect(12,4,34,40,rx=3,stroke=c("cyan"),sw=2),
      rect(4,16,34,40,rx=3,fill="#0d1117",stroke=c("cyan"),sw=2)),
  sym("s-ui-star-filled",50,50, poly("25,4 30,18 45,18 34,27 38,42 25,33 12,42 16,27 5,18 20,18",fill=c("yellow"))),
  sym("s-ui-star-empty",50,50, poly("25,4 30,18 45,18 34,27 38,42 25,33 12,42 16,27 5,18 20,18",stroke=c("yellow"),sw=2)),
  sym("s-ui-share",50,60,
      circle(40,10,8,stroke=c("blue"),sw=2),
      circle(10,30,8,stroke=c("blue"),sw=2),
      circle(40,50,8,stroke=c("blue"),sw=2),
      line(18,26,32,14,c("blue"),1.5), line(18,34,32,46,c("blue"),1.5)),
  sym("s-ui-download",60,60,
      path("M30,10 L30,40",stroke=c("green"),sw=2.5),
      poly("18,30 30,44 42,30",fill=c("green")),
      line(8,52,52,52,c("green"),2.5)),
  sym("s-ui-upload",60,60,
      path("M30,40 L30,10",stroke=c("blue"),sw=2.5),
      poly("18,20 30,6 42,20",fill=c("blue")),
      line(8,52,52,52,c("blue"),2.5)),
  sym("s-ui-wifi",60,60,
      path("M30,50 L30,50",stroke=c("blue"),sw=4,extra='stroke-linecap="round"'),
      path("M18,40 Q30,28 42,40",fill="none",stroke=c("blue"),sw=2.5),
      path("M8,30 Q30,10 52,30",fill="none",stroke=c("blue"),sw=2.5),
      path("M0,20 Q30,-4 60,20",fill="none",stroke=c("blue"),sw=2)),
  sym("s-ui-bluetooth",40,60,
      path("M10,10 L30,30 L10,50 M30,10 L30,50 L10,30",stroke=c("blue"),sw=2.5)),
  sym("s-ui-battery-full",60,30,
      rect(2,6,50,18,rx=3,stroke=c("gray"),sw=1.5),
      rect(52,10,6,10,rx=2,fill=c("gray")),
      rect(4,8,44,14,rx=2,fill=c("green"))),
  sym("s-ui-battery-low",60,30,
      rect(2,6,50,18,rx=3,stroke=c("gray"),sw=1.5),
      rect(52,10,6,10,rx=2,fill=c("gray")),
      rect(4,8,12,14,rx=2,fill=c("red"))),
  sym("s-ui-map-pin",40,60,
      path("M20,56 C20,56 4,36 4,22 A16,16 0 1,1 36,22 C36,36 20,56 20,56 Z",stroke=c("red"),sw=2),
      circle(20,22,6,fill=c("red"))),
  sym("s-ui-calendar",60,60,
      rect(4,10,52,46,rx=4,stroke=c("blue"),sw=2),
      line(4,24,56,24,c("blue"),2),
      line(18,4,18,18,c("blue"),2.5), line(42,4,42,18,c("blue"),2.5),
      *[rect(8+col*12,28+row*10,8,7,rx=1,fill=c("blue"),extra='opacity="0.6"')
        for row in range(3) for col in range(4) if not(row==0 and col==0)]),
  sym("s-ui-clock",60,60,
      circle(30,30,26,stroke=c("gray"),sw=2),
      line(30,30,30,12,c("white"),2.5), line(30,30,44,36,c("white"),2)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §16  MATHEMATICAL SYMBOLS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-math-plus",40,40, line(4,20,36,20,c("white"),3), line(20,4,20,36,c("white"),3)),
  sym("s-math-minus",40,20, line(4,10,36,10,c("white"),3)),
  sym("s-math-mult",40,40,
      line(8,8,32,32,c("white"),3), line(32,8,8,32,c("white"),3)),
  sym("s-math-div",40,40,
      line(4,20,36,20,c("white"),3),
      circle(20,8,3,fill=c("white")), circle(20,32,3,fill=c("white"))),
  sym("s-math-equals",40,30, line(4,10,36,10,c("white"),2.5), line(4,20,36,20,c("white"),2.5)),
  sym("s-math-notequal",40,30,
      line(4,10,36,10,c("white"),2.5), line(4,20,36,20,c("white"),2.5),
      line(8,28,32,2,c("white"),2)),
  sym("s-math-leq",40,40, path("M32,4 L8,20 L32,36 M8,38 L32,38",stroke=c("white"),sw=2.5)),
  sym("s-math-geq",40,40, path("M8,4 L32,20 L8,36 M8,38 L32,38",stroke=c("white"),sw=2.5)),
  sym("s-math-sqrt",60,50, path("M4,30 L14,30 L24,46 L36,4 L60,4",stroke=c("white"),sw=2.5)),
  sym("s-math-integral",40,60,
      path("M22,4 Q30,4 30,10 L30,50 Q30,56 22,56",stroke=c("white"),sw=2.5)),
  sym("s-math-sigma",50,60, path("M42,4 L8,4 L28,30 L8,56 L42,56",stroke=c("white"),sw=2.5)),
  sym("s-math-pi",50,40,
      line(4,10,46,10,c("white"),2.5),
      path("M14,10 L14,36",stroke=c("white"),sw=2.5),
      path("M36,10 Q44,10 44,22 L44,36",stroke=c("white"),sw=2.5)),
  sym("s-math-delta",50,50, poly("25,4 46,46 4,46",stroke=c("white"),sw=2.5)),
  sym("s-math-infinity",80,40,
      path("M16,20 C16,10 24,4 32,4 C40,4 44,10 48,20 C52,30 56,36 64,36 C72,36 80,30 80,20 C80,10 72,4 64,4 C56,4 52,10 48,20 C44,30 40,36 32,36 C24,36 16,30 16,20 Z",stroke=c("white"),sw=2.5)),
  sym("s-math-percent",50,50, circle(14,14,10,stroke=c("white"),sw=2.5), circle(36,36,10,stroke=c("white"),sw=2.5), line(40,10,10,40,c("white"),2)),
  sym("s-math-angle",50,50, path("M10,44 L10,10 L44,44",fill="none",stroke=c("white"),sw=2.5), path("M10,34 Q16,34 16,44",fill="none",stroke=c("white"),sw=1.5)),
  sym("s-math-approx",60,30, path("M4,10 Q12,2 20,10 Q28,18 36,10 Q44,2 52,10 Q60,18 68,10",fill="none",stroke=c("white"),sw=2),
      path("M4,22 Q12,14 20,22 Q28,30 36,22 Q44,14 52,22 Q60,30 68,22",fill="none",stroke=c("white"),sw=2)),
  sym("s-math-therefore",50,50, circle(25,10,4,fill=c("white")), circle(10,36,4,fill=c("white")), circle(40,36,4,fill=c("white"))),
  sym("s-math-function",60,50, text(30,32,"f(x)",c("white"),fs=16,weight="bold")),
  sym("s-math-matrix",60,60,
      rect(4,4,52,52,stroke=c("white"),sw=1.5),
      line(24,4,24,56,c("white"),1), line(44,4,44,56,c("white"),1),
      line(4,24,56,24,c("white"),1), line(4,44,56,44,c("white"),1)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §17  NATURE & ENVIRONMENT
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-tree",60,70,
      poly("30,4 52,32 42,32 50,54 10,54 18,32 8,32",fill=c("green")),
      rect(26,54,8,14,rx=2,fill=c("brown"))),
  sym("s-flower",60,60,
      *[ellipse(30+int(20*__import__('math').cos(i*1.047)),30+int(20*__import__('math').sin(i*1.047)),8,12,fill=c("pink"),extra=f'transform="rotate({i*60},30,30)"') for i in range(6)],
      circle(30,30,10,fill=c("yellow"))),
  sym("s-leaf",50,60,
      path("M25,54 C25,54 4,38 4,22 Q4,4 25,4 Q46,4 46,22 C46,38 25,54 25,54 Z",fill=c("green")),
      line(25,54,25,10,c("lime"),1.5)),
  sym("s-mountain",80,60,
      poly("5,56 40,8 75,56",fill=c("gray"),stroke=c("white"),sw=1.5),
      poly("26,56 52,20 78,56",fill=c("dark"),stroke=c("white"),sw=1.5),
      poly("30,18 40,8 50,18 43,14 37,14",fill=c("white"))),
  sym("s-sun",60,60,
      circle(30,30,14,fill=c("yellow")),
      *[line(30+int(20*__import__('math').cos(i*0.785)),30+int(20*__import__('math').sin(i*0.785)),
             30+int(26*__import__('math').cos(i*0.785)),30+int(26*__import__('math').sin(i*0.785)),
             c("yellow"),2) for i in range(8)]),
  sym("s-moon",60,60, path("M30,4 A26,26 0 1,1 30,56 A16,20 0 1,0 30,4 Z",fill=c("yellow"))),
  sym("s-cloud",70,50,
      path("M16,44 C8,44 2,38 4,32 C2,30 2,24 6,22 C6,12 16,8 24,12 C28,6 38,4 46,8 C54,4 62,10 60,20 C64,22 64,30 60,34 C62,40 58,46 50,46 Z",fill=c("white"))),
  sym("s-rain",60,70,
      path("M14,34 C6,34 2,28 4,22 C2,20 2,14 6,12 C6,4 14,0 22,4 C26,0 34,0 40,4 C48,0 56,6 54,16 C58,18 58,26 54,30 C56,36 52,42 44,42 Z",fill=c("white")),
      *[line(14+i*8,44,10+i*8,58,c("cyan"),1.5) for i in range(5)]),
  sym("s-snowflake",60,60,
      *[line(30,30,int(30+24*__import__('math').cos(i*1.047)),int(30+24*__import__('math').sin(i*1.047)),c("white"),2) for i in range(6)],
      *[line(int(30+12*__import__('math').cos(i*1.047)),int(30+12*__import__('math').sin(i*1.047)),
             int(30+18*__import__('math').cos(i*1.047+0.524)),int(30+18*__import__('math').sin(i*1.047+0.524)),
             c("white"),1.5) for i in range(12)]),
  sym("s-lightning-bolt",40,60, poly("22,4 8,32 20,32 18,56 32,28 20,28",fill=c("yellow"))),
  sym("s-fire",50,60,
      path("M25,54 C12,50 6,40 8,30 C8,22 14,16 14,10 C18,18 22,18 24,12 C26,22 30,22 30,16 C34,24 36,24 36,18 C40,28 42,36 40,44 C38,52 32,56 25,54 Z",fill=c("orange"))),
  sym("s-wave-water",70,40,
      path("M4,20 Q14,8 24,20 Q34,32 44,20 Q54,8 64,20",fill="none",stroke=c("cyan"),sw=2.5),
      path("M4,32 Q14,20 24,32 Q34,44 44,32 Q54,20 64,32",fill="none",stroke=c("blue"),sw=2)),
  sym("s-earth",60,60,
      circle(30,30,26,fill="#1a3a5c",stroke=c("blue"),sw=1.5),
      path("M16,14 Q22,18 20,26 Q18,34 24,38 Q30,42 28,50",fill="none",stroke=c("green"),sw=2),
      path("M38,8 Q42,16 38,22 Q34,28 38,34",fill="none",stroke=c("green"),sw=2),
      ellipse(30,30,26,10,stroke=c("blue"),sw=1,extra='stroke-dasharray="3,3"')),
  sym("s-recycle",60,60,
      path("M30,4 L48,34 L36,34 L42,46 L18,46 L24,34 L12,34 Z",stroke=c("green"),sw=2),
      circle(30,30,4,fill=c("green"))),
]

# ══════════════════════════════════════════════════════════════════════════════
# §18  MEDICAL & HEALTH
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-med-cross",50,50, path("M20,4 H30 V20 H46 V30 H30 V46 H20 V30 H4 V20 H20 Z",fill=c("red"))),
  sym("s-med-heart-rate",80,50,
      path("M4,25 L20,25 L26,10 L32,40 L38,18 L44,32 L50,25 L76,25",fill="none",stroke=c("red"),sw=2.5)),
  sym("s-med-stethoscope",60,70,
      path("M10,10 Q10,30 26,34 Q40,38 44,26 Q48,14 44,10",fill="none",stroke=c("gray"),sw=3),
      circle(44,10,5,fill=c("gray")), circle(10,10,5,fill=c("gray")),
      path("M26,34 L26,60",stroke=c("gray"),sw=3),
      circle(26,60,8,stroke=c("gray"),sw=2.5)),
  sym("s-med-pill",60,30, rect(4,8,52,14,rx=7,stroke=c("white"),sw=2), line(30,8,30,22,c("gray"),1.5),
      rect(4,8,26,14,rx=7,fill=c("red"),extra='clip-path="inset(0 50% 0 0)"'),
      path("M4,8 H30 V22 H4 Q4,22 4,15 Q4,8 4,8 Z",fill=c("red")),
      path("M30,8 H56 V22 H30 Z",fill=c("blue"))),
  sym("s-med-syringe",80,30,
      path("M4,14 L60,14 L60,16 L4,16",stroke=c("gray"),sw=2),
      rect(14,10,36,10,rx=2,stroke=c("gray"),sw=1.5),
      line(60,15,76,15,c("gray"),2,extra='stroke-linecap="round"'),
      line(50,10,50,20,c("gray"),1.5), line(36,10,36,20,c("gray"),1.5), line(22,10,22,20,c("gray"),1.5)),
  sym("s-med-dna",50,80,
      path("M10,4 C30,14 30,30 10,40 C30,50 30,66 10,76",fill="none",stroke=c("blue"),sw=2.5),
      path("M40,4 C20,14 20,30 40,40 C20,50 20,66 40,76",fill="none",stroke=c("green"),sw=2.5),
      line(10,20,40,20,c("white"),1.5), line(10,36,40,36,c("white"),1.5),
      line(10,56,40,56,c("white"),1.5), line(10,72,40,72,c("white"),1.5)),
  sym("s-med-brain",60,60,
      path("M30,8 C16,8 8,16 8,26 Q6,34 14,38 Q10,48 20,50 Q24,56 30,56 Q36,56 40,50 Q50,48 46,38 Q54,34 52,26 C52,16 44,8 30,8 Z",stroke=c("pink"),sw=2),
      line(30,8,30,56,c("pink"),1,extra='stroke-dasharray="3,3"'),
      path("M16,26 Q20,22 24,26",fill="none",stroke=c("pink"),sw=1.5),
      path("M36,26 Q40,22 44,26",fill="none",stroke=c("pink"),sw=1.5)),
  sym("s-med-hospital",60,60,
      rect(6,18,48,38,rx=2,stroke=c("red"),sw=2),
      rect(22,4,16,14,rx=2,stroke=c("red"),sw=2),
      path("M20,32 H40 M30,22 V42",stroke=c("red"),sw=2.5),
      rect(20,44,20,12,rx=2,stroke=c("red"),sw=1.5)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §19  TRANSPORT & VEHICLES
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-car",80,50,
      path("M8,34 L8,24 L16,14 L56,14 L68,24 L72,24 L72,38 L8,38 Z",stroke=c("blue"),sw=2),
      circle(20,38,8,fill=c("dark"),stroke=c("gray"),sw=2),
      circle(60,38,8,fill=c("dark"),stroke=c("gray"),sw=2),
      rect(18,18,20,10,rx=2,fill="#1a3a5c"),
      rect(42,18,18,10,rx=2,fill="#1a3a5c")),
  sym("s-truck",90,60,
      rect(4,22,56,30,rx=2,stroke=c("gray"),sw=2),
      path("M60,30 L60,52 L86,52 L86,36 L76,26 L60,26 Z",stroke=c("gray"),sw=2),
      rect(62,28,16,12,rx=2,fill="#1a3a5c"),
      circle(18,52,8,fill=c("dark"),stroke=c("gray"),sw=2),
      circle(46,52,8,fill=c("dark"),stroke=c("gray"),sw=2),
      circle(76,52,8,fill=c("dark"),stroke=c("gray"),sw=2)),
  sym("s-airplane",80,60,
      path("M40,4 C36,4 32,8 32,14 L18,28 L4,32 L4,38 L20,36 L16,48 L24,46 L30,38 L50,38 L56,46 L64,48 L60,36 L76,38 L76,32 L62,28 L48,14 C48,8 44,4 40,4 Z",stroke=c("gray"),sw=2)),
  sym("s-ship",80,60,
      path("M4,44 L8,28 L40,20 L72,28 L76,44 Z",stroke=c("blue"),sw=2),
      rect(24,12,32,16,rx=2,stroke=c("gray"),sw=1.5),
      line(40,4,40,12,c("gray"),2),
      path("M4,44 Q40,56 76,44",fill="none",stroke=c("blue"),sw=2)),
  sym("s-bicycle",70,60,
      circle(18,42,16,stroke=c("green"),sw=2),
      circle(52,42,16,stroke=c("green"),sw=2),
      path("M18,42 L30,18 L46,18 L52,42",fill="none",stroke=c("green"),sw=2),
      path("M30,18 L36,32 L52,42",fill="none",stroke=c("green"),sw=2),
      line(30,18,30,10,c("green"),2),
      line(26,10,34,10,c("green"),2.5)),
  sym("s-rocket",50,80,
      path("M25,4 C14,4 8,16 8,30 L8,56 L42,56 L42,30 C42,16 36,4 25,4 Z",stroke=c("red"),sw=2),
      path("M8,50 L2,60 L8,56 Z",fill=c("orange")),
      path("M42,50 L48,60 L42,56 Z",fill=c("orange")),
      ellipse(25,20,8,10,fill="#1a3a5c"),
      path("M14,56 L14,66 L36,66 L36,56",fill=c("orange"),stroke=c("red"),sw=1)),
  sym("s-train",60,80,
      rect(8,8,44,56,rx=6,stroke=c("gray"),sw=2),
      rect(14,14,32,24,rx=2,fill="#1a3a5c"),
      line(30,40,30,52,c("gray"),4),
      circle(18,68,8,fill=c("dark"),stroke=c("gray"),sw=2),
      circle(42,68,8,fill=c("dark"),stroke=c("gray"),sw=2)),
  sym("s-bus",70,60,
      rect(4,10,62,44,rx=4,stroke=c("yellow"),sw=2),
      rect(10,14,16,14,rx=2,fill="#1a3a5c"),
      rect(30,14,16,14,rx=2,fill="#1a3a5c"),
      rect(48,14,12,14,rx=2,fill="#1a3a5c"),
      circle(16,54,8,fill=c("dark"),stroke=c("gray"),sw=2),
      circle(54,54,8,fill=c("dark"),stroke=c("gray"),sw=2)),
  sym("s-helicopter",80,60,
      ellipse(40,36,22,12,stroke=c("gray"),sw=2),
      path("M18,36 L4,50 L62,50 L68,36",fill="none",stroke=c("gray"),sw=2),
      line(2,26,78,26,c("gray"),3),
      line(40,26,40,36,c("gray"),2),
      line(64,28,72,22,c("gray"),2),
      ellipse(70,20,8,4,stroke=c("gray"),sw=1.5)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §20  BUILDINGS & ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-house",60,60,
      poly("30,8 52,28 52,56 8,56 8,28",stroke=c("orange"),sw=2.5),
      rect(22,38,16,18,rx=2,stroke=c("orange"),sw=2)),
  sym("s-building",60,80,
      rect(8,14,44,64,rx=2,stroke=c("gray"),sw=2),
      poly("30,4 8,14 52,14",stroke=c("gray"),sw=2),
      *[rect(14+col*14,20+row*14,10,10,fill=c("dark"),extra='opacity="0.8"') for row in range(4) for col in range(2)]),
  sym("s-factory",80,70,
      rect(4,30,72,38,rx=2,stroke=c("gray"),sw=2),
      rect(10,16,16,14,rx=2,stroke=c("gray"),sw=2),
      rect(34,20,16,10,rx=2,stroke=c("gray"),sw=2),
      rect(58,24,12,6,rx=2,stroke=c("gray"),sw=2),
      line(18,10,18,16,c("gray"),3), line(42,14,42,20,c("gray"),3), line(64,18,64,24,c("gray"),3)),
  sym("s-tower",40,80,
      poly("20,4 28,60 12,60",stroke=c("gray"),sw=2),
      line(16,30,24,30,c("gray"),2), line(14,46,26,46,c("gray"),2),
      line(14,46,16,30,c("gray"),1.5), line(26,46,24,30,c("gray"),1.5),
      line(20,4,20,0,c("gray"),2)),
  sym("s-bridge",80,50,
      line(4,40,76,40,c("gray"),3),
      path("M16,40 Q16,16 40,16 Q64,16 64,40",fill="none",stroke=c("gray"),sw=2.5),
      line(16,16,16,4,c("gray"),2), line(64,16,64,4,c("gray"),2),
      line(4,4,76,4,c("gray"),3)),
  sym("s-church",50,80,
      rect(8,34,34,44,rx=2,stroke=c("white"),sw=2),
      poly("25,6 8,34 42,34",stroke=c("white"),sw=2),
      line(25,4,25,0,c("white"),2), line(20,2,30,2,c("white"),2.5),
      rect(18,48,14,18,rx=2,stroke=c("white"),sw=1.5)),
  sym("s-school",80,60,
      rect(6,20,68,38,rx=2,stroke=c("blue"),sw=2),
      poly("40,4 6,20 74,20",stroke=c("blue"),sw=2),
      rect(28,32,24,26,rx=2,stroke=c("blue"),sw=2),
      line(40,6,40,4,c("blue"),2), line(34,6,46,6,c("blue"),3)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §21  FOOD & DRINK
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-coffee-cup",50,60,
      path("M8,18 L8,46 Q8,54 20,54 L32,54 Q44,54 44,46 L44,18 Z",stroke=c("brown"),sw=2),
      path("M44,26 Q54,26 54,34 Q54,42 44,42",fill="none",stroke=c("brown"),sw=2),
      line(4,18,48,18,c("brown"),2.5),
      path("M18,6 Q20,2 22,6",fill="none",stroke=c("gray"),sw=1.5),
      path("M26,6 Q28,2 30,6",fill="none",stroke=c("gray"),sw=1.5)),
  sym("s-pizza",60,60,
      poly("30,4 56,52 4,52",fill="#c9a96e",stroke=c("orange"),sw=1.5),
      circle(20,38,4,fill=c("red")), circle(36,32,4,fill=c("red")),
      circle(28,46,3,fill=c("red")), circle(30,4,4,fill="#c9a96e",stroke=c("orange"),sw=1),
      line(4,52,56,52,c("orange"),3,extra='stroke-linecap="butt"')),
  sym("s-apple",50,60,
      path("M25,10 C10,10 6,26 8,38 C10,52 18,58 25,58 C28,58 30,56 32,56 C34,56 36,58 39,58 C46,58 50,48 52,38 C54,26 50,10 35,10 C32,10 28,12 25,10 Z",fill=c("red"),stroke=c("red"),sw=1),
      path("M25,10 Q28,4 32,6",fill="none",stroke=c("green"),sw=2.5),
      line(32,6,32,2,c("green"),2)),
  sym("s-burger",60,60,
      ellipse(30,14,26,10,fill=c("brown")),
      rect(4,22,52,8,rx=2,fill=c("green")),
      rect(4,30,52,8,rx=2,fill=c("amber")),
      rect(4,38,52,8,rx=2,fill=c("red")),
      ellipse(30,48,26,10,fill=c("brown"))),
  sym("s-wine-glass",40,70,
      path("M20,4 C16,4 8,16 8,26 Q8,36 20,40 L18,60 M22,60 L18,60 M22,60 L24,40 Q32,36 32,26 C32,16 24,4 20,4 Z",stroke=c("cyan"),sw=2),
      ellipse(20,60,6,3,stroke=c("cyan"),sw=2)),
  sym("s-ice-cream",40,70,
      circle(20,22,16,fill=c("pink")),
      path("M8,36 L20,66 L32,36",fill=c("amber"),stroke=c("amber"),sw=1)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §22  MUSIC & ENTERTAINMENT
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-music-note",40,60,
      circle(14,46,10,fill=c("white")),
      line(24,46,24,10,c("white"),3),
      line(24,10,40,6,c("white"),2)),
  sym("s-music-notes",70,60,
      circle(14,46,8,fill=c("white")), circle(40,50,8,fill=c("white")),
      line(22,46,22,14,c("white"),3), line(48,50,48,18,c("white"),3),
      line(22,14,48,18,c("white"),2)),
  sym("s-headphones",60,60,
      path("M8,34 C8,18 18,8 30,8 C42,8 52,18 52,34",fill="none",stroke=c("purple"),sw=2.5),
      rect(2,32,12,20,rx=4,stroke=c("purple"),sw=2),
      rect(46,32,12,20,rx=4,stroke=c("purple"),sw=2)),
  sym("s-guitar",50,80,
      path("M22,4 C16,4 14,10 14,16 L14,22 Q8,26 8,38 Q8,54 25,56 Q42,54 42,38 Q42,26 36,22 L36,16 C36,10 34,4 28,4 Z",stroke=c("brown"),sw=2),
      line(22,4,28,4,c("brown"),2),
      line(14,18,36,18,c("brown"),2), line(14,22,36,22,c("brown"),2),
      circle(25,40,8,stroke=c("brown"),sw=2),
      *[line(18,36+i*2,32,36+i*2,c("brown"),0.5) for i in range(4)]),
  sym("s-piano",80,50,
      rect(4,4,72,40,rx=4,stroke=c("white"),sw=2),
      *[rect(8+i*10,4,6,26,rx=2,fill=c("dark")) for i in range(7)],
      *[rect(4+i*10,30,8,14,rx=1,fill=c("dark"),stroke=c("white"),sw=0.5) for i in range(7)]),
  sym("s-drum",60,60,
      ellipse(30,18,26,10,stroke=c("orange"),sw=2.5),
      line(4,18,4,44,c("orange"),2.5), line(56,18,56,44,c("orange"),2.5),
      ellipse(30,44,26,10,stroke=c("orange"),sw=2.5),
      line(26,4,30,18,c("gray"),2), line(34,4,30,18,c("gray"),2)),
  sym("s-vinyl",60,60,
      circle(30,30,26,fill=c("dark"),stroke=c("gray"),sw=1.5),
      circle(30,30,14,stroke=c("gray"),sw=1,extra='stroke-dasharray="2,3"'),
      circle(30,30,4,fill=c("gray")),
      *[ellipse(30,30,20+i,20+i,stroke=c("dark"),sw=1,extra=f'opacity="{0.3+i*0.05}"') for i in range(0,6,2)]),
  sym("s-microphone-stand",40,80,
      rect(14,12,12,24,rx=6,stroke=c("gray"),sw=2.5),
      line(20,36,20,60,c("gray"),3),
      line(8,72,32,72,c("gray"),3), line(8,72,4,80,c("gray"),2),
      line(32,72,36,80,c("gray"),2),
      path("M10,20 Q10,12 20,12 Q30,12 30,20",fill="none",stroke=c("gray"),sw=1.5)),
  sym("s-film",80,60,
      rect(4,4,72,52,rx=4,stroke=c("gray"),sw=2),
      *[rect(8,6+i*12,10,10,rx=2,fill=c("dark")) for i in range(4)],
      *[rect(62,6+i*12,10,10,rx=2,fill=c("dark")) for i in range(4)],
      rect(22,6,36,48,rx=2,fill=c("dark"))),
  sym("s-game-controller",80,60,
      path("M10,18 Q4,18 4,28 Q4,46 14,52 Q22,58 28,50 L34,42 L46,42 L52,50 Q58,58 66,52 Q76,46 76,28 Q76,18 70,18 Z",stroke=c("violet"),sw=2),
      line(24,26,24,40,c("violet"),2), line(17,33,31,33,c("violet"),2),
      circle(56,26,4,stroke=c("violet"),sw=2), circle(62,32,4,stroke=c("violet"),sw=2),
      circle(50,32,4,stroke=c("violet"),sw=2)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §23  WEATHER SYMBOLS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-wx-sunny",60,60,
      circle(30,30,14,fill=c("yellow")),
      *[line(int(30+20*__import__('math').cos(i*0.785)),int(30+20*__import__('math').sin(i*0.785)),
             int(30+26*__import__('math').cos(i*0.785)),int(30+26*__import__('math').sin(i*0.785)),
             c("yellow"),2.5) for i in range(8)]),
  sym("s-wx-cloudy",60,50,
      path("M16,38 C8,38 4,32 6,26 C4,24 4,18 8,16 C8,6 16,2 24,6 C28,0 36,0 42,4 C50,0 58,6 56,16 C60,18 60,26 56,30 C58,36 54,42 46,42 Z",fill="#aaa",stroke=c("white"),sw=1)),
  sym("s-wx-rainy",60,60,
      path("M14,34 C6,34 2,28 4,22 C2,20 2,14 6,12 C6,4 14,0 22,4 C26,0 34,0 40,4 C48,0 56,6 54,16 C58,18 58,26 54,30 C56,36 52,40 44,40 Z",fill="#aaa"),
      *[line(12+i*8,44,8+i*8,56,c("cyan"),2,extra='stroke-linecap="round"') for i in range(5)]),
  sym("s-wx-stormy",60,70,
      path("M14,30 C6,30 2,24 4,18 C2,16 2,10 6,8 C6,0 16,0 22,4 C26,0 36,0 42,4 C50,0 58,8 56,18 C60,22 58,28 54,30 Z",fill="#555"),
      poly("32,30 20,48 28,48 24,68 42,44 34,44",fill=c("yellow"))),
  sym("s-wx-snowy",60,60,
      path("M14,34 C6,34 2,28 4,22 C4,14 10,10 18,10 C22,4 30,2 38,6 C46,2 54,8 52,18 C56,20 58,28 54,32 C56,38 50,42 44,42 Z",fill="#ccc"),
      *[text(10+i*16,56,"*",c("white"),fs=14) for i in range(3)]),
  sym("s-wx-windy",70,50,
      path("M4,16 Q20,8 36,16 Q52,24 68,16",fill="none",stroke=c("white"),sw=2.5),
      path("M4,28 Q20,20 36,28 Q52,36 68,28",fill="none",stroke=c("white"),sw=2),
      path("M4,40 Q20,32 36,40 Q52,48 68,40",fill="none",stroke=c("white"),sw=1.5)),
  sym("s-wx-tornado",50,70,
      path("M10,10 Q40,14 42,28 Q44,42 30,50 Q20,56 22,66",fill="none",stroke=c("gray"),sw=2.5),
      path("M14,18 Q36,22 36,34 Q36,46 26,52",fill="none",stroke=c("gray"),sw=1.5),
      path("M20,28 Q30,32 30,42",fill="none",stroke=c("gray"),sw=1)),
  sym("s-wx-fog",70,40,
      *[line(4,8+i*10,66,8+i*10,c("gray"),2,extra='stroke-dasharray="8,4"') for i in range(4)]),
  sym("s-wx-uv",60,60,
      circle(30,30,16,fill=c("yellow")),
      text(30,35,"UV",c("dark"),fs=10,weight="bold"),
      *[line(int(30+22*__import__('math').cos(i*1.047)),int(30+22*__import__('math').sin(i*1.047)),
             int(30+28*__import__('math').cos(i*1.047)),int(30+28*__import__('math').sin(i*1.047)),
             c("orange"),2) for i in range(6)]),
  sym("s-wx-rainbow",70,40,
      path("M4,40 Q35,2 66,40",fill="none",stroke=c("red"),sw=3),
      path("M9,40 Q35,9 61,40",fill="none",stroke=c("orange"),sw=3),
      path("M14,40 Q35,16 56,40",fill="none",stroke=c("yellow"),sw=3),
      path("M19,40 Q35,22 51,40",fill="none",stroke=c("green"),sw=3),
      path("M24,40 Q35,28 46,40",fill="none",stroke=c("blue"),sw=3),
      path("M29,40 Q35,34 41,40",fill="none",stroke=c("violet"),sw=3)),
  sym("s-wx-thermometer",30,70,
      rect(11,6,8,42,rx=4,stroke=c("red"),sw=2),
      circle(15,52,12,stroke=c("red"),sw=2,fill="#1a0010"),
      rect(13,10,4,36,rx=2,fill=c("red")),
      circle(15,52,8,fill=c("red"))),
  sym("s-wx-barometer",60,60,
      circle(30,30,26,stroke=c("gray"),sw=2),
      circle(30,30,18,stroke=c("dark"),sw=1),
      path("M30,30 L44,20",stroke=c("red"),sw=2,extra='stroke-linecap="round"'),
      circle(30,30,3,fill=c("gray")),
      text(30,50,"hPa",c("gray"),fs=7)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §24  PEOPLE & PERSONS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-person",50,70,
      circle(25,12,10,stroke=c("gray"),sw=2),
      path("M6,60 Q6,36 25,36 Q44,36 44,60",fill="none",stroke=c("gray"),sw=2),
      line(4,46,46,46,c("gray"),2)),
  sym("s-person-run",60,70,
      circle(30,8,8,stroke=c("orange"),sw=2),
      path("M30,16 L22,36 L10,26",fill="none",stroke=c("orange"),sw=2.5),
      path("M30,16 L38,36 L50,26",fill="none",stroke=c("orange"),sw=2.5),
      path("M22,36 L18,56",stroke=c("orange"),sw=2.5),
      path("M38,36 L42,56",stroke=c("orange"),sw=2.5)),
  sym("s-group",80,60,
      circle(16,14,12,stroke=c("gray"),sw=2),
      path("M2,54 Q2,34 16,34 Q30,34 30,54",fill="none",stroke=c("gray"),sw=2),
      circle(40,14,12,stroke=c("gray"),sw=2),
      path("M26,54 Q26,34 40,34 Q54,34 54,54",fill="none",stroke=c("gray"),sw=2),
      circle(64,14,12,stroke=c("gray"),sw=2),
      path("M50,54 Q50,34 64,34 Q78,34 78,54",fill="none",stroke=c("gray"),sw=2)),
  sym("s-accessibility",60,70,
      circle(30,10,8,stroke=c("blue"),sw=2),
      line(30,18,30,40,c("blue"),2.5),
      line(12,28,48,28,c("blue"),2.5),
      path("M30,40 L20,60",stroke=c("blue"),sw=2.5),
      path("M30,40 L40,60",stroke=c("blue"),sw=2.5)),
  sym("s-baby",50,60,
      circle(25,10,8,stroke=c("pink"),sw=2),
      ellipse(25,36,16,18,stroke=c("pink"),sw=2),
      path("M10,30 Q4,36 8,44",fill="none",stroke=c("pink"),sw=2),
      path("M40,30 Q46,36 42,44",fill="none",stroke=c("pink"),sw=2)),
  sym("s-couple",80,60,
      circle(22,12,10,stroke=c("blue"),sw=2),
      path("M6,56 Q6,34 22,34 Q38,34 38,56",fill="none",stroke=c("blue"),sw=2),
      circle(58,12,10,stroke=c("pink"),sw=2),
      path("M42,56 Q42,34 58,34 Q74,34 74,56",fill="none",stroke=c("pink"),sw=2),
      path("M36,24 C36,24 42,18 44,24",fill="none",stroke=c("red"),sw=1.5)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §25  SPORTS & ACTIVITIES
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-sport-soccer",60,60, circle(30,30,26,stroke=c("white"),sw=2),
      poly("30,8 38,22 52,22 42,32 46,46 30,38 14,46 18,32 8,22 22,22",fill=c("dark")),
      circle(30,30,4,fill=c("white"))),
  sym("s-sport-basketball",60,60,
      circle(30,30,26,stroke=c("orange"),sw=2.5),
      line(30,4,30,56,c("orange"),1.5),
      line(4,30,56,30,c("orange"),1.5),
      path("M10,12 Q30,20 50,12",fill="none",stroke=c("orange"),sw=1.5),
      path("M10,48 Q30,40 50,48",fill="none",stroke=c("orange"),sw=1.5)),
  sym("s-sport-tennis",60,60,
      circle(30,30,26,stroke=c("yellow"),sw=2.5),
      path("M18,8 Q30,30 18,52",fill="none",stroke=c("white"),sw=2),
      path("M42,8 Q30,30 42,52",fill="none",stroke=c("white"),sw=2)),
  sym("s-sport-trophy",60,80,
      path("M16,8 L44,8 L48,30 Q52,40 44,46 L38,50 L38,60 L22,60 L22,50 L16,46 Q8,40 12,30 Z",stroke=c("gold"),sw=2.5),
      line(8,64,52,64,c("gold"),3), line(14,68,46,68,c("gold"),2.5),
      path("M12,16 Q4,20 8,30",fill="none",stroke=c("gold"),sw=2),
      path("M48,16 Q56,20 52,30",fill="none",stroke=c("gold"),sw=2)),
  sym("s-sport-swimming",70,50,
      circle(35,14,10,stroke=c("blue"),sw=2),
      path("M8,30 Q14,24 20,30 Q26,36 32,30 Q38,24 44,30 Q50,36 56,30 Q62,24 68,30",fill="none",stroke=c("blue"),sw=2.5),
      path("M20,30 L30,20",stroke=c("blue"),sw=2),
      path("M50,30 L40,20",stroke=c("blue"),sw=2)),
  sym("s-sport-medal",50,70,
      circle(25,48,18,stroke=c("gold"),sw=2.5),
      text(25,52,"1",c("gold"),fs=14,weight="bold"),
      poly("14,4 36,4 46,24 14,24",stroke=c("red"),sw=2),
      line(14,24,20,36,c("red"),2), line(36,24,30,36,c("red"),2),
      ellipse(25,36,5,3,fill=c("gold"))),
  sym("s-sport-dumbbell",80,30,
      rect(4,10,12,10,rx=2,stroke=c("gray"),sw=2),
      rect(4,6,12,18,rx=3,stroke=c("gray"),sw=1.5),
      rect(64,10,12,10,rx=2,stroke=c("gray"),sw=2),
      rect(64,6,12,18,rx=3,stroke=c("gray"),sw=1.5),
      rect(16,12,48,6,rx=2,fill=c("gray"))),
]

# ══════════════════════════════════════════════════════════════════════════════
# §26  ANIMALS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-cat",60,60,
      path("M8,56 Q8,36 18,28 Q16,20 16,14 Q22,20 24,22 Q28,18 30,18 Q32,18 36,22 Q38,20 44,14 Q44,20 42,28 Q52,36 52,56 Z",stroke=c("gray"),sw=2),
      circle(22,36,4,fill=c("dark")), circle(38,36,4,fill=c("dark")),
      path("M24,44 Q30,48 36,44",fill="none",stroke=c("gray"),sw=1.5),
      line(16,40,8,38,c("gray"),1.5), line(16,42,8,44,c("gray"),1.5),
      line(44,40,52,38,c("gray"),1.5), line(44,42,52,44,c("gray"),1.5)),
  sym("s-dog",70,60,
      circle(30,24,18,stroke=c("brown"),sw=2),
      circle(22,18,6,stroke=c("brown"),sw=1.5),
      circle(38,18,6,stroke=c("brown"),sw=1.5),
      circle(24,26,4,fill=c("dark")), circle(36,26,4,fill=c("dark")),
      path("M24,34 Q30,38 36,34",fill="none",stroke=c("brown"),sw=1.5),
      ellipse(30,36,8,4,fill=c("pink"))),
  sym("s-fish",70,40,
      path("M10,20 Q16,10 36,10 Q54,10 60,20 Q54,30 36,30 Q16,30 10,20 Z",stroke=c("blue"),sw=2),
      poly("10,20 0,10 0,30",fill=c("blue"),stroke=c("blue"),sw=1),
      circle(50,16,4,fill=c("dark")),
      path("M36,10 Q32,20 36,30",fill="none",stroke=c("blue"),sw=1),
      path("M46,10 Q42,20 46,30",fill="none",stroke=c("blue"),sw=1)),
  sym("s-bird",70,50,
      path("M4,28 Q14,16 30,16 Q50,16 58,28 Q50,40 30,40 Q14,40 4,28 Z",stroke=c("sky"),sw=2),
      path("M4,28 Q4,20 14,16",fill="none",stroke=c("sky"),sw=2),
      path("M58,28 Q58,20 48,16",fill="none",stroke=c("sky"),sw=2),
      circle(50,22,4,fill=c("dark")),
      path("M56,28 L66,24 L64,30",fill=c("orange"),stroke=c("orange"),sw=1)),
  sym("s-butterfly",70,60,
      path("M35,30 Q20,16 8,20 Q2,30 10,42 Q20,52 35,40",fill=c("orange"),stroke=c("orange"),sw=1),
      path("M35,30 Q50,16 62,20 Q68,30 60,42 Q50,52 35,40",fill=c("orange"),stroke=c("orange"),sw=1),
      path("M35,30 Q26,36 24,48 Q28,56 35,52",fill=c("yellow"),stroke=c("orange"),sw=1),
      path("M35,30 Q44,36 46,48 Q42,56 35,52",fill=c("yellow"),stroke=c("orange"),sw=1),
      line(30,28,35,10,c("dark"),1.5), line(40,28,35,10,c("dark"),1.5)),
  sym("s-bee",60,60,
      ellipse(30,32,18,14,fill=c("yellow")),
      *[line(14,26+i*8,46,26+i*8,c("dark"),2) for i in range(3)],
      path("M16,22 Q30,14 44,22",fill=c("sky"),stroke=c("white"),sw=1,extra='opacity="0.6"'),
      path("M20,18 Q30,10 40,18",fill=c("sky"),stroke=c("white"),sw=1,extra='opacity="0.6"'),
      circle(38,22,4,fill=c("dark")),
      path("M38,24 L48,30",stroke=c("dark"),sw=2)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §27  NETWORK & TECH DIAGRAMS
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-net-server",60,80,
      rect(8,4,44,72,rx=6,stroke=c("cyan"),sw=2),
      rect(12,12,36,14,rx=3,stroke=c("dark"),sw=1),
      rect(12,30,36,14,rx=3,stroke=c("dark"),sw=1),
      rect(12,48,36,14,rx=3,stroke=c("dark"),sw=1),
      circle(44,19,3,fill=c("green")), circle(44,37,3,fill=c("green")),
      circle(44,55,3,fill=c("yellow"))),
  sym("s-net-router",70,60,
      rect(8,18,54,30,rx=6,stroke=c("orange"),sw=2),
      line(14,10,14,18,c("orange"),2), line(26,6,26,18,c("orange"),2),
      line(38,6,38,18,c("orange"),2), line(50,10,50,18,c("orange"),2),
      *[circle(14+i*12,38,4,fill=c("green")) for i in range(4)]),
  sym("s-net-switch",80,50,
      rect(6,14,68,28,rx=6,stroke=c("blue"),sw=2),
      *[circle(14+i*10,28,4,fill=c("green")) for i in range(6)],
      line(6,6,74,6,c("dark"),2,extra='stroke-dasharray="3,3"')),
  sym("s-net-cloud-server",70,60,
      path("M16,38 C8,38 4,32 6,26 C4,24 4,18 8,16 C8,8 16,4 24,8 C28,2 38,2 44,6 C52,2 60,8 58,18 C62,20 62,28 58,32 C60,38 56,44 48,44 Z",stroke=c("cyan"),sw=2),
      text(35,28,"CLOUD",c("cyan"),fs=8)),
  sym("s-net-firewall",70,70,
      rect(8,8,54,54,rx=4,stroke=c("red"),sw=2),
      line(8,24,62,24,c("red"),2), line(8,40,62,40,c("red"),2),
      text(35,18,"FW",c("red"),fs=10,weight="bold"),
      path("M20,28 L24,36 L28,28 L32,36 L36,28 L40,36",fill="none",stroke=c("red"),sw=1.5),
      path("M20,44 L24,52 L28,44 L32,52 L36,44 L40,52",fill="none",stroke=c("red"),sw=1.5)),
  sym("s-net-database",60,80,
      ellipse(30,18,26,10,stroke=c("cyan"),sw=2.5),
      line(4,18,4,60,c("cyan"),2.5), line(56,18,56,60,c("cyan"),2.5),
      ellipse(30,38,26,10,stroke=c("cyan"),sw=1.5,extra='stroke-dasharray="4,3"'),
      path("M4,60 Q4,70 30,70 Q56,70 56,60",fill="none",stroke=c("cyan"),sw=2.5)),
  sym("s-net-laptop",80,60,
      rect(10,8,60,38,rx=4,stroke=c("gray"),sw=2),
      rect(14,12,52,30,rx=2,fill=c("dark")),
      path("M2,50 L10,46 L70,46 L78,50 L2,50 Z",stroke=c("gray"),sw=2)),
  sym("s-net-desktop",70,80,
      rect(8,4,54,40,rx=4,stroke=c("gray"),sw=2),
      rect(12,8,46,32,rx=2,fill=c("dark")),
      line(35,44,35,60,c("gray"),3),
      line(20,60,50,60,c("gray"),3),
      rect(18,60,34,8,rx=2,fill=c("dark"),stroke=c("gray"),sw=1)),
  sym("s-net-phone",40,70,
      rect(6,4,28,62,rx=8,stroke=c("gray"),sw=2),
      rect(10,10,20,42,rx=2,fill=c("dark")),
      circle(20,56,4,stroke=c("gray"),sw=1.5)),
  sym("s-net-tablet",60,70,
      rect(6,4,48,62,rx=6,stroke=c("gray"),sw=2),
      rect(10,10,38,46,rx=2,fill=c("dark")),
      circle(30,60,4,stroke=c("gray"),sw=1.5)),
  sym("s-net-printer",70,60,
      rect(8,20,54,30,rx=4,stroke=c("gray"),sw=2),
      rect(16,8,38,14,rx=2,stroke=c("gray"),sw=1.5),
      rect(16,36,38,20,rx=2,stroke=c("gray"),sw=1.5),
      *[line(20,44+i*4,50,44+i*4,c("gray"),1) for i in range(2)],
      circle(52,28,5,fill=c("green"))),
  sym("s-net-api",70,50,
      rect(8,8,54,34,rx=6,stroke=c("violet"),sw=2),
      text(35,28,"API",c("violet"),fs=14,weight="bold")),
  sym("s-net-webhook",70,60,
      rect(8,8,54,44,rx=4,stroke=c("orange"),sw=2),
      text(35,26,"</",c("orange"),fs=14,weight="bold"),
      text(35,42,">",c("orange"),fs=14,weight="bold")),
  sym("s-net-queue",80,50,
      *[rect(4+i*20,10,16,30,rx=3,stroke=c("cyan"),sw=1.5) for i in range(4)],
      f'<defs><marker id="qar" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><polygon points="0,0 6,3 0,6" fill="{c("cyan")}"/></marker></defs>',
      f'<line x1="4" y1="40" x2="74" y2="40" stroke="{c("cyan")}" stroke-width="1.5" marker-end="url(#qar)"/>'),
  sym("s-net-load-balancer",80,60,
      rect(28,4,24,16,rx=4,stroke=c("green"),sw=2),
      text(40,16,"LB",c("green"),fs=10,weight="bold"),
      rect(4,44,24,14,rx=4,stroke=c("green"),sw=1.5),
      rect(28,44,24,14,rx=4,stroke=c("green"),sw=1.5),
      rect(52,44,24,14,rx=4,stroke=c("green"),sw=1.5),
      line(40,20,16,44,c("green"),1.5), line(40,20,40,44,c("green"),1.5),
      line(40,20,64,44,c("green"),1.5)),
  sym("s-net-cdn",70,60,
      circle(35,30,26,stroke=c("orange"),sw=2),
      ellipse(35,30,26,12,stroke=c("orange"),sw=1.5,extra='stroke-dasharray="4,2"'),
      line(9,30,61,30,c("orange"),1.5),
      line(35,4,35,56,c("orange"),1.5),
      text(35,34,"CDN",c("orange"),fs=9)),
  sym("s-net-container",70,60,
      rect(6,6,58,48,rx=4,stroke=c("cyan"),sw=2),
      rect(12,12,22,18,rx=3,fill=c("dark"),stroke=c("cyan"),sw=1.5),
      rect(38,12,22,18,rx=3,fill=c("dark"),stroke=c("cyan"),sw=1.5),
      rect(12,34,22,14,rx=3,fill=c("dark"),stroke=c("cyan"),sw=1.5),
      rect(38,34,22,14,rx=3,fill=c("dark"),stroke=c("cyan"),sw=1.5)),
  sym("s-net-kubernetes",70,70,
      circle(35,35,30,stroke=c("blue"),sw=2),
      *[line(35,35,int(35+24*__import__('math').cos(i*1.047)),int(35+24*__import__('math').sin(i*1.047)),c("blue"),2) for i in range(6)],
      *[circle(int(35+24*__import__('math').cos(i*1.047)),int(35+24*__import__('math').sin(i*1.047)),5,stroke=c("blue"),sw=1.5) for i in range(6)],
      circle(35,35,8,fill=c("blue"))),
  sym("s-net-git-branch",60,80,
      circle(30,10,8,stroke=c("orange"),sw=2),
      circle(10,60,8,stroke=c("orange"),sw=2),
      circle(50,44,8,stroke=c("orange"),sw=2),
      line(30,18,30,36,c("orange"),2), line(30,36,10,52,c("orange"),2),
      line(30,36,50,36,c("orange"),2), line(50,36,50,52,c("orange"),2),
      circle(30,36,4,fill=c("orange"))),
  sym("s-net-git-commit",80,40,
      line(4,20,76,20,c("orange"),2),
      circle(40,20,10,fill=c("dark"),stroke=c("orange"),sw=2.5)),
  sym("s-net-git-merge",60,80,
      circle(30,10,8,stroke=c("violet"),sw=2),
      circle(10,40,8,stroke=c("violet"),sw=2),
      circle(30,70,8,stroke=c("violet"),sw=2),
      line(30,18,10,32,c("violet"),2),
      path("M10,48 Q10,60 30,62",stroke=c("violet"),sw=2)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §28  ADDITIONAL ELECTRONIC — POWER CONVERSION, RF, OPTO
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-psu",100,70,
      rect(6,6,88,58,rx=4,stroke=c("gray"),sw=2),
      text(50,38,"PSU",c("gray"),fs=14,weight="bold"),
      line(0,20,6,20,c("yellow"),2), line(0,30,6,30,c("gray"),2),
      line(94,20,100,20,c("green"),2), line(94,30,100,30,c("green"),2),
      line(94,40,100,40,c("cyan"),2), line(94,50,100,50,c("red"),2)),
  sym("s-dc-dc",100,60,
      rect(10,8,80,44,rx=4,stroke=c("yellow"),sw=2),
      text(50,32,"DC/DC",c("yellow"),fs=11,weight="bold"),
      line(0,22,10,22,c("yellow"),2), line(0,38,10,38,c("yellow"),2),
      line(90,22,100,22,c("yellow"),2), line(90,38,100,38,c("yellow"),2)),
  sym("s-inverter",100,60,
      rect(10,8,80,44,rx=4,stroke=c("orange"),sw=2),
      text(50,32,"INV",c("orange"),fs=12,weight="bold"),
      path("M30,22 Q40,32 30,42 Q50,42 50,32 Q50,22 30,22",fill="none",stroke=c("orange"),sw=1.5),
      line(0,22,10,22,c("orange"),2), line(90,22,100,22,c("orange"),2)),
  sym("s-ldo",100,60,
      rect(10,8,80,44,rx=4,stroke=c("green"),sw=2),
      text(50,32,"LDO",c("green"),fs=12,weight="bold"),
      line(0,22,10,22,c("green"),2), line(90,22,100,22,c("green"),2),
      line(50,52,50,60,c("green"),2)),
  sym("s-h-bridge",100,90,
      text(50,12,"H-BRIDGE",c("orange"),fs=9),
      rect(10,18,80,56,rx=4,stroke=c("orange"),sw=2),
      text(30,50,"Q1",c("orange"),fs=8), text(70,50,"Q2",c("orange"),fs=8),
      text(30,70,"Q3",c("orange"),fs=8), text(70,70,"Q2",c("orange"),fs=8),
      line(50,18,50,74,c("orange"),1.5),
      line(10,46,90,46,c("orange"),1.5)),
  sym("s-rf-amp",90,70,
      poly("10,5 10,65 80,35",fill="none",stroke=c("pink"),sw=2.5),
      text(40,38,"RF",c("pink"),fs=10),
      line(0,20,10,20,c("pink"),2.5), line(0,50,10,50,c("pink"),2.5),
      line(80,35,90,35,c("pink"),2.5)),
  sym("s-mixer",80,70,
      circle(40,35,28,stroke=c("violet"),sw=2),
      text(40,33,"X",c("violet"),fs=20,weight="bold"),
      line(0,20,14,28,c("violet"),2), line(0,50,14,42,c("violet"),2),
      line(66,35,80,35,c("violet"),2)),
  sym("s-filter-lp",100,60,
      rect(10,10,80,40,rx=4,stroke=c("cyan"),sw=2),
      path("M20,40 L40,40 Q60,40 60,20 L80,20",fill="none",stroke=c("cyan"),sw=2.5),
      text(50,52,"LP",c("cyan"),fs=8)),
  sym("s-filter-hp",100,60,
      rect(10,10,80,40,rx=4,stroke=c("blue"),sw=2),
      path("M20,40 Q40,40 40,20 L60,20 L80,20",fill="none",stroke=c("blue"),sw=2.5),
      text(50,52,"HP",c("blue"),fs=8)),
  sym("s-filter-bp",100,60,
      rect(10,10,80,40,rx=4,stroke=c("green"),sw=2),
      path("M20,40 Q30,40 40,20 L60,20 Q70,20 80,40",fill="none",stroke=c("green"),sw=2.5),
      text(50,52,"BP",c("green"),fs=8)),
  sym("s-pll",100,70,
      rect(8,8,84,54,rx=4,stroke=c("yellow"),sw=2),
      text(50,30,"PLL",c("yellow"),fs=14,weight="bold"),
      text(50,46,"Phase Lock",c("yellow"),fs=7),
      line(0,22,8,22,c("yellow"),2), line(92,22,100,22,c("yellow"),2),
      line(50,62,50,70,c("yellow"),2)),
  sym("s-dsp",100,70,
      rect(8,8,84,54,rx=4,stroke=c("cyan"),sw=2),
      text(50,38,"DSP",c("cyan"),fs=16,weight="bold"),
      line(0,22,8,22,c("cyan"),2), line(0,38,8,38,c("cyan"),2),
      line(92,22,100,22,c("cyan"),2), line(92,38,100,38,c("cyan"),2),
      line(50,62,50,70,c("cyan"),2)),
  sym("s-uart",80,60,
      rect(8,8,64,44,rx=4,stroke=c("orange"),sw=2),
      text(40,30,"UART",c("orange"),fs=11,weight="bold"),
      line(0,20,8,20,c("orange"),2), line(72,20,80,20,c("orange"),2)),
  sym("s-spi",80,60,
      rect(8,8,64,44,rx=4,stroke=c("blue"),sw=2),
      text(40,30,"SPI",c("blue"),fs=12,weight="bold"),
      line(0,20,8,20,c("blue"),2), line(0,30,8,30,c("blue"),2),
      line(0,40,8,40,c("blue"),2), line(72,20,80,20,c("blue"),2)),
  sym("s-i2c",80,60,
      rect(8,8,64,44,rx=4,stroke=c("green"),sw=2),
      text(40,30,"I2C",c("green"),fs=12,weight="bold"),
      line(0,20,8,20,c("green"),2), line(0,36,8,36,c("green"),2)),
  sym("s-can-bus",80,60,
      rect(8,8,64,44,rx=4,stroke=c("red"),sw=2),
      text(40,30,"CAN",c("red"),fs=12,weight="bold"),
      line(0,20,8,20,c("red"),2), line(0,36,8,36,c("red"),2)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §29  ADDITIONAL MISC
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-key",60,30,
      circle(16,15,12,stroke=c("yellow"),sw=2.5),
      circle(16,15,5,fill=c("yellow")),
      line(28,15,56,15,c("yellow"),2.5),
      line(48,15,48,22,c("yellow"),2.5), line(54,15,54,22,c("yellow"),2.5)),
  sym("s-magnifier",60,60,
      circle(24,24,18,stroke=c("gray"),sw=2.5),
      line(37,37,54,54,c("gray"),3.5)),
  sym("s-paperclip",40,70,
      path("M28,62 C38,62 38,50 28,50 L12,50 C6,50 6,38 12,38 L28,38 C38,38 38,8 28,8 C18,8 18,20 28,20 L20,20",fill="none",stroke=c("gray"),sw=2.5)),
  sym("s-pen",60,60,
      path("M44,4 C48,4 56,12 56,16 L18,54 L4,56 L6,42 Z",stroke=c("blue"),sw=2),
      line(14,48,50,12,c("cyan"),1.5)),
  sym("s-bookmark",40,60,
      path("M4,4 L36,4 L36,58 L20,46 L4,58 Z",stroke=c("blue"),sw=2.5)),
  sym("s-tag",60,40,
      path("M4,4 L38,4 L54,20 L38,36 L4,36 Z",stroke=c("yellow"),sw=2),
      circle(12,20,5,stroke=c("yellow"),sw=2)),
  sym("s-cube-net",80,70,
      rect(20,4,20,20,stroke=c("cyan"),sw=1.5),
      rect(0,24,20,20,stroke=c("cyan"),sw=1.5),
      rect(20,24,20,20,stroke=c("cyan"),sw=1.5),
      rect(40,24,20,20,stroke=c("cyan"),sw=1.5),
      rect(60,24,20,20,stroke=c("cyan"),sw=1.5),
      rect(20,44,20,20,stroke=c("cyan"),sw=1.5)),
  sym("s-qr-code",60,60,
      rect(4,4,20,20,stroke=c("white"),sw=2), rect(8,8,12,12,fill=c("white")),
      rect(36,4,20,20,stroke=c("white"),sw=2), rect(40,8,12,12,fill=c("white")),
      rect(4,36,20,20,stroke=c("white"),sw=2), rect(8,40,12,12,fill=c("white")),
      rect(36,36,6,6,fill=c("white")), rect(44,36,6,6,fill=c("white")),
      rect(36,44,6,6,fill=c("white")), rect(50,44,6,6,fill=c("white")),
      rect(44,50,6,6,fill=c("white"))),
  sym("s-barcode",60,50,
      *[rect(4+i*5,4,3,36,fill=c("white")) for i in range(0,10,2)],
      *[rect(6+i*5,4,1,36,fill=c("white")) for i in range(1,8,2)],
      text(30,46,"123456",c("white"),fs=6)),
  sym("s-fingerprint",60,60,
      path("M30,10 C18,10 10,18 10,30 C10,42 18,50 30,50 C42,50 50,42 50,30 C50,22 44,16 36,14",fill="none",stroke=c("cyan"),sw=2),
      path("M30,18 C22,18 16,24 16,30 C16,38 22,42 30,42",fill="none",stroke=c("cyan"),sw=2),
      path("M30,26 C26,26 22,28 22,32",fill="none",stroke=c("cyan"),sw=2),
      line(36,14,36,22,c("cyan"),2)),
  sym("s-target",60,60,
      circle(30,30,26,stroke=c("red"),sw=2),
      circle(30,30,17,stroke=c("red"),sw=2),
      circle(30,30,8,fill=c("red")),
      line(30,4,30,22,c("red"),1.5), line(30,38,30,56,c("red"),1.5),
      line(4,30,22,30,c("red"),1.5), line(38,30,56,30,c("red"),1.5)),
  sym("s-binoculars",60,60,
      circle(18,34,16,stroke=c("gray"),sw=2),
      circle(42,34,16,stroke=c("gray"),sw=2),
      rect(26,24,8,20,rx=2,stroke=c("gray"),sw=2),
      circle(18,34,8,fill=c("dark")), circle(42,34,8,fill=c("dark")),
      line(10,24,18,20,c("gray"),2), line(50,24,42,20,c("gray"),2)),
  sym("s-microscope",50,80,
      rect(18,4,14,28,rx=2,stroke=c("gray"),sw=2),
      rect(16,30,18,10,rx=2,stroke=c("gray"),sw=2),
      line(25,40,25,56,c("gray"),3),
      rect(10,56,30,8,rx=2,stroke=c("gray"),sw=2),
      ellipse(25,62,20,5,stroke=c("gray"),sw=1),
      line(10,70,40,70,c("gray"),3)),
  sym("s-telescope",80,50,
      path("M10,34 L70,14 L70,40 L10,60 Z",stroke=c("gray"),sw=2),
      ellipse(70,27,8,13,stroke=c("gray"),sw=2),
      line(10,34,4,38,c("gray"),3),
      line(70,14,80,10,c("gray"),2), line(70,40,80,44,c("gray"),2)),
  sym("s-chemistry-flask",50,70,
      path("M18,4 L18,30 L4,56 Q4,66 12,66 L38,66 Q46,66 46,56 L32,30 L32,4 Z",stroke=c("green"),sw=2),
      line(14,4,36,4,c("green"),2.5),
      ellipse(22,56,8,4,fill=c("teal"),extra='opacity="0.6"')),
  sym("s-chemistry-beaker",50,60,
      path("M12,4 L12,48 Q12,58 25,58 L25,58 Q38,58 38,48 L38,4 Z",stroke=c("blue"),sw=2),
      line(8,4,42,4,c("blue"),2.5),
      path("M12,44 Q20,36 38,44",fill="none",stroke=c("cyan"),sw=1.5)),
  sym("s-atom",70,70,
      circle(35,35,8,fill=c("red")),
      ellipse(35,35,30,12,stroke=c("cyan"),sw=2),
      ellipse(35,35,30,12,stroke=c("cyan"),sw=2,extra='transform="rotate(60,35,35)"'),
      ellipse(35,35,30,12,stroke=c("cyan"),sw=2,extra='transform="rotate(120,35,35)"'),
      circle(35,23,5,fill=c("teal")),
      circle(56,40,5,fill=c("teal")),
      circle(14,40,5,fill=c("teal"))),
  sym("s-magnet",60,60,
      path("M10,4 Q10,50 30,50 Q50,50 50,4",fill="none",stroke=c("red"),sw=6),
      line(4,4,16,4,c("red"),6),
      path("M10,4 Q10,50 30,50 Q50,50 50,4",fill="none",stroke=c("blue"),sw=0,
           extra='clip-path="polygon(0 0 50% 0 50% 100% 0 100%)"'),
      line(44,4,56,4,c("blue"),6)),
  sym("s-spring",60,60,
      line(30,4,30,10,c("gray"),2.5),
      path("M20,10 Q40,10 40,20 Q40,30 20,30 Q20,40 40,40 Q40,50 20,50 Q40,50 40,50",fill="none",stroke=c("gray"),sw=2),
      polyline("20,10 20,18 40,22 20,30 40,38 20,46 40,50 40,50",c("gray"),2),
      line(30,50,30,56,c("gray"),2.5)),
  sym("s-pulley",60,60,
      circle(30,30,24,stroke=c("gray"),sw=2),
      circle(30,30,10,stroke=c("gray"),sw=2),
      circle(30,30,4,fill=c("gray")),
      line(6,6,54,6,c("gray"),2),
      line(6,6,6,30,c("gray"),2), line(54,6,54,30,c("gray"),2)),
  sym("s-wrench",40,70,
      path("M10,56 L28,28 Q28,10 36,4 Q44,0 44,8 Q40,10 36,16 Q36,22 42,22 Q48,20 48,14 Q52,20 48,28 Q40,32 32,28 L14,56 Z",stroke=c("gray"),sw=2)),
  sym("s-screwdriver",40,70,
      path("M18,4 L22,4 L22,44 L28,56 L20,60 L12,56 L18,44 Z",stroke=c("gray"),sw=2),
      line(20,4,20,40,c("dark"),2)),
  sym("s-hammer",60,50,
      rect(4,10,24,20,rx=4,stroke=c("gray"),sw=2),
      line(28,20,56,48,c("brown"),4),
      rect(4,14,12,12,rx=2,fill=c("dark"))),
  sym("s-bolt",40,40, poly("22,4 8,22 18,22 16,36 32,18 22,18",fill=c("yellow"))),
  sym("s-nut",40,40,
      poly("20,4 34,12 34,28 20,36 6,28 6,12",stroke=c("gray"),sw=2),
      circle(20,20,8,stroke=c("gray"),sw=2)),
  sym("s-chain-link",60,40,
      ellipse(20,20,16,10,stroke=c("gray"),sw=2,extra='fill="none"'),
      ellipse(40,20,16,10,stroke=c("gray"),sw=2,extra='fill="none"'),
      line(20,10,40,10,c("dark"),8), line(20,30,40,30,c("dark"),8)),
]

# ══════════════════════════════════════════════════════════════════════════════
# §30  PLACEHOLDER / PATTERN / SPECIAL
# ══════════════════════════════════════════════════════════════════════════════
SYMBOLS += [
  sym("s-placeholder",80,60, rect(2,2,76,56,rx=6,stroke=c("dark"),sw=2,extra='stroke-dasharray="6,3"'),
      line(2,2,78,58,c("dark"),1.5), line(78,2,2,58,c("dark"),1.5)),
  sym("s-pattern-dots",60,60,
      *[circle(8+col*11,8+row*11,3,fill=c("dark")) for row in range(5) for col in range(5)]),
  sym("s-pattern-lines",60,60,
      *[line(0,i*8,60,i*8,c("dark"),1.5) for i in range(8)]),
  sym("s-pattern-grid",60,60,
      *[line(0,i*10,60,i*10,c("dark"),1) for i in range(7)],
      *[line(i*10,0,i*10,60,c("dark"),1) for i in range(7)]),
  sym("s-pattern-checker",60,60,
      *[rect((col+row%2)*12,row*12,12,12,fill=c("dark")) for row in range(5) for col in range(0,5,2)]),
  sym("s-frame",80,60, rect(2,2,76,56,rx=4,stroke=c("dark"),sw=6),
      rect(10,10,60,40,rx=2,fill="none",stroke=c("gray"),sw=1)),
  sym("s-window",80,60,
      rect(2,2,76,56,rx=6,stroke=c("gray"),sw=2),
      line(2,18,78,18,c("gray"),2),
      circle(12,11,4,fill=c("red")), circle(24,11,4,fill=c("yellow")), circle(36,11,4,fill=c("green"))),
  sym("s-terminal-window",80,60,
      rect(2,2,76,56,rx=6,fill="#0a0d13",stroke=c("dark"),sw=2),
      line(2,18,78,18,c("dark"),2),
      text(8,12,">_",c("green"),fs=8,anchor="start")),
  sym("s-code-block",80,60,
      rect(2,2,76,56,rx=4,fill="#0a0d13",stroke=c("dark"),sw=1.5),
      text(8,18,"{",c("orange"),fs=12,anchor="start"),
      text(8,32,"  code",c("gray"),fs=8,anchor="start"),
      text(8,46,"}",c("orange"),fs=12,anchor="start")),
  sym("s-empty",60,60,),   # truly empty placeholder
]

# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
#  BUILD ASSET_LIBRARY  (id → symbol SVG string)
# ─────────────────────────────────────────────────────────────────────────────
ASSET_LIBRARY: dict[str, str] = {}
for _s in SYMBOLS:
    _m = _re.search(r'id="([^"]+)"', _s)
    if _m:
        ASSET_LIBRARY[_m.group(1)] = _s

_EXTRA_DEFS = """
  <radialGradient id="gSph" cx="35%" cy="35%">
    <stop offset="0%" stop-color="#79c0ff"/>
    <stop offset="100%" stop-color="#0d2236"/>
  </radialGradient>"""

# ─────────────────────────────────────────────────────────────────────────────
#  COMPONENT → ASSET KEY MAPPING  (human name → s-* id)
#  Tip: you can also use the raw s-* id directly in your JSON.
# ─────────────────────────────────────────────────────────────────────────────
COMPONENT_MAP: dict[str, str] = {
    # pass-through: any s-* id works directly
    **{k: k for k in ASSET_LIBRARY.keys()},

    # ── Basic shapes ─────────────────────────────────────
    "circle":            "s-circle-out",
    "circle-fill":       "s-circle-fill",
    "filled-circle":     "s-circle-fill",
    "solid-circle":      "s-circle-fill",
    "dot":               "s-circle-fill",
    "square":            "s-square-out",
    "square-fill":       "s-square-fill",
    "rect":              "s-rect-out",
    "rectangle":         "s-rect-out",
    "rect-fill":         "s-rect-fill",
    "triangle":          "s-triangle-out",
    "triangle-fill":     "s-triangle-fill",
    "rtriangle":         "s-rtriangle-out",
    "diamond":           "s-diamond-out",
    "diamond-fill":      "s-diamond-fill",
    "rhombus":           "s-rhombus-out",
    "pentagon":          "s-pentagon-out",
    "pentagon-fill":     "s-pentagon-fill",
    "hexagon":           "s-hexagon-out",
    "hexagon-fill":      "s-hexagon-fill",
    "heptagon":          "s-heptagon-out",
    "octagon":           "s-octagon-out",
    "octagon-fill":      "s-octagon-fill",
    "nonagon":           "s-nonagon-out",
    "decagon":           "s-decagon-out",
    "star":              "s-star5-out",
    "star5":             "s-star5-out",
    "star-fill":         "s-star5-fill",
    "star6":             "s-star6-out",
    "star8":             "s-star8-out",
    "ellipse":           "s-ellipse-out",
    "ellipse-fill":      "s-ellipse-fill",
    "oval":              "s-ellipse-out",
    "parallelogram":     "s-parallelogram-out",
    "trapezoid":         "s-trapezoid-out",
    "cross":             "s-cross-out",
    "cross-fill":        "s-cross-fill",
    "plus":              "s-cross-out",
    "heart":             "s-heart-out",
    "heart-fill":        "s-heart-fill",
    "cloud":             "s-cloud-out",
    "cloud-fill":        "s-cloud-fill",
    "lightning":         "s-lightning-out",
    "lightning-fill":    "s-lightning-fill",
    "bolt":              "s-lightning-bolt",
    "shield":            "s-shield-out",
    "shield-fill":       "s-shield-fill",
    "crescent":          "s-crescent-out",
    "drop":              "s-drop-out",
    "drop-fill":         "s-drop-fill",
    "water-drop":        "s-drop-fill",
    "speech":            "s-speech-out",
    "speech-bubble":     "s-speech-bubble",
    "thought":           "s-thought-out",
    "badge":             "s-badge-out",
    "infinity":          "s-infinity-out",
    "gear":              "s-gear-out",
    "flag":              "s-flag-out",
    "arc":               "s-arc-out",
    "ring":              "s-ring-out",
    "ring-fill":         "s-ring-fill",
    "pie":               "s-pie-fill",
    "semicircle":        "s-semicircle-fill",
    "capsule":           "s-capsule-out",
    "capsule-fill":      "s-capsule-fill",
    "rounded-rect":      "s-rounded-rect-out",
    "chevron":           "s-chevron-out",

    # ── 3D shapes ──────────────────────────────────────
    "cube":              "s-cube-3d",
    "sphere":            "s-sphere-3d",
    "ball":              "s-sphere-3d",
    "cylinder":          "s-cylinder-3d",
    "cone":              "s-cone-3d",
    "pyramid":           "s-pyramid-3d",
    "torus":             "s-torus-3d",
    "donut":             "s-donut-3d",
    "prism":             "s-prism-3d",
    "gem":               "s-gem-3d",
    "diamond-3d":        "s-gem-3d",
    "helix":             "s-helix-3d",
    "spiral":            "s-helix-3d",
    "mobius":            "s-mobius-3d",
    "box-open":          "s-box-open-3d",
    "tetrahedron":       "s-3d-tetrahedron",
    "octahedron":        "s-3d-octahedron",
    "ellipsoid":         "s-3d-ellipsoid",
    "wedge":             "s-3d-wedge",
    "frustum":           "s-3d-frustum",
    "hexprism":          "s-3d-hexprism",

    # ── Electronic passive ─────────────────────────────
    "resistor":          "s-resistor-ieee",
    "resistor-ieee":     "s-resistor-ieee",
    "resistor-iec":      "s-resistor-iec",
    "resistor-var":      "s-resistor-var",
    "variable-resistor": "s-resistor-var",
    "resistance":        "s-resistor-ieee",
    "r":                 "s-resistor-ieee",
    "capacitor":         "s-capacitor",
    "cap-polar":         "s-capacitor-pol",
    "capacitor-var":     "s-capacitor-var",
    "cap":               "s-capacitor",
    "inductor":          "s-inductor",
    "inductor-iron":     "s-inductor-iron",
    "coil":              "s-inductor",
    "transformer":       "s-transformer",
    "xfmr":              "s-transformer",
    "crystal":           "s-crystal",
    "xtal":              "s-crystal",
    "fuse":              "s-fuse",
    "battery":           "s-battery",
    "cell":              "s-battery",
    "photoresistor":     "s-photoresistor",
    "ldr":               "s-photoresistor",
    "thermistor":        "s-thermistor",
    "varistor":          "s-varistor",
    "potentiometer":     "s-potentiometer",
    "pot":               "s-potentiometer",

    # ── Diodes ────────────────────────────────────────
    "diode":             "s-diode",
    "zener":             "s-zener",
    "schottky":          "s-schottky",
    "led":               "s-led",
    "photodiode":        "s-photodiode",
    "tvs":               "s-tvs-diode",
    "tunnel-diode":      "s-tunnel-diode",
    "varactor":          "s-varactor",
    "diac":              "s-diac",
    "triac":             "s-triac",
    "scr":               "s-scr",
    "thyristor":         "s-scr",

    # ── Transistors ───────────────────────────────────
    "transistor":        "s-npn",
    "npn":               "s-npn",
    "pnp":               "s-pnp",
    "bjt":               "s-npn",
    "nmos":              "s-nmos",
    "pmos":              "s-pmos",
    "mosfet":            "s-nmos",
    "jfet":              "s-jfet-n",
    "igbt":              "s-igbt",

    # ── Amplifiers & ICs ──────────────────────────────
    "opamp":             "s-opamp",
    "op-amp":            "s-opamp",
    "comparator":        "s-comparator",
    "schmitt":           "s-schmitt",
    "ic":                "s-ic-8pin",
    "chip":              "s-ic-8pin",
    "555":               "s-555-timer",
    "timer":             "s-555-timer",
    "adc":               "s-adc",
    "dac":               "s-dac",
    "mux":               "s-mux",
    "flipflop":          "s-flipflop",
    "flip-flop":         "s-flipflop",
    "h-bridge":          "s-h-bridge",
    "pll":               "s-pll",
    "dsp":               "s-dsp",

    # ── Filters & converters ──────────────────────────
    "lowpass":           "s-filter-lp",
    "highpass":          "s-filter-hp",
    "bandpass":          "s-filter-bp",
    "dc-dc":             "s-dc-dc",
    "inverter":          "s-inverter",
    "ldo":               "s-ldo",
    "regulator":         "s-ldo",
    "psu":               "s-psu",

    # ── Bus protocols ─────────────────────────────────
    "uart":              "s-uart",
    "spi":               "s-spi",
    "i2c":               "s-i2c",
    "can":               "s-can-bus",

    # ── Power & sources ───────────────────────────────
    "voltage":           "s-vsource",
    "vsource":           "s-vsource",
    "current":           "s-isource",
    "isource":           "s-isource",
    "ac-source":         "s-ac-source",
    "ground":            "s-ground",
    "gnd":               "s-ground",
    "earth":             "s-gnd-earth",
    "vcc":               "s-vcc",
    "vdd":               "s-vdd",
    "solar":             "s-solar-cell",

    # ── Sensors & transducers ─────────────────────────
    "microphone":        "s-microphone",
    "mic":               "s-microphone",
    "speaker":           "s-speaker",
    "buzzer":            "s-buzzer",
    "lamp":              "s-lamp",
    "bulb":              "s-lamp",
    "motor":             "s-motor",
    "generator":         "s-generator",
    "antenna":           "s-antenna",
    "sensor":            "s-sensor-generic",
    "optocoupler":       "s-optocoupler",
    "relay":             "s-relay",

    # ── Connectors & wiring ───────────────────────────
    "switch":            "s-switch-spst",
    "spst":              "s-switch-spst",
    "spdt":              "s-switch-spdt",
    "push-button":       "s-switch-push",
    "junction":          "s-junction",
    "node":              "s-junction",
    "wire":              "s-ground-wire",
    "crossover":         "s-crossover",
    "test-point":        "s-test-point",
    "connector":         "s-connector-2pin",
    "bnc":               "s-connector-bnc",
    "coax":              "s-coax-cable",
    "probe":             "s-probe",

    # ── Logic gates ───────────────────────────────────
    "not":               "s-gate-not",
    "and":               "s-gate-and",
    "nand":              "s-gate-nand",
    "or":                "s-gate-or",
    "nor":               "s-gate-nor",
    "xor":               "s-gate-xor",
    "xnor":              "s-gate-xnor",
    "buffer":            "s-gate-buffer",
    "tristate":          "s-gate-tristate",

    # ── Waveforms ─────────────────────────────────────
    "sine":              "s-wave-sine",
    "square-wave":       "s-wave-square",
    "triangle-wave":     "s-wave-triangle",
    "sawtooth":          "s-wave-sawtooth",
    "pwm":               "s-wave-pwm",
    "noise":             "s-wave-noise",
    "dc-signal":         "s-wave-dc",
    "ramp":              "s-wave-ramp",

    # ── Flowchart ─────────────────────────────────────
    "flow-terminal":     "s-flow-terminal",
    "start":             "s-flow-terminal",
    "end":               "s-flow-terminal",
    "process":           "s-flow-process",
    "decision":          "s-flow-decision",
    "database":          "s-flow-db",
    "db":                "s-flow-db",
    "document":          "s-flow-document",
    "subroutine":        "s-flow-predefined",
    "delay":             "s-flow-delay",
    "storage":           "s-flow-storage",
    "merge":             "s-flow-merge",

    # ── Arrows ────────────────────────────────────────
    "arrow":             "s-arrow-right",
    "arrow-right":       "s-arrow-right",
    "arrow-left":        "s-arrow-left",
    "arrow-up":          "s-arrow-up",
    "arrow-down":        "s-arrow-down",
    "arrow-double":      "s-arrow-double",
    "arrow-curved":      "s-arrow-curved",
    "callout":           "s-callout",

    # ── Charts ────────────────────────────────────────
    "bar-chart":         "s-chart-bar",
    "line-chart":        "s-chart-line",
    "pie-chart":         "s-chart-pie",
    "gauge":             "s-chart-gauge",
    "heatmap":           "s-chart-heatmap",
    "scatter":           "s-chart-scatter",
    "area-chart":        "s-chart-area",

    # ── UI ────────────────────────────────────────────
    "button":            "s-ui-button",
    "toggle-on":         "s-ui-toggle-on",
    "toggle-off":        "s-ui-toggle-off",
    "slider":            "s-ui-slider",
    "checkbox":          "s-ui-checkbox-checked",
    "radio":             "s-ui-radio-on",
    "search":            "s-ui-search",
    "settings":          "s-ui-settings",
    "menu":              "s-ui-menu",
    "home":              "s-ui-home",
    "lock":              "s-ui-lock",
    "user":              "s-ui-user",
    "trash":             "s-ui-trash",
    "wifi":              "s-ui-wifi",
    "bluetooth":         "s-ui-bluetooth",
    "calendar":          "s-ui-calendar",
    "clock":             "s-ui-clock",
    "download":          "s-ui-download",
    "upload":            "s-ui-upload",
    "pin":               "s-ui-map-pin",
    "progress":          "s-ui-progress",
    "spinner":           "s-ui-spinner",
    "avatar":            "s-ui-avatar",
    "card":              "s-ui-card",

    # ── Math ──────────────────────────────────────────
    "sqrt":              "s-math-sqrt",
    "integral":          "s-math-integral",
    "sigma":             "s-math-sigma",
    "delta":             "s-math-delta",
    "pi":                "s-math-pi",
    "matrix":            "s-math-matrix",

    # ── Nature / weather ──────────────────────────────
    "tree":              "s-tree",
    "sun":               "s-sun",
    "moon":              "s-moon",
    "fire":              "s-fire",
    "rain":              "s-rain",
    "snowflake":         "s-snowflake",
    "atom":              "s-atom",
    "earth":             "s-earth",

    # ── Medical ───────────────────────────────────────
    "ecg":               "s-med-heart-rate",
    "heart-rate":        "s-med-heart-rate",
    "stethoscope":       "s-med-stethoscope",
    "dna":               "s-med-dna",
    "brain":             "s-med-brain",
    "pill":              "s-med-pill",
    "syringe":           "s-med-syringe",

    # ── Transport ─────────────────────────────────────
    "car":               "s-car",
    "truck":             "s-truck",
    "airplane":          "s-airplane",
    "plane":             "s-airplane",
    "ship":              "s-ship",
    "bike":              "s-bicycle",
    "rocket":            "s-rocket",
    "train":             "s-train",
    "helicopter":        "s-helicopter",

    # ── Buildings ─────────────────────────────────────
    "house":             "s-house",
    "building":          "s-building",
    "factory":           "s-factory",
    "bridge":            "s-bridge",
    "school":            "s-school",

    # ── Food ──────────────────────────────────────────
    "coffee":            "s-coffee-cup",
    "pizza":             "s-pizza",
    "burger":            "s-burger",

    # ── Music & entertainment ─────────────────────────
    "note":              "s-music-note",
    "headphones":        "s-headphones",
    "guitar":            "s-guitar",
    "piano":             "s-piano",
    "drum":              "s-drum",
    "gamepad":           "s-game-controller",
    "controller":        "s-game-controller",
    "film":              "s-film",

    # ── Sports ────────────────────────────────────────
    "soccer":            "s-sport-soccer",
    "basketball":        "s-sport-basketball",
    "tennis":            "s-sport-tennis",
    "trophy":            "s-sport-trophy",
    "medal":             "s-sport-medal",
    "dumbbell":          "s-sport-dumbbell",

    # ── Animals ───────────────────────────────────────
    "cat":               "s-cat",
    "dog":               "s-dog",
    "fish":              "s-fish",
    "bird":              "s-bird",
    "butterfly":         "s-butterfly",
    "bee":               "s-bee",

    # ── People ────────────────────────────────────────
    "person":            "s-person",
    "running":           "s-person-run",
    "group":             "s-group",
    "people":            "s-group",
    "couple":            "s-couple",

    # ── Network / Tech ────────────────────────────────
    "server":            "s-net-server",
    "router":            "s-net-router",
    "firewall":          "s-net-firewall",
    "laptop":            "s-net-laptop",
    "phone":             "s-net-phone",
    "tablet":            "s-net-tablet",
    "api":               "s-net-api",
    "container":         "s-net-container",
    "docker":            "s-net-container",
    "kubernetes":        "s-net-kubernetes",
    "k8s":               "s-net-kubernetes",
    "cdn":               "s-net-cdn",
    "queue":             "s-net-queue",
    "branch":            "s-net-git-branch",

    # ── Tools ─────────────────────────────────────────
    "flask":             "s-chemistry-flask",
    "beaker":            "s-chemistry-beaker",
    "magnet":            "s-magnet",
    "wrench":            "s-wrench",
    "screwdriver":       "s-screwdriver",
    "hammer":            "s-hammer",
    "microscope":        "s-microscope",
    "telescope":         "s-telescope",
    "target":            "s-target",
    "key":               "s-key",
    "qr":                "s-qr-code",
    "barcode":           "s-barcode",
    "fingerprint":       "s-fingerprint",

    # ── Backward-compat aliases ───────────────────────
    "electrons":         "s-atom",
    "electron":          "s-atom",
    "ammeter":           "s-med-heart-rate",
    "voltmeter":         "s-vsource",
    "circuit":           "s-net-container",
}

# ─────────────────────────────────────────────────────────────────────────────
#  TIMING HELPERS
# ─────────────────────────────────────────────────────────────────────────────
FADE_DUR = 0.6   # cross-fade duration between scenes (seconds)


def parse_seconds(t: str) -> float:
    t = str(t).strip()
    if t.endswith("ms"):
        return float(t[:-2]) / 1000
    if t.endswith("s"):
        return float(t[:-1])
    try:
        return float(t)
    except ValueError:
        return 0.0


def scene_duration(scene_data: dict, min_dur: float = 5.0) -> float:
    """
    Auto-detect how long a scene runs = max(begin + dur) over finite animations.
    Adds 1.5 s buffer so the viewer has time to read the final state.
    """
    latest = min_dur
    for elem in scene_data.get("elements", []):
        for anim in elem.get("animations", []):
            if str(anim.get("repeat", "1")) == "indefinite":
                continue
            b = parse_seconds(str(anim.get("begin", "0s")))
            d = parse_seconds(str(anim.get("dur",   "1s")))
            latest = max(latest, b + d)
    return latest + 1.5


# ─────────────────────────────────────────────────────────────────────────────
#  ANIMATION BUILDER  — all begin times shifted by scene offset
# ─────────────────────────────────────────────────────────────────────────────
def build_animations(animations: list[dict], offset: float) -> str:
    """
    Supported animation types:
      fade      - opacity from/to  (default)
      translate - moves element dx/dy from its placed position
      orbit     - circular motion around a center point (rx, ry radius)
      move      - animateMotion along an SVG path string
      rotate    - spins around cx/cy
      scale     - scales up/down around element center
      pulse     - quick scale up then back (heartbeat effect)
      color     - animates fill color
      stroke    - animates stroke color
      blink     - rapid opacity on/off
      slide-in  - translates in from a direction (dir: left/right/up/down)
      bounce    - translates up and back repeatedly
      shake     - rapid left-right translate
      flow      - moves repeatedly in one direction (conveyor/current arrow)
    """
    parts: list[str] = []

    for anim in animations:
        atype       = anim.get("type", "fade")
        dur         = anim.get("dur", "1s")
        repeat      = str(anim.get("repeat", "1"))
        fill_mode   = anim.get("fill", "freeze")
        repeat_attr = f'repeatCount="{repeat}"'

        begin_sec = parse_seconds(str(anim.get("begin", "0s"))) + offset
        begin     = f"{begin_sec:.3f}s"

        if atype == "fade":
            parts.append(
                f'<animate attributeName="opacity" '
                f'from="{anim.get("from", 0)}" to="{anim.get("to", 1)}" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "translate":
            # moves element by dx,dy from its current position
            dx = anim.get("dx", 0)
            dy = anim.get("dy", 0)
            fx = anim.get("from", f"0 0")
            tx = anim.get("to",   f"{dx} {dy}")
            parts.append(
                f'<animateTransform attributeName="transform" type="translate" '
                f'from="{fx}" to="{tx}" additive="sum" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "orbit":
            # circular motion: element travels around a circle of radius rx,ry
            rx = anim.get("rx", 40)
            ry = anim.get("ry", rx)
            path = f"M {rx} 0 A {rx} {ry} 0 1 1 {rx} 0.001"
            parts.append(
                f'<animateMotion '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}" '
                f'rotate="{anim.get("rotate", "none")}">'
                f'<mpath/>'
                f'</animateMotion>'
            )
            # Use path directly instead of mpath
            parts[-1] = (
                f'<animateMotion path="{path}" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}" '
                f'rotate="{anim.get("rotate", "none")}"/>'
            )

        elif atype == "move":
            # animateMotion along explicit dx/dy or SVG path
            if "path" in anim:
                path = anim["path"]
            else:
                dx = anim.get("dx", 0)
                dy = anim.get("dy", 0)
                path = f"M 0 0 L {dx} {dy}"
            parts.append(
                f'<animateMotion path="{path}" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "flow":
            # Smooth looping current-arrow movement.
            # The arrow translates from 0→dx, while opacity goes 1→1→0 at the 
            # very end so the jump-back snap is invisible.
            dx = anim.get("dx", 50)
            dy = anim.get("dy", 0)
            parts.append(
                f'<animateTransform attributeName="transform" type="translate" '
                f'from="0 0" to="{dx} {dy}" additive="sum" '
                f'begin="{begin}" dur="{dur}" repeatCount="indefinite" fill="remove"/>'
            )
            # Fade out the last 15% of the cycle to hide snap-back
            parts.append(
                f'<animate attributeName="opacity" '
                f'values="1;1;0" keyTimes="0;0.85;1" '
                f'begin="{begin}" dur="{dur}" repeatCount="indefinite" fill="remove"/>'
            )

        elif atype == "rotate":
            cx = anim.get("cx", 0)
            cy = anim.get("cy", 0)
            parts.append(
                f'<animateTransform attributeName="transform" type="rotate" '
                f'from="{anim.get("from", 0)} {cx} {cy}" '
                f'to="{anim.get("to", 360)} {cx} {cy}" '
                f'additive="sum" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "scale":
            # SVG SMIL scale from a center point:
            # Use matrix() via animateTransform is unreliable.
            # Instead encode scale with translate compensation:
            # transform = translate(cx*(1-s), cy*(1-s)) scale(s)
            # We approximate with a single scale + additive translate trick.
            cx   = float(anim.get("cx", 0))
            cy   = float(anim.get("cy", 0))
            sf   = float(anim.get("from", 0.5))
            st   = float(anim.get("to",   1.0))
            # Emit translate-to-origin, scale, translate-back as values sequence
            # using a single animateTransform with type=translate that compensates
            # This is the browser-compatible approach:
            parts.append(
                f'<animateTransform attributeName="transform" type="translate" '
                f'values="{cx*(1-sf):.1f} {cy*(1-sf):.1f};{cx*(1-st):.1f} {cy*(1-st):.1f}" '
                f'additive="sum" begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )
            parts.append(
                f'<animateTransform attributeName="transform" type="scale" '
                f'values="{sf};{st}" additive="sum" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "pulse":
            # Heartbeat scale — compensate for SVG scale-from-origin issue
            # by pairing with a translate that keeps the element centered.
            # cx/cy should be the element's visual center.
            s1 = float(anim.get("scale", 1.3))
            cx = float(anim.get("cx", 0))
            cy = float(anim.get("cy", 0))
            # translate compensation: moves cx*(1-s), cy*(1-s) at peak
            parts.append(
                f'<animateTransform attributeName="transform" type="translate" '
                f'values="{cx*(1-1.0):.1f} {cy*(1-1.0):.1f};{cx*(1-s1):.1f} {cy*(1-s1):.1f};{cx*(1-1.0):.1f} {cy*(1-1.0):.1f}" '
                f'additive="sum" begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )
            parts.append(
                f'<animateTransform attributeName="transform" type="scale" '
                f'values="1;{s1};1" additive="sum" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "blink":
            parts.append(
                f'<animate attributeName="opacity" '
                f'values="1;0;1" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "color":
            parts.append(
                f'<animate attributeName="fill" '
                f'from="{anim.get("from", "#ffffff")}" to="{anim.get("to", "#ff0000")}" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "stroke":
            parts.append(
                f'<animate attributeName="stroke" '
                f'from="{anim.get("from", "#ffffff")}" to="{anim.get("to", "#ff0000")}" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "slide-in":
            dist = anim.get("dist", 80)
            direction = anim.get("dir", "left")
            offsets = {
                "left":  f"-{dist} 0", "right": f"{dist} 0",
                "up":    f"0 -{dist}", "down":  f"0 {dist}"
            }
            start_off = offsets.get(direction, f"-{dist} 0")
            parts.append(
                f'<animateTransform attributeName="transform" type="translate" '
                f'from="{start_off}" to="0 0" additive="sum" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )
            parts.append(
                f'<animate attributeName="opacity" '
                f'from="0" to="1" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "bounce":
            dy = anim.get("dy", -20)
            parts.append(
                f'<animateTransform attributeName="transform" type="translate" '
                f'values="0 0;0 {dy};0 0" additive="sum" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

        elif atype == "shake":
            dx = anim.get("dx", 8)
            parts.append(
                f'<animateTransform attributeName="transform" type="translate" '
                f'values="0 0;{dx} 0;-{dx} 0;{dx} 0;0 0" additive="sum" '
                f'begin="{begin}" dur="{dur}" {repeat_attr} fill="{fill_mode}"/>'
            )

    return "\n          ".join(parts)


# ─────────────────────────────────────────────────────────────────────────────
#  ELEMENT RENDERER
# ─────────────────────────────────────────────────────────────────────────────
def render_element(elem: dict, offset: float) -> str:
    eid      = elem.get("id", "elem")
    etype    = elem.get("type", "text")
    props    = elem.get("props", {})
    anims    = elem.get("animations", [])
    anim_svg = build_animations(anims, offset)

    def attrs(skip=("content",)) -> str:
        return " ".join(f'{k}="{v}"' for k, v in props.items() if k not in skip)

    # Determine starting opacity.
    # Elements start hidden (opacity=0) only if they have a fade or slide-in animation
    # (which will reveal them). All other animation types (blink, pulse, bounce, flow,
    # translate, rotate, orbit, shake, color, stroke) leave the element visible from start.
    REVEAL_TYPES = {"fade", "slide-in"}
    has_reveal = any(a.get("type", "fade") in REVEAL_TYPES for a in anims)
    starts_hidden = has_reveal or len(anims) == 0
    op = 'opacity="0"' if starts_hidden else 'opacity="1"' 

    # ── Separate transform animations from opacity animations ──────────────
    # SVG animateTransform on bare <text>/<rect> etc. always scales/rotates
    # from (0,0). Wrapping in <g> and putting transforms on the <g> fixes this.
    # Opacity animations stay on the inner element so they don't fight.
    transform_lines = []
    opacity_lines   = []
    for line in anim_svg.split("\n          "):
        line = line.strip()
        if not line:
            continue
        if "animateTransform" in line or "animateMotion" in line:
            transform_lines.append(line)
        else:
            opacity_lines.append(line)
    has_transforms = bool(transform_lines)
    wrap_anim  = "\n          ".join(transform_lines)
    inner_anim = "\n          ".join(opacity_lines)

    def wrapped(inner_svg: str) -> str:
        """Wrap inner element in <g> carrying transform animations."""
        if has_transforms:
            return (
                f'<g id="{eid}" {op}>\n'
                f'          {wrap_anim}\n'
                f'          {inner_svg}\n'
                f'        </g>'
            )
        return inner_svg  # no transforms → return bare element with id

    if etype == "text":
        txt = props.get("content", "")
        bare = f'<text id="{eid}" {attrs(skip=("content",))} {op}>\n            {txt}\n            {inner_anim}\n          </text>'
        if has_transforms:
            inner = f'<text {attrs(skip=("content","id"))} {op}>\n            {txt}\n            {inner_anim}\n          </text>'
            return wrapped(inner)
        return bare

    elif etype == "circle":
        bare = f'<circle id="{eid}" {attrs()} {op}>\n          {inner_anim}\n        </circle>'
        if has_transforms:
            inner = f'<circle {attrs(skip=("id",))} {op}>\n            {inner_anim}\n          </circle>'
            return wrapped(inner)
        return bare

    elif etype == "rect":
        bare = f'<rect id="{eid}" {attrs()} {op}>\n          {inner_anim}\n        </rect>'
        if has_transforms:
            inner = f'<rect {attrs(skip=("id",))} {op}>\n            {inner_anim}\n          </rect>'
            return wrapped(inner)
        return bare

    elif etype == "line":
        return f'<line id="{eid}" {attrs()} {op}>\n          {anim_svg}\n        </line>'

    elif etype == "path":
        return f'<path id="{eid}" {attrs()} {op}>\n          {anim_svg}\n        </path>'

    elif etype == "polygon":
        bare = f'<polygon id="{eid}" {attrs()} {op}>\n          {inner_anim}\n        </polygon>'
        if has_transforms:
            inner = f'<polygon {attrs(skip=("id",))} {op}>\n            {inner_anim}\n          </polygon>'
            return wrapped(inner)
        return bare

    elif etype == "ellipse":
        return f'<ellipse id="{eid}" {attrs()} {op}>\n          {anim_svg}\n        </ellipse>'

    else:
        # Try to resolve as a library asset (component name or s-* id)
        asset_key = COMPONENT_MAP.get(etype.lower())
        if asset_key and asset_key in ASSET_LIBRARY:
            x      = props.get("x", 0)
            y      = props.get("y", 0)
            width  = props.get("width", 60)
            height = props.get("height", 60)
            label  = props.get("label", "")
            # Label placed just above the component, centered horizontally
            label_svg = (
                f'<text x="{float(x)+float(width)/2}" y="{float(y) - 4}" '
                f'font-size="9" fill="#8b949e" text-anchor="middle" font-family="monospace">{label}</text>'
            ) if label else ""
            # Get native symbol dimensions from its viewBox for correct scaling
            sym_src = ASSET_LIBRARY[asset_key]
            vb_match = _re.search(r'viewBox="0 0 ([\\.\\d]+) ([\\.\\d]+)"', sym_src)
            nat_w = float(vb_match.group(1)) if vb_match else float(width)
            nat_h = float(vb_match.group(2)) if vb_match else float(height)
            sx = float(width)  / nat_w   # x scale factor
            sy = float(height) / nat_h   # y scale factor
            # Use g+translate+scale — reliable in all browsers unlike <use x y w h>
            return (
                f'<g id="{eid}" {op}>\n'
                f'          {anim_svg}\n'
                f'          <g transform="translate({x},{y}) scale({sx:.4f},{sy:.4f})">\n'
                f'            <use href="#{asset_key}" width="{nat_w}" height="{nat_h}"/>\n'
                f'          </g>\n'
                f'          {label_svg}\n'
                f'        </g>'
            )
        return f'<!-- unknown type: {etype} -->'


# ─────────────────────────────────────────────────────────────────────────────
#  SCENE GROUP RENDERER
#  Each scene is a <g> that:
#    1. Starts at opacity=0
#    2. Fades IN at its start offset
#    3. Fades OUT when the next scene begins
#    All element animations are shifted by the scene's absolute start offset.
# ─────────────────────────────────────────────────────────────────────────────
def render_scene_group(
    scene_key: str,
    scene_data: dict,
    index: int,
    n_scenes: int,
    offset: float,
    duration: float,
    vb_w: int,
    vb_h: int,
) -> str:
    title    = scene_data.get("title", scene_key)
    bg       = scene_data.get("scene", {}).get("background", "#1a1a2e")
    elements = scene_data.get("elements", [])

    elem_svgs = "\n        ".join(render_element(e, offset) for e in elements)

    fade_in_t  = f"{offset:.3f}s"
    fade_out_t = f"{offset + duration:.3f}s"

    # Fade-out only if there's a next scene
    fade_out_anim = ""
    if index < n_scenes - 1:
        fade_out_anim = (
            f'\n      <!-- fade OUT at {fade_out_t} -->'
            f'\n      <animate attributeName="opacity" from="1" to="0" '
            f'begin="{fade_out_t}" dur="{FADE_DUR}s" fill="freeze"/>'
        )

    # Progress dots
    dot_gap = 18
    dots_total_w = n_scenes * dot_gap
    dot_x0 = (vb_w - dots_total_w) // 2 + dot_gap // 2
    dots = []
    for d in range(n_scenes):
        cx  = dot_x0 + d * dot_gap
        cy  = vb_h - 12
        r   = 5 if d == index else 3
        col = "#58a6ff" if d == index else "#30363d"
        dots.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{col}"/>')
    dots_svg = " ".join(dots)

    # Scene label strip at top
    label_strip = (
        f'<rect x="0" y="0" width="{vb_w}" height="38" fill="#161b22" rx="10"/>'
        f'<rect x="0" y="28" width="{vb_w}" height="10" fill="#161b22"/>'
        f'<text x="{vb_w//2}" y="24" font-size="13" fill="#f0f6fc" '
        f'text-anchor="middle" font-family="monospace" font-weight="bold" '
        f'letter-spacing="1">{title}</text>'
        f'<rect x="{vb_w-46}" y="8" width="38" height="18" rx="9" fill="#30363d"/>'
        f'<text x="{vb_w-27}" y="21" font-size="9" fill="#8b949e" '
        f'text-anchor="middle" font-family="monospace">{index+1}/{n_scenes}</text>'
    )

    return f"""
    <!-- ═══ SCENE {index+1}/{n_scenes}: {title} | start={offset:.1f}s dur={duration:.1f}s ═══ -->
    <g id="scene_{index+1}" opacity="0">

      <!-- fade IN at {fade_in_t} -->
      <animate attributeName="opacity" from="0" to="1"
               begin="{fade_in_t}" dur="{FADE_DUR}s" fill="freeze"/>{fade_out_anim}

      <!-- background -->
      <rect width="{vb_w}" height="{vb_h}" fill="{bg}" rx="10"/>
      <rect width="{vb_w}" height="{vb_h}" fill="url(#scene-grid)" opacity="0.07" rx="10"/>
      <rect width="{vb_w}" height="{vb_h}" fill="none" stroke="#21262d" stroke-width="1.5" rx="10"/>

      <!-- title & counter -->
      {label_strip}

      <!-- scene content -->
      {elem_svgs}

      <!-- progress dots -->
      {dots_svg}
    </g>"""


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN SVG BUILDER
# ─────────────────────────────────────────────────────────────────────────────
def build_svg(data: dict) -> str:
    meta        = data.get("components", {})
    topic       = meta.get("topic", "SVG Animation")
    comp_list   = meta.get("elements", [])
    scenes      = data.get("scenes", {})
    scene_list  = list(scenes.items())
    n_scenes    = len(scene_list)

    # ── Resolve assets ────────────────────────────────────────────────────────
    needed: set[str] = set()
    for c in comp_list:
        k = COMPONENT_MAP.get(c.lower())
        if k and k in ASSET_LIBRARY:
            needed.add(k)
    for _, sd in scene_list:
        for e in sd.get("elements", []):
            k = COMPONENT_MAP.get(e.get("type", "").lower())
            if k and k in ASSET_LIBRARY:
                needed.add(k)

    # ── Viewport size from first scene ────────────────────────────────────────
    vb0  = scene_list[0][1].get("scene", {}).get("viewBox", "0 0 400 300").split()
    vb_w = int(float(vb0[2])) if len(vb0) >= 4 else 400
    vb_h = int(float(vb0[3])) if len(vb0) >= 4 else 300

    # ── Compute sequential offsets ────────────────────────────────────────────
    durations: list[float] = []
    offsets:   list[float] = []
    cursor = 0.0
    for _, sd in scene_list:
        d = scene_duration(sd)
        offsets.append(cursor)
        durations.append(d)
        cursor += d + FADE_DUR
    total_runtime = cursor

    print("\n  Scene timeline:")
    for i, (k, _) in enumerate(scene_list):
        print(f"    [{i+1}] {k:12s}  start={offsets[i]:.1f}s  "
              f"dur={durations[i]:.1f}s  end={offsets[i]+durations[i]:.1f}s")
    print(f"  Total runtime: {total_runtime:.1f}s\n")

    # ── Layout ────────────────────────────────────────────────────────────────
    header_h   = 60
    badge_row_h = 0
    stage_y    = header_h + badge_row_h
    canvas_w   = vb_w
    canvas_h   = stage_y + vb_h

    # ── defs ──────────────────────────────────────────────────────────────────
    defs_content = "\n".join(ASSET_LIBRARY[k] for k in needed)

    # ── asset badges ──────────────────────────────────────────────────────────
    max_badges = (canvas_w - 16) // 92
    bx = 8
    badges = []
    for k in list(needed)[:max_badges]:
        badges.append(
            f'<g transform="translate({bx},{header_h + 6})">'
            f'<rect x="0" y="0" width="86" height="56" rx="5" fill="#161b22" stroke="#21262d" stroke-width="1"/>'
            f'<use href="#{k}" x="13" y="4" width="60" height="36"/>'
            f'<text x="43" y="52" font-size="7" fill="#8b949e" text-anchor="middle" font-family="monospace">{k.upper()}</text>'
            f'</g>'
        )
        bx += 92
    badges_svg = "\n  ".join(badges)

    # ── scene groups ──────────────────────────────────────────────────────────
    scene_groups = []
    for i, (skey, sdata) in enumerate(scene_list):
        scene_groups.append(
            render_scene_group(
                skey, sdata, i, n_scenes,
                offsets[i], durations[i], vb_w, vb_h
            )
        )
    scenes_svg = "\n".join(scene_groups)

    # ── progress bar ─────────────────────────────────────────────────────────
    prog_y = header_h - 5
    progress_svg = (
        f'<rect x="0" y="{prog_y}" width="{canvas_w}" height="4" fill="#161b22"/>\n'
        f'<rect x="0" y="{prog_y}" width="0" height="4" fill="#58a6ff">\n'
        f'  <animate attributeName="width" from="0" to="{canvas_w}" '
        f'begin="0s" dur="{total_runtime:.3f}s" fill="freeze"/>\n'
        f'</rect>'
    )

    # ── assemble ─────────────────────────────────────────────────────────────
    svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 {canvas_w} {canvas_h}"
     width="{canvas_w}" height="{canvas_h}"
     font-family="'Courier New', monospace"
     xmlns:xlink="http://www.w3.org/1999/xlink">

  <!--
    ┌─────────────────────────────────────────────────┐
    │  SVG SEQUENTIAL SLIDESHOW  v2.0                 │
    │  Topic   : {topic:<35} │
    │  Scenes  : {n_scenes:<3}  Runtime: {total_runtime:.0f}s              │
    │  Mode    : All scenes share one viewport        │
    │            Scene N fades out → Scene N+1 in    │
    └─────────────────────────────────────────────────┘
  -->

  <defs>
    <pattern id="scene-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" stroke-width="0.3"/>
    </pattern>
    {defs_content}
  </defs>

  <!-- canvas bg -->
  <rect width="{canvas_w}" height="{canvas_h}" fill="#0d1117"/>

  <!-- header -->
  <rect x="0" y="0" width="{canvas_w}" height="{header_h}" fill="#161b22"/>
  <text x="{canvas_w//2}" y="26" font-size="14" fill="#f0f6fc" font-weight="bold"
        text-anchor="middle" letter-spacing="2">{topic.upper()}</text>
  <text x="{canvas_w//2}" y="44" font-size="9" fill="#8b949e" text-anchor="middle">
    {n_scenes} SCENES · {len(needed)} ASSETS · {total_runtime:.0f}s · SEQUENTIAL AUTO-PLAY
  </text>

  <!-- timeline progress bar -->
  {progress_svg}

  <!-- asset badge strip removed -->

  <!-- ╔══════════════════════════════╗
       ║  SINGLE VIEWPORT STAGE       ║
       ╚══════════════════════════════╝
       All scenes render at (0,0) in this group.
       Only ONE is visible at a time via SMIL opacity. -->
  <g id="stage" transform="translate(0, {stage_y})">
{scenes_svg}
  </g>

</svg>
"""
    return svg


# ─────────────────────────────────────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
def main():
    if len(sys.argv) < 2:
        print("Usage: python svg_generator.py <scene.json> [output.svg]")
        sys.exit(1)

    json_path = Path(sys.argv[1])
    if not json_path.exists():
        print(f"Error: '{json_path}' not found.")
        sys.exit(1)

    out_path = Path(sys.argv[2]) if len(sys.argv) >= 3 else json_path.with_suffix(".svg")

    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    print(f"📖  Loaded   : {json_path}")
    components = data.get("components", {}).get("elements", [])
    print(f"🔍  Components : {components}")
    for c in components:
        k = COMPONENT_MAP.get(c.lower(), "NOT FOUND")
        status = "✅" if k in ASSET_LIBRARY else "❌"
        print(f"    {status}  {c!r:20s}  ->  sym-{k}")

    scenes = data.get("scenes", {})
    print(f"🎬  Scenes   : {list(scenes.keys())}")

    svg_output = build_svg(data)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(svg_output)

    print(f"✅  Output   : {out_path}  ({out_path.stat().st_size/1024:.1f} KB)")
    print("   Open in any modern browser — scenes play sequentially, auto-advancing.")


if __name__ == "__main__":
    main()