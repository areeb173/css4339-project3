export function serializeUserSummary(user) {
  return {
    _id: String(user._id),
    first_name: user.first_name,
    last_name: user.last_name,
  };
}

export function serializeUserDetail(user) {
  return {
    ...serializeUserSummary(user),
    location: user.location || "",
    description: user.description || "",
    occupation: user.occupation || "",
  };
}

export function serializeSessionUser(user) {
  return {
    ...serializeUserDetail(user),
    login_name: user.login_name,
  };
}

export function serializePhoto(photo, userLookup) {
  return {
    _id: String(photo._id),
    user_id: String(photo.user_id),
    file_name: photo.file_name,
    date_time: photo.date_time,
    likes: (photo.likes || []).map((userId) => String(userId)),
    comments: (photo.comments || []).map((comment) => ({
      _id: String(comment._id),
      comment: comment.comment,
      date_time: comment.date_time,
      user: userLookup.get(String(comment.user_id)) || null,
    })),
  };
}
