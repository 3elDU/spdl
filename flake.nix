{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem
      (system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };
        in with pkgs; {
          # FHS environment specifically with dependencies required to run electron binary.
          # This looks awful, but it works. And I don't know if I can (and if I want) to improve this
          apps.electron-fhs-env = let
            env = buildFHSUserEnv {
              name = "electron-fhs-env";
              runScript = "bash";
              targetPkgs = pkgs: (with pkgs; [
                python3
                stdenv.cc.cc
                gtk3 glib
                nodejs nss nspr dbus at-spi2-atk cups
                libdrm pango cairo
                mesa expat alsa-lib
                libdrm systemd libGL
              ] ++ (with pkgs.xorg; [
                  libX11 libXcomposite
                  libXdamage libXext
                  libXfixes libXrandr
                  libxcb libxkbcommon
                ]));
            };
          in {
            type = "app";
            program = "${env}/bin/electron-fhs-env";
          };

          devShells.default = mkShell {
            nativeBuildInputs = [ nodejs ];
            buildInputs = [ ];
          };
        }
      );
}
