export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Jarvis Backend</h1>
      <p>The backend is running.</p>
      <ul>
        <li>/api/health</li>
        <li>/api/command</li>
        <li>/api/tts</li>
        <li>/api/mac/poll</li>
        <li>/api/mac/report</li>
      </ul>
    </main>
  );
}