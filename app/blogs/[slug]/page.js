import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getBlogArticleMetadata,
  getBlogArticleStructuredData,
} from "../../metadata";
import BlogDetailClient from "./BlogDetailClient";

async function getBlogBySlug(slug) {
  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          avatar: true,
        },
      },
    },
  });

  if (!blog || !blog.published) {
    notFound();
  }

  return blog;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const blog = await getBlogBySlug(resolvedParams.slug);
  return getBlogArticleMetadata(blog);
}

export default async function BlogDetailPage({ params }) {
  const resolvedParams = await params;
  const blog = await getBlogBySlug(resolvedParams.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBlogArticleStructuredData(blog)),
        }}
      />
      <BlogDetailClient blog={blog} />
    </>
  );
}
