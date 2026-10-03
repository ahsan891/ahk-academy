#!/usr/bin/env python3
"""Subsets the Latin fonts to Basic Latin + Latin-1 + Latin Extended-A (covers Turkish ç ğ ı İ ö ş ü) + punctuation.
Needs: pip install fonttools brotli. Input: full TTFs from Google Fonts (OFL). Output: site/assets/fonts/<Family>-<weight>-tr.woff2"""
import sys, subprocess, os
UNICODES = "U+0000-00FF,U+0100-017F,U+0218-021B,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+2713,U+2714,U+FEFF,U+FFFD"
src_dir, out_dir = sys.argv[1], sys.argv[2]
for line in open(os.path.join(src_dir, 'fontlist.txt')):
    fam, w, url = line.split()
    ttf = os.path.join(src_dir, f"{fam}-{w}.ttf")
    if not os.path.exists(ttf):
        subprocess.check_call(['curl', '-sS', '-o', ttf, url])
    out = os.path.join(out_dir, f"{fam}-{w}-tr.woff2")
    subprocess.check_call([sys.executable, '-m', 'fontTools.subset', ttf, f'--unicodes={UNICODES}', '--flavor=woff2', '--layout-features=kern,liga,calt,locl,ccmp,mark,mkmk', f'--output-file={out}', '--no-hinting', '--desubroutinize'])
    print(out, os.path.getsize(out) // 1024, 'KB')
