import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Search, Upload, Play, Eye, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  uploadedAt: string;
  channel: string;
}

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [lengthFilter, setLengthFilter] = useState<"all" | "short" | "medium" | "long">("all");
  const [uploadThumbnail, setUploadThumbnail] = useState<File | null>(null);
  const [videos, setVideos] = useState<Video[]>([
    {
      id: "1",
      title: "Beautiful Nature Documentary",
      description: "Explore the wonders of nature in this stunning 4K documentary.",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop&crop=center",
      duration: "15:32",
      views: "1.2M",
      uploadedAt: "2 days ago",
      channel: "Nature World"
    },
    {
      id: "2",
      title: "Modern Web Development Tutorial",
      description: "Learn the latest web development techniques with React and TypeScript.",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=450&fit=crop&crop=center",
      duration: "28:45",
      views: "856K",
      uploadedAt: "1 week ago",
      channel: "CodeMaster"
    },
    {
      id: "3",
      title: "Urban Photography Tips",
      description: "Master the art of urban photography with these professional tips.",
      thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=450&fit=crop&crop=center",
      duration: "12:18",
      views: "423K",
      uploadedAt: "3 days ago",
      channel: "PhotoPro"
    },
    {
      id: "4",
      title: "Cooking Masterclass: Italian Cuisine",
      description: "Learn to cook authentic Italian dishes from a professional chef.",
      thumbnail: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=450&fit=crop&crop=center",
      duration: "35:22",
      views: "2.1M",
      uploadedAt: "5 days ago",
      channel: "Chef's Table"
    },
    {
      id: "5",
      title: "Space Exploration Documentary",
      description: "Journey through the cosmos and discover the mysteries of space.",
      thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=450&fit=crop&crop=center",
      duration: "42:15",
      views: "3.4M",
      uploadedAt: "1 week ago",
      channel: "Cosmos TV"
    },
    {
      id: "6",
      title: "Minimalist Home Design",
      description: "Transform your living space with minimalist design principles.",
      thumbnail: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=450&fit=crop&crop=center",
      duration: "18:37",
      views: "678K",
      uploadedAt: "4 days ago",
      channel: "Design Studio"
    }
  ]);

  const handleUpload = async () => {
  if (!uploadTitle.trim() || !uploadDescription.trim() || !uploadFile) {
    toast({
      title: "Error",
      description: "Please fill in all fields and select a video file.",
      variant: "destructive"
    });
    return;
  }

  const fileExt = uploadFile.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `videos/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(filePath, uploadFile);

  if (uploadError) {
    toast({
      title: "Upload failed",
      description: uploadError.message,
      variant: "destructive",
    });
    return;
  }

  const { data: publicUrlData } = supabase
    .storage
    .from("videos")
    .getPublicUrl(filePath);

  const videoUrl = publicUrlData.publicUrl;

  // Save to Supabase DB
  /*const { data, error: insertError } = await supabase
    .from("videos")
    .insert([
      {
        title: uploadTitle,
        description: uploadDescription,
        video_url: videoUrl,
      }
    ])
    .select()
    .single();

  if (insertError) {
    toast({
      title: "Error saving metadata",
      description: insertError.message,
      variant: "destructive"
    });
    return;
  }
  */

  // Update local UI
  const newVideo: Video = {
    id: Date.now().toString(),
    title: uploadTitle,
    description: uploadDescription,
    thumbnail: uploadThumbnail ? URL.createObjectURL(uploadThumbnail) : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=450&fit=crop&crop=center",
    duration: "0:00",
    views: "0",
    uploadedAt: "Just now",
    channel: "Your Channel"
  };

  setVideos([newVideo, ...videos]);
  setUploadTitle("");
  setUploadDescription("");
  setUploadFile(null);
  setUploadOpen(false);

  toast({
    title: "Upload Successful",
    description: "Your video has been uploaded.",
  });
};

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());

    const [minutes, seconds] = video.duration.split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds;

    const matchesLength =
      lengthFilter === "all" ||
      (lengthFilter === "short" && totalSeconds < 5 * 60) ||
      (lengthFilter === "medium" && totalSeconds >= 5 * 60 && totalSeconds <= 20 * 60) ||
      (lengthFilter === "long" && totalSeconds > 20 * 60);

    return matchesSearch && matchesLength;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-white fill-current" />
              </div>
              <h1 className="text-xl font-bold text-white font-mono">VideoHub</h1>
            </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1 max-w-3xl mx-8">
            {/* Search Bar */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-red-500"
                />
              </div>

            {/* Duration Filter Dropdown */}
              <div className="w-full md:w-auto">
                <select
                value={lengthFilter}
                onChange={(e) => setLengthFilter(e.target.value as any)}
                className="bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 w-full"
                >
                  <option value="all">All Lengths</option>
                  <option value="short">Short (&lt; 5 min)</option>
                  <option value="medium">Medium (5–20 min)</option>
                  <option value="long">Long (&gt; 20 min)</option>
                  </select>
              </div>
          </div>
        

            {/* Upload Button */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Upload Video</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="Enter video title..."
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Enter video description..."
                      className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                    />
                  </div>

                    <div>
                      <Label htmlFor="thumbnailFile">Thumbnail Image</Label>
                      <Input
                        id="thumbnailFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setUploadThumbnail(e.target.files?.[0] || null)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  <div>
                      <Label htmlFor="videoFile">Video File</Label>
                      <Input
                        id="videoFile"
                        type="file"
                        accept="video/*"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  <Button onClick={handleUpload} className="w-full bg-red-600 hover:bg-red-700">
                    Upload Video
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 leading-tight">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                  {video.description}
                </p>
                <div className="text-gray-400 text-xs space-y-1">
                  <div className="font-medium">{video.channel}</div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{video.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{video.uploadedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No videos found matching your search.</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
