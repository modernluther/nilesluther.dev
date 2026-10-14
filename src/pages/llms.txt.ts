import type { APIRoute } from 'astro';
import { orderedProjects } from '../lib/projects';
export const GET: APIRoute = async ({ site }) => {
  const list = await orderedProjects();
  const lines = [
    '# Niles Luther', '', '> Engineer. Composer. Builds production software by directing AI coding agents. Based in New York.', '',
    '## Projects', '',
    ...list.map((p) => `- [${p.data.title}](${new URL(`/${p.id}/`, site)}): ${p.data.summary}`),
    '', '## Contact', '', '- niles@nilesluther.com', '- https://github.com/modernluther',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
