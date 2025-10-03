/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  // Arrange, Act, Assert pattern

  describe("Basic functionality", () => {
    it("renders button with text", () => {
      // Arrange & Act
      render(<Button>Click me</Button>);

      // Assert
      expect(
        screen.getByRole("button", { name: "Click me" }),
      ).toBeInTheDocument();
    });

    it("handles click events", async () => {
      // Arrange
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click me</Button>);

      // Act
      await user.click(screen.getByRole("button"));

      // Assert
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("accepts custom className", () => {
      // Arrange & Act
      render(<Button className="custom-class">Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });
  });

  describe("Variants", () => {
    it("applies default variant classes", () => {
      // Arrange & Act
      render(<Button>Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("bg-blue-600");
    });

    it("applies destructive variant classes", () => {
      // Arrange & Act
      render(<Button variant="destructive">Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("bg-red-600");
    });

    it("applies outline variant classes", () => {
      // Arrange & Act
      render(<Button variant="outline">Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("border-gray-300");
    });

    it("applies secondary variant classes", () => {
      // Arrange & Act
      render(<Button variant="secondary">Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("bg-gray-600");
    });

    it("applies ghost variant classes", () => {
      // Arrange & Act
      render(<Button variant="ghost">Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("text-gray-700");
    });

    it("applies link variant classes", () => {
      // Arrange & Act
      render(<Button variant="link">Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("text-blue-600");
    });
  });

  describe("Sizes", () => {
    it("applies default size classes", () => {
      // Arrange & Act
      render(<Button>Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("h-10");
    });

    it("applies small size classes", () => {
      // Arrange & Act
      render(<Button size="sm">Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("h-9");
    });

    it("applies large size classes", () => {
      // Arrange & Act
      render(<Button size="lg">Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("h-11");
    });

    it("applies icon size classes", () => {
      // Arrange & Act
      render(<Button size="icon">🚀</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("h-10", "w-10");
    });
  });

  describe("Loading state", () => {
    it("disables button when loading", () => {
      // Arrange & Act
      render(<Button loading>Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("shows loading spinner when loading", () => {
      // Arrange & Act
      render(<Button loading>Button</Button>);

      // Assert
      expect(
        screen.getByRole("button").querySelector("svg"),
      ).toBeInTheDocument();
    });

    it("prevents click when loading", async () => {
      // Arrange
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(
        <Button loading onClick={handleClick}>
          Button
        </Button>,
      );

      // Act
      await user.click(screen.getByRole("button"));

      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Disabled state", () => {
    it("disables button when disabled prop is true", () => {
      // Arrange & Act
      render(<Button disabled>Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("prevents click when disabled", async () => {
      // Arrange
      const handleClick = jest.fn();
      const user = userEvent.setup();
      render(
        <Button disabled onClick={handleClick}>
          Button
        </Button>,
      );

      // Act
      await user.click(screen.getByRole("button"));

      // Assert
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("applies disabled styling", () => {
      // Arrange & Act
      render(<Button disabled>Button</Button>);

      // Assert
      expect(screen.getByRole("button")).toHaveClass("disabled:opacity-50");
    });
  });

  describe("HTML attributes", () => {
    it("forwards HTML button attributes", () => {
      // Arrange & Act
      render(
        <Button type="submit" form="test-form" data-testid="test-button">
          Submit
        </Button>,
      );

      // Assert
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("form", "test-form");
      expect(button).toHaveAttribute("data-testid", "test-button");
    });
  });

  // Snapshot test
  it("matches snapshot", () => {
    // Arrange & Act
    const { container } = render(<Button>Test Button</Button>);

    // Assert
    expect(container.firstChild).toMatchSnapshot();
  });

  it("matches loading state snapshot", () => {
    // Arrange & Act
    const { container } = render(<Button loading>Loading Button</Button>);

    // Assert
    expect(container.firstChild).toMatchSnapshot();
  });
});
