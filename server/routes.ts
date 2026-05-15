import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";

const SessionStore = MemoryStore(session);

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === computed;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user as any;
    if (!roles.includes(user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Session
  const isProd = process.env.NODE_ENV === "production";
  app.use(session({
    secret: process.env.SESSION_SECRET || "harmony-school-suite-secret-key-2026",
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({ checkPeriod: 86400000 }),
    proxy: true,
    cookie: {
      maxAge: 86400000,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      httpOnly: true,
    },
  }));

  // Passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await storage.getUserByUsername(username);
    if (!user) return done(null, false, { message: "Invalid credentials" });
    if (!verifyPassword(password, user.password)) return done(null, false, { message: "Invalid credentials" });
    if (!user.isActive) return done(null, false, { message: "Account disabled" });
    return done(null, user);
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user || null);
  });

  // ── Auth Routes ──
  app.post("/api/auth/login", async (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Invalid credentials" });
      req.logIn(user, async (err) => {
        if (err) return next(err);
        await storage.updateUser(user.id, { lastLogin: new Date() } as any);
        const { password, ...safe } = user;
        res.json(safe);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.logout(() => res.json({ ok: true }));
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as any;
    const { password, ...safe } = user;
    const school = user.schoolId ? await storage.getSchool(user.schoolId) : null;
    res.json({ ...safe, school });
  });

  // ── Demo Seed ──
  app.post("/api/school/demo", async (_req, res) => {
    const existing = await storage.getSchoolByCode("DEMO-INCUSA");
    if (existing) {
      const admin = await storage.getUserByUsername("admin");
      if (admin) {
        const { password, ...safe } = admin;
        return res.json({ message: "Demo already loaded", user: safe, school: existing });
      }
    }
    const school = await storage.createSchool({
      name: "The Incubators Secondary Academy",
      code: "DEMO-INCUSA",
      address: "Ufuma, Anambra State",
      state: "Anambra",
      lga: "Orumba North",
      phone: "08012345678",
      email: "info@incusa.edu.ng",
      subscriptionPlan: "premium",
      subscriptionStatus: "active",
      maxStudents: 500,
      maxTeachers: 50,
    });
    const sid = school.id;

    // Users
    const adminUser = await storage.createUser({ schoolId: sid, username: "admin", password: hashPassword("admin123"), email: "admin@incusa.edu.ng", fullName: "Admin User", role: "school_admin" });
    await storage.createUser({ schoolId: sid, username: "teacher", password: hashPassword("teacher123"), email: "teacher@incusa.edu.ng", fullName: "Mrs. Okafor", role: "teacher" });
    await storage.createUser({ schoolId: sid, username: "parent", password: hashPassword("parent123"), email: "parent@incusa.edu.ng", fullName: "Mr. Nwosu", role: "parent" });

    // Classes
    const classNames = ["JSS1A", "JSS2A", "JSS3A", "SS1A", "SS2A", "SS3A"];
    const classMap: Record<string, number> = {};
    for (const cn of classNames) {
      const c = await storage.createClass({ schoolId: sid, name: cn, level: cn.substring(0, 3), section: "A" });
      classMap[cn] = c.id;
    }

    // Subjects
    const subjectData = [
      { name: "Mathematics", code: "MTH", colorCode: "#3b82f6" },
      { name: "English Language", code: "ENG", colorCode: "#10b981" },
      { name: "Physics", code: "PHY", colorCode: "#f59e0b" },
      { name: "Chemistry", code: "CHM", colorCode: "#ef4444" },
      { name: "Biology", code: "BIO", colorCode: "#8b5cf6" },
      { name: "Economics", code: "ECO", colorCode: "#06b6d4" },
      { name: "Government", code: "GOV", colorCode: "#ec4899" },
      { name: "Literature", code: "LIT", colorCode: "#84cc16" },
      { name: "CRK", code: "CRK", colorCode: "#f97316" },
      { name: "Agricultural Science", code: "AGR", colorCode: "#14b8a6" },
      { name: "Computer Science", code: "CSC", colorCode: "#6366f1" },
      { name: "Civic Education", code: "CIV", colorCode: "#a855f7" },
    ];
    const subjectMap: Record<string, number> = {};
    for (const s of subjectData) {
      const sub = await storage.createSubject({ schoolId: sid, name: s.name, code: s.code, colorCode: s.colorCode });
      subjectMap[s.code] = sub.id;
    }

    // Students
    const firstNames = ["Chukwuemeka", "Adaeze", "Obioma", "Ifeanyi", "Nneka", "Chidera", "Ugochukwu", "Nkechi", "Emeka", "Oluchi",
      "Kelechi", "Amara", "Obinna", "Chiamaka", "Ikenna", "Uju", "Tochukwu", "Chisom", "Eze", "Ngozi",
      "Kenechukwu", "Ifeoma", "Chinedu", "Chinaza", "Nnamdi", "Somto", "Obi", "Ada", "Uche", "Ebere"];
    const lastNames = ["Okafor", "Nwosu", "Eze", "Okoro", "Nwachukwu", "Agu", "Onuoha", "Igwe", "Obi", "Nwankwo",
      "Chukwu", "Ezekiel", "Akabueze", "Nwoye", "Okeke", "Nnadi", "Ogbonna", "Umeh", "Ezeji", "Anyanwu",
      "Mbah", "Okoli", "Nwodo", "Okonkwo", "Ibe", "Dimgba", "Maduka", "Chidozie", "Onu", "Nwafor"];
    const genders = ["Male", "Female"];
    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    const genotypes = ["AA", "AS", "SS", "AC"];
    const classLevels = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

    for (let i = 0; i < 30; i++) {
      const cl = classLevels[i % 6];
      await storage.createStudent({
        schoolId: sid,
        admissionNumber: `INCUSA/${2024}/${String(i + 1).padStart(3, "0")}`,
        firstName: firstNames[i],
        lastName: lastNames[i],
        gender: genders[i % 2],
        classLevel: cl,
        section: "A",
        parentPhone: `0801${String(1000000 + i)}`,
        bloodGroup: bloodGroups[i % 8],
        genotype: genotypes[i % 4],
        isActive: true,
      });
    }

    // Attendance for last 3 days
    const allStudents = await storage.getStudentsBySchool(sid);
    for (let d = 0; d < 3; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().split("T")[0];
      for (const s of allStudents.slice(0, 15)) {
        await storage.createAttendance({
          schoolId: sid, studentId: s.id, date: dateStr,
          status: Math.random() > 0.15 ? "present" : "absent",
          markedBy: adminUser.id,
        });
      }
    }

    // Visits
    await storage.createVisit({ schoolId: sid, visitorName: "Mrs. Adaeze Okafor", visitorPhone: "08034567890", purpose: "PTA Meeting", personVisited: "Principal", checkIn: new Date().toISOString() });
    await storage.createVisit({ schoolId: sid, visitorName: "Mr. Samuel Ibe", visitorPhone: "08098765432", purpose: "Student Pickup", personVisited: "Class Teacher JSS2", checkIn: new Date().toISOString(), checkOut: new Date().toISOString() });

    // Feedback categories
    const fbCats = ["Academic", "Facilities", "Safety", "General", "Staff"];
    const fbCatMap: Record<string, number> = {};
    for (const fc of fbCats) {
      const cat = await storage.createFeedbackCategory({ schoolId: sid, name: fc, description: `${fc} related feedback` });
      fbCatMap[fc] = cat.id;
    }

    // Feedbacks
    const feedbackData = [
      { cat: "Academic", msg: "More practical sessions for Physics and Chemistry please", status: "new", priority: "high" },
      { cat: "Facilities", msg: "The library needs more current textbooks", status: "reviewing", priority: "medium" },
      { cat: "Safety", msg: "The staircase railing on the second floor is loose", status: "new", priority: "high" },
      { cat: "General", msg: "Can we have more extracurricular activities?", status: "resolved", priority: "low" },
      { cat: "Staff", msg: "The new Computer Science teacher is excellent!", status: "resolved", priority: "low" },
    ];
    for (let i = 0; i < feedbackData.length; i++) {
      const fd = feedbackData[i];
      await storage.createFeedback({
        schoolId: sid,
        trackingCode: `VB-${String(1000 + i)}`,
        categoryId: fbCatMap[fd.cat],
        message: fd.msg,
        status: fd.status,
        priority: fd.priority,
        isAnonymous: true,
      });
    }

    // Announcements
    await storage.createAnnouncement({ schoolId: sid, title: "Welcome Back - Second Term 2026", content: "We welcome all students back for the second term. Classes resume Monday.", targetAudience: "all", priority: "important", publishedBy: adminUser.id, isPublished: true });
    await storage.createAnnouncement({ schoolId: sid, title: "PTA Meeting Notice", content: "PTA meeting scheduled for Friday. All parents are expected to attend.", targetAudience: "all", priority: "normal", publishedBy: adminUser.id, isPublished: true });
    await storage.createAnnouncement({ schoolId: sid, title: "Inter-House Sports", content: "Annual inter-house sports competition will hold next month. Students should prepare.", targetAudience: "all", priority: "normal", publishedBy: adminUser.id, isPublished: true });

    // Events
    await storage.createEvent({ schoolId: sid, title: "PTA Meeting", description: "General PTA meeting for all parents", eventDate: "2026-04-10", eventTime: "10:00", location: "School Hall", createdBy: adminUser.id });
    await storage.createEvent({ schoolId: sid, title: "Inter-House Sports", description: "Annual inter-house sports competition", eventDate: "2026-04-25", eventTime: "08:00", location: "School Field", createdBy: adminUser.id });
    await storage.createEvent({ schoolId: sid, title: "Science Fair", description: "Exhibition of student science projects", eventDate: "2026-05-15", eventTime: "09:00", location: "Science Lab", createdBy: adminUser.id });
    await storage.createEvent({ schoolId: sid, title: "Cultural Day", description: "Celebration of Nigerian cultural diversity", eventDate: "2026-05-28", eventTime: "10:00", location: "School Hall", createdBy: adminUser.id });
    await storage.createEvent({ schoolId: sid, title: "Graduation Ceremony", description: "SS3 graduation ceremony", eventDate: "2026-07-15", eventTime: "11:00", location: "School Hall", createdBy: adminUser.id });

    // Asset categories
    const assetCats = ["Furniture", "Electronics", "Lab Equipment", "Vehicles", "Books"];
    const assetCatMap: Record<string, number> = {};
    for (const ac of assetCats) {
      const cat = await storage.createAssetCategory({ schoolId: sid, name: ac, description: `${ac} assets` });
      assetCatMap[ac] = cat.id;
    }

    // Assets
    const assetData = [
      { tag: "FUR-001", name: "Student Desks (Batch A)", cat: "Furniture", loc: "JSS1A Classroom", cond: "good", price: "450000", qty: "30" },
      { tag: "FUR-002", name: "Teacher Chairs", cat: "Furniture", loc: "Staff Room", cond: "good", price: "180000", qty: "15" },
      { tag: "FUR-003", name: "Whiteboards", cat: "Furniture", loc: "All Classrooms", cond: "excellent", price: "120000" },
      { tag: "ELE-001", name: "Desktop Computers", cat: "Electronics", loc: "ICT Lab", cond: "good", price: "2400000" },
      { tag: "ELE-002", name: "Projector", cat: "Electronics", loc: "Conference Room", cond: "excellent", price: "350000" },
      { tag: "ELE-003", name: "Printers", cat: "Electronics", loc: "Admin Office", cond: "fair", price: "180000" },
      { tag: "ELE-004", name: "PA System", cat: "Electronics", loc: "School Hall", cond: "good", price: "280000" },
      { tag: "LAB-001", name: "Microscopes", cat: "Lab Equipment", loc: "Biology Lab", cond: "excellent", price: "600000" },
      { tag: "LAB-002", name: "Chemical Reagents Set", cat: "Lab Equipment", loc: "Chemistry Lab", cond: "good", price: "150000" },
      { tag: "LAB-003", name: "Physics Apparatus Kit", cat: "Lab Equipment", loc: "Physics Lab", cond: "good", price: "420000" },
      { tag: "VEH-001", name: "School Bus (Toyota Coaster)", cat: "Vehicles", loc: "Parking Lot", cond: "good", price: "18000000" },
      { tag: "VEH-002", name: "Staff Car (Toyota Corolla)", cat: "Vehicles", loc: "Parking Lot", cond: "fair", price: "8500000" },
      { tag: "BKS-001", name: "Library Textbooks", cat: "Books", loc: "Library", cond: "good", price: "750000" },
      { tag: "BKS-002", name: "Reference Materials", cat: "Books", loc: "Library", cond: "good", price: "320000" },
      { tag: "FUR-004", name: "Laboratory Stools", cat: "Furniture", loc: "Science Labs", cond: "fair", price: "200000" },
      { tag: "ELE-005", name: "CCTV Cameras", cat: "Electronics", loc: "School Compound", cond: "excellent", price: "450000" },
      { tag: "FUR-005", name: "Bookshelf Units", cat: "Furniture", loc: "Library", cond: "good", price: "280000" },
      { tag: "ELE-006", name: "Generator (50KVA)", cat: "Electronics", loc: "Generator House", cond: "good", price: "3500000" },
      { tag: "LAB-004", name: "Computer Networking Kit", cat: "Lab Equipment", loc: "ICT Lab", cond: "excellent", price: "380000" },
      { tag: "FUR-006", name: "Administrative Desk Set", cat: "Furniture", loc: "Admin Block", cond: "excellent", price: "350000" },
    ];
    const createdAssets: number[] = [];
    for (const a of assetData) {
      const asset = await storage.createAsset({
        schoolId: sid, assetTag: a.tag, name: a.name, categoryId: assetCatMap[a.cat],
        location: a.loc, condition: a.cond, purchasePrice: a.price, status: "active",
      });
      createdAssets.push(asset.id);
    }

    // Maintenance logs
    await storage.createMaintenanceLog({ assetId: createdAssets[3], schoolId: sid, maintenanceType: "Repair", description: "Replaced faulty hard drives on 5 systems", cost: "75000", performedBy: "TechVille Solutions", performedDate: "2026-03-01", nextDueDate: "2026-09-01" });
    await storage.createMaintenanceLog({ assetId: createdAssets[10], schoolId: sid, maintenanceType: "Servicing", description: "Full engine service and oil change", cost: "120000", performedBy: "AutoCare Nigeria", performedDate: "2026-02-15", nextDueDate: "2026-08-15" });
    await storage.createMaintenanceLog({ assetId: createdAssets[5], schoolId: sid, maintenanceType: "Repair", description: "Replaced toner cartridges", cost: "25000", performedBy: "PrintHub", performedDate: "2026-03-20" });

    // Timetable slots (sample for JSS1A)
    const jss1Id = classMap["JSS1A"];
    const periods = [
      { day: 1, period: 1, sub: "MTH", start: "08:00", end: "08:40" },
      { day: 1, period: 2, sub: "ENG", start: "08:40", end: "09:20" },
      { day: 1, period: 3, sub: "PHY", start: "09:30", end: "10:10" },
      { day: 1, period: 4, sub: "BIO", start: "10:10", end: "10:50" },
      { day: 2, period: 1, sub: "ENG", start: "08:00", end: "08:40" },
      { day: 2, period: 2, sub: "MTH", start: "08:40", end: "09:20" },
      { day: 2, period: 3, sub: "CHM", start: "09:30", end: "10:10" },
      { day: 2, period: 4, sub: "CSC", start: "10:10", end: "10:50" },
      { day: 3, period: 1, sub: "GOV", start: "08:00", end: "08:40" },
      { day: 3, period: 2, sub: "ECO", start: "08:40", end: "09:20" },
      { day: 3, period: 3, sub: "MTH", start: "09:30", end: "10:10" },
      { day: 3, period: 4, sub: "ENG", start: "10:10", end: "10:50" },
      { day: 4, period: 1, sub: "CRK", start: "08:00", end: "08:40" },
      { day: 4, period: 2, sub: "AGR", start: "08:40", end: "09:20" },
      { day: 4, period: 3, sub: "CIV", start: "09:30", end: "10:10" },
      { day: 4, period: 4, sub: "LIT", start: "10:10", end: "10:50" },
      { day: 5, period: 1, sub: "PHY", start: "08:00", end: "08:40" },
      { day: 5, period: 2, sub: "CHM", start: "08:40", end: "09:20" },
      { day: 5, period: 3, sub: "CSC", start: "09:30", end: "10:10" },
      { day: 5, period: 4, sub: "MTH", start: "10:10", end: "10:50" },
    ];
    for (const p of periods) {
      await storage.createTimetableSlot({
        schoolId: sid, classId: jss1Id, subjectId: subjectMap[p.sub],
        dayOfWeek: p.day, period: p.period, startTime: p.start, endTime: p.end, room: "Room 1",
      });
    }

    const { password, ...safe } = adminUser;
    res.json({ message: "Demo data loaded", user: safe, school });
  });

  // ── School Routes ──
  app.get("/api/school", requireAuth, async (req, res) => {
    const user = req.user as any;
    if (!user.schoolId) return res.json(null);
    res.json(await storage.getSchool(user.schoolId));
  });

  app.patch("/api/school", requireRole("school_admin", "super_admin"), async (req, res) => {
    const user = req.user as any;
    const updated = await storage.updateSchool(user.schoolId, req.body);
    res.json(updated);
  });

  // ── User Management ──
  app.get("/api/users", requireAuth, async (req, res) => {
    const user = req.user as any;
    const allUsers = await storage.getUsersBySchool(user.schoolId);
    res.json(allUsers.map(u => { const { password, ...s } = u; return s; }));
  });

  app.post("/api/users", requireRole("school_admin", "super_admin"), async (req, res) => {
    const user = req.user as any;
    const { password, ...rest } = req.body;
    const newUser = await storage.createUser({ ...rest, schoolId: user.schoolId, password: hashPassword(password || "password123") });
    const { password: _, ...safe } = newUser;
    res.json(safe);
  });

  app.patch("/api/users/:id", requireRole("school_admin", "super_admin"), async (req, res) => {
    const data = { ...req.body };
    if (data.password) data.password = hashPassword(data.password);
    const updated = await storage.updateUser(Number(req.params.id), data);
    if (!updated) return res.status(404).json({ message: "User not found" });
    const { password, ...safe } = updated;
    res.json(safe);
  });

  app.delete("/api/users/:id", requireRole("school_admin", "super_admin"), async (req, res) => {
    await storage.deleteUser(Number(req.params.id));
    res.json({ ok: true });
  });

  // ── Dashboard ──
  app.get("/api/dashboard", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getDashboardStats(user.schoolId));
  });

  // ── EduTrack: Students ──
  app.get("/api/students", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getStudentsBySchool(user.schoolId));
  });
  app.post("/api/students", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createStudent({ ...req.body, schoolId: user.schoolId }));
  });
  app.patch("/api/students/:id", requireAuth, async (req, res) => {
    const updated = await storage.updateStudent(Number(req.params.id), req.body);
    res.json(updated);
  });
  app.delete("/api/students/:id", requireAuth, async (req, res) => {
    await storage.deleteStudent(Number(req.params.id));
    res.json({ ok: true });
  });
  app.get("/api/students/:id", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const student = await storage.getStudent(id);
    if (!student) return res.status(404).json({ error: "Not found" });
    res.json({
      ...student,
      guardians: await storage.getGuardiansByStudent(id),
      classHistory: await storage.getClassHistoryByStudent(id),
    });
  });

  // ── Student Records: Guardians ──
  app.get("/api/students/:id/guardians", requireAuth, async (req, res) => {
    res.json(await storage.getGuardiansByStudent(Number(req.params.id)));
  });
  app.post("/api/students/:id/guardians", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createGuardian({ ...req.body, studentId: Number(req.params.id), schoolId: user.schoolId }));
  });
  app.delete("/api/guardians/:id", requireAuth, async (req, res) => {
    await storage.deleteGuardian(Number(req.params.id));
    res.json({ ok: true });
  });

  // ── Student Records: Class History ──
  app.get("/api/students/:id/history", requireAuth, async (req, res) => {
    res.json(await storage.getClassHistoryByStudent(Number(req.params.id)));
  });
  app.post("/api/students/:id/history", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createClassHistory({ ...req.body, studentId: Number(req.params.id), schoolId: user.schoolId }));
  });
  app.delete("/api/history/:id", requireAuth, async (req, res) => {
    await storage.deleteClassHistory(Number(req.params.id));
    res.json({ ok: true });
  });

  // ── EduTrack: Attendance ──
  app.get("/api/attendance", requireAuth, async (req, res) => {
    const user = req.user as any;
    const date = (req.query.date as string) || new Date().toISOString().split("T")[0];
    res.json(await storage.getAttendanceByDate(user.schoolId, date));
  });
  app.post("/api/attendance", requireAuth, async (req, res) => {
    const user = req.user as any;
    const records = req.body.records;
    if (Array.isArray(records)) {
      await storage.createManyAttendance(records.map((r: any) => ({ ...r, schoolId: user.schoolId, markedBy: user.id })));
      return res.json({ ok: true });
    }
    res.json(await storage.createAttendance({ ...req.body, schoolId: user.schoolId, markedBy: user.id }));
  });

  // ── EduTrack: Visits ──
  app.get("/api/visits", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getVisitsBySchool(user.schoolId));
  });
  app.post("/api/visits", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createVisit({ ...req.body, schoolId: user.schoolId }));
  });
  app.patch("/api/visits/:id", requireAuth, async (req, res) => {
    const updated = await storage.updateVisit(Number(req.params.id), req.body);
    res.json(updated);
  });

  // ── TimeGrid: Subjects ──
  app.get("/api/subjects", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getSubjectsBySchool(user.schoolId));
  });
  app.post("/api/subjects", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createSubject({ ...req.body, schoolId: user.schoolId }));
  });
  app.delete("/api/subjects/:id", requireAuth, async (req, res) => {
    await storage.deleteSubject(Number(req.params.id));
    res.json({ ok: true });
  });

  // ── TimeGrid: Classes ──
  app.get("/api/classes", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getClassesBySchool(user.schoolId));
  });
  app.post("/api/classes", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createClass({ ...req.body, schoolId: user.schoolId }));
  });
  app.delete("/api/classes/:id", requireAuth, async (req, res) => {
    await storage.deleteClass(Number(req.params.id));
    res.json({ ok: true });
  });

  // ── TimeGrid: Timetable ──
  app.get("/api/timetable", requireAuth, async (req, res) => {
    const user = req.user as any;
    const classId = req.query.classId ? Number(req.query.classId) : null;
    if (classId) return res.json(await storage.getTimetableByClass(user.schoolId, classId));
    res.json(await storage.getTimetableBySchool(user.schoolId));
  });
  app.post("/api/timetable", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createTimetableSlot({ ...req.body, schoolId: user.schoolId }));
  });

  // ── VoicelessBox ──
  app.get("/api/feedback-categories", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getFeedbackCategoriesBySchool(user.schoolId));
  });
  app.post("/api/feedback-categories", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createFeedbackCategory({ ...req.body, schoolId: user.schoolId }));
  });
  app.get("/api/feedbacks", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getFeedbacksBySchool(user.schoolId));
  });
  app.post("/api/feedbacks", async (req, res) => {
    const code = `VB-${Date.now().toString(36).toUpperCase()}`;
    const fb = await storage.createFeedback({ ...req.body, trackingCode: code });
    res.json(fb);
  });
  app.patch("/api/feedbacks/:id", requireAuth, async (req, res) => {
    const user = req.user as any;
    const data = { ...req.body };
    if (data.adminResponse) {
      data.respondedBy = user.id;
      data.respondedAt = new Date();
    }
    res.json(await storage.updateFeedback(Number(req.params.id), data));
  });
  app.get("/api/feedbacks/track/:code", async (req, res) => {
    const fb = await storage.getFeedbackByCode(req.params.code);
    if (!fb) return res.status(404).json({ message: "Not found" });
    res.json({ trackingCode: fb.trackingCode, status: fb.status, adminResponse: fb.adminResponse, createdAt: fb.createdAt });
  });

  // ── Parents Connect: Announcements ──
  app.get("/api/announcements", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getAnnouncementsBySchool(user.schoolId));
  });
  app.post("/api/announcements", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createAnnouncement({ ...req.body, schoolId: user.schoolId, publishedBy: user.id }));
  });

  // ── Parents Connect: Messages ──
  app.get("/api/messages/inbox", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getInbox(user.id));
  });
  app.get("/api/messages/sent", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getSent(user.id));
  });
  app.post("/api/messages", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createMessage({ ...req.body, schoolId: user.schoolId, senderId: user.id }));
  });
  app.patch("/api/messages/:id/read", requireAuth, async (req, res) => {
    await storage.markMessageRead(Number(req.params.id));
    res.json({ ok: true });
  });

  // ── Parents Connect: Events ──
  app.get("/api/events", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getEventsBySchool(user.schoolId));
  });
  app.post("/api/events", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createEvent({ ...req.body, schoolId: user.schoolId, createdBy: user.id }));
  });

  // ── Asset Register ──
  app.get("/api/asset-categories", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getAssetCategoriesBySchool(user.schoolId));
  });
  app.post("/api/asset-categories", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createAssetCategory({ ...req.body, schoolId: user.schoolId }));
  });
  app.get("/api/assets", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getAssetsBySchool(user.schoolId));
  });
  app.get("/api/assets/:id", requireAuth, async (req, res) => {
    const a = await storage.getAsset(Number(req.params.id));
    if (!a) return res.status(404).json({ message: "Not found" });
    res.json(a);
  });
  app.post("/api/assets", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createAsset({ ...req.body, schoolId: user.schoolId }));
  });
  app.patch("/api/assets/:id", requireAuth, async (req, res) => {
    res.json(await storage.updateAsset(Number(req.params.id), req.body));
  });
  app.delete("/api/assets/:id", requireAuth, async (req, res) => {
    await storage.deleteAsset(Number(req.params.id));
    res.json({ ok: true });
  });
  app.get("/api/maintenance", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.getMaintenanceBySchool(user.schoolId));
  });
  app.post("/api/maintenance", requireAuth, async (req, res) => {
    const user = req.user as any;
    res.json(await storage.createMaintenanceLog({ ...req.body, schoolId: user.schoolId }));
  });

  return httpServer;
}
