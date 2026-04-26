SHELL := bash
.ONESHELL:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

BUILD_DIR = dist
SOURCE_DIR = src
TARGET = $(BUILD_DIR)/deslopify-firefox.zip

ifeq ($(origin .RECIPEPREFIX), undefined)
	$(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
.RECIPEPREFIX = >

default: $(TARGET)
all: default
.PHONY: default all

# JS = $(patsubst %.js, %.ts, $(wildcard *.ts))

$(BUILD_DIR)/deslopify-firefox.zip: $(OBJECTS)
> zip -r $(BUILD_DIR)/deslopify-firefox.zip $(BUILD_DIR)/firefox/.

$(BUILD_DIR)/firefox/manifest.json: $(BUILD_DIR)/firefox
> mv $(BUILD_DIR)/firefox/manifest-firefox.json $(BUILD_DIR)/firefox//manifest.json

$(BUILD_DIR)/firefox: $(BUILD_DIR)/common
> cp -a $(SOURCE_DIR)/. $(BUILD_DIR)/firefox

$(BUILD_DIR)/common: $(SOURCE_DIR) $(BUILD_DIR) deslopify.js blocklist.json background.js
> cp -a $(SOURCE_DIR)/. $(BUILD_DIR)/common

$(BUILD_DIR):
> mkdir -p $(BUILD_DIR)
