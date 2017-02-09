CLIENT := client.js
BUILD := public/build.js

$(BUILD): $(CLIENT)
	./node_modules/.bin/browserify $(CLIENT) > $(BUILD)

watch:
	./node_modules/.bin/watchify -vo $(BUILD) $(CLIENT)

.PHONY: watch
