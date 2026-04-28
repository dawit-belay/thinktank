import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "Thinktank <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendGroupInviteEmail({
  to,
  toName,
  inviterName,
  groupName,
  groupId,
}: {
  to: string;
  toName: string;
  inviterName: string;
  groupName: string;
  groupId: string;
}) {
  if (!resend) return;
  const link = `${APP_URL}/group/${groupId}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} invited you to "${groupName}" on Thinktank`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="margin-bottom:24px">
          <span style="background:#18181b;color:#fff;padding:6px 14px;border-radius:99px;font-weight:700;font-size:14px">
            ● Thinktank
          </span>
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;color:#18181b">You've been invited</h2>
        <p style="margin:0 0 20px;color:#52525b;font-size:15px">
          <strong>${inviterName}</strong> has invited you to join the group
          <strong>"${groupName}"</strong> on Thinktank.
        </p>
        <a href="${link}"
           style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none">
          View Group
        </a>
        <p style="margin:24px 0 0;color:#a1a1aa;font-size:12px">
          You received this because ${toName} was invited to a group on Thinktank.
        </p>
      </div>
    `,
  }).catch(() => {});
}

export async function sendMeetingInviteEmail({
  to,
  toName,
  inviterName,
  meetingTitle,
  groupId,
  meetingId,
}: {
  to: string;
  toName: string;
  inviterName: string;
  meetingTitle: string;
  groupId: string;
  meetingId: string;
}) {
  if (!resend) return;
  const link = `${APP_URL}/group/${groupId}/${meetingId}`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} added you to "${meetingTitle}" on Thinktank`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <div style="margin-bottom:24px">
          <span style="background:#18181b;color:#fff;padding:6px 14px;border-radius:99px;font-weight:700;font-size:14px">
            ● Thinktank
          </span>
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;color:#18181b">You've been added to a meeting</h2>
        <p style="margin:0 0 20px;color:#52525b;font-size:15px">
          <strong>${inviterName}</strong> has added you to the meeting
          <strong>"${meetingTitle}"</strong> on Thinktank.
        </p>
        <a href="${link}"
           style="display:inline-block;background:#10b981;color:#fff;padding:12px 24px;border-radius:12px;font-weight:700;font-size:14px;text-decoration:none">
          Join Meeting
        </a>
        <p style="margin:24px 0 0;color:#a1a1aa;font-size:12px">
          You received this because ${toName} was invited to a meeting on Thinktank.
        </p>
      </div>
    `,
  }).catch(() => {});
}
