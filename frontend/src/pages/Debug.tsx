import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import ApiService from '@/services/api.service';

export const Debug = () => {
  const { user, isAuthenticated, login } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [apiTest, setApiTest] = useState<any>(null);

  const log = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    log('Debug component mounted');
    log(`Is authenticated: ${isAuthenticated}`);
    log(`User: ${user ? JSON.stringify(user) : 'null'}`);
    log(`Token in localStorage: ${localStorage.getItem('token') ? 'exists' : 'not found'}`);
    log(`API URL: ${import.meta.env.VITE_API_URL}`);
  }, [isAuthenticated, user]);

  const testLogin = async () => {
    try {
      log('Testing login...');
      const response = await ApiService.login({
        email: 'admin@example.com',
        password: 'admin123'
      });
      log(`Login response: ${JSON.stringify(response)}`);
      
      if (response.success) {
        login(response.data.token, response.data.user);
        log('Login successful, user set in context');
      }
    } catch (error: any) {
      log(`Login error: ${error.message}`);
    }
  };

  const testDashboard = async () => {
    try {
      log('Testing dashboard API...');
      const response = await ApiService.getDashboard();
      log(`Dashboard response: ${JSON.stringify(response)}`);
      setApiTest(response);
    } catch (error: any) {
      log(`Dashboard error: ${error.message}`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    log('LocalStorage cleared');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>User:</strong> {user ? user.email : 'None'}
              </div>
              <div>
                <strong>Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}
              </div>
              <div>
                <strong>API URL:</strong> {import.meta.env.VITE_API_URL}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={testLogin}>Test Login</Button>
              <Button onClick={testDashboard}>Test Dashboard API</Button>
              <Button onClick={clearStorage} variant="destructive">Clear Storage</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {apiTest ? JSON.stringify(apiTest, null, 2) : 'No test result yet'}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                  {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
