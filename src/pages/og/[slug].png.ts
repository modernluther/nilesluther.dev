import type { APIRoute } from 'astro';
import { orderedProjects } from '../../lib/projects';
import { renderOg } from '../../lib/og';

export async function getStaticPaths() {
  const list = await orderedProjects();
  return [
    { params: { slug: 'home' }, props: { title: 'Niles Luther', subtitle: 'Engineer. Composer.' } },
    ...list.map((p) => ({ params: { slug: p.id }, props: { title: p.data.title, subtitle: 'Niles Luther' } })),
  ];
}
// The card prints the host the site is served from (SITE_URL at build time).
export const GET: APIRoute = async ({ props, site }) =>
  new Response(new Uint8Array(await renderOg({ ...(props as { title: string; subtitle: string }), host: site!.host })), { headers: { 'Content-Type': 'image/png' } });
