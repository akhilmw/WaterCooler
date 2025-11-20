"use client";

import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { HelpCircle, Heart, Star, Mic, Edit, Save, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { Input } from "./ui/input";

export function ProfileScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    image: "",
    wantHelpWith: "",
    canProvide: "",
    goodAt: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed', err);
    }
    router.push('/auth');
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      full_name: profileData.name,
      headline: profileData.bio,
      avatar_url: profileData.image,
      good_at: profileData.goodAt,
      need_help_with: profileData.wantHelpWith,
      want_to_help: profileData.canProvide,
    } as any;

    try {
      const res = await api.post('/profile', payload);
      setIsEditing(false);
          setProfileData((prev) => ({
            ...prev,
            name: (res as any).full_name || prev.name,
            bio: (res as any).headline || prev.bio,
            image: (res as any).avatar_url || prev.image,
            goodAt: (res as any).good_at || prev.goodAt,
            wantHelpWith: (res as any).need_help_with || prev.wantHelpWith,
            canProvide: (res as any).want_to_help || prev.canProvide,
          }));
    } catch (err) {
      console.error('Failed saving profile', err);
      alert((err as any)?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleRecord = async (field: string) => {
    // stop if already recording same field
    if (isRecording && recordingField === field) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setRecordingField(null);
      return;
    }

    // if another recording is active, ignore
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e: any) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const fd = new FormData();
          fd.append('file', blob, 'recording.webm');

          const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
          const apiUrl = base.endsWith('/api/v1') ? `${base}/transcribe` : `${base}/api/v1/transcribe`;

          const res = await fetch(apiUrl, { method: 'POST', body: fd, credentials: 'include' });
          if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `Transcription failed with status ${res.status}`);
          }
          const body = await res.json();
          const transcript = body.text || '';
          setProfileData((prev) => ({
            ...prev,
            [field]: prev[field as keyof typeof prev]
              ? `${(prev as any)[field]} ${transcript}`.trim()
              : transcript,
          }));
        } catch (err: any) {
          console.error('Transcription failed', err);
          const msg = (err?.message || '').toString();
          if (msg.includes('insufficient_quota') || msg.includes('429') || msg.toLowerCase().includes('quota')) {
            alert('Transcription service unavailable (quota or rate limit). Try again later.');
          } else {
            alert(err?.message || 'Transcription failed');
          }
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecordingField(field);
      setIsRecording(true);
    } catch (err) {
      console.error('Could not start recording', err);
      alert('Could not start recording — please allow microphone access');
    }
  };

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // load profile on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
      api.get('/profile/me')
      .then((res) => {
        if (!mounted) return;
        setProfileData((prev) => ({
          ...prev,
          name: (res as any).full_name || prev.name,
          bio: (res as any).headline || prev.bio,
          image: (res as any).avatar_url || prev.image,
          goodAt: (res as any).good_at || prev.goodAt,
          wantHelpWith: (res as any).need_help_with || prev.wantHelpWith,
          canProvide: (res as any).want_to_help || prev.canProvide,
        }));
      })
      .catch((err) => {
        console.debug('No profile loaded', err?.message || err);
      })
      .finally(() => setLoading(false));

    return () => { mounted = false };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Logout Button Header */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>
        
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-0">
            <div className="flex justify-center mb-4">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={profileData.image} alt={profileData.name} />
                <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
            {isEditing ? (
              <div className="flex flex-col items-center gap-2">
                <Input
                  value={profileData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your full name"
                  className="text-center w-64"
                />
                <div className="text-sm text-gray-500">Edit your name</div>
              </div>
            ) : (
              <h1 className="text-gray-900">{profileData.name || 'Unnamed'}</h1>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6 mt-6">
            {/* Bio Section */}
            <div>
              <h2 className="text-gray-900 mb-2 font-semibold">Bio</h2>
              {isEditing ? (
                <div className="space-y-2 w-full">
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    className="min-h-[80px] bg-white border-gray-300 text-gray-900 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                    placeholder={
                      'Bio (hint): Creative problem solver with a passion for helping others grow. I believe in the power of community and mutual support.'
                    }
                  />

                  {/* Avatar URL input + file upload */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2">
                    <Input
                      value={profileData.image}
                      onChange={(e) => handleChange('image', e.target.value)}
                      placeholder="Avatar image URL"
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            try {
                              const fd = new FormData();
                              fd.append('file', file);

                              const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
                              const apiUrl = base.endsWith('/api/v1') ? `${base}/upload/avatar` : `${base}/api/v1/upload/avatar`;

                              const res = await fetch(apiUrl, {
                                method: 'POST',
                                body: fd,
                                credentials: 'include',
                              });

                              if (!res.ok) {
                                const text = await res.text().catch(() => '');
                                throw new Error(text || `Upload failed with status ${res.status}`);
                              }

                              const body = await res.json();
                              handleChange('image', body.url);
                            } catch (err: any) {
                              console.error('Server upload failed', err);
                              alert(err?.message || 'Failed to upload image to server');
                            }
                          }}
                        />
                        <span className="px-3 py-1 border rounded-md bg-gray-50">Upload</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">{profileData.bio}</p>
              )}
            </div>

            {/* Question 1: What do you want help with */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-gray-900 font-semibold">What do you want help with?</h3>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Textarea
                    value={profileData.wantHelpWith}
                    onChange={(e) => handleChange('wantHelpWith', e.target.value)}
                    className="min-h-[100px] flex-1 bg-white border-gray-300 text-gray-900 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                    placeholder={'What would you like assistance with? (e.g., public speaking, networking)'}
                  />
                  <Button
                    type="button"
                    variant={recordingField === 'wantHelpWith' ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={() => handleRecord('wantHelpWith')}
                    className="h-10 w-10 shrink-0"
                  >
                    <Mic className={`w-4 h-4 ${recordingField === 'wantHelpWith' ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">{profileData.wantHelpWith}</p>
              )}
            </div>

            {/* Question 2: What help can you provide */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-rose-600" />
                <h3 className="text-gray-900 font-semibold">What help can you provide?</h3>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Textarea
                    value={profileData.canProvide}
                    onChange={(e) => handleChange('canProvide', e.target.value)}
                    className="min-h-[100px] flex-1 bg-white border-gray-300 text-gray-900 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                    placeholder={'How can you help others? (e.g., web development guidance, mentorship)'}
                  />
                  <Button
                    type="button"
                    variant={recordingField === 'canProvide' ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={() => handleRecord('canProvide')}
                    className="h-10 w-10 shrink-0"
                  >
                    <Mic className={`w-4 h-4 ${recordingField === 'canProvide' ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">{profileData.canProvide}</p>
              )}
            </div>

            {/* Question 3: What are you good at */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-amber-500" />
                <h3 className="text-gray-900 font-semibold">What are you good at?</h3>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Textarea
                    value={profileData.goodAt}
                    onChange={(e) => handleChange('goodAt', e.target.value)}
                    className="min-h-[100px] flex-1 bg-white border-gray-300 text-gray-900 focus-visible:border-blue-500 focus-visible:ring-blue-200"
                    placeholder={'What are your strengths and skills? (e.g., full-stack dev, UX design)'}
                  />
                  <Button
                    type="button"
                    variant={recordingField === 'goodAt' ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={() => handleRecord('goodAt')}
                    className="h-10 w-10 shrink-0"
                  >
                    <Mic className={`w-4 h-4 ${recordingField === 'goodAt' ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">{profileData.goodAt}</p>
              )}
            </div>

            {/* Save/Edit Button */}
            <div className="border-t pt-6 flex justify-end">
              {isEditing ? (
                <Button onClick={handleSave} className="gap-2 bg-blue-600 text-white hover:bg-blue-700 font-medium" disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              ) : (
                <Button onClick={handleEdit} variant="outline" className="gap-2 border-gray-300 text-gray-900 hover:bg-gray-50 font-medium">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

