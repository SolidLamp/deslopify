#!/usr/bin/env python3

import json
import os.path
import sys
from typing import Any

# from jsonschema import validate


def read_json(file_name: str = "file.json") -> dict[Any, Any]:
    """Parses the file `file_name` as JSON

    Args:
        file_name (str, optional): The name of the file to parse. Defaults to "file.json".

    Returns:
        dict[Any, Any]: The parsed JSON as a Python dictionary.
    """
    if not os.path.exists(file_name):
        data = {}
    else:
        try:
            f = open(file_name, "rt")
        except IsADirectoryError:
            print("Error: Directory provided as input.", file=sys.stderr)
            sys.exit(2)

        with f:
            try:
                data = json.load(f).copy()
            except (TypeError, ValueError):
                data = {}
    return data


def write_json(json_data: str, file_name: str = "game.sav") -> None:
    """Writes JSON to a file.

    Args:
        json_data (str): The JSON data to write. Use json.dumps to generate this.
        file_name (str, optional): The name of the file to write to. Should include the file extension. Defaults to "game.sav".
    """
    file_name = os.path.normpath(file_name)
    with open(file_name, "wt") as f:
        f.write(json_data)


def browser_specific_settings(manifest: dict[str, Any]) -> bool:
    """Handles the key 'browser_specific_settings'

    Args:
        manifest (dict[str, Any]): The manifest.json to modify

    Returns:
        bool: Indicates whether any change was made to the manfest.
    """
    if "browser_specific_settings" in manifest:
        manifest.pop("browser_specific_settings")
        return True
    return False


def background(manifest: dict[str, Any]) -> bool:
    """Handles the key 'background'

    Args:
        manifest (dict[str, Any]): The manifest.json to modify

    Returns:
        bool: Indicates whether any change was made to the manfest.
    """
    if "background" not in manifest:
        return False
        
    if (
        "scripts" not in manifest["background"]
        and "persistent" not in manifest["background"]
    ):
        return False

    if "scripts" in manifest["background"]:
        manifest["background"]["service_worker"] = manifest["background"]["scripts"][0]
        manifest["background"].pop("scripts")

    if "persistent" in manifest["background"]:
        manifest["background"].pop("persistent")

    return True


def main(input_file: str, output_file: str) -> int:
    """The main program

    Args:
        input_file (str): The file name of the input file.
        output_file (str): The file name of the output file.

    Returns:
        int: Error code.
    """
    firefox_manifest = read_json(input_file)
    if not firefox_manifest:
        print("Error: Could not parse input file.", file=sys.stderr)
        return 1
    browser_specific_settings(firefox_manifest)
    background(firefox_manifest)
    chromium_manifest = json.dumps(firefox_manifest, indent=4)
    try:
        write_json(chromium_manifest, output_file)
    except PermissionError:
        print("Permission Error: Could not access output file.", file=sys.stderr)
        return 1
    return 0


def handle_args(args: list[str]) -> tuple[str, str]:
    """Handles arguments passed to the command line.

    Args:
        args (list[str]): The arguments passed to the command line.

    Returns:
        tuple[str, str]: The file name of the input file and file name of
        the output file.
    """
    source: str = ""
    output: str = ""
    if "-s" in args or "--source" in args:
        source_index: int = max(
            [
                index
                for index, arg in enumerate(args)
                if arg == "-s" or arg == "--source"
            ]
        )
        try:
            source: str = args[source_index + 1]
        except IndexError:
            print(
                "Error: source file not specified. Option left bare.", file=sys.stderr
            )
            sys.exit(2)
    if "-o" in args or "--output" in args:
        output_index: int = max(
            [
                index
                for index, arg in enumerate(args)
                if arg == "-o" or arg == "--output"
            ]
        )
        try:
            output: str = args[output_index + 1]
        except IndexError:
            print(
                "Error: output file not specified. Option left bare.", file=sys.stderr
            )
            sys.exit(2)
    if not source:
        print(
            "Error: source file not specified. Please use '-s' to specify source file.",
            file=sys.stderr,
        )
        sys.exit(2)
    if not output:
        print(
            "Error: output file not specified. Please use '-o' to specify output file.",
            file=sys.stderr,
        )
        sys.exit(2)
    return source, output


if __name__ == "__main__":
    source, output = handle_args(sys.argv)
    exit_code = main(source, output)
    sys.exit(exit_code)
