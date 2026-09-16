import { Post } from '../types';

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    author: 'Rian Pratama',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    authorId: 'author-rian-pratama',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Jalan rusak parah berlubang di jalan utama arah pasar. Banyak pengendara motor hampir tergelincir, mohon dinas terkait segera tambal!',
    mood: '😡',
    moodLabel: 'Geram / Rusak',
    location: 'Palu Timur',
    coordinates: { lat: -0.892, lng: 119.885 },
    createdAt: '15 menit yang lalu',
    caresCount: 24,
    isCared: false,
    isOwn: false,
    category: 'laporan',
    comments: [
      {
        id: 'c1',
        author: 'Rian Pratama',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        text: 'Iya betul bro, tadi pagi saya hampir jatuh lewat situ pas hujan.',
        createdAt: '10 menit yang lalu'
      },
      {
        id: 'c2',
        author: 'Siti Rahma',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        text: 'Sudah dilaporkan ke kelurahan juga, semoga lekas diperbaiki 🙏',
        createdAt: '5 menit yang lalu'
      }
    ]
  },
  {
    id: 'post-video-1',
    author: 'Doni Pratama',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    authorId: 'author-doni-pratama',
    imageUrl: '/sample-video.mp4',
    mediaType: 'video',
    caption: '🎥 Rekaman video kondisi jalan & ombak di pesisir Teluk Palu sore ini. Angin cukup kencang, warga yang melintas harap kurangi kecepatan.',
    mood: '⚠️',
    moodLabel: 'Waspada / Bahaya',
    location: 'Pantai Talise',
    coordinates: { lat: -0.878, lng: 119.872 },
    createdAt: '25 menit yang lalu',
    caresCount: 53,
    isCared: false,
    isOwn: false,
    category: 'info',
    comments: [
      {
        id: 'cv1',
        author: 'Doni Pratama',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        text: 'Makasih infonya min, barusan lewat memang ombaknya naik ke tanggul.',
        createdAt: '18 menit yang lalu'
      }
    ]
  },
  {
    id: 'post-2',
    author: 'Fajar Kurniawan',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    authorId: 'author-fajar-kurniawan',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Banjir di BTN semata kaki karena saluran air tersumbat sampah ranting. Warga sekitar lagi gotong royong membersihkan selokan.',
    mood: '😢',
    moodLabel: 'Sedih / Bencana',
    location: 'Palu Barat',
    coordinates: { lat: -0.899, lng: 119.845 },
    createdAt: '42 menit yang lalu',
    caresCount: 38,
    isCared: false,
    isOwn: false,
    category: 'darurat',
    comments: [
      {
        id: 'c3',
        author: 'Fajar Kurniawan',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
        text: 'Semangat warga! Ada yang butuh bantuan perahu karet atau logistik?',
        createdAt: '30 menit yang lalu'
      }
    ]
  },
  {
    id: 'post-3',
    author: 'Nabila Syakieb',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    authorId: 'author-nabila-syakieb',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    caption: 'Sunset sore ini di Pantai Talise masyaAllah magis banget! Langit jingga keemasan bikin hati adem setelah seharian kerja.',
    mood: '☕',
    moodLabel: 'Santai / Nongkrong',
    location: 'Pantai Talise',
    coordinates: { lat: -0.875, lng: 119.870 },
    createdAt: '2 jam yang lalu',
    caresCount: 65,
    isCared: false,
    isOwn: false,
    category: 'santai',
    comments: [
      {
        id: 'c4',
        author: 'Nabila Syakieb',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        text: 'Keren banget pemandangannya! Nanti sore mau jogging ke sana ah.',
        createdAt: '1 jam yang lalu'
      }
    ]
  },
  {
    id: 'post-4',
    author: 'Andi Setiawan',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    authorId: 'author-andi-setiawan',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80',
    caption: 'Ngopi santai di cafe rooftop baru Tondo. Angin sejuk view perbukitan, cocok banget buat nugas atau sharing ide.',
    mood: '☕',
    moodLabel: 'Santai / Nongkrong',
    location: 'Mantikulore (Tondo)',
    coordinates: { lat: -0.865, lng: 119.895 },
    createdAt: '3 jam yang lalu',
    caresCount: 41,
    isCared: false,
    isOwn: false,
    category: 'santai',
    comments: []
  },
  {
    id: 'post-5',
    author: 'Budi Santoso',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    authorId: 'author-budi-santoso',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
    caption: 'Kaledo terenak se-Palu Selatan! Kuah asam pedasnya nendang, sumsumnya lumer di mulut. Wajib dicoba kalau mampir ke sini 🤤',
    mood: '🍜',
    moodLabel: 'Kuliner / Enak',
    location: 'Palu Selatan',
    coordinates: { lat: -0.925, lng: 119.892 },
    createdAt: '5 jam yang lalu',
    caresCount: 82,
    isCared: false,
    isOwn: false,
    category: 'kuliner',
    comments: [
      {
        id: 'c5',
        author: 'Budi Santoso',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        text: 'Langganan saya ini! Sambel uleknya juara dunia.',
        createdAt: '4 jam yang lalu'
      }
    ]
  }
];
