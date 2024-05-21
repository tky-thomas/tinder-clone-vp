import { UserProfileBasic } from "./types";

export const BACKEND_API = `http://127.0.0.1:9000/dev/api/v1`;
export const RECOMMENDER_PROFILE_COUNT = 10;

export const TEST_USER_PROFILE = new UserProfileBasic({
  id: "1",
  name: "Thomas",
  gender: "Male",
  location: "Kepong",
  university: "Nottingham",
  interests: ["Gaming", "Cooking"],
});
