# ============================================
# KYDY SVG GENERATOR (NO AGENT)
# Bedrock + Qwen Coder
# ============================================

import boto3
import re
import xml.etree.ElementTree as ET


# ============================================
# CONFIG
# ============================================

MODEL_ID = "qwen.qwen3-coder-30b-a3b-v1:0"
REGION = "us-east-1"

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name=REGION
)


# ============================================
# PROMPT BUILDER
# ============================================

def build_prompt(topic):

    return f"""
Create an animated educational SVG explaining {topic}.

OUTPUT FORMAT:

===SVG_START===
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
...
</svg>
===SVG_END===

RULES:

Canvas: 800x600

Background:
#0f172a

Accent:
cyan

Animation:
Use ONLY SVG native animation:

<animate>
<animateTransform>

Do NOT use CSS animations.

Layers required:

<g id="background-layer">
<g id="title-layer">
<g id="diagram-layer">
<g id="highlight-layer">
<g id="text-layer">

Animation flow:

1 Title appears
2 Diagram appears
3 Highlight appears
4 Explanation appears

Restrictions:

NO CSS
NO style tags
NO gradients
NO filters
NO foreignObject

Return ONLY the required format.
"""


# ============================================
# SVG GENERATION
# ============================================

def generate_svg(topic):

    prompt = build_prompt(topic)

    response = bedrock.converse(
        modelId=MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        inferenceConfig={
            "temperature": 0.3,
            "maxTokens": 3000
        }
    )

    return response["output"]["message"]["content"][0]["text"]


# ============================================
# SVG VALIDATOR
# ============================================

def validate_svg(svg):

    try:
        ET.fromstring(svg)
        return True
    except ET.ParseError as e:
        print("❌ SVG Parse Error:", e)
        return False


# ============================================
# SAVE SVG
# ============================================

def save_svg(topic, content):

    match = re.search(
        r"===SVG_START===\s*(<svg[\s\S]*?</svg>)\s*===SVG_END===",
        content
    )

    if not match:
        print("❌ SVG not found")
        return

    svg_code = match.group(1)

    if not validate_svg(svg_code):
        print("❌ Invalid SVG")
        return

    filename = topic.replace(" ", "_").lower() + ".svg"

    with open(filename, "w", encoding="utf-8") as f:
        f.write(svg_code)

    print(f"\n✅ SVG saved → {filename}")


# ============================================
# MAIN LOOP
# ============================================

if __name__ == "__main__":

    print("\n🎓 KYDY SVG GENERATOR (Qwen)")
    print("Type 'exit' to quit\n")

    while True:

        topic = input("Topic: ")

        if topic.lower() == "exit":
            break

        print("\n🎨 Generating SVG...\n")

        result = generate_svg(topic)

        save_svg(topic, result)

        print("\nDone.\n")