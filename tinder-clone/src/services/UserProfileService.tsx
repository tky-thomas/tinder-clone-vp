import { UserProfile, UserProfileBasic } from "../types";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_API, RECOMMENDER_PROFILE_COUNT } from "../app-config";

const FORBIDDEN = 403;

export const useGetRecommendedUserProfiles = (user: UserProfile) => {
  return useQuery({
    queryKey: ["recommendedUserProfiles", user.id],
    queryFn: async () => {
      const user_profiles_json = await fetchRecommendedUserProfiles(user);

      let user_profiles: UserProfile[] = [];
      user_profiles_json.user_profiles.forEach((user_profile: any) => {
        user_profiles.push(new UserProfileBasic(user_profile));
      });

      return {
        user_profiles: user_profiles,
        time_on_refresh: user_profiles_json.time_on_refresh,
      };
    },
  });
};

const fetchRecommendedUserProfiles = async (user: UserProfile) => {
  const query_params = new URLSearchParams({
    university: user.university,
    count: RECOMMENDER_PROFILE_COUNT.toString(),
    user_id: user.id,
  });

  user.interests.forEach((interest) => {
    query_params.append("interests", interest);
  });

  const response = await fetch(`${BACKEND_API}/recommender?` + query_params);
  if (!response.ok && response.status !== FORBIDDEN) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};
