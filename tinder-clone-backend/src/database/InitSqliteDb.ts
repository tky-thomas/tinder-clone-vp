import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

interface DbUserInterface {
  name: string;
  gender: string;
  location: string;
  university: string;
  interests: string[];

  getUser(): string[];
}

class DbUser implements DbUserInterface {
  name: string;
  gender: string;
  location: string;
  university: string;
  interests: string[];

  constructor(
    name: string,
    gender: string,
    location: string,
    university: string,
    interests: string[]
  ) {
    this.name = name;
    this.gender = gender;
    this.location = location;
    this.university = university;
    this.interests = interests;
  }

  getUser = (): string[] => {
    return [this.name, this.gender, this.location, this.university];
  };
}

const users = [
  new DbUser("Alice", "Female", "Shah Alam", "APU", ["Music", "Art"]),
  new DbUser("Bob", "Male", "Subang Jaya", "Sunway", ["Sports", "Music"]),
  new DbUser("Charlie", "Male", "Klang", "Monash", [
    "Technology",
    "Movies",
    "Hiking",
  ]),
  new DbUser("David", "Male", "Petaling Jaya", "Taylor's", [
    "Cooking",
    "Travel",
    "Photography",
  ]),
  new DbUser("Eve", "Female", "Puchong", "Nottingham", ["Reading", "Writing"]),
  new DbUser("Fay", "Female", "Cheras", "BAC", ["Dancing", "Fitness"]),
  new DbUser("Grace", "Female", "Ampang", "Xiamen", [
    "Gaming",
    "Technology",
    "Reading",
  ]),
  new DbUser("Heidi", "Female", "Kepong", "APU", [
    "Art",
    "Photography",
    "Travel",
  ]),
  new DbUser("Ivan", "Male", "Damansara", "Sunway", ["Music", "Fitness"]),
  new DbUser("Judy", "Female", "Gombak", "Monash", ["Movies", "Travel"]),
  new DbUser("Mallory", "Female", "Kajang", "Taylor's", [
    "Writing",
    "Technology",
    "Cooking",
  ]),
  new DbUser("Niaj", "Male", "Rawang", "Nottingham", ["Gaming", "Sports"]),
  new DbUser("Oscar", "Male", "Selayang", "BAC", [
    "Reading",
    "Travel",
    "Hiking",
  ]),
  new DbUser("Peggy", "Female", "Sri Petaling", "Xiamen", [
    "Art",
    "Dancing",
    "Fitness",
  ]),
  new DbUser("Quentin", "Male", "Wangsa Maju", "APU", [
    "Music",
    "Movies",
    "Travel",
  ]),
  new DbUser("Ruth", "Female", "Taman Tun Dr Ismail", "Sunway", [
    "Fitness",
    "Cooking",
  ]),
  new DbUser("Sybil", "Female", "Bukit Jalil", "Monash", [
    "Technology",
    "Travel",
    "Movies",
  ]),
  new DbUser("Trent", "Male", "Mont Kiara", "Taylor's", [
    "Sports",
    "Reading",
    "Gaming",
  ]),
  new DbUser("Uma", "Female", "Desa Park City", "Nottingham", [
    "Art",
    "Gaming",
  ]),
  new DbUser("Victor", "Male", "Cyberjaya", "BAC", ["Music", "Technology"]),
  new DbUser("Wendy", "Female", "Setia Alam", "Xiamen", [
    "Fitness",
    "Movies",
    "Photography",
  ]),
  new DbUser("Xander", "Male", "Puchong", "APU", ["Sports", "Photography"]),
  new DbUser("Yvonne", "Female", "Putrajaya", "Sunway", [
    "Gaming",
    "Art",
    "Technology",
  ]),
  new DbUser("Zack", "Male", "Seri Kembangan", "Monash", [
    "Reading",
    "Fitness",
    "Cooking",
  ]),
];

db.serialize(() => {
  db.run(`
    CREATE TABLE UserProfile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100),
      gender VARCHAR(10),
      location VARCHAR(200),
      university VARCHAR(70)
    )
  `);

  db.run(`
    CREATE TABLE UserInterest (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      user_id INTEGER,
      interest VARCHAR(30),
      FOREIGN KEY (user_id) REFERENCES UserProfile(id)
    )
  `);

  db.run(`
    CREATE TABLE RecommendationLog (
      user_id NUMBER,
      last_recommended TIMESTAMP,
      PRIMARY KEY (user_id)
    );
  `);

  const dbInsertUserProfile = db.prepare(
    `
    INSERT INTO UserProfile (name, gender, location, university)
    VALUES (?, ?, ?, ?)
    `
  );

  const dbInsertUserInterest = db.prepare(
    `
    INSERT INTO UserInterest (user_id, interest)
    VALUES (?, ?)
    `
  );

  const dbGetUserIdFromName = db.prepare(
    `SELECT id FROM UserProfile WHERE name = ?`
  );

  users.forEach((user) => {
    dbInsertUserProfile.run(user.getUser(), function (err) {
      if (err) {
        console.error("Error executing statement:", err.message);
        return;
      }
    });
  });

  users.forEach((user) => {
    dbGetUserIdFromName.get(
      [user.name],
      function (err: Error | null, row: { id: number }) {
        if (err) {
          console.error("Error executing statement:", err.message);
          return;
        }

        if (row) {
          user.interests.forEach((interest) => {
            dbInsertUserInterest.run([row.id, interest], function (err) {
              if (err) {
                console.error("Error executing statement:", err.message);
                return;
              }
            });
          });
        }
      }
    );
  });
});

const user_profile_db = db;
export default user_profile_db;
