"""Fix setup_backend.py by removing triple-quoted docstrings inside embedded strings."""
import re

with open(r"c:\Users\iSN_kota_T52\Desktop\rag pipeline\setup_backend.py", "r", encoding="utf-8") as f:
    content = f.read()

# Replace triple-quoted docstrings inside embedded code with # comment versions
# Pattern: lines like `    """some text"""`
# These appear inside the string values and break parsing

# Simple replacement: find """...""" on same line (single-line docstrings)
content = re.sub(r'"""([^"]+)"""', r"# \1", content)

with open(r"c:\Users\iSN_kota_T52\Desktop\rag pipeline\setup_backend.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed setup_backend.py")
