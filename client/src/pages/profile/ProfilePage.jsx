// src/pages/profile/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Briefcase, Award, Calendar,
  Edit, Camera, Save, X, TrendingUp, BookOpen,
  Loader2, Trash2, Upload
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
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://tlearnapp.onrender.com';

// Resolve avatar URL — handles both relative (/uploaded/…) and absolute URLs
const resolveAvatar = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${SERVER_URL}${url}`;
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  // Profile form state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [errors, setErrors]       = useState({});
  const [formData, setFormData]   = useState({
    name: '', institution: '', level: 'university', bio: '',
  });

  // Avatar state
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [preview, setPreview]       = useState(null);  // local blob URL
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar]   = useState(false);
  const fileInputRef = useRef(null);

  // Sync form with user
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

  // Clean up blob URL on unmount / change
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  // ── Profile save ──────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters';
    if (formData.bio && formData.bio.length > 300)
      errs.bio = `Bio too long (${formData.bio.length}/300)`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await api.patch('/auth/profile', {
        name:        formData.name.trim(),
        institution: formData.institution.trim(),
        level:       formData.level,
        bio:         formData.bio.trim(),
      });
      updateUser(res.user || res);
      toast.success('Profile updated!');
      setIsEditing(false);
      setErrors({});
    } catch (err) {
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) setFormData({
      name: user.name || '', institution: user.institution || '',
      level: user.level || 'university', bio: user.bio || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  // ── Avatar: file selection ────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Please choose a JPEG, PNG, WebP or GIF image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB');
      return;
    }

    // Show local preview instantly — no need to wait for upload
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  // ── Avatar: upload ────────────────────────────────────────────────────────────
  const handleUploadAvatar = async () => {
    if (!selectedFile) return;
    setUploadingAvatar(true);
    try {
      const form = new FormData();
      form.append('avatar', selectedFile);

      const res = await api.post('/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.user || { ...user, avatar: res.avatar });
      toast.success('Profile picture updated!');
      setAvatarDialogOpen(false);
      setPreview(null);
      setSelectedFile(null);
    } catch (err) {
      toast.error(err?.message || 'Upload failed — please try again');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ── Avatar: remove ────────────────────────────────────────────────────────────
  const handleRemoveAvatar = async () => {
    setRemovingAvatar(true);
    try {
      const res = await api.delete('/avatar');
      updateUser(res.user || { ...user, avatar: null });
      toast.success('Profile picture removed');
      setAvatarDialogOpen(false);
    } catch (err) {
      toast.error('Failed to remove picture');
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleDialogClose = () => {
    if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
    setSelectedFile(null);
    setAvatarDialogOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  const avatarSrc = resolveAvatar(user.avatar);

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
        {/* ── Left: avatar card ─────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">

                {/* Avatar with upload button */}
                <div className="relative inline-block mb-4">
                  <Avatar className="w-28 h-28 ring-2 ring-forest/20">
                    <AvatarImage src={avatarSrc} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-forest to-forest-light text-white text-3xl">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Camera button — opens dialog */}
                  <button
                    onClick={() => setAvatarDialogOpen(true)}
                    className="absolute bottom-0 right-0 p-2 bg-forest rounded-full text-white hover:bg-forest-dark transition-all shadow-lg hover:scale-110"
                    title="Change profile picture"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h2 className="text-xl font-bold text-text-dark dark:text-foreground mb-0.5">
                  {user.name}
                </h2>
                <p className="text-sm text-text-medium">{user.email}</p>

                {user.institution && (
                  <Badge className="mt-3" variant="secondary">{user.institution}</Badge>
                )}
                <p className="text-xs text-text-light mt-2 capitalize">
                  {user.level?.replace('-', ' ')}
                </p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <StatRow icon={BookOpen}   label="Sessions"     value={user.stats?.totalSessions  || 0} />
                <StatRow icon={TrendingUp} label="Avg Score"    value={`${user.stats?.averageScore || 0}%`} />
                <StatRow icon={Award}      label="Streak"       value={`${user.streak?.current || 0} days`} />
                <StatRow icon={Calendar}   label="Member since" value={fmtDate(user.createdAt)} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: editable form ─────────────────────────────────── */}
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
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleCancel} variant="outline" size="sm" disabled={saving}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} size="sm" className="bg-forest hover:bg-forest-dark">
                      {saving
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                        : <><Save className="w-4 h-4 mr-2" />Save</>}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
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

              <FieldRow label="Email" icon={Mail}>
                <span className="text-text-dark dark:text-foreground">{user.email}</span>
                {isEditing && <span className="text-xs text-text-light ml-2">(change via Settings)</span>}
              </FieldRow>

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

              <FieldRow label="Level" icon={Award}>
                {isEditing ? (
                  <Select value={formData.level} onValueChange={v => setFormData(p => ({ ...p, level: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                          : <span />}
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

          <Card>
            <CardHeader>
              <CardTitle><span className="text-green-700">Learning</span> Preferences</CardTitle>
              <CardDescription>
                Manage theme, notifications and privacy in{' '}
                <a href="/settings" className="text-forest underline underline-offset-2">Settings</a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm text-text-medium">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-text-dark dark:text-foreground mb-1">Theme & Language</p>
                  <p>Managed in Settings → Appearance</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium text-text-dark dark:text-foreground mb-1">Notifications</p>
                  <p>Managed in Settings → Notifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Avatar Upload Dialog ──────────────────────────────────────────────── */}
      <Dialog open={avatarDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Profile Picture</DialogTitle>
            <DialogDescription>
              Upload a photo — square images work best. Max 5 MB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Preview */}
            <div className="flex justify-center">
              <Avatar className="w-28 h-28 ring-2 ring-forest/20">
                <AvatarImage
                  src={preview || avatarSrc}
                  alt="Preview"
                />
                <AvatarFallback className="bg-gradient-to-br from-forest to-forest-light text-white text-3xl">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Choose file button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              <Upload className="w-4 h-4 mr-2" />
              {selectedFile ? 'Choose a different image' : 'Choose image'}
            </Button>

            {/* Selected file name */}
            {selectedFile && (
              <p className="text-xs text-center text-text-medium truncate px-2">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </p>
            )}

            {/* Upload button — only shown when a file is selected */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <Button
                    className="w-full bg-forest hover:bg-forest-dark"
                    onClick={handleUploadAvatar}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar
                      ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</>
                      : <><Camera className="w-4 h-4 mr-2" />Save profile picture</>}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remove current picture */}
            {avatarSrc && !selectedFile && (
              <Button
                variant="ghost"
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleRemoveAvatar}
                disabled={removingAvatar}
              >
                {removingAvatar
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removing…</>
                  : <><Trash2 className="w-4 h-4 mr-2" />Remove current picture</>}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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