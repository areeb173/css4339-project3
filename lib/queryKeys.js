const queryKeys = {
  sessionUser: ["session-user"],
  users: ["users"],
  user: (userId) => ["user", userId],
  photos: (userId) => ["photos", userId],
};

export default queryKeys;
