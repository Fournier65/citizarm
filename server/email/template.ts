export interface EmailTemplateData {
  title: string;
  preheader: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
  unsubscribeUrl?: string;
  unsubscribeLabel?: string;
  logoUrl: string;
  siteUrl: string;
  categoryLabel?: string;
  footerText?: string;
  closingText?: string;
}

export interface NewsletterTemplateData extends EmailTemplateData {
  unsubscribeUrl: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

export function renderEmailTemplate(data: EmailTemplateData): {
  html: string;
  text: string;
} {
  const preheader = escapeHtml(data.preheader);
  const title = escapeHtml(data.title);
  const paragraphsHtml = data.paragraphs
    .map(
      (paragraph) =>
        `<tr>
          <td style="padding:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#334155;">
            ${escapeHtml(paragraph).replace(/\r\n|\r|\n/g, "<br>")}
          </td>
        </tr>`,
    )
    .join("");
  const ctaLabel = escapeHtml(data.ctaLabel);
  const ctaUrl = escapeHtml(data.ctaUrl);
  const unsubscribeUrl = data.unsubscribeUrl ? escapeHtml(data.unsubscribeUrl) : undefined;
  const logoUrl = escapeHtml(data.logoUrl);
  const siteUrl = escapeHtml(data.siteUrl);
  const categoryLabel = escapeHtml(data.categoryLabel ?? "Votre rendez-vous citoyen");
  const footerText = data.footerText ?? (data.unsubscribeUrl
    ? "Vous recevez cette lettre parce que vous avez choisi de suivre nos actualités."
    : "Ce message concerne votre échange avec CitiZarm.");
  const closingText = data.closingText ?? "La démocratie se construit avec celles et ceux qu’elle concerne. Merci de prendre part à la conversation.";
  const unsubscribeHtml = unsubscribeUrl
    ? `<a href="${unsubscribeUrl}" style="color:#245f9e;text-decoration:underline;">${escapeHtml(data.unsubscribeLabel ?? "Se désinscrire de la newsletter")}</a>
                      <span style="color:#9aa8b7;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`
    : "";

  const html = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${title}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { width: 100% !important; }
        .email-gutter { padding-left: 22px !important; padding-right: 22px !important; }
        .email-title { font-size: 30px !important; line-height: 37px !important; }
        .email-footer { padding-left: 22px !important; padding-right: 22px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#edf2f7;color:#172b4d;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
    <div style="display:none!important;font-size:1px;line-height:1px;color:#edf2f7;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:#edf2f7;">
      <tr>
        <td align="center" style="padding:34px 14px 40px;">
          <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
          <table role="presentation" class="email-shell" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;background-color:#ffffff;border-radius:14px;overflow:hidden;">
            <tr>
              <td class="email-gutter" style="padding:25px 42px;background-color:#142c4e;border-bottom:4px solid #4a8ee8;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td valign="middle" width="48" style="width:48px;padding-right:13px;">
                      <a href="${siteUrl}" style="display:inline-block;text-decoration:none;">
                        <img src="${logoUrl}" width="44" height="44" alt="CitiZarm" style="display:block;width:44px;height:44px;border:0;border-radius:50%;object-fit:contain;">
                      </a>
                    </td>
                    <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:28px;font-weight:bold;letter-spacing:-0.4px;color:#ffffff;">
                      citiZarm
                    </td>
                    <td align="right" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#b9d5f7;">
                      La démocratie, en commun
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="email-gutter" style="padding:42px 48px 22px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#3978c4;">
                      ${categoryLabel}
                    </td>
                  </tr>
                  <tr>
                    <td class="email-title" style="padding:0 0 25px;font-family:Arial,Helvetica,sans-serif;font-size:36px;line-height:43px;font-weight:bold;letter-spacing:-1px;color:#142c4e;">
                      ${title}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 25px;">
                      <table role="presentation" width="46" cellpadding="0" cellspacing="0" border="0" style="width:46px;border-collapse:collapse;">
                        <tr><td height="3" style="height:3px;line-height:3px;font-size:3px;background-color:#4a8ee8;">&nbsp;</td></tr>
                      </table>
                    </td>
                  </tr>
                  ${paragraphsHtml}
                  <tr>
                    <td style="padding:8px 0 25px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;">
                        <tr>
                          <td align="center" bgcolor="#3478c9" style="border-radius:7px;background-color:#3478c9;">
                            <a href="${ctaUrl}" style="display:inline-block;padding:14px 22px;border:1px solid #3478c9;border-radius:7px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:bold;color:#ffffff;text-decoration:none;">${ctaLabel}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 22px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#586b82;">
                      ${escapeHtml(closingText)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="email-footer" style="padding:23px 48px 26px;background-color:#f3f6fa;border-top:1px solid #e2e9f1;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;font-weight:bold;color:#294461;">
                      citiZarm — des outils numériques pour une citoyenneté active.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 13px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#617389;">
                      ${escapeHtml(footerText)}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#617389;">
                      ${unsubscribeHtml}
                      <a href="${siteUrl}" style="color:#245f9e;text-decoration:underline;">Visiter citiZarm</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const paragraphsText = data.paragraphs.join("\n\n");
  const text = [
    "citiZarm — La démocratie, en commun",
    "",
    data.title,
    "",
    paragraphsText,
    "",
    `${data.ctaLabel} : ${data.ctaUrl}`,
    "",
    closingText,
    "",
    footerText,
    ...(data.unsubscribeUrl ? [`${data.unsubscribeLabel ?? "Se désinscrire de la newsletter"} : ${data.unsubscribeUrl}`] : []),
    `Visiter citiZarm : ${data.siteUrl}`,
  ].join("\n");

  return { html, text };
}

export function renderNewsletterTemplate(data: NewsletterTemplateData) {
  return renderEmailTemplate(data);
}
