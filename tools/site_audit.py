from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIRS = [ROOT, ROOT / "booking-v2"]
EXTENSIONS = {".html", ".js"}
EXCLUDED_DIRS = {".git", "node_modules"}

# These checks target frontend files, not this audit script.
FORBIDDEN_MARKERS = [
    "sb_secret_",
    "service" + "_role",
    "SUPABASE_SERVICE_ROLE_KEY",
    "sk_live_",
    "sk_test_",
]

files = set()
for directory in FRONTEND_DIRS:
    if not directory.is_dir():
        continue
    for path in directory.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in EXTENSIONS:
            continue
        if any(part in EXCLUDED_DIRS for part in path.parts):
            continue
        files.add(path)

if not files:
    print("ERROR: No frontend HTML or JavaScript files found.")
    sys.exit(1)

issues = 0
for path in sorted(files):
    content = path.read_text(encoding="utf-8", errors="replace")
    for marker in FORBIDDEN_MARKERS:
        if marker.lower() in content.lower():
            print(f"REVIEW REQUIRED: possible sensitive marker {marker!r} in {path.relative_to(ROOT)}")
            issues += 1
    print(f"Checked: {path.relative_to(ROOT)}")

if issues:
    print(f"Audit flagged {issues} possible issue(s). Review manually; matches may be false positives.")
    sys.exit(1)

print("Basic frontend marker scan passed. This is not a complete security audit.")
