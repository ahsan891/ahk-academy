"""
Claude API service — all 5 pipeline steps.
Uses claude-opus-4-7 with adaptive thinking and prompt caching.
Steps 1-4 are async streaming generators; Step 5 returns structured JSON.
"""
import json
import re
import anthropic

client = anthropic.Anthropic()
async_client = anthropic.AsyncAnthropic()

MODEL = "claude-opus-4-7"

_SYSTEM = [{
    "type": "text",
    "text": (
        "You are an expert educator, curriculum developer, and instructional designer "
        "with 20+ years of experience. You excel at integrating cutting-edge research "
        "into engaging lesson content, explaining complex topics clearly, and designing "
        "assessments that measure deep understanding. Your writing is precise, engaging, "
        "and pedagogically sound."
    ),
    "cache_control": {"type": "ephemeral"},
}]


# ─── Step 1: Updated Lesson Content ──────────────────────────────────────────

async def step1_create_content(old_content: str, new_publications: str):
    """Stream updated lesson content that incorporates new publications."""
    async with async_client.messages.stream(
        model=MODEL,
        max_tokens=6000,
        thinking={"type": "adaptive"},
        system=_SYSTEM,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        f"## Existing Lesson Content\n\n{old_content[:8000]}\n\n"
                        f"## New Publications & Resources\n\n{new_publications[:6000]}"
                    ),
                    "cache_control": {"type": "ephemeral"},
                },
                {
                    "type": "text",
                    "text": (
                        "Update and enrich this lesson by:\n"
                        "1. **Integrating key findings** from the new publications naturally into the structure\n"
                        "2. **Adding 2–3 engaging real-world examples** that make each concept tangible\n"
                        "3. **Suggesting specific videos or multimedia** (describe what type and topic)\n"
                        "4. **Preserving all learning objectives** while adding depth and currency\n"
                        "5. **Flagging outdated claims** from the old content that new research revises\n\n"
                        "Use clear section headers (##). Keep all valuable existing content; enhance, don't replace."
                    ),
                },
            ],
        }],
    ) as stream:
        async for text in stream.text_stream:
            yield text


# ─── Step 2: Detailed Explanatory Text ───────────────────────────────────────

async def step2_explanatory_text(updated_content: str):
    """Stream a rich instructor-companion explanation of the lesson."""
    async with async_client.messages.stream(
        model=MODEL,
        max_tokens=5000,
        system=_SYSTEM,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"## Updated Lesson Content\n\n{updated_content[:8000]}",
                    "cache_control": {"type": "ephemeral"},
                },
                {
                    "type": "text",
                    "text": (
                        "Create a comprehensive **Explanatory Guide** for delivering this lesson:\n\n"
                        "1. **Concept Breakdown** — Explain each main concept thoroughly with clear, precise language\n"
                        "2. **Step-by-Step Processes** — Decompose any procedures or complex topics into numbered steps\n"
                        "3. **Analogies & Comparisons** — Connect each concept to something students already know\n"
                        "4. **Anticipated Questions** — List 3–4 questions students typically ask; provide model answers\n"
                        "5. **Key Vocabulary** — Define every essential term in accessible language\n"
                        "6. **Concept Connections** — Show explicitly how topics within the lesson relate to each other\n\n"
                        "Format with headers per section. Write as a guide the instructor reads while teaching."
                    ),
                },
            ],
        }],
    ) as stream:
        async for text in stream.text_stream:
            yield text


# ─── Step 3: Presentation Enrichment ─────────────────────────────────────────

async def step3_enrich_presentation(updated_content: str, existing_slides: str):
    """Stream slide-by-slide enrichment; embeds a JSON block for PPTX generation."""
    context = (
        f"\n\n**Existing Slides:**\n{existing_slides[:4000]}"
        if existing_slides.strip()
        else "\n\n**No existing slides provided — design a complete presentation from scratch.**"
    )

    async with async_client.messages.stream(
        model=MODEL,
        max_tokens=6000,
        system=_SYSTEM,
        messages=[{
            "role": "user",
            "content": [{
                "type": "text",
                "text": (
                    f"## Lesson Content\n\n{updated_content[:6000]}{context}\n\n"
                    "---\n\n"
                    "Create an enriched presentation. First write:\n"
                    "1. **Presentation Strategy** — How the deck improves on the original\n"
                    "2. **Visual Design Rationale** — What visuals to add and why\n"
                    "3. **Engagement Moments** — Activities, polls, or demos per section\n"
                    "4. **Timing Guide** — Suggested minutes per slide group\n\n"
                    "Then output a JSON block (exactly this format, inside ```json ... ```) "
                    "with 8–12 slides:\n\n"
                    "```json\n"
                    '{"slides": [{"title": "...", "content": ["bullet 1", "bullet 2", "bullet 3"], '
                    '"speaker_notes": "...", "visual_suggestion": "..."}]}\n'
                    "```\n\n"
                    "Each slide: 3–5 concise bullets, rich speaker notes (2–3 sentences), "
                    "and a visual_suggestion describing an image, chart, or diagram."
                ),
            }],
        }],
    ) as stream:
        async for text in stream.text_stream:
            yield text


# ─── Step 4: Student-Facing Explanation ──────────────────────────────────────

async def step4_student_explanation(updated_content: str):
    """Stream a warm, accessible explanation written directly to students."""
    async with async_client.messages.stream(
        model=MODEL,
        max_tokens=3500,
        system=_SYSTEM,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"## Lesson Content\n\n{updated_content[:6000]}",
                    "cache_control": {"type": "ephemeral"},
                },
                {
                    "type": "text",
                    "text": (
                        "Write a **Student Explanation** — spoken directly to students (use 'you'):\n\n"
                        "**Hook** — Open with a surprising fact, relatable scenario, or big question (2–3 sentences)\n\n"
                        "**Main Explanation** — Walk through each key concept using:\n"
                        "  • Everyday language (define jargon immediately when unavoidable)\n"
                        "  • Real-life examples from students' daily experience\n"
                        "  • Short analogies that stick\n\n"
                        "**Why It Matters** — Explain relevance to students' lives, careers, or society (1 paragraph)\n\n"
                        "**Memory Aids** — Provide 1–2 mnemonics, rhymes, or vivid mental images\n\n"
                        "**Key Takeaways** — Bullet list of the 4–5 most important points to remember\n\n"
                        "Tone: warm, enthusiastic, conversational. Length: 500–700 words."
                    ),
                },
            ],
        }],
    ) as stream:
        async for text in stream.text_stream:
            yield text


# ─── Step 5: Summary + 3 Quizzes ─────────────────────────────────────────────

def step5_summary_and_quizzes(updated_content: str) -> dict:
    """Return structured JSON: daily summary + 3 MCQ quizzes."""
    schema = {
        "type": "object",
        "properties": {
            "summary": {
                "type": "string",
                "description": "150–200 word recap of the lesson's most important points",
            },
            "quizzes": {
                "type": "array",
                "description": "Exactly 3 multiple-choice questions",
                "items": {
                    "type": "object",
                    "properties": {
                        "question_number": {"type": "integer"},
                        "type": {
                            "type": "string",
                            "enum": ["recall", "conceptual", "application"],
                        },
                        "question": {"type": "string"},
                        "options": {
                            "type": "array",
                            "description": "Exactly 4 options formatted as 'A. text'",
                            "items": {"type": "string"},
                        },
                        "correct_answer": {
                            "type": "string",
                            "enum": ["A", "B", "C", "D"],
                        },
                        "explanation": {
                            "type": "string",
                            "description": "1–2 sentence explanation of why the answer is correct",
                        },
                    },
                    "required": [
                        "question_number", "type", "question",
                        "options", "correct_answer", "explanation",
                    ],
                    "additionalProperties": False,
                },
            },
        },
        "required": ["summary", "quizzes"],
        "additionalProperties": False,
    }

    response = client.messages.create(
        model=MODEL,
        max_tokens=2000,
        system=_SYSTEM,
        output_config={"format": {"type": "json_schema", "schema": schema}},
        messages=[{
            "role": "user",
            "content": (
                f"Lesson content:\n\n{updated_content[:5000]}\n\n"
                "Create:\n"
                "1. A 150–200 word **summary** capturing the most important points students must remember.\n"
                "2. **Three quiz questions** (one per type):\n"
                "   - recall: tests factual memory\n"
                "   - conceptual: tests understanding of relationships/principles\n"
                "   - application: tests applying knowledge to a new scenario\n"
                "Format each option as 'A. text', 'B. text', 'C. text', 'D. text'."
            ),
        }],
    )

    text = next(b.text for b in response.content if b.type == "text")
    return json.loads(text)


# ─── Utility ──────────────────────────────────────────────────────────────────

def extract_slides_json(full_text: str) -> dict | None:
    """Pull the ```json ... ``` block from step 3 output."""
    match = re.search(r"```json\s*(\{[\s\S]*?\})\s*```", full_text)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    return None
