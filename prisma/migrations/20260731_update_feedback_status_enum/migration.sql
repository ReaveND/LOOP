-- Migration: Update FeedbackStatus enum from (NEW, PROCESSING, ANALYZED, FAILED) to (NEW, REVIEWED, ACTIONED)

-- Step 1: Drop the column default temporarily so the type cast doesn't fail
ALTER TABLE "feedbacks" ALTER COLUMN "status" DROP DEFAULT;

-- Step 2: Create a new enum with the target values
CREATE TYPE "FeedbackStatus_new" AS ENUM ('NEW', 'REVIEWED', 'ACTIONED');

-- Step 3: Cast the column to the new enum type, mapping old values to new ones
ALTER TABLE "feedbacks"
  ALTER COLUMN "status" TYPE "FeedbackStatus_new"
  USING (
    CASE "status"::text
      WHEN 'NEW'        THEN 'NEW'
      WHEN 'PROCESSING' THEN 'REVIEWED'
      WHEN 'ANALYZED'   THEN 'ACTIONED'
      WHEN 'FAILED'     THEN 'NEW'
      WHEN 'REVIEWED'   THEN 'REVIEWED'
      WHEN 'ACTIONED'   THEN 'ACTIONED'
      ELSE 'NEW'
    END
  )::"FeedbackStatus_new";

-- Step 4: Restore the default using the new type
ALTER TABLE "feedbacks" ALTER COLUMN "status" SET DEFAULT 'NEW'::"FeedbackStatus_new";

-- Step 5: Drop the old enum and rename the new one
DROP TYPE "FeedbackStatus";
ALTER TYPE "FeedbackStatus_new" RENAME TO "FeedbackStatus";
