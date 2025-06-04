import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const chatService = {
  // Subscribe to chat messages between a resident and admin
  subscribeToChat: (userId, callback) => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Convert Firestore Timestamp to JS Date
        if (data.timestamp) {
          data.timestamp = data.timestamp.toDate();
        }
        messages.push({ id: doc.id, ...data });
      });
      callback(messages);
    });
  },

  // Subscribe to typing status
  subscribeToTyping: (userId, callback) => {
    const q = query(
      collection(db, 'typing'),
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const typingUsers = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isTyping && data.userId !== userId) {
          typingUsers.push({
            id: data.userId,
            username: data.username
          });
        }
      });
      callback(typingUsers);
    });
  },

  // Set typing status
  setTypingStatus: async (userId, isTyping) => {
    try {
      const typingRef = collection(db, 'typing');
      const q = query(typingRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Create new typing status
        await addDoc(typingRef, {
          userId,
          isTyping,
          timestamp: serverTimestamp(),
          participants: [userId, 'admin'] // Add relevant participants
        });
      } else {
        // Update existing typing status
        const docRef = doc(db, 'typing', snapshot.docs[0].id);
        await updateDoc(docRef, {
          isTyping,
          timestamp: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  },

  // Send a new message
  sendMessage: async (message) => {
    try {
      const chatRef = collection(db, 'chats');
      const docRef = await addDoc(chatRef, {
        ...message,
        timestamp: serverTimestamp(),
        read: false,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark a single message as read
  markAsRead: async (messageId) => {
    try {
      const messageRef = doc(db, 'chats', messageId);
      await updateDoc(messageRef, { read: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },

  // Mark all unread messages as read
  markAllAsRead: async (userId) => {
    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return;

      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  },

  // Create a new chat or get existing chat between resident and admin
  createOrGetChat: async (userId, adminId) => {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', userId)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].id;
      }

      const newChat = await addDoc(chatsRef, {
        participants: [userId, adminId],
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null
      });

      return newChat.id;
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      throw error;
    }
  },
};
