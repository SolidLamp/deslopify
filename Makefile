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


TOOL_WEBEXT = $(shell command -v web-ext > /dev/null)
TOOL_NPM = $(shell command -v npm > /dev/null)
TOOL_EXTENSIONJS = $(shell command -v extension > /dev/null)
TOOL_JQ = $(shell command -v jq > /dev/null)
TOOL_GREP = $(shell command -v grep > /dev/null)

ifeq ($(TOOL_WEBEXT), undefined)
	$(error Missing Build Dependency: web-ext)
endif

ifeq ($(TOOL_NPM), undefined)
	$(error Missing Build Dependency: npm)
endif

ifeq ($(TOOL_EXTENSIONJS), undefined)
	$(error Missing Build Dependency: extension.js)
endif

ifeq ($(TOOL_JQ), undefined)
	$(error Missing Build Dependency: jq)
endif

ifeq ($(TOOL_GREP), undefined)
	$(error Missing Build Dependency: grep)
endif

VERSION := $(shell jq -r '.version' src/manifest.json)


default: all
all: firefox chromium
firefox: $(BUILD_DIR)/deslopify-firefox.zip
chromium: $(BUILD_DIR)/deslopify-chromium.zip
.PHONY: default all firefox chromium


# // JS = $(patsubst %.js, %.ts, $(wildcard *.ts))


# Cleaning
clean:
> if [ -d "$(BUILD_DIR)/common" ]; then rm -r $(BUILD_DIR)/common; fi
> if [ -d "$(BUILD_DIR)/firefox" ]; then rm -r $(BUILD_DIR)/firefox; fi
> if [ -d "$(BUILD_DIR)/chromium" ]; then rm -r $(BUILD_DIR)/chromium; fi
.PHONY: clean


# Firefox

$(BUILD_DIR)/deslopify-firefox.zip: $(BUILD_DIR)/firefox $(BUILD_DIR)/firefox/blocklist.json $(BUILD_DIR)/firefox/blocklist.schema.json
> web-ext build -s $(BUILD_DIR)/firefox -a $(BUILD_DIR)/deslopify-$(VERSION)-firefox.zip

$(BUILD_DIR)/firefox/blocklist.schema.json: $(BUILD_DIR)/firefox
> MANGLED_NAME=$$(ls $(BUILD_DIR)/firefox/assets | grep blocklist.schema --max-count 1)
> cp $(BUILD_DIR)/firefox/assets/$$MANGLED_NAME $(BUILD_DIR)/firefox/assets/blocklist.schema.json

$(BUILD_DIR)/firefox/blocklist.json: $(BUILD_DIR)/firefox
> MANGLED_NAME=$$(ls $(BUILD_DIR)/firefox/assets | grep blocklist --max-count 1)
> cp $(BUILD_DIR)/firefox/assets/$$MANGLED_NAME $(BUILD_DIR)/firefox/assets/blocklist.json

$(BUILD_DIR)/firefox:
> extension build --no-telemetry --polyfill --browser firefox


# Chromium-specific

$(BUILD_DIR)/deslopify-chromium.zip: $(BUILD_DIR)/chromium $(BUILD_DIR)/chromium/blocklist.json $(BUILD_DIR)/chromium/blocklist.schema.json
> web-ext build -s $(BUILD_DIR)/chromium -a $(BUILD_DIR)/deslopify-$(VERSION)-chromium.zip

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