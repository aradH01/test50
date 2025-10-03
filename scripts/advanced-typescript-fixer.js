#!/usr/bin/env node

/**
 * Advanced TypeScript Auto-Fixer
 *
 * This script provides more sophisticated TypeScript error fixing capabilities
 * than the basic inline script in the GitHub Actions workflow.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class TypeScriptAutoFixer {
  constructor() {
    this.fixedFiles = new Set();
    this.errors = [];
  }

  log(message, type = "info") {
    const icons = { info: "📝", success: "✅", error: "❌", warning: "⚠️" };
    console.log(`${icons[type]} ${message}`);
  }

  runTypeScript() {
    try {
      execSync("npx tsc --noEmit --pretty false", { stdio: "pipe" });
      return null; // No errors
    } catch (error) {
      return error.stdout?.toString() || error.stderr?.toString() || "";
    }
  }

  parseTypeScriptErrors(output) {
    const lines = output.split("\n").filter((line) => line.trim());
    const errors = [];

    for (const line of lines) {
      const match = line.match(
        /(.+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)/,
      );
      if (match) {
        const [, file, lineNum, colNum, errorCode, message] = match;
        errors.push({
          file,
          line: parseInt(lineNum),
          column: parseInt(colNum),
          code: errorCode,
          message,
          fullLine: line,
        });
      }
    }

    return errors;
  }

  fixMissingImports(errors) {
    const importFixes = new Map();

    for (const error of errors) {
      // Missing React import
      if (
        error.code === "TS2686" &&
        error.message.includes("'React' refers to a UMD global")
      ) {
        if (!importFixes.has(error.file)) {
          importFixes.set(error.file, new Set());
        }
        importFixes.get(error.file).add("import React from 'react';");
      }

      // Common missing imports
      if (
        error.code === "TS2304" &&
        error.message.includes("Cannot find name")
      ) {
        const nameMatch = error.message.match(/Cannot find name '(\w+)'/);
        if (nameMatch) {
          const varName = nameMatch[1];
          const suggestions = this.getSuggestedImports(varName);
          if (suggestions.length > 0) {
            if (!importFixes.has(error.file)) {
              importFixes.set(error.file, new Set());
            }
            importFixes.get(error.file).add(suggestions[0]);
          }
        }
      }
    }

    // Apply import fixes
    for (const [filePath, imports] of importFixes) {
      try {
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");
        const importLines = Array.from(imports);

        // Find where to insert imports (after existing imports or at top)
        let insertIndex = 0;
        for (let i = 0; i < lines.length; i++) {
          if (
            lines[i].startsWith("import ") ||
            lines[i].startsWith("import ")
          ) {
            insertIndex = i + 1;
          } else if (lines[i].trim() === "" && insertIndex > 0) {
            continue; // Skip empty lines after imports
          } else if (insertIndex > 0) {
            break;
          }
        }

        // Add missing imports
        for (const importLine of importLines) {
          if (!content.includes(importLine.replace(/;$/, ""))) {
            lines.splice(insertIndex, 0, importLine);
            insertIndex++;
            this.log(`Added import to ${filePath}: ${importLine}`, "success");
          }
        }

        fs.writeFileSync(filePath, lines.join("\n"));
        this.fixedFiles.add(filePath);
      } catch (e) {
        this.log(`Failed to fix imports in ${filePath}: ${e.message}`, "error");
      }
    }
  }

  getSuggestedImports(varName) {
    const commonImports = {
      React: "import React from 'react';",
      useState: "import { useState } from 'react';",
      useEffect: "import { useEffect } from 'react';",
      useCallback: "import { useCallback } from 'react';",
      useMemo: "import { useMemo } from 'react';",
      useRef: "import { useRef } from 'react';",
      FC: "import type { FC } from 'react';",
      ReactNode: "import type { ReactNode } from 'react';",
      Component: "import { Component } from 'react';",
      cn: "import { cn } from '@/lib/utils';",
      clsx: "import clsx from 'clsx';",
      cva: "import { cva } from 'class-variance-authority';",
    };

    return commonImports[varName] ? [commonImports[varName]] : [];
  }

  fixTypeAnnotations(errors) {
    for (const error of errors) {
      if (
        error.code === "TS7006" &&
        error.message.includes("implicitly has an 'any' type")
      ) {
        // This is complex and would require AST parsing for proper fixes
        this.log(
          `Manual review needed for type annotation in ${error.file}:${error.line}`,
          "warning",
        );
      }
    }
  }

  fixUnusedVariables(errors) {
    const filesToFix = new Map();

    for (const error of errors) {
      if (
        error.code === "TS6133" &&
        error.message.includes("is declared but never used")
      ) {
        const match = error.message.match(/'(\w+)' is declared but never used/);
        if (match) {
          const varName = match[1];
          if (!filesToFix.has(error.file)) {
            filesToFix.set(error.file, []);
          }
          filesToFix.get(error.file).push({ varName, line: error.line });
        }
      }
    }

    for (const [filePath, unused] of filesToFix) {
      try {
        if (!fs.existsSync(filePath)) continue;

        let content = fs.readFileSync(filePath, "utf8");
        let lines = content.split("\n");

        for (const { varName, line } of unused) {
          const lineIndex = line - 1;
          if (lineIndex >= 0 && lineIndex < lines.length) {
            // Add underscore prefix to indicate intentionally unused
            lines[lineIndex] = lines[lineIndex].replace(
              new RegExp(`\\b${varName}\\b`),
              `_${varName}`,
            );
          }
        }

        fs.writeFileSync(filePath, lines.join("\n"));
        this.fixedFiles.add(filePath);
        this.log(`Fixed unused variables in ${filePath}`, "success");
      } catch (e) {
        this.log(
          `Failed to fix unused variables in ${filePath}: ${e.message}`,
          "error",
        );
      }
    }
  }

  async run() {
    this.log("🔍 Running advanced TypeScript auto-fixer...");

    const output = this.runTypeScript();
    if (!output) {
      this.log("No TypeScript errors found!", "success");
      return;
    }

    this.log("Parsing TypeScript errors...");
    const errors = this.parseTypeScriptErrors(output);
    this.log(`Found ${errors.length} TypeScript errors`);

    // Apply fixes
    this.log("Fixing missing imports...");
    this.fixMissingImports(errors);

    this.log("Fixing unused variables...");
    this.fixUnusedVariables(errors);

    this.log("Checking type annotations...");
    this.fixTypeAnnotations(errors);

    // Run TypeScript again to see results
    this.log("Verifying fixes...");
    const finalOutput = this.runTypeScript();

    if (!finalOutput) {
      this.log("🎉 All TypeScript errors fixed!", "success");
    } else {
      const remainingErrors = this.parseTypeScriptErrors(finalOutput);
      this.log(
        `⚠️ ${remainingErrors.length} TypeScript errors remain (may require manual review)`,
        "warning",
      );

      // Log remaining errors for manual review
      console.log("\nRemaining errors:");
      for (const error of remainingErrors.slice(0, 10)) {
        // Show first 10
        console.log(`  ${error.file}:${error.line} - ${error.message}`);
      }
    }

    this.log(`Fixed files: ${this.fixedFiles.size}`, "info");
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new TypeScriptAutoFixer();
  fixer.run().catch(console.error);
}

module.exports = TypeScriptAutoFixer;
