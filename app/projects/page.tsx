import { getPostsBySection } from "../../lib/notion";
import SectionPage from "../../components/SectionPage";

export const revalidate = 60;

export default async function ProjectsPage() {
  const posts = await getPostsBySection("Projects");

  return (
    <SectionPage
      title="Projects"
      subtitle="Selected work in mathematics, programming, and personal explorations."
      posts={posts}
    />
  );
}