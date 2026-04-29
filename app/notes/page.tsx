import { getPostsBySection } from "../../lib/notion";
import SectionPage from "../../components/SectionPage";

export const revalidate = 60;

export default async function NotesPage() {
  const posts = await getPostsBySection("Writing");

  return (
    <SectionPage
      title="Notes"
      subtitle="Math notes, code notes, learning records, and structured drafts."
      posts={posts}
    />
  );
}