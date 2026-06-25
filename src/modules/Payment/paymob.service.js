const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;
const PAYMOB_BASE_URL =process.env.PAYMOB_BASE_URL || "https://accept.paymob.com/api";

const postPaymob = async (path, body) => {
    const response = await fetch(`${PAYMOB_BASE_URL}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = data.message || data.detail || response.statusText;
        throw new Error(message);
    }

    return data;
};

export const getAuthToken = async () => {
    if (!PAYMOB_API_KEY) {
        throw new Error("PAYMOB_API_KEY is not configured");
    }

    const data = await postPaymob("/auth/tokens", {
        api_key: PAYMOB_API_KEY,
    });

    return data.token;
};

export const createOrder = async (
    authToken,
    amountCents,
    merchantOrderId,
    items = [],
) => {
    const data = await postPaymob("/ecommerce/orders", {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountCents,
        currency: "EGP",
        merchant_order_id: merchantOrderId,
        items,
    });

    return data.id;
};

export const getPaymentKey = async (
    authToken,
    orderId,
    amountCents,
    billingData,
) => {
    if (!PAYMOB_INTEGRATION_ID) {
        throw new Error("PAYMOB_INTEGRATION_ID is not configured");
    }

    const requiredFields = [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "country",
        "city",
        "state",
        "street",
        "building",
        "floor",
        "apartment",
    ];

    for (const field of requiredFields) {
        if (!billingData[field]) {
            throw new Error(`Missing billing field: ${field}`);
        }
    }

    const data = await postPaymob("/acceptance/payment_keys", {
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: billingData,
        currency: "EGP",
        integration_id: Number(PAYMOB_INTEGRATION_ID),
    });

    return data.token;
};

export const initiatePayment = async ({
    amountEGP,
    merchantOrderId,
    billingData,
    items = [],
}) => {
    if (!PAYMOB_IFRAME_ID) {
        throw new Error("PAYMOB_IFRAME_ID is not configured");
    }

    const amountCents = Math.round(Number(amountEGP) * 100);

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
        throw new Error("Invalid payment amount");
    }

    const authToken = await getAuthToken();
    const orderId = await createOrder(
        authToken,
        amountCents,
        merchantOrderId,
        items,
    );
    const paymentKey = await getPaymentKey(
        authToken,
        orderId,
        amountCents,
        billingData,
    );

    return {
        providerOrderId: orderId,
        paymentKey,
        amountCents,
        paymentUrl: `${PAYMOB_BASE_URL}/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
    };
};