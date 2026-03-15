// src/pages/settings/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Lock,
  Bell,
  Palette,
  Globe,
  Shield,
  Database,
  Download,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/settingsService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    sessionReminders: true,
    goalAchievements: true,
    roomInvites: true,
    weeklyProgress: false,
    emailUpdates: true
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showProgress: true,
    allowRoomInvites: true
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await settingsService.changePassword(passwordData.oldPassword, passwordData.newPassword);
      toast.success('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      toast.loading('Preparing your data...');
      const data = await settingsService.exportData();
      
      // Create download
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tlearn-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Data exported successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to export data');
    }
  };

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDeleteAccount = async () => {
    const password = prompt('Enter your password to confirm account deletion:');
    
    if (!password) return;
    
    if (!confirm('Are you ABSOLUTELY sure? This cannot be undone!')) return;
    
    try {
      await settingsService.deleteAccount(password);
      toast.success('Account deleted. Goodbye!');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');

  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    await settingsService.updateSettings({ language: newLang });
    toast.success('Language updated!');
  };

  const loadSettings = async () => {
    try {
      const settings = await settingsService.getSettings();
      setNotifications(settings.notifications || notifications);
      setPrivacy(settings.privacy || privacy);

      if (settings.language) {
        setLanguage(settings.language);
        i18n.changeLanguage(settings.language);
      }

    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Auto-save notifications when changed
  useEffect(() => {
    const saveNotifications = async () => {
      try {
        await settingsService.updateSettings({ notifications });
        toast.success('Notification settings saved');
      } catch (error) {
        console.error('Failed to save notifications');
      }
    };
    
    // Debounce to avoid too many saves
    const timer = setTimeout(saveNotifications, 1000);
    return () => clearTimeout(timer);
  }, [notifications]);

  // Auto-save privacy when changed
  useEffect(() => {
    const savePrivacy = async () => {
      try {
        await settingsService.updateSettings({ privacy });
        toast.success('Privacy settings saved');
      } catch (error) {
        console.error('Failed to save privacy');
      }
    };
    
    const timer = setTimeout(savePrivacy, 1000);
    return () => clearTimeout(timer);
  }, [privacy]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-DM Mono, monospace text-4xl font-semibold text-green dark:text-foreground mb-2">
          <span className="text-green-700">Settings</span>
        </h1>
        <p className="text-text-medium dark:text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="w-4 h-4 mr-2" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how T.Learn looks for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme</Label>
                  <p className="text-sm text-text-medium">
                    Choose between light and dark theme
                  </p>
                </div>
                <Select value={theme} onValueChange={toggleTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Language</Label>
                  <p className="text-sm text-text-medium">
                    Select your preferred language
                  </p>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Voice Speed</Label>
                  <p className="text-sm text-text-medium">
                    Adjust AI voice response speed
                  </p>
                </div>
                <Select defaultValue="normal">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Feedback Detail</Label>
                  <p className="text-sm text-text-medium">
                    How detailed should AI feedback be
                  </p>
                </div>
                <Select defaultValue="detailed">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Current Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="oldPassword"
                    type={showOldPassword ? 'text' : 'password'}
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="mt-2"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={loading}
                className="w-full bg-gradient-to-r from-forest to-forest-light"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingToggle
                label="Session Reminders"
                description="Get notified about upcoming teaching sessions"
                checked={notifications.sessionReminders}
                onCheckedChange={(checked) => setNotifications({ ...notifications, sessionReminders: checked })}
              />
              <Separator />
              <SettingToggle
                label="Goal Achievements"
                description="Celebrate when you reach your learning goals"
                checked={notifications.goalAchievements}
                onCheckedChange={(checked) => setNotifications({ ...notifications, goalAchievements: checked })}
              />
              <Separator />
              <SettingToggle
                label="Room Invites"
                description="Get notified when someone invites you to a study room"
                checked={notifications.roomInvites}
                onCheckedChange={(checked) => setNotifications({ ...notifications, roomInvites: checked })}
              />
              <Separator />
              <SettingToggle
                label="Weekly Progress Report"
                description="Receive a summary of your weekly learning progress"
                checked={notifications.weeklyProgress}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyProgress: checked })}
              />
              <Separator />
              <SettingToggle
                label="Email Updates"
                description="Get email updates about new features and tips"
                checked={notifications.emailUpdates}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailUpdates: checked })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and data sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-text-medium">
                    Who can see your profile
                  </p>
                </div>
                <Select
                  value={privacy.profileVisibility}
                  onValueChange={(value) => setPrivacy({ ...privacy, profileVisibility: value })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="members">Members</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <SettingToggle
                label="Show Progress"
                description="Allow others to see your learning progress"
                checked={privacy.showProgress}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, showProgress: checked })}
              />

              <Separator />

              <SettingToggle
                label="Allow Room Invites"
                description="Let others invite you to study rooms"
                checked={privacy.allowRoomInvites}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, allowRoomInvites: checked })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Storage Settings */}
        <TabsContent value="data" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export or delete your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-forest" />
                  <div>
                    <h4 className="font-semibold">Export Your Data</h4>
                    <p className="text-sm text-text-medium">Download all your learning data</p>
                  </div>
                </div>
                <Button onClick={handleExportData} variant="outline">
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <div>
                    <h4 className="font-semibold text-destructive">Delete Account</h4>
                    <p className="text-sm text-text-medium">Permanently delete your account and all data</p>
                  </div>
                </div>
                <Button onClick={handleDeleteAccount} variant="destructive">
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Setting Toggle Component
const SettingToggle = ({ label, description, checked, onCheckedChange }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5 flex-1">
        <Label>{label}</Label>
        <p className="text-sm text-text-medium">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};

export default SettingsPage;