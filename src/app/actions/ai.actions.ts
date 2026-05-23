"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAiKnowledgeBase() {
  try {
    let kb = await prisma.aiKnowledgeBase.findFirst();

    if (!kb) {
      kb = await prisma.aiKnowledgeBase.create({
        data: {
          systemIdentity: "You are SyncMed AI, a highly intelligent, empathetic, and professional medical assistant. You assist doctors and patients in the SyncMed Healthcare platform.",
          coreKnowledge: "SyncMed provides comprehensive healthcare services including telemedicine, appointment scheduling, and patient management. Business hours are 9 AM to 5 PM EST, Monday through Friday.",
          strictRules: "You MUST NEVER prescribe medication, diagnose life-threatening conditions, or provide definitive medical advice. Always advise patients to consult their doctor or visit an ER in emergencies.",
          modelPreference: "openai/gpt-4o-mini",
        },
      });
    }

    return { success: true, data: kb };
  } catch (error: any) {
    console.error("Failed to fetch AI Knowledge Base:", error);
    return { success: false, error: "Failed to load AI configuration" };
  }
}

export async function updateAiKnowledgeBase(data: {
  id?: string;
  systemIdentity: string;
  coreKnowledge: string;
  strictRules: string;
  modelPreference: string;
}) {
  try {
    const { id, systemIdentity, coreKnowledge, strictRules, modelPreference } = data;

    if (id) {
      await prisma.aiKnowledgeBase.update({
        where: { id },
        data: { systemIdentity, coreKnowledge, strictRules, modelPreference },
      });
    } else {
      await prisma.aiKnowledgeBase.create({
        data: { systemIdentity, coreKnowledge, strictRules, modelPreference },
      });
    }

    revalidatePath("/admin/ai-panel/train");
    revalidatePath("/admin/ai-panel");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update AI Knowledge Base:", error);
    return { success: false, error: "Failed to update AI configuration" };
  }
}

export async function chatWithAiAction(userId: string, userMessage: string, chatHistory: any[]) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return { success: false, error: "OpenRouter API Key is missing. Please configure it in .env." };
    }

    // Save User's incoming message to the DB first
    await prisma.aiChatMessage.create({
      data: {
        userId,
        role: "user",
        content: userMessage,
      }
    });

    const kbResult = await getAiKnowledgeBase();
    if (!kbResult.success || !kbResult.data) {
      return { success: false, error: "Failed to load AI configuration." };
    }

    const kb = kbResult.data;

    // Construct the primary system prompt dynamically
    const systemPrompt = `
IDENTITY:
${kb.systemIdentity}

CORE KNOWLEDGE (Base your answers on this):
${kb.coreKnowledge}

STRICT BOUNDARIES & RULES (You must obey these):
${kb.strictRules}

CRITICAL: You MUST detect the USER'S SCRIPT (Latin, Arabic, Cyrillic, etc.) and exact language. If the user writes in ROMAN URDU (Latin script), you MUST respond in ROMAN URDU. Never switch to Urdu script unless the user uses it. Match the user's language and script 100%.
    `.trim();

    // Format chat history for OpenRouter
    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role === "system" || msg.role === "assistant" || msg.role === "user" ? msg.role : (msg.isMe ? "user" : "assistant"),
      content: msg.content,
    }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...formattedHistory,
      { role: "user", content: userMessage },
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Optional, for including your app on openrouter.ai rankings.
        "X-Title": "SyncMed EMR", // Optional. Shows in rankings on openrouter.ai.
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: kb.modelPreference,
        messages: messages,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error:", errText);
      return { success: false, error: "Failed to communicate with AI provider." };
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    // Save AI's response to the DB
    await prisma.aiChatMessage.create({
      data: {
        userId,
        role: "assistant",
        content: aiResponse,
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      }
    });

    return { success: true, data: aiResponse };

  } catch (error: any) {
    console.error("AI Chat Action error:", error);
    return { success: false, error: "An unexpected error occurred during AI chat." };
  }
}

export async function getAiHistoryForUser(userId: string) {
  try {
    const history = await prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    // Map to expected format
    const formatted = history.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      isMe: msg.role === 'user',
      createdAt: msg.createdAt,
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error("Failed to fetch AI history:", error);
    return { success: false, error: "Failed to fetch chat history." };
  }
}

export async function getAdminAiHistory() {
  try {
    const allMessages = await prisma.aiChatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        }
      }
    });

    // Group by user
    const userGroups = new Map();
    allMessages.forEach(msg => {
      if (!userGroups.has(msg.userId)) {
        userGroups.set(msg.userId, {
          userId: msg.userId,
          user: msg.user,
          lastMessageAt: msg.createdAt,
          messages: [],
        });
      }
      userGroups.get(msg.userId).messages.push(msg);
    });

    const groupedArray = Array.from(userGroups.values());
    // Reverse messages for each user so they are in chronological order
    groupedArray.forEach(group => {
      group.messages.reverse();
    });

    return { success: true, data: groupedArray };
  } catch (error: any) {
    console.error("Failed to fetch admin AI history:", error);
    return { success: false, error: "Failed to fetch admin history." };
  }
}

/** Daily token totals for the last 7 days (oldest → newest). */
export async function getAiTokenTrend() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);

    const messages = await prisma.aiChatMessage.findMany({
      where: { createdAt: { gte: since } },
      select: { totalTokens: true, createdAt: true },
    });

    const buckets: number[] = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(since);
      dayStart.setDate(since.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const total = messages
        .filter((m) => m.createdAt >= dayStart && m.createdAt <= dayEnd)
        .reduce((sum, m) => sum + (m.totalTokens || 0), 0);
      buckets.push(total);
    }

    return { success: true, data: buckets };
  } catch (error: unknown) {
    console.error("Failed to fetch AI token trend:", error);
    return { success: false, error: "Failed to fetch token trend." };
  }
}

export async function getAiDashboardStats() {
  try {
    const allMessages = await prisma.aiChatMessage.findMany({
      select: {
        id: true,
        userId: true,
        role: true,
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        }
      }
    });

    const totalMessages = allMessages.length;
    const totalTokens = allMessages.reduce((sum, msg) => sum + (msg.totalTokens || 0), 0);
    
    // Group by user
    const userGroups = new Map();
    allMessages.forEach(msg => {
      if (!userGroups.has(msg.userId)) {
        userGroups.set(msg.userId, {
          userId: msg.userId,
          user: msg.user,
          tokens: 0,
          messages: 0,
        });
      }
      const g = userGroups.get(msg.userId);
      g.tokens += (msg.totalTokens || 0);
      g.messages += 1;
    });

    const uniqueUsers = userGroups.size;
    const topUsers = Array.from(userGroups.values())
      .sort((a, b) => b.tokens - a.tokens)
      .slice(0, 5);

    const assistantMessages = allMessages.filter(m => m.role === 'assistant');
    const avgTokensPerMessage = assistantMessages.length > 0 
      ? Math.round(totalTokens / assistantMessages.length) 
      : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayTokens = allMessages
      .filter((m) => m.createdAt >= todayStart)
      .reduce((sum, m) => sum + (m.totalTokens || 0), 0);

    const kb = await prisma.aiKnowledgeBase.findFirst({
      select: { modelPreference: true },
    });

    return {
      success: true,
      data: {
        totalMessages,
        totalTokens,
        todayTokens,
        uniqueUsers,
        avgTokensPerMessage,
        topUsers,
        modelPreference: kb?.modelPreference ?? "openai/gpt-4o-mini",
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch AI dashboard stats:", error);
    return { success: false, error: "Failed to fetch stats." };
  }
}
