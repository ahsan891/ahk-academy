"""
Lesson AI System — FastAPI application.
Streams a 5-step pipeline: content update → explanation → presentation → student version → quiz.
"""
import json
import uuid
import asyncio
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

import ai_service
import file_service
import pptx_service

# ─── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(title="Lesson AI System", version="1.0")

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static",  StaticFiles(directory="static"),  name="static")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return FileResponse("static/index.html")


@app.post("/api/process")
async def process_lesson(
    lesson_name:          str = Form(...),
    old_content_text:     str = Form(""),
    new_publications_text: str = Form(""),
    old_content_file:     Optional[UploadFile] = File(None),
    new_publications_file: Optional[UploadFile] = File(None),
    old_pptx_file:        Optional[UploadFile] = File(None),
):
    """
    Main endpoint.  Accepts text and/or uploaded files, streams SSE events
    describing each pipeline step as it completes.
    """
    # Resolve text from uploaded files or direct input
    old_text = old_content_text.strip()
    if old_content_file and old_content_file.filename:
        raw = await old_content_file.read()
        old_text = file_service.extract_text(raw, old_content_file.filename)

    pub_text = new_publications_text.strip()
    if new_publications_file and new_publications_file.filename:
        raw = await new_publications_file.read()
        pub_text = file_service.extract_text(raw, new_publications_file.filename)

    pptx_text  = ""
    pptx_bytes = None
    if old_pptx_file and old_pptx_file.filename:
        pptx_bytes = await old_pptx_file.read()
        pptx_text  = file_service.extract_pptx_text(pptx_bytes)

    if not old_text:
        raise HTTPException(status_code=400, detail="Please provide lesson content (file or text).")

    session_id = uuid.uuid4().hex[:10]

    async def pipeline():
        step1_result = ""
        step3_result = ""

        # ── Step 1 ─────────────────────────────────────────────────────────
        yield _evt("step_start", step=1, title="Creating Updated Lesson Content")
        try:
            async for chunk in ai_service.step1_create_content(old_text, pub_text or "No new publications provided."):
                step1_result += chunk
                yield _evt("chunk", step=1, text=chunk)
        except Exception as e:
            yield _evt("error", step=1, message=str(e))
            return
        yield _evt("step_done", step=1)

        # ── Step 2 ─────────────────────────────────────────────────────────
        yield _evt("step_start", step=2, title="Generating Detailed Explanatory Text")
        try:
            async for chunk in ai_service.step2_explanatory_text(step1_result):
                yield _evt("chunk", step=2, text=chunk)
        except Exception as e:
            yield _evt("error", step=2, message=str(e))
            return
        yield _evt("step_done", step=2)

        # ── Step 3 ─────────────────────────────────────────────────────────
        yield _evt("step_start", step=3, title="Enriching Presentation")
        try:
            async for chunk in ai_service.step3_enrich_presentation(step1_result, pptx_text):
                step3_result += chunk
                yield _evt("chunk", step=3, text=chunk)
        except Exception as e:
            yield _evt("error", step=3, message=str(e))
            return

        # Generate PPTX from embedded JSON
        try:
            slides_json = ai_service.extract_slides_json(step3_result)
            if slides_json:
                pptx_path = OUTPUT_DIR / f"lesson_{session_id}.pptx"
                await asyncio.to_thread(
                    pptx_service.create_presentation,
                    slides_json, lesson_name, str(pptx_path),
                )
                yield _evt("file_ready", step=3,
                           filename=f"lesson_{session_id}.pptx", file_type="pptx")
            else:
                yield _evt("warning", step=3,
                           message="Could not extract slide JSON — PPTX not generated.")
        except Exception as e:
            yield _evt("warning", step=3, message=f"PPTX generation failed: {e}")

        yield _evt("step_done", step=3)

        # ── Step 4 ─────────────────────────────────────────────────────────
        yield _evt("step_start", step=4, title="Preparing Student Explanation")
        try:
            async for chunk in ai_service.step4_student_explanation(step1_result):
                yield _evt("chunk", step=4, text=chunk)
        except Exception as e:
            yield _evt("error", step=4, message=str(e))
            return
        yield _evt("step_done", step=4)

        # ── Step 5 ─────────────────────────────────────────────────────────
        yield _evt("step_start", step=5, title="Creating Daily Summary & Quizzes")
        try:
            quiz_data = await asyncio.to_thread(
                ai_service.step5_summary_and_quizzes, step1_result
            )
            quiz_path = OUTPUT_DIR / f"quiz_{session_id}.json"
            quiz_path.write_text(
                json.dumps(quiz_data, indent=2, ensure_ascii=False), encoding="utf-8"
            )
            yield _evt("quiz_result", step=5, data=quiz_data)
            yield _evt("file_ready", step=5,
                       filename=f"quiz_{session_id}.json", file_type="json")
        except Exception as e:
            yield _evt("error", step=5, message=str(e))
            return
        yield _evt("step_done", step=5)

        yield _evt("pipeline_done", session_id=session_id)

    return StreamingResponse(pipeline(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.get("/api/download/{filename}")
async def download_file(filename: str):
    path = OUTPUT_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="File not found.")
    return FileResponse(str(path), filename=filename)


# ─── SSE helper ───────────────────────────────────────────────────────────────

def _evt(event: str, **data) -> str:
    payload = {"event": event, **data}
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"
