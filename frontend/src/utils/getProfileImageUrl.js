const API_BASE =
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'https://heybro-backend.onrender.com';

export const getProfileImageUrl = (image, fallback) => {

  if (!image) return fallback;

  // BASE64 IMAGE
  if (image.startsWith('data:image')) {
    return image;
  }

  // FULL URL
  if (image.startsWith('http')) {
    return image;
  }

  // NORMAL FILE NAME
  return `${API_BASE}/api/users/profile-image/${image}`;
};