{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {

  buildInputs = [
    pkgs.bash
    pkgs.cacert
    pkgs.gnumake
    pkgs.jq
    pkgs.nodejs
    pkgs.util-linux
    pkgs.yarn-berry
  ];

}
