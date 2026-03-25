import { getPostBySlug, getPostBlocks, getPublishedPosts } from "../../../lib/notion";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts
    .filter((post: any) => post.slug)
    .map((post: any) => ({ slug: post.slug }));
}

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

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <main className="container articlePage">
        <p>文章不存在。</p>
      </main>
    );
  }

  const blocks = await getPostBlocks(post.id);

  return (
    <main className="container articlePage">
      <a href="/" className="backLink">← 返回首页</a>

      <article className="articleCard">
        <p className="eyebrow">{post.category || "文章"}</p>
        <h1>{post.title}</h1>
        {post.date ? <p className="meta">{post.date}</p> : null}
        {post.cover ? <img className="articleCover" src={post.cover} alt={post.title} /> : null}
        {post.summary ? <p className="summary">{post.summary}</p> : null}

        <div className="content">
          {blocks.map((block: any) => (
            <div key={block.id}>{renderBlock(block)}</div>
          ))}
        </div>
      </article>
    </main>
  );
}
