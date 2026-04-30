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

# Need this for overriding, in case user has it not at python3.
PYTHON = python3


TOOL_WEBEXT = $(shell command -v web-ext > /dev/null)
TOOL_GAWK = $(shell command -v gawk > /dev/null)
TOOL_PYTHON = $(shell command -v $(PYTHON) > /dev/null)
TOOL_JQ = $(shell command -v jq > /dev/null)

ifeq ($(TOOL_WEBEXT), undefined)
	$(error Missing Build Dependency: web-ext)
endif

ifeq ($(TOOL_GAWK), undefined)
	$(error Missing Build Dependency: GNU Awk)
endif

ifeq ($(TOOL_PYTHON), undefined)
	$(error Missing Build Dependency: Python. If your system does not have Python installed at python3 on your path, please override this with the argument PYTHON=x, where x represents the command of which executes Python on your system.)
endif

ifeq ($(TOOL_JQ), undefined)
	$(error Missing Build Dependency: jq)
endif

VERSION := $(shell jq -r '.version' src/manifest-firefox.json)


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


# Firefox-specific

$(BUILD_DIR)/deslopify-firefox.zip: $(BUILD_DIR)/firefox/manifest.json $(BUILD_DIR)/firefox
> web-ext lint -s $(BUILD_DIR)/firefox
> web-ext build -s $(BUILD_DIR)/firefox -a $(BUILD_DIR)/output/firefox

$(BUILD_DIR)/firefox/manifest.json: $(BUILD_DIR)/firefox
> mv $(BUILD_DIR)/firefox/manifest-firefox.json $(BUILD_DIR)/firefox//manifest.json

$(BUILD_DIR)/firefox: $(BUILD_DIR)/common
> cp -a $(SOURCE_DIR)/. $(BUILD_DIR)/firefox


# Chromium-specific

$(BUILD_DIR)/deslopify-chromium.zip: $(BUILD_DIR)/chromium/manifest.json $(BUILD_DIR)/chromium $(BUILD_DIR)/output/chromium
> zip -r $(BUILD_DIR)/output/chromium/deslopify-$(VERSION)-chromium.zip $(BUILD_DIR)/chromium/.

$(BUILD_DIR)/chromium/manifest.json: $(BUILD_DIR)/chromium
> python3 build_chromium_manifest.py -s $(BUILD_DIR)/chromium/manifest-firefox.json -o $(BUILD_DIR)/chromium/manifest.json 

$(BUILD_DIR)/chomium/deslopifycrx.js: $(BUILD_DIR)/chomium/deslopify.js
> gawk '{gsub(/browser\./, "chrome.")}1' $(BUILD_DIR)/chomium/deslopify.js > $(BUILD_DIR)/chomium/deslopifycrx.js

$(BUILD_DIR)/chomium/backgroundcrx.js: $(BUILD_DIR)/chomium/background.js
> gawk '{gsub(/browser\./, "chrome.")}1' $(BUILD_DIR)/chomium/background.js > $(BUILD_DIR)/chomium/backgroundcrx.js

$(BUILD_DIR)/chromium: $(BUILD_DIR)/common
> cp -a $(SOURCE_DIR)/. $(BUILD_DIR)/chromium

$(BUILD_DIR)/output/chromium:
> mkdir -p $(BUILD_DIR)/output/chromium


# General building

$(BUILD_DIR)/common: $(SOURCE_DIR) $(BUILD_DIR) $(SOURCE_DIR)/deslopify.js $(SOURCE_DIR)/blocklist.json $(SOURCE_DIR)/background.js
> cp -a $(SOURCE_DIR)/. $(BUILD_DIR)/common

$(BUILD_DIR):
> mkdir -p $(BUILD_DIR)