import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RegisterPage from "@/app/(public)/sign-up/page";
import { server } from "../../mocks/server";

const push = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push,
	}),
}));

function setup() {
	const queryClient = new QueryClient();
	const user = userEvent.setup();

	render(
		<QueryClientProvider client={queryClient}>
			<RegisterPage />
		</QueryClientProvider>,
	);

	const nameInput = screen.getByLabelText(/name/i);
	const emailInput = screen.getByLabelText(/email/i);
	const passwordInput = screen.getByLabelText("Password");
	const confirmPasswordInput = screen.getByLabelText(/confirmation password/i);
	const submitButton = screen.getByRole("button", {
		name: /sign up/i,
	});

	return {
		user,
		nameInput,
		emailInput,
		passwordInput,
		confirmPasswordInput,
		submitButton,
	};
}

describe("Register", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("success", () => {
		it("should register a new user when registration data is valid", async () => {
			const {
				user,
				nameInput,
				emailInput,
				passwordInput,
				confirmPasswordInput,
			} = setup();

			await user.clear(nameInput);
			await user.type(nameInput, "John Doe");
			await user.clear(emailInput);
			await user.type(emailInput, "john@example.com");
			await user.clear(passwordInput);
			await user.type(passwordInput, "Password123@");
			await user.clear(confirmPasswordInput);
			await user.type(confirmPasswordInput, "Password123@");

			await user.click(screen.getByRole("button", { name: /sign up/i }));

			await waitFor(() => {
				expect(push).toHaveBeenCalledWith("/sign-in");
			});
		});
	});

	describe("validation errors", () => {
		it("should display validation errors when required fields are empty", async () => {
			server.use(
				http.post("*/api/auth/register", () => {
					return HttpResponse.json(
						{
							message: "Validation failed",
						},
						{
							status: 400,
						},
					);
				}),
			);

			const {
				user,
				nameInput,
				emailInput,
				passwordInput,
				confirmPasswordInput,
			} = setup();

			await user.clear(nameInput);
			await user.clear(emailInput);
			await user.clear(passwordInput);
			await user.clear(confirmPasswordInput);

			await user.click(screen.getByRole("button", { name: /sign up/i }));

			expect(
				await screen.findByText(/name must be at least 2 characters/i),
			).toBeInTheDocument();

			expect(screen.getByText(/email is required/i)).toBeInTheDocument();

			expect(
				screen.getByText(/password must be at least 8 characters/i),
			).toBeInTheDocument();
		});

		it("should display an error when email is invalid", async () => {
			server.use(
				http.post("*/api/auth/register", () => {
					return HttpResponse.json(
						{
							message: "Validation failed",
						},
						{
							status: 400,
						},
					);
				}),
			);
			const { user, emailInput, submitButton } = setup();

			await user.clear(emailInput);
			await user.type(emailInput, "invalid-email");

			await user.click(submitButton);

			expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
		});

		it("should display an error when confirmation password doesn't match", async () => {
			server.use(
				http.post("*/api/auth/register", () => {
					return HttpResponse.json(
						{
							message: "Validation failed",
						},
						{
							status: 400,
						},
					);
				}),
			);

			const { user, passwordInput, confirmPasswordInput, submitButton } =
				setup();

			await user.clear(passwordInput);
			await user.type(passwordInput, "Password123@");
			await user.clear(confirmPasswordInput);
			await user.type(confirmPasswordInput, "WrongConfirmationPassword");

			await user.click(submitButton);

			expect(
				await screen.findByText(/password do not match/i),
			).toBeInTheDocument();
		});

		it("should display an error when password is not valid", async () => {
			server.use(
				http.post("*/api/auht/register", () => {
					return HttpResponse.json(
						{
							message: "Validation failed",
						},
						{
							status: 400,
						},
					);
				}),
			);

			const { user, passwordInput, submitButton } = setup();

			await user.clear(passwordInput);
			await user.type(passwordInput, "invalidpassword");

			await user.click(submitButton);

			expect(
				await screen.findByText(/password must contain/i),
			).toBeInTheDocument();
		});
	});
});
