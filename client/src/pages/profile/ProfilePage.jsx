// src/pages/profile/ProfilePage.jsx — fully wired backend
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Briefcase, Award, Calendar,
  Edit, Camera, Save, X, TrendingUp, BookOpen, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/axios';

// ── Profile service (calls the real endpoint) ────────────────────────────────
const profileService = {
  async update(data) {
    const res = await api.patch('/auth/users', data);
    return res.user || res;
  },
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [errors, setErrors]         = useState({});

  const [formData, setFormData] = useState({
    name:        '',
    institution: '',
    level:       'university',
    bio:         '',
  });

  // Sync form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name:        user.name        || '',
        institution: user.institution || '',
        level:       user.level       || 'university',
        bio:         user.bio         || '',
      });
    }
  }, [user]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }
    if (formData.bio && formData.bio.length > 300) {
      errs.bio = `Bio too long (${formData.bio.length}/300)`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save handler ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const updated = await profileService.update({
        name:        formData.name.trim(),
        institution: formData.institution.trim(),
        level:       formData.level,
        bio:         formData.bio.trim(),
      });
      updateUser(updated);
      toast.success('Profile updated!');
      setIsEditing(false);
      setErrors({});
    } catch (err) {
      const msg = err?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name:        user.name        || '',
        institution: user.institution || '',
        level:       user.level       || 'university',
        bio:         user.bio         || '',
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  // ── Avatar upload placeholder ────────────────────────────────────────────────
  const handleAvatarClick = () => {
    toast.info('Avatar upload coming soon!');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-text-dark dark:text-foreground mb-1">
          My <span className="text-green-700">Profile</span>
        </h1>
        <p className="text-text-medium dark:text-muted-foreground">
          Manage your account information and preferences
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left column — avatar + quick stats ─────────────────────────── */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <Avatar className="w-28 h-28 ring-2 ring-forest/20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-forest to-forest-light text-white text-3xl">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={handleAvatarClick}
                    disabled={avatarUploading}
                    className="absolute bottom-0 right-0 p-2 bg-forest rounded-full text-white hover:bg-forest-dark transition-colors shadow-lg"
                    title="Change avatar"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-text-dark dark:text-foreground mb-0.5">
                  {user.name}
                </h2>
                <p className="text-sm text-text-medium">{user.email}</p>

                {user.institution && (
                  <Badge className="mt-3" variant="secondary">
                    {user.institution}
                  </Badge>
                )}

                <p className="text-xs text-text-light mt-2 capitalize">
                  {user.level?.replace('-', ' ')}
                </p>
              </div>

              <Separator className="my-4" />

              {/* Quick stats */}
              <div className="space-y-3">
                <StatRow icon={BookOpen}   label="Sessions"     value={user.stats?.totalSessions  || 0} />
                <StatRow icon={TrendingUp} label="Avg Score"    value={`${user.stats?.averageScore || 0}%`} />
                <StatRow icon={Award}      label="Streak"       value={`${user.streak?.current || 0} days`} />
                <StatRow icon={Calendar}   label="Member since" value={fmtDate(user.createdAt)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right column — editable form ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    <span className="text-green-700">Personal</span> Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>

                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" size="sm" disabled={loading}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      size="sm"
                      className="bg-forest hover:bg-forest-dark"
                    >
                      {loading
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                        : <><Save className="w-4 h-4 mr-2" />Save</>
                      }
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Name */}
              <FieldRow label="Name" icon={User}>
                {isEditing ? (
                  <div>
                    <Input
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                ) : (
                  <span className="text-text-dark dark:text-foreground">{user.name}</span>
                )}
              </FieldRow>

              {/* Email — never editable (security) */}
              <FieldRow label="Email" icon={Mail}>
                <span className="text-text-dark dark:text-foreground">{user.email}</span>
                {isEditing && (
                  <span className="text-xs text-text-light ml-2">(cannot be changed here)</span>
                )}
              </FieldRow>

              {/* Institution */}
              <FieldRow label="Institution" icon={Briefcase}>
                {isEditing ? (
                  <Input
                    value={formData.institution}
                    onChange={e => setFormData(p => ({ ...p, institution: e.target.value }))}
                    placeholder="e.g., University of Nairobi"
                  />
                ) : (
                  <span className="text-text-dark dark:text-foreground">
                    {user.institution || <span className="text-text-light italic">Not set</span>}
                  </span>
                )}
              </FieldRow>

              {/* Level */}
              <FieldRow label="Level" icon={Award}>
                {isEditing ? (
                  <Select
                    value={formData.level}
                    onValueChange={v => setFormData(p => ({ ...p, level: v }))}
                  >
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
                  <span className="text-text-dark dark:text-foreground capitalize">
                    {user.level?.replace('-', ' ') || 'Not set'}
                  </span>
                )}
              </FieldRow>

              {/* Bio */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2 text-green-700 col-span-1">Bio</Label>
                <div className="col-span-3">
                  {isEditing ? (
                    <div>
                      <Textarea
                        value={formData.bio}
                        onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                        placeholder="Tell others a little about yourself…"
                        rows={4}
                        className={errors.bio ? 'border-red-500' : ''}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.bio
                          ? <p className="text-xs text-red-500">{errors.bio}</p>
                          : <span />
                        }
                        <p className={`text-xs ${formData.bio.length > 280 ? 'text-orange-500' : 'text-text-light'}`}>
                          {formData.bio.length}/300
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-text-dark dark:text-foreground leading-relaxed">
                      {user.bio || <span className="text-text-light italic">No bio yet</span>}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning preferences (read-only for now, settings page handles these) */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="text-green-700">Learning</span> Preferences
              </CardTitle>
              <CardDescription>
                Manage detailed preferences in{' '}
                <a href="/settings" className="text-forest underline underline-offset-2">Settings</a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm text-text-medium">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-text-dark dark:text-foreground mb-1">Theme</p>
                  <p>Managed in Settings</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-text-dark dark:text-foreground mb-1">Notifications</p>
                  <p>Managed in Settings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function StatRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-forest/10 rounded-lg">
          <Icon className="w-4 h-4 text-forest" />
        </div>
        <span className="text-sm text-text-medium">{label}</span>
      </div>
      <span className="font-semibold text-text-dark dark:text-foreground text-sm">{value}</span>
    </div>
  );
}

function FieldRow({ label, icon: Icon, children }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right text-green-700 col-span-1 flex items-center justify-end gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </Label>
      <div className="col-span-3">{children}</div>
    </div>
  );
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}