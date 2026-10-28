#!/usr/bin/env node
// Fetch one agentic-workflows guide as markdown.
// Tries the published docs paths, then the expo/expo#52087 preview.
// Prints the page on stdout and `source: <url>` on stderr.

const SLUGS = ['introduction', 'agentic-ci', 'issue-to-pr', 'bug-triage', 'qa-swarm'];

// Published path is not final. expo/expo#52087 currently serves /agentic-workflows/.
// The PR description also mentions pages/eas/agentic-workflows/.
const BASES = [
  'https://docs.expo.dev/agentic-workflows',
  'https://docs.expo.dev/eas/agentic-workflows',
  'https://pr-52087.expo-docs.pages.dev/agentic-workflows',
];

function looksLikeGuide(text) {
  if (!text || text.length < 400) return false;
  const start = text.trimStart().slice(0, 200).toLowerCase();
  if (start.startsWith('<!doctype') || start.startsWith('<html')) return false;
  return /agentic workflow|expo simulators|agentic ci|qa swarm/i.test(text);
}

async function main() {
  const slug = process.argv[2];
  if (!SLUGS.includes(slug)) {
    console.error(`Usage: node fetch-docs.js <${SLUGS.join('|')}>`);
    process.exit(2);
  }

  const errors = [];
  for (const base of BASES) {
    const url = `${base}/${slug}.md`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        errors.push(`${url} -> HTTP ${response.status}`);
        continue;
      }
      const text = await response.text();
      if (!looksLikeGuide(text)) {
        errors.push(`${url} -> response was not the guide`);
        continue;
      }
      console.error(`source: ${url}`);
      process.stdout.write(text.endsWith('\n') ? text : `${text}\n`);
      return;
    } catch (error) {
      errors.push(`${url} -> ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.error(`Could not fetch the ${slug} guide.`);
  for (const line of errors) console.error(`  ${line}`);
  process.exit(1);
}

main();
