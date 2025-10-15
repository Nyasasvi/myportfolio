// Email template system (free - using plain HTML)
import { Newsletter } from './supabase-client';

export function generateNewsletterHTML(newsletter: Newsletter): string {
  const articlesHTML = newsletter.articles.map((article, index) => `
    <tr>
      <td style="padding: 20px 0; border-bottom: 1px solid #e6e6e6;">
        <!-- Rank Badge -->
        <div style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; font-weight: 700; font-size: 14px; margin-bottom: 12px;">
          #${article.rank} Top Story
        </div>
        
        <!-- Title -->
        <h2 style="margin: 12px 0; font-size: 24px; color: #1a1a1a; line-height: 1.3;">
          ${article.title}
        </h2>
        
        <!-- Tags -->
        <div style="margin: 12px 0;">
          ${article.tags.map(tag => `
            <span style="display: inline-block; padding: 4px 10px; background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.2); border-radius: 6px; font-size: 12px; color: #667eea; margin-right: 6px; margin-bottom: 6px;">
              ${tag}
            </span>
          `).join('')}
          <span style="display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 6px; font-size: 12px; color: #10b981;">
            ✓ Credibility: ${article.credibilityScore}/10
          </span>
        </div>
        
        <!-- Summary -->
        <p style="margin: 16px 0; font-size: 16px; color: #333; line-height: 1.7;">
          ${article.summary}
        </p>
        
        <!-- Why It Matters -->
        <div style="margin: 16px 0; padding: 16px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%); border-left: 4px solid #667eea; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #667eea; margin-bottom: 8px;">
            💡 Why it matters:
          </p>
          <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
            ${article.whyItMatters}
          </p>
        </div>
        
        <!-- Read More Button -->
        <a href="${article.url}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Read Full Article →
        </a>
        
        <!-- References -->
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #888;">
            ✅ Verified by ${article.references.length} source${article.references.length > 1 ? 's' : ''}:
          </p>
          ${article.references.map(ref => `
            <div style="margin: 4px 0;">
              <a href="${ref.url}" style="font-size: 12px; color: #667eea; text-decoration: none;">
                ${ref.source} - ${ref.title}
              </a>
            </div>
          `).join('')}
        </div>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletter.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc;">
  
  <!-- Main Container -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f6f9fc;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Email Content -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div style="font-size: 48px; margin-bottom: 12px;">🤖</div>
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800;">
                ${newsletter.title}
              </h1>
              <p style="margin: 12px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                ${new Date(newsletter.published_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </td>
          </tr>
          
          <!-- Welcome Message -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 2px solid #f0f0f0;">
              <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.7;">
                Hey there! 👋
              </p>
              <p style="margin: 12px 0 0 0; font-size: 16px; color: #333; line-height: 1.7;">
                Here are the <strong>top ${newsletter.articles.length} AI developments</strong> this week, curated by <strong>Yasasvi Nellore</strong>. Each update is verified with multiple sources for accuracy.
              </p>
            </td>
          </tr>
          
          <!-- Articles -->
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${articlesHTML}
              </table>
            </td>
          </tr>
          
          <!-- Call to Action -->
          <tr>
            <td style="padding: 40px; background-color: #f8f9fa; text-align: center;">
              <h3 style="margin: 0 0 12px 0; font-size: 20px; color: #1a1a1a;">
                Enjoyed this edition?
              </h3>
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #666;">
                Read the full edition online and share with your network
              </p>
              <a href="https://yourportfolio.com/newsletter/${newsletter.edition}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                View Online Edition
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #1a1a1a; color: white;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 14px;">
                      <strong>AI Weekly Newsletter</strong>
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 12px; color: rgba(255, 255, 255, 0.7);">
                      Curated with AI by Yasasvi Nellore
                    </p>
                    
                    <!-- Social Links -->
                    <div style="margin: 16px 0;">
                      <a href="https://github.com/Nyasasvi/" style="display: inline-block; margin: 0 8px; color: white; text-decoration: none;">GitHub</a>
                      <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                      <a href="https://www.linkedin.com/in/yasasvi-nellore/" style="display: inline-block; margin: 0 8px; color: white; text-decoration: none;">LinkedIn</a>
                      <span style="color: rgba(255, 255, 255, 0.3);">•</span>
                      <a href="https://yourportfolio.com" style="display: inline-block; margin: 0 8px; color: white; text-decoration: none;">Portfolio</a>
                    </div>
                    
                    <!-- Unsubscribe -->
                    <p style="margin: 16px 0 0 0; font-size: 11px; color: rgba(255, 255, 255, 0.5);">
                      You're receiving this because you subscribed to AI Weekly Newsletter.<br>
                      <a href="https://yourportfolio.com/newsletter/unsubscribe" style="color: rgba(255, 255, 255, 0.7); text-decoration: underline;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}

// Generate plain text version for email clients that don't support HTML
export function generateNewsletterPlainText(newsletter: Newsletter): string {
  const articlesText = newsletter.articles.map((article, index) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#${article.rank} - ${article.title}

${article.summary}

💡 Why it matters:
${article.whyItMatters}

🔗 Read more: ${article.url}

✓ Verified by: ${article.references.map(r => r.source).join(', ')}

Tags: ${article.tags.join(', ')}
Credibility: ${article.credibilityScore}/10
  `).join('\n');

  return `
🤖 ${newsletter.title}
${new Date(newsletter.published_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hey there! 👋

Here are the top ${newsletter.articles.length} AI developments this week, curated by Yasasvi Nellore.
Each update is verified with multiple sources for accuracy.

${articlesText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 AI Weekly Newsletter
Curated with AI by Yasasvi Nellore

🌐 Read online: https://yourportfolio.com/newsletter/${newsletter.edition}
💼 LinkedIn: https://www.linkedin.com/in/yasasvi-nellore/
💻 GitHub: https://github.com/Nyasasvi/
🌐 Portfolio: https://yourportfolio.com

Unsubscribe: https://yourportfolio.com/newsletter/unsubscribe
  `.trim();
}

import nodemailer from 'nodemailer';

// Function to send email using Nodemailer
export async function sendNewsletterEmail(
  newsletter: Newsletter,
  recipientEmail: string
): Promise<boolean> {
  try {
    const htmlContent = generateNewsletterHTML(newsletter);
    const textContent = generateNewsletterPlainText(newsletter);
    
    // Create transporter using Gmail SMTP (free tier: 100 emails/day)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER, // Your Gmail address
        pass: process.env.SMTP_PASS // Gmail App Password (not regular password)
      }
    });

    // Email options
    const mailOptions = {
      from: {
        name: 'Yasasvi Nellore - AI Weekly',
        address: process.env.SMTP_USER || 'yasasvi.nellore@gmail.com'
      },
      to: recipientEmail,
      subject: `${newsletter.title} - AI Weekly Newsletter`,
      html: htmlContent,
      text: textContent,
      // Add unsubscribe header for compliance
      headers: {
        'List-Unsubscribe': `<https://yourportfolio.com/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Newsletter sent to ${recipientEmail}:`, info.messageId);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to send newsletter to ${recipientEmail}:`, error);
    return false;
  }
}

// Function to send newsletter to all active subscribers
export async function sendNewsletterToAllSubscribers(
  newsletter: Newsletter,
  subscribers: Array<{ email: string; subscribedAt: string; unsubscribed: boolean; interests: string[] }>
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const activeSubscribers = subscribers.filter(sub => !sub.unsubscribed);
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  console.log(`📧 Sending newsletter to ${activeSubscribers.length} subscribers...`);

  // Send emails with a small delay to avoid rate limiting
  for (const subscriber of activeSubscribers) {
    try {
      const success = await sendNewsletterEmail(newsletter, subscriber.email);
      if (success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`Failed to send to ${subscriber.email}`);
      }
      
      // Add delay to avoid overwhelming Gmail SMTP (100 emails/day limit)
      if (activeSubscribers.length > 10) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error sending to ${subscriber.email}: ${error}`);
    }
  }

  console.log(`📊 Newsletter sending complete: ${results.sent} sent, ${results.failed} failed`);
  return results;
}

