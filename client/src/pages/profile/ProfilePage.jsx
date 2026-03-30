// src/pages/profile/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, MapPin, Briefcase, Calendar, Edit, Camera, Save, X,
  Award, TrendingUp, BookOpen, Clock
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    level: 'university',
    bio: ''
  });

  // Load user data into form
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
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
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
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-text-dark dark:text-foreground">
          My <span className="text-green-700">Profile</span>
        </h1>
        <p className="text-text-medium dark:text-muted-foreground mt-2">
          Manage your account and learning preferences
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="relative inline-block mb-6">
                <Avatar className="w-32 h-32 ring-4 ring-green-100 dark:ring-green-900">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-green-600 to-emerald-600 text-white text-5xl">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-2 right-2 p-2 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-2xl font-semibold mb-1">{user?.name}</h2>
              <p className="text-text-medium mb-4">{user?.email}</p>

              {user?.institution && (
                <Badge variant="secondary" className="mb-6">
                  {user.institution}
                </Badge>
              )}

              <div className="space-y-4 text-left">
                <StatItem icon={BookOpen} label="Sessions" value={user?.stats?.totalSessions || 0} />
                <StatItem icon={TrendingUp} label="Avg Score" value={`${user?.stats?.averageScore || 0}%`} />
                <StatItem icon={Award} label="Streak" value={`${user?.streak?.current || 0} days`} />
                <StatItem icon={Calendar} label="Member Since" value={new Date(user?.createdAt).getFullYear()} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your basic details</CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1.5 text-lg font-medium">{user?.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="mt-1.5">{user?.email}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="institution">Institution / School</Label>
                {isEditing ? (
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Laikipia University"
                  />
                ) : (
                  <p className="mt-1.5">{user?.institution || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label>Education Level</Label>
                {isEditing ? (
                  <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
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
                  <p className="mt-1.5 capitalize">{user?.level?.replace('-', ' ') || 'Not specified'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Bio / About You</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell others a bit about yourself..."
                  />
                ) : (
                  <p className="mt-1.5 text-text-medium">{user?.bio || 'No bio added yet.'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Component
const StatItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
      <Icon className="w-5 h-5 text-green-600" />
    </div>
    <div>
      <p className="text-sm text-text-medium">{label}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  </div>
);

export default ProfilePage;