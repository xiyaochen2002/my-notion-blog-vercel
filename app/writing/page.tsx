import { getPostsBySection } from "../../lib/notion";
import SectionPage from "../../components/SectionPage";

export const revalidate = 60;

export default async function WritingPage() {
  const posts = await getPostsBySection("Writing");

  return (
    <SectionPage
      title="Writing"
      subtitle="Fragments of thought — journals, reflections, and things I felt like writing down."
      posts={posts}
    />
  );
}
