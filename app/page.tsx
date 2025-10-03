export default function Home() {
  // Missing React import - Pro Fixer should add this
  const [count, setCount] = useState(0);
  const unusedVariable = "this should get underscore prefix";

  useEffect(() => {
    console.log("Effect running");
  }, []);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div>
        <h1>Welcome to Pro Fixer v4 Test</h1>
        <p>Count: {count}</p>
        <button onClick={() => setCount((c) => c + 1)}>Increment</button>
      </div>
    </div>
  );
}
