// scripts/seedTopics.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Topic Schema (inline)
const topicSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
  description: { type: String, required: true },
  keyPoints: [{ type: String }],
  estimatedTime: { type: Number, default: 10 },
  stats: {
    totalSessions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema);

const topics = [
  {
    name: 'OSI Model - 7 Layers',
    subject: 'Computer Networks',
    difficulty: 'intermediate',
    description: 'Understanding the 7 layers of the OSI networking model and how data flows through each layer.',
    keyPoints: [
      'Physical Layer: Transmission of raw bits over physical medium',
      'Data Link Layer: Node-to-node data transfer and error detection',
      'Network Layer: Routing and logical addressing (IP)',
      'Transport Layer: End-to-end communication (TCP/UDP)',
      'Session Layer: Session management between applications',
      'Presentation Layer: Data translation and encryption',
      'Application Layer: Network services to applications'
    ],
    estimatedTime: 15
  },
  {
    name: 'TCP vs UDP',
    subject: 'Computer Networks',
    difficulty: 'beginner',
    description: 'Understanding the differences between TCP and UDP protocols.',
    keyPoints: [
      'TCP is connection-oriented, UDP is connectionless',
      'TCP guarantees delivery, UDP does not',
      'TCP has error checking and flow control',
      'UDP is faster with lower overhead',
      'TCP is used for web, email, file transfer',
      'UDP is used for streaming, gaming, DNS'
    ],
    estimatedTime: 10
  },
  {
    name: 'Binary Search Trees',
    subject: 'Data Structures',
    difficulty: 'intermediate',
    description: 'Learn how Binary Search Trees work and their operations.',
    keyPoints: [
      'Each node has at most two children',
      'Left subtree contains smaller values',
      'Right subtree contains larger values',
      'Search, insert, delete in O(log n) average',
      'Can degrade to O(n) if unbalanced',
      'Self-balancing variants like AVL trees'
    ],
    estimatedTime: 20
  },
  {
    name: 'HTTP Request Methods',
    subject: 'Web Development',
    difficulty: 'beginner',
    description: 'Understanding GET, POST, PUT, DELETE HTTP methods.',
    keyPoints: [
      'GET: Retrieve data from server',
      'POST: Send data to create resource',
      'PUT: Update existing resource',
      'DELETE: Remove resource',
      'PATCH: Partially update resource',
      'Idempotency of methods'
    ],
    estimatedTime: 12
  },
  {
    name: 'JavaScript Promises',
    subject: 'JavaScript',
    difficulty: 'intermediate',
    description: 'Master async JavaScript with Promises and async/await.',
    keyPoints: [
      'Promises represent async operation completion',
      'Three states: pending, fulfilled, rejected',
      'then() for success, catch() for errors',
      'Promise.all() for parallel operations',
      'async/await is syntactic sugar',
      'Always handle errors properly'
    ],
    estimatedTime: 18
  },
  {
    name: 'SQL JOINs',
    subject: 'Databases',
    difficulty: 'intermediate',
    description: 'Understanding SQL JOIN operations.',
    keyPoints: [
      'INNER JOIN: Matching rows from both tables',
      'LEFT JOIN: All from left + matching from right',
      'RIGHT JOIN: All from right + matching from left',
      'FULL OUTER JOIN: All rows from both',
      'ON clause specifies join condition'
    ],
    estimatedTime: 15
  },
  {
    name: 'Big O Notation',
    subject: 'Algorithms',
    difficulty: 'beginner',
    description: 'Analyze algorithm complexity with Big O.',
    keyPoints: [
      'O(1): Constant time',
      'O(log n): Logarithmic',
      'O(n): Linear',
      'O(n log n): Log-linear',
      'O(n²): Quadratic',
      'Focus on worst-case'
    ],
    estimatedTime: 12
  },
  {
    name: 'React Hooks',
    subject: 'React',
    difficulty: 'intermediate',
    description: 'Master useState and useEffect hooks.',
    keyPoints: [
      'useState: Add state to components',
      'useEffect: Handle side effects',
      'Dependency array controls execution',
      'Return cleanup from useEffect',
      'Avoid infinite loops'
    ],
    estimatedTime: 20
  },
  {
    name: 'RESTful API Design',
    subject: 'Web Development',
    difficulty: 'intermediate',
    description: 'Design clean REST APIs.',
    keyPoints: [
      'Use nouns in endpoints',
      'HTTP methods define actions',
      'Proper status codes',
      'Version your API',
      'Use plural nouns'
    ],
    estimatedTime: 18
  },
  {
    name: 'Git Branching',
    subject: 'Version Control',
    difficulty: 'beginner',
    description: 'Learn Git branching workflows.',
    keyPoints: [
      'main branch for production',
      'Feature branches for new work',
      'Pull requests for review',
      'Merge vs Rebase',
      'Delete merged branches'
    ],
    estimatedTime: 15
  }
];

async function seedTopics() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tlearn';
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    console.log('📦 Connected!\n');

    let inserted = 0;
    let skipped = 0;

    for (const topicData of topics) {
      try {
        await Topic.create(topicData);
        inserted++;
        console.log(`✅ ${topicData.name}`);
      } catch (error) {
        if (error.code === 11000) {
          skipped++;
          console.log(`⏭️  ${topicData.name} (exists)`);
        } else {
          console.error(`❌ ${topicData.name}:`, error.message);
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Complete! Added: ${inserted}, Skipped: ${skipped}`);
    console.log(`📊 Total topics: ${await Topic.countDocuments()}`);
    console.log('='.repeat(50));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedTopics();