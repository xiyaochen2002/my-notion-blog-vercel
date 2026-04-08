import Link from "next/link";
import {
  getPostBySlug,
  getPublishedPosts,
} from "../../../lib/notion";
import ProtectedPostGate from "../../../components/ProtectedPostGate";
import katex from "katex";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts
    .filter((post: any) => post.slug)
    .map((post: any) => ({ slug: post.slug }));
}

async function getBlocksRecursively(pageId: string): Promise<any[]> {
  const { Client } = await import("@notionhq/client");
  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  const blocks: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });
    blocks.push(...(response.results as any[]));
    cursor = response.has_more ? response.next_cursor! : undefined;
  } while (cursor);

  await Promise.all(
    blocks
      .filter((block) => block.has_children)
      .map(async (block) => {
        block.children = await getBlocksRecursively(block.id);
      })
  );

  return blocks;
}

function richText(rt: any[]): React.ReactNode {
  return (rt || []).map((t: any, i: number) => {
    if (t.type === "equation") {
      const html = katex.renderToString(t.equation.expression, {
        throwOnError: false,
        displayMode: false,
      });
      return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
    }

    let node: React.ReactNode = t.plain_text;
    if (t.annotations?.bold) node = <strong key={i}>{node}</strong>;
    if (t.annotations?.italic) node = <em key={i}>{node}</em>;
    if (t.annotations?.code) node = <code key={i}>{node}</code>;
    if (t.annotations?.strikethrough) node = <s key={i}>{node}</s>;
    if (t.annotations?.underline) node = <u key={i}>{node}</u>;
    if (t.href) node = <a key={i} href={t.href} target="_blank" rel="noreferrer">{node}</a>;
    return node;
  });
}

function plainText(rt: any[]): string {
  return (rt || []).map((t: any) => t.plain_text).join("");
}

function renderBlock(block: any): React.ReactNode {
  const type = block.type;
  const value = block[type];
  if (!value) return null;

  const children = block.children?.map((b: any) => renderBlock(b));

  switch (type) {
    case "heading_1":
      return <h1 key={block.id}>{richText(value.rich_text)}</h1>;
    case "heading_2":
      return <h2 key={block.id}>{richText(value.rich_text)}</h2>;
    case "heading_3":
      return <h3 key={block.id}>{richText(value.rich_text)}</h3>;

    case "paragraph":
      return <p key={block.id}>{richText(value.rich_text)}</p>;

    case "quote":
      return <blockquote key={block.id}>{richText(value.rich_text)}</blockquote>;

    case "callout":
      return (
        <div key={block.id} className="notionCallout">
          <span>{value.icon?.emoji || "💡"}</span>
          <div>{richText(value.rich_text)}</div>
        </div>
      );

    case "divider":
      return <hr key={block.id} className="postDivider" />;

    case "bulleted_list_item":
      return (
        <li key={block.id}>
          {richText(value.rich_text)}
          {children?.length > 0 && <ul>{children}</ul>}
        </li>
      );

    case "numbered_list_item":
      return (
        <li key={block.id}>
          {richText(value.rich_text)}
          {children?.length > 0 && <ol>{children}</ol>}
        </li>
      );

    case "to_do":
      return (
        <div key={block.id} className="notionTodo">
          <input type="checkbox" defaultChecked={value.checked} readOnly />
          <span>{richText(value.rich_text)}</span>
        </div>
      );

    case "toggle":
      return (
        <details key={block.id}>
          <summary>{richText(value.rich_text)}</summary>
          <div>{children}</div>
        </details>
      );

    case "code":
      return (
        <pre key={block.id} className="codeBlock">
          <code>{plainText(value.rich_text)}</code>
        </pre>
      );

    case "equation": {
      const html = katex.renderToString(value.expression, {
        throwOnError: false,
        displayMode: true,
      });
      return <div key={block.id} dangerouslySetInnerHTML={{ __html: html }} />;
    }

    case "image": {
      const src = value.type === "external" ? value.external?.url : value.file?.url;
      const caption = plainText(value.caption || []) || value.name || "";
      if (!src) return null;
      return (
        <figure key={block.id} className="postFigure">
          <img src={src} alt={caption || "image"} className="postImage" style={{ maxWidth: "100%" }} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }

    case "video": {
      const src = value.type === "external" ? value.external?.url : value.file?.url;
      const caption = plainText(value.caption || []) || value.name || "";
      if (!src) return null;
      if (src.includes("youtube.com") || src.includes("youtu.be")) {
        const videoId = src.split("v=")[1]?.split("&")[0] || src.split("/").pop();
        return (
          <div key={block.id}>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                allowFullScreen
              />
            </div>
            {caption && <p>{caption}</p>}
          </div>
        );
      }
      return (
        <figure key={block.id}>
          <video src={src} controls style={{ maxWidth: "100%" }} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }

    case "file": {
      const src = value.type === "external" ? value.external?.url : value.file?.url;
      const name = plainText(value.caption || []) || value.name || "Download file";
      return (
        <a key={block.id} href={src} target="_blank" rel="noreferrer" className="notionFile">
          📎 {name}
        </a>
      );
    }

    case "pdf": {
      const src = value.type === "external" ? value.external?.url : value.file?.url;
      const name = plainText(value.caption || []) || value.name || "View PDF";
      return (
        <a key={block.id} href={src} target="_blank" rel="noreferrer" className="notionFile">
          📄 {name}
        </a>
      );
    }

    case "embed":
    case "bookmark":
    case "link_preview": {
      const url = value.url;
      if (!url) return null;
      return (
        <a key={block.id} href={url} target="_blank" rel="noreferrer" className="notionBookmark">
          {url}
        </a>
      );
    }

    case "table":
      return (
        <table key={block.id} className="notionTable">
          <tbody>
            {block.children?.map((row: any) => (
              <tr key={row.id}>
                {(row.table_row?.cells || []).map((cell: any, i: number) => (
                  <td key={i}>{richText(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "column_list":
      return (
        <div key={block.id} className="notionColumns">
          {children}
        </div>
      );

    case "column":
      return (
        <div key={block.id} className="notionColumn">
          {children}
        </div>
      );

    case "child_page":
      return <p key={block.id} className="notionChildPage">📄 {value.title}</p>;

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

  const blocks = await getBlocksRecursively(post.id);

  const content = (
    <article className="postCard">
      <header className="postHeader">
        <p className="postEyebrow">Writing</p>
        <h1 className="postTitle">{post.title}</h1>
        <div className="postMetaRow">
          {post.date ? <span>{post.date}</span> : null}
          {post.category ? <span>· {post.category}</span> : null}
        </div>
        {post.summary ? <p className="postSummary">{post.summary}</p> : null}
        {post.tags?.length ? (
          <div className="postTags">
            {post.tags.map((tag: string) => (
              <span key={tag} className="postTag">{tag}</span>
            ))}
          </div>
        ) : null}
        {post.cover ? (
          <img className="postCover" src={post.cover} alt={post.title} />
        ) : null}
      </header>

      <section className="postContent">
        {blocks.length === 0 ? (
          <p className="postNoContent">No content yet.</p>
        ) : (
          blocks.map((block: any) => (
            <div key={block.id} className={`postBlock postBlock-${block.type}`}>
              {renderBlock(block)}
            </div>
          ))
        )}
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