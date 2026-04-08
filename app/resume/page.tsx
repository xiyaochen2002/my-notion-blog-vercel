import { getPostsBySection } from "../../lib/notion";
import PageHeader from "../../components/PageHeader";
import katex from "katex";

export const revalidate = 60;

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

const githubCache: Record<string, any> = {};

async function prefetchGithub(blocks: any[]) {
  const tasks: Promise<void>[] = [];

  for (const block of blocks) {
    const type = block.type;
    if (type === "embed" || type === "bookmark" || type === "link_preview") {
      const url = block[type]?.url || "";
      if (url.includes("github.com") && !githubCache[url]) {
        const match = url.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
        if (match) {
          const [, owner, repo] = match;
          tasks.push(
            fetch(`https://api.github.com/repos/${owner}/${repo}`, {
              next: { revalidate: 3600 },
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => { if (data) githubCache[url] = data; })
              .catch(() => {})
          );
        }
      }
    }
    if (block.children) tasks.push(prefetchGithub(block.children));
  }

  await Promise.all(tasks);
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
      return <hr key={block.id} />;

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
        <pre key={block.id}>
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
      return (
        <figure key={block.id}>
          <img src={src} alt={caption} style={{ maxWidth: "100%" }} />
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

      if (url.includes("github.com")) {
        const data = githubCache[url];
        if (data) {
          return (
            <a key={block.id} href={url} target="_blank" rel="noreferrer" className="notionGithubCard">
              <img
                src={data.owner?.avatar_url}
                alt={data.owner?.login}
                width={36}
                height={36}
                style={{ borderRadius: "50%" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <strong style={{ fontSize: "0.95rem" }}>{data.full_name}</strong>
                <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                  {data.owner?.login} · Updated{" "}
                  {new Date(data.pushed_at).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </a>
          );
        }
        const parts = url.replace("https://github.com/", "").split("/");
        const repo = parts.slice(0, 2).join("/");
        return (
          <a key={block.id} href={url} target="_blank" rel="noreferrer" className="notionGithubCard">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <span>{repo}</span>
          </a>
        );
      }

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

  const blocks = await getBlocksRecursively(resumePost.id);
  await prefetchGithub(blocks);

  return (
    <main className="sectionPage">
      <PageHeader
        title={resumePost.title || "Resume"}
        subtitle={resumePost.summary || ""}
      />
      <section className="aboutCard">
        <div className="content">
          {blocks.map((block: any) => renderBlock(block))}
        </div>
      </section>
    </main>
  );
}