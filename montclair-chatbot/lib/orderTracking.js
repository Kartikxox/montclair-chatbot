// Shopify order tracking — mirrors the approach planned for Indoarab:
// the Prodinent app writes tracking info to Shopify's native fulfillment object,
// so we just read from Admin API Orders instead of calling a courier API directly.

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

async function trackOrder({ orderNumber, email }) {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return {
      found: false,
      message: 'Order tracking is not yet configured for this store.',
    };
  }

  const cleanOrderNumber = String(orderNumber).replace(/^#/, '');
  const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-07/orders.json?name=${encodeURIComponent(
    '#' + cleanOrderNumber
  )}&status=any`;

  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  const order = (data.orders || [])[0];

  if (!order) {
    return { found: false, message: "We couldn't find an order with that number." };
  }

  if (email && order.email && order.email.toLowerCase() !== String(email).toLowerCase()) {
    return { found: false, message: 'Order number and email do not match.' };
  }

  const fulfillment = (order.fulfillments || [])[0];

  return {
    found: true,
    orderNumber: order.name,
    fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
    trackingNumber: fulfillment?.tracking_number || null,
    trackingUrl: fulfillment?.tracking_url || null,
    trackingCompany: fulfillment?.tracking_company || null,
  };
}

module.exports = { trackOrder };
