// src/utils/avatarColors.js - Avatar Color Generator
export const getAvatarColor = (userId) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-cyan-500'
  ];
  
  const hash = userId?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
  return colors[hash % colors.length];
};

export const getInitials = (name) => {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ');
  
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
};

export const getTextColor = (bgColor) => {
  // All our background colors are dark enough for white text
  return 'text-white';
};