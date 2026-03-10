// src/pages/topics/TopicsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  BookOpen,
  Plus,
  TrendingUp,
  Star,
  Clock,
  Users,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { topicService } from '@/services/topicService';

const SUBJECTS = [
  'All Subjects',
  'Networking',
  'ICT',
  'Mathematics',
  'Science',
  'Programming',
  'Business',
  'Languages',
  'Other'
];

const DIFFICULTY_LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const TopicsPage = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [popularTopics, setPopularTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    filterTopics();
  }, [searchQuery, selectedSubject, selectedDifficulty, topics]);

  const loadTopics = async () => {
    try {
      console.log('🔍 TopicsPage: Fetching topics...');
      
      const [allTopics, popular] = await Promise.all([
        topicService.getAll(),
        topicService.getPopular()
      ]);
      
      console.log('📚 TopicsPage - Raw responses:');
      console.log('All topics raw:', allTopics);
      console.log('All topics type:', typeof allTopics);
      console.log('All topics keys:', Object.keys(allTopics || {}));
      console.log('Popular raw:', popular);
      console.log('Popular type:', typeof popular);
      
      // FIX: Extract topics using SAME logic as Dashboard
      let topicsArray = [];
      if (Array.isArray(allTopics)) {
        topicsArray = allTopics;
        console.log('✅ All topics is direct array');
      } else if (allTopics?.topics && Array.isArray(allTopics.topics)) {
        topicsArray = allTopics.topics;
        console.log('✅ All topics found in .topics');
      } else if (allTopics?.data?.topics && Array.isArray(allTopics.data.topics)) {
        topicsArray = allTopics.data.topics;
        console.log('✅ All topics found in .data.topics');
      } else if (allTopics?.data && Array.isArray(allTopics.data)) {
        topicsArray = allTopics.data;
        console.log('✅ All topics found in .data');
      } else {
        console.warn('❌ Could not extract topics from:', allTopics);
      }
      
      let popularArray = [];
      if (Array.isArray(popular)) {
        popularArray = popular;
        console.log('✅ Popular is direct array');
      } else if (popular?.topics && Array.isArray(popular.topics)) {
        popularArray = popular.topics;
        console.log('✅ Popular found in .topics');
      } else if (popular?.data?.topics && Array.isArray(popular.data.topics)) {
        popularArray = popular.data.topics;
        console.log('✅ Popular found in .data.topics');
      } else if (popular?.data && Array.isArray(popular.data)) {
        popularArray = popular.data;
        console.log('✅ Popular found in .data');
      } else {
        console.warn('❌ Could not extract popular from:', popular);
      }
      
      console.log('📊 Final counts:');
      console.log('All topics:', topicsArray.length);
      console.log('Popular topics:', popularArray.length);
      
      // Log first topic for inspection
      if (topicsArray.length > 0) {
        console.log('First topic:', topicsArray[0]);
      }
      
      // Check each topic for ID
      topicsArray.forEach((topic, i) => {
        if (!topic._id && !topic.id) {
          console.error(`❌ Topic ${i} "${topic.name}" has no ID:`, topic);
        }
      });
      
      setTopics(topicsArray);
      setPopularTopics(popularArray);
    } catch (error) {
      console.error('❌ Failed to load topics:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load topics');
      setTopics([]);
      setPopularTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTopics = () => {
    let filtered = [...topics];

    if (searchQuery) {
      filtered = filtered.filter(topic =>
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedSubject !== 'All Subjects') {
      filtered = filtered.filter(topic => topic.subject === selectedSubject);
    }

    if (selectedDifficulty !== 'All Levels') {
      filtered = filtered.filter(topic => topic.difficulty === selectedDifficulty.toLowerCase());
    }

    setFilteredTopics(filtered);
  };

  const handleStartLearning = (topicId) => {
    navigate(`/teach/${topicId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-DM Mono, monospace text-4xl font-semibold text-text-dark dark:text-foreground mb-2">
            Explore <span className="text-green-700">Topics</span>
          </h1>
          <p className="text-text-medium dark:text-muted-foreground">
            Find the <span className="text-green-700">perfect</span> topic to teach and master
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-forest to-forest-light">
              <Plus className="w-5 h-5 mr-2" />
              Create Topic
            </Button>
          </DialogTrigger>
          <CreateTopicDialog onSuccess={loadTopics} onClose={() => setCreateDialogOpen(false)} />
        </Dialog>
      </div>

      {/* Popular Topics */}
      {popularTopics.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-sand" />
            <h2 className="font-DM Mono, monospace text-2xl font-semibold text-text-dark dark:text-foreground">
              <span className="text-green-700">Popular</span> Topics
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {popularTopics.slice(0, 3).map((topic) => (
              <PopularTopicCard key={topic._id} topic={topic} onClick={handleStartLearning} />
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-text-medium">
            {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredTopics.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <TopicCard key={topic._id} topic={topic} onClick={handleStartLearning} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-text-light mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No topics found</h3>
              <p className="text-text-medium mb-4">
                Try adjusting your filters or create a new topic
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                Create Topic
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Popular Topic Card Component
const PopularTopicCard = ({ topic, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => {
        // FIX: Validate ID before navigating
        const topicId = topic._id || topic.id;
        if (topicId && topicId !== 'undefined') {
          onClick(topicId);
        } else {
          console.error('Invalid topic ID in PopularTopicCard:', topic);
        }
      }}
      className="cursor-pointer"
    >
      <Card className="bg-gradient-to-br from-forest/5 to-forest-light/5 border-forest/20 hover:border-forest/40 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 bg-gradient-to-br from-forest to-forest-light rounded-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <Badge variant="secondary" className="bg-sand/20 text-sand-dark">
              Popular
            </Badge>
          </div>
          <h3 className="font-DM Mono, monospace text-xl font-semibold text-text-dark dark:text-foreground mb-2">
            {topic.name}
          </h3>
          <p className="text-sm text-text-medium mb-4 line-clamp-2">
            {topic.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-text-light">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {topic.popularity || 0}
            </div>
            <Badge variant="outline">{topic.subject}</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Topic Card Component
const TopicCard = ({ topic, onClick }) => {
  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-600 border-green-500/20',
    intermediate: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    advanced: 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full hover:shadow-lg transition-all cursor-pointer group" onClick={() => {
        // FIX: Validate ID before navigating
        const topicId = topic._id || topic.id;
        if (topicId && topicId !== 'undefined') {
          onClick(topicId);
        } else {
          console.error('Invalid topic ID in TopicCard:', topic);
        }
      }}>
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="p-3 bg-gradient-to-br from-forest/10 to-forest-light/10 rounded-xl group-hover:from-forest/20 group-hover:to-forest-light/20 transition-colors">
              <BookOpen className="w-6 h-6 text-forest" />
            </div>
            <Badge className={difficultyColors[topic.difficulty] || 'bg-muted'}>
              {topic.difficulty}
            </Badge>
          </div>
          <CardTitle className="text-xl group-hover:text-forest transition-colors">
            {topic.name}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {topic.description || 'No description available'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <Badge variant="outline">{topic.subject}</Badge>
              <div className="flex items-center gap-1 text-text-light">
                <Clock className="w-3 h-3" />
                <span>~15 min</span>
              </div>
            </div>
            <Button className="w-full group-hover:bg-forest group-hover:text-white transition-all" variant="outline">
              Start Learning
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Create Topic Dialog Component
const CreateTopicDialog = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Networking',
    difficulty: 'intermediate',
    description: '',
    keyPoints: ['', '', '']
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        content: {
          keyPoints: formData.keyPoints.filter(p => p.trim())
        }
      };

      await topicService.create(dataToSubmit);
      toast.success('Topic created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Topic</DialogTitle>
        <DialogDescription>
          Create a custom topic to teach and master
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Topic Name *</Label>
          <Input
            id="name"
            placeholder="e.g., OSI Model"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) => setFormData({ ...formData, subject: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.filter(s => s !== 'All Subjects').map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty *</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_LEVELS.filter(l => l !== 'All Levels').map((level) => (
                  <SelectItem key={level} value={level.toLowerCase()}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the topic..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label>Key Points (Optional)</Label>
          {formData.keyPoints.map((point, index) => (
            <Input
              key={index}
              placeholder={`Key point ${index + 1}`}
              value={point}
              onChange={(e) => {
                const newPoints = [...formData.keyPoints];
                newPoints[index] = e.target.value;
                setFormData({ ...formData, keyPoints: newPoints });
              }}
              className="mt-2"
            />
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-forest to-forest-light"
          >
            {loading ? 'Creating...' : 'Create Topic'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default TopicsPage;