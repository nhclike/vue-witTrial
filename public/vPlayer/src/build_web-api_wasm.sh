rm -rf libweb-api.wasm libweb-api.js
export TOTAL_MEMORY=100663296
export EXPORTED_FUNCTIONS="[ \
    '_loadDecoder', \
	'_unloadDecoder', \
    '_decodeOnePacket', \
	'_feedData', \
	'_openDecoder', \
	'_closeDecoder', \
	'_free', \
    '_main'
]"

echo "Running Emscripten..."
emcc web-api.c dist/lib/libavformat.a dist/lib/libavcodec.a dist/lib/libavutil.a dist/lib/libswscale.a \
    -O3 \
    -I "dist/include" \
    -s WASM=1 \
    -s TOTAL_MEMORY=${TOTAL_MEMORY} \
    -s EXPORTED_FUNCTIONS="${EXPORTED_FUNCTIONS}" \
    -s EXTRA_EXPORTED_RUNTIME_METHODS="['addFunction']" \
    -s RESERVED_FUNCTION_POINTERS=14 \
    -s FORCE_FILESYSTEM=1 \
    -o libweb-api.js

echo "Finished Build"
