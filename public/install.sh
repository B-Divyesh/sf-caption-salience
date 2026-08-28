#!/bin/sh
set -eu
base="https://github.com/B-Divyesh/sf-caption-salience/releases/latest/download"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT INT TERM
curl -fsSL "$base/latest.json" -o "$tmp_dir/latest.json"
url="$(sed -n 's/.*"linux": *"\([^"]*\)".*/\1/p' "$tmp_dir/latest.json")"
if [ -z "$url" ]; then
  echo "No Linux build is listed yet. Visit https://github.com/B-Divyesh/sf-caption-salience/releases/latest" >&2
  exit 1
fi
name="${url##*/}"
curl -fL "$url" -o "$tmp_dir/$name"
curl -fsSL "$base/SHA256SUMS" -o "$tmp_dir/SHA256SUMS"
expected="$(awk -v file="$name" '$2 == file {print $1}' "$tmp_dir/SHA256SUMS")"
actual="$(sha256sum "$tmp_dir/$name" | awk '{print $1}')"
[ -n "$expected" ] && [ "$actual" = "$expected" ] || { echo "Checksum did not match. Nothing was installed." >&2; exit 1; }
install_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
mkdir -p "$install_dir"
install -m 755 "$tmp_dir/$name" "$install_dir/caption-salience.AppImage"
echo "Installed verified AppImage to $install_dir/caption-salience.AppImage"
