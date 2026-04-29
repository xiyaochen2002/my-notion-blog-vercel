import { getPostsBySection } from "../../lib/notion";
import GalleryPage from "../../components/GalleryPage";

export const revalidate = 60;

export default async function GalleryRoute() {
  const posts = await getPostsBySection("Gallery");

  return (
    <GalleryPage
      title="Gallery"
      subtitle="Places, movement, memory, and the landscapes that stayed with me."
      posts={posts}
    />
  );
}
