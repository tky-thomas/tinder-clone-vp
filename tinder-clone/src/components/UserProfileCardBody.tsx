import {
  CardBody,
  Image,
  Stack,
  Heading,
  Text,
  Divider,
  ButtonGroup,
  Button,
  CardFooter,
} from "@chakra-ui/react";
import { UserProfile } from "../types";
import placeholder from "./placeholder.svg";

export const UserProfileCardBody = ({
  current_profile,
  handleSwipe,
}: {
  current_profile: UserProfile;
  handleSwipe: (direction: "left" | "right") => void;
}) => {
  return (
    <>
      <CardBody>
        <Image
          height={"50%"}
          src={placeholder}
          alt="Placeholder"
          borderRadius="lg"
          draggable="false"
        />
        <Stack mt="6" spacing="4">
          <Heading size="md">
            {current_profile.name}, {current_profile.gender}
          </Heading>

          <Stack spacing="1">
            <Heading size="sm">Location</Heading>
            <Text>{current_profile.location}</Text>
          </Stack>

          <Stack spacing="1">
            <Heading size="sm">University</Heading>
            <Text>{current_profile.university}</Text>
          </Stack>

          <Stack spacing="1">
            <Heading size="sm">Likes</Heading>
            <Text>{current_profile.interests.join(", ")}</Text>
          </Stack>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup justifyContent={"space-between"} width={"100%"}>
          <Button
            variant="outline"
            colorScheme="red"
            onClick={() => handleSwipe("left")}
          >
            Swipe Left
          </Button>
          <Button
            variant="outline"
            colorScheme="green"
            onClick={() => handleSwipe("right")}
          >
            Swipe Right
          </Button>
        </ButtonGroup>
      </CardFooter>
    </>
  );
};
