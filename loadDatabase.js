// eslint-disable-next-line import/no-extraneous-dependencies
import "dotenv/config";
// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";
// eslint-disable-next-line import/no-extraneous-dependencies
import bluebird from "bluebird";
import models from "./modelData/photoApp.js";
import User from "./schema/user.js";
import Photo from "./schema/photo.js";
import SchemaInfo from "./schema/schemaInfo.js";

const SEEDED_PASSWORD_DIGEST =
  "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi";

const cloudinaryUrls = {
  "kenobi1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568710/photoapp-seed/kenobi1.jpg",
  "kenobi2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568711/photoapp-seed/kenobi2.jpg",
  "kenobi3.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568711/photoapp-seed/kenobi3.jpg",
  "kenobi4.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568712/photoapp-seed/kenobi4.jpg",
  "ludgate1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568712/photoapp-seed/ludgate1.jpg",
  "malcolm1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568713/photoapp-seed/malcolm1.jpg",
  "malcolm2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568713/photoapp-seed/malcolm2.jpg",
  "ouster.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568714/photoapp-seed/ouster.jpg",
  "ripley1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568714/photoapp-seed/ripley1.jpg",
  "ripley2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568715/photoapp-seed/ripley2.jpg",
  "took1.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568715/photoapp-seed/took1.jpg",
  "took2.jpg": "https://res.cloudinary.com/megamukil/image/upload/v1776568716/photoapp-seed/took2.jpg",
};

const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://127.0.0.1/project4";

mongoose.Promise = bluebird;
mongoose.set("strictQuery", false);
mongoose.connect(mongoUrl, {
  serverSelectionTimeoutMS: 10000,
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

async function loadDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Photo.deleteMany({}),
    SchemaInfo.deleteMany({}),
  ]);

  const userModels = models.userListModel();
  const mapFakeId2RealId = {};

  await Promise.all(
    userModels.map(async (user) => {
      const userObj = await User.create({
        first_name: user.first_name,
        last_name: user.last_name,
        location: user.location,
        description: user.description,
        occupation: user.occupation,
        login_name: user.last_name.toLowerCase(),
        password_digest: SEEDED_PASSWORD_DIGEST,
      });
      mapFakeId2RealId[user._id] = userObj._id;
      user.objectID = userObj._id;
      console.log(
        "Adding user:",
        `${user.first_name} ${user.last_name}`,
        " with ID ",
        user.objectID,
      );
    }),
  );

  const photoModels = [];
  const userIDs = Object.keys(mapFakeId2RealId);
  userIDs.forEach((id) => {
    photoModels.push(...models.photoOfUserModel(id));
  });

  await Promise.all(
    photoModels.map(async (photo) => {
      const seededPhotoUrl = cloudinaryUrls[photo.file_name];
      if (!seededPhotoUrl) {
        throw new Error(`Missing Cloudinary URL mapping for seeded photo '${photo.file_name}'`);
      }

      const photoObj = await Photo.create({
        file_name: seededPhotoUrl,
        date_time: photo.date_time,
        user_id: mapFakeId2RealId[photo.user_id],
      });
      photo.objectID = photoObj._id;
      if (photo.comments) {
        photo.comments.forEach((comment) => {
          photoObj.comments = photoObj.comments.concat([
            {
              comment: comment.comment,
              date_time: comment.date_time,
              user_id: comment.user.objectID,
            },
          ]);
          console.log(
            "Adding comment of length %d by user %s to photo %s",
            comment.comment.length,
            comment.user.objectID,
            photo.file_name,
          );
        });
      }
      await photoObj.save();
      console.log(
        "Adding photo:",
        photo.file_name,
        " of user ID ",
        photoObj.user_id,
      );
    }),
  );

  await SchemaInfo.create(models.schemaInfo2());
  console.log("SchemaInfo object created");
}

mongoose.connection.once("open", async () => {
  try {
    await loadDatabase();
    console.log("Database load completed");
  } catch (err) {
    console.error("Error loading database:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(process.exitCode ?? 0);
  }
});
