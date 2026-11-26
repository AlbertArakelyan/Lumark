# 1.0.0 readiness

Blockers:

- [ ] Recent typing can be lost. src/contexts/CLAUDE.md:44 documents that switching note or folder throws away a save that is less than 500 ms old. I also found no flush when the window closes, so closing right after typing probably loses the last keystrokes too. In a local-first notes app, losing words is the one bug users don't forgive. A save-before-switch and save-on-close is a small fix and should come first.
- [ ] No auto-update. There's no Tauri updater plugin configured, so everyone on 1.0 stays on 1.0 until they come back to the Download page. Add it before 1.0: everyone who installs 1.0 without it would have to update by hand once to get it.
- [ ] No code signing. The docs already have a "Windows SmartScreen" warning callout, and macOS has the same issue with Gatekeeper. It works, but a 1.0 that opens with "Windows protected your PC" undercuts the label. This costs money (certificates), so it's your call.
- [x] No Apple Silicon build. Most Macs sold in the last few years are M-series, and they currently run the Intel build through Rosetta. For a release that claims cross-platform, that's a visible gap.

Not blockers, but worth doing first:

- [ ] yarn lint fails with 41 errors. That's cheap to fix and keeps the codebase clean going into 1.0.
- [ ] There are no tests at all. At minimum, a few Rust tests around validate_name, the migrations and unique_md_path would protect the code that touches user files.
- [ ] The new shortcuts haven't been tried in the real webview on all three OSes. Ctrl+U and Ctrl+K are the ones most likely to be grabbed by the browser engine before the editor sees them.

Not needed for 1.0: images in notes, PDF export and Mermaid can all land in 1.x. Unfinished roadmap items don't make an app less stable, and finishing every item isn't what earns the 1.0.

Suggested path: 0.13 fixes saving and adds the updater, 0.14 adds the Apple Silicon build and signing if you decide to pay for it, and 1.0 follows after a short stretch with no bug reports. I can start on the save fix now if you like, since it's the most important item and the smallest.
