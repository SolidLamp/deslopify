SHELL := bash
.ONESHELL:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

BUILD_DIR = dist
SOURCE_DIR = src
# TARGET = $(BUILD_DIR)/deslopify-firefox.zip

JS = $(wildcard $(SOURCE_DIR)/*.js)

ifeq ($(origin .RECIPEPREFIX), undefined)
	$(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
.RECIPEPREFIX = >


TOOL_WEBEXT = $(shell command -v web-ext > /dev/null; echo $$?)
TOOL_NPM = $(shell command -v npm > /dev/null; echo $$?)
TOOL_EXTENSIONJS = $(shell command -v extension > /dev/null; echo $$?)
TOOL_JQ = $(shell command -v jq > /dev/null; echo $$?)
TOOL_GREP = $(shell command -v grep > /dev/null; echo $$?)
TOOL_UUIDGEN = $(shell command -v uuidgen > /dev/null; echo $$?)

ifeq ($(TOOL_WEBEXT), 1)
	$(error Missing Build Dependency: web-ext)
endif

ifeq ($(TOOL_NPM), 1)
	$(error Missing Build Dependency: npm)
endif

ifeq ($(TOOL_EXTENSIONJS), 1)
	$(error Missing Build Dependency: extension.js)
endif

ifeq ($(TOOL_JQ), 1)
	$(error Missing Build Dependency: jq)
endif

ifeq ($(TOOL_GREP), 1)
	$(error Missing Build Dependency: grep)
endif

ifeq ($(TOOL_UUIDGEN), 1)
	$(error Missing Build Dependency: uuidgen)
endif

VERSION := $(shell jq -r '.version' src/manifest.json)
TEST_ID := $(shell uuidgen --random)


default: all
all: firefox chromium
firefox: $(BUILD_DIR)/deslopify-$(VERSION)/deslopify-$(VERSION)-firefox.zip
chromium: $(BUILD_DIR)/deslopify-$(VERSION)/deslopify-$(VERSION)-chromium.zip
.PHONY: default all firefox chromium


# // JS = $(patsubst %.js, %.ts, $(wildcard *.ts))


# Cleaning

clean:
> if [ -d "$(BUILD_DIR)/common" ]; then rm -r $(BUILD_DIR)/common; fi
> if [ -d "$(BUILD_DIR)/firefox" ]; then rm -r $(BUILD_DIR)/firefox; fi
> if [ -d "$(BUILD_DIR)/chromium" ]; then rm -r $(BUILD_DIR)/chromium; fi
.PHONY: clean

# Test builds

test: $(BUILD_DIR)/deslopify-test-builds/deslopify-$(TEST_ID)-firefox.zip $(BUILD_DIR)/deslopify-test-builds/deslopify-$(TEST_ID)-chromium.zip
> echo "done"
.PHONY: test

$(BUILD_DIR)/deslopify-test-builds/deslopify-$(TEST_ID)-firefox.zip: $(BUILD_DIR)/firefox $(BUILD_DIR)/firefox/blocklist.json $(BUILD_DIR)/firefox/blocklist.schema.json
> web-ext build -s $(BUILD_DIR)/firefox -a $(BUILD_DIR)/deslopify-test-builds --filename {name}-$(TEST_ID)-firefox.zip

$(BUILD_DIR)/deslopify-test-builds/deslopify-$(TEST_ID)-chromium.zip: $(BUILD_DIR)/chromium $(BUILD_DIR)/chromium/blocklist.json $(BUILD_DIR)/chromium/blocklist.schema.json
> web-ext build -s $(BUILD_DIR)/chromium -a $(BUILD_DIR)/deslopify-test-builds --filename {name}-$(TEST_ID)-chromium.zip

# Firefox

$(BUILD_DIR)/deslopify-$(VERSION)/deslopify-$(VERSION)-firefox.zip: $(BUILD_DIR)/firefox $(BUILD_DIR)/firefox/blocklist.json $(BUILD_DIR)/firefox/blocklist.schema.json
> web-ext build -s $(BUILD_DIR)/firefox -a $(BUILD_DIR)/deslopify-$(VERSION) --filename {name}-{version}-firefox.zip

$(BUILD_DIR)/firefox/blocklist.schema.json: $(BUILD_DIR)/firefox
> MANGLED_NAME=$$(ls $(BUILD_DIR)/firefox/assets | grep blocklist.schema --max-count 1)
> cp $(BUILD_DIR)/firefox/assets/$$MANGLED_NAME $(BUILD_DIR)/firefox/assets/blocklist.schema.json

$(BUILD_DIR)/firefox/blocklist.json: $(BUILD_DIR)/firefox
> MANGLED_NAME=$$(ls $(BUILD_DIR)/firefox/assets | grep blocklist --max-count 1)
> cp $(BUILD_DIR)/firefox/assets/$$MANGLED_NAME $(BUILD_DIR)/firefox/assets/blocklist.json

$(BUILD_DIR)/firefox:
> extension build --no-telemetry --polyfill --browser firefox


# Chromium-specific

$(BUILD_DIR)/deslopify-$(VERSION)/deslopify-$(VERSION)-chromium.zip: $(BUILD_DIR)/chromium $(BUILD_DIR)/chromium/blocklist.json $(BUILD_DIR)/chromium/blocklist.schema.json
> web-ext build -s $(BUILD_DIR)/chromium -a $(BUILD_DIR)/deslopify-$(VERSION) --filename {name}-{version}-chromium.zip

$(BUILD_DIR)/chromium/blocklist.schema.json: $(BUILD_DIR)/chromium
> MANGLED_NAME=$$(ls $(BUILD_DIR)/chromium/assets | grep blocklist.schema --max-count 1)
> cp $(BUILD_DIR)/chromium/assets/$$MANGLED_NAME $(BUILD_DIR)/chromium/assets/blocklist.schema.json

$(BUILD_DIR)/chromium/blocklist.json: $(BUILD_DIR)/chromium
> MANGLED_NAME=$$(ls $(BUILD_DIR)/chromium/assets | grep blocklist --max-count 1)
> cp $(BUILD_DIR)/chromium/assets/$$MANGLED_NAME $(BUILD_DIR)/chromium/assets/blocklist.json

$(BUILD_DIR)/chromium:
> extension build --no-telemetry --polyfill --browser chromium

# General building

$(BUILD_DIR):
> mkdir -p $(BUILD_DIR)
