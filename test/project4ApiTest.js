/* global describe, it */

import assert from "assert";
import axios from "axios";

const port = 3001;
const host = "localhost";
const SEEDED_LOGIN_PASSWORD = "password";

function makeFullUrl(url) {
  return `http://${host}:${port}${url}`;
}

describe("Photo App: Project 4 API Tests", function () {
  let sessionCookie;
  let userId;
  let createdPhotoId;
  const uploadedUrl = "https://res.cloudinary.com/demo/image/upload/v1/project4-test-photo.jpg";

  it("rejects photo creation when not logged in", async function () {
    try {
      await axios.post(makeFullUrl("/photos"), { url: uploadedUrl });
      assert.fail("Expected unauthenticated photo creation to fail");
    } catch (error) {
      assert.strictEqual(error.response.status, 401);
    }
  });

  it("logs in a seeded user", async function () {
    const response = await axios.post(makeFullUrl("/admin/login"), {
      login_name: "took",
      password: SEEDED_LOGIN_PASSWORD,
    });

    assert.strictEqual(response.status, 200);
    sessionCookie = response.headers["set-cookie"][0];
    userId = response.data._id;
    assert.ok(sessionCookie);
    assert.ok(userId);
  });

  it("rejects photo creation when the URL is missing", async function () {
    try {
      await axios.post(makeFullUrl("/photos"), { url: "" }, {
        headers: { Cookie: sessionCookie },
      });
      assert.fail("Expected missing URL to fail");
    } catch (error) {
      assert.strictEqual(error.response.status, 400);
    }
  });

  it("saves a Cloudinary photo URL for the logged-in user", async function () {
    const response = await axios.post(makeFullUrl("/photos"), { url: uploadedUrl }, {
      headers: { Cookie: sessionCookie },
    });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.data.file_name, uploadedUrl);
    assert.strictEqual(response.data.user_id, userId);
    assert(Array.isArray(response.data.likes));
    assert.strictEqual(response.data.likes.length, 0);
    createdPhotoId = response.data._id;
    assert.ok(createdPhotoId);
  });

  it("rejects like toggles when not logged in", async function () {
    try {
      await axios.post(makeFullUrl(`/photos/${createdPhotoId}/like`), {});
      assert.fail("Expected unauthenticated like toggle to fail");
    } catch (error) {
      assert.strictEqual(error.response.status, 401);
    }
  });

  it("adds a like from the logged-in user", async function () {
    const response = await axios.post(makeFullUrl(`/photos/${createdPhotoId}/like`), {}, {
      headers: { Cookie: sessionCookie },
    });

    assert.strictEqual(response.status, 200);
    assert(response.data.likes.includes(userId));
    assert.strictEqual(response.data.likes.length, 1);
  });

  it("removes the like on a second toggle from the same user", async function () {
    const response = await axios.post(makeFullUrl(`/photos/${createdPhotoId}/like`), {}, {
      headers: { Cookie: sessionCookie },
    });

    assert.strictEqual(response.status, 200);
    assert(!response.data.likes.includes(userId));
    assert.strictEqual(response.data.likes.length, 0);
  });
});
