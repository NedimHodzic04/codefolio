import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function ProfileSection({ user, onUpdate }) {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [newSkill, setNewSkill] = useState("");
  const [socials, setSocials] = useState({
    linkedin: user?.socials?.linkedin || "",
    twitter: user?.socials?.twitter || "",
    website: user?.socials?.website || "",
  });
  const [loading, setLoading] = useState({
    bio: false,
    location: false,
    skill: false,
    socials: false,
  });
  const [validationErrors, setValidationErrors] = useState({});

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) return;

    if (!isEditingBio) {
      setBio(user.bio || "");
    }
    if (!isEditingLocation) {
      setLocation(user.location || "");
    }
    setSocials({
      linkedin: user.socials?.linkedin || "",
      twitter: user.socials?.twitter || "",
      website: user.socials?.website || "",
    });
  }, [
    user,
    user?.bio,
    user?.location,
    user?.socials?.linkedin,
    user?.socials?.twitter,
    user?.socials?.website,
    isEditingBio,
    isEditingLocation,
  ]);

  const handleSaveBio = async () => {
    setLoading((prev) => ({ ...prev, bio: true }));
    setValidationErrors({});
    try {
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bio");
      }

      const data = await response.json();
      toast.success("Bio updated successfully");
      setIsEditingBio(false);
      if (onUpdate) onUpdate(data.user);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, bio: false }));
    }
  };

  const handleSaveLocation = async () => {
    setLoading((prev) => ({ ...prev, location: true }));
    setValidationErrors({});
    try {
      const response = await fetch(`${apiUrl}/api/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ location }),
      });

      if (!response.ok) {
        throw new Error("Failed to update location");
      }

      const data = await response.json();
      toast.success("Location updated successfully");
      setIsEditingLocation(false);
      if (onUpdate) onUpdate(data.user);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, location: false }));
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) {
      setValidationErrors({ skill: "Skill name cannot be empty" });
      return;
    }

    setLoading((prev) => ({ ...prev, skill: true }));
    setValidationErrors({});
    try {
      const response = await fetch(`${apiUrl}/api/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ skills: newSkill.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to add skill");
      }

      const data = await response.json();
      toast.success("Skill added successfully");
      setNewSkill("");
      if (onUpdate) onUpdate({ ...user, skills: data.skills });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, skill: false }));
    }
  };

  const handleRemoveSkill = async (skillName) => {
    setLoading((prev) => ({ ...prev, skill: true }));
    setValidationErrors({});
    try {
      const response = await fetch(`${apiUrl}/api/skills/${encodeURIComponent(skillName)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to remove skill");
      }

      const data = await response.json();
      toast.success("Skill removed successfully");
      if (onUpdate) onUpdate({ ...user, skills: data.skills });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, skill: false }));
    }
  };

  const validateUrl = (url, fieldName) => {
    if (!url) return true; // Empty is valid
    try {
      new URL(url);
      return true;
    } catch {
      setValidationErrors((prev) => ({
        ...prev,
        [fieldName]: "Please enter a valid URL",
      }));
      return false;
    }
  };

  const handleSaveSocials = async () => {
    setValidationErrors({});
    
    // Validate URLs
    const isLinkedinValid = validateUrl(socials.linkedin, "linkedin");
    const isTwitterValid = validateUrl(socials.twitter, "twitter");
    const isWebsiteValid = validateUrl(socials.website, "website");

    if (!isLinkedinValid || !isTwitterValid || !isWebsiteValid) {
      return;
    }

    setLoading((prev) => ({ ...prev, socials: true }));
    try {
      const response = await fetch(`${apiUrl}/api/socials`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(socials),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update social links");
      }

      const data = await response.json();
      const updatedSocials = {
        linkedin: data.socials?.linkedin || "",
        twitter: data.socials?.twitter || "",
        website: data.socials?.website || "",
      };
      setSocials(updatedSocials);
      toast.success("Social links updated successfully");
      if (onUpdate) onUpdate({ ...user, socials: updatedSocials });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, socials: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your public profile information from GitHub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
              <AvatarFallback>{user?.displayName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-lg">{user?.displayName}</div>
              <div className="text-sm text-muted-foreground">@{user?.username}</div>
            </div>
          </div>

          <Separator />

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            {isEditingBio ? (
              <div className="space-y-3">
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveBio} disabled={loading.bio} size="sm">
                    {loading.bio ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBio(user?.bio || "");
                      setIsEditingBio(false);
                    }}
                    disabled={loading.bio}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-muted-foreground flex-1 min-h-[2rem] flex items-center">
                  {user?.bio || "No bio yet"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingBio(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            {isEditingLocation ? (
              <div className="space-y-3">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveLocation} disabled={loading.location} size="sm">
                    {loading.location ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLocation(user?.location || "");
                      setIsEditingLocation(false);
                    }}
                    disabled={loading.location}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-muted-foreground flex-1 min-h-[2rem] flex items-center">
                  {user?.location || "No location set"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingLocation(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Add your technical skills and expertise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddSkill} className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={newSkill}
                  onChange={(e) => {
                    setNewSkill(e.target.value);
                    setValidationErrors((prev) => ({ ...prev, skill: undefined }));
                  }}
                  placeholder="Add a skill (e.g., React, Node.js)..."
                  disabled={loading.skill}
                />
                {validationErrors.skill && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.skill}</p>
                )}
              </div>
              <Button type="submit" disabled={loading.skill || !newSkill.trim()}>
                {loading.skill ? <Spinner size="sm" /> : "Add"}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {user?.skills && user.skills.length > 0 ? (
              user.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    disabled={loading.skill}
                    className="ml-1 hover:text-destructive rounded-full hover:bg-destructive/10 px-1 transition-colors disabled:opacity-50"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
          <CardDescription>Connect your social media profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              value={socials.linkedin}
              onChange={(e) => {
                setSocials({ ...socials, linkedin: e.target.value });
                setValidationErrors((prev) => ({ ...prev, linkedin: undefined }));
              }}
              placeholder="https://linkedin.com/in/username"
            />
            {validationErrors.linkedin && (
              <p className="text-sm text-destructive">{validationErrors.linkedin}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              type="url"
              value={socials.twitter}
              onChange={(e) => {
                setSocials({ ...socials, twitter: e.target.value });
                setValidationErrors((prev) => ({ ...prev, twitter: undefined }));
              }}
              placeholder="https://twitter.com/username"
            />
            {validationErrors.twitter && (
              <p className="text-sm text-destructive">{validationErrors.twitter}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={socials.website}
              onChange={(e) => {
                setSocials({ ...socials, website: e.target.value });
                setValidationErrors((prev) => ({ ...prev, website: undefined }));
              }}
              placeholder="https://yourwebsite.com"
            />
            {validationErrors.website && (
              <p className="text-sm text-destructive">{validationErrors.website}</p>
            )}
          </div>

          <Button onClick={handleSaveSocials} disabled={loading.socials} className="w-full sm:w-auto">
            {loading.socials ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              "Save Social Links"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
