export interface UserProfile {
  id: string;
  name: string;
  gender: string;
  location: string;
  university: string;
  interests: string[];
  weight: number;
}

export class UserProfileBasic implements UserProfile {
  id: string;
  name: string;
  gender: string;
  location: string;
  university: string;
  interests: string[];
  weight: number;

  constructor(user: any) {
    this.id = user?.id || "null";
    this.name = user?.name || "";
    this.gender = user?.gender || "";
    this.location = user?.location || "";
    this.university = user?.university || "";
    this.interests = user?.interests || [];
    this.weight = user?.weight || 0;
  }
}
