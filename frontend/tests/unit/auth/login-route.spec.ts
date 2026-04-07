import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  sign: vi.fn(),
  sendEmailVerificationOtp: vi.fn(),
}));

vi.mock("../../../../backend/src/modules/auth/user.model.js", () => ({
  User: {
    findOne: mocks.findOne,
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: mocks.sign,
  },
}));

vi.mock("../../../../backend/src/config/env.js", () => ({
  env: {
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "1h",
    NODE_ENV: "test",
  },
}));

vi.mock(
  "../../../../backend/src/modules/notifications/email.service.js",
  () => ({
    sendEmailVerificationOtp: mocks.sendEmailVerificationOtp,
  }),
);

type LoginUser =
  (typeof import("../../../../backend/src/modules/auth/auth.service"))["loginUser"];

let loginUser: LoginUser;

beforeAll(async () => {
  ({ loginUser } =
    await import("../../../../backend/src/modules/auth/auth.service"));
});

beforeEach(() => {
  vi.clearAllMocks();
});

const buildUser = (overrides: Record<string, unknown> = {}) => ({
  _id: {
    toString: () => "user-1",
  },
  name: "Student One",
  email: "student@example.com",
  // bcrypt hash for "secret123"
  password: "$2b$10$esCHhoNdA9nz3bfgLaE3.udp.2FFVpOl5Ic1n1e0NruejOxoCkcza",
  role: "user",
  emailVerified: true,
  collegeEmail: "student@college.edu",
  department: undefined,
  position: undefined,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  ...overrides,
});

describe("loginUser auth service", () => {
  it("returns a signed token and safe user when credentials are valid", async () => {
    const user = buildUser();

    mocks.findOne.mockResolvedValue(user);

    const result = await loginUser({
      email: "student@example.com",
      password: "secret123",
    });

    expect(mocks.findOne).toHaveBeenCalledWith({
      email: "student@example.com",
    });
    expect(typeof result.token).toBe("string");
    expect(result.token.length).toBeGreaterThan(0);
    expect(result.user).toEqual({
      id: "user-1",
      name: "Student One",
      email: "student@example.com",
      role: "user",
      emailVerified: true,
      collegeEmail: "student@college.edu",
      department: undefined,
      position: undefined,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    });
  });

  it("rejects login when the user does not exist", async () => {
    mocks.findOne.mockResolvedValue(null);

    await expect(
      loginUser({
        email: "student@example.com",
        password: "secret123",
      }),
    ).rejects.toMatchObject({
      message: "Invalid email or password",
      status: 401,
    });

    expect(mocks.sign).not.toHaveBeenCalled();
  });

  it("rejects login when the password is incorrect", async () => {
    mocks.findOne.mockResolvedValue(buildUser());

    await expect(
      loginUser({
        email: "student@example.com",
        password: "wrong-password",
      }),
    ).rejects.toMatchObject({
      message: "Invalid email or password",
      status: 401,
    });

    expect(mocks.sign).not.toHaveBeenCalled();
  });

  it("rejects login when the email is not verified", async () => {
    mocks.findOne.mockResolvedValue(
      buildUser({
        emailVerified: false,
      }),
    );

    await expect(
      loginUser({
        email: "student@example.com",
        password: "secret123",
      }),
    ).rejects.toMatchObject({
      message: "Email not verified. Please verify your email to continue.",
      status: 403,
      code: "EMAIL_NOT_VERIFIED",
    });

    expect(mocks.sign).not.toHaveBeenCalled();
  });
});
