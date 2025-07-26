import {
  users,
  stores,
  feedback,
  type User,
  type UpsertUser,
  type Store,
  type InsertStore,
  type Feedback,
  type InsertFeedback,
  type StoreWithStats,
  type FeedbackWithStore,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Store operations
  createStore(store: InsertStore): Promise<Store>;
  getStoresByOwner(ownerId: string): Promise<StoreWithStats[]>;
  getStore(id: number): Promise<Store | undefined>;
  updateStore(id: number, updates: Partial<InsertStore>): Promise<Store>;
  deleteStore(id: number): Promise<void>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByStore(storeId: number, limit?: number, offset?: number): Promise<FeedbackWithStore[]>;
  getFeedbackByOwner(ownerId: string, limit?: number, offset?: number): Promise<FeedbackWithStore[]>;
  updateFeedbackStatus(id: number, status: string): Promise<Feedback>;
  getFeedbackStats(ownerId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    videoReviews: number;
    activeStores: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Store operations
  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  async getStoresByOwner(ownerId: string): Promise<StoreWithStats[]> {
    const result = await db
      .select({
        id: stores.id,
        name: stores.name,
        address: stores.address,
        imageUrl: stores.imageUrl,
        qrCode: stores.qrCode,
        ownerId: stores.ownerId,
        isActive: stores.isActive,
        createdAt: stores.createdAt,
        updatedAt: stores.updatedAt,
        feedbackCount: sql<number>`count(${feedback.id})::int`,
        averageRating: sql<number>`coalesce(avg(${feedback.rating}), 0)::decimal`,
      })
      .from(stores)
      .leftJoin(feedback, eq(stores.id, feedback.storeId))
      .where(eq(stores.ownerId, ownerId))
      .groupBy(stores.id)
      .orderBy(desc(stores.createdAt));

    return result.map(store => ({
      ...store,
      averageRating: Number(store.averageRating),
    }));
  }

  async getStore(id: number): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store;
  }

  async updateStore(id: number, updates: Partial<InsertStore>): Promise<Store> {
    const [updatedStore] = await db
      .update(stores)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(stores.id, id))
      .returning();
    return updatedStore;
  }

  async deleteStore(id: number): Promise<void> {
    await db.delete(stores).where(eq(stores.id, id));
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback;
  }

  async getFeedbackByStore(storeId: number, limit = 50, offset = 0): Promise<FeedbackWithStore[]> {
    const result = await db
      .select({
        feedback,
        store: stores,
      })
      .from(feedback)
      .innerJoin(stores, eq(feedback.storeId, stores.id))
      .where(eq(feedback.storeId, storeId))
      .orderBy(desc(feedback.submittedAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.feedback,
      store: row.store,
    }));
  }

  async getFeedbackByOwner(ownerId: string, limit = 50, offset = 0): Promise<FeedbackWithStore[]> {
    const result = await db
      .select({
        feedback,
        store: stores,
      })
      .from(feedback)
      .innerJoin(stores, eq(feedback.storeId, stores.id))
      .where(eq(stores.ownerId, ownerId))
      .orderBy(desc(feedback.submittedAt))
      .limit(limit)
      .offset(offset);

    return result.map(row => ({
      ...row.feedback,
      store: row.store,
    }));
  }

  async updateFeedbackStatus(id: number, status: string): Promise<Feedback> {
    const [updatedFeedback] = await db
      .update(feedback)
      .set({ status, processedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return updatedFeedback;
  }

  async getFeedbackStats(ownerId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    videoReviews: number;
    activeStores: number;
  }> {
    const [stats] = await db
      .select({
        totalReviews: sql<number>`count(${feedback.id})::int`,
        averageRating: sql<number>`coalesce(avg(${feedback.rating}), 0)::decimal`,
        videoReviews: sql<number>`count(case when ${feedback.type} = 'video' then 1 end)::int`,
        activeStores: sql<number>`count(distinct case when ${stores.isActive} then ${stores.id} end)::int`,
      })
      .from(stores)
      .leftJoin(feedback, eq(stores.id, feedback.storeId))
      .where(eq(stores.ownerId, ownerId));

    return {
      ...stats,
      averageRating: Number(stats.averageRating),
    };
  }
}

export const storage = new DatabaseStorage();
