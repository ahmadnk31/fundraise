import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Progress } from "@/components/ui/progress";
import FileUpload from "@/components/FileUpload";
import ApiService from "@/services/api.service";
import { Campaign } from "@/types";
import { 
  Upload, 
  DollarSign, 
  Calendar, 
  Target, 
  FileText, 
  Camera,
  CheckCircle,
  Loader2
} from "lucide-react";

const CreateCampaign = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;
  
  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    summary: '',
    story: '',
    goalAmount: '',
    deadline: '',
    budgetBreakdown: '',
    coverImage: '',
    additionalMedia: [] as string[],
  });

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load campaign data for editing
  useEffect(() => {
    if (isEditMode && id) {
      loadCampaignForEdit(id);
    }
  }, [isEditMode, id]);

  const loadCampaignForEdit = async (campaignId: string) => {
    try {
      setLoading(true);
      setLoadError(null);
      
      const response = await ApiService.getCampaign(campaignId);
      
      if (response.success && response.data) {
        const campaign = response.data.campaign;
        
        // Pre-fill form with existing campaign data
        setFormData({
          title: campaign.title || '',
          category: campaign.category || '',
          location: campaign.location || '',
          summary: campaign.summary || '',
          story: campaign.story || '',
          goalAmount: campaign.goalAmount || '',
          deadline: campaign.deadline ? new Date(campaign.deadline).toISOString().split('T')[0] : '',
          budgetBreakdown: campaign.budgetBreakdown || '',
          coverImage: campaign.coverImage || '',
          additionalMedia: campaign.additionalMedia || [],
        });
        
        // Set uploaded files state if there are existing images
        if (campaign.coverImage || campaign.additionalMedia?.length) {
          const existingFiles = [];
          if (campaign.coverImage) {
            existingFiles.push({
              publicUrl: campaign.coverImage,
              uploadStatus: 'success'
            });
          }
          campaign.additionalMedia?.forEach((url: string) => {
            existingFiles.push({
              publicUrl: url,
              uploadStatus: 'success'
            });
          });
          setUploadedFiles(existingFiles);
        }
      } else {
        setLoadError('Failed to load campaign data');
      }
    } catch (err) {
      console.error('Error loading campaign:', err);
      setLoadError('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user makes changes
  };

  const handleFileUpload = (files: any[]) => {
    const urls = files.map(f => f.publicUrl).filter(Boolean);
    
    if (currentStep === 2) {
      // Cover image upload
      if (urls.length > 0) {
        setFormData(prev => ({ ...prev, coverImage: urls[0] }));
      }
    } else {
      // Additional media
      setFormData(prev => ({ 
        ...prev, 
        additionalMedia: [...prev.additionalMedia, ...urls] 
      }));
    }
    
    setUploadedFiles(files);
  };

  const validateStep = (step: number): boolean => {
    setError(null);
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError('Campaign title is required');
          return false;
        }
        if (!formData.category) {
          setError('Please select a category');
          return false;
        }
        if (!formData.summary.trim()) {
          setError('Campaign summary is required');
          return false;
        }
        break;
      case 2:
        if (!formData.story.trim()) {
          setError('Campaign story is required');
          return false;
        }
        if (!formData.coverImage) {
          setError('Cover image is required');
          return false;
        }
        break;
      case 3:
        if (!formData.goalAmount || parseFloat(formData.goalAmount) <= 0) {
          setError('Please set a valid fundraising goal');
          return false;
        }
        if (!formData.budgetBreakdown.trim()) {
          setError('Budget breakdown is required');
          return false;
        }
        break;
    }
    
    return true;
  };

  const submitCampaign = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      let result;
      
      if (isEditMode && id) {
        // Update existing campaign
        result = await ApiService.updateCampaign(id, {
          title: formData.title,
          summary: formData.summary,
          story: formData.story,
          category: formData.category,
          location: formData.location,
          goalAmount: formData.goalAmount,
          deadline: formData.deadline || undefined,
          budgetBreakdown: formData.budgetBreakdown,
          coverImage: formData.coverImage,
          additionalMedia: formData.additionalMedia,
        });
      } else {
        // Create new campaign
        result = await ApiService.createCampaign({
          title: formData.title,
          summary: formData.summary,
          story: formData.story,
          category: formData.category,
          location: formData.location,
          goalAmount: formData.goalAmount,
          deadline: formData.deadline || undefined,
          budgetBreakdown: formData.budgetBreakdown,
          coverImage: formData.coverImage,
          additionalMedia: formData.additionalMedia,
        });
      }

      if (result.success) {
        // Redirect to dashboard or campaign page
        const successMessage = isEditMode 
          ? 'Campaign updated successfully!' 
          : 'Campaign created successfully! It will be reviewed before going live.';
        alert(successMessage);
        
        if (isEditMode) {
          // Redirect to the updated campaign
          navigate(`/campaign/${id}`);
        } else {
          // Redirect to dashboard for new campaigns
          navigate('/dashboard');
        }
        // You can redirect here using react-router-dom
        // navigate('/dashboard');
      } else {
        throw new Error(result.message || (isEditMode ? 'Failed to update campaign' : 'Failed to create campaign'));
      }
    } catch (error) {
      console.error('Campaign submission error:', error);
      setError(error instanceof Error ? error.message : (isEditMode ? 'Failed to update campaign' : 'Failed to create campaign'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null); // Clear errors when going back
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Loading state for edit mode */}
      {loading && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading campaign data...</p>
          </div>
        </div>
      )}

      {/* Error state for edit mode */}
      {loadError && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-red-500 mb-4">{loadError}</p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      {!loading && !loadError && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {isEditMode ? 'Edit Your Campaign' : 'Start Your Campaign'}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isEditMode 
                  ? 'Update your campaign details to keep your supporters informed.'
                  : 'Turn your cause into action. Create a campaign that inspires people to support your mission.'
                }
              </p>
            </div>

            {/* Progress Bar */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              
              <div className="flex justify-between mt-4 text-sm">
                <span className={currentStep >= 1 ? "text-primary font-medium" : "text-muted-foreground"}>
                  Basic Info
                </span>
                <span className={currentStep >= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
                  Story & Media
                </span>
                <span className={currentStep >= 3 ? "text-primary font-medium" : "text-muted-foreground"}>
                  Goal & Timeline
                </span>
                <span className={currentStep >= 4 ? "text-primary font-medium" : "text-muted-foreground"}>
                  Review & Launch
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardContent className="p-8">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <FileText className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Tell us about your campaign</h2>
                    <p className="text-muted-foreground">
                      Start with the basics - we'll help you create something amazing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="title">Campaign Title *</Label>
                      <Input 
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Give your campaign a compelling title"
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Make it clear and emotional - this is what people see first
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="animals">Animals & Pets</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="creative">Creative Projects</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City, State"
                        className="mt-2"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="summary">Short Summary *</Label>
                      <Textarea 
                        id="summary"
                        value={formData.summary}
                        onChange={(e) => handleInputChange('summary', e.target.value)}
                        placeholder="Briefly describe what your campaign is about (2-3 sentences)"
                        className="mt-2"
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        This appears in search results and social media previews
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Camera className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Share your story</h2>
                    <p className="text-muted-foreground">
                      Help people connect with your cause through compelling content.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="cover-image">Cover Image *</Label>
                      <div className="mt-2">
                        <FileUpload
                          onUpload={handleFileUpload}
                          maxFiles={1}
                          accept={['image/*']}
                          uploadType="campaign"
                          className="min-h-[200px]"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Upload a compelling cover image for your campaign. Recommended: 1200x630px
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="story">Your Story *</Label>
                      <Textarea 
                        id="story"
                        value={formData.story}
                        onChange={(e) => handleInputChange('story', e.target.value)}
                        placeholder="Tell your story in detail. Why is this important? How will donations help? Be specific and personal."
                        className="mt-2 min-h-[200px]"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Include specific details about how the money will be used
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="additional-media">Additional Photos/Videos</Label>
                      <div className="mt-2">
                        <FileUpload
                          onUpload={(files) => {
                            const urls = files.map(f => f.publicUrl).filter(Boolean);
                            setFormData(prev => ({ 
                              ...prev, 
                              additionalMedia: [...prev.additionalMedia, ...urls] 
                            }));
                          }}
                          maxFiles={5}
                          accept={['image/*', 'video/*']}
                          uploadType="campaign"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add more photos or videos to tell your story (optional)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Target className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Set your goal</h2>
                    <p className="text-muted-foreground">
                      How much do you need to raise and when do you need it?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="goal">Fundraising Goal *</Label>
                      <div className="relative mt-2">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="goal"
                          type="number"
                          value={formData.goalAmount}
                          onChange={(e) => handleInputChange('goalAmount', e.target.value)}
                          placeholder="50000"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Set a realistic goal based on your actual needs
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="deadline">Campaign Deadline</Label>
                      <div className="relative mt-2">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input 
                          id="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => handleInputChange('deadline', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Optional: Set an end date for urgency
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="budget">How will the money be used? *</Label>
                      <Textarea 
                        id="budget"
                        value={formData.budgetBreakdown}
                        onChange={(e) => handleInputChange('budgetBreakdown', e.target.value)}
                        placeholder="Break down exactly how donations will be spent. For example:&#10;• Surgery costs: $50,000&#10;• Hospital stay: $15,000&#10;• Medications: $5,000&#10;• Recovery care: $5,000"
                        className="mt-2"
                        rows={6}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Transparency builds trust - be specific about costs
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <CheckCircle className="w-12 h-12 mx-auto text-success mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Review & Launch</h2>
                    <p className="text-muted-foreground">
                      Almost there! Review your campaign before going live.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Card className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">Campaign Preview</h3>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium">Title:</span> {formData.title || 'Not set'}</p>
                          <p><span className="font-medium">Category:</span> {formData.category || 'Not set'}</p>
                          <p><span className="font-medium">Goal:</span> ${formData.goalAmount || '0'}</p>
                          <p><span className="font-medium">Location:</span> {formData.location || 'Not set'}</p>
                          {formData.deadline && (
                            <p><span className="font-medium">Deadline:</span> {new Date(formData.deadline).toLocaleDateString()}</p>
                          )}
                          <p><span className="font-medium">Cover Image:</span> {formData.coverImage ? 'Uploaded' : 'Not uploaded'}</p>
                          <p><span className="font-medium">Additional Media:</span> {formData.additionalMedia.length} files</p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="bg-muted/30 rounded-lg p-6">
                      <h3 className="font-semibold mb-4">Before you launch:</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">I have read and agree to the Terms of Service</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">I understand that FundRaise charges a 2.9% + $0.30 fee per donation</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">I will provide updates to donors about the campaign progress</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm">All information provided is truthful and accurate</span>
                        </label>
                      </div>
                    </div>

                    <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                      <h4 className="font-semibold text-success mb-2">🎉 Ready to launch!</h4>
                      <p className="text-sm text-success/80">
                        Your campaign will be live immediately after you click "Launch Campaign"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < totalSteps ? (
                  <Button 
                    onClick={nextStep}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    onClick={submitCampaign}
                    disabled={isSubmitting}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    {isSubmitting ? (isEditMode ? 'Updating Campaign...' : 'Creating Campaign...') : (isEditMode ? 'Update Campaign' : 'Launch Campaign')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CreateCampaign;