import {
  type User, type InsertUser, users,
  type School, type InsertSchool, schools,
  type Student, type InsertStudent, students,
  type Attendance, type InsertAttendance, attendance,
  type Guardian, type InsertGuardian, guardians,
  type ClassHistory, type InsertClassHistory, classHistory,
  type SchoolVisit, type InsertSchoolVisit, schoolVisits,
  type Subject, type InsertSubject, subjects,
  type Class, type InsertClass, classes,
  type TeacherSubject, type InsertTeacherSubject, teacherSubjects,
  type TimetableSlot, type InsertTimetableSlot, timetableSlots,
  type FeedbackCategory, type InsertFeedbackCategory, feedbackCategories,
  type Feedback, type InsertFeedback, feedbacks,
  type Announcement, type InsertAnnouncement, announcements,
  type Message, type InsertMessage, messages,
  type Event, type InsertEvent, events,
  type AssetCategory, type InsertAssetCategory, assetCategories,
  type Asset, type InsertAsset, assets,
  type MaintenanceLog, type InsertMaintenanceLog, assetMaintenanceLogs,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, sql } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL env var is required");

// Supabase pooler connection — use prepare:false for pgBouncer compatibility
const client = postgres(DATABASE_URL, {
  max: 10,
  prepare: false,
  ssl: DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(client);

const first = <T>(arr: T[]): T | undefined => arr[0];

export class DatabaseStorage {
  // ── Schools ──
  async getSchool(id: number): Promise<School | undefined> {
    return first(await db.select().from(schools).where(eq(schools.id, id)));
  }
  async getSchoolByCode(code: string): Promise<School | undefined> {
    return first(await db.select().from(schools).where(eq(schools.code, code)));
  }
  async createSchool(data: InsertSchool): Promise<School> {
    return first(await db.insert(schools).values(data).returning())!;
  }
  async updateSchool(id: number, data: Partial<InsertSchool>): Promise<School | undefined> {
    return first(await db.update(schools).set(data).where(eq(schools.id, id)).returning());
  }

  // ── Users ──
  async getUser(id: number): Promise<User | undefined> {
    return first(await db.select().from(users).where(eq(users.id, id)));
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    return first(await db.select().from(users).where(eq(users.username, username)));
  }
  async getUsersBySchool(schoolId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.schoolId, schoolId));
  }
  async createUser(data: InsertUser): Promise<User> {
    return first(await db.insert(users).values(data).returning())!;
  }
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    return first(await db.update(users).set(data).where(eq(users.id, id)).returning());
  }
  async deleteUser(id: number) {
    return await db.delete(users).where(eq(users.id, id));
  }

  // ── Students ──
  async getStudentsBySchool(schoolId: number): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.schoolId, schoolId));
  }
  async getStudent(id: number): Promise<Student | undefined> {
    return first(await db.select().from(students).where(eq(students.id, id)));
  }
  async createStudent(data: InsertStudent): Promise<Student> {
    return first(await db.insert(students).values(data).returning())!;
  }
  async updateStudent(id: number, data: Partial<InsertStudent>): Promise<Student | undefined> {
    return first(await db.update(students).set(data).where(eq(students.id, id)).returning());
  }
  async deleteStudent(id: number) {
    return await db.delete(students).where(eq(students.id, id));
  }

  // ── Guardians ──
  async getGuardiansByStudent(studentId: number): Promise<Guardian[]> {
    return await db.select().from(guardians).where(eq(guardians.studentId, studentId));
  }
  async createGuardian(data: InsertGuardian): Promise<Guardian> {
    return first(await db.insert(guardians).values(data).returning())!;
  }
  async updateGuardian(id: number, data: Partial<InsertGuardian>): Promise<Guardian | undefined> {
    return first(await db.update(guardians).set(data).where(eq(guardians.id, id)).returning());
  }
  async deleteGuardian(id: number) {
    return await db.delete(guardians).where(eq(guardians.id, id));
  }

  // ── Class History ──
  async getClassHistoryByStudent(studentId: number): Promise<ClassHistory[]> {
    return await db.select().from(classHistory).where(eq(classHistory.studentId, studentId)).orderBy(desc(classHistory.session));
  }
  async createClassHistory(data: InsertClassHistory): Promise<ClassHistory> {
    return first(await db.insert(classHistory).values(data).returning())!;
  }
  async deleteClassHistory(id: number) {
    return await db.delete(classHistory).where(eq(classHistory.id, id));
  }

  // ── Attendance ──
  async getAttendanceByDate(schoolId: number, date: string): Promise<Attendance[]> {
    return await db.select().from(attendance).where(and(eq(attendance.schoolId, schoolId), eq(attendance.date, date)));
  }
  async createAttendance(data: InsertAttendance): Promise<Attendance> {
    return first(await db.insert(attendance).values(data).returning())!;
  }
  async createManyAttendance(records: InsertAttendance[]) {
    if (records.length === 0) return;
    await db.insert(attendance).values(records);
  }
  async getAttendanceStats(schoolId: number): Promise<{ total: number; present: number; absent: number; late: number }> {
    const rows = await db.select({ status: attendance.status, count: sql<number>`count(*)::int` }).from(attendance).where(eq(attendance.schoolId, schoolId)).groupBy(attendance.status);
    const stats = { total: 0, present: 0, absent: 0, late: 0 };
    for (const r of rows) {
      const c = Number(r.count);
      stats.total += c;
      if (r.status === "present") stats.present = c;
      else if (r.status === "absent") stats.absent = c;
      else if (r.status === "late") stats.late = c;
    }
    return stats;
  }

  // ── School Visits ──
  async getVisitsBySchool(schoolId: number): Promise<SchoolVisit[]> {
    return await db.select().from(schoolVisits).where(eq(schoolVisits.schoolId, schoolId)).orderBy(desc(schoolVisits.id));
  }
  async createVisit(data: InsertSchoolVisit): Promise<SchoolVisit> {
    return first(await db.insert(schoolVisits).values(data).returning())!;
  }
  async updateVisit(id: number, data: Partial<InsertSchoolVisit>): Promise<SchoolVisit | undefined> {
    return first(await db.update(schoolVisits).set(data).where(eq(schoolVisits.id, id)).returning());
  }

  // ── Subjects ──
  async getSubjectsBySchool(schoolId: number): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.schoolId, schoolId));
  }
  async createSubject(data: InsertSubject): Promise<Subject> {
    return first(await db.insert(subjects).values(data).returning())!;
  }
  async deleteSubject(id: number) {
    return await db.delete(subjects).where(eq(subjects.id, id));
  }

  // ── Classes ──
  async getClassesBySchool(schoolId: number): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.schoolId, schoolId));
  }
  async createClass(data: InsertClass): Promise<Class> {
    return first(await db.insert(classes).values(data).returning())!;
  }
  async deleteClass(id: number) {
    return await db.delete(classes).where(eq(classes.id, id));
  }

  // ── Timetable ──
  async getTimetableBySchool(schoolId: number): Promise<TimetableSlot[]> {
    return await db.select().from(timetableSlots).where(eq(timetableSlots.schoolId, schoolId));
  }
  async getTimetableByClass(schoolId: number, classId: number): Promise<TimetableSlot[]> {
    return await db.select().from(timetableSlots).where(and(eq(timetableSlots.schoolId, schoolId), eq(timetableSlots.classId, classId)));
  }
  async createTimetableSlot(data: InsertTimetableSlot): Promise<TimetableSlot> {
    return first(await db.insert(timetableSlots).values(data).returning())!;
  }
  async deleteTimetableBySchool(schoolId: number) {
    return await db.delete(timetableSlots).where(eq(timetableSlots.schoolId, schoolId));
  }

  // ── Feedback Categories ──
  async getFeedbackCategoriesBySchool(schoolId: number): Promise<FeedbackCategory[]> {
    return await db.select().from(feedbackCategories).where(eq(feedbackCategories.schoolId, schoolId));
  }
  async createFeedbackCategory(data: InsertFeedbackCategory): Promise<FeedbackCategory> {
    return first(await db.insert(feedbackCategories).values(data).returning())!;
  }

  // ── Feedbacks ──
  async getFeedbacksBySchool(schoolId: number): Promise<Feedback[]> {
    return await db.select().from(feedbacks).where(eq(feedbacks.schoolId, schoolId)).orderBy(desc(feedbacks.id));
  }
  async getFeedbackByCode(code: string): Promise<Feedback | undefined> {
    return first(await db.select().from(feedbacks).where(eq(feedbacks.trackingCode, code)));
  }
  async createFeedback(data: InsertFeedback): Promise<Feedback> {
    return first(await db.insert(feedbacks).values(data).returning())!;
  }
  async updateFeedback(id: number, data: Partial<InsertFeedback>): Promise<Feedback | undefined> {
    return first(await db.update(feedbacks).set(data).where(eq(feedbacks.id, id)).returning());
  }

  // ── Announcements ──
  async getAnnouncementsBySchool(schoolId: number): Promise<Announcement[]> {
    return await db.select().from(announcements).where(eq(announcements.schoolId, schoolId)).orderBy(desc(announcements.id));
  }
  async createAnnouncement(data: InsertAnnouncement): Promise<Announcement> {
    return first(await db.insert(announcements).values(data).returning())!;
  }

  // ── Messages ──
  async getInbox(userId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.receiverId, userId)).orderBy(desc(messages.id));
  }
  async getSent(userId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.senderId, userId)).orderBy(desc(messages.id));
  }
  async createMessage(data: InsertMessage): Promise<Message> {
    return first(await db.insert(messages).values(data).returning())!;
  }
  async markMessageRead(id: number) {
    return await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
  }

  // ── Events ──
  async getEventsBySchool(schoolId: number): Promise<Event[]> {
    return await db.select().from(events).where(eq(events.schoolId, schoolId)).orderBy(desc(events.id));
  }
  async createEvent(data: InsertEvent): Promise<Event> {
    return first(await db.insert(events).values(data).returning())!;
  }

  // ── Asset Categories ──
  async getAssetCategoriesBySchool(schoolId: number): Promise<AssetCategory[]> {
    return await db.select().from(assetCategories).where(eq(assetCategories.schoolId, schoolId));
  }
  async createAssetCategory(data: InsertAssetCategory): Promise<AssetCategory> {
    return first(await db.insert(assetCategories).values(data).returning())!;
  }

  // ── Assets ──
  async getAssetsBySchool(schoolId: number): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.schoolId, schoolId)).orderBy(desc(assets.id));
  }
  async getAsset(id: number): Promise<Asset | undefined> {
    return first(await db.select().from(assets).where(eq(assets.id, id)));
  }
  async createAsset(data: InsertAsset): Promise<Asset> {
    return first(await db.insert(assets).values(data).returning())!;
  }
  async updateAsset(id: number, data: Partial<InsertAsset>): Promise<Asset | undefined> {
    return first(await db.update(assets).set({ ...data, updatedAt: new Date() }).where(eq(assets.id, id)).returning());
  }
  async deleteAsset(id: number) {
    return await db.delete(assets).where(eq(assets.id, id));
  }

  // ── Maintenance Logs ──
  async getMaintenanceBySchool(schoolId: number): Promise<MaintenanceLog[]> {
    return await db.select().from(assetMaintenanceLogs).where(eq(assetMaintenanceLogs.schoolId, schoolId)).orderBy(desc(assetMaintenanceLogs.id));
  }
  async createMaintenanceLog(data: InsertMaintenanceLog): Promise<MaintenanceLog> {
    return first(await db.insert(assetMaintenanceLogs).values(data).returning())!;
  }

  // ── Dashboard Stats ──
  async getDashboardStats(schoolId: number) {
    const [s] = await db.select({ count: sql<number>`count(*)::int` }).from(students).where(and(eq(students.schoolId, schoolId), eq(students.isActive, true)));
    const [t] = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(and(eq(users.schoolId, schoolId), eq(users.role, "teacher")));
    const [f] = await db.select({ count: sql<number>`count(*)::int` }).from(feedbacks).where(and(eq(feedbacks.schoolId, schoolId), eq(feedbacks.status, "new")));
    const [a] = await db.select({ count: sql<number>`count(*)::int` }).from(assets).where(eq(assets.schoolId, schoolId));
    const [an] = await db.select({ count: sql<number>`count(*)::int` }).from(announcements).where(eq(announcements.schoolId, schoolId));
    const [e] = await db.select({ count: sql<number>`count(*)::int` }).from(events).where(eq(events.schoolId, schoolId));
    return {
      studentCount: Number(s?.count ?? 0),
      teacherCount: Number(t?.count ?? 0),
      feedbackCount: Number(f?.count ?? 0),
      assetCount: Number(a?.count ?? 0),
      announcementCount: Number(an?.count ?? 0),
      eventCount: Number(e?.count ?? 0),
    };
  }
}

export const storage = new DatabaseStorage();
