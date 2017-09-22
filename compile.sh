# !/bin/bash

# This script will minify javascript using Closure Compiler and pack everything into AutoJoin_[BROWSER]_{VERSION}.zip ready for publishing.
# This way we can use unpacked extension while developing without changing any filename or manifest.json or manually replacing files.
# Use "Bash on Ubuntu on Windows" if you're on Windows 10 (it's awesome!) or cygwin to run on Windows.

clear

VERSION=$(grep '"version":' manifest.json | sed 's/^.*: //;s/"//g' | tr -d ',\r\n');
echo -e "AutoJoin version in manifest.json: $VERSION.\nThis script will minify javascript using Closure Compiler and pack everything into AutoJoin_[BROWSER]_${VERSION}.zip";

echo "Creating temp folder that will hold minified scripts and manifest.json, it'll be deleted in the end...";
mkdir temp;

echo "Creating AutoJoin_[BROWSER]_${VERSION}.zip with icons, mp3 file, manifest and jquery...";

zip "AutoJoin_Chrome_${VERSION}.zip" autologo.png autologo16.png autologo48.png autologosteam.png audio.mp3 jquery.min.js chromeOptions.css general.css night.css settings.html ;

echo "Minifying js files (besides jquery) using Closure Compiler...";
for jsfile in *.js; do
	if [ ! "$jsfile" = "jquery.min.js" ] ; then
		echo "--minifying $jsfile...";
		curl -s \
		  -d compilation_level=SIMPLE_OPTIMIZATIONS \
		  -d output_format=text \
		  -d output_info=compiled_code \
		  -d charset=utf-8 \
		  --data-urlencode "js_code@$jsfile" \
		  closure-compiler.appspot.com/compile \
		  -o "temp/$jsfile"
	fi
done

echo "Adding minified js files into AutoJoin_${VERSION}.zip...";
zip -j "AutoJoin_Chrome_${VERSION}.zip" temp/*.js;

echo "Adding extra lines into manifest file needed for Firefox...";
cp "AutoJoin_Chrome_${VERSION}.zip" "AutoJoin_Firefox_${VERSION}.zip";
zip "AutoJoin_Chrome_${VERSION}.zip" manifest.json;
cp manifest.json temp/manifest.json;
firefox_specific_bits='\   \"applications\": {\n\      \"gecko\": {\n\         \"id\": \"autojoin@kuzmenko.io\",\n\         \"strict_min_version\": \"48.0\"\n\      }\n\   },';
sed -i "/\"manifest_version\": 2/i $firefox_specific_bits" temp/manifest.json;
zip -j "AutoJoin_Firefox_${VERSION}.zip" temp/manifest.json;

rm -rf temp;
echo "Done!";
