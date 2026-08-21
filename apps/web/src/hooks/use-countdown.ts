import { useCallback, useEffect, useState } from "react";

type Props = {
	initialSeconds?: number;
};

export function useCountdown({ initialSeconds = 60 }: Props) {
	const [remaining, setRemaining] = useState<number>(initialSeconds);

	useEffect(() => {
		if (remaining <= 0) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			setRemaining((current) => current - 1);
		}, 1000);

		return () => window.clearTimeout(timeoutId);
	}, [remaining]);

	const restart = useCallback(() => {
		setRemaining(initialSeconds);
	}, [initialSeconds]);

	return {
		remaining,
		isRunning: remaining > 0,
		restart,
	};
}
