import os
import shutil

# Paths
base_dir = os.getcwd()
static_dir = os.path.join(base_dir, 'static')
img_dir = os.path.join(static_dir, 'img')
source_dir = r"C:\Virtual CEM\CEM Pictures"

print("--- STARTING IMAGE RECOVERY ---")

# 1. Create Directory
if not os.path.exists(static_dir):
    os.mkdir(static_dir)
    print("Created 'static' folder")

if not os.path.exists(img_dir):
    os.mkdir(img_dir)
    print("Created 'static/img' folder")
else:
    print("'static/img' folder already exists")

# 2. Copy Files
print(f"Copying from: {source_dir}")
if os.path.exists(source_dir):
    files = os.listdir(source_dir)
    count = 0
    for f in files:
        src = os.path.join(source_dir, f)
        dst = os.path.join(img_dir, f)
        shutil.copy2(src, dst)
        count += 1
    print(f"Copied {count} files.")
else:
    print(f"CRITICAL ERROR: Source folder '{source_dir}' not found!")

# 3. Rename Files (Remove " (1)")
print("Renaming files...")
files = os.listdir(img_dir)
renamed = 0
for f in files:
    if " (1)" in f:
        new_name = f.replace(" (1)", "")
        src = os.path.join(img_dir, f)
        dst = os.path.join(img_dir, new_name)
        try:
            os.rename(src, dst)
            print(f"Fixed: {f} -> {new_name}")
            renamed += 1
        except Exception as e:
            print(f"Error renaming {f}: {e}")

print(f"Renamed {renamed} files.")
print("--- COMPLETED ---")
