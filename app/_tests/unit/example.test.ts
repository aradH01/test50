// Broken import paths that Pro Fixer should handle
import { something } from '@/nonexistent/module';
import TestComponent from '@/components/test-component'; // Wrong path

test("always fails", () => {
  expect(1).toBe(2);
});

test("component test with broken imports", () => {
  // This will fail due to missing imports
  render(<TestComponent title="test" onClick={() => {}} />);
  expect(screen.getByText("test")).toBeInTheDocument();
});
