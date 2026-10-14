---
title: "ACE // OPS"
order: 1
summary: "Player rankings built on an event log of 265,798 events."
dates: "April 2026 to present"
links:
  - { label: "aceops.app", href: "https://www.aceops.app" }
  - { label: "GitHub", href: "https://github.com/modernluther/ace-ops" }
shot:
  src: "../../assets/shots/ace-ops.png"
  alt: "Radar charts comparing the top-ranked player in each of four classes across six metrics, with a bar for each metric below"
  caption: "The rankings page in dark mode, captured October 13, 2026."
results:
  - { value: "265,798", label: "events recorded across 843 players" }
  - { value: "99.6%", label: "of 6,116 scheduled captures succeeded" }
  - { value: "44", label: "countries, with 76% of visitors outside the US" }
  - { value: "60", label: "signatures in 24 hours on an open letter; the publisher then upgraded server capacity" }
---

## Problem

A legacy online game publishes its rankings as one raw table with no history. Players could see who led today, with no record of who was rising, falling, or gone.

## What I built

A ranking platform on an event-sourced architecture. Every change in the game's public data is stored as an event, and every metric on the site derives from that log. A Next.js and TypeScript front end on Vercel reads from a Cloudflare Workers and Neon Postgres backend.
