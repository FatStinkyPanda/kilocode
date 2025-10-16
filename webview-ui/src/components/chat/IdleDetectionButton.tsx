import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Pause, Play } from "lucide-react"

import { vscode } from "@/utils/vscode"
import { Button, StandardTooltip } from "@/components/ui"

interface IdleDetectionButtonProps {
	disabled?: boolean
}

export const IdleDetectionButton = ({ disabled = false }: IdleDetectionButtonProps) => {
	const [isPaused, setIsPaused] = useState(false)
	const { t } = useTranslation()

	// Listen for status change messages from the extension
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "idleDetectionStatus") {
				setIsPaused(message.isPaused === true)
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	const handleToggle = () => {
		if (isPaused) {
			vscode.postMessage({ type: "idleDetectionResume" })
		} else {
			vscode.postMessage({ type: "idleDetectionPause" })
		}
	}

	const tooltipContent = isPaused ? t("chat:idleDetection.resumeTooltip") : t("chat:idleDetection.pauseTooltip")

	return (
		<StandardTooltip content={tooltipContent}>
			<Button
				variant="ghost"
				size="icon"
				disabled={disabled}
				className="h-7 w-7 p-1.5 hover:bg-vscode-toolbar-hoverBackground"
				onClick={handleToggle}
				data-testid="idle-detection-button">
				{isPaused ? <Play size={16} /> : <Pause size={16} />}
			</Button>
		</StandardTooltip>
	)
}
