import { useGetRecommendedUserProfiles } from "../services/UserProfileService";
import { UserProfile } from "../types";
import {
  Box,
  Spinner,
  VStack,
  Card,
  CardBody,
  Heading,
  Stack,
  Flex,
  Text,
  Divider,
} from "@chakra-ui/react";
import { SwipeEventData, useSwipeable } from "react-swipeable";
import { useEffect, useState } from "react";
import { UserProfileCardBody } from "../components/UserProfileCardBody";
import { UserProfileCardBodySmall } from "../components/UserProfileCardBodySmall";
import { TEST_USER_PROFILE } from "../app-config";

const MILLISECONDS_IN_HOUR = 1000 * 60 * 60;
const MILLISECONDS_IN_MINUTE = 1000 * 60;
const MILLISECONDS_IN_SECOND = 1000;

export const FrontPage = () => {
  const {
    data: recommended_users_unshuffled,
    isLoading,
    isError,
  } = useGetRecommendedUserProfiles(TEST_USER_PROFILE);

  useEffect(() => {
    if (recommended_users_unshuffled) {
      // Shuffle the deck. Real dating apps don't give away their secrets ;)
      const shuffled = [...recommended_users_unshuffled.user_profiles].sort(
        () => Math.random() - 0.5
      );
      if (shuffled.length !== 0) {
        setRecommendedUsers(shuffled);
      }
    }
  }, [recommended_users_unshuffled]);

  useEffect(() => {
    if (recommended_users_unshuffled) {
      const updateRefreshTime = () => {
        const date = new Date(
          recommended_users_unshuffled.time_on_refresh - Date.now()
        );

        const time_string = `${Math.floor(
          date.getTime() / MILLISECONDS_IN_HOUR
        )}
        :${String(
          Math.floor(
            (date.getTime() % MILLISECONDS_IN_HOUR) / MILLISECONDS_IN_MINUTE
          )
        ).padStart(2, "0")}
        :${String(
          Math.floor(
            ((date.getTime() % MILLISECONDS_IN_HOUR) % MILLISECONDS_IN_MINUTE) /
              MILLISECONDS_IN_SECOND
          )
        ).padStart(2, "0")}
        `;
        setTimeToRefresh(time_string);
      };

      const intervalId = setInterval(updateRefreshTime, 1000);
      updateRefreshTime(); // Initial call to set the time immediately

      return () => clearInterval(intervalId); // Clean up the interval on component unmount
    }
  }, [recommended_users_unshuffled]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCircle, setShowCircle] = useState(false);
  const [profilesSwipedRight, setProfilesSwipedRight] = useState<number[]>([]);
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 });
  const [recommended_users, setRecommendedUsers] = useState<UserProfile[]>([]);
  const [timeToRefresh, setTimeToRefresh] = useState("");

  const swipable_handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    onSwiping: (eventData) => handleSwiping(eventData),
    onSwiped: () => handleSwiped(),
    trackMouse: true,
  });

  if (isLoading)
    return (
      <Flex
        width="100%"
        height="100vh"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="lg" />
      </Flex>
    );
  if (isError || !recommended_users_unshuffled)
    return (
      <Flex
        width="100%"
        height="100vh"
        justifyContent="center"
        alignItems="center"
      >
        Error loading profiles
      </Flex>
    );

  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex === recommended_users.length) return;

    if (direction === "right") {
      setProfilesSwipedRight((prev) => [...prev, currentIndex]);
    }

    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleSwiping = (eventData: SwipeEventData) => {
    setShowCircle(true);
  };

  const handleSwiped = () => {
    setShowCircle(false);
  };

  const handleMouseMove = (event: any) => {
    setCirclePosition({ x: event.clientX, y: event.clientY });
  };

  const currentProfile = recommended_users[currentIndex];

  return (
    <>
      <Card
        position="absolute"
        left="0"
        top="0"
        width="20%"
        margin="5%"
        padding="4"
        gap="4"
      >
        <Heading size="sm">Test Profile</Heading>
        <UserProfileCardBodySmall
          user_profile={TEST_USER_PROFILE}
          width="100%"
        />
      </Card>
      <VStack>
        {showCircle && (
          <Box
            position="fixed"
            bg="teal"
            borderRadius="30px"
            w="30px"
            h="30px"
            transform="translate(-50%, -50%)"
            zIndex={999}
            left={circlePosition.x}
            top={circlePosition.y}
            pointerEvents="none"
          />
        )}

        <Card
          {...swipable_handlers}
          height={"80%"}
          width={"30%"}
          userSelect={"none"}
          onMouseMove={handleMouseMove}
        >
          {currentIndex < recommended_users.length ? (
            <UserProfileCardBody
              current_profile={currentProfile}
              handleSwipe={handleSwipe}
            />
          ) : (
            <CardBody>
              <Stack mt="6" spacing="4">
                <Heading size="md">
                  {recommended_users.length === 0
                    ? "You've reached the limit for today!"
                    : "You've swiped right on:"}
                </Heading>
                {profilesSwipedRight.map((profile_id) => {
                  return (
                    <UserProfileCardBodySmall
                      user_profile={recommended_users[profile_id]}
                      height="20%"
                      width="100%"
                    />
                  );
                })}
                <Divider />
                <Text>Time To Refresh: {timeToRefresh}</Text>
              </Stack>
            </CardBody>
          )}
        </Card>
      </VStack>
    </>
  );
};
