import {
  Card,
  CardBody,
  HStack,
  Heading,
  Stack,
  Text,
  CardProps,
} from "@chakra-ui/react";
import { UserProfile } from "../types";

interface UserProfileCardBodySmallProps extends CardProps {
  user_profile: UserProfile;
}

export const UserProfileCardBodySmall = ({
  user_profile,
  ...props
}: UserProfileCardBodySmallProps) => {
  return (
    <Card {...props}>
      <CardBody>
        <Stack mt="6" spacing="4">
          <Heading size="md">
            {user_profile.name}, {user_profile.gender}
          </Heading>
          <HStack>
            <Stack spacing="1" width="50%">
              <Heading size="sm">Location</Heading>
              <Text>{user_profile.location}</Text>
            </Stack>

            <Stack spacing="1" width="50%">
              <Heading size="sm">University</Heading>
              <Text>{user_profile.university}</Text>
            </Stack>
          </HStack>
          <Stack spacing="1">
            <Heading size="sm">Likes</Heading>
            <Text>{user_profile.interests.join(", ")}</Text>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
};
