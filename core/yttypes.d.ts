interface VideoEntry {
  // Youtube's video ID
  id: string;
  // Video title
  title: string;
  // Duration of the video in seconds
  duration: number;
}

interface VideoSearchResults {
  // Search query
  title: string;
  entries: VideoEntry[];
}
