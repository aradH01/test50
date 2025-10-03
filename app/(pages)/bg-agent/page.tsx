export default function Home() {
  const message = "Hello world"; // ← missing semicolon
  console.log("unused"); // ← ESLint will complain about unused console
  const message2 = "Hello world"; // ← missing semicolon
  console.log("unused"); // ← ESLint will complain about unused console
  const message3 = "Hello world"; // ← missing semicolon
  console.log("unused"); // ← ESLint will complain about unused console
  return <h1>{message}</h1>;
}
