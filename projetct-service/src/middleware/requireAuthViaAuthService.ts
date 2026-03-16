import type { NextFunction, Request, Response } from "express";

type AuthMeResponse = {
	user?: {
		id: number;
		email?: string;
	};
};

declare global {
	namespace Express {
		interface Request {
			auth?: {
				userId: string;
				email?: string;
			};
		}
	}
}

const getAuthServiceUrl = (): string => {
	const baseUrl = process.env.AUTH_SERVICE_URL || "http://localhost:3000";
	return baseUrl.replace(/\/+$/, "");
};

export const requireAuthViaAuthService = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const header = req.header("authorization") || req.header("Authorization");
	if (!header) {
		res.status(401).json({ message: "Missing Authorization header" });
		return;
	}

	const [scheme, token] = header.split(" ");
	if (scheme !== "Bearer" || !token) {
		res.status(401).json({ message: "Invalid Authorization header" });
		return;
	}

	const abortController = new AbortController();
	const timeout = setTimeout(() => abortController.abort(), 5000);

	try {
		const url = `${getAuthServiceUrl()}/auth/me`;
		const response = await fetch(url, {
			method: "GET",
			headers: {
				accept: "application/json",
				authorization: `Bearer ${token}`,
			},
			signal: abortController.signal,
		});

		if (response.status === 401 || response.status === 403) {
			res.status(401).json({ message: "Unauthorized" });
			return;
		}

		if (!response.ok) {
			const text = await response.text().catch(() => "");
			res.status(502).json({
				message: "Auth service error",
				status: response.status,
				body: text,
			});
			return;
		}

		const payload = (await response.json()) as AuthMeResponse;
		const user = payload.user;
		if (!user || typeof user.id !== "number") {
			res.status(502).json({ message: "Invalid auth-service response" });
			return;
		}

		req.auth = user.email ? { userId: String(user.id), email: user.email } : { userId: String(user.id) };
		next();
	} catch (error) {
		console.error("Auth-service call failed:", error);
		res.status(502).json({ message: "Cannot reach auth-service" });
	} finally {
		clearTimeout(timeout);
	}
};
