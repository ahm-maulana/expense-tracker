import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "./register-form";

// Mock useRouter
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

//  Mock useRegister hook
const mockRegisterMutate = vi.fn();
const mockRegisterMutation = {
	mutate: mockRegisterMutate,
	isPending: false,
};

vi.mock("../hooks/use-register", () => ({
	useRegister: () => mockRegisterMutation,
}));

describe("RegisterForm", () => {
	afterEach(() => {
		cleanup();
	});

	describe("form validation", () => {
		it("shows validation error for invalid name", async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const nameInput = screen.getByLabelText(/name/i);
			const submitButton = screen.getByRole("button", { name: /sign up/i });
			await user.clear(nameInput);
			await user.click(submitButton);

			expect(
				await screen.findByText(/name must be at least 2 characters/i),
			).toBeInTheDocument();
		});

		it("shows validation error for invalid email", async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const emailInput = screen.getByLabelText(/email/i);
			const submitButton = screen.getByRole("button", { name: /sign up/i });
			await user.type(emailInput, "invalid-email");
			await user.click(submitButton);

			expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
		});

		it("shows validation error for empty email", async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const emailInput = screen.getByLabelText(/email/i);
			const submitButton = screen.getByRole("button", { name: /sign up/i });
			await user.clear(emailInput);
			await user.click(submitButton);

			expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
		});

		it("shows validation error for invalid password", async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const passwordInput = screen.getByLabelText("Password");
			const submitButton = screen.getByRole("button", { name: /sign up/i });
			await user.type(passwordInput, "invalidpassword");
			await user.click(submitButton);

			expect(await screen.findByText(/password must/i)).toBeInTheDocument();
		});

		it("shows validation error for empty password", async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const passwordInput = screen.getByLabelText("Password");
			const submitButton = screen.getByRole("button", { name: /sign up/i });
			await user.clear(passwordInput);
			await user.click(submitButton);

			expect(await screen.findByText(/password must/i)).toBeInTheDocument();
		});

		it("shows validation error for invalid confirmation password", async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const passwordInput = screen.getByLabelText("Password");
			const confirmPasswordInput = screen.getByLabelText(
				"Confirmation Password",
			);
			const submitButton = screen.getByRole("button", { name: /sign up/i });
			await user.type(passwordInput, "Secret123@");
			await user.type(confirmPasswordInput, "invalid-password");
			await user.click(submitButton);

			expect(
				await screen.findByText(/password do not match/i),
			).toBeInTheDocument();
		});
	});

	describe("form submission", () => {
		it("submits form with valid credentials", async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const nameInput = screen.getByLabelText(/name/i);
			const emailInput = screen.getByLabelText(/email/i);
			const passwordInput = screen.getByLabelText("Password");
			const confirmationPasswordInput = screen.getByLabelText(
				"Confirmation Password",
			);
			const submitButton = screen.getByRole("button", { name: /sign up/i });

			await user.clear(nameInput);
			await user.type(nameInput, "John Doe");
			await user.clear(emailInput);
			await user.type(emailInput, "john@example.com");
			await user.clear(passwordInput);
			await user.type(passwordInput, "Secret123@");
			await user.clear(confirmationPasswordInput);
			await user.type(confirmationPasswordInput, "Secret123@");
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockRegisterMutate).toHaveBeenCalledWith(
					{
						name: "John Doe",
						email: "john@example.com",
						password: "Secret123@",
						confirmPassword: "Secret123@",
					},
					{
						onSuccess: expect.any(Function),
						onError: expect.any(Function),
					},
				);
			});
		});
	});

	describe("error handling", () => {
		it("displays Api error message when login fails", async () => {
			const user = userEvent.setup();

			// Mock the mutation to trigger onError
			mockRegisterMutate.mockImplementation(
				(
					_data: unknown,
					options: {
						onError: (error: Error) => void;
					},
				) => {
					const error = new Error("Email already exists");
					options.onError(error);
				},
			);

			render(<RegisterForm />);

			await user.click(screen.getByRole("button", { name: /sign up/i }));

			expect(
				await screen.findByText("Email already exists"),
			).toBeInTheDocument();
		});
	});

	describe("success flow", () => {
		it("redirects to dashboard on successful register", async () => {
			const user = userEvent.setup();

			mockRegisterMutate.mockImplementation(
				(
					_data,
					options: {
						onSuccess: () => void;
					},
				) => {
					options.onSuccess();
				},
			);

			render(<RegisterForm />);

			await user.click(screen.getByRole("button", { name: /sign up/i }));

			await waitFor(() => {
				expect(mockPush).toHaveBeenCalledWith("/sign-in");
			});
		});
	});
});
