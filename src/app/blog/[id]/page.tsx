"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight,
  Clock, 
  Calendar, 
  User, 
  Share2, 
  Bookmark,
  ChevronRight,
  Activity,
  Shield,
  CheckCircle2
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { blogPosts } from "../data";
import Link from "next/link";

// --- Animation Variants ---
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const }
};

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <div className="text-center space-y-6">
          <Activity className="size-16 text-[#67BA2E] animate-pulse mx-auto" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Article Not Found</h1>
          <Button 
            onClick={() => router.push('/blog')}
            className="rounded-full bg-[#67BA2E] hover:bg-[#5aa827] text-white font-black uppercase text-[10px] tracking-widest px-8"
          >
            Back to Journal
          </Button>
        </div>
      </div>
    );
  }

  // Related posts (excluding current)
  const relatedPosts = blogPosts.filter(p => p.id !== post.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-[#67BA2E]/20 selection:text-slate-900 overflow-x-hidden pt-14 md:pt-0">
      <Navbar />

      <main>
        {/* Navigation / Back Button */}
        <div className="bg-slate-50 border-b border-slate-100 py-4">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex items-center justify-between">
            <button 
              onClick={() => router.push('/blog')}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#67BA2E] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Journal
            </button>
            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-[#67BA2E] transition-colors">
                <Share2 size={16} />
              </button>
              <button className="text-slate-400 hover:text-[#67BA2E] transition-colors">
                <Bookmark size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative py-6 md:py-10 overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <motion.div 
                {...fadeUp}
                className="lg:col-span-7 space-y-6 md:space-y-8"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#67BA2E]/10 text-[#67BA2E] rounded-full border border-[#67BA2E]/20">
                  <CheckCircle2 size={12} className="fill-[#67BA2E] text-white" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]">{post.category}</span>
                </div>
                
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[1.05]">
                  {post.title}
                </h1>

                <p className="text-sm md:text-xl text-slate-500 leading-relaxed font-medium">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-6 md:gap-8 pt-6 md:pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="size-10 md:size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#67BA2E] shadow-inner font-black text-sm">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[10px] md:text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">{post.author}</p>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{post.authorRole}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Published</span>
                      <span className="text-[10px] md:text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#67BA2E]" />
                        {post.date}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Reading Time</span>
                      <span className="text-[10px] md:text-[11px] font-black text-slate-700 flex items-center gap-1.5">
                        <Clock size={12} className="text-[#67BA2E]" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-5 relative"
              >
                <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-6 -right-6 size-32 bg-[#67BA2E]/10 rounded-full blur-3xl -z-10" />
                <div className="absolute -top-6 -left-6 size-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-10 md:py-16 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div 
              {...fadeUp}
              className="prose prose-slate prose-lg max-w-none 
                prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg
                prose-strong:text-[#67BA2E] prose-strong:font-black
                prose-blockquote:border-l-4 prose-blockquote:border-[#67BA2E] prose-blockquote:bg-slate-50 prose-blockquote:p-6 md:prose-blockquote:p-8 prose-blockquote:rounded-r-[2rem] prose-blockquote:italic prose-blockquote:text-lg md:prose-blockquote:text-xl prose-blockquote:font-medium prose-blockquote:text-slate-700
                prose-img:rounded-[2rem] prose-img:shadow-xl"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Footer Card */}
            <div className="mt-16 md:mt-24 p-6 md:p-10 bg-slate-50 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
              <div className="size-20 md:size-24 rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-[#67BA2E] font-black text-2xl md:text-3xl">
                {post.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="space-y-3 md:space-y-4 flex-grow">
                <div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{post.author}</h4>
                  <p className="text-[10px] md:text-[11px] font-black text-[#67BA2E] uppercase tracking-[0.2em]">{post.authorRole}</p>
                </div>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-xl">
                  Expert in clinical precision and longevity protocols. Dedicated to pioneering personalized healthcare strategies for the world's most discerning individuals.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <Button variant="ghost" className="rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#67BA2E] p-0 h-auto">View Full Profile</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Articles Section */}
        <section className="py-10 md:py-16 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Related Analysis</h2>
              <Link href="/blog">
                <Button variant="link" className="text-[#67BA2E] font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                  View Full Journal
                  <ChevronRight size={14} />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {relatedPosts.map((rPost) => (
                <motion.div
                  key={rPost.id}
                  whileHover={{ y: -5 }}
                  className="group flex flex-col md:flex-row gap-6 bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative w-full md:w-48 h-48 rounded-[2rem] overflow-hidden flex-shrink-0">
                    <img 
                      src={rPost.image} 
                      alt={rPost.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-3 py-2">
                    <span className="text-[#67BA2E] text-[9px] font-black uppercase tracking-widest">{rPost.category}</span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-[#67BA2E] transition-colors line-clamp-2">
                      {rPost.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{rPost.excerpt}</p>
                    <Link href={`/blog/${rPost.id}`}>
                      <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#67BA2E] flex items-center gap-1.5 transition-all mt-2">
                        Insight
                        <ArrowRight size={12} />
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
