import { pgTable, text, integer, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Core Tables ──

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  address: text("address"),
  state: text("state"),
  lga: text("lga"),
  phone: text("phone"),
  email: text("email"),
  subscriptionPlan: text("subscription_plan").notNull().default("trial"),
  subscriptionStatus: text("subscription_status").notNull().default("trial"),
  trialEndsAt: text("trial_ends_at"),
  maxStudents: integer("max_students").notNull().default(50),
  maxTeachers: integer("max_teachers").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("teacher"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── EduTrack ──

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  admissionNumber: text("admission_number").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  middleName: text("middle_name"),
  gender: text("gender").notNull(),
  dateOfBirth: text("date_of_birth"),
  classLevel: text("class_level").notNull(),
  section: text("section"),
  parentPhone: text("parent_phone"),
  parentEmail: text("parent_email"),
  address: text("address"),
  bloodGroup: text("blood_group"),
  genotype: text("genotype"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  studentId: integer("student_id").references(() => students.id),
  date: text("date").notNull(),
  status: text("status").notNull().default("present"),
  markedBy: integer("marked_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const schoolVisits = pgTable("school_visits", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  visitorName: text("visitor_name").notNull(),
  visitorPhone: text("visitor_phone"),
  purpose: text("purpose").notNull(),
  personVisited: text("person_visited"),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const guardians = pgTable("guardians", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  relationship: text("relationship").notNull(),
  occupation: text("occupation"),
  address: text("address"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classHistory = pgTable("class_history", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  className: text("class_name").notNull(),
  session: text("session").notNull(),
  result: text("result").notNull(),
  position: text("position"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── TimeGrid ──

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  name: text("name").notNull(),
  code: text("code"),
  colorCode: text("color_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  name: text("name").notNull(),
  level: text("level"),
  section: text("section"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teacherSubjects = pgTable("teacher_subjects", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  teacherId: integer("teacher_id").references(() => users.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  classId: integer("class_id").references(() => classes.id),
});

export const timetableSlots = pgTable("timetable_slots", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  classId: integer("class_id").references(() => classes.id),
  subjectId: integer("subject_id").references(() => subjects.id),
  teacherId: integer("teacher_id").references(() => users.id),
  dayOfWeek: integer("day_of_week").notNull(),
  period: integer("period").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  room: text("room"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── VoicelessBox ──

export const feedbackCategories = pgTable("feedback_categories", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  trackingCode: text("tracking_code").notNull().unique(),
  categoryId: integer("category_id").references(() => feedbackCategories.id),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  priority: text("priority").notNull().default("medium"),
  isAnonymous: boolean("is_anonymous").notNull().default(true),
  submittedBy: text("submitted_by"),
  adminResponse: text("admin_response"),
  respondedBy: integer("responded_by").references(() => users.id),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Parents Connect ──

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  targetAudience: text("target_audience").notNull().default("all"),
  targetClass: text("target_class"),
  priority: text("priority").notNull().default("normal"),
  publishedBy: integer("published_by").references(() => users.id),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: text("event_date").notNull(),
  eventTime: text("event_time"),
  location: text("location"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Asset Register ──

export const assetCategories = pgTable("asset_categories", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").references(() => schools.id),
  assetTag: text("asset_tag").notNull(),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => assetCategories.id),
  description: text("description"),
  location: text("location"),
  condition: text("condition").notNull().default("good"),
  purchaseDate: text("purchase_date"),
  purchasePrice: text("purchase_price"),
  currentValue: text("current_value"),
  supplier: text("supplier"),
  warrantyExpiry: text("warranty_expiry"),
  assignedTo: text("assigned_to"),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const assetMaintenanceLogs = pgTable("asset_maintenance_logs", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id),
  schoolId: integer("school_id").references(() => schools.id),
  maintenanceType: text("maintenance_type").notNull(),
  description: text("description"),
  cost: text("cost"),
  performedBy: text("performed_by"),
  performedDate: text("performed_date"),
  nextDueDate: text("next_due_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Insert Schemas ──

export const insertSchoolSchema = createInsertSchema(schools).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, createdAt: true });
export const insertGuardianSchema = createInsertSchema(guardians).omit({ id: true, createdAt: true });
export const insertClassHistorySchema = createInsertSchema(classHistory).omit({ id: true, createdAt: true });
export const insertSchoolVisitSchema = createInsertSchema(schoolVisits).omit({ id: true, createdAt: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, createdAt: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true, createdAt: true });
export const insertTeacherSubjectSchema = createInsertSchema(teacherSubjects).omit({ id: true });
export const insertTimetableSlotSchema = createInsertSchema(timetableSlots).omit({ id: true, createdAt: true });
export const insertFeedbackCategorySchema = createInsertSchema(feedbackCategories).omit({ id: true, createdAt: true });
export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertAssetCategorySchema = createInsertSchema(assetCategories).omit({ id: true, createdAt: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true });
export const insertMaintenanceLogSchema = createInsertSchema(assetMaintenanceLogs).omit({ id: true, createdAt: true });

// ── Types ──

export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Guardian = typeof guardians.$inferSelect;
export type InsertGuardian = z.infer<typeof insertGuardianSchema>;
export type ClassHistory = typeof classHistory.$inferSelect;
export type InsertClassHistory = z.infer<typeof insertClassHistorySchema>;
export type SchoolVisit = typeof schoolVisits.$inferSelect;
export type InsertSchoolVisit = z.infer<typeof insertSchoolVisitSchema>;
export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type TeacherSubject = typeof teacherSubjects.$inferSelect;
export type InsertTeacherSubject = z.infer<typeof insertTeacherSubjectSchema>;
export type TimetableSlot = typeof timetableSlots.$inferSelect;
export type InsertTimetableSlot = z.infer<typeof insertTimetableSlotSchema>;
export type FeedbackCategory = typeof feedbackCategories.$inferSelect;
export type InsertFeedbackCategory = z.infer<typeof insertFeedbackCategorySchema>;
export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type AssetCategory = typeof assetCategories.$inferSelect;
export type InsertAssetCategory = z.infer<typeof insertAssetCategorySchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type MaintenanceLog = typeof assetMaintenanceLogs.$inferSelect;
export type InsertMaintenanceLog = z.infer<typeof insertMaintenanceLogSchema>;
