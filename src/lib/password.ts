// Rules for the dashboard password. Supabase checks length and character types again on its side
// (Authentication → Providers → Email), so these messages are the friendly first line.

export const PASSWORD_MIN = 12;

const common = [
  "password",
  "qwerty",
  "letmein",
  "welcome",
  "iloveyou",
  "admin",
  "123456",
  "shotsbydunz",
  "sbdbooth",
  "dunz",
];

export const passwordRules = [
  `At least ${PASSWORD_MIN} characters`,
  "Letters, at least one number and one symbol",
  "Not your email, the business name or a common word like “password”",
];

export function passwordProblem(password: string, email: string) {
  if (password.length < PASSWORD_MIN) return `Use at least ${PASSWORD_MIN} characters.`;
  if (password.length > 128) return "That password is too long. Use 128 characters or fewer.";
  if (!/[a-z]/i.test(password) || !/\d/.test(password) || !/[^a-z0-9]/i.test(password))
    return "Mix letters with at least one number and one symbol.";
  const lower = password.toLowerCase();
  const name = email.split("@")[0].toLowerCase();
  if ((name.length >= 4 && lower.includes(name)) || common.some((w) => lower.includes(w)))
    return "That password is too easy to guess. Avoid your email, the business name and common words.";
  return null;
}
