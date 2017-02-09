BUILD := build.js

watch:
	./node_modules/.bin/watchify -vo $(BUILD) index.js

$(BUILD): index.js
	./node_modules/.bin/browserify index.js > $@

.PHONY: watch
