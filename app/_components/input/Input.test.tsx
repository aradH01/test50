/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

// Helper component for testing with icons
const TestIcon = () => <span data-testid="test-icon">Icon</span>;

describe("Input", () => {
  // Arrange, Act, Assert pattern

  describe("Basic functionality", () => {
    it("renders input with placeholder", () => {
      // Arrange & Act
      render(<Input placeholder="Enter text" />);

      // Assert
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("accepts user input", async () => {
      // Arrange
      const user = userEvent.setup();
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText("Enter text");

      // Act
      await user.type(input, "Hello World");

      // Assert
      expect(input).toHaveValue("Hello World");
    });

    it("forwards ref correctly", () => {
      // Arrange
      const ref = { current: null };

      // Act
      render(<Input ref={ref} />);

      // Assert
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe("Variants", () => {
    it("applies default variant classes", () => {
      // Arrange & Act
      render(<Input data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveClass("border-gray-300");
    });

    it("applies error variant classes", () => {
      // Arrange & Act
      render(<Input variant="error" data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveClass("border-red-500");
    });

    it("applies success variant classes", () => {
      // Arrange & Act
      render(<Input variant="success" data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveClass("border-green-500");
    });

    it("applies ghost variant classes", () => {
      // Arrange & Act
      render(<Input variant="ghost" data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveClass("border-transparent");
    });
  });

  describe("Sizes", () => {
    it("applies default size classes", () => {
      // Arrange & Act
      render(<Input data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveClass("h-10");
    });

    it("applies small size classes", () => {
      // Arrange & Act
      render(<Input size="sm" data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveClass("h-8");
    });

    it("applies large size classes", () => {
      // Arrange & Act
      render(<Input size="lg" data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveClass("h-12");
    });
  });

  describe("Label and messages", () => {
    it("renders with label", () => {
      // Arrange & Act
      render(<Input label="Email Address" />);

      // Assert
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByText("Email Address")).toBeInTheDocument();
    });

    it("associates label with input correctly", () => {
      // Arrange & Act
      render(<Input label="Email Address" />);
      const label = screen.getByText("Email Address");
      const input = screen.getByLabelText("Email Address");

      // Assert
      expect(label).toHaveAttribute("for", input.id);
    });

    it("displays error message", () => {
      // Arrange & Act
      render(<Input label="Password" error="Password is required" />);

      // Assert
      expect(screen.getByText("Password is required")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("displays success message", () => {
      // Arrange & Act
      render(<Input label="Username" success="Username is available" />);

      // Assert
      expect(screen.getByText("Username is available")).toBeInTheDocument();
    });

    it("displays help text", () => {
      // Arrange & Act
      render(<Input label="Email" helpText="We'll never share your email" />);

      // Assert
      expect(
        screen.getByText("We'll never share your email"),
      ).toBeInTheDocument();
    });

    it("prioritizes error over success message", () => {
      // Arrange & Act
      render(
        <Input label="Test" error="Error message" success="Success message" />,
      );

      // Assert
      expect(screen.getByText("Error message")).toBeInTheDocument();
      expect(screen.queryByText("Success message")).not.toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("renders left icon", () => {
      // Arrange & Act
      render(<Input leftIcon={<TestIcon />} />);

      // Assert
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("renders right icon", () => {
      // Arrange & Act
      render(<Input rightIcon={<TestIcon />} />);

      // Assert
      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("applies correct padding when left icon is present", () => {
      // Arrange & Act
      render(<Input leftIcon={<TestIcon />} data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveClass("pl-10");
    });

    it("applies correct padding when right icon is present", () => {
      // Arrange & Act
      render(<Input rightIcon={<TestIcon />} data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveClass("pr-10");
    });
  });

  describe("Accessibility", () => {
    it("sets aria-invalid to false by default", () => {
      // Arrange & Act
      render(<Input data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveAttribute(
        "aria-invalid",
        "false",
      );
    });

    it("sets aria-invalid to true when error is present", () => {
      // Arrange & Act
      render(<Input error="Error message" data-testid="input" />);

      // Assert
      expect(screen.getByTestId("input")).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    });

    it("links input to error message with aria-describedby", () => {
      // Arrange & Act
      render(<Input label="Test" error="Error message" />);
      const input = screen.getByLabelText("Test");

      // Assert
      expect(input).toHaveAttribute(
        "aria-describedby",
        expect.stringContaining("error"),
      );
    });
  });

  describe("Disabled state", () => {
    it("applies disabled styling and behavior", () => {
      // Arrange & Act
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId("input");

      // Assert
      expect(input).toBeDisabled();
      expect(input).toHaveClass("disabled:cursor-not-allowed");
    });
  });

  // Snapshot test
  it("matches snapshot", () => {
    // Arrange & Act
    const { container } = render(
      <Input
        label="Test Input"
        placeholder="Enter text"
        helpText="This is help text"
      />,
    );

    // Assert
    expect(container.firstChild).toMatchSnapshot();
  });
});
