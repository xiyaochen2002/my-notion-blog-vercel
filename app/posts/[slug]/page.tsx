import Link from "next/link";
import {
  getPostBySlug,
  getPostBlocks,
  getPublishedPosts,
} from "../../../lib/notion";
import ProtectedPostGate from "../../../components/ProtectedPostGate";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts
    .filter((post: any) => post.slug)
    .map((post: any) => ({ slug: post.slug }));
}

function getText(block: any) {
  const value = block[block.type];
  if (!value?.rich_text) return "";
  return value.rich_text.map((t: any) => t.plain_text).join("");
}

function renderRichText(richText: any[] = []) {
  return richText.map((item: any, index: number) => {
    const text = item.plain_text;
    const annotations = item.annotations || {};
    let node: React.ReactNode = text;

    if (item.href) {
      node = (
        <a href={item.href} target="_blank" rel="noreferrer">
          {node}
        </a>
      );
    }

    if (annotations.code) node = <code>{node}</code>;
    if (annotations.bold) node = <strong>{node}</strong>;
    if (annotations.italic) node = <em>{node}</em>;
    if (annotations.strikethrough) node = <s>{node}</s>;
    if (annotations.underline) node = <u>{node}</u>;

    return <span key={index}>{node}</span>;
  });
}

function renderBlock(block: any) {
  const type = block.type;
  const value = block[type];

  if (!value) return null;

  switch (type) {
    case "heading_1":
      return <h1>{renderRichText(value.rich_text)}</h1>;
    case "heading_2":
      return <h2>{renderRichText(value.rich_text)}</h2>;
    case "heading_3":
      return <h3>{renderRichText(value.rich_text)}</h3>;
    case "paragraph":
      return <p>{renderRichText(value.rich_text)}</p>;
    case "quote":
      return <blockquote>{renderRichText(value.rich_text)}</blockquote>;
    case "bulleted_list_item":
      return (
        <ul className="postListBlock">
          <li>{renderRichText(value.rich_text)}</li>
        </ul>
      );
    case "numbered_list_item":
      return (
        <ol className="postListBlock">
          <li>{renderRichText(value.rich_text)}</li>
        </ol>
      );
    case "code":
      return (
        <pre className="codeBlock">
          <code>{getText(block)}</code>
        </pre>
      );
    case "divider":
      return <hr className="postDivider" />;
    case "image": {
      const src =
        value.type === "external" ? value.external?.url : value.file?.url;

      const caption =
        value.caption?.map((t: any) => t.plain_text).join("") || "";

      if (!src) return null;

      return (
        <figure className="postFigure">
          <img src={src} alt={caption || "Post image"} className="postImage" />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    }
    default:
      return null;
  }
}

function PostBody({ blocks }: { blocks: any[] }) {
  if (blocks.length === 0) {
    return <p className="postNoContent">No content yet.</p>;
  }

  return (
    <>
      {blocks.map((block: any) => (
        <div key={block.id} className={`postBlock postBlock-${block.type}`}>
          {renderBlock(block)}
        </div>
      ))}
    </>
  );
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
      <main className="postShell">
        <section className="postEmpty">
          <p>Nothing found here.</p>
          <Link href="/" className="backLink">
            ← Back Home
          </Link>
        </section>
      </main>
    );
  }

  const blocks = await getPostBlocks(post.id);

  const content = (
    <article className="postCard">
      <header className="postHeader">
        <p className="postEyebrow">Writing</p>

        <h1 className="postTitle">{post.title}</h1>

        <div className="postMetaRow">
          {post.date ? <span>{post.date}</span> : null}
          {post.category ? <span>· {post.category}</span> : null}
        </div>

        {post.summary ? (
          <p className="postSummary">{post.summary}</p>
        ) : null}

        {post.tags?.length ? (
          <div className="postTags">
            {post.tags.map((tag: string) => (
              <span key={tag} className="postTag">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {post.cover ? (
          <img className="postCover" src={post.cover} alt={post.title} />
        ) : null}
      </header>

      <section className="postContent">
        <PostBody blocks={blocks} />
      </section>
    </article>
  );

  return (
    <main className="postShell">
      <section className="postTopbar">
        <Link href="/" className="backLink">
          ← Back Home
        </Link>

        <nav className="postMiniNav">
          <Link href="/blog">Blog</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/resume">Resume</Link>
          <Link href="/travel">Travel</Link>
          <Link href="/notes">Notes</Link>
        </nav>
      </section>

      {post.protected ? (
        <ProtectedPostGate slug={slug}>{content}</ProtectedPostGate>
      ) : (
        content
      )}
    </main>
  );
}