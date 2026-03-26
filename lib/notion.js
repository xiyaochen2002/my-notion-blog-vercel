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
  const cover = props.Cover?.files?.[0];

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
  cover: cover?.type === "file" ? cover.file.url : cover?.external?.url || "",
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