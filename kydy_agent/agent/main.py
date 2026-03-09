"""
Kydy SVG Animation JSON Generator — CrewAI Pipeline
Generates a multi-scene teaching animation JSON AND compiles it to SVG.

Usage (local CLI):
    python main.py "teach me photosynthesis"
    python main.py "explain Newton's Laws"
    python main.py "osmosis"

Outputs two files per run:
    <topic>-animation.json   ← Kydy engine JSON  (store in database)
    <topic>-animation.svg    ← Compiled SVG       (send to frontend + database)
"""

import json
import re
import sys
import os
from dataclasses import dataclass
from crewai import Agent, Task, Crew, Process, LLM
import json_repair

# ─────────────────────────────────────────────────────────────────────────────
# KYDY ENGINE IMPORT
#
# ROOT CAUSE FIX: AgentCore dev server runs from a different working directory
# than the project folder. A bare "from kydy_engine import ..." relies on the
# CWD being correct — which it isn't under AgentCore.
#
# FIX: resolve kydy_engine.py and asset.svg using __file__ (this script's own
# absolute path), which is always correct regardless of CWD or how the process
# was launched (CLI, AgentCore dev, AgentCore cloud).
# ─────────────────────────────────────────────────────────────────────────────

# _HERE = absolute path to the folder containing main.py  (agent/src/)
# This is always correct regardless of CWD — works for:
#   python main.py          (CWD = agent/src/)
#   agentcore dev           (CWD = some system temp dir)
#   AgentCore cloud runtime (CWD = unknown)
_HERE = os.path.dirname(os.path.abspath(__file__))

# Ensure agent/src/ is on sys.path so all local imports resolve
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)

# Absolute path to asset.svg — lives in agent/src/ next to engine.py
_ASSET_PATH = os.path.join(_HERE, "asset.svg")

# Your engine file is engine.py (not kydy_engine.py)
try:
    from engine import kydy_compile as _kydy_compile
    _ENGINE_AVAILABLE = True
    print(f"[Kydy] Engine loaded from: {os.path.join(_HERE, 'engine.py')}")
    if os.path.exists(_ASSET_PATH):
        print(f"[Kydy] Asset library  : {_ASSET_PATH}  ✓")
    else:
        print(f"[Kydy] Asset library  : {_ASSET_PATH}  ⚠ NOT FOUND — assets will show placeholders")
except ImportError as _e:
    _ENGINE_AVAILABLE = False
    print(f"[Kydy] WARNING: engine.py not found in {_HERE} — SVG output disabled. ({_e})")


def compile_svg(animation_json: dict) -> str:
    """
    Compile the assembled JSON dict → SVG string via the Kydy engine.
    Always uses the absolute asset path resolved at startup — works correctly
    under both CLI and AgentCore dev/cloud (no CWD dependency).
    """
    if not _ENGINE_AVAILABLE:
        return ""
    try:
        return _kydy_compile(
            json.dumps(animation_json, ensure_ascii=False),
            asset_path=_ASSET_PATH,
        )
    except Exception as e:
        print(f"ERROR in compile_svg: {e}")
        import traceback
        traceback.print_exc()
        return ""


# ─────────────────────────────────────────────────────────────────────────────
# CHANGE 2 of 3 — Output container
# Carries both files so every caller (CLI, AgentCore, your backend) gets
# a single object with animation_json AND svg together.
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class KydyOutput:
    topic:          str   # clean topic, e.g. "Photosynthesis"
    slug:           str   # filename stem, e.g. "photosynthesis"
    animation_json: dict  # full Kydy JSON document
    svg:            str   # compiled SVG string (empty if engine unavailable)

    def json_filename(self) -> str:
        return f"{self.slug}-animation.json"

    def svg_filename(self) -> str:
        return f"{self.slug}-animation.svg"

    def save(self, output_dir: str = ".") -> tuple:
        """
        Write both files to output_dir.
        Returns (json_path, svg_path).  svg_path is "" if SVG unavailable.
        """
        os.makedirs(output_dir, exist_ok=True)

        json_path = os.path.join(output_dir, self.json_filename())
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(self.animation_json, f, indent=2, ensure_ascii=False)

        svg_path = ""
        if self.svg:
            svg_path = os.path.join(output_dir, self.svg_filename())
            with open(svg_path, "w", encoding="utf-8") as f:
                f.write(self.svg)

        return json_path, svg_path


def _topic_to_slug(topic: str) -> str:
    """Convert topic string to a safe filename slug."""
    import unicodedata
    slug = unicodedata.normalize("NFKD", topic).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", slug.lower()).strip("-")
    return slug or "animation"


# ─────────────────────────────────────────────────────────────────────────────
# LLM  — unchanged
# ─────────────────────────────────────────────────────────────────────────────
llm = LLM(model="bedrock/apac.amazon.nova-pro-v1:0", temperature=0.3)

# ─────────────────────────────────────────────────────────────────────────────
# ASSET LIBRARY  — every valid asset_id for the engine  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
ASSET_IDS = """
SHAPES:  s-circle-out, s-circle-fill, s-square-out, s-square-fill,
         s-rect-out, s-rect-fill, s-triangle-out, s-triangle-fill,
         s-hexagon-out, s-hexagon-fill, s-diamond-out, s-diamond-fill,
         s-star5-out, s-star5-fill, s-star6-fill, s-heart-out, s-heart-fill,
         s-cloud-out, s-cloud-fill, s-lightning-out, s-lightning-fill,
         s-shield-out, s-drop-fill, s-drop-out, s-capsule-fill,
         s-rounded-rect-fill, s-rounded-rect-out, s-ring-fill, s-ring-out,
         s-ellipse-out, s-ellipse-fill

3D:      s-cube-3d, s-sphere-3d, s-cylinder-3d, s-cone-3d, s-pyramid-3d,
         s-torus-3d, s-prism-3d, s-helix-3d, s-arrow-3d, s-gem-3d

ARROWS:  s-arrow-right, s-arrow-left, s-arrow-up, s-arrow-down,
         s-arrow-right-out, s-arrow-left-out, s-arrow-double,
         s-arrow-curved, s-arrow-circular, s-arrow-diagonal, s-elbow-arrow,
         s-arrowhead-out

SCIENCE: s-atom, s-chemistry-flask, s-chemistry-beaker, s-microscope,
         s-med-dna, s-helix-3d, s-solar-cell, s-photoresistor,
         s-wave-sine, s-wave-square, s-wave-water

NATURE:  s-tree, s-flower, s-leaf, s-sun, s-cloud, s-lightning-bolt,
         s-wave-water, s-drop-fill, s-drop-out, s-wx-sunny, s-wx-cloudy

CHARTS:  s-chart-line, s-chart-bar (use s-chart-line for graphs)

ELECTRIC: s-resistor-ieee, s-battery, s-capacitor, s-led,
          s-transistor-npn, s-inductor-ieee

UI:      s-ui-checkbox-checked, s-ui-star-filled, s-gear-out
"""

# ─────────────────────────────────────────────────────────────────────────────
# EXACT SCHEMA RULES  — injected into every agent backstory / task description
# (unchanged)
# ─────────────────────────────────────────────────────────────────────────────
SCHEMA = """
════════════════════════════════════════════════════════════
 KYDY ENGINE  —  EXACT JSON SCHEMA  (follow with 100% precision)
════════════════════════════════════════════════════════════

TOP LEVEL:
{
  "theme": "dark",
  "meta": { "title": "...", "subtitle": "...", "description": "..." },
  "canvas": { "width": 800, "height": 500 },
  "scenes": { "scene1": {...}, "scene2": {...}, ... },
  "narration": [ {"text":"...","start":0.5,"dur":7}, ... ]
}

SCENE:
{
  "scene_start": <float>,
  "scene_end":   <float>,
  "elements": [ <Element>, ... ]
}

═══ ELEMENT TYPES & REQUIRED PROPS ═══

① type: "text"
  props MUST include: x, y, content, fill, font-size, text-anchor
  Optional: font-weight, dominant-baseline, letter-spacing
  Example:
  {
    "id": "s1-title",
    "type": "text",
    "props": {
      "x": 400, "y": 108,
      "content": "What is Photosynthesis?",
      "fill": "#f1f5f9",
      "font-size": "29",
      "font-weight": "800",
      "text-anchor": "middle"
    },
    "start_time": 0.4,
    "animations": [{"type":"fade","from":0,"to":1,"dur":"0.8s"}]
  }

② type: "rect"
  props MUST include: x, y, width, height, rx, fill, stroke, stroke-width
  Example:
  {
    "id": "s1-card",
    "type": "rect",
    "props": {
      "x": 80, "y": 378,
      "width": 640, "height": 86,
      "rx": "12",
      "fill": "#1e293b",
      "stroke": "#34d399",
      "stroke-width": "1.8"
    },
    "start_time": 4.5,
    "animations": [{"type":"fade","from":0,"to":1,"dur":"0.5s"}]
  }

③ type: "circle"
  props MUST include: cx, cy, r, fill
  Optional: stroke, stroke-width, opacity
  Example:
  {
    "id": "s1-dot",
    "type": "circle",
    "props": { "cx": "200", "cy": "250", "r": "10", "fill": "#38bdf8" },
    "start_time": 2.0,
    "animations": [
      {"type":"fade","from":0,"to":1,"dur":"0.4s"},
      {"type":"move","path":"M 0 0 L 300 0","begin":2.5,"dur":"2s","repeat":"indefinite","fill":"auto"}
    ]
  }

④ type: "line"
  props MUST include: x1, y1, x2, y2, stroke, stroke-width, stroke-linecap
  Example:
  {
    "id": "s2-ray1",
    "type": "line",
    "props": {
      "x1": 200, "y1": 230, "x2": 310, "y2": 240,
      "stroke": "#facc15", "stroke-width": "3", "stroke-linecap": "round"
    },
    "start_time": 18.0,
    "animations": [
      {"type":"draw","length":120,"begin":18.0,"dur":"0.5s"},
      {"type":"blink","begin":19,"dur":"1.2s","repeat":"indefinite"}
    ]
  }

⑤ type: "ellipse"
  props MUST include: cx, cy, rx, ry, fill
  Optional: stroke, stroke-width
  Example:
  {
    "id": "s1-oval",
    "type": "ellipse",
    "props": { "cx": "220", "cy": "270", "rx": "160", "ry": "110",
               "fill": "#0f2e1f", "stroke": "#34d399", "stroke-width": "2" },
    "start_time": 1.5,
    "animations": [{"type":"fade","from":0,"to":1,"dur":"0.7s"}]
  }

⑥ type: "polygon"
  props MUST include: points, fill
  Optional: stroke, stroke-width
  Example:
  {
    "id": "s5-tri",
    "type": "polygon",
    "props": { "points": "290,155 170,335 410,335",
               "fill": "#1e293b", "stroke": "#475569", "stroke-width": "2.5" },
    "start_time": 2.0,
    "animations": [{"type":"fade","from":0,"to":1,"dur":"0.6s"}]
  }

⑦ type: "asset"   ← USE THIS FOR ICONS, NEVER EMOJI IN ASSETS
  REQUIRED TOP-LEVEL FIELDS (NOT inside props):
    asset_id: <one of the valid IDs listed in ASSET_IDS>
    cx: <number>
    cy: <number>
    size: <number>  (rendered height in px, typically 70-130)
  OPTIONAL:
    label: "text shown below"
    sublabel: "smaller text below label"
  custom MUST include: accent_index (0-7), entrance_dur (0.5-1.0)
  Example:
  {
    "id": "s1-sun",
    "type": "asset",
    "asset_id": "s-sun",
    "cx": 160,
    "cy": 270,
    "size": 110,
    "label": "Sunlight",
    "start_time": 1.4,
    "animations": [
      {"type":"rotate","from":"0","to":"360","begin":2,"dur":"10s","repeat":"indefinite","fill":"auto"}
    ],
    "custom": { "accent_index": 5, "entrance_dur": 0.8 }
  }

  ⚠ ASSET RULES:
  • asset elements NEVER have a "props" key — coordinates go at top level (cx, cy, size)
  • pulse and scale animations ONLY work on asset types
  • rotate animation: from/to are strings ("0","360"), cx/cy params are OPTIONAL for assets

═══ ANIMATION TYPES ═══

  fade:   {"type":"fade","from":0,"to":1,"dur":"0.7s"}
  draw:   {"type":"draw","length":200,"begin":1.0,"dur":"0.5s"}
         (only for line/path — adds stroke-dashoffset reveal)
  blink:  {"type":"blink","begin":1.5,"dur":"1.2s","repeat":"indefinite"}
  move:   {"type":"move","path":"M 0 0 L 400 0","begin":1.2,"dur":"3s","repeat":"indefinite","fill":"auto"}
         (animateMotion — path is relative offset from element's current position)
  rotate: {"type":"rotate","from":"0","to":"360","begin":1,"dur":"8s","repeat":"indefinite","fill":"auto"}
         (only meaningful on asset type with translate group)
  pulse:  {"type":"pulse","intensity":1.06,"begin":2,"dur":"2.5s","repeat":"indefinite"}
         (ONLY on asset type — scale oscillation)
  scale:  {"type":"scale","from":"0","to":"1","dur":"0.5s"}
         (ONLY on asset type — entrance spring)
  fade_out: {"type":"fade_out","begin":8.0,"dur":"0.4s"}

═══ LAYOUT RULES ═══

  Canvas: 800 × 500  (x: 20-780,  y: 20-480)
  Title:  x=400, y=108, font-size=26-29, font-weight=800, text-anchor=middle
  Subtitle: x=400, y=136, font-size=13, fill=#94a3b8, text-anchor=middle
  Visual zone: y=155 to y=360
  Info cards / footer: y=355 to y=470
  Scene duration: 15-18 seconds each
  Element stagger: start_time = scene_start + 0.4, +0.6, +1.0, etc.

═══ COLOUR PALETTE ═══

  Card BG:        #1e293b
  Canvas BG:      #0f172a
  Dark card BG:   #0a2a1a  (green tint), #0c2240 (blue tint)
  Text primary:   #f1f5f9
  Text muted:     #94a3b8
  Text dim:       #64748b
  Text very dim:  #475569
  Divider:        #334155
  Sky blue:       #38bdf8   (accent_index 0)
  Indigo:         #818cf8   (accent_index 1)
  Emerald:        #34d399   (accent_index 2)
  Pink:           #f472b6   (accent_index 3)
  Orange:         #fb923c   (accent_index 4)
  Yellow:         #facc15   (accent_index 5)
  Purple:         #a78bfa   (accent_index 6)
  Cyan:           #22d3ee   (accent_index 7)

════════════════════════════════════════════════════════════
"""

ASSET_USAGE_RULES = """
VALID ASSET IDs (only use IDs from this list):
""" + ASSET_IDS + """
RULES FOR ASSETS:
1. asset elements have cx, cy, size at TOP LEVEL — never inside "props"
2. assets NEVER have a "props" key at all
3. Always include custom: { "accent_index": N, "entrance_dur": 0.7 }
4. pulse/scale/rotate animations work correctly ONLY on asset type
5. Pick assets that visually represent the concept — use s-sun for sunlight,
   s-leaf for plants, s-atom for molecules, s-chemistry-flask for reactions, etc.
"""

# ─────────────────────────────────────────────────────────────────────────────
# AGENTS  — unchanged, plus one new topic_extractor_agent replacing regex
# ─────────────────────────────────────────────────────────────────────────────

topic_extractor_agent = Agent(
    role="Topic Extraction Specialist",
    goal="Extract the exact educational topic from any user request.",
    backstory=(
        "You receive natural language requests from users who want to learn "
        "something. Your only job is to identify and return the exact topic "
        "the user wants to learn about — nothing else. You strip filler phrases "
        "like 'teach me', 'explain', 'I want to learn about', 'can you show me', "
        "but you NEVER change, summarize or paraphrase the actual topic. "
        "You respond with only the clean topic name, no punctuation, no markdown."
    ),
    llm=llm,
    verbose=False,
    allow_delegation=False,
)

curriculum_agent = Agent(
    role="Educational Curriculum Designer",
    goal="Design a 5-scene visual teaching curriculum for any topic.",
    backstory=(
        "You are a master educator who breaks complex topics into 5 clear, "
        "progressive scenes. Each scene covers one key concept and builds on "
        "the last. You structure content as: hook → core concept 1 → "
        "core concept 2 → mechanism/process → outputs/summary. "
        "You output only clean JSON arrays, never markdown."
    ),
    llm=llm,
    verbose=True,
)

scene_agent = Agent(
    role="SVG Scene JSON Generator",
    goal="Generate a single scene's complete JSON object with fully-populated elements.",
    backstory=(
        "You are the Kydy animation engine's JSON author. You produce "
        "pixel-perfect, engine-correct scene JSON. You ALWAYS fill every required field "
        "and never output conversational text."
    ),
    llm=llm,
    verbose=True,
    allow_delegation=False
)

narration_agent = Agent(
    role="Educational Narrator",
    goal="Write concise, warm voiceover narration for each scene.",
    backstory=(
        "You write engaging 1-2 sentence explanations that pair with visual "
        "scenes. You output only clean JSON arrays. Never markdown."
    ),
    llm=llm,
    verbose=True,
)

# ─────────────────────────────────────────────────────────────────────────────
# JSON HELPERS  — unchanged
# ─────────────────────────────────────────────────────────────────────────────

def strip_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\s*```\s*$", "", text, flags=re.MULTILINE)
    return text.strip()


def try_parse(text: str):
    try:
        return json.loads(strip_fences(text))
    except json.JSONDecodeError:
        return None


def _truncate_at_last_valid_close(text: str, start_ch: str, end_ch: str) -> str:
    idx = text.find(start_ch)
    if idx == -1:
        return text
    depth = 0
    in_str = False
    last_close = idx
    i = idx
    while i < len(text):
        ch = text[i]
        if in_str:
            if ch == '\\':
                i += 2
                continue
            if ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == start_ch:
                depth += 1
            elif ch == end_ch:
                depth -= 1
                if depth == 0:
                    last_close = i + 1
        i += 1
    return text[idx:last_close] if last_close > idx else text[idx:]


def repair_and_parse(text: str):
    text = strip_fences(text).rstrip().rstrip(",")
    first_open = -1
    first_ch = '{'
    for ch in text:
        if ch in '[{':
            first_ch = ch
            first_open = text.index(ch)
            break
    if first_open == -1:
        return None
    end_ch = ']' if first_ch == '[' else '}'
    truncated = _truncate_at_last_valid_close(text, first_ch, end_ch)
    open_b = truncated.count("{") - truncated.count("}")
    open_k = truncated.count("[") - truncated.count("]")
    truncated = truncated.rstrip().rstrip(",")
    truncated += "]" * max(0, open_k)
    truncated += "}" * max(0, open_b)
    return try_parse(truncated)


def extract_json_object(text: str):
    """
    Uses json-repair to aggressively fix trailing commas, missing brackets,
    unescaped quotes, and markdown fences automatically.
    """
    try:
        parsed = json_repair.loads(text)
        if isinstance(parsed, dict):
            return parsed
        elif isinstance(parsed, list) and len(parsed) > 0:
            return parsed[0]
    except Exception as e:
        print(f"Critical parsing failure even with json-repair: {e}")
    return None


def crew_run(agents, tasks) -> str:
    crew = Crew(agents=agents, tasks=tasks, process=Process.sequential, verbose=False)
    result = crew.kickoff()
    return result.raw if hasattr(result, "raw") else str(result)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — CURRICULUM  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

SCENE_DURATIONS = [
    (0,  16),
    (16, 33),
    (33, 50),
    (50, 67),
    (67, 85),
]

def extract_all_objects_from_text(text: str) -> list:
    text = strip_fences(text)
    results = []
    i = 0
    while i < len(text):
        if text[i] != '{':
            i += 1
            continue
        depth = 0
        in_str = False
        j = i
        while j < len(text):
            ch = text[j]
            if in_str:
                if ch == '\\':
                    j += 2
                    continue
                if ch == '"':
                    in_str = False
            else:
                if ch == '"':
                    in_str = True
                elif ch == '{':
                    depth += 1
                elif ch == '}':
                    depth -= 1
                    if depth == 0:
                        candidate = text[i:j+1]
                        parsed = try_parse(candidate)
                        if parsed and isinstance(parsed, dict):
                            results.append(parsed)
                        i = j + 1
                        break
            j += 1
        else:
            break
    return results


def _make_curriculum_fallback(topic: str) -> list:
    title = topic.title()
    types = ["hook", "concept", "concept", "process", "summary"]
    titles = [
        f"What is {title}?",
        f"{title} — Core Concepts",
        f"How {title} Works",
        f"The {title} Process",
        f"{title} — Summary & Impact",
    ]
    return [
        {
            "scene": i + 1,
            "start": SCENE_DURATIONS[i][0],
            "end": SCENE_DURATIONS[i][1],
            "title": titles[i],
            "concept": f"Scene {i+1} of {title}",
            "visual_elements": "title, subtitle, assets, info card",
            "scene_type": types[i],
        }
        for i in range(5)
    ]


def run_curriculum(topic: str) -> list:
    task = Task(
        description=(
            f"Topic: \"{topic}\"\n\n"
            "Design a 5-scene visual teaching animation curriculum.\n"
            "Return a JSON array of EXACTLY 5 objects and NOTHING ELSE:\n"
            '[\n'
            '  {"scene":1,"start":0,"end":16,"title":"...","concept":"...","visual_elements":"...","scene_type":"hook"},\n'
            '  {"scene":2,"start":16,"end":33,"title":"...","concept":"...","visual_elements":"...","scene_type":"concept"},\n'
            '  {"scene":3,"start":33,"end":50,"title":"...","concept":"...","visual_elements":"...","scene_type":"concept"},\n'
            '  {"scene":4,"start":50,"end":67,"title":"...","concept":"...","visual_elements":"...","scene_type":"process"},\n'
            '  {"scene":5,"start":67,"end":85,"title":"...","concept":"...","visual_elements":"...","scene_type":"summary"}\n'
            ']\n\n'
            "Fields:\n"
            "  title: scene headline (shown in the animation)\n"
            "  concept: the ONE idea taught in this scene\n"
            "  visual_elements: comma-separated list of what to show visually\n"
            "  scene_type: hook | concept | process | comparison | summary\n\n"
            "IMPORTANT: Output ONLY the raw JSON array — no markdown, no explanation, "
            "no extra text before or after the brackets."
        ),
        agent=curriculum_agent,
        expected_output="JSON array of 5 scene plan objects.",
    )
    raw = crew_run([curriculum_agent], [task])

    result = extract_json_object(raw)
    if result and isinstance(result, list) and len(result) >= 3:
        return result

    objects = extract_all_objects_from_text(raw)
    if objects and all("scene" in o for o in objects):
        curriculum = []
        types = ["hook", "concept", "concept", "process", "summary"]
        for i in range(5):
            obj = objects[i] if i < len(objects) else {}
            curriculum.append({
                "scene": i + 1,
                "start": SCENE_DURATIONS[i][0],
                "end": SCENE_DURATIONS[i][1],
                "title": obj.get("title", f"Scene {i+1}"),
                "concept": obj.get("concept", f"Scene {i+1} concept"),
                "visual_elements": obj.get("visual_elements", ""),
                "scene_type": obj.get("scene_type", types[i]),
            })
        print(f"  ⚠  Curriculum: recovered {len(objects)} of 5 scenes from partial output")
        return curriculum

    print("  ⚠  Curriculum: LLM output unrecoverable, using topic-aware fallback")
    return _make_curriculum_fallback(topic)


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — PER-SCENE GENERATION  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

SCENE_RECIPES = {
    "hook": """
LAYOUT for a HOOK scene:
  • Title text: x=400, y=108
  • Subtitle text: x=400, y=136 (muted, 13px)
  • 3 assets in a row: cx=160,cy=270 | cx=400,cy=275 | cx=640,cy=270 (size 100-120)
  • Arrow assets between them: cx=283,cy=268 and cx=517,cy=268 (size 44)
  • Bottom info card: rect x=80,y=378,width=640,height=86,rx=12
  • 2-3 text lines inside the card (y=402, y=426, y=451)
  • Use blink animation on arrows, pulse on centre asset, rotate on sun
""",
    "concept": """
LAYOUT for a CONCEPT scene:
  • Title text: x=400, y=108
  • Subtitle text: x=400, y=136 (muted, 13px)
  • Main asset LEFT: cx=150, cy=255, size=96 (the input/source)
  • 2-3 animated lines/rays between left asset and centre (draw + blink)
  • Centre asset or shape: cx=400, cy=258, size=120-130
  • Small label text overlaid on centre: x=400, y=260
  • Right info card: rect x=590, y=200, width=150, height=100, rx=10
    with 3 text lines inside (y=234, y=255, y=274)
  • Bottom fact card: rect x=60, y=365, width=680, height=98, rx=11
    with 3-4 text lines (y=390, y=413, y=434, y=452)
""",
    "process": """
LAYOUT for a PROCESS/CYCLE scene:
  • Title text: x=400, y=108
  • Subtitle text: x=400, y=136 (muted, 13px)
  • Large circular arrow asset: s-arrow-circular, cx=400, cy=272, size=210
    with slow rotate animation (12-15s, indefinite)
  • Text labels around the circle: top, left, right (y=178, x=510/285 y=340)
  • Result asset top-right: cx=650, cy=258, size=90 with pulse
  • Bottom fact card: rect x=60, y=390, width=680, height=72, rx=11
    with 2-3 text lines (y=414, y=434, y=452)
""",
    "comparison": """
LAYOUT for a COMPARISON scene:
  • Title text: x=400, y=108
  • Subtitle text: x=400, y=136 (muted, 13px)
  • LEFT card: rect x=60, y=155, width=220, height=210, rx=14
    with asset cx=170, cy=248 (size 80) + text lines below
  • MIDDLE card: rect x=290, y=155, width=220, height=210, rx=14
    with asset cx=400, cy=248 (size 80) + text lines below
  • RIGHT card: rect x=520, y=155, width=220, height=210, rx=14
    with asset cx=630, cy=248 (size 80) + text lines below
  • Bottom summary card: rect x=80, y=390, width=640, height=70, rx=12
""",
    "summary": """
LAYOUT for a SUMMARY scene:
  • Title text: x=400, y=108
  • Subtitle text: x=400, y=136 (muted, 13px)
  • 3 output cards side by side:
      LEFT card:   rect x=60,  y=162, width=200, height=195, rx=14
        asset cx=160, cy=240, size=80 + label text y=306, y=326, y=344
      MIDDLE card: rect x=300, y=162, width=200, height=195, rx=14
        asset cx=400, cy=240, size=80 + label text y=306, y=326, y=344
      RIGHT card:  rect x=540, y=162, width=200, height=195, rx=14
        asset cx=640, cy=240, size=80 + label text y=306, y=326, y=344
  • Big final equation card:
      rect x=60, y=380, width=680, height=82, rx=12, dark green bg #0a2a1a, stroke #34d399
      Text lines: y=404 (equation, large, emerald), y=427 (note, muted), y=448 (dim)
""",
}


def build_scene_prompt(scene_num: int, plan: dict, topic: str) -> str:
    s_start = plan["start"]
    s_end   = plan["end"]
    stype   = plan.get("scene_type", "concept")
    recipe  = SCENE_RECIPES.get(stype, SCENE_RECIPES["concept"])

    return f"""
Generate the JSON object for scene{scene_num} of a "{topic}" teaching animation.

Scene plan:
  scene_start:  {s_start}
  scene_end:    {s_end}
  title:        {plan["title"]}
  concept:      {plan["concept"]}
  visuals:      {plan.get("visual_elements", "")}
  type:         {stype}

{recipe}

=== STRICT JSON SCHEMA & ASSET RULES ===
{SCHEMA}
{ASSET_USAGE_RULES}
========================================

CRITICAL INSTRUCTIONS:
1. Output ONLY a raw, valid JSON object starting with {{ and ending with }}. Do not use markdown code blocks (```json).
2. The object must have keys: scene_start, scene_end, elements.
3. Include 6-10 elements to prevent truncation. 
4. Every element MUST use an ID from the AVAILABLE ASSET IDs list if it is a shape or icon.
5. NEVER output empty props like {{}}.

Output the complete JSON object now:
"""


def run_scene(scene_num: int, plan: dict, topic: str) -> dict:
    task = Task(
        description=build_scene_prompt(scene_num, plan, topic),
        agent=scene_agent,
        expected_output=(
            f"Complete JSON object for scene{scene_num} with "
            "scene_start, scene_end, elements (10-16 items)."
        ),
    )
    raw = crew_run([scene_agent], [task])
    parsed = extract_json_object(raw)
    if parsed and isinstance(parsed, dict) and "elements" in parsed:
        return parsed

    print(f"  ⚠  scene{scene_num}: parse failed, using fallback")
    return {
        "scene_start": plan["start"],
        "scene_end":   plan["end"],
        "elements": [
            {
                "id": f"s{scene_num}-title",
                "type": "text",
                "props": {
                    "x": 400, "y": 108,
                    "content": plan["title"],
                    "fill": "#f1f5f9",
                    "font-size": "27",
                    "font-weight": "800",
                    "text-anchor": "middle",
                },
                "start_time": plan["start"] + 0.4,
                "animations": [{"type": "fade", "from": 0, "to": 1, "dur": "0.8s"}],
            },
            {
                "id": f"s{scene_num}-sub",
                "type": "text",
                "props": {
                    "x": 400, "y": 136,
                    "content": plan["concept"],
                    "fill": "#94a3b8",
                    "font-size": "13",
                    "text-anchor": "middle",
                },
                "start_time": plan["start"] + 1.0,
                "animations": [{"type": "fade", "from": 0, "to": 1, "dur": "0.6s"}],
            },
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — NARRATION  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

def run_narration(curriculum: list, topic: str) -> list:
    summary = "\n".join(
        f"  Scene {s['scene']} [{s['start']}s-{s['end']}s]: {s['concept']}"
        for s in curriculum
    )
    task = Task(
        description=(
            f"Topic: \"{topic}\"\n\nScenes:\n{summary}\n\n"
            "Write exactly 10 narration entries (2 per scene). "
            "Return a JSON array:\n"
            '[{"text":"...","start":0.5,"dur":7}, ...]\n\n'
            "Rules:\n"
            "  • Each text: 1-2 warm, clear, educational sentences\n"
            "  • Entry 1 per scene: start = scene_start + 0.5, dur = 7\n"
            "  • Entry 2 per scene: start = scene_start + 8.5, dur = 7\n"
            "  • Entries must NOT overlap within a scene\n"
            "  • Output ONLY the raw JSON array. No markdown."
        ),
        agent=narration_agent,
        expected_output="JSON array of 10 narration objects.",
    )
    raw = crew_run([narration_agent], [task])
    result = extract_json_object(raw)
    if result and isinstance(result, list):
        return result

    return [
        {"text": s["concept"], "start": s["start"] + 0.5, "dur": 7}
        for s in curriculum
    ]


# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — ASSEMBLY & VALIDATION  (unchanged)
# ─────────────────────────────────────────────────────────────────────────────

def validate_element(el: dict, scene_start: float, scene_end: float, scene_num: int) -> dict:
    etype = el.get("type", "")
    st = float(el.get("start_time", scene_start + 0.4))
    if not (scene_start <= st < scene_end):
        el["start_time"] = round(scene_start + 0.4, 3)
    props = el.get("props", {})
    for key in ("x", "cx"):
        if key in props:
            try:
                props[key] = max(20, min(780, int(float(str(props[key])))))
            except (ValueError, TypeError):
                pass
    for key in ("y", "cy"):
        if key in props:
            try:
                props[key] = max(20, min(480, int(float(str(props[key])))))
            except (ValueError, TypeError):
                pass
    if etype == "asset":
        for key in ("cx",):
            if key in el:
                try:
                    el[key] = max(20, min(780, int(float(el[key]))))
                except (ValueError, TypeError):
                    pass
        for key in ("cy",):
            if key in el:
                try:
                    el[key] = max(20, min(480, int(float(el[key]))))
                except (ValueError, TypeError):
                    pass
    if not el.get("id", "").startswith(f"s{scene_num}-"):
        el["id"] = f"s{scene_num}-{el.get('id','el')}"
    return el


def assemble(topic: str, curriculum: list, scenes: list, narration: list) -> dict:
    title = topic.title()
    doc = {
        "theme": "dark",
        "meta": {
            "title": title,
            "subtitle": curriculum[0]["title"] if curriculum else f"How {title} Works",
            "description": f"A visual teaching animation about {topic.lower()}.",
        },
        "canvas": {"width": 800, "height": 500},
        "scenes": {},
        "narration": narration,
    }
    for i, (plan, scene_obj) in enumerate(zip(curriculum, scenes), start=1):
        scene_obj["scene_start"] = plan["start"]
        scene_obj["scene_end"]   = plan["end"]
        validated_els = [
            validate_element(el, plan["start"], plan["end"], i)
            for el in scene_obj.get("elements", [])
        ]
        scene_obj["elements"] = validated_els
        doc["scenes"][f"scene{i}"] = scene_obj
    return json.loads(json.dumps(doc))


# ─────────────────────────────────────────────────────────────────────────────
# TOPIC EXTRACTOR  — replaces regex, same purpose
# ─────────────────────────────────────────────────────────────────────────────

def extract_topic(user_input: str) -> str:
    """Use the topic_extractor_agent to get the clean topic from any phrasing."""
    task = Task(
        description=(
            f"User request: \"{user_input}\"\n\n"
            "Extract and return ONLY the educational topic from the above request.\n"
            "Examples:\n"
            "  'teach me photosynthesis'              → photosynthesis\n"
            "  'explain Newton's Laws to me'           → Newton's Laws\n"
            "  'can you make an animation about the water cycle?' → the water cycle\n"
            "  'I want to learn about black holes'     → black holes\n"
            "  'osmosis'                               → osmosis\n\n"
            "Output ONLY the topic — no explanation, no punctuation, no markdown."
        ),
        agent=topic_extractor_agent,
        expected_output="The plain topic string only.",
    )
    raw = crew_run([topic_extractor_agent], [task])
    topic = raw.strip().strip('"').strip("'").strip()
    if not topic or len(topic) > 200:
        topic = user_input.strip()
    return topic


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PIPELINE
# ─────────────────────────────────────────────────────────────────────────────

def generate(user_input: str) -> dict:
    """
    Exact same pipeline as your working code.
    Only change: topic extracted by LLM agent instead of regex.
    Returns the assembled animation JSON dict (unchanged return type).
    """
    # Topic extraction — LLM agent instead of regex
    topic = extract_topic(user_input)

    print(f"\n{'═'*60}")
    print(f"  Topic: {topic}")
    print(f"{'═'*60}\n")

    # 1. Curriculum
    print("Step 1/3  Curriculum…")
    curriculum = run_curriculum(topic)
    for s in curriculum:
        print(f"  scene{s['scene']}: {s['title']}")
    print()

    # 2. Scenes
    print("Step 2/3  Scenes (one at a time)…")
    scenes = []
    for plan in curriculum:
        sn = plan["scene"]
        print(f"  [{sn}/5] {plan['title']}")
        scene_obj = run_scene(sn, plan, topic)
        n = len(scene_obj.get("elements", []))
        print(f"       → {n} elements")
        scenes.append(scene_obj)
    print()

    # 3. Narration
    print("Step 3/3  Narration…")
    narration = run_narration(curriculum, topic)
    print(f"       → {len(narration)} entries\n")

    # 4. Assemble
    final = assemble(topic, curriculum, scenes, narration)
    print("Assembly complete.\n")
    return final


# ─────────────────────────────────────────────────────────────────────────────
# CHANGE 3 of 3 — AWS Bedrock AgentCore entrypoint
# ─────────────────────────────────────────────────────────────────────────────
try:
    from bedrock_agentcore.runtime import BedrockAgentCoreApp
    _AGENTCORE_AVAILABLE = True
except ImportError:
    _AGENTCORE_AVAILABLE = False

if _AGENTCORE_AVAILABLE:
    app = BedrockAgentCoreApp()

    @app.entrypoint
    def agentcore_handler(payload: dict, context) -> dict:
        """
        AgentCore invocation handler.
        POST /invocations  →  { "prompt": "teach me photosynthesis" }

        Response:
        {
          "topic":          "Photosynthesis",
          "slug":           "photosynthesis",
          "json_filename":  "photosynthesis-animation.json",
          "svg_filename":   "photosynthesis-animation.svg",
          "animation_json": { ...full Kydy JSON... },
          "svg":            "<svg ...>...</svg>"
        }

        Your backend:
          - Store animation_json + svg in your database.
          - Send svg (or svg_filename if you store to S3 first) to frontend.
        """
        try:
            user_input = payload.get("prompt", "").strip()
            if not user_input:
                return {"error": "Missing 'prompt' field in payload."}

            # Run the pipeline (unchanged generate())
            animation_json = generate(user_input)

            # Compile SVG (new — calls kydy_engine directly)
            svg = compile_svg(animation_json)

            topic = animation_json.get("meta", {}).get("title", user_input)
            slug  = _topic_to_slug(topic)

            return {
                "topic":          topic,
                "slug":           slug,
                "json_filename":  f"{slug}-animation.json",
                "svg_filename":   f"{slug}-animation.svg",
                "animation_json": animation_json,
                "svg":            svg,
            }
        except Exception as exc:
            import traceback
            return {
                "error":     str(exc),
                "traceback": traceback.format_exc(),
            }


# ─────────────────────────────────────────────────────────────────────────────
# CLI  — saves both .json and .svg
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        if _AGENTCORE_AVAILABLE:
            app.run()  # AgentCore launches the HTTP server on port 8080
        else:
            print('Usage: python main.py "teach me <topic>"')
            sys.exit(1)
    else:
        user_input = " ".join(sys.argv[1:])
        data = generate(user_input)

        # Filenames from the assembled topic
        topic_title = data.get("meta", {}).get("title", user_input)
        slug = _topic_to_slug(topic_title)
        json_out = f"{slug}-animation.json"
        svg_out  = f"{slug}-animation.svg"

        # Save JSON
        with open(json_out, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        # Compile + save SVG
        svg = compile_svg(data)
        if svg:
            with open(svg_out, "w", encoding="utf-8") as f:
                f.write(svg)

        sc  = len(data.get("scenes", {}))
        nr  = len(data.get("narration", []))
        els = sum(len(s.get("elements", [])) for s in data["scenes"].values())

        print(f"✅  JSON → {json_out}")
        if svg:
            print(f"✅  SVG  → {svg_out}  ({len(svg):,} chars)")
        else:
            print("⚠   SVG skipped (kydy_engine.py not found)")
        print(f"   Scenes: {sc}  |  Elements: {els}  |  Narration: {nr}")