// Missing React import - should be auto-fixed
// Missing proper type annotations - should be flagged

export interface TestProps {
  title: string;
  onClick: () => void;
  children?: ReactNode; // Missing ReactNode import
}

const TestComponent = ({ title, onClick, children }: TestProps) => {
  const unusedProps = "should get underscore"; // Unused variable

  return (
    <div className="test-component">
      <h2>{title}</h2>
      <button onClick={onClick}>Click me</button>
      {children}
    </div>
  );
};

export default TestComponent;
