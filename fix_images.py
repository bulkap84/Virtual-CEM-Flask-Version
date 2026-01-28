import os

img_dir = os.path.join(os.getcwd(), 'static', 'img')
log_file = "fix_images_log.txt"

with open(log_file, "w") as log:
    log.write(f"Checking directory: {img_dir}\n")

    if not os.path.exists(img_dir):
        log.write("Directory does NOT exist!\n")
    else:
        files = os.listdir(img_dir)
        log.write(f"Found {len(files)} files:\n")
        
        for f in files:
            log.write(f" - {f}\n")
            if " (1)" in f:
                new_name = f.replace(" (1)", "")
                try:
                    os.rename(os.path.join(img_dir, f), os.path.join(img_dir, new_name))
                    log.write(f"   -> RENAMED to {new_name}\n")
                except Exception as e:
                     log.write(f"   -> RENAME FAILED: {e}\n")
