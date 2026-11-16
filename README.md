# STARK DAILY

A lightweight, mobile-friendly hydration tracker and daily reminder dashboard.

## Features
- Log water intake with a quick-add amount or custom entry.
- Set a daily hydration target and quick-add size.
- View today's total, progress, remaining amount, and entry history.
- Configure reminder interval and active hours.
- Installable PWA app shell with offline caching.

## Publish with GitHub Pages
1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**, then Save.
4. Wait for GitHub Pages to publish the site. The URL will appear in Settings → Pages.

## Notifications: important limitation
The current version checks reminder intervals while the app page is running. Browser notifications may appear when the page is in the background if the browser and operating system allow it, but reminders are **not guaranteed** when the browser is fully closed, the device restarts, or the operating system suspends the browser. A service worker does not by itself provide a reliable scheduler for future local notifications. Reliable closed-app reminders require a push-notification service and a server-side scheduler or another supported platform.

## Privacy
Settings and water entries are stored in the browser's local storage on the device. They are not sent to a server. Because this repository is public, do not commit passwords, API keys, private data, or personal records.

## Hydration target
The default 2,500 ml target is an editable tracking value, not a medical prescription. Individual fluid needs vary. Follow clinician guidance if you have a condition or medication that affects fluid intake.
