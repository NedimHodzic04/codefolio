import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
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

export default function EducationSection({ user }) {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] = useState(null);
  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/education`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch education (${response.status})`);
      }

      const data = await response.json();
      setEducation(data);
    } catch (err) {
      console.error("Error fetching education:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      setValidationErrors({ endDate: "End date must be after start date" });
      return;
    }

    setSubmitting(true);
    setValidationErrors({});
    try {
      const response = await fetch(`${apiUrl}/api/education`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create education entry");
      }

      toast.success("Education entry created successfully");
      setIsAddDialogOpen(false);
      setFormData({
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      await fetchEducation();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEducation = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      setValidationErrors({ endDate: "End date must be after start date" });
      return;
    }

    setSubmitting(true);
    setValidationErrors({});
    try {
      const response = await fetch(`${apiUrl}/api/education/${selectedEducation._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update education entry");
      }

      toast.success("Education entry updated successfully");
      setIsEditDialogOpen(false);
      setSelectedEducation(null);
      await fetchEducation();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEducation = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/education/${selectedEducation._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete education entry");
      }

      toast.success("Education entry deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedEducation(null);
      await fetchEducation();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (edu) => {
    setSelectedEducation(edu);
    setValidationErrors({});
    setFormData({
      institution: edu.institution || "",
      degree: edu.degree || "",
      fieldOfStudy: edu.fieldOfStudy || "",
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : "",
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : "",
      description: edu.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (edu) => {
    setSelectedEducation(edu);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6">
      {/* Add Education Button */}
      <div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Education</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Education</DialogTitle>
              <DialogDescription>
                Add your academic background and certifications.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEducation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="add-institution">Institution *</Label>
                <Input
                  id="add-institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="University of Example"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-degree">Degree *</Label>
                <Input
                  id="add-degree"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  placeholder="Bachelor of Science"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-fieldOfStudy">Field of Study *</Label>
                <Input
                  id="add-fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                  placeholder="Computer Science"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-startDate">Start Date *</Label>
                  <Input
                    id="add-startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-endDate">End Date</Label>
                  <Input
                    id="add-endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      setValidationErrors((prev) => ({ ...prev, endDate: undefined }));
                    }}
                  />
                  {validationErrors.endDate && (
                    <p className="text-sm text-destructive">{validationErrors.endDate}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Leave empty if currently enrolled</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Relevant coursework, achievements, activities..."
                  rows={3}
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
                    "Add Education"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Education List */}
      {loading && education.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Spinner size="lg" />
              <p>Loading education...</p>
            </div>
          </CardContent>
        </Card>
      ) : education.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              No education entries yet. Add your academic background to get started.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <Card key={edu._id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{edu.institution}</CardTitle>
                    <CardDescription className="mt-1">
                      {edu.degree} in {edu.fieldOfStudy}
                    </CardDescription>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {edu.description && (
                  <p className="text-sm text-muted-foreground">
                    {edu.description}
                  </p>
                )}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(edu)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(edu)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
            <DialogDescription>
              Update your education details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEducation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-institution">Institution *</Label>
              <Input
                id="edit-institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="University of Example"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-degree">Degree *</Label>
              <Input
                id="edit-degree"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                placeholder="Bachelor of Science"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-fieldOfStudy">Field of Study *</Label>
              <Input
                id="edit-fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                placeholder="Computer Science"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date *</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    setValidationErrors((prev) => ({ ...prev, endDate: undefined }));
                  }}
                />
                {validationErrors.endDate && (
                  <p className="text-sm text-destructive">{validationErrors.endDate}</p>
                )}
                <p className="text-xs text-muted-foreground">Leave empty if currently enrolled</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Relevant coursework, achievements, activities..."
                rows={3}
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
            <DialogTitle>Delete Education Entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this education entry from {selectedEducation?.institution}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEducation} disabled={submitting}>
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
