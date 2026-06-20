"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ArrowRight, 
  Clock, 
  User, 
  Calendar,
  Activity,
  Shield,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DebouncedSearch } from "@/components/ui/debounced-search";
import { blogPosts } from "./data";
import { getBlogPostsAction } from "@/app/actions/blog.actions";
import Link from "next/link";

// --- Animation Variants ---
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.1 },
  transition: { duration: 0.6, ease: "easeOut" as const }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: { staggerChildren: 0.1 }
  },
  viewport: { once: false, amount: 0.1 }
};

const POSTS_PER_PAGE = 6;

function BlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || "";
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>(blogPosts);

  // Sync with Neon SQL on component mount
  useEffect(() => {
    const fetchLivePosts = async () => {
      const res = await getBlogPostsAction();
      if (res.success && res.data) {
        setPosts(res.data);
      }
    };
    fetchLivePosts();
  }, []);

  // Designated Featured Post
  const featuredPost = useMemo(() => {
    return posts.find(p => p.isFeatured) || posts[0] || null;
  }, [posts]);

  // Search filter applied to all posts except the featured post
  const filteredPosts = useMemo(() => {
    const base = featuredPost ? posts.filter(p => p.id !== featuredPost.id) : posts;
    if (!query) return base;
    return base.filter(post => 
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.category.toLowerCase().includes(query.toLowerCase()) ||
      post.author.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, posts, featuredPost]);

  // Strict pagination layout (Page 1 shows 1 Featured banner + 5 Grid items. Page 2+ shows 6 Grid items)
  const totalPages = Math.ceil((filteredPosts.length + 1) / POSTS_PER_PAGE);
  const gridPosts = useMemo(() => {
    if (currentPage === 1) {
      return filteredPosts.slice(0, 5);
    } else {
      const start = 5 + (currentPage - 2) * POSTS_PER_PAGE;
      return filteredPosts.slice(start, start + POSTS_PER_PAGE);
    }
  }, [filteredPosts, currentPage]);

  // Handle loading state simulation for better UX
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [query, currentPage]);

  return (
    <>
      {/* Hero Banner Section */}
      <section className="relative bg-slate-50/50 pt-6 md:pt-24 pb-6 md:pb-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
          <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl shadow-slate-100 group animate-in fade-in duration-1000">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <div 
                className="absolute inset-0 md:left-1/3 lg:left-1/2 opacity-[0.08] md:opacity-100 transition-all duration-1000 group-hover:scale-105 select-none"
                style={{
                  WebkitMaskImage: 'radial-gradient(circle at right, black 30%, transparent 80%)',
                  maskImage: 'radial-gradient(circle at right, black 30%, transparent 80%)'
                }}
              >
                <img 
                  src="/blogbanner.png" 
                  alt="Background" 
                  className="w-full h-full object-cover md:object-contain object-right md:object-right"
                />
              </div>
              <div className="absolute top-10 right-10 w-64 h-64 bg-[#67BA2E]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-12">
              <div className="max-w-2xl space-y-6 md:space-y-8 text-center lg:text-left items-center lg:items-start flex flex-col">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 text-[#67BA2E] font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] animate-in fade-in slide-in-from-left-4 duration-700">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#67BA2E] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#67BA2E]"></span>
                    </span>
                    SyncMed Clinical Journal
                  </div>
                  
                  <div className="space-y-1">
                    <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-tight animate-in fade-in slide-in-from-left-6 duration-1000">
                      The Medical
                      <span className="block text-[#67BA2E] filter drop-shadow-sm">
                        Repository.
                      </span>
                    </h1>
                    <div className="h-1 w-16 bg-[#67BA2E] rounded-full mt-4 mx-auto lg:ml-0 animate-in zoom-in duration-1000 delay-300" />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 md:p-5 bg-slate-50/80 backdrop-blur-md rounded-[1.2rem] md:rounded-[1.5rem] border border-slate-100 shadow-sm w-fit animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                  <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <BookOpen className="size-4 md:size-5 text-[#67BA2E]" />
                  </div>
                  <p className="text-xs md:text-base font-bold text-slate-600 tracking-tight text-left">
                    Clinically vetted articles on longevity, bespoke medicine, and cognitive health.
                  </p>
                </div>
              </div>

              {/* Identity Floating Card */}
              <div className="hidden lg:flex flex-col gap-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 w-72 animate-in fade-in slide-in-from-right-8 duration-1000 relative">
                <div className="absolute -top-4 -right-4 size-12 bg-[#67BA2E] rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  <Shield className="size-6" />
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#67BA2E] shadow-inner overflow-hidden">
                      <Activity className="size-8" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Journal</p>
                      <p className="text-sm font-black text-slate-800 leading-tight uppercase">Scientific Hub</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-green-50 text-[#67BA2E] rounded-full border border-green-100">
                      <CheckCircle2 size={12} className="fill-[#67BA2E] text-white" />
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">Peer Vetted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Section */}
      {currentPage === 1 && featuredPost && (
        <section className="py-6">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <motion.div 
              {...fadeUp}
              className="group relative grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center bg-slate-50 border border-slate-100 rounded-[3rem] overflow-hidden p-6 md:p-10 hover:shadow-2xl hover:shadow-[#67BA2E]/5 transition-all duration-500"
            >
              <div className="relative aspect-[16/10] lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute top-6 left-6">
                  <span className="px-5 py-2 rounded-full bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                    Featured Insight
                  </span>
                </div>
              </div>
              <div className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="text-[#67BA2E]">{featuredPost.category}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span>{featuredPost.date}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[1.1]">
                  {featuredPost.title}
                </h2>
                <p className="text-slate-600 text-sm md:text-lg leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-slate-200/60">
                  <div className="size-12 rounded-full bg-[#67BA2E]/10 flex items-center justify-center text-[#67BA2E] font-black text-xs">
                    {featuredPost.author.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 tracking-tight">{featuredPost.author}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{featuredPost.authorRole}</p>
                  </div>
                </div>
                <Link href={`/blog/${featuredPost.id}`}>
                  <Button className="mt-4 h-11 md:h-14 px-8 md:px-10 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 shadow-xl shadow-[#67BA2E]/20 transition-all hover:-translate-y-1 active:scale-95">
                    Read Analysis
                    <ArrowRight size={18} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Search Bar Section */}
      <section className="py-6 border-y border-slate-100/80">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                 <Search size={14} className="text-[#67BA2E]" />
                 Clinical Repository
               </h2>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter by medical topic, title or physician</p>
            </div>
            <div className="w-full md:w-[400px]">
              <DebouncedSearch placeholder="Search repository..." />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid Section */}
      <section className="py-6 min-h-[400px] relative">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
              <Activity className="size-12 text-[#67BA2E] animate-spin mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Repository...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <>
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: false, amount: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10"
              >
                {gridPosts.map((post) => (
                  <Link key={post.id} href={`/blog/${post.id}`} className="block h-full">
                    <motion.div
                      variants={fadeUp}
                      className="group flex flex-col h-full bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-5 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-2"
                    >
                      <div className="relative aspect-[16/10] rounded-[1.2rem] md:rounded-[2rem] overflow-hidden mb-4 md:mb-6 shadow-lg shadow-slate-100">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-2 left-2 md:top-4 md:left-4 max-w-[85%]">
                          <span className="px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full bg-white/95 backdrop-blur-sm text-[#67BA2E] text-[6px] md:text-[9px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] shadow-sm leading-tight inline-block text-center">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-grow space-y-2 md:space-y-4 px-1 md:px-2">
                        <div className="flex items-center gap-2 md:gap-4 text-slate-400 text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em]">
                          <span className="flex items-center gap-1 md:gap-1.5">
                            <Calendar size={10} className="text-[#67BA2E]" />
                            {post.date}
                          </span>
                          <span className="flex items-center gap-1 md:gap-1.5">
                            <Clock size={10} className="text-[#67BA2E]" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-xs md:text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-[#67BA2E] transition-colors line-clamp-2 md:line-clamp-none">
                          {post.title}
                        </h3>
                        <p className="text-[9px] md:text-sm text-slate-500 leading-relaxed line-clamp-2 md:line-clamp-3 font-medium">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-4 md:mt-8 pt-3 md:pt-6 border-t border-slate-50 flex items-center justify-between px-1 md:px-2 gap-2">
                        <div className="flex items-center gap-1.5 md:gap-2 min-w-0 flex-1">
                          <div className="size-5 md:size-8 rounded-full bg-slate-100 flex items-center justify-center text-[#67BA2E] font-black text-[7px] md:text-[10px] flex-shrink-0">
                            {post.author.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="text-[8px] md:text-[10px] font-black text-slate-900 uppercase tracking-tighter truncate min-w-0">
                            {post.author}
                          </span>
                        </div>
                        <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-[#67BA2E] flex items-center gap-1 md:gap-1.5 group-hover:gap-2.5 transition-all flex-shrink-0">
                          <span className="hidden sm:inline">Insight</span>
                          <ArrowRight size={10} className="md:size-3.5" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="size-12 rounded-2xl border-slate-200 text-slate-400 hover:text-[#67BA2E] hover:border-[#67BA2E] disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  
                  <div className="flex gap-2">
                    {/* Desktop Pagination */}
                    <div className="hidden md:flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setCurrentPage(i + 1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`size-12 rounded-2xl text-xs font-black transition-all ${
                            currentPage === i + 1 
                              ? "bg-[#67BA2E] text-white shadow-xl shadow-[#67BA2E]/20" 
                              : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Mobile Pagination (2 numbers) */}
                    <div className="flex md:hidden gap-2">
                      {(() => {
                        let pagesToShow = [];
                        if (currentPage + 1 <= totalPages) {
                          pagesToShow = [currentPage, currentPage + 1];
                        } else if (currentPage > 1) {
                          pagesToShow = [currentPage - 1, currentPage];
                        } else {
                          pagesToShow = [1];
                        }
                        return pagesToShow.map((pageNum) => (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`size-12 rounded-2xl text-xs font-black transition-all ${
                              currentPage === pageNum 
                                ? "bg-[#67BA2E] text-white shadow-xl shadow-[#67BA2E]/20" 
                                : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="size-12 rounded-2xl border-slate-200 text-slate-400 hover:text-[#67BA2E] hover:border-[#67BA2E] disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={20} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-32 text-center space-y-6">
              <div className="size-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200">
                <Search size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Insights Found</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">We couldn't find any medical analysis matching your query. Please broaden your search criteria.</p>
              </div>
              <Button 
                onClick={() => router.push('/blog')}
                variant="outline" 
                className="rounded-full px-8 border-[#67BA2E] text-[#67BA2E] font-black uppercase text-[10px] tracking-widest h-12"
              >
                Reset Repository
              </Button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default function BlogPage() {
  return (
    <div className="min-h-screen font-sans selection:bg-[#67BA2E]/20 selection:text-slate-900 overflow-x-hidden scroll-smooth pt-14 md:pt-0">
      <Navbar />
      <main>
        <Suspense fallback={
          <div className="h-screen flex items-center justify-center">
            <Activity className="animate-spin text-[#67BA2E]" size={40} />
          </div>
        }>
          <BlogContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
