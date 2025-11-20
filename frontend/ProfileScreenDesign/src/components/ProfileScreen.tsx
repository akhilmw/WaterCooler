import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { HelpCircle, Heart, Star, Mic, Edit, Save } from "lucide-react";
import { useState } from "react";

export function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    bio: "Creative problem solver with a passion for helping others grow. I believe in the power of community and mutual support.",
    wantHelpWith: "Public speaking and presentation skills, building a personal brand, and networking strategies.",
    canProvide: "Web development guidance, career mentorship in tech, and design thinking workshops.",
    goodAt: "Full-stack development, UI/UX design, team collaboration, and problem solving."
  });

  const [recordingField, setRecordingField] = useState<string | null>(null);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
    console.log("Saving profile data:", profileData);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleRecord = (field: string) => {
    if (recordingField === field) {
      // Stop recording
      setRecordingField(null);
      console.log(`Stopped recording for ${field}`);
    } else {
      // Start recording
      setRecordingField(field);
      console.log(`Started recording for ${field}`);
      // Here you would implement actual voice recording functionality
    }
  };

  const handleChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-0">
          <div className="flex justify-center mb-4">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profileData.image} alt={profileData.name} />
              <AvatarFallback>{profileData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-gray-900">{profileData.name}</h1>
        </CardHeader>
        
        <CardContent className="space-y-6 mt-6">
          {/* Bio Section */}
          <div>
            <h2 className="text-gray-900 mb-2">Bio</h2>
            {isEditing ? (
              <Textarea
                value={profileData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="min-h-[80px]"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-600">{profileData.bio}</p>
            )}
          </div>

          {/* Question 1: What do you want help with */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-gray-900">What do you want help with?</h3>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Textarea
                  value={profileData.wantHelpWith}
                  onChange={(e) => handleChange('wantHelpWith', e.target.value)}
                  className="min-h-[100px] flex-1"
                  placeholder="What would you like assistance with?"
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
              <h3 className="text-gray-900">What help can you provide?</h3>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Textarea
                  value={profileData.canProvide}
                  onChange={(e) => handleChange('canProvide', e.target.value)}
                  className="min-h-[100px] flex-1"
                  placeholder="How can you help others?"
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
              <h3 className="text-gray-900">What are you good at?</h3>
            </div>
            {isEditing ? (
              <div className="flex gap-2">
                <Textarea
                  value={profileData.goodAt}
                  onChange={(e) => handleChange('goodAt', e.target.value)}
                  className="min-h-[100px] flex-1"
                  placeholder="What are your strengths and skills?"
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
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Save Profile
              </Button>
            ) : (
              <Button onClick={handleEdit} variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}