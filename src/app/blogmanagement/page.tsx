"use client"

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BookOpen, 
  Upload, 
  Trash2, 
  Edit3,
  Sparkles, 
  Loader2, 
  FileText, 
  Check, 
  ChevronDown,
  ShieldAlert, 
  Plus,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  Compass,
  AlertTriangle,
  Search,
  Bold,
  Italic,
  Heading2,
  Quote,
  List as ListIcon,
  Code,
  Calendar as CalendarIcon
} from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PureCalendar } from "@/components/ui/pure-calendar"
import { format } from "date-fns"
import { toast } from "sonner"
import { 
  getBlogPostsAction, 
  createBlogPostAction, 
  updateBlogPostAction,
  deleteBlogPostAction 
} from "@/app/actions/blog.actions"
import { uploadChatAttachmentAction } from "@/app/actions/chat.actions"

// --- Animation Variants ---
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
}

const templates = {
  clinical: `
<p>Introduce the clinical research study, the hypothesis, and the key medical background that motivated this trial. Focus on biological frameworks and systemic impacts.</p>

<h2>Methodology and Patient Selection</h2>
<p>Describe the cohort parameters, study duration, control group metrics, and biological pathways monitored (e.g., HRV, arterial elasticity, inflammatory indices).</p>

<blockquote>"Include an authoritative clinical quote emphasizing the significance of this research and its prospective impact on personalized healthcare."</blockquote>

<h2>Results & Clinical Application</h2>
<p>Detail the exact observed changes, biometric markers optimized, and how this directly informs the custom treatment protocols and preventative care models here at SyncMed.</p>
  `.trim(),

  longevity: `
<p>Describe the specific longevity pathway targeted (e.g., cell senescence clearance, NAD+ metabolic regulation, mitochondrial bioenergetic efficiency) and its implications for extension of healthspan.</p>

<h2>Advanced Therapeutics & Interventions</h2>
<p>List the therapeutic compounds, peptide protocols, diagnostic genetic assessments, or hyperbaric oxygen sequences utilized to achieve biological rejuvenation.</p>

<h2>Expected Biomarker Trajectories</h2>
<p>Detail exactly what patients should expect in terms of energy balance, cognitive resilience, muscle-to-fat metrics, and vascular age progression over a 6 to 12-month timeline.</p>
  `.trim(),

  performance: `
<p>Introduce the neural optimization topic, specifically targeted towards high-stakes decision-makers, elite executives, and performance athletes operating under severe stress.</p>

<h2>Neurological & Hormonal Optimization Rules</h2>
<p>Outline three specific, clinically proven lifestyle adaptations, chronobiological sleep rules, or targeted nootropic supplements to modulate cortisol and sustain dopamine baseline.</p>

<h2>Real-Time Biofeedback Metrics</h2>
<p>Discuss the key diagnostic metrics (sleep stage distribution, HRV recovery scores, blood glucose stability) that reflect cognitive readiness and neurological longevity.</p>
  `.trim()
}

const CATEGORIES = ["Longevity", "Clinical Precision", "Mental Health", "Concierge News"]
const REGISTRY_ITEMS_PER_PAGE = 10

function BlogManagementContent() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Custom Select Dropdown State
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoriesList, setCategoriesList] = useState<string[]>(CATEGORIES)
  const [catSearch, setCatSearch] = useState("")
  const [customCatName, setCustomCatName] = useState("")
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null)

  // Registry Search & Pagination State
  const searchParams = useSearchParams()
  const router = useRouter()
  const registrySearch = searchParams.get("search") || ""
  const [registryPage, setRegistryPage] = useState(1)

  // Form State
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Longevity")
  const [excerpt, setExcerpt] = useState("")
  const [author, setAuthor] = useState("Dr. Alexander Sterling")
  const [authorRole, setAuthorRole] = useState("Clinical Lead")
  const [authorBio, setAuthorBio] = useState("Expert in clinical precision and longevity protocols. Dedicated to pioneering personalized healthcare strategies for the world's most discerning individuals.")
  const [publishDate, setPublishDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [readTime, setReadTime] = useState("8 min read")
  const [image, setImage] = useState("")
  const [content, setContent] = useState("")
  const [isFeatured, setIsFeatured] = useState(false)

  // Rich Clinical Editor View States
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual")
  const editorRef = useRef<HTMLDivElement>(null)

  // Sync external modifications to the visual contentEditable element
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content
    }
  }, [content, editorMode])

  // Calculate if another post holds the featured banner slot
  const activeFeaturedPost = useMemo(() => {
    return blogs.find(b => b.isFeatured)
  }, [blogs])

  const isAnotherPostFeatured = useMemo(() => {
    return !!activeFeaturedPost && activeFeaturedPost.id !== editingId
  }, [activeFeaturedPost, editingId])

  // Filter categories by dropdown search value
  const filteredCategories = useMemo(() => {
    return categoriesList.filter(c => 
      c.toLowerCase().includes(catSearch.toLowerCase())
    )
  }, [categoriesList, catSearch])

  // Add custom category dynamic trigger
  const addCustomCategory = () => {
    const trimmed = customCatName.trim()
    if (!trimmed) {
      toast.error("Please enter a valid clinical category name.")
      return
    }

    if (!categoriesList.includes(trimmed)) {
      setCategoriesList(prev => [...prev, trimmed])
    }

    setCategory(trimmed)
    setCustomCatName("")
    setIsAddingCustom(false)
    setCatSearch("")
    toast.success(`Dynamic category "${trimmed}" added and auto-selected!`)
  }

  // Fetch blogs on load
  const fetchBlogs = async () => {
    setLoading(true)
    const res = await getBlogPostsAction()
    if (res.success && res.data) {
      setBlogs(res.data)
      if (res.fallbackActive) {
        toast.info("Database offline or unpopulated. Using read-only static posts fallback.", { duration: 5000 })
      }
    } else {
      toast.error("Failed to load blog posts.")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBlogs()
    
    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle Cover Image upload to Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Pre-flight file validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Asset optimization warning: File exceeds 2MB limit. Please compress.")
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    const res = await uploadChatAttachmentAction(formData)
    if (res.success && res.url) {
      setImage(res.url)
      toast.success("Cover image successfully optimized and saved on Cloudinary!")
    } else {
      toast.error(res.error || "Image upload failed.")
    }
    setUploading(false)
  }

  // Pre-fill template helper
  const applyTemplate = (type: "clinical" | "longevity" | "performance") => {
    setContent(templates[type])
    toast.success(`${type.toUpperCase()} template applied. Customize the HTML paragraphs as needed!`)
  }

  // Enter Edit Mode for a selected blog post
  const startEdit = (post: any) => {
    setEditingId(post.id)
    setTitle(post.title)
    setCategory(post.category)
    setExcerpt(post.excerpt)
    setAuthor(post.author)
    setAuthorRole(post.authorRole)
    setAuthorBio(post.authorBio || "Expert in clinical precision and longevity protocols. Dedicated to pioneering personalized healthcare strategies for the world's most discerning individuals.")
    setReadTime(post.readTime)
    setImage(post.image)
    setContent(post.content)
    setIsFeatured(post.isFeatured || false)

    // Parse date safely
    if (post.date) {
      const parsed = new Date(post.date)
      if (!isNaN(parsed.getTime())) {
        setPublishDate(parsed)
      } else {
        setPublishDate(new Date())
      }
    } else {
      setPublishDate(new Date())
    }

    // Append to category list if dynamic edit was in custom list
    if (!categoriesList.includes(post.category)) {
      setCategoriesList(prev => [...prev, post.category])
    }

    toast.info(`Loaded "${post.title.substring(0, 30)}..." into clinical editor.`)
    window.scrollTo({ top: 120, behavior: 'smooth' })
  }

  // Exit Edit Mode and Reset Form
  const cancelEdit = () => {
    setEditingId(null)
    setTitle("")
    setExcerpt("")
    setContent("")
    setImage("")
    setIsFeatured(false)
    
    // Reset bio
    setAuthorBio("Expert in clinical precision and longevity protocols. Dedicated to pioneering personalized healthcare strategies for the world's most discerning individuals.")
    
    // Reset date to today's date
    setPublishDate(new Date())

    toast.info("Cleared editor inputs.")
  }

  // Handle Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !excerpt || !content || !image || !category || !author || !authorRole || !authorBio || !readTime) {
      toast.error("All clinical fields are required.")
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append("title", title)
    formData.append("excerpt", excerpt)
    formData.append("content", content)
    formData.append("category", category)
    formData.append("author", author)
    formData.append("authorRole", authorRole)
    formData.append("authorBio", authorBio)
    
    // Construct dynamic clinical date string e.g. "May 18, 2026"
    const dateString = format(publishDate, "MMM dd, yyyy")
    formData.append("date", dateString)

    formData.append("readTime", readTime)
    formData.append("image", image)
    formData.append("isFeatured", String(isFeatured))

    let res
    if (editingId) {
      res = await updateBlogPostAction(editingId, formData)
    } else {
      res = await createBlogPostAction(formData)
    }

    if (res.success) {
      toast.success(
        editingId 
          ? "Article successfully updated in PostgreSQL database!"
          : "Scientific analysis successfully published to the EMR Journal!"
      )
      cancelEdit()
      fetchBlogs() // Refresh list
    } else {
      toast.error(res.error || "Operation failed.")
    }
    setSubmitting(false)
  }

  // Handle Delete Blog
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this scientific article from the database? This action is irreversible.")) {
      const res = await deleteBlogPostAction(id)
      if (res.success) {
        toast.success("Article deleted successfully.")
        // Adjust pagination page if last item deleted on the page
        const newTotalItems = searchedBlogs.length - 1
        const maxPage = Math.max(Math.ceil(newTotalItems / REGISTRY_ITEMS_PER_PAGE), 1)
        if (registryPage > maxPage) {
          setRegistryPage(maxPage)
        }
        fetchBlogs()
      } else {
        toast.error(res.error || "Delete operation failed.")
      }
    }
  }

  // Registry search handler with URL parameters mapping
  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val) {
      params.set("search", val)
    } else {
      params.delete("search")
    }
    router.push(`?${params.toString()}`, { scroll: false })
    setRegistryPage(1) // Reset page on query shift
  }

  // Handle Visual Editor content editable input sync
  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML)
  }

  // Handle Visual formatting toolbar triggers
  const execFormatter = (command: string, value: string = "") => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  // Premium Green Highlight Card Insertion Logic
  const insertClinicalCallout = () => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    
    // Create the beautiful callout container
    const callout = document.createElement("div")
    callout.className = "p-4 bg-[#67BA2E]/10 border-l-4 border-[#67BA2E] rounded-r-xl my-4 text-slate-700 font-medium text-sm italic"
    
    const selectedText = range.toString()
    callout.innerHTML = selectedText || "<strong>Clinical Notice:</strong> Enter your prioritized medical highlight or warning panel content here..."
    
    range.deleteContents()
    range.insertNode(callout)
    
    // Move caret after the callout
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
    
    setContent(editorRef.current?.innerHTML || "")
    toast.success("Clinical highlight card inserted!")
  }

  // Filtered Registry list based on search parameters
  const searchedBlogs = useMemo(() => {
    if (!registrySearch) return blogs
    return blogs.filter(b => 
      b.title.toLowerCase().includes(registrySearch.toLowerCase()) ||
      b.author.toLowerCase().includes(registrySearch.toLowerCase()) ||
      b.category.toLowerCase().includes(registrySearch.toLowerCase())
    )
  }, [blogs, registrySearch])

  // Registry Pagination slicing applied to searchedBlogs list
  const totalRegistryPages = Math.ceil(searchedBlogs.length / REGISTRY_ITEMS_PER_PAGE)
  const paginatedBlogs = useMemo(() => {
    return searchedBlogs.slice((registryPage - 1) * REGISTRY_ITEMS_PER_PAGE, registryPage * REGISTRY_ITEMS_PER_PAGE)
  }, [searchedBlogs, registryPage])

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans selection:bg-[#67BA2E]/20 selection:text-slate-900 overflow-x-hidden pt-20 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-6">
        {/* Banner Section */}
        <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 mb-8 shadow-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#67BA2E_0%,_transparent_15%)] opacity-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[#67BA2E] font-black text-[9px] md:text-[11px] uppercase tracking-[0.25em]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#67BA2E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#67BA2E]"></span>
                </span>
                SyncMed CMS Control Center
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
                Scientific Journal <span className="text-[#67BA2E]">CMS</span>
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium max-w-xl">
                Create, update, delete, and feature clinical insights directly hosted on PostgreSQL with secure Cloudinary asset handling.
              </p>
            </div>
            
            <Button 
              onClick={fetchBlogs}
              variant="outline" 
              className="rounded-full border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-widest gap-2 bg-white h-11"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Registry
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create/Edit Blog Form (7 Columns) */}
          <motion.div 
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="lg:col-span-7"
          >
            <Card className="rounded-[2rem] border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6 md:p-8">
                <CardTitle className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-[#67BA2E]/10 rounded-xl">
                    <BookOpen size={20} className="text-[#67BA2E]" />
                  </div>
                  {editingId ? "Edit Medical Analysis" : "Publish Medical Analysis"}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                  {editingId 
                    ? `Currently editing database post UUID: ${editingId.substring(0, 8)}...`
                    : "Fill in the detailed fields to dynamically write your article to Neon SQL."
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Analysis Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Cellular Rejuvenation: The Next Phase of Longevity Medicine"
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E] text-slate-800 font-medium text-sm transition-all"
                      required
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Scientific Excerpt (Summary)</label>
                    <textarea 
                      placeholder="A concise clinical summary highlighting research outputs and diagnostic consequences..."
                      value={excerpt} 
                      onChange={(e) => setExcerpt(e.target.value)}
                      rows={3}
                      className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E] text-slate-800 font-medium text-sm transition-all resize-none"
                      required
                    />
                  </div>

                  {/* 2 Column Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category (PREMIUM CUSTOM SEARCHABLE & EXPANDABLE DROPDOWN SELECTOR) */}
                    <div className="space-y-2 relative" ref={dropdownRef}>
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Clinical Category</label>
                      
                      <button
                        type="button"
                        onClick={() => setCategoryOpen(!categoryOpen)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium text-sm flex items-center justify-between transition-all hover:bg-slate-50/50 focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E]"
                      >
                        <span>{category}</span>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${categoryOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {categoryOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-2 space-y-2"
                          >
                            {/* Live Category Search Input */}
                            <div className="px-3 pb-1 border-b border-slate-100 flex items-center gap-2">
                              <Search size={12} className="text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search category..."
                                value={catSearch}
                                onChange={(e) => setCatSearch(e.target.value)}
                                className="w-full text-xs font-semibold text-slate-700 bg-transparent outline-none placeholder-slate-400"
                              />
                            </div>

                            {/* Filtered Category list */}
                            <div className="max-h-40 overflow-y-auto px-1 space-y-0.5">
                              {filteredCategories.map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => {
                                    setCategory(cat)
                                    setCategoryOpen(false)
                                    setCatSearch("")
                                  }}
                                  className="w-full h-9 px-3 rounded-lg text-left font-medium text-xs text-slate-700 hover:bg-[#67BA2E]/5 hover:text-[#67BA2E] flex items-center justify-between transition-colors"
                                >
                                  {cat}
                                  {category === cat && <Check size={12} className="text-[#67BA2E]" />}
                                </button>
                              ))}
                              {filteredCategories.length === 0 && (
                                <p className="text-[10px] text-center text-slate-400 py-3 font-semibold uppercase tracking-wider">
                                  No matches found
                                </p>
                              )}
                            </div>

                            {/* Dynamic Add Custom Category Control */}
                            <div className="border-t border-slate-100 pt-2 px-3">
                              {isAddingCustom ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Add custom clinical label..."
                                    value={customCatName}
                                    onChange={(e) => setCustomCatName(e.target.value)}
                                    className="flex-grow h-8 px-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#67BA2E]"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault()
                                        addCustomCategory()
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={addCustomCategory}
                                    className="size-8 rounded-lg bg-[#67BA2E] text-white flex items-center justify-center hover:bg-[#5aa827] transition-colors"
                                  >
                                    <Check size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setIsAddingCustom(true)}
                                  className="w-full h-8 rounded-lg border border-dashed border-slate-200 hover:border-[#67BA2E] hover:bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-[#67BA2E] flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Plus size={12} />
                                  Add Custom Category
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Read Time */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Read Time Estimator</label>
                      <input 
                        type="text" 
                        value={readTime} 
                        onChange={(e) => setReadTime(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E] text-slate-800 font-medium text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Custom Published Date Calendar Popover */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Published Date (Custom Select)</label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          type="button"
                          className="h-12 flex w-full items-center justify-between px-4 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50 transition-all focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E]"
                        >
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#67BA2E]" />
                            {publishDate ? format(publishDate, "PPP") : <span>Select Published Date</span>}
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[9999] bg-white border-slate-200 shadow-2xl rounded-2xl overflow-hidden" align="start">
                        <PureCalendar 
                          selectedDate={publishDate} 
                          onSelect={(d) => {
                            setPublishDate(d)
                            setCalendarOpen(false) // Auto close the calendar popover on date click!
                          }} 
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Author Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Author Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Physician Author</label>
                      <input 
                        type="text" 
                        value={author} 
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E] text-slate-800 font-medium text-sm transition-all"
                        required
                      />
                    </div>

                    {/* Author Role */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Physician Specialty / Role</label>
                      <input 
                        type="text" 
                        value={authorRole} 
                        onChange={(e) => setAuthorRole(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E] text-slate-800 font-medium text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Author Bio Textarea */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Physician Biography (Dynamic Bio)</label>
                    <textarea 
                      placeholder="Write the physician's personalized biography and longevity specialty..."
                      value={authorBio} 
                      onChange={(e) => setAuthorBio(e.target.value)}
                      rows={2}
                      className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E] text-slate-800 font-medium text-sm transition-all resize-none"
                      required
                    />
                  </div>

                  {/* Dynamic Cloudinary File Uploader */}
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block">Cover Image Assets</label>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-8">
                        <input 
                          type="text" 
                          placeholder="Or paste direct unsplash/cloudinary URL"
                          value={image} 
                          onChange={(e) => setImage(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E] text-slate-800 font-medium text-sm transition-all"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-4 relative">
                        <input 
                          type="file" 
                          id="file-upload" 
                          accept="image/*"
                          onChange={handleImageUpload} 
                          className="hidden" 
                        />
                        <label 
                          htmlFor="file-upload"
                          className="flex items-center justify-center h-12 w-full border border-dashed border-slate-300 hover:border-[#67BA2E] hover:bg-slate-50/50 rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest text-slate-600 gap-2 transition-all"
                        >
                          {uploading ? (
                            <>
                              <Loader2 size={16} className="animate-spin text-[#67BA2E]" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload size={16} className="text-slate-400" />
                              Upload Cover
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    {image && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 aspect-[16/6] relative rounded-xl overflow-hidden shadow-inner border border-slate-100"
                      >
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[9px] font-black text-white uppercase tracking-widest">
                          Asset Verified
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Featured Article Flag */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-[#67BA2E] fill-[#67BA2E]" />
                          Featured Spotlight
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-400">
                          Display this article in the prominent featured banner section. Limit: Only 1 featured post allowed systemwide.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isAnotherPostFeatured && !isFeatured}
                        onClick={() => {
                          if (isAnotherPostFeatured && !isFeatured) {
                            toast.warning(`Featured spotlight is locked. Please unfeature "${activeFeaturedPost?.title}" first.`)
                            return
                          }
                          setIsFeatured(!isFeatured)
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isFeatured ? "bg-[#67BA2E]" : (isAnotherPostFeatured ? "bg-slate-100 cursor-not-allowed" : "bg-slate-200")
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isFeatured ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {isAnotherPostFeatured && !isFeatured && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-tight">
                        <ShieldAlert size={14} className="flex-shrink-0" />
                        <span>Spotlight Locked: Active Featured article is "{activeFeaturedPost?.title}"</span>
                      </div>
                    )}
                  </div>

                  {/* Premium Dual-Mode Clinical Editor Workspace */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#67BA2E]" />
                        Scientific Content Workspace
                      </label>

                      {/* Editor View Mode Slider Toggle */}
                      <div className="inline-flex p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setEditorMode("visual")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                            editorMode === "visual"
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          <Sparkles size={11} />
                          Visual Editor
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorMode("html")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                            editorMode === "html"
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          <Code size={11} />
                          HTML Code
                        </button>
                      </div>
                    </div>

                    {/* Rich Formatting Toolbar (WYSIWYG Mode only) */}
                    {editorMode === "visual" && (
                      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <button
                          type="button"
                          onClick={() => execFormatter("bold")}
                          title="Bold (Ctrl+B)"
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Bold size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormatter("italic")}
                          title="Italic (Ctrl+I)"
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormatter("formatBlock", "h2")}
                          title="Subheader (H2)"
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Heading2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormatter("formatBlock", "blockquote")}
                          title="Medical Quote"
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Quote size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => execFormatter("insertUnorderedList")}
                          title="Bullet Points"
                          className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <ListIcon size={14} />
                        </button>

                        <div className="w-px h-5 bg-slate-200 mx-1" />

                        {/* Premium Highlight Card Button */}
                        <button
                          type="button"
                          onClick={insertClinicalCallout}
                          className="px-2.5 py-1 rounded-lg hover:bg-[#67BA2E]/10 hover:text-[#67BA2E] text-slate-500 font-black text-[9px] uppercase tracking-wider transition-colors flex items-center gap-1 border border-dashed border-slate-300 hover:border-[#67BA2E]/20"
                        >
                          <Sparkles size={11} className="fill-current" />
                          + Callout Card
                        </button>

                        <div className="flex-grow" />

                        {/* Visual indicator */}
                        <span className="hidden sm:inline text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-2">
                          Interactive WYSIWYG Active
                        </span>
                      </div>
                    )}

                    {/* Editor Viewports */}
                    <div className="relative min-h-[300px] border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-white focus-within:ring-2 focus-within:ring-[#67BA2E]/30 focus-within:border-[#67BA2E] transition-all">
                      {editorMode === "visual" ? (
                        <div
                          ref={editorRef}
                          contentEditable
                          onInput={handleEditorInput}
                          className="w-full min-h-[300px] max-h-[500px] overflow-y-auto p-4 focus:outline-none prose prose-slate max-w-none 
                            prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight prose-headings:my-3
                            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:my-2
                            prose-strong:text-[#67BA2E] prose-strong:font-black
                            prose-blockquote:border-l-4 prose-blockquote:border-[#67BA2E] prose-blockquote:bg-slate-50 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-slate-700 prose-blockquote:my-3"
                          style={{ outline: "none" }}
                        />
                      ) : (
                        <textarea
                          placeholder="Type clinical paragraphs using <p>, subheaders with <h2>, and medical citations inside <blockquote> to ensure high-end clinical styling consistency..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          rows={15}
                          className="w-full min-h-[300px] p-4 text-slate-800 font-mono text-xs bg-slate-50 border-none outline-none focus:ring-0 focus:outline-none resize-y"
                          style={{ border: "none", outline: "none" }}
                        />
                      )}
                    </div>

                    {/* Pre-fill Quick Templates Selection */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-[#67BA2E]" />
                        Apply Quick Templates:
                      </span>
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => applyTemplate("clinical")}
                          className="text-[9px] font-bold text-[#67BA2E] hover:underline uppercase bg-[#67BA2E]/5 border border-[#67BA2E]/10 rounded px-2 py-0.5"
                        >
                          Clinical Research
                        </button>
                        <button 
                          type="button" 
                          onClick={() => applyTemplate("longevity")}
                          className="text-[9px] font-bold text-[#67BA2E] hover:underline uppercase bg-[#67BA2E]/5 border border-[#67BA2E]/10 rounded px-2 py-0.5"
                        >
                          Longevity Protocol
                        </button>
                        <button 
                          type="button" 
                          onClick={() => applyTemplate("performance")}
                          className="text-[9px] font-bold text-[#67BA2E] hover:underline uppercase bg-[#67BA2E]/5 border border-[#67BA2E]/10 rounded px-2 py-0.5"
                        >
                          Neurology Core
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex gap-4">
                    {editingId && (
                      <Button
                        type="button"
                        onClick={cancelEdit}
                        className="h-14 px-8 border border-slate-200 bg-white hover:bg-slate-900 hover:text-white hover:border-slate-900 text-slate-600 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-colors"
                      >
                        Cancel
                      </Button>
                    )}

                    <Button 
                      type="submit" 
                      disabled={submitting || uploading}
                      className="flex-grow h-14 bg-[#67BA2E] hover:bg-[#5aa827] text-white rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-[#67BA2E]/20 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-2" />
                          Syncing with Neon PostgreSQL...
                        </>
                      ) : editingId ? (
                        <>
                          <Sparkles size={16} className="mr-2" />
                          Update Medical Analysis
                        </>
                      ) : (
                        <>
                          <Plus size={16} className="mr-2" />
                          Publish Article to Public Journal
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Guidelines & Registry List (5 Columns) */}
          <motion.div 
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 space-y-8"
          >
            {/* Guidelines Card */}
            <Card className="rounded-[2rem] border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50 overflow-hidden border">
              <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                <CardTitle className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                  <ImageIcon size={16} className="text-[#67BA2E]" />
                  Cover Asset Specifications
                </CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Optimal configurations for EMR performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-lg bg-green-50 text-[#67BA2E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Compass size={12} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">Dimensions & Aspect Ratio</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">1600 × 1000 pixels (16:10 ratio)</p>
                      <p className="text-[10px] font-normal text-slate-400">Ensures crisp visualization across 4K retina displays.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-lg bg-green-50 text-[#67BA2E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertTriangle size={12} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">File Size Constraint</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Maximum 2.0 Megabytes (2MB)</p>
                      <p className="text-[10px] font-normal text-slate-400">Keeps the client-side portfolio fluid and responsive.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-lg bg-green-50 text-[#67BA2E] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText size={12} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">Recommended Format</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">WebP / JPEG / PNG</p>
                      <p className="text-[10px] font-normal text-slate-400">WebP offers up to 30% improved compression savings.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <span className="flex items-center gap-1.5 text-[#67BA2E]">
                    <Check size={12} className="stroke-[3px]" />
                    Cloudinary Safe CDN
                  </span>
                  <span>SSL encrypted</span>
                </div>
              </CardContent>
            </Card>

            {/* Database Registry List */}
            <Card className="rounded-[2rem] border-slate-200 shadow-sm bg-white overflow-hidden border">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                <CardTitle className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <FileText size={18} />
                  </div>
                  System Journal Registry
                </CardTitle>
                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Live inventory of all published articles.
                </CardDescription>
              </CardHeader>

              {/* Registry Labeled Search Bar (Clinical EMR Style) */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/20">
                <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title, category, author..."
                    value={registrySearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full h-11 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#67BA2E]/30 focus:border-[#67BA2E] text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                  />
                </div>
              </div>
              
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Loader2 size={30} className="animate-spin text-[#67BA2E]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Loading Database Entries...</span>
                  </div>
                ) : searchedBlogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50/40">
                        <TableRow className="border-slate-100 hover:bg-transparent">
                          <TableHead className="text-[9px] font-black text-slate-400 uppercase tracking-widest py-4 px-6">Article Details</TableHead>
                          <TableHead className="text-right text-[9px] font-black text-slate-400 uppercase tracking-widest py-4 px-6">Audits / Operations</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedBlogs.map((b) => {
                          const isDeletable = isNaN(Number(b.id))
                          return (
                            <TableRow key={b.id} className="border-slate-100 hover:bg-slate-50/50 transition-colors group">
                              <TableCell className="py-4 px-6">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="size-12 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm relative bg-slate-50">
                                    {b.image ? (
                                      <img src={b.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon size={16} />
                                      </div>
                                    )}
                                    {b.isFeatured && (
                                      <div className="absolute inset-0 bg-[#67BA2E]/80 flex items-center justify-center text-white font-black text-[7px] uppercase tracking-wider">
                                        Featured
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-wider">
                                        {b.category}
                                      </span>
                                      {b.isFeatured && (
                                        <span className="px-1.5 py-0.5 rounded-full bg-[#67BA2E]/10 text-[#67BA2E] text-[7px] font-black uppercase tracking-widest">
                                          Featured
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-xs font-black text-slate-800 truncate tracking-tight max-w-[180px]">
                                      {b.title}
                                    </h4>
                                    <p className="text-[9px] font-semibold text-slate-400">
                                      By {b.author}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6 text-right">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                                  {/* Edit Trigger Button */}
                                  <Button
                                    onClick={() => startEdit(b)}
                                    variant="outline" 
                                    className="h-8 px-3 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 font-black uppercase text-[9px] tracking-wider gap-1.5 flex items-center justify-center"
                                  >
                                    <Edit3 size={11} className="text-slate-400" />
                                    Edit
                                  </Button>

                                  {/* Delete Trigger Button */}
                                  {isDeletable ? (
                                    <Button
                                      onClick={() => handleDelete(b.id)}
                                      variant="outline" 
                                      className="h-8 px-3 rounded-lg border-red-200 text-red-600 hover:bg-red-50 font-black uppercase text-[9px] tracking-wider gap-1.5 flex items-center justify-center"
                                    >
                                      <Trash2 size={11} className="text-red-400" />
                                      Delete
                                    </Button>
                                  ) : (
                                    <span className="text-[7px] font-black text-blue-500 uppercase bg-blue-50 border border-blue-100 px-2 py-1 rounded-md text-center">
                                      Protected
                                    </span>
                                  )}
                                  
                                  {/* View Trigger Link */}
                                  <a 
                                    href={`/blog/${b.id}`} 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="h-8 px-3 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-black uppercase text-[9px] tracking-wider gap-1.5 flex items-center justify-center transition-colors text-center"
                                  >
                                    <Eye size={11} />
                                    View
                                  </a>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-20 text-center text-slate-400 space-y-3">
                    <ShieldAlert size={36} className="mx-auto text-slate-300" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Blogs Match Filter</p>
                  </div>
                )}

                {/* Table Pagination Controls */}
                {totalRegistryPages > 1 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                    <Button
                      type="button"
                      disabled={registryPage === 1}
                      onClick={() => setRegistryPage(prev => Math.max(prev - 1, 1))}
                      className="h-9 px-4 border border-slate-200 bg-white hover:bg-[#67BA2E] hover:text-white hover:border-[#67BA2E] text-slate-600 rounded-full font-black uppercase tracking-wider text-[9px] disabled:opacity-40 transition-colors"
                    >
                      Previous
                    </Button>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Page {registryPage} of {totalRegistryPages}
                    </span>
                    <Button
                      type="button"
                      disabled={registryPage === totalRegistryPages}
                      onClick={() => setRegistryPage(prev => Math.min(prev + 1, totalRegistryPages))}
                      className="h-9 px-4 border border-slate-200 bg-white hover:bg-[#67BA2E] hover:text-white hover:border-[#67BA2E] text-slate-600 rounded-full font-black uppercase tracking-wider text-[9px] disabled:opacity-40 transition-colors"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function BlogManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-[#67BA2E] size-10 mx-auto" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading CMS Control Center...</p>
        </div>
      </div>
    }>
      <BlogManagementContent />
    </Suspense>
  )
}
