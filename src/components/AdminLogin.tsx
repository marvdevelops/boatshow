import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Lock, User, Shield } from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  password: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  createdAt: string;
}

interface AdminLoginProps {
  onLogin: (user: AdminUser) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`https://sloltfzjerisswqmhcwk.supabase.co/functions/v1/make-server-ec240367/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsb2x0ZnpqZXJpc3N3cW1oY3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5ODQ2MjksImV4cCI6MjA3NzU2MDYyOX0.3c0TWWK-0ZvcbuLOHQTxbN2nzkGDCbOC9Y8WnlezeAw`,
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store access token in localStorage for persistence
      if (data.access_token) {
        localStorage.setItem('qbs_access_token', data.access_token);
      }

      const user: AdminUser = {
        id: data.user.id,
        username: data.user.username,
        password: '', // Don't store password
        role: data.user.role,
        permissions: data.user.permissions,
        createdAt: '',
      };

      toast.success(`✅ Welcome, ${user.username}!`);
      onLogin(user);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(`❌ ${error.message || 'Invalid username or password'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2647] to-[#1a4d7a] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-[#0A2647]" />
          </div>
          <div>
            <CardTitle className="text-2xl text-[#0A2647]">Qatar Boat Show 2025</CardTitle>
            <p className="text-gray-600 mt-2">Admin Dashboard Login</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!username || !password || isLoading}
            className="w-full bg-[#0A2647] hover:bg-[#D4AF37] hover:text-[#0A2647]"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-xs text-blue-800 mb-2">Default Credentials:</p>
            <p className="text-xs text-blue-700">
              <strong>Super Admin:</strong> superadmin / super123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
