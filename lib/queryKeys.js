const queryKeys = {
  sessionUser: ["session-user"],
  users: ["users"],
  user: (userId) => ["user", userId],
  // All photos for a given user's photo page
  photos: (userId) => ["photos", userId],
  // Single photo — used for precise invalidation after a comment is posted
  photo: (photoId) => ["photo", photoId],
};

export default queryKeys;
