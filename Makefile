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
TOOL_GAWK = $(shell command -v gawk > /dev/null)

ifeq ($(TOOL_WEBEXT), undefined)
	$(error Missing Build Dependency: web-ext)
endif

ifeq ($(TOOL_GAWK), undefined)
	$(error Missing Build Dependency: GNU Awk)
endif


default: all
all: firefox chromium
firefox: $(BUILD_DIR)/deslopify-firefox.zip
chromium: $(BUILD_DIR)/deslopify-chromium.zip
.PHONY: default all firefox chromium

# TODO: Add clean


# JS = $(patsubst %.js, %.ts, $(wildcard *.ts))


$(BUILD_DIR)/deslopify-firefox.zip: $(BUILD_DIR)/firefox/manifest.json $(BUILD_DIR)/firefox
> web-ext build -s $(BUILD_DIR)/firefox -a $(BUILD_DIR)/output/firefox

$(BUILD_DIR)/firefox/manifest.json: $(BUILD_DIR)/firefox
> mv $(BUILD_DIR)/firefox/manifest-firefox.json $(BUILD_DIR)/firefox//manifest.json

$(BUILD_DIR)/firefox: $(BUILD_DIR)/common
> cp -a $(SOURCE_DIR)/. $(BUILD_DIR)/firefox


$(BUILD_DIR)/deslopify-chromium.zip: $(BUILD_DIR)/chromium/manifest.json $(BUILD_DIR)/chromium
> zip -r $(BUILD_DIR)/deslopify-chromium.zip $(BUILD_DIR)/chromium/.

$(BUILD_DIR)/chromium/manifest.json: $(BUILD_DIR)/chromium
> mv $(BUILD_DIR)/chromium/manifest-chromium.json $(BUILD_DIR)/chromium//manifest.json

$(BUILD_DIR)/chomium/deslopifycrx.js: $(BUILD_DIR)/chomium/deslopify.js
> gawk '{gsub(/browser\./, "chrome.")}1' $(BUILD_DIR)/chomium/deslopify.js > $(BUILD_DIR)/chomium/deslopifycrx.js

$(BUILD_DIR)/chomium/backgroundcrx.js: $(BUILD_DIR)/chomium/background.js
> gawk '{gsub(/browser\./, "chrome.")}1' $(BUILD_DIR)/chomium/background.js > $(BUILD_DIR)/chomium/backgroundcrx.js

$(BUILD_DIR)/chromium: $(BUILD_DIR)/common
> cp -a $(SOURCE_DIR)/. $(BUILD_DIR)/chromium


$(BUILD_DIR)/common: $(SOURCE_DIR) $(BUILD_DIR) $(SOURCE_DIR)/deslopify.js $(SOURCE_DIR)/blocklist.json $(SOURCE_DIR)/background.js
> cp -a $(SOURCE_DIR)/. $(BUILD_DIR)/common

$(BUILD_DIR):
> mkdir -p $(BUILD_DIR)