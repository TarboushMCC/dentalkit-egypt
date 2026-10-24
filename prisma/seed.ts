import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@dentalkit.eg" },
    update: { password: adminPassword, role: UserRole.SUPER_ADMIN, emailVerified: new Date() },
    create: {
      name: "Admin",
      email: "admin@dentalkit.eg",
      password: adminPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: new Date(),
    },
  });

  // Demo student
  const studentPassword = await bcrypt.hash("Student@123456", 12);
  const student = await db.user.upsert({
    where: { email: "nour@student.eg" },
    update: { password: studentPassword, role: UserRole.STUDENT, emailVerified: new Date() },
    create: {
      name: "Nour Ahmed",
      email: "nour@student.eg",
      password: studentPassword,
      role: UserRole.STUDENT,
      emailVerified: new Date(),
    },
  });

  // Universities
  const universities = [
    { name: "Cairo University", nameAr: "جامعة القاهرة", slug: "cairo-university", location: "Cairo, Giza", website: "https://cu.edu.eg", sortOrder: 1 },
    { name: "Ain Shams University", nameAr: "جامعة عين شمس", slug: "ain-shams-university", location: "Cairo", website: "https://asu.edu.eg", sortOrder: 2 },
    { name: "Alexandria University", nameAr: "جامعة الإسكندرية", slug: "alexandria-university", location: "Alexandria", website: "https://alexu.edu.eg", sortOrder: 3 },
    { name: "Future University in Egypt", nameAr: null, slug: "future-university-egypt", location: "New Cairo", website: "https://fue.edu.eg", sortOrder: 4 },
    { name: "Misr International University", nameAr: null, slug: "misr-international-university", location: "6th of October City", website: "https://miuegypt.edu.eg", sortOrder: 5 },
    { name: "October 6 University", nameAr: "جامعة 6 أكتوبر", slug: "october-6-university", location: "6th of October City", website: "https://o6u.edu.eg", sortOrder: 6 },
    { name: "Badr University", nameAr: "جامعة بدر", slug: "badr-university", location: "Badr City", website: "https://bu.edu.eg", sortOrder: 7 },
    { name: "British University in Egypt", nameAr: null, slug: "british-university-egypt", location: "El Sherouk City", website: "https://bue.edu.eg", sortOrder: 8 },
    { name: "Nahda University", nameAr: "جامعة النهضة", slug: "nahda-university", location: "Beni Suef", website: "https://nu.edu.eg", sortOrder: 9 },
    { name: "Delta University", nameAr: "جامعة الدلتا", slug: "delta-university", location: "Gamasa, Dakahlia", website: "https://deltauniv.edu.eg", sortOrder: 10 },
  ];

  const uniRecords: Record<string, { id: string }> = {};
  for (const uni of universities) {
    const record = await db.university.upsert({
      where: { slug: uni.slug },
      update: uni,
      create: { ...uni, isActive: true },
    });
    uniRecords[uni.slug] = record;
  }

  // Academic years for Cairo University
  const cairoYears = [
    { name: "First Year", nameAr: "السنة الأولى", slug: "year-1", yearNumber: 1, sortOrder: 1 },
    { name: "Second Year", nameAr: "السنة الثانية", slug: "year-2", yearNumber: 2, sortOrder: 2 },
    { name: "Third Year", nameAr: "السنة الثالثة", slug: "year-3", yearNumber: 3, sortOrder: 3 },
    { name: "Fourth Year", nameAr: "السنة الرابعة", slug: "year-4", yearNumber: 4, sortOrder: 4 },
    { name: "Fifth Year", nameAr: "السنة الخامسة", slug: "year-5", yearNumber: 5, sortOrder: 5 },
    { name: "Internship", nameAr: "الامتياز", slug: "internship", yearNumber: 6, sortOrder: 6 },
  ];

  const yearRecords: Record<string, { id: string }> = {};
  for (const year of cairoYears) {
    const record = await db.academicYear.upsert({
      where: { universityId_slug: { universityId: uniRecords["cairo-university"].id, slug: year.slug } },
      update: year,
      create: { ...year, universityId: uniRecords["cairo-university"].id, isActive: true },
    });
    yearRecords[`cairo-${year.slug}`] = record;
  }

  // Ain Shams years
  for (const year of cairoYears) {
    const record = await db.academicYear.upsert({
      where: { universityId_slug: { universityId: uniRecords["ain-shams-university"].id, slug: year.slug } },
      update: year,
      create: { ...year, universityId: uniRecords["ain-shams-university"].id, isActive: true },
    });
    yearRecords[`ainshams-${year.slug}`] = record;
  }

  // Categories
  const categories = [
    { name: "Examination Instruments", slug: "examination-instruments", sortOrder: 1 },
    { name: "Carving & Wax Instruments", slug: "carving-wax-instruments", sortOrder: 2 },
    { name: "Impression Materials & Trays", slug: "impression-trays", sortOrder: 3 },
    { name: "Periodontal Instruments", slug: "periodontal-instruments", sortOrder: 4 },
    { name: "Restorative Instruments", slug: "restorative-instruments", sortOrder: 5 },
    { name: "Mixing Equipment", slug: "mixing-equipment", sortOrder: 6 },
  ];

  const catRecords: Record<string, { id: string }> = {};
  for (const cat of categories) {
    const record = await db.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: { ...cat, isActive: true },
    });
    catRecords[cat.slug] = record;
  }

  // Products
  const products = [
    { name: "Dental Mirror Set (Sizes 4,5,6)", slug: "dental-mirror-set", sku: "DM-001", categoryId: catRecords["examination-instruments"].id, price: 120, comparePrice: 180, stock: 200, description: "Rhodium-coated front-surface dental mirrors, set of 3 sizes (4, 5, 6). High-quality stainless steel handles." },
    { name: "Explorer (Shepherd's Hook)", slug: "explorer-shepherds-hook", sku: "EX-001", categoryId: catRecords["examination-instruments"].id, price: 65, comparePrice: 95, stock: 300, description: "Sharp stainless steel explorer for caries detection and examination." },
    { name: "Cotton Pliers (Locking)", slug: "cotton-pliers-locking", sku: "CP-001", categoryId: catRecords["examination-instruments"].id, price: 75, comparePrice: 110, stock: 250, description: "Cross-action locking cotton pliers for cotton roll and pellet placement." },
    { name: "College Tweezers", slug: "college-tweezers", sku: "TW-001", categoryId: catRecords["examination-instruments"].id, price: 55, comparePrice: 80, stock: 280, description: "Fine-tipped college pliers for small material and instrument handling." },
    { name: "Wax Knife No. 7", slug: "wax-knife-no-7", sku: "WK-001", categoryId: catRecords["carving-wax-instruments"].id, price: 85, comparePrice: 130, stock: 180, description: "Standard wax carving spatula for dental laboratory exercises." },
    { name: "Hollenback Carver", slug: "hollenback-carver", sku: "HC-001", categoryId: catRecords["carving-wax-instruments"].id, price: 90, comparePrice: 140, stock: 160, description: "Double-ended amalgam and wax carver for restorative procedures." },
    { name: "Amalgam Plugger Set (1 & 3)", slug: "amalgam-plugger-set", sku: "AP-001", categoryId: catRecords["restorative-instruments"].id, price: 110, comparePrice: 160, stock: 200, description: "Sizes 1 and 3 amalgam pluggers for condensation exercises." },
    { name: "Impression Tray Set (Upper & Lower)", slug: "impression-tray-set", sku: "IT-001", categoryId: catRecords["impression-trays"].id, price: 180, comparePrice: 260, stock: 120, description: "Perforated upper and lower impression trays, medium size, stainless steel." },
    { name: "Rubber Mixing Bowl & Spatula", slug: "rubber-mixing-bowl-spatula", sku: "MB-001", categoryId: catRecords["mixing-equipment"].id, price: 95, comparePrice: 140, stock: 150, description: "500ml rubber mixing bowl with stiff-bladed spatula for alginate/plaster mixing." },
    { name: "Periodontal Probe (WHO Type)", slug: "periodontal-probe-who", sku: "PP-001", categoryId: catRecords["periodontal-instruments"].id, price: 80, comparePrice: 120, stock: 200, description: "WHO periodontal probe graduated at 3.5, 5.5, 8.5, 11.5mm with color-coded band." },
    { name: "Sickle Scaler H6/H7", slug: "sickle-scaler-h6-h7", sku: "SS-001", categoryId: catRecords["periodontal-instruments"].id, price: 95, comparePrice: 145, stock: 180, description: "H6/H7 universal sickle scaler for supragingival calculus removal." },
    { name: "Excavator Set (Sizes 1-4)", slug: "excavator-set", sku: "EV-001", categoryId: catRecords["restorative-instruments"].id, price: 160, comparePrice: 240, stock: 140, description: "Set of 4 spoon excavators (sizes 1-4) for carious dentine removal." },
    { name: "Gracey Curette Set (5/6, 7/8, 11/12, 13/14)", slug: "gracey-curette-set", sku: "GC-001", categoryId: catRecords["periodontal-instruments"].id, price: 320, comparePrice: 480, stock: 80, description: "4-piece Gracey curette set for area-specific subgingival debridement." },
    { name: "Composite Placement Instrument", slug: "composite-placement-instrument", sku: "CI-001", categoryId: catRecords["restorative-instruments"].id, price: 130, comparePrice: 195, stock: 120, description: "Teflon-coated composite placement and carving instrument." },
    { name: "Probe (William's Type)", slug: "probe-williams-type", sku: "PW-001", categoryId: catRecords["periodontal-instruments"].id, price: 70, comparePrice: 100, stock: 220, description: "William's periodontal probe with millimeter graduations 1-10mm." },
  ];

  const productRecords: Record<string, { id: string }> = {};
  for (const prod of products) {
    const record = await db.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: { ...prod, isActive: true, isFeatured: false, images: [], tags: [] },
    });
    productRecords[prod.slug] = record;
  }

  // Cairo University Year 1 Package
  const cairoY1Package = await db.package.upsert({
    where: { slug: "cairo-year-1-starter-kit" },
    update: {},
    create: {
      name: "First Year Starter Kit",
      nameAr: "كيت السنة الأولى",
      slug: "cairo-year-1-starter-kit",
      description: "The complete, faculty-verified equipment package for First Year Dental Students at Cairo University. Covers all preclinical basics and fundamentals required by the faculty.",
      universityId: uniRecords["cairo-university"].id,
      yearId: yearRecords["cairo-year-1"].id,
      price: 1850,
      comparePrice: 2600,
      stock: 45,
      isActive: true,
      isFeatured: true,
      isRequired: true,
      images: [],
      tags: ["cairo-university", "year-1", "preclinical", "starter"],
    },
  });

  await db.packageItem.createMany({
    skipDuplicates: true,
    data: [
      { packageId: cairoY1Package.id, productId: productRecords["dental-mirror-set"].id, quantity: 1, sortOrder: 1 },
      { packageId: cairoY1Package.id, productId: productRecords["explorer-shepherds-hook"].id, quantity: 1, sortOrder: 2 },
      { packageId: cairoY1Package.id, productId: productRecords["cotton-pliers-locking"].id, quantity: 1, sortOrder: 3 },
      { packageId: cairoY1Package.id, productId: productRecords["college-tweezers"].id, quantity: 1, sortOrder: 4 },
      { packageId: cairoY1Package.id, productId: productRecords["wax-knife-no-7"].id, quantity: 1, sortOrder: 5 },
      { packageId: cairoY1Package.id, productId: productRecords["hollenback-carver"].id, quantity: 1, sortOrder: 6 },
      { packageId: cairoY1Package.id, productId: productRecords["amalgam-plugger-set"].id, quantity: 1, sortOrder: 7 },
      { packageId: cairoY1Package.id, productId: productRecords["impression-tray-set"].id, quantity: 1, sortOrder: 8 },
      { packageId: cairoY1Package.id, productId: productRecords["rubber-mixing-bowl-spatula"].id, quantity: 1, sortOrder: 9 },
      { packageId: cairoY1Package.id, productId: productRecords["probe-williams-type"].id, quantity: 1, sortOrder: 10 },
    ],
  });

  // Cairo University Year 2 Package
  const cairoY2Package = await db.package.upsert({
    where: { slug: "cairo-year-2-clinical-kit" },
    update: {},
    create: {
      name: "Second Year Clinical Kit",
      nameAr: "كيت السنة الثانية",
      slug: "cairo-year-2-clinical-kit",
      description: "The complete, faculty-verified equipment package for Second Year Dental Students at Cairo University. Includes every instrument listed in the official faculty equipment guide.",
      universityId: uniRecords["cairo-university"].id,
      yearId: yearRecords["cairo-year-2"].id,
      price: 2850,
      comparePrice: 4200,
      stock: 30,
      isActive: true,
      isFeatured: true,
      isRequired: true,
      images: [],
      tags: ["cairo-university", "year-2", "clinical"],
    },
  });

  await db.packageItem.createMany({
    skipDuplicates: true,
    data: [
      { packageId: cairoY2Package.id, productId: productRecords["dental-mirror-set"].id, quantity: 1, sortOrder: 1 },
      { packageId: cairoY2Package.id, productId: productRecords["explorer-shepherds-hook"].id, quantity: 1, sortOrder: 2 },
      { packageId: cairoY2Package.id, productId: productRecords["cotton-pliers-locking"].id, quantity: 1, sortOrder: 3 },
      { packageId: cairoY2Package.id, productId: productRecords["college-tweezers"].id, quantity: 1, sortOrder: 4 },
      { packageId: cairoY2Package.id, productId: productRecords["wax-knife-no-7"].id, quantity: 1, sortOrder: 5 },
      { packageId: cairoY2Package.id, productId: productRecords["hollenback-carver"].id, quantity: 1, sortOrder: 6 },
      { packageId: cairoY2Package.id, productId: productRecords["amalgam-plugger-set"].id, quantity: 1, sortOrder: 7 },
      { packageId: cairoY2Package.id, productId: productRecords["impression-tray-set"].id, quantity: 1, sortOrder: 8 },
      { packageId: cairoY2Package.id, productId: productRecords["rubber-mixing-bowl-spatula"].id, quantity: 1, sortOrder: 9 },
      { packageId: cairoY2Package.id, productId: productRecords["periodontal-probe-who"].id, quantity: 1, sortOrder: 10 },
      { packageId: cairoY2Package.id, productId: productRecords["sickle-scaler-h6-h7"].id, quantity: 1, sortOrder: 11 },
      { packageId: cairoY2Package.id, productId: productRecords["excavator-set"].id, quantity: 1, sortOrder: 12 },
    ],
  });

  // Cairo Year 3 Package
  const cairoY3Package = await db.package.upsert({
    where: { slug: "cairo-year-3-operative-kit" },
    update: {},
    create: {
      name: "Third Year Operative Kit",
      nameAr: "كيت السنة الثالثة",
      slug: "cairo-year-3-operative-kit",
      description: "Advanced clinical instruments package for Third Year at Cairo University. Covers operative dentistry and periodontics instruments.",
      universityId: uniRecords["cairo-university"].id,
      yearId: yearRecords["cairo-year-3"].id,
      price: 3200,
      comparePrice: 4800,
      stock: 25,
      isActive: true,
      isFeatured: true,
      isRequired: true,
      images: [],
      tags: ["cairo-university", "year-3", "operative"],
    },
  });

  await db.packageItem.createMany({
    skipDuplicates: true,
    data: [
      { packageId: cairoY3Package.id, productId: productRecords["gracey-curette-set"].id, quantity: 1, sortOrder: 1 },
      { packageId: cairoY3Package.id, productId: productRecords["composite-placement-instrument"].id, quantity: 1, sortOrder: 2 },
      { packageId: cairoY3Package.id, productId: productRecords["excavator-set"].id, quantity: 1, sortOrder: 3 },
      { packageId: cairoY3Package.id, productId: productRecords["periodontal-probe-who"].id, quantity: 1, sortOrder: 4 },
      { packageId: cairoY3Package.id, productId: productRecords["sickle-scaler-h6-h7"].id, quantity: 1, sortOrder: 5 },
      { packageId: cairoY3Package.id, productId: productRecords["dental-mirror-set"].id, quantity: 1, sortOrder: 6 },
      { packageId: cairoY3Package.id, productId: productRecords["cotton-pliers-locking"].id, quantity: 1, sortOrder: 7 },
      { packageId: cairoY3Package.id, productId: productRecords["amalgam-plugger-set"].id, quantity: 2, sortOrder: 8 },
    ],
  });

  // Ain Shams Year 1 Package
  const ainShasmY1 = await db.package.upsert({
    where: { slug: "ain-shams-year-1-foundation-kit" },
    update: {},
    create: {
      name: "Year 1 Foundation Kit",
      slug: "ain-shams-year-1-foundation-kit",
      description: "Official first year instrument package for Ain Shams University Faculty of Dentistry.",
      universityId: uniRecords["ain-shams-university"].id,
      yearId: yearRecords["ainshams-year-1"].id,
      price: 1700,
      comparePrice: 2400,
      stock: 35,
      isActive: true,
      isFeatured: true,
      isRequired: true,
      images: [],
      tags: ["ain-shams", "year-1"],
    },
  });

  await db.packageItem.createMany({
    skipDuplicates: true,
    data: [
      { packageId: ainShasmY1.id, productId: productRecords["dental-mirror-set"].id, quantity: 1, sortOrder: 1 },
      { packageId: ainShasmY1.id, productId: productRecords["explorer-shepherds-hook"].id, quantity: 1, sortOrder: 2 },
      { packageId: ainShasmY1.id, productId: productRecords["cotton-pliers-locking"].id, quantity: 1, sortOrder: 3 },
      { packageId: ainShasmY1.id, productId: productRecords["wax-knife-no-7"].id, quantity: 1, sortOrder: 4 },
      { packageId: ainShasmY1.id, productId: productRecords["impression-tray-set"].id, quantity: 1, sortOrder: 5 },
      { packageId: ainShasmY1.id, productId: productRecords["rubber-mixing-bowl-spatula"].id, quantity: 1, sortOrder: 6 },
    ],
  });

  // Site settings
  const settings = [
    { key: "site_name", value: "DentalKit Egypt", description: "Platform display name" },
    { key: "site_email", value: "hello@dentalkit.eg", description: "Main contact email" },
    { key: "free_shipping_threshold", value: "500", description: "Minimum order for free shipping (EGP)" },
    { key: "default_shipping_cost", value: "80", description: "Default shipping cost (EGP)" },
    { key: "currency", value: "EGP", description: "Default currency" },
    { key: "currency_symbol", value: "EGP", description: "Currency symbol" },
    { key: "max_cart_quantity", value: "10", description: "Max quantity per cart item" },
    { key: "instapay_enabled", value: "true", description: "Enable Instapay payments" },
    { key: "cod_enabled", value: "true", description: "Enable cash on delivery" },
    { key: "maintenance_mode", value: "false", description: "Put site in maintenance mode" },
  ];

  for (const setting of settings) {
    await db.siteSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  // Sample coupon
  await db.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      type: "PERCENTAGE",
      value: 20,
      minOrder: 500,
      usageLimit: 100,
      isActive: true,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  // Link student to university
  await db.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      universityId: uniRecords["cairo-university"].id,
      yearId: yearRecords["cairo-year-3"].id,
      phone: "+20 100 000 0000",
      city: "Cairo",
      governorate: "Cairo",
    },
  });

  console.log("✅ Seeding complete!");
  console.log(`   Admin: admin@dentalkit.eg / Admin@123456`);
  console.log(`   Student: nour@student.eg / Student@123456`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());

