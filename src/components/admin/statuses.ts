import type { InquiryStatus, ReferralStatus } from "@/server/generated/prisma/enums";

export const REFERRAL_STATUSES: { value: ReferralStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "WON", label: "Won" },
  { value: "NOT_ELIGIBLE", label: "Not eligible" },
  { value: "REWARD_DUE", label: "Reward due" },
  { value: "PAID", label: "Paid" },
];

export const INQUIRY_STATUSES: { value: InquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "REPLIED", label: "Replied" },
  { value: "CLOSED", label: "Closed" },
];
