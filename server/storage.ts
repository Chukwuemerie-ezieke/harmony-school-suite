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
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc, sql } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite);

// ── Create tables ──
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    state TEXT,
    lga TEXT,
    phone TEXT,
    email TEXT,
    subscription_plan TEXT NOT NULL DEFAULT 'trial',
    subscription_status TEXT NOT NULL DEFAULT 'trial',
    trial_ends_at TEXT,
    max_students INTEGER NOT NULL DEFAULT 50,
    max_teachers INTEGER NOT NULL DEFAULT 10,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'teacher',
    is_active INTEGER NOT NULL DEFAULT 1,
    last_login TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    admission_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    gender TEXT NOT NULL,
    date_of_birth TEXT,
    class_level TEXT NOT NULL,
    section TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    address TEXT,
    blood_group TEXT,
    genotype TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    student_id INTEGER REFERENCES students(id),
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'present',
    marked_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS guardians (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    relationship TEXT NOT NULL,
    occupation TEXT,
    address TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS class_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    session TEXT NOT NULL,
    result TEXT NOT NULL,
    position TEXT,
    remarks TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS school_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    visitor_name TEXT NOT NULL,
    visitor_phone TEXT,
    purpose TEXT NOT NULL,
    person_visited TEXT,
    check_in TEXT NOT NULL,
    check_out TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    name TEXT NOT NULL,
    code TEXT,
    color_code TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    name TEXT NOT NULL,
    level TEXT,
    section TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS teacher_subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    teacher_id INTEGER REFERENCES users(id),
    subject_id INTEGER REFERENCES subjects(id),
    class_id INTEGER REFERENCES classes(id)
  );
  CREATE TABLE IF NOT EXISTS timetable_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    class_id INTEGER REFERENCES classes(id),
    subject_id INTEGER REFERENCES subjects(id),
    teacher_id INTEGER REFERENCES users(id),
    day_of_week INTEGER NOT NULL,
    period INTEGER NOT NULL,
    start_time TEXT,
    end_time TEXT,
    room TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS feedback_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    tracking_code TEXT NOT NULL UNIQUE,
    category_id INTEGER REFERENCES feedback_categories(id),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    priority TEXT NOT NULL DEFAULT 'medium',
    is_anonymous INTEGER NOT NULL DEFAULT 1,
    submitted_by TEXT,
    admin_response TEXT,
    responded_by INTEGER REFERENCES users(id),
    responded_at TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_audience TEXT NOT NULL DEFAULT 'all',
    target_class TEXT,
    priority TEXT NOT NULL DEFAULT 'normal',
    published_by INTEGER REFERENCES users(id),
    is_published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    sender_id INTEGER REFERENCES users(id),
    receiver_id INTEGER REFERENCES users(id),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    title TEXT NOT NULL,
    description TEXT,
    event_date TEXT NOT NULL,
    event_time TEXT,
    location TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS asset_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER REFERENCES schools(id),
    asset_tag TEXT NOT NULL,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES asset_categories(id),
    description TEXT,
    location TEXT,
    condition TEXT NOT NULL DEFAULT 'good',
    purchase_date TEXT,
    purchase_price TEXT,
    current_value TEXT,
    supplier TEXT,
    warranty_expiry TEXT,
    assigned_to TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT '',
    updated_at TEXT
  );
  CREATE TABLE IF NOT EXISTS asset_maintenance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER REFERENCES assets(id),
    school_id INTEGER REFERENCES schools(id),
    maintenance_type TEXT NOT NULL,
    description TEXT,
    cost TEXT,
    performed_by TEXT,
    performed_date TEXT,
    next_due_date TEXT,
    created_at TEXT NOT NULL DEFAULT ''
  );
`);

export class DatabaseStorage {
  now() { return new Date().toISOString(); }

  // ── Schools ──
  getSchool(id: number): School | undefined {
    return db.select().from(schools).where(eq(schools.id, id)).get();
  }
  getSchoolByCode(code: string): School | undefined {
    return db.select().from(schools).where(eq(schools.code, code)).get();
  }
  createSchool(data: InsertSchool): School {
    return db.insert(schools).values({ ...data, createdAt: this.now() }).returning().get();
  }
  updateSchool(id: number, data: Partial<InsertSchool>): School | undefined {
    return db.update(schools).set(data).where(eq(schools.id, id)).returning().get();
  }

  // ── Users ──
  getUser(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }
  getUserByUsername(username: string): User | undefined {
    return db.select().from(users).where(eq(users.username, username)).get();
  }
  getUsersBySchool(schoolId: number): User[] {
    return db.select().from(users).where(eq(users.schoolId, schoolId)).all();
  }
  createUser(data: InsertUser): User {
    return db.insert(users).values({ ...data, createdAt: this.now() }).returning().get();
  }
  updateUser(id: number, data: Partial<InsertUser>): User | undefined {
    return db.update(users).set(data).where(eq(users.id, id)).returning().get();
  }
  deleteUser(id: number) {
    return db.delete(users).where(eq(users.id, id)).run();
  }

  // ── Students ──
  getStudentsBySchool(schoolId: number): Student[] {
    return db.select().from(students).where(eq(students.schoolId, schoolId)).all();
  }
  getStudent(id: number): Student | undefined {
    return db.select().from(students).where(eq(students.id, id)).get();
  }
  createStudent(data: InsertStudent): Student {
    return db.insert(students).values({ ...data, createdAt: this.now() }).returning().get();
  }
  updateStudent(id: number, data: Partial<InsertStudent>): Student | undefined {
    return db.update(students).set(data).where(eq(students.id, id)).returning().get();
  }
  deleteStudent(id: number) {
    return db.delete(students).where(eq(students.id, id)).run();
  }

  // ── Guardians ──
  getGuardiansByStudent(studentId: number): Guardian[] {
    return db.select().from(guardians).where(eq(guardians.studentId, studentId)).all();
  }
  createGuardian(data: InsertGuardian): Guardian {
    return db.insert(guardians).values({ ...data, createdAt: this.now() }).returning().get();
  }
  updateGuardian(id: number, data: Partial<InsertGuardian>): Guardian | undefined {
    return db.update(guardians).set(data).where(eq(guardians.id, id)).returning().get();
  }
  deleteGuardian(id: number) {
    return db.delete(guardians).where(eq(guardians.id, id)).run();
  }

  // ── Class History ──
  getClassHistoryByStudent(studentId: number): ClassHistory[] {
    return db.select().from(classHistory).where(eq(classHistory.studentId, studentId)).orderBy(desc(classHistory.session)).all();
  }
  createClassHistory(data: InsertClassHistory): ClassHistory {
    return db.insert(classHistory).values({ ...data, createdAt: this.now() }).returning().get();
  }
  deleteClassHistory(id: number) {
    return db.delete(classHistory).where(eq(classHistory.id, id)).run();
  }

  // ── Attendance ──
  getAttendanceByDate(schoolId: number, date: string): Attendance[] {
    return db.select().from(attendance).where(and(eq(attendance.schoolId, schoolId), eq(attendance.date, date))).all();
  }
  createAttendance(data: InsertAttendance): Attendance {
    return db.insert(attendance).values({ ...data, createdAt: this.now() }).returning().get();
  }
  createManyAttendance(records: InsertAttendance[]) {
    for (const rec of records) {
      db.insert(attendance).values({ ...rec, createdAt: this.now() }).run();
    }
  }
  getAttendanceStats(schoolId: number): { total: number; present: number; absent: number; late: number } {
    const rows = db.select({ status: attendance.status, count: sql<number>`count(*)` }).from(attendance).where(eq(attendance.schoolId, schoolId)).groupBy(attendance.status).all();
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
  getVisitsBySchool(schoolId: number): SchoolVisit[] {
    return db.select().from(schoolVisits).where(eq(schoolVisits.schoolId, schoolId)).orderBy(desc(schoolVisits.id)).all();
  }
  createVisit(data: InsertSchoolVisit): SchoolVisit {
    return db.insert(schoolVisits).values({ ...data, createdAt: this.now() }).returning().get();
  }
  updateVisit(id: number, data: Partial<InsertSchoolVisit>): SchoolVisit | undefined {
    return db.update(schoolVisits).set(data).where(eq(schoolVisits.id, id)).returning().get();
  }

  // ── Subjects ──
  getSubjectsBySchool(schoolId: number): Subject[] {
    return db.select().from(subjects).where(eq(subjects.schoolId, schoolId)).all();
  }
  createSubject(data: InsertSubject): Subject {
    return db.insert(subjects).values({ ...data, createdAt: this.now() }).returning().get();
  }
  deleteSubject(id: number) {
    return db.delete(subjects).where(eq(subjects.id, id)).run();
  }

  // ── Classes ──
  getClassesBySchool(schoolId: number): Class[] {
    return db.select().from(classes).where(eq(classes.schoolId, schoolId)).all();
  }
  createClass(data: InsertClass): Class {
    return db.insert(classes).values({ ...data, createdAt: this.now() }).returning().get();
  }
  deleteClass(id: number) {
    return db.delete(classes).where(eq(classes.id, id)).run();
  }

  // ── Timetable ──
  getTimetableBySchool(schoolId: number): TimetableSlot[] {
    return db.select().from(timetableSlots).where(eq(timetableSlots.schoolId, schoolId)).all();
  }
  getTimetableByClass(schoolId: number, classId: number): TimetableSlot[] {
    return db.select().from(timetableSlots).where(and(eq(timetableSlots.schoolId, schoolId), eq(timetableSlots.classId, classId))).all();
  }
  createTimetableSlot(data: InsertTimetableSlot): TimetableSlot {
    return db.insert(timetableSlots).values({ ...data, createdAt: this.now() }).returning().get();
  }
  deleteTimetableBySchool(schoolId: number) {
    return db.delete(timetableSlots).where(eq(timetableSlots.schoolId, schoolId)).run();
  }

  // ── Feedback Categories ──
  getFeedbackCategoriesBySchool(schoolId: number): FeedbackCategory[] {
    return db.select().from(feedbackCategories).where(eq(feedbackCategories.schoolId, schoolId)).all();
  }
  createFeedbackCategory(data: InsertFeedbackCategory): FeedbackCategory {
    return db.insert(feedbackCategories).values({ ...data, createdAt: this.now() }).returning().get();
  }

  // ── Feedbacks ──
  getFeedbacksBySchool(schoolId: number): Feedback[] {
    return db.select().from(feedbacks).where(eq(feedbacks.schoolId, schoolId)).orderBy(desc(feedbacks.id)).all();
  }
  getFeedbackByCode(code: string): Feedback | undefined {
    return db.select().from(feedbacks).where(eq(feedbacks.trackingCode, code)).get();
  }
  createFeedback(data: InsertFeedback): Feedback {
    return db.insert(feedbacks).values({ ...data, createdAt: this.now() }).returning().get();
  }
  updateFeedback(id: number, data: Partial<InsertFeedback>): Feedback | undefined {
    return db.update(feedbacks).set(data).where(eq(feedbacks.id, id)).returning().get();
  }

  // ── Announcements ──
  getAnnouncementsBySchool(schoolId: number): Announcement[] {
    return db.select().from(announcements).where(eq(announcements.schoolId, schoolId)).orderBy(desc(announcements.id)).all();
  }
  createAnnouncement(data: InsertAnnouncement): Announcement {
    return db.insert(announcements).values({ ...data, createdAt: this.now() }).returning().get();
  }

  // ── Messages ──
  getInbox(userId: number): Message[] {
    return db.select().from(messages).where(eq(messages.receiverId, userId)).orderBy(desc(messages.id)).all();
  }
  getSent(userId: number): Message[] {
    return db.select().from(messages).where(eq(messages.senderId, userId)).orderBy(desc(messages.id)).all();
  }
  createMessage(data: InsertMessage): Message {
    return db.insert(messages).values({ ...data, createdAt: this.now() }).returning().get();
  }
  markMessageRead(id: number) {
    return db.update(messages).set({ isRead: true }).where(eq(messages.id, id)).run();
  }

  // ── Events ──
  getEventsBySchool(schoolId: number): Event[] {
    return db.select().from(events).where(eq(events.schoolId, schoolId)).orderBy(desc(events.id)).all();
  }
  createEvent(data: InsertEvent): Event {
    return db.insert(events).values({ ...data, createdAt: this.now() }).returning().get();
  }

  // ── Asset Categories ──
  getAssetCategoriesBySchool(schoolId: number): AssetCategory[] {
    return db.select().from(assetCategories).where(eq(assetCategories.schoolId, schoolId)).all();
  }
  createAssetCategory(data: InsertAssetCategory): AssetCategory {
    return db.insert(assetCategories).values({ ...data, createdAt: this.now() }).returning().get();
  }

  // ── Assets ──
  getAssetsBySchool(schoolId: number): Asset[] {
    return db.select().from(assets).where(eq(assets.schoolId, schoolId)).orderBy(desc(assets.id)).all();
  }
  getAsset(id: number): Asset | undefined {
    return db.select().from(assets).where(eq(assets.id, id)).get();
  }
  createAsset(data: InsertAsset): Asset {
    return db.insert(assets).values({ ...data, createdAt: this.now() }).returning().get();
  }
  updateAsset(id: number, data: Partial<InsertAsset>): Asset | undefined {
    return db.update(assets).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(assets.id, id)).returning().get();
  }
  deleteAsset(id: number) {
    return db.delete(assets).where(eq(assets.id, id)).run();
  }

  // ── Maintenance Logs ──
  getMaintenanceBySchool(schoolId: number): MaintenanceLog[] {
    return db.select().from(assetMaintenanceLogs).where(eq(assetMaintenanceLogs.schoolId, schoolId)).orderBy(desc(assetMaintenanceLogs.id)).all();
  }
  createMaintenanceLog(data: InsertMaintenanceLog): MaintenanceLog {
    return db.insert(assetMaintenanceLogs).values({ ...data, createdAt: this.now() }).returning().get();
  }

  // ── Dashboard Stats ──
  getDashboardStats(schoolId: number) {
    const studentCount = db.select({ count: sql<number>`count(*)` }).from(students).where(and(eq(students.schoolId, schoolId), eq(students.isActive, true))).get()?.count || 0;
    const teacherCount = db.select({ count: sql<number>`count(*)` }).from(users).where(and(eq(users.schoolId, schoolId), eq(users.role, "teacher"))).get()?.count || 0;
    const feedbackCount = db.select({ count: sql<number>`count(*)` }).from(feedbacks).where(and(eq(feedbacks.schoolId, schoolId), eq(feedbacks.status, "new"))).get()?.count || 0;
    const assetCount = db.select({ count: sql<number>`count(*)` }).from(assets).where(eq(assets.schoolId, schoolId)).get()?.count || 0;
    const announcementCount = db.select({ count: sql<number>`count(*)` }).from(announcements).where(eq(announcements.schoolId, schoolId)).get()?.count || 0;
    const eventCount = db.select({ count: sql<number>`count(*)` }).from(events).where(eq(events.schoolId, schoolId)).get()?.count || 0;
    return { studentCount: Number(studentCount), teacherCount: Number(teacherCount), feedbackCount: Number(feedbackCount), assetCount: Number(assetCount), announcementCount: Number(announcementCount), eventCount: Number(eventCount) };
  }
}

export const storage = new DatabaseStorage();
