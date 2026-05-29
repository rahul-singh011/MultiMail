import Bull from "bull";
import { env } from "../config/env";

export type EmailJobData = {
  contactId: string;
  campaignId: string;
  tenantId: string;
  to: string;
  subject: string;
  body: string;
  firstName: string | null;
};

const emailQueue = new Bull<EmailJobData>("email-campaigns", {
  ...(process.env.REDIS_URL
    ? { redis: process.env.REDIS_URL }
    : {
        redis: {
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
        },
      }),

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: {
      age: 3600,
    },

    removeOnFail: {
      age: 86400,
    },
  },
});

emailQueue.on("completed", (job) => {
  console.log(`✓ Email sent to ${job.data.to}`);
});

emailQueue.on("failed", (job, err) => {
  console.log(`✗ Failed to send to ${job.data.to} — ${err.message}`);
});

emailQueue.on("error", (err) => {
  console.error("Queue error:", err);
});

export default emailQueue;

