const BASE_URL = "https://heybro-backend.onrender.com/api";

export const getProfileImageUrl = (image, fallback) => {
  if (!image) return fallback;

  if (image.startsWith("data:image")) {
    return image;
  }

  return `${BASE_URL}/uploads/${image}`;
};