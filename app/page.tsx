"use client";

import {useState, useEffect} from "react";

const HomePage = () => {
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [dots, setDots] = useState("");
	const [videoInfo, setVideoInfo] = useState<
		Array<{title: string; url: string}>
	>([]);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isLoading) {
			interval = setInterval(() => {
				setDots(prevDots =>
					prevDots.length >= 3 ? "" : prevDots + "."
				);
			}, 500);
		}
		return () => clearInterval(interval);
	}, [isLoading]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setAnswer("Thinking");
		setIsLoading(true);
		setVideoInfo([]);

		try {
			const embedResponse = await fetch("/api/embed", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({question}),
			});
			const embedData = await embedResponse.json();
			if (embedData.error) throw new Error(embedData.error);

			const searchResponse = await fetch("/api/search", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({embedding: embedData.embedding}),
			});
			const searchData = await searchResponse.json();
			if (searchData.error) throw new Error(searchData.error);

			const claudeResponse = await fetch("/api/answer", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					question,
					chunks: searchData.videoInfo.map(
						(info: {chunk: string}) => info.chunk
					),
				}),
			});
			const claudeData = await claudeResponse.json();
			if (claudeData.error) throw new Error(claudeData.error);

			setAnswer(claudeData.answer);
			setVideoInfo(searchData.videoInfo);
		} catch (error) {
			console.error(error);
			setAnswer(
				"Sorry, an error occurred while processing your question."
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClearAnswer = () => {
		setAnswer("");
		setQuestion("");
		setVideoInfo([]);
	};

	const uniqueVideoInfo = Array.from(
		new Map(videoInfo?.map(item => [item.url, item])).values()
	);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-4">
			<div className="w-full max-w-2xl bg-white rounded-lg shadow-xl p-8">
				<h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
					Chat with Bobby
				</h1>
				{!answer && !isLoading && (
					<>
						<p className="text-center text-gray-600 mb-6">
							Welcome to Bobby Parrish&apos;s chatbot! Ask
							questions about healthy living, products to avoid,
							and get insights on ingredients and foods. Bobby is
							here to help you make informed decisions about your
							health and nutrition.
						</p>
						<p className="text-center text-gray-600 mb-6">
							Check out Bobby&apos;s{" "}
							<a
								href="https://www.youtube.com/@BobbyParrish"
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 hover:underline">
								YouTube channel
							</a>{" "}
							for more health and nutrition content!
						</p>
					</>
				)}
				<form onSubmit={handleSubmit} className="mb-6">
					<input
						type="text"
						value={question}
						onChange={e => setQuestion(e.target.value)}
						placeholder="Enter your question about health, nutrition, or ingredients"
						className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="submit"
						className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
						Ask Bobby
					</button>
				</form>
				{(answer || isLoading) && (
					<div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
						<h2 className="font-bold mb-3 text-xl text-gray-800">
							Bobby&apos;s Answer:
						</h2>
						<div className="text-gray-700 whitespace-pre-wrap">
							{isLoading ? (
								<p>Thinking{dots}</p>
							) : (
								<>
									{answer
										.split("\n")
										.map((paragraph, index) => (
											<p key={index} className="mb-2">
												{paragraph}
											</p>
										))}
									{uniqueVideoInfo.length > 0 && (
										<div className="mt-4">
											<h3 className="font-bold mb-2">
												Referenced Videos:
											</h3>
											<ul className="list-disc pl-5">
												{uniqueVideoInfo?.map(
													(video, index) => (
														<li key={index}>
															<a
																href={video.url}
																target="_blank"
																rel="noopener noreferrer"
																className="text-blue-600 hover:underline">
																{video.title}
															</a>
														</li>
													)
												)}
											</ul>
										</div>
									)}
								</>
							)}
						</div>
						{!isLoading && (
							<button
								onClick={handleClearAnswer}
								className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
								Ask Another Question
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default HomePage;
