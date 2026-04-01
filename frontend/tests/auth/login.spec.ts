import { expect, test } from "@playwright/test";

const loginEndpoint = "**/api/auth/login";
const currentQueueEndpoint = "**/api/user-status/current-queue";

test.describe("Login page", () => {
  test("shows backend error when credentials are invalid", async ({
    page,
  }) => {
    await page.route(loginEndpoint, async (route) => {
      const request = route.request();
      const body = request.postDataJSON();

      expect(body).toEqual({
        email: "student@example.com",
        password: "wrong-password",
      });

      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Invalid email or password",
        }),
      });
    });

    await page.goto("/login");
    await page.getByPlaceholder("Email").fill("student@example.com");
    await page.getByPlaceholder("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(
      page.locator("form").getByText("Invalid email or password"),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("redirects to a safe next path after successful login", async ({
    page,
  }) => {
    const fakeToken = "header.payload.signature";

    await page.route(loginEndpoint, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: fakeToken,
          user: {
            id: "user-1",
            name: "Student One",
            email: "student@example.com",
            role: "user",
            emailVerified: true,
          },
        }),
      });
    });

    await page.goto("/login?next=%2Fprofile");
    await page.getByPlaceholder("Email").fill("student@example.com");
    await page.getByPlaceholder("Password").fill("secret123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/profile$/);
    await expect(
      page.getByRole("heading", { name: "Student One", exact: true }),
    ).toBeVisible();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("qnect_jwt")))
      .toBe(fakeToken);
  });

  test("ignores an unsafe next path and falls back to the role dashboard", async ({
    page,
  }) => {
    await page.route(loginEndpoint, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "header.payload.signature",
          user: {
            id: "user-2",
            name: "Student Two",
            email: "student2@example.com",
            role: "user",
            emailVerified: true,
          },
        }),
      });
    });

    await page.route(currentQueueEndpoint, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: null,
        }),
      });
    });

    await page.goto("/login?next=%2F%2Fevil.example");
    await page.getByPlaceholder("Email").fill("student2@example.com");
    await page.getByPlaceholder("Password").fill("secret123");
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL(/\/dashboard\/user$/);
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible();
  });
});
