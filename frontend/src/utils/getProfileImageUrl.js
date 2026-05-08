const API_BASE =
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'https://heybro-backend.onrender.com';

export const getProfileImageUrl = (imageName, fallback) => {
  if (!imageName) return fallback;

  if (imageName.startsWith("http")) {
    return imageName;
  }

  return `https://heybro-backend.onrender.com/api/users/profile-image/${imageName}`;
};