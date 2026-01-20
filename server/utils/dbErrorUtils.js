export function getDuplicateFieldFromSqlMessage(sqlMessage = "") {
  const msg = sqlMessage.toLowerCase();

  if (msg.includes("username")) return "username";
  if (msg.includes("email")) return "email";

  return null;
}
