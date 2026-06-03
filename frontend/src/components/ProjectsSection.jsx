import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ProjectsSection({ user }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    githubLink: "",
    liveDemo: "",
    imageUrl: "",
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/projects`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGitHub = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`${apiUrl}/api/projects/sync`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to sync GitHub repositories");
      }

      const data = await response.json();
      toast.success(`Successfully synced ${data.count} repositories from GitHub`);
      await fetchProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setValidationErrors({ title: "Title is required" });
      return;
    }

    setSubmitting(true);
    setValidationErrors({});
    try {
      const techStackArray = formData.techStack
        ? formData.techStack.split(",").map((tech) => tech.trim())
        : [];

      const response = await fetch(`${apiUrl}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          techStack: techStackArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create project");
      }

      toast.success("Project created successfully");
      setIsAddDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        techStack: "",
        githubLink: "",
        liveDemo: "",
        imageUrl: "",
      });
      await fetchProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setValidationErrors({ title: "Title is required" });
      return;
    }

    setSubmitting(true);
    setValidationErrors({});
    try {
      const techStackArray = formData.techStack
        ? formData.techStack.split(",").map((tech) => tech.trim())
        : [];

      const response = await fetch(`${apiUrl}/api/projects/${selectedProject._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          techStack: techStackArray,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update project");
      }

      toast.success("Project updated successfully");
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/projects/${selectedProject._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete project");
      }

      toast.success("Project deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
      await fetchProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleVisibility = async (project) => {
    try {
      const response = await fetch(`${apiUrl}/api/projects/${project._id}/visibility`, {
        method: "PATCH",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to toggle visibility");
      }

      const data = await response.json();
      toast.success(data.message);
      await fetchProjects();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEditDialog = (project) => {
    setSelectedProject(project);
    setValidationErrors({});
    setFormData({
      title: project.title || "",
      description: project.description || "",
      techStack: Array.isArray(project.techStack) ? project.techStack.join(", ") : "",
      githubLink: project.githubLink || "",
      liveDemo: project.liveDemo || "",
      imageUrl: project.imageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSyncGitHub} disabled={syncing} variant="outline">
          {syncing ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Syncing...
            </>
          ) : (
            "Re-Sync GitHub"
          )}
        </Button>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Custom Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Custom Project</DialogTitle>
              <DialogDescription>
                Add a project that's not on GitHub or customize project details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-title">Title *</Label>
                <Input
                  id="add-title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    setValidationErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  placeholder="My Awesome Project"
                  required
                />
                {validationErrors.title && (
                  <p className="text-sm text-destructive">{validationErrors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief description of your project..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-techStack">Tech Stack</Label>
                <Input
                  id="add-techStack"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="React, Node.js, MongoDB (comma-separated)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-githubLink">GitHub Link</Label>
                <Input
                  id="add-githubLink"
                  type="url"
                  value={formData.githubLink}
                  onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-liveDemo">Live Demo URL</Label>
                <Input
                  id="add-liveDemo"
                  type="url"
                  value={formData.liveDemo}
                  onChange={(e) => setFormData({ ...formData, liveDemo: e.target.value })}
                  placeholder="https://myproject.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-imageUrl">Image URL</Label>
                <Input
                  id="add-imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.png"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects List */}
      {loading && projects.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Spinner size="lg" />
              <p>Loading projects...</p>
            </div>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <span className="font-mono">No projects yet. Add a custom project or sync from GitHub.</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => {
            // Handle legacy projects without isVisible field (treat as visible)
            const isVisible = project.isVisible !== undefined ? project.isVisible : true;
            return (
              <Card key={project._id} className={!isVisible ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="truncate">{project.title}</CardTitle>
                        {!isVisible && (
                          <Badge variant="outline" className="text-xs">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      {project.language && (
                        <Badge variant="secondary" className="mt-2">
                          {project.language}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.map((tech, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.githubLink && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                          GitHub
                        </a>
                      </Button>
                    )}
                    {project.liveDemo && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={project.liveDemo} target="_blank" rel="noopener noreferrer">
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(project)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(project)}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`visibility-${project._id}`} className="text-xs text-muted-foreground cursor-pointer">
                        {isVisible ? "Visible" : "Hidden"}
                      </Label>
                      <Switch
                        id={`visibility-${project._id}`}
                        checked={isVisible}
                        onCheckedChange={() => handleToggleVisibility(project)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details and links.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  setValidationErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="My Awesome Project"
                required
              />
              {validationErrors.title && (
                <p className="text-sm text-destructive">{validationErrors.title}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of your project..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-techStack">Tech Stack</Label>
              <Input
                id="edit-techStack"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                placeholder="React, Node.js, MongoDB (comma-separated)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-githubLink">GitHub Link</Label>
              <Input
                id="edit-githubLink"
                type="url"
                value={formData.githubLink}
                onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                placeholder="https://github.com/username/repo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-liveDemo">Live Demo URL</Label>
              <Input
                id="edit-liveDemo"
                type="url"
                value={formData.liveDemo}
                onChange={(e) => setFormData({ ...formData, liveDemo: e.target.value })}
                placeholder="https://myproject.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.png"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
