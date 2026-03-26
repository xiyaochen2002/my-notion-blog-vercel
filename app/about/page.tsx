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
    case "numbered_list_item":
      return <li>{text}</li>;
    default:
      return null;
  }
}

export default async function AboutPage() {
  const posts = await getPostsBySection("About");
  const aboutPost = posts[0];

  if (!aboutPost) {
    return (
      <main className="sectionPage">
        <PageHeader title="About" subtitle="No about content yet." />
      </main>
    );
  }

  const blocks = await getPostBlocks(aboutPost.id);

  return (
    <main className="sectionPage">
      <PageHeader
        title={aboutPost.title}
        subtitle={aboutPost.summary || ""}
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