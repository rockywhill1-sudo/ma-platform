# Sign-out button + M&A Platform logo

Adds:
- M&A Platform logo at top-left of sidebar (clickable, goes to landing page)
- Sign out button at bottom of sidebar (next to your user info)

## Steps

1. Right-click `MA-PLATFORM` in Codespace Explorer, click Upload, select `signout-update.tar.gz`

2. In a terminal tab (not the dev server), paste:

```
tar -xzf signout-update.tar.gz && \
cp signout-update/sidebar.tsx src/components/layout/sidebar.tsx && \
echo "DONE"
```

3. To deploy to production at mergers.neaigroup.com:

```
pnpm run deploy
```

(Make sure CLOUDFLARE_API_TOKEN is set first - run `echo $CLOUDFLARE_API_TOKEN | head -c 10`. If empty, run `source ~/.cf-token.sh`.)

4. Hard refresh `mergers.neaigroup.com/companies/.../dashboard` and you should see:
- M&A Platform logo at top-left of sidebar (click to return to landing page)
- "Sign out" button at bottom of sidebar (under your name)

The signOut server action was already in src/app/actions.ts - we just wired the button to it.
