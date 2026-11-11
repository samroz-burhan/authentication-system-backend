export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOTPHtml(otp) {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Your Verification Code</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 15px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0"
                    style="max-width:420px; background:#ffffff; border-radius:12px; padding:35px;">

                    <tr>
                        <td align="center">
                            <h2 style="color:#111827; margin:0 0 12px;">
                                Verify Your Email
                            </h2>

                            <p style="color:#6b7280; font-size:14px; line-height:1.6;">
                                Use the verification code below to complete your registration.
                            </p>

                            <div style="background:#f3f4f6; padding:18px; 
                                border-radius:8px; margin:25px 0;">
                                <h1 style="color:#111827; letter-spacing:10px; 
                                    margin:0; font-size:32px;">
                                    ${otp}
                                </h1>
                            </div>

                            <p style="color:#6b7280; font-size:13px;">
                                This code will expire in 5 minutes.
                            </p>

                            <p style="color:#9ca3af; font-size:12px; margin-top:30px;">
                                If you didn't request this code, please ignore this email.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
`;
}
