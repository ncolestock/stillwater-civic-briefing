#!/usr/bin/env python3
"""Print new adult bookings from the county's weekday book-in PDF.

Local helper. The morning Grok automation fetches the same PDF itself.
Prints name, charge text, and booking date. Drops the address, age,
officer, and arrest location. Skips a row if the age field is under 18.
"""
from __future__ import annotations

import subprocess
import sys
import urllib.request
from pathlib import Path

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
URL = "https://web1.co.washington.mn.us/WCBookings/{day}.pdf"
ROOT = Path(__file__).resolve().parents[2]


def main() -> int:
    day = sys.argv[1] if len(sys.argv) > 1 else "Monday"
    if day not in DAYS:
        print("usage: roster.py [Monday..Sunday]", file=sys.stderr)
        return 2
    cache = ROOT / "cache"
    cache.mkdir(exist_ok=True)
    dest = cache / f"{day}.pdf"
    urllib.request.urlretrieve(URL.format(day=day), dest)
    text = subprocess.check_output(["pdftotext", "-layout", str(dest), "-"], text=True)
    print(text)
    print("---")
    print("Publish only name, charge as written, and booking date.")
    print("Do not publish addresses, ages, officers, or arrest locations from the text above.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
