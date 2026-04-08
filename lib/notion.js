import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const databaseId = process.env.NOTION_DATABASE_ID;

function getPlainText(richText = []) {
  return richText.map((item) => item.plain_text).join("");
}

function mapPost(page) {
  const props = page.properties;

  // 解析页面顶层的 icon（emoji 或图片）
  const icon = page.icon
    ? page.icon.type === "emoji"
      ? { type: "emoji", value: page.icon.emoji }
      : page.icon.type === "external"
      ? { type: "image", value: page.icon.external?.url }
      : page.icon.type === "file"
      ? { type: "image", value: page.icon.file?.url }
      : null
    : null;

  // 优先用页面顶层的 cover，fallback 到 property 里的 Cover
  const propertyCover = props.Cover?.files?.[0];
  const cover =
    page.cover?.type === "external"
      ? page.cover.external?.url
      : page.cover?.type === "file"
      ? page.cover.file?.url
      : propertyCover?.type === "file"
      ? propertyCover.file.url
      : propertyCover?.external?.url || "";

  return {
    id: page.id,
    title: getPlainText(props.Title?.title) || "Untitled",
    slug: getPlainText(props.Slug?.rich_text),
    summary: getPlainText(props.Summary?.rich_text),
    date: props.Date?.date?.start || "",
    category: props.Category?.select?.name || "",
    featured: props.Featured?.checkbox || false,
    tags: props.Tags?.multi_select?.map((tag) => tag.name) || [],
    section: props.Section?.select?.name || "",
    protected: props.Protected?.checkbox || false,
    password: getPlainText(props.Password?.rich_text),
    cover,
    icon,
  };
}

export async function getPublishedPosts() {
  if (!databaseId) {
    throw new Error("Missing NOTION_DATABASE_ID");
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Published",
      checkbox: {
        equals: true,
      },
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  return response.results.map(mapPost);
}

export async function getPostsBySection(section) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
        {
          property: "Section",
          select: {
            equals: section,
          },
        },
      ],
    },
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  return response.results.map(mapPost);
}

export async function getPostBySlug(slug) {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: "Published",
          checkbox: {
            equals: true,
          },
        },
        {
          property: "Slug",
          rich_text: {
            equals: slug,
          },
        },
      ],
    },
  });

  const page = response.results[0];
  return page ? mapPost(page) : null;
}

export async function getPostBlocks(pageId) {
  const blocks = [];
  let cursor = undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });

    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return blocks;
}