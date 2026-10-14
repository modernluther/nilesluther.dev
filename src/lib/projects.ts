import { getCollection, type CollectionEntry } from 'astro:content';
export type Project = CollectionEntry<'projects'>;
export async function orderedProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.order - b.data.order);
}
export function nextOf(list: Project[], index: number): Project {
  return list[(index + 1) % list.length];
}
