const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send order confirmation email to user
 */
const sendOrderConfirmationEmail = async (toEmail, orderData) => {
  try {
    const transporter = createTransporter();

    // Build product rows HTML
    const itemRows = orderData.items.map(item => {
      const itemTotal = (parseFloat(item.price) * item.quantity).toLocaleString('en-IN');
      return `
        <tr>
          <td style="padding:12px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${item.product_image ? `
                <td width="60" valign="top" style="padding-right:12px;">
                  <img src="${item.product_image}" alt="" width="60" height="60" style="display:block;object-fit:contain;border-radius:4px;border:1px solid #f0f0f0;" />
                </td>` : ''}
                <td valign="top" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                  <div style="font-size:14px;color:#212121;font-weight:500;line-height:20px;">${item.product_name}</div>
                  <div style="font-size:13px;color:#878787;margin-top:4px;">Qty: ${item.quantity}</div>
                </td>
                <td width="80" valign="top" align="right" style="font-size:14px;font-weight:600;color:#212121;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;white-space:nowrap;">
                  ₹${itemTotal}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="border-bottom:1px solid #f0f0f0;"></td></tr>
      `;
    }).join('');

    // Delivery date (3 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const deliveryStr = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const totalAmount = parseFloat(orderData.total_amount).toLocaleString('en-IN');
    const discountAmount = parseFloat(orderData.discount_amount || 0).toLocaleString('en-IN');
    const deliveryCharges = parseFloat(orderData.delivery_charges || 0);
    const orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Order Confirmed</title>
      <!--[if mso]>
      <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
      <![endif]-->
      <style type="text/css">
        /* Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          .email-container { width: 100% !important; max-width: 100% !important; }
          .fluid { width: 100% !important; max-width: 100% !important; height: auto !important; }
          .stack-column { display: block !important; width: 100% !important; }
          .stack-column-center { text-align: center !important; display: block !important; width: 100% !important; }
          .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
          .mobile-hide { display: none !important; }
          .mobile-center { text-align: center !important; }
          .mobile-full { width: 100% !important; }
          h1 { font-size: 22px !important; line-height: 28px !important; }
          .header-pad { padding: 20px 16px !important; }
          .body-pad { padding: 16px !important; }
          .cta-btn { padding: 12px 24px !important; }
          .price-table td { padding: 6px 0 !important; }
          .address-table td { display: block !important; width: 100% !important; padding: 0 !important; border: none !important; }
          .address-table td + td { margin-top: 16px !important; padding-top: 16px !important; border-top: 1px solid #f0f0f0 !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#f1f3f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      
      <!-- Preheader (hidden text for email preview) -->
      <div style="display:none;font-size:1px;color:#f1f3f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
        Order #${orderData.order_number} confirmed! Your order will be delivered by ${deliveryStr}.
      </div>

      <center style="width:100%;background:#f1f3f6;">
        <!--[if mso]><table role="presentation" align="center" cellspacing="0" cellpadding="0" border="0" width="600"><tr><td><![endif]-->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;margin:0 auto;" class="email-container">
          
          <!-- Spacer -->
          <tr><td style="height:20px;background:#f1f3f6;"></td></tr>
          
          <!-- HEADER -->
          <tr>
            <td style="background:#2874f0;border-radius:8px 8px 0 0;text-align:center;" class="header-pad">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:28px 32px 24px;text-align:center;">
                    <!-- Flipkart Logo -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                      <tr>
                        <td style="background:#fff;padding:6px 14px;border-radius:6px;">
                          <span style="font-size:18px;font-weight:800;color:#2874f0;font-family:Arial,sans-serif;letter-spacing:-0.5px;font-style:italic;">Flipkart</span>
                        </td>
                      </tr>
                    </table>
                    <h1 style="color:#fff;font-size:24px;margin:16px 0 6px;font-weight:700;line-height:30px;">Order Confirmed! 🎉</h1>
                    <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;line-height:20px;">Thank you for your order, ${orderData.shipping_name}!</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ORDER NUMBER -->
          <tr>
            <td style="background:#fff;border-bottom:2px dashed #e0e0e0;" class="body-pad">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td>
                          <div style="font-size:11px;color:#878787;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Order Number</div>
                          <div style="font-size:18px;font-weight:700;color:#2874f0;margin-top:4px;">${orderData.order_number}</div>
                        </td>
                        <td align="right">
                          <div style="font-size:11px;color:#878787;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Order Date</div>
                          <div style="font-size:14px;font-weight:600;color:#212121;margin-top:4px;">${orderDate}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ITEMS -->
          <tr>
            <td style="background:#fff;" class="body-pad">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:20px 24px;">
                    <h2 style="font-size:15px;font-weight:700;color:#212121;margin:0 0 14px;padding-bottom:8px;border-bottom:2px solid #2874f0;display:inline-block;text-transform:uppercase;letter-spacing:0.3px;">
                      Items Ordered
                    </h2>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${itemRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PRICE SUMMARY -->
          <tr>
            <td style="background:#fff;border-top:1px solid #f0f0f0;" class="body-pad">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:16px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="price-table">
                      <tr>
                        <td style="padding:8px 0;font-size:14px;color:#878787;">Subtotal</td>
                        <td style="padding:8px 0;font-size:14px;color:#212121;text-align:right;">₹${totalAmount}</td>
                      </tr>
                      ${parseFloat(orderData.discount_amount) > 0 ? `
                      <tr>
                        <td style="padding:8px 0;font-size:14px;color:#388e3c;">Discount</td>
                        <td style="padding:8px 0;font-size:14px;color:#388e3c;text-align:right;">-₹${discountAmount}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding:8px 0;font-size:14px;color:#878787;">Delivery</td>
                        <td style="padding:8px 0;font-size:14px;color:${deliveryCharges === 0 ? '#388e3c' : '#212121'};text-align:right;">${deliveryCharges === 0 ? 'FREE' : '₹' + deliveryCharges}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:4px 0 0;"><hr style="border:none;border-top:1px solid #e0e0e0;margin:0;"></td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 4px;font-size:18px;font-weight:700;color:#212121;">Total</td>
                        <td style="padding:12px 0 4px;font-size:18px;font-weight:700;color:#212121;text-align:right;">₹${totalAmount}</td>
                      </tr>
                    </table>
                    <!-- Savings badge -->
                    ${parseFloat(orderData.discount_amount) > 0 ? `
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-top:12px;">
                          <div style="background:#e8f5e9;border-radius:6px;padding:10px 16px;text-align:center;">
                            <span style="color:#388e3c;font-size:13px;font-weight:600;">💰 You saved ₹${discountAmount} on this order!</span>
                          </div>
                        </td>
                      </tr>
                    </table>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SHIPPING & DELIVERY -->
          <tr>
            <td style="background:#fff;border-top:1px solid #f0f0f0;" class="body-pad">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="address-table">
                      <tr>
                        <td width="50%" valign="top" style="padding-right:16px;" class="stack-column">
                          <div style="font-size:11px;color:#878787;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:8px;">Shipping Address</div>
                          <div style="font-size:14px;color:#212121;font-weight:600;">${orderData.shipping_name}</div>
                          <div style="font-size:13px;color:#666;line-height:20px;margin-top:4px;">
                            ${orderData.shipping_address}<br>
                            ${orderData.shipping_city}, ${orderData.shipping_state} - ${orderData.shipping_pincode}<br>
                            Phone: ${orderData.shipping_phone}
                          </div>
                        </td>
                        <td width="50%" valign="top" style="padding-left:16px;border-left:1px solid #f0f0f0;" class="stack-column">
                          <div style="font-size:11px;color:#878787;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:8px;">Estimated Delivery</div>
                          <div style="font-size:14px;color:#212121;font-weight:600;">🚚 ${deliveryStr}</div>
                          <div style="font-size:13px;color:#878787;margin-top:8px;">
                            Payment: <strong>${orderData.payment_method === 'COD' ? 'Cash on Delivery' : orderData.payment_method}</strong>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA BUTTON -->
          <tr>
            <td style="background:#fff;border-radius:0 0 8px 8px;border-top:1px solid #f0f0f0;" class="body-pad">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="10%" stroke="f" fillcolor="#2874f0"><center style="color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:bold;">View Order Details</center></v:roundrect><![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/orders"
                       style="display:inline-block;background:#2874f0;color:#fff;text-decoration:none;padding:12px 36px;border-radius:4px;font-size:14px;font-weight:600;letter-spacing:0.3px;mso-padding-alt:0;text-underline-color:#2874f0;" class="cta-btn">
                       <!--[if mso]>&nbsp;<![endif]-->View Order Details<!--[if mso]>&nbsp;<![endif]-->
                    </a>
                    <!--<![endif]-->
                    <p style="font-size:12px;color:#878787;margin:16px 0 0;line-height:18px;">
                      If you have any questions, contact our <a href="#" style="color:#2874f0;text-decoration:none;">Customer Support</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 16px;text-align:center;">
              <p style="font-size:11px;color:#878787;margin:0 0 4px;line-height:16px;">This is an automated email from Flipkart Clone. Please do not reply.</p>
              <p style="font-size:11px;color:#878787;margin:0;line-height:16px;">&copy; 2024-2026 Flipkart Clone. All rights reserved.</p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height:20px;background:#f1f3f6;"></td></tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </center>
    </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: `"Flipkart Clone" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Order Confirmed! #${orderData.order_number} - Flipkart Clone`,
      html: htmlContent,
    });

    console.log(`✅ Order confirmation email sent to ${toEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send order email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOrderConfirmationEmail };
