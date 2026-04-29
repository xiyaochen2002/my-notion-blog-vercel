import { getPostsBySection } from "../../lib/notion";
import SectionPage from "../../components/SectionPage";

export const revalidate = 60;

export default async function TravelPage() {
  const posts = await getPostsBySection("Gallery");

  return (
    <SectionPage
      title="Travel"
      subtitle="Places, movement, memory, and the landscapes that stayed with me."
      posts={posts}
    />
  );
}