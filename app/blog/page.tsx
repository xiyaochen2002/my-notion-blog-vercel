import { getPostsBySection } from "../../lib/notion";
import SectionPage from "../../components/SectionPage";

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPostsBySection("Blog");

  return (
    <SectionPage
      title="Blog"
      subtitle="Longer writing, personal essays, and the things I want to keep."
      posts={posts}
    />
  );
}