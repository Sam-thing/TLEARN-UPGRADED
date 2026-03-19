// src/pages/rooms/RoomsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Zap,
  Globe,
  Lock,
  TrendingUp,
  MessageCircle,
  UserPlus,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { roomService } from '@/services/roomService';
import { topicService } from '@/services/topicService';

const RoomsPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [matchedRooms, setMatchedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, matched, public, private
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await roomService.getAll();  // Already returns array or .rooms
      
      console.log('📊 Rooms data:', data);
      console.log('Is array?', Array.isArray(data));
      
      // Service already extracted .rooms, so use data directly
      setRooms(Array.isArray(data) ? data : []);
      setMatchedRooms([]);  // Clear or load separately
      
    } catch (error) {
      console.error('Failed to load rooms:', error);
      toast.error('Failed to load rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await roomService.join(roomId, true);
      toast.success('Joined room successfully!');
      navigate(`/rooms/${roomId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to join room');
    }
  };

  const filteredRooms = () => {
    let filtered = rooms;

    if (filter === 'matched') {
      filtered = matchedRooms;
    } else if (filter === 'public') {
      filtered = rooms.filter(r => r.type === 'public');
    } else if (filter === 'private') {
      filtered = rooms.filter(r => r.type === 'private');
    }

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-8">
      {/* Header - Responsive */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-text-dark dark:text-foreground mb-1 sm:mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>
            Study <span className="text-green-700">Rooms</span>
          </h1>
          <p className="text-sm sm:text-base text-text-medium dark:text-muted-foreground">
            Join a room to learn with peers studying the same topics
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-forest to-forest-light text-sm sm:text-base">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <CreateRoomDialog onSuccess={loadRooms} onClose={() => setCreateDialogOpen(false)} />
        </Dialog>
      </div>

      {/* Matched Rooms Highlight - Responsive */}
      {matchedRooms.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              <CardTitle className="text-lg sm:text-xl">Best Matches for You</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">
              These rooms match your learning level and study patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {matchedRooms.slice(0, 2).map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  onJoin={handleJoinRoom}
                  showCompatibility={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filters - Responsive */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text-light" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm sm:text-base"
          />
        </div>

        {/* Filter Tabs - Stack on mobile, horizontal on tablet+ */}
        <div className="grid grid-cols-2 sm:flex gap-2">
          {['all', 'matched', 'public', 'private'].map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={`text-xs sm:text-sm ${filter === f ? 'bg-forest' : ''}`}
              size="sm"
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'matched' && matchedRooms.length > 0 && (
                <Badge className="ml-1 sm:ml-2 text-xs" variant="secondary">
                  {matchedRooms.length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Rooms Grid - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      {filteredRooms().length > 0 ? (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms().map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onJoin={handleJoinRoom}
              showCompatibility={filter === 'matched'}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 text-text-light mx-auto mb-3 sm:mb-4" />
            <h3 className="font-semibold text-base sm:text-lg mb-2">No rooms found</h3>
            <p className="text-sm sm:text-base text-text-medium mb-4">
              Create a new room to get started
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
              Create Room
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Room Card Component
const RoomCard = ({ room, onJoin, showCompatibility }) => {
  const typeIcons = {
    public: Globe,
    private: Lock,
    'auto-matched': Zap
  };

  const Icon = typeIcons[room.type] || Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-forest/10 to-forest-light/10 rounded-lg">
                <Icon className="w-5 h-5 text-forest" />
              </div>
              <Badge variant="outline">{room.type}</Badge>
            </div>
            {showCompatibility && room.compatibilityScore && (
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-bold text-purple-600">
                  {room.compatibilityScore}%
                </span>
              </div>
            )}
          </div>
          <CardTitle className="text-xl">{room.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {room.description || 'No description'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Topic Badge */}
            {room.topic && (
              <Badge className="bg-sand/20 text-sand-dark border-sand/30">
                {room.topic.name}
              </Badge>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-text-medium">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>
                  {room.activeMemberCount || room.members?.length || 0}/
                  {room.settings?.maxMembers || 10}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{room.statistics?.totalMessages || 0} msgs</span>
              </div>
            </div>

            {/* Join Button */}
            <Button
              onClick={() => onJoin(room._id)}
              className="w-full bg-gradient-to-r from-forest to-forest-light hover:opacity-90"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Create Room Dialog
const CreateRoomDialog = ({ onSuccess, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    topicId: '',
    description: '',
    type: 'public',
    maxMembers: 10,
    requireConsent: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      console.log('🏠 RoomsPage: Loading topics for dropdown...');
      const data = await topicService.getAll();
      
      console.log('Topics raw response:', data);
      console.log('Topics type:', typeof data);
      
      // FIX: Extract topics using robust logic (same as Dashboard/TopicsPage)
      let topicsArray = [];
      if (Array.isArray(data)) {
        topicsArray = data;
        console.log('✅ Topics is direct array');
      } else if (data?.topics && Array.isArray(data.topics)) {
        topicsArray = data.topics;
        console.log('✅ Topics found in .topics');
      } else if (data?.data?.topics && Array.isArray(data.data.topics)) {
        topicsArray = data.data.topics;
        console.log('✅ Topics found in .data.topics');
      } else if (data?.data && Array.isArray(data.data)) {
        topicsArray = data.data;
        console.log('✅ Topics found in .data');
      } else {
        console.warn('❌ Could not extract topics from:', data);
      }
      
      console.log('📊 Topics loaded for dropdown:', topicsArray.length);
      if (topicsArray.length > 0) {
        console.log('First topic:', topicsArray[0]);
      }
      
      setTopics(topicsArray);
    } catch (error) {
      console.error('❌ Failed to load topics:', error);
      console.error('Error details:', error.response?.data);
      setTopics([]);
      toast.error('Failed to load topics');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await roomService.create(formData);
      toast.success('Room created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Study Room</DialogTitle>
        <DialogDescription>
          Create a room for collaborative learning
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Room Name *</Label>
          <Input
            id="name"
            placeholder="e.g., OSI Model Study Group"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="topic">Topic *</Label>
          <Select
            value={formData.topicId}
            onValueChange={(value) => setFormData({ ...formData, topicId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(topics) && topics.length > 0 ? (
                topics.map((topic) => (
                  <SelectItem key={topic._id} value={topic._id}>
                    {topic.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-topics" disabled>
                  No topics available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What will you study together?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Room Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxMembers">Max Members *</Label>
            <Select
              value={formData.maxMembers.toString()}
              onValueChange={(value) => setFormData({ ...formData, maxMembers: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 20, 30].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} members
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="consent">Require consent to join</Label>
          <Switch
            id="consent"
            checked={formData.requireConsent}
            onCheckedChange={(checked) => setFormData({ ...formData, requireConsent: checked })}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.topicId}
            className="flex-1 bg-gradient-to-r from-forest to-forest-light"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default RoomsPage;