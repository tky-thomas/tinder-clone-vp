import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
var router = express.Router();
import user_profile_db from "../../src/database/InitSqliteDb";
import { body, query, validationResult } from "express-validator";

const user_profile_compatibility_weights = {
  weight_university: 2.0,
  weight_interest: 1.0,
  weight_random: 0.1,
};

interface UserProfileRecommenderRequest extends Request {
  query: {
    user_id: string;
    university: string;
    count: string;
    interests: string[];
  };
}

class UserProfileRecommenderResponse {
  time_on_refresh: number;
  user_profiles: any[];
  message: string;

  constructor(params: any) {
    this.time_on_refresh =
      params?.time_on_refresh || Date.now() + MILLISECONDS_IN_A_DAY;
    this.user_profiles = params?.user_profiles || [];
    this.message = params?.message || "No message provided";
  }
}

const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;

router.get(
  "/",
  [
    query("user_id").isString().notEmpty(),
    query("university").isString().notEmpty(),
    query("count").isInt({ min: 1 }),
    query("interests").isArray().optional(),
  ],
  function (
    req: UserProfileRecommenderRequest,
    res: Response,
    next: NextFunction
  ) {
    // Validation
    const validation_errors = validationResult(req);
    if (!validation_errors.isEmpty()) {
      return res.status(400).json({ errors: validation_errors.array() });
    }

    const { user_id, university, count, interests } = req.query;

    const interests_array = Array.isArray(interests) ? interests : [interests];
    const interests_placeholders = interests_array
      .map((_, i) => `$interest${i}`)
      .join(", ");

    const get_recommendations_query = `
      SELECT UserProfile.*,

      (SELECT GROUP_CONCAT(interest) 
      FROM UserInterest 
      WHERE UserInterest.user_id = UserProfile.id) AS interests,

      (COALESCE(COUNT(UserInterest.id), 0) * $weight_interest) + 
      (CASE WHEN university = $university THEN $weight_university ELSE 0 END) +
      ((ABS(RANDOM() % 10) / 10.0) * $weight_random) AS total_weight

      FROM UserProfile
      LEFT JOIN UserInterest ON UserProfile.id = UserInterest.user_id
                          AND UserInterest.interest IN (${interests_placeholders})
      GROUP BY UserProfile.id
      ORDER BY total_weight DESC
      LIMIT $count
    `;

    type QueryParams = {
      $weight_university: number;
      $weight_interest: number;
      $weight_random: number;
      $university: string;
      $count: number;
      [key: string]: any; // To allow dynamic keys
    };

    const params: QueryParams = {
      $weight_university: user_profile_compatibility_weights.weight_university,
      $weight_interest: user_profile_compatibility_weights.weight_interest,
      $weight_random: user_profile_compatibility_weights.weight_random,
      $university: university,
      $count: parseInt(count),
    };

    const get_last_recommendation_query = `
      SELECT last_recommended FROM RecommendationLog 
      WHERE user_id = ?
    `;

    const set_last_recommendation_query = `
      INSERT OR REPLACE INTO RecommendationLog (user_id, last_recommended) 
      VALUES (?, ?)
    `;

    interests_array.forEach((interest: any, i) => {
      params[`$interest${i}`] = interest;
    });

    user_profile_db.get(
      get_last_recommendation_query,
      [user_id],
      (err, row: { last_recommended: string }) => {
        if (err) {
          console.error("Error checking recommendation log:", err.message);
          return res.status(500).send("Internal Server Error");
        }

        const last_recommended = row ? new Date(row.last_recommended) : null;

        if (
          last_recommended &&
          Date.now() - last_recommended.getTime() < MILLISECONDS_IN_A_DAY
        ) {
          return res.status(403).send(
            new UserProfileRecommenderResponse({
              time_on_refresh:
                MILLISECONDS_IN_A_DAY + last_recommended.getTime(),
              message: "Only one recommendation per day is allowed",
            })
          );
        }

        user_profile_db.all(
          get_recommendations_query,
          params,
          (err: any, rows: any) => {
            if (err) {
              console.error("Error executing query:", err.message);
              return res.status(500).send("Internal Server Error");
            }

            // SQLite returns a comma-concatenated string of interests
            // We must convert this back into an array
            const rows_with_array_interests = rows.map((row: any) => ({
              ...row,
              interests: row.interests ? row.interests.split(",") : [],
            }));

            user_profile_db.run(
              set_last_recommendation_query,
              [user_id, new Date().toISOString()],
              (err) => {
                if (err) {
                  console.error(
                    "Error updating recommendation log:",
                    err.message
                  );
                  return res.status(500).send("Internal Server Error");
                }

                res.send(
                  new UserProfileRecommenderResponse({
                    user_profiles: rows_with_array_interests,
                    message: "Request successful",
                  })
                );
              }
            );
          }
        );
      }
    );
  }
);

module.exports = router;
