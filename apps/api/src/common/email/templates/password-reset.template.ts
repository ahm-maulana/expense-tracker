export function passwordResetTemplate(resetLink: string): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
          <tr>
            <td>
              <h1 style="margin:0 0 24px;font-size:24px;color:#18181b;">
                Reset your password
              </h1>

              <p style="margin:0 0 16px;color:#52525b;line-height:1.6;">
                We received a request to reset your password.
              </p>

              <p style="margin:0 0 32px;color:#52525b;line-height:1.6;">
                Click the button below to choose a new password. This link will expire in
                <strong>30 minutes</strong>.
              </p>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="#18181b" style="border-radius:6px;">
                    <a
                      href="${resetLink}"
                      style="
                        display:inline-block;
                        padding:14px 24px;
                        color:#ffffff;
                        text-decoration:none;
                        font-weight:bold;
                      "
                    >
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 12px;color:#52525b;">
                Or copy and paste this URL into your browser:
              </p>

              <p style="word-break:break-all;">
                <a href="${resetLink}">
                  ${resetLink}
                </a>
              </p>

              <hr style="margin:40px 0;border:none;border-top:1px solid #e4e4e7;" />

              <p style="font-size:14px;color:#71717a;line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password won't be changed unless you use the link above.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin-top:24px;color:#a1a1aa;font-size:12px;">
          © 2026 Expense Tracker
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
