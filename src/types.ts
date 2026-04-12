export interface Photo {
  id: string;
  title: string;
  author: string;
  category: 'scenery' | 'humanities' | 'activity';
  url: string;
  likes: number;
  description: string;
  exif: {
    iso: string;
    shutter: string;
    aperture: string;
    camera: string;
  };
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}
