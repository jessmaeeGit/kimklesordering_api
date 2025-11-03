import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import notificationapi from 'notificationapi-node-server-sdk';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize NotificationAPI
const CLIENT_ID = process.env.NOTIFICATIONAPI_CLIENT_ID;
const CLIENT_SECRET = process.env.NOTIFICATIONAPI_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('⚠️  Missing NotificationAPI credentials in .env file');
  console.error('Please set NOTIFICATIONAPI_CLIENT_ID and NOTIFICATIONAPI_CLIENT_SECRET');
} else {
  console.log('📋 Loading NotificationAPI credentials...');
  console.log('   CLIENT_ID:', CLIENT_ID ? CLIENT_ID.substring(0, 10) + '...' : 'NOT SET');
  console.log('   CLIENT_SECRET:', CLIENT_SECRET ? CLIENT_SECRET.substring(0, 10) + '...' : 'NOT SET');
  notificationapi.init(CLIENT_ID, CLIENT_SECRET);
  console.log('✅ NotificationAPI initialized successfully');
}

const OWNER_EMAIL = 'jessamaecutillasbigcas@gmail.com';
const OWNER_PHONE = '+639121541566';

// Movider SMS API configuration
const MOVIDER_API_KEY = process.env.MOVIDER_APIKEY;
const MOVIDER_API_SECRET = process.env.MOVIDER_APISECRET;
const MOVIDER_BASE_URL = 'https://api.movider.co/v1';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Notification API server is running',
    notificationapi: {
      initialized: !!(CLIENT_ID && CLIENT_SECRET),
      hasClientId: !!CLIENT_ID,
      hasClientSecret: !!CLIENT_SECRET
    }
  });
});

// Test NotificationAPI endpoint
app.post('/api/test-notification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return res.status(500).json({ error: 'NotificationAPI credentials not configured' });
    }

    console.log('🧪 Testing NotificationAPI with email:', email);
    
    try {
      const result = await notificationapi.send({
        type: 'final_njud_ni',
        to: {
          id: email,
          email: email
        },
        email: {
          subject: 'Test Email from Kimkles Cravings',
          html: '<h1>This is a test email!</h1><p>If you receive this, NotificationAPI is working correctly.</p>'
        }
      });
      
      // Extract safe result data (avoid circular references)
      const safeResult = {
        status: result?.status,
        statusText: result?.statusText,
        data: result?.data
      };
      
      console.log('✅ Test email sent successfully');
      console.log('Response status:', result?.status);
      console.log('Response data:', result?.data);
      
      res.json({ 
        success: true, 
        message: 'Test email sent successfully',
        result: safeResult
      });
    } catch (error) {
      console.error('❌ Test email failed:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Extract safe error details (avoid circular references)
      const errorDetails = {
        message: error.message,
        name: error.name,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      };
      
      res.status(error.response?.status || 500).json({ 
        error: 'Failed to send test email',
        message: error.message || 'Unknown error occurred',
        details: errorDetails
      });
    }
  } catch (error) {
    console.error('❌ Error in test endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to format Philippine phone number for Movider
const formatPhoneForMovider = (phone) => {
  if (!phone) return phone;
  
  // Remove any spaces, dashes, or other characters
  let cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // If starts with 09, convert to +639
  if (cleanPhone.startsWith('09')) {
    cleanPhone = '+639' + cleanPhone.substring(2);
  }
  
  // If starts with 9, convert to +639
  if (cleanPhone.startsWith('9') && !cleanPhone.startsWith('+')) {
    cleanPhone = '+639' + cleanPhone;
  }
  
  // If already has +639, leave it
  if (cleanPhone.startsWith('+639')) {
    return cleanPhone;
  }
  
  // If starts with +63, leave it
  if (cleanPhone.startsWith('+63')) {
    return cleanPhone;
  }
  
  // If no + and starts with 63, add +
  if (cleanPhone.startsWith('63')) {
    return '+' + cleanPhone;
  }
  
  // Return as is if no transformation needed
  return cleanPhone;
};

// Helper function to send SMS via Movider
const sendMoviderSMS = async (phone, message) => {
  try {
    if (!MOVIDER_API_KEY || !MOVIDER_API_SECRET) {
      console.error('⚠️  Movider credentials not configured');
      return { success: false, error: 'Movider not configured' };
    }

    // Format phone number for Philippine numbers
    const formattedPhone = formatPhoneForMovider(phone);
    console.log(`📱 Sending SMS to ${formattedPhone} (original: ${phone})`);

    const response = await fetch('https://api.movider.co/v1/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: MOVIDER_API_KEY,
        api_secret: MOVIDER_API_SECRET,
        to: formattedPhone,
        text: message,
        from: 'Kimkles'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SMS sent via Movider:', data);
      return { success: true, data };
    } else {
      console.error('❌ Movider SMS failed:', data);
      return { success: false, error: data.message || 'Failed to send SMS' };
    }
  } catch (error) {
    console.error('❌ Movider SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Send order notification endpoint
app.post('/api/notify-order', async (req, res) => {
  try {
    const { orderId, amount, customerEmail, customerPhone, customerName, items } = req.body;

    // Validate required fields
    if (!orderId || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderId and amount are required' 
      });
    }

    console.log('📬 Sending order notifications...');
    console.log('Order ID:', orderId);
    console.log('Amount: ₱', amount);
    console.log('Customer Email:', customerEmail || 'N/A');
    console.log('Owner Email:', OWNER_EMAIL);
    console.log('CLIENT_ID set:', !!CLIENT_ID);
    console.log('CLIENT_SECRET set:', !!CLIENT_SECRET);

    const promises = [];

    // 1. Send notification to owner
    if (CLIENT_ID && CLIENT_SECRET) {
      const ownerNotification = notificationapi.send({
        type: 'final_njud_ni',
        to: {
          id: OWNER_EMAIL,
          email: OWNER_EMAIL,
          number: OWNER_PHONE
        },
        email: {
          subject: `New Order #${orderId} - Kimkles Cravings`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B4513;">🎉 New Order Received!</h2>
              <p>You have received a new order:</p>
              <div style="background: #FFF8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Order Number:</strong> ${orderId}</p>
                <p><strong>Customer:</strong> ${customerName || 'N/A'}</p>
                <p><strong>Customer Email:</strong> ${customerEmail || 'N/A'}</p>
                <p><strong>Customer Phone:</strong> ${customerPhone || 'N/A'}</p>
                <p><strong>Total Amount:</strong> <span style="color: #8B4513; font-size: 1.2em; font-weight: bold;">₱${parseFloat(amount).toFixed(2)}</span></p>
              </div>
              ${items && items.length > 0 ? `
                <h3>Order Items:</h3>
                <ul style="list-style: none; padding: 0;">
                  ${items.map(item => `
                    <li style="padding: 10px; border-bottom: 1px solid #EEE;">
                      ${item.name} × ${item.quantity} - ₱${parseFloat(item.price * item.quantity).toFixed(2)}
                    </li>
                  `).join('')}
                </ul>
              ` : ''}
              <p style="margin-top: 30px; color: #666;">
                Please process this order promptly.
              </p>
            </div>
          `
        }
      }).catch(err => {
        console.error('❌ NotificationAPI.send() error for owner:', err);
        throw err;
      });
      promises.push(ownerNotification);
      
      // Also send SMS to owner about new order
      const ownerSMS = sendMoviderSMS(OWNER_PHONE, `New order #${orderId} received! Amount: ₱${parseFloat(amount).toFixed(2)}. Customer: ${customerName || 'N/A'}`);
      promises.push(ownerSMS);
    }

    // 2. Send notification to customer (if email provided)
    if (customerEmail && CLIENT_ID && CLIENT_SECRET) {
      const customerNotification = notificationapi.send({
        type: 'final_njud_ni',
        to: {
          id: customerEmail,
          email: customerEmail,
          number: customerPhone || undefined
        },
        email: {
          subject: `Order Confirmation #${orderId} - Kimkles Cravings`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #8B4513;">🍪 Thank You for Your Order!</h2>
              <p>Dear ${customerName || 'Valued Customer'},</p>
              <p>We've received your order and are preparing it with love! Here are your order details:</p>
              <div style="background: #FFF8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Order Number:</strong> ${orderId}</p>
                <p><strong>Total Amount:</strong> <span style="color: #8B4513; font-size: 1.2em; font-weight: bold;">₱${parseFloat(amount).toFixed(2)}</span></p>
              </div>
              ${items && items.length > 0 ? `
                <h3>Your Order:</h3>
                <ul style="list-style: none; padding: 0;">
                  ${items.map(item => `
                    <li style="padding: 10px; border-bottom: 1px solid #EEE;">
                      ${item.name} × ${item.quantity} - ₱${parseFloat(item.price * item.quantity).toFixed(2)}
                    </li>
                  `).join('')}
                </ul>
              ` : ''}
              <p style="margin-top: 30px; color: #666;">
                Your order is being prepared and will be delivered soon. You'll receive another email with tracking information once it ships.
              </p>
              <p style="margin-top: 20px;">
                <a href="#" style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                  Track Your Order
                </a>
              </p>
              <p style="margin-top: 30px; color: #666; font-size: 0.9em;">
                Thank you for choosing Kimkles Cravings! 🍪
              </p>
            </div>
          `
        }
      }).catch(err => {
        console.error('❌ NotificationAPI.send() error for customer:', err);
        throw err;
      });
      promises.push(customerNotification);
    }

    // 3. Send SMS to customer (if phone provided) using Movider
    if (customerPhone && MOVIDER_API_KEY && MOVIDER_API_SECRET) {
      const smsMessage = `Thank you for your order! Your order #${orderId} has been received. Total: ₱${parseFloat(amount).toFixed(2)}. We'll prepare it with love! 🍪 - Kimkles Cravings`;
      const smsPromise = sendMoviderSMS(customerPhone, smsMessage);
      promises.push(smsPromise);
    }

    // Wait for all notifications to be sent
    const results = await Promise.allSettled(promises);

    // Count successes and log detailed results
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    // Log detailed results for debugging
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const safeValue = {
          status: result.value?.status,
          statusText: result.value?.statusText,
          data: result.value?.data
        };
        console.log(`✅ Notification ${index + 1} succeeded`);
        console.log(`   Status:`, safeValue.status);
        console.log(`   Data:`, safeValue.data);
      } else {
        console.error(`❌ Notification ${index + 1} failed:`, result.reason?.message || result.reason);
        // Extract safe error details
        const safeError = {
          message: result.reason?.message,
          name: result.reason?.name,
          code: result.reason?.code,
          status: result.reason?.response?.status,
          statusText: result.reason?.response?.statusText,
          responseData: result.reason?.response?.data
        };
        console.error(`   Error details:`, safeError);
      }
    });
    
    console.log(`✅ Sent ${successCount}/${promises.length} notifications`);

      if (successCount === 0 && promises.length > 0) {
        console.error('❌ All notifications failed');
        const failedDetails = results.map(r => ({
          status: r.status,
          reason: {
            message: r.reason?.message,
            name: r.reason?.name,
            code: r.reason?.code,
            status: r.reason?.response?.status,
            responseData: r.reason?.response?.data
          }
        }));
        console.error('Failed results:', failedDetails);
        return res.status(500).json({ 
          error: 'Failed to send notifications',
          details: failedDetails
        });
      }

    res.json({
      success: true,
      message: `Successfully sent ${successCount} notification(s)`,
      notificationsSent: successCount,
      totalAttempted: promises.length
    });

  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Extract safe error details (avoid circular references)
    const errorDetails = {
      message: error.message,
      name: error.name,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data
    };
    
    res.status(error.response?.status || 500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      details: errorDetails
    });
  }
});

// Send order completion notification endpoint
app.post('/api/notify-order-completion', async (req, res) => {
  try {
    const { orderId, amount, customerEmail, customerName, items } = req.body;

    // Validate required fields
    if (!orderId || !customerEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderId and customerEmail are required' 
      });
    }

    console.log('📬 Sending order completion notification...');
    console.log('Order ID:', orderId);
    console.log('Customer Email:', customerEmail);

    // Send completion notification
    if (CLIENT_ID && CLIENT_SECRET) {
      try {
        const promises = [];
        
        // 1. Send notification to owner/admin
        const ownerEmailPromise = notificationapi.send({
          type: 'final_njud_ni',
          to: {
            id: OWNER_EMAIL,
            email: OWNER_EMAIL,
            number: OWNER_PHONE
          },
          email: {
            subject: `Order #${orderId} Completed - Kimkles Cravings`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8B4513;">✅ Order Completed!</h2>
                <p>Order #${orderId} has been marked as completed.</p>
                <div style="background: #FFF8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Order Number:</strong> ${orderId}</p>
                  <p><strong>Customer:</strong> ${customerName || 'N/A'}</p>
                  <p><strong>Customer Email:</strong> ${customerEmail || 'N/A'}</p>
                  ${amount ? `<p><strong>Total Amount:</strong> <span style="color: #8B4513; font-size: 1.2em; font-weight: bold;">₱${parseFloat(amount).toFixed(2)}</span></p>` : ''}
                  <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">Completed ✓</span></p>
                </div>
              </div>
            `
          }
        });
        promises.push(ownerEmailPromise);
        
        // Send SMS to owner
        const ownerSMSPromise = sendMoviderSMS(OWNER_PHONE, `Order #${orderId} has been completed. Customer: ${customerName || 'N/A'}.`);
        promises.push(ownerSMSPromise);
        
        // 2. Send notification to customer
        const emailPromise = notificationapi.send({
          type: 'final_njud_ni',
          to: {
            id: customerEmail,
            email: customerEmail,
            number: customerPhone || undefined
          },
          email: {
            subject: `Your Order #${orderId} Has Been Completed! 🎉 - Kimkles Cravings`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8B4513;">🎉 Your Order is Complete!</h2>
                <p>Dear ${customerName || 'Valued Customer'},</p>
                <p>Great news! Your order has been completed and is ready for pickup/delivery!</p>
                <div style="background: #FFF8F0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Order Number:</strong> ${orderId}</p>
                  ${amount ? `<p><strong>Total Amount:</strong> <span style="color: #8B4513; font-size: 1.2em; font-weight: bold;">₱${parseFloat(amount).toFixed(2)}</span></p>` : ''}
                  <p><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">Completed ✓</span></p>
                </div>
                ${items && items.length > 0 ? `
                  <h3>Your Order Items:</h3>
                  <ul style="list-style: none; padding: 0;">
                    ${items.map(item => `
                      <li style="padding: 10px; border-bottom: 1px solid #EEE;">
                        ${item.name} × ${item.quantity || 1} - ₱${parseFloat((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </li>
                    `).join('')}
                  </ul>
                ` : ''}
                <p style="margin-top: 30px; color: #666;">
                  Your order is now ready! Please proceed to pickup or wait for delivery.
                </p>
                <p style="margin-top: 20px;">
                  <a href="#" style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    Track Your Order
                  </a>
                </p>
                <p style="margin-top: 30px; color: #666; font-size: 0.9em;">
                  Thank you for choosing Kimkles Cravings! 🍪
                </p>
              </div>
            `
          }
        });
        
        promises.push(emailPromise);

        // Also send SMS to customer using Movider
        const smsMessage = `Your order #${orderId} is complete and ready for pickup/delivery! 🎉 Thank you for choosing Kimkles Cravings! 🍪`;
        const customerPhone = req.body.customerPhone;
        if (customerPhone && MOVIDER_API_KEY && MOVIDER_API_SECRET) {
          const smsPromise = sendMoviderSMS(customerPhone, smsMessage);
          promises.push(smsPromise);
        }

        // Wait for all notifications
        const results = await Promise.allSettled(promises);
        const successCount = results.filter(r => r.status === 'fulfilled').length;

        console.log(`✅ Sent ${successCount}/${promises.length} notifications`);
        
        // Log detailed results for debugging
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const safeValue = {
              status: result.value?.status,
              statusText: result.value?.statusText,
              data: result.value?.data
            };
            console.log(`✅ Notification ${index + 1} succeeded`);
            console.log(`   Status:`, safeValue.status);
            console.log(`   Data:`, safeValue.data);
          } else {
            console.error(`❌ Notification ${index + 1} failed:`, result.reason?.message || result.reason);
            // Extract safe error details
            const safeError = {
              message: result.reason?.message,
              name: result.reason?.name,
              code: result.reason?.code,
              status: result.reason?.response?.status,
              statusText: result.reason?.response?.statusText,
              responseData: result.reason?.response?.data
            };
            console.error(`   Error details:`, safeError);
          }
        });
        
        // Check if all notifications failed
        if (successCount === 0 && promises.length > 0) {
          console.error('❌ All notifications failed');
          return res.status(500).json({ 
            error: 'Failed to send notifications',
            details: results.map(r => r.reason)
          });
        }
        
        res.json({
          success: true,
          message: 'Order completion notifications sent successfully',
          notificationsSent: successCount,
          totalAttempted: promises.length
        });
      } catch (notificationError) {
        console.error('❌ Error sending completion notification:', notificationError);
        console.error('Error message:', notificationError.message);
        console.error('Error response:', notificationError.response?.data);
        console.error('Error status:', notificationError.response?.status);
        
        // Extract safe error details (avoid circular references)
        const errorDetails = {
          message: notificationError.message,
          name: notificationError.name,
          code: notificationError.code,
          status: notificationError.response?.status,
          statusText: notificationError.response?.statusText,
          responseData: notificationError.response?.data
        };
        
        res.status(notificationError.response?.status || 500).json({ 
          error: 'Failed to send completion notification',
          message: notificationError.message || 'Unknown error occurred',
          details: errorDetails
        });
      }
    } else {
      console.warn('⚠️  NotificationAPI not configured, skipping notification');
      res.json({
          success: true,
          message: 'Notification skipped (NotificationAPI not configured)'
      });
    }

  } catch (error) {
    console.error('❌ Error processing completion notification:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Extract safe error details (avoid circular references)
    const errorDetails = {
      message: error.message,
      name: error.name,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data
    };
    
    res.status(error.response?.status || 500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error occurred',
      details: errorDetails
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notification API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

