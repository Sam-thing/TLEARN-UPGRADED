// seed.js — Run with: node seed.js
import mongoose from 'mongoose';
import dotenv   from 'dotenv';
import Topic    from './models/Topic.js';

dotenv.config();

const topics = [
  // Networking
  { name: 'OSI Model', subject: 'Networking', difficulty: 'intermediate',
    estimatedTime: 8,
    description: 'The 7-layer Open Systems Interconnection model for network communication.',
    keyPoints: ['Physical layer transmits raw bits', 'Data link handles MAC addressing', 'Network layer handles IP routing', 'Transport layer TCP/UDP', 'Session manages connections', 'Presentation handles encryption/encoding', 'Application layer HTTP, FTP, DNS'] },

  { name: 'TCP/IP Protocol Suite', subject: 'Networking', difficulty: 'intermediate',
    estimatedTime: 7,
    description: 'Core protocols that power the internet.',
    keyPoints: ['TCP vs UDP differences', '3-way handshake', 'IP addressing and subnetting', 'DNS resolution process', 'HTTP/HTTPS request-response cycle'] },

  { name: 'Subnetting', subject: 'Networking', difficulty: 'advanced',
    estimatedTime: 10,
    description: 'Dividing IP address space into logical sub-networks.',
    keyPoints: ['CIDR notation', 'Subnet masks', 'Calculating network and broadcast addresses', 'VLSM', 'Private vs public IP ranges'] },

  // Programming
  { name: 'Object-Oriented Programming', subject: 'Programming', difficulty: 'beginner',
    estimatedTime: 10,
    description: 'Core OOP principles used in modern software development.',
    keyPoints: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction', 'Classes vs objects', 'Constructors and methods'] },

  { name: 'Data Structures: Arrays & Linked Lists', subject: 'Programming', difficulty: 'beginner',
    estimatedTime: 8,
    description: 'Fundamental data structures every programmer must know.',
    keyPoints: ['Array indexing and time complexity', 'Dynamic arrays', 'Singly vs doubly linked lists', 'Insertion and deletion operations', 'When to use each'] },

  { name: 'Big O Notation', subject: 'Programming', difficulty: 'intermediate',
    estimatedTime: 7,
    description: 'Analysing algorithm efficiency and performance.',
    keyPoints: ['O(1) constant time', 'O(n) linear time', 'O(log n) logarithmic', 'O(n²) quadratic', 'Space vs time complexity', 'Best, worst, average case'] },

  { name: 'REST APIs', subject: 'Programming', difficulty: 'intermediate',
    estimatedTime: 8,
    description: 'Designing and consuming RESTful web services.',
    keyPoints: ['HTTP methods GET POST PUT DELETE', 'Status codes 200 201 400 401 404 500', 'Request/response headers', 'JSON data format', 'Authentication with JWT', 'Stateless architecture'] },

  // Databases
  { name: 'SQL Fundamentals', subject: 'Databases', difficulty: 'beginner',
    estimatedTime: 8,
    description: 'Structured Query Language for relational databases.',
    keyPoints: ['SELECT FROM WHERE', 'INSERT UPDATE DELETE', 'JOINs (INNER, LEFT, RIGHT)', 'GROUP BY and aggregate functions', 'Indexes and performance', 'Primary and foreign keys'] },

  { name: 'Database Normalization', subject: 'Databases', difficulty: 'intermediate',
    estimatedTime: 8,
    description: 'Organising database tables to reduce redundancy.',
    keyPoints: ['1NF atomic values', '2NF full functional dependency', '3NF no transitive dependency', 'BCNF', 'Denormalization trade-offs'] },

  // Operating Systems
  { name: 'Process Management', subject: 'Operating Systems', difficulty: 'intermediate',
    estimatedTime: 8,
    description: 'How operating systems manage processes and scheduling.',
    keyPoints: ['Process vs thread', 'Process states (new, ready, running, waiting, terminated)', 'CPU scheduling algorithms', 'Context switching', 'Deadlocks and prevention', 'Inter-process communication'] },

  { name: 'Memory Management', subject: 'Operating Systems', difficulty: 'advanced',
    estimatedTime: 9,
    description: 'Virtual memory, paging, and memory allocation strategies.',
    keyPoints: ['Virtual vs physical memory', 'Paging and page tables', 'Page replacement algorithms (LRU, FIFO)', 'Segmentation', 'Memory allocation (first fit, best fit)', 'Thrashing'] },

  // Math
  { name: 'Calculus: Derivatives', subject: 'Mathematics', difficulty: 'intermediate',
    estimatedTime: 10,
    description: 'Rules and applications of differentiation.',
    keyPoints: ['Limit definition of a derivative', 'Power rule', 'Chain rule', 'Product and quotient rules', 'Implicit differentiation', 'Applications to rate of change'] },

  { name: 'Linear Algebra: Matrices', subject: 'Mathematics', difficulty: 'intermediate',
    estimatedTime: 9,
    description: 'Matrix operations and their applications.',
    keyPoints: ['Matrix addition and multiplication', 'Determinants', 'Inverse matrices', 'Eigenvalues and eigenvectors', 'Systems of linear equations', 'Applications in computer graphics'] },

  // Security
  { name: 'Cryptography Basics', subject: 'Cybersecurity', difficulty: 'intermediate',
    estimatedTime: 8,
    description: 'Fundamental concepts of encryption and secure communication.',
    keyPoints: ['Symmetric vs asymmetric encryption', 'AES and RSA', 'Hashing (SHA, MD5)', 'Digital signatures', 'Public key infrastructure (PKI)', 'TLS/SSL handshake'] },

  { name: 'Common Web Vulnerabilities (OWASP Top 10)', subject: 'Cybersecurity', difficulty: 'intermediate',
    estimatedTime: 10,
    description: 'The most critical web application security risks.',
    keyPoints: ['SQL injection', 'XSS (Cross-site scripting)', 'CSRF attacks', 'Broken authentication', 'Sensitive data exposure', 'Security misconfiguration'] },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB');

    await Topic.deleteMany({});
    console.log('🗑️   Cleared existing topics');

    const created = await Topic.insertMany(topics);
    console.log(`🌱  Seeded ${created.length} topics`);

    await mongoose.disconnect();
    console.log('✅  Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  }
};

seed();