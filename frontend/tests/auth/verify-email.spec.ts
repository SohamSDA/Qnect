import { expect, test } from "@playwright/test";

const verifyEmailEndpoint = "**/api/auth/verify-email";

test.describe("Verify email page", () => {
  test("shows client validation when OTP is shorter than 6 digits", async ({
    page,
  }) => {
    let verifyRequestCount = 0;

    await page.route(verifyEmailEndpoint, async (route) => {
      verifyRequestCount += 1;
      await route.abort();
    });

    await page.goto("/verify-email?email=student@example.com");

    await expect(
      page.getByText("We sent a 6-digit code to student@example.com."),
    ).toBeVisible();

    await page.locator('input[inputmode="numeric"]').fill("12");
    await page.getByRole("button", { name: "Verify and continue" }).click();

    await expect(
      page.getByText("Enter the 6-digit code from your email."),
    ).toBeVisible();
    expect(verifyRequestCount).toBe(0);
  });

  test("verifies OTP, stores auth state, and redirects to the user dashboard", async ({
    page,
  }) => {
    const fakeToken = "header.payload.signature";

    await page.route(verifyEmailEndpoint, async (route) => {
      const request = route.request();
      const body = request.postDataJSON();

      expect(request.method()).toBe("POST");
      expect(body).toEqual({
        email: "student@example.com",
        otp: "123456",
      });

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: {
          "access-control-allow-origin": "*",
        },
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

    await page.goto("/verify-email?email=student@example.com");

    await page.locator('input[inputmode="numeric"]').fill("123456");
    await page.getByRole("button", { name: "Verify and continue" }).click();

    await expect(page).toHaveURL(/\/dashboard\/user$/);

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("qnect_jwt")))
      .toBe(fakeToken);

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("qnect_user")))
      .toContain('"email":"student@example.com"');
  });
});
