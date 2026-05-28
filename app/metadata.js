// Centralized metadata configurations for SEO across the app

export const landingPageMetadata = {
  title: "LernLang - Belajar Bahasa Inggris Interaktif dengan AI",
  description:
    "Platform belajar bahasa Inggris dengan teknologi AI evaluation, gamification, learning path, dan komunitas. Belajar grammar, vocabulary, pronunciation dengan cara yang fun dan efektif.",
  keywords: [
    "belajar bahasa inggris",
    "english learning",
    "AI correction",
    "grammar checker",
    "pronunciation",
    "vocabulary builder",
    "english app",
  ],
  openGraph: {
    title: "LernLang - Belajar Bahasa Inggris Interaktif",
    description:
      "Platform pembelajaran bahasa Inggris dengan AI evaluation dan gamification yang menyenangkan",
    url: "https://learnlang.web.id",
    type: "website",
    image: "/og-landing.png",
  },
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LernLang",
    description:
      "Platform pembelajaran bahasa Inggris interaktif dengan AI correction dan gamification",
    url: "https://learnlang.web.id",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://learnlang.web.id/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
};

export const blogListMetadata = {
  title: "Blog & Artikel - LernLang",
  description:
    "Baca tips, trik, dan rahasia cepat fasih bahasa Inggris. Artikel tentang grammar, vocabulary, pronunciation, dan strategi belajar dari para ahli.",
  keywords: [
    "artikel bahasa inggris",
    "tips grammar",
    "english blog",
    "vocabulary tips",
    "pronunciation guide",
  ],
  openGraph: {
    title: "Blog - Tips & Trik Bahasa Inggris",
    description:
      "Kumpulan artikel dan tips belajar bahasa Inggris dari para ahli",
    url: "https://learnlang.web.id/blogs",
    type: "website",
  },
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "LernLang Blog",
    description: "Tips, trik, dan panduan belajar bahasa Inggris",
    url: "https://learnlang.web.id/blogs",
  },
};

export function getBlogArticleMetadata(blog) {
  const description =
    blog.excerpt ||
    blog.content?.substring(0, 160) ||
    "Baca artikel lengkap di LernLang Blog";
  const image = blog.coverImage || "/default-blog-og.png";

  return {
    title: `${blog.title} - LernLang Blog`,
    description: description,
    keywords: blog.tags || ["bahasa inggris", "english learning"],
    authors: [{ name: blog.author?.name || "LernLang Team" }],
    publishedTime: blog.createdAt,
    modifiedTime: blog.updatedAt,
    openGraph: {
      title: blog.title,
      description: description,
      type: "article",
      publishedTime: blog.createdAt,
      authors: [blog.author?.name || "LernLang Team"],
      url: `https://learnlang.web.id/blogs/${blog.slug}`,
      image: image,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: description,
      image: image,
    },
  };
}

export function getBlogArticleStructuredData(blog) {
  const image = blog.coverImage || "/default-blog-og.png";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt || blog.content?.substring(0, 160),
    image: image,
    author: {
      "@type": "Person",
      name: blog.author?.name || "LernLang Team",
      url: blog.author?.username
        ? `https://learnlang.web.id/user/${blog.author.username}`
        : "https://learnlang.web.id",
    },
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://learnlang.web.id/blogs/${blog.slug}`,
    },
  };
}
