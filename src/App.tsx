import React, { useState, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import './App.css'

function App() {
	const [code, setCode] = useState(`public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}`)
	const [output, setOutput] = useState('')
	const [isRunning, setIsRunning] = useState(false)
	const [leftWidth, setLeftWidth] = useState(50) // percentage
	const [isDragging, setIsDragging] = useState(false)

	const containerRef = useRef<HTMLDivElement>(null)

	const runCode = async () => {
		if (isRunning) return

		setIsRunning(true)
		setOutput('')

		try {
			const resp = await fetch('https://emkc.org/api/v2/piston/execute', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					language: 'java',
					version: '15',
					files: [{ content: code }]
				})
			})
			const data = await resp.json()
			setOutput(data.run.stdout + data.run.stderr)
		} catch (err) {
			setOutput(`Error: ${String(err)}`)
		} finally {
			setIsRunning(false)
		}
	}

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}, [])

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isDragging || !containerRef.current) return

		const containerRect = containerRef.current.getBoundingClientRect()
		const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

		// Constrain the width between 20% and 80%
		const constrainedWidth = Math.min(80, Math.max(20, newLeftWidth))
		setLeftWidth(constrainedWidth)
	}, [isDragging])

	const handleMouseUp = useCallback(() => {
		setIsDragging(false)
	}, [])

	// Add event listeners for mouse move and up
	React.useEffect(() => {
		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
			document.body.style.cursor = 'col-resize'
			document.body.style.userSelect = 'none'
		} else {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
			document.body.style.cursor = ''
			document.body.style.userSelect = ''
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
			document.body.style.cursor = ''
			document.body.style.userSelect = ''
		}
	}, [isDragging, handleMouseMove, handleMouseUp])

	const rightWidth = 100 - leftWidth

	return (
		<div className="app-container" ref={containerRef}>
			<div className="editor-panel" style={{ width: `${leftWidth}%` }}>
				<div className="editor-header">
					<h3 className="editor-title">Java Editor</h3>
					<button
						className={`run-button ${isRunning ? 'loading' : ''}`}
						onClick={runCode}
						disabled={isRunning}
					>
						{isRunning ? 'Running...' : 'Run Code'}
					</button>
				</div>
				<div className="editor-content">
					<Editor
						height="100%"
						defaultLanguage="java"
						value={code}
						onChange={(value: string | undefined) => setCode(value ?? '')}
						theme="vs-dark"
						options={{
							automaticLayout: true,
							minimap: { enabled: false },
							fontSize: 14,
							lineHeight: 1.6,
							fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
							scrollBeyondLastLine: false,
							smoothScrolling: true,
							cursorBlinking: 'smooth',
							renderLineHighlight: 'gutter'
						}}
					/>
				</div>
			</div>

			<div
				className={`splitter ${isDragging ? 'dragging' : ''}`}
				onMouseDown={handleMouseDown}
			/>

			<div className="output-panel" style={{ width: `${rightWidth}%` }}>
				<div className="output-header">
					<h3 className="output-title">Output</h3>
				</div>
				<div className="output-content">{output}</div>
			</div>
		</div>
	)
}

export default App
