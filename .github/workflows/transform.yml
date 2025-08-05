name: Transform Figma Tokens to MUI Theme

on:
  push:
    paths:
      - 'tokens.json'

jobs:
  build-theme:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Run transformation script
        run: node transform-tokens.js

      - name: Commit and push theme.js
        env:
          GH_PAT: ${{ secrets.GH_PAT }}
        run: |
          git config --global user.name 'github-actions'
          git config --global user.email 'github-actions@github.com'
          git remote set-url origin https://x-access-token:${GH_PAT}@github.com/${{ github.repository }}
          git add theme.js
          git commit -m 'Auto-generated MUI theme from Figma tokens'
          git push
