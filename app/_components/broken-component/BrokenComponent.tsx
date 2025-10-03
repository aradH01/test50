// Multiple TypeScript errors for Pro Fixer to handle

// Missing React import
const BrokenComponent = (props) => {
  // Missing type annotation
  const [isOpen, setIsOpen] = useState(false); // Missing useState import
  const [data, setData] = useState<string>("");
  const unusedRef = useRef(null); // Missing useRef import + unused variable

  // Missing useCallback import
  const handleClick = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Missing FC type
  const ChildComponent: FC<{ text: string }> = ({ text }) => (
    <span>{text}</span>
  );

  return (
    <div className={cn("broken-component", { open: isOpen })}>
      {" "}
      {/* Missing cn import */}
      <button onClick={handleClick}>
        Toggle: {isOpen ? "Open" : "Closed"}
      </button>
      <ChildComponent text={data} />
    </div>
  );
};

export default BrokenComponent;
