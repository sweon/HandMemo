---
description: Automatically push to GitHub when mobile or Android issues are addressed.
---

When a task involves fixing or improving behavior for 'mobile' or 'Android' (e.g., UI layout, back button, keyboard behavior):

1. **Verify Changes**: Ensure the code is correctly implemented and lint-free.
2. **Stage and Commit**: Stage all relevant files.
// turbo
3. **Commit and Push**: Use a descriptive commit message and push to the `main` branch immediately.

Example command:
```bash
git add . && git commit -m "Fix: [Description of mobile/Android fix]" && git push
```

Rationale: Pushing immediately allows the USER to test on physical devices or emulators via the deployed application or PWA updates.
