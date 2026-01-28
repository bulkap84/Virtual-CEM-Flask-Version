import os

target = os.path.join("static", "img")
print(f"Scanning folder: {os.path.abspath(target)}")

if os.path.exists(target):
    files = os.listdir(target)
    print(f"Files found: {len(files)}")
    for f in files:
        print(f"File: '{f}'")
else:
    print("ERROR: static/img folder does not exist!")
