"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { blogPosts } from "../blog/data"
import { z } from "zod"

const BlogPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters."),
  content: z.string().min(20, "Content must be at least 20 characters."),
  category: z.string().min(2, "Category must be specified."),
  author: z.string().min(2, "Author is required."),
  authorRole: z.string().min(2, "Author role is required."),
  authorBio: z.string().min(10, "Author biography must be at least 10 characters."),
  date: z.string().min(2, "Published date is required."),
  readTime: z.string().min(1, "Read time is required."),
  image: z.string().url("Valid cover image URL is required."),
  isFeatured: z.boolean().default(false),
})

export async function getBlogPostsAction() {
  try {
    // 1. Fetch from PostgreSQL
    let posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // 2. Seed database if empty so patient never sees a blank screen
    if (posts.length === 0) {
      console.log("[BLOG_SECTOR] Seeding dynamic blog database with static assets...");
      
      const seedData = blogPosts.map((p, index) => ({
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        author: p.author,
        authorRole: p.authorRole,
        date: p.date,
        readTime: p.readTime,
        image: p.image,
        isFeatured: index === 0, // Mark first post as featured by default!
      }));

      await prisma.blogPost.createMany({
        data: seedData
      });

      // Fetch again after seeding
      posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' }
      });
    }

    return {
      success: true,
      data: posts.map(p => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        category: p.category,
        author: p.author,
        authorRole: p.authorRole,
        authorBio: p.authorBio,
        date: p.date,
        readTime: p.readTime,
        image: p.image,
        isFeatured: p.isFeatured,
      }))
    }
  } catch (error) {
    console.error("[CRITICAL_BLOG_DB_ERROR]:", error);
    // Robust clinical fallback to keep website active
    const fallback = blogPosts.map((p, index) => ({
      ...p,
      id: String(p.id),
      isFeatured: index === 0
    }));
    return {
      success: true,
      data: fallback,
      fallbackActive: true
    }
  }
}

export async function getBlogPostByIdAction(id: string) {
  try {
    // Try UUID look-up in database
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isValidUuid) {
      const dbPost = await prisma.blogPost.findUnique({
        where: { id }
      });
      if (dbPost) {
        return { success: true, data: dbPost };
      }
    }

    // Try static array search by number or string comparison
    const staticPost = blogPosts.find(p => String(p.id) === id);
    if (staticPost) {
      return { success: true, data: { ...staticPost, isFeatured: String(staticPost.id) === "1" } };
    }

    return { success: false, error: "Article not found in dynamic or static logs." };
  } catch (error) {
    console.error("[BLOG_DETAIL_ERROR]:", error);
    const staticPost = blogPosts.find(p => String(p.id) === id);
    if (staticPost) {
      return { success: true, data: { ...staticPost, isFeatured: String(staticPost.id) === "1" } };
    }
    return { success: false, error: "Failed to fetch article details." };
  }
}

export async function createBlogPostAction(formData: FormData) {
  try {
    const isFeatured = formData.get("isFeatured") === "true";

    const rawData = {
      title: formData.get("title")?.toString() || "",
      excerpt: formData.get("excerpt")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      category: formData.get("category")?.toString() || "",
      author: formData.get("author")?.toString() || "",
      authorRole: formData.get("authorRole")?.toString() || "",
      authorBio: formData.get("authorBio")?.toString() || "",
      date: formData.get("date")?.toString() || "",
      readTime: formData.get("readTime")?.toString() || "",
      image: formData.get("image")?.toString() || "",
      isFeatured,
    };

    // Zod validation
    const validation = BlogPostSchema.safeParse(rawData);
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Validation failed";
      return { success: false, error: `Validation Error: ${errorMsg}` };
    }

    // Featured constraint check: Only one can be featured!
    if (isFeatured) {
      const existingFeatured = await prisma.blogPost.findFirst({
        where: { isFeatured: true }
      });
      if (existingFeatured) {
        return { 
          success: false, 
          error: `Another article ("${existingFeatured.title}") is already featured. You must unfeature it first before featuring this post.` 
        };
      }
    }

    const newPost = await prisma.blogPost.create({
      data: {
        ...validation.data,
      }
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${newPost.id}`);
    revalidatePath("/blogmanagement");

    return { success: true, id: newPost.id };
  } catch (error: any) {
    console.error("[CREATE_BLOG_ERROR]:", error);
    return { success: false, error: error.message || "Failed to publish blog post." };
  }
}

export async function updateBlogPostAction(id: string, formData: FormData) {
  try {
    const isFeatured = formData.get("isFeatured") === "true";

    const rawData = {
      title: formData.get("title")?.toString() || "",
      excerpt: formData.get("excerpt")?.toString() || "",
      content: formData.get("content")?.toString() || "",
      category: formData.get("category")?.toString() || "",
      author: formData.get("author")?.toString() || "",
      authorRole: formData.get("authorRole")?.toString() || "",
      authorBio: formData.get("authorBio")?.toString() || "",
      date: formData.get("date")?.toString() || "",
      readTime: formData.get("readTime")?.toString() || "",
      image: formData.get("image")?.toString() || "",
      isFeatured,
    };

    // Zod validation
    const validation = BlogPostSchema.safeParse(rawData);
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Validation failed";
      return { success: false, error: `Validation Error: ${errorMsg}` };
    }

    // Featured constraint check: Only one can be featured!
    if (isFeatured) {
      const existingFeatured = await prisma.blogPost.findFirst({
        where: { 
          isFeatured: true,
          NOT: { id }
        }
      });
      if (existingFeatured) {
        return { 
          success: false, 
          error: `Another article ("${existingFeatured.title}") is already featured. You must unfeature it first before featuring this post.` 
        };
      }
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        ...validation.data,
      }
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${updatedPost.id}`);
    revalidatePath("/blogmanagement");

    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_BLOG_ERROR]:", error);
    return { success: false, error: error.message || "Failed to update blog post." };
  }
}

export async function deleteBlogPostAction(id: string) {
  try {
    // Check if ID is UUID before attempting database deletion
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (!isValidUuid) {
      return { success: false, error: "Cannot delete built-in static posts." };
    }

    await prisma.blogPost.delete({
      where: { id }
    });

    revalidatePath("/blog");
    revalidatePath("/blogmanagement");

    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_BLOG_ERROR]:", error);
    return { success: false, error: error.message || "Failed to delete blog post." };
  }
}
