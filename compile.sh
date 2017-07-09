# !/bin/bash

# This script will minify javascript using Closure Compiler and pack everything into AutoJoin_{VERSION}.zip ready for uploading to the Chrome Store.
# This way we can use unpacked extension while developing without changing any filename or manifest.json or manually replacing files.
# Use "Bash on Ubuntu on Windows" if you're on Windows 10 (it's awesome!) or cygwin to run on Windows.

clear

VERSION=$(grep '"version":' manifest.json | sed 's/^.*: //;s/"//g' | tr -d ',\r\n');
echo "AutoJoin version in manifest.json: $VERSION. This script will minify javascript using Closure Compiler and pack everything into AutoJoin_${VERSION}.zip";

echo "Creating temp folder that will hold minified scripts, it'll be deleted in the end...";
mkdir temp;

echo "Creating AutoJoin_${VERSION}.zip with icons, mp3 file, manifest and jquery...";

zip "AutoJoin_${VERSION}.zip" autologo.png autologo16.png autologo48.png autologosteam.png audio.mp3 jquery.min.js manifest.json chromeOptions.css general.css night.css settings.html ;

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

zip -j "AutoJoin_${VERSION}.zip" temp/*.js;

rm -rf temp;

echo "Done!";
