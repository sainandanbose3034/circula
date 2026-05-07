const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Document = require('./models/Document');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/circula';

// A minimal valid PDF to act as the dummy file for the viewer
const minimalPdfBase64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLY31jBSSMwvyEgtSQ1Ozi1PzlHw8Xf3dwz1BHCX93Pw8w/zDPF2VnIqVXDVKlNxLuUoUUvJzE/OSw1KL0jKLFEAigBAA9/gXkwplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjk3CmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L0ZvbnQ8PC9GMTEgNCAwIFI+Pj4+L0NvbnRlbnRzIDIgMCBSL1BhcmVudCA1IDAgUj4+CmVuZG9iagoKNCAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9UaW1lcy1Sb21hbj4+CmVuZG9iagoKNSAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sxIDAgUl0+PgplbmRvYmoKCjYgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDUgMCBSPj4KZW5kb2JqCgo3IDAgb2JqCjw8L1Byb2R1Y2VyKEdob3N0c2NyaXB0IDkuNTMpL0NyZWF0aW9uRGF0ZShEOjIwMjQxMjI3MDAwMDAwWik+PgplbmRvYmoKCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDIxNyAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxOTggMDAwMDAgbiAKMDAwMDAwMDMzNiAwMDAwMCBuIAowMDAwMDAwNDI0IDAwMDAwIG4gCjAwMDAwMDA0ODEgMDAwMDAgbiAKMDAwMDAwMDUzMCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgOC9Sb290IDYgMCBSL0luZm8gNyAwIFI+PgpzdGFydHhyZWYKNjI1CiUlRU9GCg==";

const dummyDocs = [
  {
    title: "Advanced Data Structures & Algorithms",
    description: "Comprehensive notes covering Trees, Graphs, Dynamic Programming, and advanced algorithmic patterns commonly asked in interviews.",
    subject: "Computer Science",
    tags: ["DSA", "Algorithms", "Interview Prep"],
    isPremium: true
  },
  {
    title: "Machine Learning CS229 Full Slides",
    description: "Complete presentation slides and lecture notes for Andrew Ng's Machine Learning course. Covers supervised/unsupervised learning and neural networks.",
    subject: "Artificial Intelligence",
    tags: ["Machine Learning", "AI", "CS229"],
    isPremium: true
  },
  {
    title: "Intro to Operating Systems Concept Cheatsheet",
    description: "A quick 5-page reference guide for multi-threading, concurrency, deadlocks, and memory management concepts.",
    subject: "Computer Science",
    tags: ["OS", "Concurrency", "Systems"],
    isPremium: false
  },
  {
    title: "Calculus III - Multivariable Mathematics",
    description: "Detailed step-by-step solutions for multivariable limits, partial derivatives, and multiple integrals.",
    subject: "Mathematics",
    tags: ["Calculus", "Math", "Engineering"],
    isPremium: false
  },
  {
    title: "Quantum Physics 101: Formulas & Derivations",
    description: "Essential formulas for quantum mechanics, including Schrödinger equation derivations and wave function collapses.",
    subject: "Physics",
    tags: ["Physics", "Quantum", "Formulas"],
    isPremium: true
  },
  {
    title: "Biochemistry: Metabolic Pathways Diagram",
    description: "High-resolution diagram and notes explaining the Krebs cycle, glycolysis, and oxidative phosphorylation.",
    subject: "Biology",
    tags: ["Biology", "Chemistry", "Metabolism"],
    isPremium: false
  },
  {
    title: "Microeconomics Theory Final Review",
    description: "Flashcards and summaries for supply/demand curves, utility functions, and market equilibrium theories.",
    subject: "Economics",
    tags: ["Economics", "Microeconomics"],
    isPremium: false
  },
  {
    title: "React Native App Architecture Guidelines",
    description: "Enterprise-level folder structure, state management patterns (Redux/Zustand), and performance optimization tips for mobile apps.",
    subject: "Software Engineering",
    tags: ["React", "Mobile", "Architecture"],
    isPremium: true
  },
  {
    title: "Organic Chemistry Reactions Cheatsheet",
    description: "All major Sn1/Sn2/E1/E2 reaction mechanisms compiled onto a single accessible PDF.",
    subject: "Chemistry",
    tags: ["Organic Chemistry", "Reactions"],
    isPremium: false
  },
  {
    title: "Financial Accounting Basics & Principles",
    description: "Balance sheets, income statements, and cash flow analysis explained with real-world examples.",
    subject: "Finance",
    tags: ["Accounting", "Finance", "Business"],
    isPremium: true
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    // Write dummy PDF
    const dummyPath = path.join(uploadsDir, 'dummy.pdf');
    fs.writeFileSync(dummyPath, Buffer.from(minimalPdfBase64, 'base64'));
    console.log('Created dummy PDF file.');

    // Need a user to own these docs
    let user = await User.findOne({ role: 'admin' });
    if (!user) user = await User.findOne(); // grab any user
    
    if (!user) {
      console.log('No user found in DB. Creating a dummy admin user...');
      user = new User({
        name: 'System Admin',
        email: 'admin@circula.fake',
        passwordHash: '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXX', // Fake hash
        role: 'admin'
      });
      await user.save();
    }

    console.log(`Using user ID ${user._id} for dummy uploads.`);

    // Delete existing documents if you want a clean slate (optional, commented out)
    // await Document.deleteMany({});

    console.log('Inserting dummy documents...');
    for (const docData of dummyDocs) {
      const doc = new Document({
        ...docData,
        uploadedBy: user._id,
        filePath: 'uploads/dummy.pdf', // All point to the same dummy file
        originalFileName: `${docData.title.substring(0, 20)}.pdf`,
        fileType: 'pdf',
        pageCount: Math.floor(Math.random() * 50) + 1,
        fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
        confidenceScore: Math.floor(Math.random() * 30) + 70, // 70-100 score
        verificationStatus: 'verified',
        totalViews: Math.floor(Math.random() * 1000),
      });
      await doc.save();
    }

    console.log('✅ Successfully seeded dummy documents!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
