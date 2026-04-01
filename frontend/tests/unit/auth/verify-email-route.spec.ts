import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../../../app/api/auth/verify-email/route";

describe("verify-email API route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards the verify-email request and returns the backend success payload", async () => {
    const backendPayload = {
      token: "header.payload.signature",
      user: {
        id: "user-1",
        email: "student@example.com",
        role: "user",
      },
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(backendPayload), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("http://localhost:3000/api/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "student@example.com",
        otp: "123456",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:5000/api/auth/verify-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "student@example.com",
          otp: "123456",
        }),
      },
    );
    expect(response.status).toBe(200);
    expect(data).toEqual(backendPayload);
  });

  it("maps backend error responses and preserves status/code fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "INVALID_OTP",
          requiresVerification: true,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      ),
    );

    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("http://localhost:3000/api/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "student@example.com",
        otp: "000000",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      message: "Email verification failed",
      code: "INVALID_OTP",
      requiresVerification: true,
    });
  });

  it("returns 500 when the downstream request throws", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.stubGlobal("fetch", fetchMock);

    const request = new NextRequest("http://localhost:3000/api/auth/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "student@example.com",
        otp: "123456",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      message: "Internal server error",
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
