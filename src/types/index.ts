export interface Story {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  sections: StorySection[];
  created_at: string;
  likes: number;
  audio_url?: string;
}

export interface StorySection {
  text: string;
  image_url?: string;
}

export interface VoiceProfile {
  id: string;
  user_id: string;
  name: string;
  audio_url: string;
  created_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  story_id: string;
  vote: 'up' | 'down';
}
