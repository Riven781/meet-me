export async function logout() {
  const url = "/api/logout";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} failed: ${res.status} ${res.statusText} ${text}`);
  }
}



export async function registerUser(userData) {
  const url = "/api/register";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);

    const err = new Error(`POST ${url} failed: ${res.status} ${res.statusText}`);
    err.details = data?.details;
    err.code = data?.code;
    err.status = res.status;
    throw err
  }
}


export async function loginUser(usernameOrEmail, password) {
  const url = "/api/login";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernameOrEmail, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const err = new Error(`POST ${url} failed: ${res.status} ${res.statusText}`);
    err.code = data?.code;
    err.status = res.status;
    throw err;

  }
}
