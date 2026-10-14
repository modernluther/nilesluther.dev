---
title: "92Y presenter pipeline"
order: 5
summary: "101 slides and every course material, built from one file per session."
dates: "May 2026 to September 2026"
links:
  - { label: "Course page", href: "https://roundtable.org/live-courses/arts/art-music-the-secret-music-of-paintings" }
shot:
  src: "../../assets/shots/92y-presenter-pipeline.png"
  alt: "The presenter console on slide 10 of the first session: elapsed timer, current and next slide, speaker notes, and the audio cue"
  caption: "The presenter console for the first session: timer, speaker notes, and the next audio cue."
results:
  - { value: "101", label: "slides across 3 decks, generated" }
  - { value: "3", label: "displays kept in sync during the live course" }
  - { value: "3", label: "PDF listening sheets, with a QR code for every recording" }
---

## Problem

A three-session live course for the 92nd Street Y needed slide decks, listening sheets, and study documents that stayed consistent as the material changed, plus a live finale with audio and video on cue.

## What I built

A Python pipeline that generates every course material from one source file per session, and a presenter console that keeps the speaker view and the Zoom-shared slides in sync across three displays.
