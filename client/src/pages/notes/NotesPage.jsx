import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Edit,
  Trash2,
  Grid,
  List
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
import { toast } from 'sonner';
import { notesService } from '@/services/notesService';
import { topicService } from '@/services/topicService';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [searchQuery, notes]);

  const loadNotes = async () => {
    try {
      const data = await notesService.getAll();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    if (!searchQuery) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(note =>
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNotes(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesService.delete(id);
      toast.success('Note deleted');
      loadNotes();
    } catch (error) {
      toast.error('Failed to delete note');
    }
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="DM Mono, monospace text-4xl font-semibold text-text-dark dark:text-foreground mb-2">
            My <span className="text-green-700">Notes</span>
          </h1>
          <p className="text-text-medium dark:text-muted-foreground">
            Organize and manage your study notes
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Sparkles className="w-5 h-5 mr-2" />
                AI Generate
              </Button>
            </DialogTrigger>
            <GenerateNotesDialog onSuccess={loadNotes} onClose={() => setGenerateDialogOpen(false)} />
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-forest to-forest-light">
                <Plus className="w-5 h-5 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <CreateNoteDialog onSuccess={loadNotes} onClose={() => setCreateDialogOpen(false)} />
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {filteredNotes.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              viewMode={viewMode}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-text-light mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No notes yet</h3>
            <p className="text-text-medium mb-4">
              Create your first note or let AI generate one for you
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCreateDialogOpen(true)}>
                Create Note
              </Button>
              <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const NoteCard = ({ note, viewMode, onDelete }) => {
  const typeColors = {
    generated: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    custom: 'bg-forest/10 text-forest border-forest/20',
    uploaded: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-gradient-to-br from-forest/10 to-forest-light/10 rounded-xl">
                <FileText className="w-6 h-6 text-forest" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-text-dark dark:text-foreground mb-1">
                  {note.title}
                </h3>
                <p className="text-sm text-text-medium line-clamp-1">
                  {note.content}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={typeColors[note.type] || typeColors.custom}>{note.type}</Badge>
              <Button variant="ghost" size="icon" onClick={() => onDelete(note._id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
      <Card className="h-full hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-gradient-to-br from-forest/10 to-forest-light/10 rounded-lg">
              <FileText className="w-5 h-5 text-forest" />
            </div>
            <Badge className={typeColors[note.type] || typeColors.custom}>{note.type}</Badge>
          </div>
          <CardTitle className="text-xl line-clamp-2">{note.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-medium line-clamp-3 mb-4">
            {note.content}
          </p>
          <Button variant="ghost" size="icon" onClick={() => onDelete(note._id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CreateNoteDialog = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({ title: '', content: '', tags: [] });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await notesService.create(formData);
      toast.success('Note created successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Note</DialogTitle>
        <DialogDescription>Write your study notes</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., OSI Model Summary"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            placeholder="Write your notes here..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={15}
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-forest to-forest-light">
            {loading ? 'Creating...' : 'Create Note'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

const GenerateNotesDialog = ({ onSuccess, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState('');

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await topicService.getAll();
      // FIX: Always ensure array
      setTopics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load topics:', error);
      setTopics([]);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTopic) {
      toast.error('Please select a topic');
      return;
    }

    setLoading(true);
    try {
      const result = await notesService.generateNotes(selectedTopic);
      setGeneratedNotes(result.content);
      toast.success('Notes generated!');
    } catch (error) {
      toast.error('Failed to generate notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedNotes) return;

    try {
      const topic = topics.find(t => t._id === selectedTopic);
      await notesService.create({
        title: `${topic?.name || 'Topic'} - AI Generated Notes`,
        content: generatedNotes,
        type: 'generated',
        topicId: selectedTopic
      });
      toast.success('Notes saved!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Generate Notes
        </DialogTitle>
        <DialogDescription>Let AI create comprehensive study notes for you</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="topic">Select Topic *</Label>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a topic" />
            </SelectTrigger>
            <SelectContent>
              {Array.isArray(topics) && topics.length > 0 ? (
                topics.map((topic) => (
                  <SelectItem key={topic._id} value={topic._id}>
                    {topic.name} - {topic.subject}
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

        <Button
          onClick={handleGenerate}
          disabled={loading || !selectedTopic || topics.length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Notes
            </>
          )}
        </Button>

        {generatedNotes && (
          <div className="space-y-4">
            <div>
              <Label>Generated Notes</Label>
              <div className="mt-2 p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{generatedNotes}</pre>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-forest to-forest-light">
                Save Notes
              </Button>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default NotesPage;