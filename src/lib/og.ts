import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';

// Satori reads woff, not woff2.
const font400 = readFile('node_modules/@fontsource/inter/files/inter-latin-400-normal.woff');
const font500 = readFile('node_modules/@fontsource/inter/files/inter-latin-500-normal.woff');
const avatar = readFile('public/avatar.jpg').then((b) => `data:image/jpeg;base64,${b.toString('base64')}`);

export async function renderOg({ title, subtitle, host }: { title: string; subtitle: string; host: string }): Promise<Buffer> {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: { width: 1200, height: 630, background: '#FDFDFC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '84px 96px', fontFamily: 'Inter' },
        children: [
          { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 36 }, children: [
            { type: 'img', props: { src: await avatar, width: 144, height: 144, style: { borderRadius: 72 } } },
            { type: 'div', props: { style: { display: 'flex', flexDirection: 'column' }, children: [
              { type: 'div', props: { style: { fontSize: 56, fontWeight: 500, letterSpacing: -0.56, color: '#21201C' }, children: title } },
              { type: 'div', props: { style: { fontSize: 56, fontWeight: 500, color: '#63635E' }, children: subtitle } },
            ] } },
          ] } },
          { type: 'div', props: { style: { fontSize: 36, color: '#63635E' }, children: host } },
        ],
      },
    },
    { width: 1200, height: 630, fonts: [
      { name: 'Inter', data: await font400, weight: 400, style: 'normal' },
      { name: 'Inter', data: await font500, weight: 500, style: 'normal' },
    ] },
  );
  return new Resvg(svg).render().asPng();
}
