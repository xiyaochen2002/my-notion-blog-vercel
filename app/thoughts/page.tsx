import { getPostsBySection } from "../../lib/notion";
import SectionPage from "../../components/SectionPage";

export const revalidate = 60;

export default async function ThoughtsPage() {
  const posts = await getPostsBySection("Thoughts");

  return (
    <SectionPage
      title="Thoughts"
      subtitle="Fragments, reflections, passing moods, and unfinished ideas."
      posts={posts}
    />
  );
}