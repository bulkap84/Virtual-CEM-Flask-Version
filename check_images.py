import os

img_dir = os.path.join(os.getcwd(), 'static', 'img')
print(f"Checking directory: {img_dir}")

if not os.path.exists(img_dir):
    print("Directory does NOT exist!")
else:
    files = os.listdir(img_dir)
    print(f"Found {len(files)} files:")
    for f in files:
        print(f" - {f}")
