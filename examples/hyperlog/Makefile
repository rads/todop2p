BUILD := public/build.js

$(BUILD): index.js
	./node_modules/.bin/browserify index.js > $@

watch:
	./node_modules/.bin/watchify -vo $(BUILD) index.js

.PHONY: watch
