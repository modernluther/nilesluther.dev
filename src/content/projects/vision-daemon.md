---
title: "Vision daemon"
order: 4
summary: "A self-healing daemon that has turned 65,618 screen events into data."
dates: "July 2026 to present"
links:
  - { label: "GitHub", href: "https://github.com/modernluther/vision-daemon" }
results:
  - { value: "65,618", label: "events turned into structured data" }
  - { value: "1,720", label: "tests that run without the game" }
  - { value: "15", label: "of 16 reproduced issues fixed after a pre-release review" }
---

## Problem

A legacy game client shows events on screen and never saves them. The only record is the pixels, and they disappear.

## What I built

A fully autonomous vision daemon in Python and AutoHotkey, with a vision model, that reads the client's screen and records each event as structured data for ACE // OPS.
