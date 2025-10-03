// Another component with TypeScript issues

interface SampleProps {
  title: string;
  count?: number;
  onUpdate: (newCount: number) => void;
}

// Missing React import and useState
const SampleComponent = ({ title, count = 0, onUpdate }: SampleProps) => {
  const [localCount, setLocalCount] = useState(count);
  const unusedHelper = "should be prefixed with underscore";

  const handleIncrement = useCallback(() => {
    const newCount = localCount + 1;
    setLocalCount(newCount);
    onUpdate(newCount);
  }, [localCount, onUpdate]); // Missing useCallback import

  return (
    <div className="sample-component border p-4 rounded">
      <h3>{title}</h3>
      <p>Current count: {localCount}</p>
      <button
        onClick={handleIncrement}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Increment
      </button>
    </div>
  );
};

export default SampleComponent;
