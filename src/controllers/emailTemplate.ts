export const notificationEmailTemplate = (
  name: string,
  activationLink: string
) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>RCCG Account Activation</title>
    <!--[if mso]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=swap"
      rel="stylesheet"
    />
    <style type="text/css">
      /* Base styles with better email client support */
      * {
        font-family: "Jost", Arial, Helvetica, sans-serif;
        box-sizing: border-box;
        line-height: 1.4;
      }

      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        background-color: #f5f9ff;
      }

      table {
        border-spacing: 0;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      td {
        padding: 0;
      }

      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }

      p {
        display: block;
        margin: 13px 0;
      }

      @media only screen and (max-width: 480px) {
        .container {
          width: 100% !important;
        }

        .mobile-padding {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }

        .footer-text {
          text-align: center !important;
        }
      }
    </style>
    <!--[if mso]>
      <style type="text/css">
        body,
        table,
        td {
          font-family: Arial, Helvetica, sans-serif !important;
        }
      </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f9ff">
    <!--[if mso]>
    <center>
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
    <tr>
    <td>
    <![endif]-->
    <table
      role="presentation"
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="max-width: 600px; margin: 0 auto"
    >
      <tr>
        <td style="padding: 30px 20px">
          <!-- Main Content Card -->
          <table
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="
              background-color: #ddf4e7;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            "
          >
            <!-- Logo Section -->
            <tr>
              <td align="center" style="padding: 40px 0 20px 0">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/9b/Rccg_logo.png"
                  alt="RCCG Logo"
                  width="100"
                  height="100"
                  style="display: block; margin: 0 auto"
                />
              </td>
            </tr>

            <!-- Greeting Section -->
            <tr>
              <td class="mobile-padding" style="padding: 0 40px 20px 40px">
                <p
                  style="
                    font-size: 20px;
                    font-weight: 600;
                    color: #124170;
                    margin: 0 0 20px 0;
                    text-transform: capitalize;
                  "
                >
                  Calvary Greetings, Dear ${name}
                </p>
                <p
                  style="
                    font-size: 18px;
                    color: #26667f;
                    margin: 0 0 15px 0;
                    line-height: 1.6;
                  "
                >
                  Welcome to the RCCG New Life Assembly, E-Examination portal.
                  Your account has been created successfully.
                </p>
                <p
                  style="
                    font-size: 18px;
                    color: #26667f;
                    margin: 0 0 25px 0;
                    line-height: 1.6;
                  "
                >
                  Please click the button below to activate your account.
                </p>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td align="center" style="padding: 0 0 30px 0">
                <table
                  role="presentation"
                  border="0"
                  cellpadding="0"
                  cellspacing="0"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#124170"
                      style="border-radius: 5px"
                    >
                      <a
                        href="${activationLink}"
                        target="_blank"
                        style="
                          font-size: 18px;
                          font-weight: 500;
                          color: #ffffff;
                          text-decoration: none;
                          padding: 14px 35px;
                          display: inline-block;
                          border-radius: 5px;
                        "
                      >
                        Activate Account
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Alternative link -->
            <tr>
              <td
                align="center"
                class="mobile-padding"
                style="padding: 0 40px 30px 40px"
              >
                <p
                  style="
                    font-size: 16px;
                    color: #666666;
                    margin: 0;
                    line-height: 1.5;
                  "
                >
                  Or copy and paste this URL in your browser:<br />
                  <span
                    style="
                      color: #124170;
                      word-break: break-all;
                      font-size: 14px;
                    "
                    >${activationLink}</span
                  >
                </p>
              </td>
            </tr>

            <!-- Warning Section -->
            <tr>
              <td class="mobile-padding" style="padding: 0 40px 40px 40px">
                <p
                  style="
                    font-size: 16px;
                    font-weight: 600;
                    color: #d61355;
                    margin: 0;
                    line-height: 1.5;
                  "
                >
                  If you did not create this account, please ignore this email.
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer Section -->
          <table
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="margin-top: 30px"
          >
            <tr>
              <td
                align="center"
                class="footer-text"
                style="
                  padding: 20px 0;
                  color: #7a7a7a;
                  font-size: 14px;
                  line-height: 1.5;
                "
              >
                <p style="margin: 0 0 5px 0">
                  Powered by RCCG New Life Assembly Sunday School Department
                </p>
                <p style="margin: 0">All rights reserved. &copy; ${new Date().getFullYear()}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <!--[if mso]>
    </td>
    </tr>
    </table>
    </center>
    <![endif]-->

   
  </body>
</html>
`;
