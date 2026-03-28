import { getPostsBySection, getPostBlocks } from "../../lib/notion";
import PageHeader from "../../components/PageHeader";

export const revalidate = 60;

function renderBlock(block: any) {
  const type = block.type;
  const value = block[type];
  if (!value) return null;

  const text = (value.rich_text || []).map((t: any) => t.plain_text).join("");

  switch (type) {
    case "heading_1":
      return <h1>{text}</h1>;
    case "heading_2":
      return <h2>{text}</h2>;
    case "heading_3":
      return <h3>{text}</h3>;
    case "paragraph":
      return <p>{text}</p>;
    case "quote":
      return <blockquote>{text}</blockquote>;
    case "bulleted_list_item":
      return <li>{text}</li>;
    default:
      return null;
  }
}

export default async function ResumePage() {
  const posts = await getPostsBySection("Resume");
  const resumePost = posts[0];

  if (!resumePost) {
    return (
      <main className="sectionPage">
        <PageHeader title="Resume" subtitle="No content yet." />
      </main>
    );
  }

  const blocks = await getPostBlocks(resumePost.id);

  return (
    <main className="sectionPage">
      <PageHeader
        title={resumePost.title || "Resume"}
        subtitle={resumePost.summary || ""}
      />

      <section className="aboutCard">
        <div className="content">
          {blocks.map((block: any) => (
            <div key={block.id}>{renderBlock(block)}</div>
          ))}
        </div>
      </section>
    </main>
  );
}