"""
AHK Academy — Import a student document (PDF or DOCX) into PostgreSQL.
Stores the original file as binary (fileContent) + extracted text (textContent).

Usage:
    python scripts/import_document.py <student_email> <document_type> <title> <filepath>

Example:
    python scripts/import_document.py ahmetgurkan@geopaveco.com AGREEMENT "Private Lesson Agreement" "C:\\path\\to\\file.pdf"
"""

import sys
import os
import psycopg2
from pathlib import Path
from datetime import datetime

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432,
        dbname="ahk_academy", user="postgres",
        password="Wolverine1997@@"
    )

def extract_text(filepath: Path) -> str:
    """Extract text from PDF or DOCX."""
    ext = filepath.suffix.lower()
    if ext == ".pdf":
        try:
            import pdfplumber
            text_parts = []
            with pdfplumber.open(str(filepath)) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        text_parts.append(t)
            return "\n\n".join(text_parts)
        except ImportError:
            pass
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(filepath))
            return "\n\n".join(p.extract_text() or "" for p in reader.pages)
        except ImportError:
            return ""
    elif ext in (".docx", ".doc"):
        try:
            import docx
            doc = docx.Document(str(filepath))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except ImportError:
            return ""
    return ""

def import_document(student_email, doc_type, title, filepath_str):
    filepath = Path(filepath_str)
    if not filepath.exists():
        print(f"ERROR: File not found: {filepath}")
        return

    conn = get_conn()
    cur  = conn.cursor()

    # Get student
    cur.execute('SELECT id, name FROM "User" WHERE email = %s', (student_email,))
    row = cur.fetchone()
    if not row:
        print(f"ERROR: Student not found: {student_email}")
        return
    student_id, student_name = row

    # Check if already imported
    cur.execute('''SELECT id FROM "StudentDocument"
                   WHERE "studentId" = %s AND filename = %s''',
                (student_id, filepath.name))
    if cur.fetchone():
        print(f"Already imported: {filepath.name}")
        cur.close(); conn.close()
        return

    # Read binary
    file_bytes = filepath.read_bytes()
    file_size  = len(file_bytes)

    # Extract text
    print(f"Extracting text from {filepath.name}...")
    text_content = extract_text(filepath)
    print(f"  Extracted {len(text_content)} characters")

    # Detect MIME type
    ext = filepath.suffix.lower()
    mime_map = {
        ".pdf":  "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc":  "application/msword",
        ".txt":  "text/plain",
    }
    mime = mime_map.get(ext, "application/octet-stream")

    # Insert
    import uuid
    doc_id = str(uuid.uuid4())[:25]
    cur.execute('''
        INSERT INTO "StudentDocument"
        (id, "studentId", "documentType", title, filename, "mimeType",
         "fileSize", "fileContent", "textContent", "uploadedAt", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), NOW())
    ''', (
        doc_id, student_id, doc_type, title,
        filepath.name, mime, file_size,
        psycopg2.Binary(file_bytes),
        text_content or None,
    ))

    conn.commit()
    cur.close()
    conn.close()

    print(f"\n✅ Document saved to database")
    print(f"   Student   : {student_name}")
    print(f"   Type      : {doc_type}")
    print(f"   Title     : {title}")
    print(f"   File      : {filepath.name}")
    print(f"   Size      : {file_size / 1024:.1f} KB")
    print(f"   Text chars: {len(text_content)}")

if __name__ == "__main__":
    if len(sys.argv) == 5:
        import_document(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        # Default: Gurkan's agreement
        import_document(
            "ahmetgurkan@geopaveco.com",
            "AGREEMENT",
            "Private English Lesson Agreement — Ahmet Gürkan",
            r"C:\Users\ahk79\AHK_Academy\STUDENTS\Gurkan\AHMETGURKAN_AGREEMENT.pdf"
        )
