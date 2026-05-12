import { getPostsBySection } from "../../lib/notion";
import SectionPage from "../../components/SectionPage";

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPostsBySection("Blog");

  return (
    <SectionPage
      title="Blog"
      subtitle="Technical notes, travel stories, and everything in between."
      posts={posts}
    />
  );
}