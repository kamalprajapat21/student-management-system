"""Fix setup_backend.py - replace outer \"\"\" delimiters with ''' to avoid conflicts."""
import re

with open(r"c:\Users\iSN_kota_T52\Desktop\rag pipeline\setup_backend.py", "r", encoding="utf-8") as f:
    content = f.read()

# Replace outer string delimiters: `= """\` -> `= '''\`  and  standalone `"""` line endings
# This is tricky, let's use a different approach:
# Replace all file content string starters: files["..."] = """\n  ->  files["..."] = '''\n
content = re.sub(r'(files\["[^"]+"\] = )"""\\', r"\1'''" + "\\\\", content)

# Also fix the line-ending triple quotes that close these strings
# These appear as `"""` at start of line (no indentation)
# Actually this regex approach is fragile. Let's just do a full rewrite.

print("Content length:", len(content))
print("Done - but this approach is fragile, using direct write instead.")
