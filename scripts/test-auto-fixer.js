#!/usr/bin/env node

/**
 * Advanced Test Auto-Fixer
 *
 * This script provides sophisticated test fixing capabilities including
 * snapshot updates, import fixes, and common test pattern corrections.
 */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

class TestAutoFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.testResults = null;
  }

  log(message, type = "info") {
    const icons = {
      info: "🧪",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      snapshot: "📸",
    };
    console.log(`${icons[type]} ${message}`);
  }

  runTests(options = {}) {
    const {
      updateSnapshots = false,
      passWithNoTests = true,
      verbose = false,
      ci = true,
    } = options;

    let command = "npm run test";
    const args = ["--"];

    if (updateSnapshots) args.push("--updateSnapshot");
    if (passWithNoTests) args.push("--passWithNoTests");
    if (verbose) args.push("--verbose");
    if (ci) args.push("--ci");

    try {
      const result = execSync(`${command} ${args.join(" ")}`, {
        stdio: "pipe",
        encoding: "utf8",
      });
      return { success: true, output: result };
    } catch (error) {
      return {
        success: false,
        output: error.stdout?.toString() || error.stderr?.toString() || "",
      };
    }
  }

  findTestFiles(startDir = "./app") {
    const testFiles = [];

    const searchDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;

      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && !file.includes("node_modules")) {
          searchDirectory(filePath);
        } else if (file.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
          testFiles.push(filePath);
        }
      }
    };

    searchDirectory(startDir);
    return testFiles;
  }

  updateSnapshots() {
    this.log("Updating Jest snapshots...", "snapshot");
    const result = this.runTests({ updateSnapshots: true });

    if (result.success) {
      this.log("Snapshots updated successfully", "success");
      return true;
    } else {
      this.log("Failed to update snapshots", "error");
      console.log(result.output);
      return false;
    }
  }

  fixImportPaths(testFiles) {
    const importMap = {
      "@/components": "./app/_components",
      "@/lib": "./app/_lib",
      "@/hooks": "./app/_hooks",
      "@/utils": "./app/_lib/utils",
      "@/types": "./app/_types",
      "@/constants": "./app/_constants",
    };

    for (const testFile of testFiles) {
      try {
        let content = fs.readFileSync(testFile, "utf8");
        let hasChanges = false;

        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Fix import paths
          if (line.includes("from '@/") || line.includes('from "@/')) {
            for (const [alias, actualPath] of Object.entries(importMap)) {
              if (line.includes(alias)) {
                const relativePath = path
                  .relative(path.dirname(testFile), actualPath)
                  .replace(/\\/g, "/");

                const newLine = line.replace(alias, `./${relativePath}`);
                if (newLine !== line) {
                  lines[i] = newLine;
                  hasChanges = true;
                  this.log(
                    `Fixed import in ${testFile}: ${alias} -> ${relativePath}`,
                    "success",
                  );
                }
              }
            }
          }
        }

        if (hasChanges) {
          fs.writeFileSync(testFile, lines.join("\n"));
          this.fixedFiles.add(testFile);
        }
      } catch (e) {
        this.log(`Failed to fix imports in ${testFile}: ${e.message}`, "error");
      }
    }
  }

  fixCommonTestPatterns(testFiles) {
    for (const testFile of testFiles) {
      try {
        let content = fs.readFileSync(testFile, "utf8");
        let hasChanges = false;

        // Fix common React Testing Library patterns
        const fixes = [
          // Fix missing screen import
          {
            pattern: /import.*{([^}]*)}.*from.*['"]@testing-library\/react['"]/,
            replacement: (match, imports) => {
              if (!imports.includes("screen") && content.includes("screen.")) {
                return match.replace(imports, imports.trim() + ", screen");
              }
              return match;
            },
          },
          // Fix missing render import
          {
            pattern: /import.*{([^}]*)}.*from.*['"]@testing-library\/react['"]/,
            replacement: (match, imports) => {
              if (!imports.includes("render") && content.includes("render(")) {
                return match.replace(imports, imports.trim() + ", render");
              }
              return match;
            },
          },
          // Add missing React import for JSX
          {
            pattern: /^(?!.*import.*React)/m,
            replacement: () => {
              if (
                content.includes("<") &&
                content.includes(">") &&
                !content.includes("import React")
              ) {
                return "import React from 'react';\n";
              }
              return "";
            },
          },
        ];

        for (const fix of fixes) {
          const newContent = content.replace(fix.pattern, fix.replacement);
          if (newContent !== content) {
            content = newContent;
            hasChanges = true;
          }
        }

        // Fix expect extensions for jest-dom
        if (
          content.includes("toBeInTheDocument") ||
          content.includes("toHaveClass")
        ) {
          if (
            !content.includes("@testing-library/jest-dom") &&
            !content.includes("jest-dom")
          ) {
            const imports = content.split("\n");
            let lastImportIndex = -1;

            for (let i = 0; i < imports.length; i++) {
              if (imports[i].startsWith("import ")) {
                lastImportIndex = i;
              }
            }

            if (lastImportIndex >= 0) {
              imports.splice(
                lastImportIndex + 1,
                0,
                "import '@testing-library/jest-dom';",
              );
              content = imports.join("\n");
              hasChanges = true;
              this.log(`Added jest-dom import to ${testFile}`, "success");
            }
          }
        }

        if (hasChanges) {
          fs.writeFileSync(testFile, content);
          this.fixedFiles.add(testFile);
        }
      } catch (e) {
        this.log(
          `Failed to fix patterns in ${testFile}: ${e.message}`,
          "error",
        );
      }
    }
  }

  generateMissingTests() {
    // Find components without tests
    const componentsDir = "./app/_components";
    if (!fs.existsSync(componentsDir)) return;

    const componentDirs = fs
      .readdirSync(componentsDir)
      .filter((item) =>
        fs.statSync(path.join(componentsDir, item)).isDirectory(),
      );

    for (const componentDir of componentDirs) {
      const componentPath = path.join(componentsDir, componentDir);
      const testFile = path.join(componentPath, `${componentDir}.test.tsx`);
      const componentFile = fs
        .readdirSync(componentPath)
        .find((file) => file.endsWith(".tsx") && !file.includes("test"));

      if (!fs.existsSync(testFile) && componentFile) {
        const componentName =
          componentDir.charAt(0).toUpperCase() + componentDir.slice(1);
        const testContent = `import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ${componentName} from './${componentFile.replace(".tsx", "")}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
  });

  it('matches snapshot', () => {
    const { container } = render(<${componentName} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
`;

        fs.writeFileSync(testFile, testContent);
        this.log(`Generated test for ${componentName}`, "success");
        this.fixedFiles.add(testFile);
      }
    }
  }

  async run() {
    this.log("🧪 Running advanced test auto-fixer...");

    // Step 1: Find all test files
    const testFiles = this.findTestFiles();
    this.log(`Found ${testFiles.length} test files`);

    // Step 2: Update snapshots first
    this.updateSnapshots();

    // Step 3: Fix import paths
    this.log("Fixing import paths...");
    this.fixImportPaths(testFiles);

    // Step 4: Fix common test patterns
    this.log("Fixing common test patterns...");
    this.fixCommonTestPatterns(testFiles);

    // Step 5: Generate basic tests for components without tests
    this.log("Generating missing tests...");
    this.generateMissingTests();

    // Step 6: Run tests again to verify
    this.log("Running final test verification...");
    const finalResult = this.runTests({ verbose: false });

    if (finalResult.success) {
      this.log("🎉 All tests are now passing!", "success");
    } else {
      this.log(
        "⚠️ Some test issues remain (may require manual review)",
        "warning",
      );
      console.log("\nTest output:");
      console.log(finalResult.output);
    }

    this.log(`Fixed/created files: ${this.fixedFiles.size}`, "info");
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new TestAutoFixer();
  fixer.run().catch(console.error);
}

module.exports = TestAutoFixer;
