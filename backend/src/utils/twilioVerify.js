const twilio = require("twilio");

const getClient = () => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } =
    process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    throw new Error(
      "Twilio Verify nao configurado. Defina TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_VERIFY_SERVICE_SID.",
    );
  }

  return {
    client: twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN),
    serviceSid: TWILIO_VERIFY_SERVICE_SID,
  };
};

const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length < 10 || digits.length > 15) {
    throw new Error("Telefone invalido.");
  }

  if (digits.startsWith("55")) {
    return `+${digits}`;
  }

  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  return `+${digits}`;
};

const sendVerificationCode = async (phone, channel = "sms") => {
  const { client, serviceSid } = getClient();
  const to = normalizePhone(phone);

  return client.verify.v2.services(serviceSid).verifications.create({
    to,
    channel,
  });
};

const checkVerificationCode = async (phone, code) => {
  const { client, serviceSid } = getClient();
  const to = normalizePhone(phone);

  const verification = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({ to, code });

  return verification.status === "approved";
};

const maskPhone = (phone) => {
  const normalized = normalizePhone(phone);
  return normalized.replace(/(\+\d{2})(\d+)(\d{4})$/, (_, ddi, middle, end) => {
    return `${ddi} ${"*".repeat(Math.min(middle.length, 6))}${end}`;
  });
};

module.exports = {
  normalizePhone,
  sendVerificationCode,
  checkVerificationCode,
  maskPhone,
};
