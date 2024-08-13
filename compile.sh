# !/bin/bash

# This script will pack everything into AutoJoin_[BROWSER]_{VERSION}.zip ready for publishing.
# This way we can use unpacked extension while developing without changing any filename or manifest.json or manually replacing files.
# Use WSL or cygwin to run on Windows.

clear

VERSION=$(grep '"version":' manifest.json | sed 's/^.*: //;s/"//g' | tr -d ',\r\n');
echo -e "AutoJoin version in manifest.json: $VERSION.\nThis script will pack everything into AutoJoin_[BROWSER]_${VERSION}.zip";

echo "Creating temp folder that will hold scripts and manifest.json, it'll be deleted in the end...";
mkdir temp;
mkdir temp/js;

echo "Creating AutoJoin_[BROWSER]_${VERSION}.zip with icons, mp3 file, manifest and jquery...";

zip "temp/AutoJoin_Chrome_${VERSION}.zip" css/* media/* html/*;
cp js/* temp/js;
cd temp;

echo "Adding js files into AutoJoin_${VERSION}.zip...";
zip "AutoJoin_Chrome_${VERSION}.zip" js/*;
mv "AutoJoin_Chrome_${VERSION}.zip" ../;
cd ..;

echo "Adding extra lines into manifest file needed for Firefox...";
cp "AutoJoin_Chrome_${VERSION}.zip" "AutoJoin_Firefox_${VERSION}.zip";
zip "AutoJoin_Chrome_${VERSION}.zip" manifest.json;
cp manifest.json temp/manifest.json;
firefox_specific_bits='\   \"applications\": {\n\      \"gecko\": {\n\         \"id\": \"jid1-VSlWBGe0y6Q0Iw@jetpack\",\n\         \"strict_min_version\": \"48.0\"\n\      }\n\   },';
sed -i "/\"manifest_version\": 2/i $firefox_specific_bits" temp/manifest.json;
zip -j "AutoJoin_Firefox_${VERSION}.zip" temp/manifest.json;

rm -rf temp;
echo "Done!";
