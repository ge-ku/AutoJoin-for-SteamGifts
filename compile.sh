# !/bin/bash

# This script will pack everything into AutoJoin_[BROWSER]_{VERSION}.zip ready for publishing.
# This way we can use unpacked extension while developing without changing any filename or manifest.json or manually replacing files.

clear

VERSION=$(grep '"version":' manifest.json | sed 's/^.*: //;s/"//g' | tr -d ',\r\n');
echo -e "AutoJoin version in manifest.json: $VERSION.\nThis script will pack everything into AutoJoin_[BROWSER]_${VERSION}.zip";

python3 - "$VERSION" <<'PYEOF'
import json, os, sys, zipfile

VERSION = sys.argv[1]
chrome_zip_name = f"AutoJoin_Chrome_{VERSION}.zip"
firefox_zip_name = f"AutoJoin_Firefox_{VERSION}.zip"

# Collect files to include (same for both browsers)
def collect_files():
    files = []
    for folder in ('css', 'media', 'html', 'js'):
        for f in sorted(os.listdir(folder)):
            path = os.path.join(folder, f)
            if os.path.isfile(path):
                files.append(path)
    return files

files = collect_files()

# --- Chrome zip ---
print(f"Creating {chrome_zip_name}...")
with zipfile.ZipFile(chrome_zip_name, 'w', compression=zipfile.ZIP_DEFLATED) as z:
    for f in files:
        z.write(f)
    z.write('manifest.json')
print(f"  {chrome_zip_name} created.")

# --- Firefox manifest ---
print("Generating Firefox manifest...")
with open('manifest.json') as f:
    m = json.load(f)

m.pop('key', None)
m['permissions'] = [p for p in m.get('permissions', []) if p != 'offscreen']
for res in m.get('web_accessible_resources', []):
    res.pop('use_dynamic_url', None)
m['background'] = {
    'scripts': ['js/settingsManager.js', 'js/parseHTML.js', 'js/backgroundpage.js']
}
m['browser_specific_settings'] = {
    'gecko': {
        'id': 'autojoin-for-steamgifts@rafaelhgo',
        'strict_min_version': '115.0'
    }
}
firefox_manifest = json.dumps(m, indent=2)

# --- Firefox zip (same files, different manifest) ---
print(f"Creating {firefox_zip_name}...")
with zipfile.ZipFile(firefox_zip_name, 'w', compression=zipfile.ZIP_DEFLATED) as z:
    for f in files:
        z.write(f)
    z.writestr('manifest.json', firefox_manifest)
print(f"  {firefox_zip_name} created.")

print("Done!")
PYEOF
