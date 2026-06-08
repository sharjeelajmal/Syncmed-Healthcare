"use server"

import { auth } from "@/../auth"
import prisma from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"
import { pusherServer } from "@/lib/pusher"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function getSessionActor() {
  const session = await auth()
  const userId = session?.user?.id
  const role = (session?.user as { role?: string } | undefined)?.role
  if (!userId || !role) {
    throw new Error("Unauthorized")
  }
  return { userId, role }
}

async function assertSessionUser(expectedUserId: string) {
  const actor = await getSessionActor()
  if (actor.userId !== expectedUserId) {
    throw new Error("Unauthorized user context")
  }
  return actor
}

async function canUsersChat(userAId: string, userBId: string) {
  const users = await prisma.user.findMany({
    where: { id: { in: [userAId, userBId] } },
    include: {
      providerProfile: { select: { id: true } },
      patientProfile: { select: { id: true, assignedProviderId: true } },
    },
  })

  if (users.length !== 2) return false

  const [a, b] = users
  if (a.role === "ADMIN" || b.role === "ADMIN") return true

  const providerSide = a.role === "PROVIDER" ? a : b.role === "PROVIDER" ? b : null
  const patientSide = a.role === "PATIENT" ? a : b.role === "PATIENT" ? b : null

  if (!providerSide || !patientSide) return false
  if (!providerSide.providerProfile || !patientSide.patientProfile) return false

  return patientSide.patientProfile.assignedProviderId === providerSide.providerProfile.id
}

async function assertChatPairAccess(userAId: string, userBId: string) {
  const allowed = await canUsersChat(userAId, userBId)
  if (!allowed) {
    throw new Error("Chat access denied")
  }
}

/**
 * Modern chat attachment upload with type detection
 */
export async function uploadChatAttachmentAction(formData: FormData) {
  try {
    await getSessionActor()
    const file = formData.get('file') as File | null
    if (!file) throw new Error("No file provided")

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'chat_attachments',
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    const url = (uploadResult as any).secure_url
    let type = "DOC"
    if (file.type.startsWith('image/')) type = "IMAGE"
    else if (file.type.startsWith('audio/')) type = "AUDIO"

    return { success: true, url, type }
  } catch (error: any) {
    console.error("Chat Upload Error:", error)
    return { success: false, error: error.message || "Upload failed" }
  }
}

/**
 * Send a new message with Real-time Pusher trigger
 */
export async function sendMessageAction(senderId: string, receiverId: string, content: string, type: string = "TEXT") {
  try {
    await assertSessionUser(senderId)
    await assertChatPairAccess(senderId, receiverId)

    const newMessage = await prisma.message.create({
      data: { 
        senderId, 
        receiverId, 
        content, 
        type,
        deletedBy: [] // Ensure this initializes correctly
      }
    });
    const chatChannel = [senderId, receiverId].sort().join('-');
    await pusherServer.trigger(chatChannel, 'new-message', newMessage);
    return { success: true, message: newMessage };
  } catch (error) { 
    console.error("DB Save Error:", error); 
    return { success: false, error: "Failed to save to DB" }; 
  }
}

/**
 * Update user heartbeat
 */
export async function updatePresenceAction(userId: string) {
  try {
    await assertSessionUser(userId)
    await prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() }
    });
  } catch (error) { console.error("Presence Error:", error); }
}

/**
 * Delete message with 5-min/30-sec constraint
 */
export async function deleteMessageAction(messageId: string, userId: string) {
  try {
    await assertSessionUser(userId)
    const message = await prisma.message.findUnique({ where: { id: messageId } })
    if (!message || message.senderId !== userId) throw new Error("Unauthorized")
    await assertChatPairAccess(message.senderId, message.receiverId)

    const now = new Date()
    const fiveMins = 5 * 60 * 1000
    const thirtySecs = 30 * 1000

    const isWithinFiveMins = (now.getTime() - message.createdAt.getTime()) < fiveMins
    const isRecentlyRead = message.readAt ? (now.getTime() - message.readAt.getTime()) < thirtySecs : true

    if (isWithinFiveMins && (!message.read || isRecentlyRead)) {
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          isDeleted: true,
          content: "🚫 This message was deleted"
        }
      })

      const chatChannel = [message.senderId, message.receiverId].sort().join('-')
      await pusherServer.trigger(chatChannel, 'message-deleted', updatedMessage)
      
      return { success: true }
    } else {
      throw new Error("Message cannot be deleted (time limit exceeded)")
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Edit message with 5-min/30-sec constraint
 */
export async function editMessageAction(messageId: string, userId: string, newContent: string) {
  try {
    await assertSessionUser(userId)
    const message = await prisma.message.findUnique({ where: { id: messageId } })
    if (!message || message.senderId !== userId) throw new Error("Unauthorized")
    await assertChatPairAccess(message.senderId, message.receiverId)

    const now = new Date()
    const fiveMins = 5 * 60 * 1000
    const thirtySecs = 30 * 1000

    const isWithinFiveMins = (now.getTime() - message.createdAt.getTime()) < fiveMins
    const isRecentlyRead = message.readAt ? (now.getTime() - message.readAt.getTime()) < thirtySecs : true

    if (isWithinFiveMins && (!message.read || isRecentlyRead)) {
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content: newContent,
          isEdited: true
        }
      })

      const chatChannel = [message.senderId, message.receiverId].sort().join('-')
      await pusherServer.trigger(chatChannel, 'message-updated', updatedMessage)
      
      return { success: true }
    } else {
      throw new Error("Message cannot be edited (time limit exceeded)")
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function getSessionProvider() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  return prisma.providerProfile.findUnique({
    where: { userId },
    include: { user: true },
  })
}

export async function getProviderContacts() {
  try {
    const provider = await getSessionProvider();
    if (!provider) return [];

    const patients = await prisma.patientProfile.findMany({
      where: { assignedProviderId: provider.id },
      include: { user: true }
    });
    const validPatients = patients.filter(p => p.user != null);
    const patientUserIds = validPatients.map(p => p.user.id);

    // Batch fetch unread counts using groupBy (Zero N+1)
    const unreadCountsData = await prisma.message.groupBy({
      by: ['senderId'],
      where: { receiverId: provider.user.id, read: false, NOT: { deletedBy: { has: provider.user.id } } },
      _count: { id: true }
    });
    const unreadMap = new Map(unreadCountsData.map(item => [item.senderId, item._count.id]));

    // Batch fetch most recent messages for all relevant chats
    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: provider.user.id, receiverId: { in: patientUserIds } },
          { receiverId: provider.user.id, senderId: { in: patientUserIds } }
        ],
        NOT: { deletedBy: { has: provider.user.id } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enrichedContacts = validPatients.map((p) => {
      const lastActiveTime = p.user.lastActive ? new Date(p.user.lastActive).getTime() : 0;
      const isOnline = (Date.now() - lastActiveTime) < 130000;
      const unreadCount = unreadMap.get(p.user.id) || 0;
      
      // Find the first message in sorted list that belongs to this specific chat
      const lastMsg = recentMessages.find(m => m.senderId === p.user.id || m.receiverId === p.user.id);

      return {
        id: p.user.id, 
        firstName: p.user.firstName, 
        lastName: p.user.lastName, 
        email: p.user.email,
        isOnline, 
        patientProfileId: p.id, 
        dob: p.dateOfBirth, 
        address: p.address,
        unreadCount, 
        lastMessageAt: lastMsg ? lastMsg.createdAt : new Date(0)
      };
    });

    return enrichedContacts.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  } catch (error) { 
    console.error("Optimized Provider Contacts Error:", error);
    return []; 
  }
}

export async function getMockProvider() {
  try {
    const provider = await getSessionProvider();
    if (!provider) return null;

    return {
      id: provider.user.id,
      firstName: provider.user.firstName,
      lastName: provider.user.lastName,
      email: provider.user.email
    };
  } catch (error) {
    console.error("CRITICAL ERROR fetching mock provider:", error);
    return null;
  }
}

export async function getMockPatient() {
  try {
    const patient = await prisma.patientProfile.findFirst({
      where: {
        OR: [
          { assignedProviderId: { not: null } },
          { appointments: { some: {} } }
        ]
      },
      include: { user: true }
    });
    return patient?.user || null;
  } catch (error) { return null; }
}

export async function getRealLoggedUserByEmail(email: string) {
  try {
    const actor = await getSessionActor()
    const normalizedEmail = email.trim().toLowerCase()
    const sessionEmail = (await auth())?.user?.email?.toLowerCase()
    if (actor.role !== "ADMIN" && sessionEmail !== normalizedEmail) {
      return null
    }
    return await prisma.user.findUnique({ where: { email } });
  } catch (error) { 
    console.error("Error fetching real user:", error);
    return null; 
  }
}

export async function getPatientContacts(patientUserId: string) {
  try {
    const actor = await assertSessionUser(patientUserId)
    if (actor.role !== "PATIENT" && actor.role !== "ADMIN") {
      return []
    }

    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: patientUserId },
      include: {
        assignedProvider: { include: { user: true } },
      }
    });

    if (!patientProfile) return [];

    const providerMap = new Map();
    if (patientProfile.assignedProvider?.user) {
      providerMap.set(patientProfile.assignedProvider.user.id, {
        ...patientProfile.assignedProvider.user,
        specialty: patientProfile.assignedProvider.specialty,
        providerType: patientProfile.assignedProvider.providerType,
      });
    }
    const providers = Array.from(providerMap.values());
    const providerUserIds = providers.map(p => p.id);

    // Optimized batch fetch (Zero N+1)
    const unreadCountsData = await prisma.message.groupBy({
      by: ['senderId'],
      where: { receiverId: patientUserId, read: false, NOT: { deletedBy: { has: patientUserId } } },
      _count: { id: true }
    });
    const unreadMap = new Map(unreadCountsData.map(item => [item.senderId, item._count.id]));

    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: patientUserId, receiverId: { in: providerUserIds } },
          { receiverId: patientUserId, senderId: { in: providerUserIds } }
        ],
        NOT: { deletedBy: { has: patientUserId } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enrichedContacts = providers.map((providerUser) => {
      const lastActiveTime = providerUser.lastActive ? new Date(providerUser.lastActive).getTime() : 0;
      const isOnline = (Date.now() - lastActiveTime) < 130000;
      const unreadCount = unreadMap.get(providerUser.id) || 0;
      const lastMsg = recentMessages.find(m => m.senderId === providerUser.id || m.receiverId === providerUser.id);

      return {
        id: providerUser.id,
        firstName: providerUser.firstName,
        lastName: providerUser.lastName,
        email: providerUser.email,
        isOnline: Boolean(isOnline),
        specialty: providerUser.specialty,
        providerType: providerUser.providerType,
        unreadCount,
        lastMessageAt: lastMsg ? lastMsg.createdAt : new Date(0)
      };
    });

    return enrichedContacts.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  } catch (error) {
    console.error("Optimized Patient Contacts Error:", error);
    return [];
  }
}
export async function getChatHistory(user1Id: string, user2Id: string) {
  try {
    await assertSessionUser(user1Id)
    await assertChatPairAccess(user1Id, user2Id)

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    // Strictly filter out messages that the CURRENT user has cleared
    return messages.filter(msg => !msg.deletedBy?.includes(user1Id));
  } catch (error) { return []; }
}

/**
 * Mark messages as read and trigger Pusher event
 */
export async function markMessagesAsReadAction(currentUserId: string, chatPartnerId: string) {
  try {
    await assertSessionUser(currentUserId)
    await assertChatPairAccess(currentUserId, chatPartnerId)

    await prisma.message.updateMany({
      where: { 
        senderId: chatPartnerId, 
        receiverId: currentUserId, 
        read: false 
      },
      data: { 
        read: true, 
        readAt: new Date() 
      }
    });

    const chatChannel = [currentUserId, chatPartnerId].sort().join('-');
    await pusherServer.trigger(chatChannel, 'messages-read', { readerId: currentUserId });

    return { success: true };
  } catch (error) {
    console.error("markMessagesAsReadAction Error:", error);
    return { success: false };
  }
}

/**
 * Get total unread message count for a provider
 */
export async function getGlobalUnreadCount(currentUserId: string) {
  try {
    await assertSessionUser(currentUserId)
    const count = await prisma.message.count({
      where: {
        receiverId: currentUserId,
        read: false,
        NOT: {
          deletedBy: {
            has: currentUserId
          }
        }
      }
    });
    return count;
  } catch (error) {
    console.error("getGlobalUnreadCount Error:", error);
    return 0;
  }
}

/**
 * Clear chat for a specific user (hides messages for them)
 */
export async function clearChatForUserAction(userId: string, otherUserId: string) {
  try {
    await assertSessionUser(userId)
    await assertChatPairAccess(userId, otherUserId)

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      }
    });
    
    // Update the deletedBy array for each message
    for (const msg of messages) {
      const currentDeletedBy = msg.deletedBy || [];
      if (!currentDeletedBy.includes(userId)) {
        await prisma.message.update({
          where: { id: msg.id },
          data: { deletedBy: { push: userId } }
        });
      }
    }
    return { success: true };
  } catch (error) { 
    console.error("Clear Chat Error:", error);
    return { success: false }; 
  }
}
