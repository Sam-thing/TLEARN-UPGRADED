// src/pages/profile/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Camera,
  Save,
  X,
  Award,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    level: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        institution: user.institution || '',
        level: user.level || 'university',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await authService.updateProfile(formData);
      updateUser(updated);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        institution: user.institution || '',
        level: user.level || 'university',
        bio: user.bio || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="DM Mono, monospace text-4xl font-semibold text-green dark:text-foreground mb-2">
          My <span className="text-green-700">Profile</span>
        </h1>
        <p className="text-text-medium dark:text-muted-foreground">
          Manage your account information and preferences
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-forest to-forest-light text-white text-3xl">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-2 bg-forest rounded-full text-white hover:bg-forest-dark transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="DM Mono, monospace text-2xl font-semibold text-green-700 mb-1">
                  {user?.name}
                </h2>
                <p className="text-text-medium">{user?.email}</p>

                {user?.institution && (
                  <Badge className="mt-3" variant="secondary">
                    {user.institution}
                  </Badge>
                )}
              </div>

              <Separator className="my-6" />

              {/* Quick Stats */}
              <div className="space-y-4">
                <StatItem
                  icon={BookOpen}
                  label="Total Sessions"
                  value={user?.stats?.totalSessions || 0}
                />
                <StatItem
                  icon={TrendingUp}
                  label="Average Score"
                  value={`${user?.stats?.averageScore || 0}%`}
                />
                <StatItem
                  icon={Award}
                  label="Current Streak"
                  value={`${user?.stats?.streak || 0} days`}
                />
                <StatItem
                  icon={Calendar}
                  label="Joined"
                  value={new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full text-text-dark dark:text-foreground">
                <div>
                  <CardTitle><span className='text-green-700'>Personal </span>Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit className="w-4 h-4 mr-2 text-green-700" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-gradient-to-r from-forest to-forest-light"
                      size="sm"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
                      <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right text-green-700">
                        Name
                      </Label>
                      <div className="col-span-3">
                        {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        ) : (
                        <div className="flex items-center gap-2 text-text-dark dark:text-foreground">
                          <User className="w-4 h-4 text-text-light" />
                          {user?.name}
                        </div>
                        )}
                      </div>
                      </div>

                      {/* Email */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-green-700">
                  Email
                </Label>
                <div className="col-span-3">
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-text-dark dark:text-foreground">
                      <Mail className="w-4 h-4 text-text-light" />
                      {user?.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Institution */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="institution" className="text-right text-green-700">
                  Institution
                </Label>
                <div className="col-span-3">
                  {isEditing ? (
                    <Input
                      id="institution"
                      placeholder="e.g., Laikipia University"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-text-dark dark:text-foreground">
                      <Briefcase className="w-4 h-4 text-text-light" />
                      {user?.institution || 'Not specified'}
                    </div>
                  )}
                </div>
              </div>

              {/* Level */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="level" className="text-right text-green-700">
                  Level
                </Label>
                <div className="col-span-3">
                  {isEditing ? (
                    <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="self-learner">Self Learner</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 text-text-dark dark:text-foreground capitalize">
                      <Award className="w-4 h-4 text-text-light" />
                      {user?.level?.replace('-', ' ') || 'Not specified'}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="bio" className="text-right pt-2 text-green-700">
                  Bio
                </Label>
                <div className="col-span-3">
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-text-dark dark:text-foreground">
                      {user?.bio || 'No bio added yet.'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card>
            <CardHeader>
              <CardTitle><span className="text-green-700">Learning </span>Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-green-700">Language</Label>
                <div className="col-span-3">
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-green-700">Feedback Detail</Label>
                <div className="col-span-3">
                  <Select defaultValue="detailed">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Brief</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Stat Item Component
const StatItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-forest/10 rounded-lg">
          <Icon className="w-4 h-4 text-forest" />
        </div>
        <span className="text-sm text-text-medium">{label}</span>
      </div>
      <span className="font-semibold text-text-dark dark:text-foreground">{value}</span>
    </div>
  );
};

export default ProfilePage;