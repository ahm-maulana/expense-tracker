export function emailVerificationTemplate(verificationLink: string): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;">
          <tr>
            <td>
              <h1 style="margin:0 0 24px;font-size:24px;color:#18181b;">
                Verify your email
              </h1>

              <p style="margin:0 0 16px;color:#52525b;line-height:1.6;">
                Thanks for signing up!
              </p>

              <p style="margin:0 0 32px;color:#52525b;line-height:1.6;">
                Please verify your email address by clicking the button below.
                This link will expire in <strong>24 hours</strong>.
              </p>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="#18181b" style="border-radius:6px;">
                    <a
                      href="${verificationLink}"
                      style="
                        display:inline-block;
                        padding:14px 24px;
                        color:#ffffff;
                        text-decoration:none;
                        font-weight:bold;
                      "
                    >
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 12px;color:#52525b;">
                Or copy and paste this URL into your browser:
              </p>

              <p style="word-break:break-all;">
                <a href="${verificationLink}">
                  ${verificationLink}
                </a>
              </p>

              <hr style="margin:40px 0;border:none;border-top:1px solid #e4e4e7;" />

              <p style="font-size:14px;color:#71717a;line-height:1.6;">
                If you didn't create an account, you can safely ignore this email.
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
