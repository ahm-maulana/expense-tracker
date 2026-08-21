import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountdown } from "./use-countdown";

describe("useCountdown", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	describe("initial state", () => {
		it("should start with the provided initialSeconds", () => {
			const { result } = renderHook(() => useCountdown({ initialSeconds: 30 }));
			expect(result.current.remaining).toBe(30);
		});

		it("should default to 60 seconds when not provided", async () => {
			const { result } = renderHook(() => useCountdown({}));
			expect(result.current.remaining).toBe(60);
		});

		it("should set isRunning correctly", () => {
			const { result } = renderHook(() => useCountdown({ initialSeconds: 0 }));

			expect(result.current.isRunning).toBe(false);
		});
	});

	describe("countdown behavior", () => {
		it("should decrement remaining by 1 every second", () => {
			const { result } = renderHook(() => useCountdown({ initialSeconds: 3 }));

			act(() => {
				vi.advanceTimersByTime(1000);
			});
			expect(result.current.remaining).toBe(2);

			act(() => {
				vi.advanceTimersByTime(1000);
			});
			expect(result.current.remaining).toBe(1);
		});
	});

	describe("restart function", () => {
		it("should reset remaining to initialSeconds", () => {
			const { result } = renderHook(() => useCountdown({ initialSeconds: 30 }));

			vi.advanceTimersByTime(10000);

			result.current.restart();

			expect(result.current.remaining).toBe(30);
		});
	});
});
