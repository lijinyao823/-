import { Photo } from '../types';

export const MOCK_PHOTOS: Photo[] = [
  {
    id: '1',
    title: '南湖晨曦',
    author: '张三',
    category: 'scenery',
    url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1000',
    likes: 128,
    description: '清晨的南湖校区，阳光洒在图书馆的玻璃幕墙上，波光粼粼。',
    exif: {
      iso: '100',
      shutter: '1/200s',
      aperture: 'f/8.0',
      camera: 'Sony A7R IV'
    }
  },
  {
    id: '2',
    title: '鉴湖书声',
    author: '李四',
    category: 'humanities',
    url: 'https://images.unsplash.com/photo-1523050335456-adaba8f89762?auto=format&fit=crop&q=80&w=1000',
    likes: 85,
    description: '鉴湖边，学子们正在晨读，这是武理最美的风景。',
    exif: {
      iso: '400',
      shutter: '1/125s',
      aperture: 'f/2.8',
      camera: 'Canon EOS R5'
    }
  },
  {
    id: '3',
    title: '校运动会精彩瞬间',
    author: '王五',
    category: 'activity',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1000',
    likes: 210,
    description: '百米冲刺的瞬间，汗水与激情的碰撞。',
    exif: {
      iso: '800',
      shutter: '1/4000s',
      aperture: 'f/4.0',
      camera: 'Nikon Z9'
    }
  },
  {
    id: '4',
    title: '马房山秋色',
    author: '赵六',
    category: 'scenery',
    url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1000',
    likes: 156,
    description: '秋天的马房山校区，银杏叶落满地，一片金黄。',
    exif: {
      iso: '200',
      shutter: '1/500s',
      aperture: 'f/5.6',
      camera: 'Fujifilm X-T4'
    }
  },
  {
    id: '5',
    title: '实验室的专注',
    author: '孙七',
    category: 'humanities',
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000',
    likes: 92,
    description: '深夜的实验室，科研人的坚持。',
    exif: {
      iso: '1600',
      shutter: '1/60s',
      aperture: 'f/1.8',
      camera: 'Sony A7S III'
    }
  },
  {
    id: '6',
    title: '毕业典礼',
    author: '周八',
    category: 'activity',
    url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1000',
    likes: 340,
    description: '拨穗礼成，从此跃入人海，各有灿烂。',
    exif: {
      iso: '200',
      shutter: '1/1000s',
      aperture: 'f/4.0',
      camera: 'Canon EOS R6'
    }
  }
];
